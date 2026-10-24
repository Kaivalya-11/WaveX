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

  execFile(binaryPath, ['--version'], { timeout: 10000 }, (err, stdout, stderr) => {
    if (err) {
      console.warn(`[Stream Diagnostic] [WARNING] yt-dlp executable check failed for "${binaryPath}":`);
      console.warn(`  - Error Code: ${err.code || 'UNKNOWN'}`);
      console.warn(`  - Error Message: ${err.message}`);
      if (stderr) console.warn(`  - Stderr: ${sanitizeDiagnosticText(stderr)}`);
      console.warn(`[Stream Diagnostic] Actionable Guidance:`);
      console.warn(`  - On Render: Set Build Command to: "pip install --upgrade yt-dlp yt-dlp-ejs && npm install" and set YTDLP_PATH="yt-dlp"`);
      console.warn(`  - Fallback extraction strategies (play-dl / tiered yt-dlp) are active.`);
    } else {
      console.log(`[Stream Diagnostic] SUCCESS: yt-dlp is available and executable. Version: ${stdout.trim()}`);
    }
  });
}

runStartupDiagnostic(YTDLP_PATH);

// In-memory Cache: videoId -> { url, expires }
const streamUrlCache = new Map();

/**
 * Low-level yt-dlp runner that returns captured output and structured diagnostic details on error.
 */
function executeYtDlp(executable, args, timeoutMs = 35000) {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
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
 * Use a multi-tiered extraction strategy to extract the best direct audio stream URL:
 * - Tier 1: Modern yt-dlp with Node JS runtime and remote components (handles modern YouTube JS signature challenges).
 * - Tier 2: Standard yt-dlp with mobile/web clients (without experimental JS options).
 * - Tier 3: Universal minimal arguments.
 * - Tier 4: Pure Node.js fallback using play-dl.
 */
async function getStreamUrl(videoId) {
  if (!VIDEO_ID_REGEX.test(videoId)) {
    throw new Error(`Invalid YouTube video ID format: ${videoId}`);
  }

  // Check cache (TTL 90 minutes; YouTube signed URLs usually last 6 hours)
  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    console.log(`[Stream] Cache hit for ${videoId}`);
    return cached.url;
  }

  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const tiers = [
    {
      name: 'yt-dlp Tier 1 (Node JS Runtime & iOS/MWeb/Web clients)',
      args: [
        '--no-warnings',
        '--no-playlist',
        '--format', 'bestaudio[ext=m4a]/bestaudio/best[height<=480]/best',
        '--get-url',
        '--js-runtimes', 'node',
        '--remote-components', 'ejs:github',
        '--extractor-args', 'youtube:player_client=ios,mweb,web',
        ytUrl,
      ],
    },
    {
      name: 'yt-dlp Tier 2 (Standard MWeb/Web clients)',
      args: [
        '--no-warnings',
        '--no-playlist',
        '--format', 'bestaudio[ext=m4a]/bestaudio/best',
        '--get-url',
        '--extractor-args', 'youtube:player_client=mweb,web',
        ytUrl,
      ],
    },
    {
      name: 'yt-dlp Tier 3 (Universal fallback)',
      args: [
        '--no-warnings',
        '--no-playlist',
        '--format', 'bestaudio/best',
        '--get-url',
        ytUrl,
      ],
    },
  ];

  let lastDiag = null;

  for (const tier of tiers) {
    try {
      console.log(`[Stream] Attempting extraction with ${tier.name} for ${videoId}`);
      const result = await executeYtDlp(YTDLP_PATH, tier.args, 35000);
      const lines = result.stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const url = lines.find(l => l.startsWith('http://') || l.startsWith('https://'));
      if (url) {
        console.log(`[Stream] Extraction successful with ${tier.name} for ${videoId}`);
        streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
        return url;
      }
    } catch (diag) {
      lastDiag = diag;
      console.warn(`[Stream Diagnostic] ${tier.name} failed for ${videoId}:`);
      console.warn(`  - Executable: ${diag.executable}`);
      console.warn(`  - Exit Code: ${diag.code} | Signal: ${diag.signal || 'none'} | TimedOut: ${diag.timedOut}`);
      console.warn(`  - Error Message: ${diag.sanitizedMessage}`);
      if (diag.sanitizedStderr) {
        console.warn(`  - Captured Stderr: ${diag.sanitizedStderr}`);
      }
      if (diag.sanitizedStdout) {
        console.warn(`  - Captured Stdout: ${diag.sanitizedStdout}`);
      }
    }
  }

  // Tier 4: Pure Node.js fallback via play-dl
  try {
    console.log(`[Stream] Attempting Tier 4 Node fallback (play-dl) for ${videoId}`);
    const playdl = require('play-dl');
    const info = await playdl.video_info(ytUrl);
    const formats = info.format || [];
    const audioFmt = formats.find(f => f.mimeType && f.mimeType.startsWith('audio/mp4')) ||
                     formats.find(f => f.mimeType && f.mimeType.startsWith('audio/')) ||
                     formats.find(f => f.url && f.audio_channels);
    if (audioFmt && audioFmt.url) {
      console.log(`[Stream] Tier 4 (play-dl) extraction successful for ${videoId}`);
      streamUrlCache.set(videoId, { url: audioFmt.url, expires: Date.now() + 90 * 60 * 1000 });
      return audioFmt.url;
    }
  } catch (nodeErr) {
    console.warn(`[Stream Diagnostic] Tier 4 Node fallback failed: ${sanitizeDiagnosticText(nodeErr.message)}`);
  }

  const finalError = new Error(
    `Failed to extract audio stream for ${videoId}. ${
      lastDiag && lastDiag.sanitizedStderr ? lastDiag.sanitizedStderr : (lastDiag?.sanitizedMessage || 'All extraction tiers exhausted.')
    }`
  );
  finalError.diagnostic = lastDiag;
  throw finalError;
}

