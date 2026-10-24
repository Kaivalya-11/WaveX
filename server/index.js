const path = require('path');
const fs = require('fs');

// Ensure environment variables are loaded regardless of current working directory
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./config/db');
const YTMusic = require('ytmusic-api');
const { execFile } = require('child_process');
const { request: undiciRequest } = require('undici');

// Video ID validation: exactly 11 valid base64url characters
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

// Strict extraction deadlines to prevent 504 Gateway Timeouts
const TOTAL_EXTRACTION_TIMEOUT_MS = 12000; // 12 seconds max total extraction budget
const SINGLE_EXECUTION_TIMEOUT_MS = 5000;  // 5 seconds max per yt-dlp attempt

// Rate-limiting / IP throttling circuit breaker state
let upstreamRateLimitUntil = 0;

/**
 * Check if an error indicates YouTube 429 rate-limiting or bot detection challenges.
 */
function isRateLimitError(message) {
  if (!message) return false;
  const msg = String(message).toLowerCase();
  return msg.includes('429') ||
         msg.includes('too many requests') ||
         msg.includes('confirm you\'re not a bot') ||
         msg.includes('sign in to confirm') ||
         msg.includes('bot detection') ||
         msg.includes('rate limit');
}

/**
 * Check if an error indicates the video is private, removed, or geo-restricted.
 */
function isUnavailableError(message) {
  if (!message) return false;
  const msg = String(message).toLowerCase();
  return msg.includes('video unavailable') ||
         msg.includes('private video') ||
         msg.includes('this video is unavailable') ||
         msg.includes('has been removed') ||
         msg.includes('copyright');
}

/**
 * Sanitize diagnostic text for logging:
 * - Redacts tokens, signatures, secrets, and auth credentials.
 * - Truncates excessively long output.
 */
function sanitizeDiagnosticText(text) {
  if (!text) return '';
  return String(text)
    .replace(/(token|sig|signature|key|auth|password|secret)=[^&\s]+/gi, '$1=[REDACTED]')
    .replace(/https?:\/\/[^\s"'<>]+/g, (match) => {
      try {
        const u = new URL(match);
        return `${u.protocol}//${u.host}${u.pathname}[URL_PARAMS_REDACTED]`;
      } catch {
        return '[URL_REDACTED]';
      }
    })
    .trim()
    .substring(0, 1000);
}

/**
 * Resolve the yt-dlp binary path with cross-platform awareness:
 * - Windows: searches local appdata Python directories and system PATH.
 * - Linux (Render): rejects invalid Windows paths, checks standard Linux directories and PATH.
 */
function resolveYtDlp() {
  const isWindows = process.platform === 'win32';
  const customPath = process.env.YTDLP_PATH ? process.env.YTDLP_PATH.trim() : '';

  if (customPath) {
    if (!isWindows && (/^[a-zA-Z]:[\\/]/.test(customPath) || customPath.includes('\\'))) {
      console.warn(`[Stream Diagnostic] Ignoring Windows-specific YTDLP_PATH ("${customPath}") on ${process.platform} runtime.`);
    } else if (fs.existsSync(customPath)) {
      return customPath;
    } else if (!customPath.includes('/') && !customPath.includes('\\')) {
      // Named binary intended for system PATH lookup
      return customPath;
    }
  }

  const candidatePaths = isWindows
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.APPDATA || '', 'Python', 'Scripts', 'yt-dlp.exe'),
        path.join(__dirname, 'node_modules', '.bin', 'yt-dlp.exe'),
        path.join(__dirname, '..', 'node_modules', '.bin', 'yt-dlp.exe'),
      ]
    : [
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
        '/opt/render/.local/bin/yt-dlp',
        path.join(process.env.HOME || '', '.local', 'bin', 'yt-dlp'),
        path.join(__dirname, 'node_modules', '.bin', 'yt-dlp'),
        path.join(__dirname, '..', 'node_modules', '.bin', 'yt-dlp'),
      ];

  for (const candidate of candidatePaths) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Default to PATH lookup
  return 'yt-dlp';
}

const YTDLP_PATH = resolveYtDlp();

/**
 * Startup diagnostic check:
 * Safely tests whether the configured yt-dlp binary is executable and logs its version.
 * If missing or failing, logs clear actionable guidance without crashing the server.
 */