// Global process error safety handlers
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

// Helper to handle and log upstream errors safely
const handleUpstreamError = (res, err, endpoint) => {
  if (res.headersSent) {
    return;
  }
  const errMsg = err.message || err.toString();
  let status = 500;

  if (errMsg.includes('429') || errMsg.includes('Too Many Requests')) {
    status = 429;
  } else if (errMsg.includes('403') || errMsg.includes('Forbidden')) {
    status = 403;
  } else if (errMsg.includes('404') || errMsg.includes('Not Found')) {
    status = 404;
  } else if (errMsg.includes('timeout') || errMsg.includes('ECONNRESET') || errMsg.includes('ETIMEDOUT')) {
    status = 504;
  } else if (errMsg.includes('400') || errMsg.includes('Invalid')) {
    status = 400;
  } else if (errMsg.includes('401')) {
    status = 401;
  }

  console.error(`[Upstream Error] ${new Date().toISOString()} | Endpoint: ${endpoint} | Status: ${status} | Error: ${sanitizeDiagnosticText(errMsg)}`);

  res.status(status).json({
    error: "Streaming service error",
    status,
    message: sanitizeDiagnosticText(errMsg)
  });
};

// Health check
app.get('/', (req, res) => res.send('Soundify Backend Running!'));

app.get('/api/health', (req, res) => {
  const db = getDB();
  res.json({
    status: db ? "ok" : "degraded",
    service: "wavex-api",
    database: db ? "connected" : "disconnected",
    uptime: process.uptime()
  });
});

// Search Route
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

// Track Details Route
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

/**
 * Build request headers for forwarding to YouTube CDN
 */
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

// Dedicated HEAD endpoint for /api/stream
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

    // If 403, retry once with freshly extracted URL
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
      res.status(500).end();
    }
  }
});

// Audio Stream Route — proxies audio bytes with range support
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

    // If upstream returns 403 Forbidden, the signed URL may have expired.
    // Invalidate the cache and retry once with fresh extraction.
    if (upstreamResp.statusCode === 403) {
      console.warn(`[Stream] Upstream returned 403 for ${videoId}. Invalidating cache and retrying extraction...`);
      streamUrlCache.delete(videoId);
      audioUrl = await getStreamUrl(videoId);
      upstreamResp = await undiciRequest(audioUrl, {
        method: 'GET',
        headers: buildCdnHeaders(req),
      });
    }

    // If upstream returned an error code, do not stream it as valid audio
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

    // Clean up upstream connection when client disconnects or aborts
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

// Download Route — forces download with explicit filename
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

module.exports = { app, resolveYtDlp, getStreamUrl, sanitizeDiagnosticText };