function runStartupDiagnostic(binaryPath) {
  console.log(`[Stream Diagnostic] OS: ${process.platform} (${process.arch}) | Node: ${process.version}`);
  console.log(`[Stream Diagnostic] Configured yt-dlp binary path: ${binaryPath}`);

  execFile(binaryPath, ['--version'], { timeout: 8000 }, (err, stdout, stderr) => {
    if (err) {
      console.warn(`[Stream Diagnostic] [WARNING] yt-dlp executable check failed for "${binaryPath}":`);
      console.warn(`  - Error Code: ${err.code || 'UNKNOWN'}`);
      console.warn(`  - Error Message: ${err.message}`);
      if (stderr) console.warn(`  - Stderr: ${sanitizeDiagnosticText(stderr)}`);
      console.warn(`[Stream Diagnostic] Actionable Guidance:`);
      console.warn(`  - On Render: Set Build Command to: "pip install --upgrade yt-dlp yt-dlp-ejs && npm install" and set YTDLP_PATH="yt-dlp"`);
      console.warn(`  - Fallback extraction strategies are active.`);
    } else {
      console.log(`[Stream Diagnostic] SUCCESS: yt-dlp is available and executable. Version: ${stdout.trim()}`);
    }
  });
}

runStartupDiagnostic(YTDLP_PATH);

// In-memory Cache: videoId -> { url, expires }
const streamUrlCache = new Map();

// In-flight extraction deduplication: videoId -> Promise<string>
// Prevents duplicate concurrent requests for the same track from triggering parallel extraction storms
const inFlightExtractions = new Map();

/**
 * Low-level yt-dlp runner that returns captured output and structured diagnostic details on error.
 */
function executeYtDlp(executable, args, timeoutMs = SINGLE_EXECUTION_TIMEOUT_MS) {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { timeout: timeoutMs, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      const rawStdout = (stdout || '').trim();
      const rawStderr = (stderr || '').trim();

      if (err) {
        const isTimeout = Boolean(err.killed && (err.signal === 'SIGTERM' || err.code === 'ETIMEDOUT'));
        const diagnostic = {
          executable,
          code: err.code !== undefined ? err.code : 'UNKNOWN',
          signal: err.signal || null,
          timedOut: isTimeout,
          rawMessage: err.message || '',
          sanitizedMessage: sanitizeDiagnosticText(err.message || ''),
          sanitizedStderr: sanitizeDiagnosticText(rawStderr),
          sanitizedStdout: sanitizeDiagnosticText(rawStdout.substring(0, 500)),
        };
        return reject(diagnostic);
      }

      resolve({
        stdout: rawStdout,
        stderr: rawStderr,
      });
    });
  });
}

/**
 * Core internal extraction worker with strict deadline and deduplication.
 */
async function extractStreamUrlInternal(videoId) {
  const startTime = Date.now();
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Check rate limit circuit-breaker
  if (upstreamRateLimitUntil > Date.now()) {
    const remainingSec = Math.ceil((upstreamRateLimitUntil - Date.now()) / 1000);
    const rateLimitErr = new Error(`YouTube rate-limiting active on backend. Cooldown in progress (${remainingSec}s remaining).`);
    rateLimitErr.status = 429;
    throw rateLimitErr;
  }

  // Tiers to execute within time budget.
  // Note: We avoid forcing restrictive client combinations like "player_client=mweb,web" which break
  // when YouTube alters web formats. We allow yt-dlp's default client hierarchy to find valid streams.
  const tiers = [
    {
      name: 'yt-dlp Tier 1 (Standard with Node runtime)',
      args: [
        '--no-warnings',
        '--no-playlist',
        '-f', 'bestaudio[ext=m4a]/bestaudio/best',
        '--get-url',
        '--js-runtimes', 'node',
        ytUrl,
      ],
    },
    {
      name: 'yt-dlp Tier 2 (Universal minimal)',
      args: [
        '--no-warnings',
        '--no-playlist',
        '-f', 'bestaudio/best',
        '--get-url',
        ytUrl,
      ],
    },
  ];

  let lastDiag = null;

  for (const tier of tiers) {
    const elapsed = Date.now() - startTime;
    if (elapsed >= TOTAL_EXTRACTION_TIMEOUT_MS - 3000) {
      console.warn(`[Stream] Approaching total extraction deadline (${elapsed}ms). Skipping ${tier.name}.`);
      break;
    }

    try {
      console.log(`[Stream] Executing ${tier.name} for ${videoId}`);
      const remainingTime = Math.max(3000, TOTAL_EXTRACTION_TIMEOUT_MS - (Date.now() - startTime));
      const attemptTimeout = Math.min(SINGLE_EXECUTION_TIMEOUT_MS, remainingTime);

      const result = await executeYtDlp(YTDLP_PATH, tier.args, attemptTimeout);
      const lines = result.stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const url = lines.find(l => l.startsWith('http://') || l.startsWith('https://'));
      if (url) {
        console.log(`[Stream] Success with ${tier.name} for ${videoId}`);
        streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
        return url;
      }
    } catch (diag) {
      lastDiag = diag;
      const combinedErrMsg = `${diag.sanitizedMessage} ${diag.sanitizedStderr}`;

      // Check for rate limit / bot detection: TRIP CIRCUIT BREAKER & STOP
      if (isRateLimitError(combinedErrMsg)) {
        upstreamRateLimitUntil = Date.now() + 60000;
        console.error(`[Stream CircuitBreaker] YouTube rate-limiting / bot-check detected during ${tier.name}. Tripping circuit breaker for 60s.`);
        const err = new Error('YouTube rate-limit reached (HTTP 429). Upstream datacenter IP throttled.');
        err.status = 429;
        throw err;
      }

      // Check for unavailable / copyright / private video: STOP
      if (isUnavailableError(combinedErrMsg)) {
        console.warn(`[Stream] Video ${videoId} is confirmed unavailable on YouTube.`);
        const err = new Error(`Video ${videoId} is unavailable on YouTube.`);
        err.status = 404;
        throw err;
      }

      console.warn(`[Stream Diagnostic] ${tier.name} failed for ${videoId}:`);
      console.warn(`  - Exit Code: ${diag.code} | Signal: ${diag.signal || 'none'} | TimedOut: ${diag.timedOut}`);
      if (diag.sanitizedStderr) {
        console.warn(`  - Stderr: ${diag.sanitizedStderr}`);
      }
    }
  }

  // Tier 3: Pure Node.js fallback via play-dl
  // ONLY attempted if:
  // 1. We are NOT rate-limited.
  // 2. The previous errors were NOT rate-limits or unavailable videos.
  // 3. We still have budget within the total extraction timeout.
  const elapsedBeforeNode = Date.now() - startTime;
  if (upstreamRateLimitUntil <= Date.now() && elapsedBeforeNode < TOTAL_EXTRACTION_TIMEOUT_MS - 3500) {
    try {
      console.log(`[Stream] Attempting Tier 3 Node fallback (play-dl) for ${videoId}`);
      const playdl = require('play-dl');

      const playPromise = playdl.video_info(ytUrl);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('play-dl extraction timeout')), 3500)
      );

      const info = await Promise.race([playPromise, timeoutPromise]);
      const formats = info.format || [];
      const audioFmt = formats.find(f => f.mimeType && f.mimeType.startsWith('audio/mp4')) ||
                       formats.find(f => f.mimeType && f.mimeType.startsWith('audio/')) ||
                       formats.find(f => f.url && f.audio_channels);

      if (audioFmt && audioFmt.url) {
        console.log(`[Stream] Tier 3 (play-dl) successful for ${videoId}`);
        streamUrlCache.set(videoId, { url: audioFmt.url, expires: Date.now() + 90 * 60 * 1000 });
        return audioFmt.url;
      }
    } catch (nodeErr) {
      if (isRateLimitError(nodeErr.message)) {
        upstreamRateLimitUntil = Date.now() + 60000;
        console.error(`[Stream CircuitBreaker] play-dl reported 429. Tripping circuit breaker for 60s.`);
        const err = new Error('YouTube rate-limit reached (HTTP 429).');
        err.status = 429;
        throw err;
      }
      console.warn(`[Stream Diagnostic] Tier 3 play-dl fallback failed: ${sanitizeDiagnosticText(nodeErr.message)}`);
    }
  }

  const finalError = new Error(
    `Failed to extract audio stream for ${videoId}. ${
      lastDiag && lastDiag.sanitizedStderr ? lastDiag.sanitizedStderr : (lastDiag?.sanitizedMessage || 'All extraction tiers exhausted.')
    }`
  );
  finalError.status = 502;
  finalError.diagnostic = lastDiag;
  throw finalError;
}

/**
 * Public getStreamUrl with cache check and singleflight request deduplication.
 */
function getStreamUrl(videoId) {
  if (!VIDEO_ID_REGEX.test(videoId)) {
    const badIdErr = new Error(`Invalid YouTube video ID format: ${videoId}`);
    badIdErr.status = 400;
    return Promise.reject(badIdErr);
  }

  // 1. Check in-memory URL cache (TTL 90m)
  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.url);
  }

  // 2. Check in-flight extraction promise (Singleflight deduplication)
  if (inFlightExtractions.has(videoId)) {
    console.log(`[Stream Singleflight] Deduplicating request for ${videoId}`);
    return inFlightExtractions.get(videoId);
  }

  // 3. Initiate single extraction and cache the promise while running
  const extractionPromise = extractStreamUrlInternal(videoId).finally(() => {
    inFlightExtractions.delete(videoId);
  });

  inFlightExtractions.set(videoId, extractionPromise);
  return extractionPromise;
}

function getStreamUrl(videoId) {
  if (!VIDEO_ID_REGEX.test(videoId)) {
    const badIdErr = new Error(`Invalid YouTube video ID format: ${videoId}`);
    badIdErr.status = 400;
    return Promise.reject(badIdErr);
  }

  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.url);
  }

  if (inFlightExtractions.has(videoId)) {
    console.log(`[Stream Singleflight] Deduplicating request for ${videoId}`);
    return inFlightExtractions.get(videoId);
  }

  const extractionPromise = extractStreamUrlInternal(videoId).finally(() => {
    inFlightExtractions.delete(videoId);
  });

  inFlightExtractions.set(videoId, extractionPromise);
  return extractionPromise;
}

process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Rejection at:', promise, 'reason:', sanitizeDiagnosticText(reason));
});
process.on('uncaughtException', (err) => {
  console.error('[Process Error] Uncaught Exception:', sanitizeDiagnosticText(err.message));
});

const PORT = process.env.PORT || 5000;
const API_BASE_URL = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

const app = express();
app.use(cors());
app.use(express.json());

const usersRoutes = require('./routes/users');
const likesRoutes = require('./routes/likes');
const playlistsRoutes = require('./routes/playlists');
const historyRoutes = require('./routes/history');
const downloadsRoutes = require('./routes/downloads');

app.use('/api/users', usersRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/downloads', downloadsRoutes);

const ytmusic = new YTMusic();
let initialized = false;
ytmusic.initialize().then(() => initialized = true).catch(console.error);

const handleUpstreamError = (res, err, endpoint) => {
  if (res.headersSent) {
    return;
  }
  const errMsg = err.message || err.toString();
  let status = err.status || 500;

  if (isRateLimitError(errMsg)) {
    status = 429;
  } else if (isUnavailableError(errMsg)) {
    status = 404;
  } else if (errMsg.includes('403') || errMsg.includes('Forbidden')) {
    status = 403;
  } else if (errMsg.includes('timeout') || errMsg.includes('ECONNRESET') || errMsg.includes('ETIMEDOUT') || errMsg.includes('504')) {
    status = 504;
  } else if (errMsg.includes('400') || errMsg.includes('Invalid')) {
    status = 400;
  }

  console.error(`[Upstream Error] ${new Date().toISOString()} | Endpoint: ${endpoint} | Status: ${status} | Error: ${sanitizeDiagnosticText(errMsg)}`);

  res.status(status).json({
    error: status === 429
      ? "YouTube rate-limited or requires verification. Datacenter IP throttled."
      : status === 404
      ? "Audio track is unavailable or removed."
      : status === 504
      ? "Streaming upstream timed out."
      : "Streaming service error",
    status,
    message: sanitizeDiagnosticText(errMsg)
  });
};

app.get('/', (req, res) => res.send('Soundify Backend Running!'));

app.get('/api/health', (req, res) => {
  const db = getDB();
  res.json({
    status: db ? "ok" : "degraded",
    service: "wavex-api",
    database: db ? "connected" : "disconnected",
    uptime: process.uptime(),
    rateLimited: upstreamRateLimitUntil > Date.now(),
  });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Missing query parameter" });

  if (!initialized) {
    await ytmusic.initialize();
    initialized = true;
  }

  try {
    const results = await ytmusic.searchSongs(query);

    const getHighResCover = (thumbnails, videoId) => {
      if (!thumbnails || thumbnails.length === 0) {
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600';
      }
      let url = thumbnails[thumbnails.length - 1].url;
      if (url.includes('i.ytimg.com')) {
        url = url.replace('mqdefault.jpg', 'hqdefault.jpg').replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
      return url;
    };

    const tracks = results.map(v => {
      let artistName = "Unknown Artist";
      if (typeof v.artist === 'string') artistName = v.artist;
      else if (v.artist && typeof v.artist.name === 'string') artistName = v.artist.name;
      else if (Array.isArray(v.artists)) artistName = v.artists.map(a => a.name).join(", ");
      else if (v.author) artistName = typeof v.author === 'string' ? v.author : v.author.name;

      return {
        id: v.videoId,
        title: v.name || v.title || "Unknown Title",
        artist: artistName || "Unknown Artist",
        album: v.album ? (typeof v.album === 'string' ? v.album : v.album.name) : "YouTube Release",
        genre: "Music",
        duration: v.duration || 0,
        cover: getHighResCover(v.thumbnails, v.videoId),
        src: `${API_BASE_URL}/api/stream?videoId=${v.videoId}`,
      };
    });

    res.json(tracks);
  } catch (err) {
    handleUpstreamError(res, err, '/api/search');
  }
});

app.get('/api/track', async (req, res) => {
  const id = req.query.id;
  if (!id) return res.status(400).json({ error: "Missing id parameter" });

  if (!initialized) {
    await ytmusic.initialize();
    initialized = true;
  }

  try {
    const v = await ytmusic.getSong(id);

    const getHighResCover = (thumbnails, videoId) => {
      if (!thumbnails || thumbnails.length === 0) {
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600';
      }
      let url = thumbnails[thumbnails.length - 1].url;
      if (url.includes('i.ytimg.com')) {
        url = url.replace('mqdefault.jpg', 'hqdefault.jpg').replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
      return url;
    };

    let artistName = "Unknown Artist";
    if (typeof v.artist === 'string') artistName = v.artist;
    else if (v.artist && typeof v.artist.name === 'string') artistName = v.artist.name;
    else if (Array.isArray(v.artists)) artistName = v.artists.map(a => a.name).join(", ");
    else if (v.author) artistName = typeof v.author === 'string' ? v.author : v.author.name;

    const track = {
      id: v.videoId,
      title: v.name || v.title || "Unknown Title",
      artist: artistName || "Unknown Artist",
      album: v.album ? (typeof v.album === 'string' ? v.album : v.album.name) : "YouTube Release",
      genre: "Music",
      duration: v.duration || 0,
      cover: getHighResCover(v.thumbnails, v.videoId),
      src: `${API_BASE_URL}/api/stream?videoId=${v.videoId}`,
    };

    res.json(track);
  } catch (err) {
    handleUpstreamError(res, err, '/api/track');
  }
});

function buildCdnHeaders(req) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Referer': 'https://www.youtube.com/',
    'Origin': 'https://www.youtube.com',
  };
  if (req.headers['range']) {
    headers['Range'] = req.headers['range'];
  }
  if (req.headers['if-range']) {
    headers['If-Range'] = req.headers['if-range'];
  }
  return headers;
}

app.head('/api/stream', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).end();
  }

  try {
    let audioUrl = await getStreamUrl(videoId);
    let upstreamResp = await undiciRequest(audioUrl, {
      method: 'HEAD',
      headers: buildCdnHeaders(req),
    });

    if (upstreamResp.statusCode === 403) {
      streamUrlCache.delete(videoId);
      audioUrl = await getStreamUrl(videoId);
      upstreamResp = await undiciRequest(audioUrl, {
        method: 'HEAD',
        headers: buildCdnHeaders(req),
      });
    }

    if (upstreamResp.body && typeof upstreamResp.body.destroy === 'function') {
      upstreamResp.body.destroy();
    }

    if (upstreamResp.statusCode >= 400) {
      return res.status(upstreamResp.statusCode).end();
    }

    res.setHeader('Content-Type', upstreamResp.headers['content-type'] || 'audio/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    if (upstreamResp.headers['content-length']) {
      res.setHeader('Content-Length', upstreamResp.headers['content-length']);
    }
    if (upstreamResp.headers['content-range']) {
      res.setHeader('Content-Range', upstreamResp.headers['content-range']);
    }
    if (upstreamResp.headers['etag']) {
      res.setHeader('ETag', upstreamResp.headers['etag']);
    }
    if (upstreamResp.headers['last-modified']) {
      res.setHeader('Last-Modified', upstreamResp.headers['last-modified']);
    }
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.status(upstreamResp.statusCode).end();
  } catch (err) {
    if (!res.headersSent) {
      const status = err.status || 500;
      res.status(status).end();
    }
  }
});

app.get('/api/stream', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: 'A valid 11-character videoId is required.' });
  }

  try {
    let audioUrl = await getStreamUrl(videoId);
    let upstreamResp = await undiciRequest(audioUrl, {
      method: 'GET',
      headers: buildCdnHeaders(req),
    });

    if (upstreamResp.statusCode === 403) {
      console.warn(`[Stream] Upstream returned 403 for ${videoId}. Invalidating cache and retrying extraction...`);
      streamUrlCache.delete(videoId);
      audioUrl = await getStreamUrl(videoId);
      upstreamResp = await undiciRequest(audioUrl, {
        method: 'GET',
        headers: buildCdnHeaders(req),
      });
    }

    if (upstreamResp.statusCode >= 400) {
      if (upstreamResp.body && typeof upstreamResp.body.destroy === 'function') {
        upstreamResp.body.destroy();
      }
      return res.status(upstreamResp.statusCode).json({
        error: `Upstream audio provider returned HTTP ${upstreamResp.statusCode}`,
        status: upstreamResp.statusCode,
      });
    }

    const contentType = upstreamResp.headers['content-type'] || 'audio/mp4';
    const contentLength = upstreamResp.headers['content-length'];
    const contentRange = upstreamResp.headers['content-range'];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.status(upstreamResp.statusCode);

    const clientAbortHandler = () => {
      if (upstreamResp.body && typeof upstreamResp.body.destroy === 'function') {
        upstreamResp.body.destroy();
      }
    };
    req.on('close', clientAbortHandler);
    res.on('finish', () => {
      req.off('close', clientAbortHandler);
    });

    upstreamResp.body.on('error', (err) => {
      console.error('[Stream Pipe Error] for', videoId, err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Audio stream pipe failed' });
      } else {
        res.end();
      }
    });

    upstreamResp.body.pipe(res);
  } catch (err) {
    handleUpstreamError(res, err, '/api/stream');
  }
});

app.get('/api/download', async (req, res) => {
  const videoId = req.query.videoId;
  const title = req.query.title || 'WaveX Track';
  if (!videoId || !VIDEO_ID_REGEX.test(videoId)) {
    return res.status(400).json({ error: 'A valid 11-character videoId is required.' });
  }

  try {
    let audioUrl = await getStreamUrl(videoId);
    let upstreamResp = await undiciRequest(audioUrl, {
      method: 'GET',
      headers: buildCdnHeaders(req),
    });

    if (upstreamResp.statusCode === 403) {
      streamUrlCache.delete(videoId);
      audioUrl = await getStreamUrl(videoId);
      upstreamResp = await undiciRequest(audioUrl, {
        method: 'GET',
        headers: buildCdnHeaders(req),
      });
    }

    if (upstreamResp.statusCode >= 400) {
      if (upstreamResp.body && typeof upstreamResp.body.destroy === 'function') {
        upstreamResp.body.destroy();
      }
      return res.status(upstreamResp.statusCode).json({
        error: `Upstream audio provider returned HTTP ${upstreamResp.statusCode}`,
        status: upstreamResp.statusCode,
      });
    }

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
    res.setHeader('Content-Type', upstreamResp.headers['content-type'] || 'audio/mp4');
    if (upstreamResp.headers['content-length']) {
      res.setHeader('Content-Length', upstreamResp.headers['content-length']);
    }

    const clientAbortHandler = () => {
      if (upstreamResp.body && typeof upstreamResp.body.destroy === 'function') {
        upstreamResp.body.destroy();
      }
    };
    req.on('close', clientAbortHandler);
    res.on('finish', () => {
      req.off('close', clientAbortHandler);
    });

    upstreamResp.body.on('error', (err) => {
      console.error('[Download Pipe Error] for', videoId, err.message);
      if (!res.headersSent) {
        res.status(502).json({ error: 'Download stream pipe failed' });
      } else {
        res.end();
      }
    });

    upstreamResp.body.pipe(res);
  } catch (err) {
    handleUpstreamError(res, err, '/api/download');
  }
});

app.listen(PORT, () => {
  console.log(`Soundify backend listening on port ${PORT}`);
  connectDB().catch(console.error);
});

module.exports = { app, resolveYtDlp, getStreamUrl, sanitizeDiagnosticText, isRateLimitError, isUnavailableError };
