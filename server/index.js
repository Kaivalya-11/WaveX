require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDB } = require('./config/db');
const YTMusic = require('ytmusic-api');
const { execFile } = require('child_process');
const { request: undiciRequest } = require('undici');

// yt-dlp path — installed via pip
const YTDLP_PATH = process.env.YTDLP_PATH || 'yt-dlp';

// Cache: videoId -> { url, expires }
const streamUrlCache = new Map();

/**
 * Use yt-dlp to extract the best audio-only stream URL for a videoId.
 * Returns a Promise<string> that resolves to the direct CDN URL.
 */
function getStreamUrl(videoId) {
  // Return cached URL if still valid (URLs expire after ~6h, cache for 2h)
  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    console.log('[Stream] Cache hit for', videoId);
    return Promise.resolve(cached.url);
  }

  return new Promise((resolve, reject) => {
    const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const args = [
      '--format', 'bestaudio[ext=m4a]/bestaudio[acodec=aac]/bestaudio',
      '--get-url',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      ytUrl,
    ];

    console.log('[Stream] yt-dlp extracting URL for', videoId);
    execFile(YTDLP_PATH, args, { timeout: 30000 }, (err, stdout, stderr) => {
      if (err) {
        console.error('[Stream] yt-dlp error for', videoId, ':', err.message.substring(0, 200));
        return reject(new Error('yt-dlp failed: ' + (stderr || err.message).substring(0, 200)));
      }
      const url = stdout.trim().split('\n')[0];
      if (!url || !url.startsWith('http')) {
        return reject(new Error('yt-dlp returned invalid URL: ' + url.substring(0, 100)));
      }
      console.log('[Stream] yt-dlp success for', videoId, 'url length:', url.length);
      // Cache for 110 minutes (yt-dlp URLs typically expire in 6h)
      streamUrlCache.set(videoId, { url, expires: Date.now() + 110 * 60 * 1000 });
      resolve(url);
    });
  });
}


// Prevent server crashes from unhandled promise rejections (like play-dl 429 errors)
process.on('unhandledRejection', (reason, promise) => {
  console.error('[Process Error] Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[Process Error] Uncaught Exception:', err);
});

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
  const errMsg = err.message || err.toString();
  let status = 500;
  
  if (errMsg.includes('429') || errMsg.includes('Too Many Requests')) {
    status = 429;
  } else if (errMsg.includes('403') || errMsg.includes('Forbidden')) {
    status = 403;
  } else if (errMsg.includes('404') || errMsg.includes('Not Found')) {
    status = 404;
  } else if (errMsg.includes('timeout') || errMsg.includes('ECONNRESET')) {
    status = 504;
  } else if (errMsg.includes('400')) {
    status = 400;
  } else if (errMsg.includes('401')) {
    status = 401;
  }
  
  console.error(`[Upstream Error] ${new Date().toISOString()} | Endpoint: ${endpoint} | Status: ${status} | Error: ${errMsg}`);
  
  if (!res.headersSent) {
    res.status(status).json({ error: "Upstream service error", status });
  }
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
    
    // Helper to get high-res cover art or fallback
    const getHighResCover = (thumbnails, videoId) => {
      if (!thumbnails || thumbnails.length === 0) {
        return videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=600';
      }
      let url = thumbnails[thumbnails.length - 1].url;
      // Do not arbitrarily rewrite dimensions as it causes 404s for some API results
      if (url.includes('i.ytimg.com')) {
        url = url.replace('mqdefault.jpg', 'hqdefault.jpg').replace('maxresdefault.jpg', 'hqdefault.jpg');
      }
      return url;
    };

    // Map to our Track schema
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
        duration: v.duration || 0, // duration in seconds
        cover: getHighResCover(v.thumbnails, v.videoId),
        src: `http://localhost:5000/api/stream?videoId=${v.videoId}`,
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
      src: `http://localhost:5000/api/stream?videoId=${v.videoId}`,
    };

    res.json(track);
  } catch (err) {
    handleUpstreamError(res, err, '/api/track');
  }
});

// Audio Stream Route — uses yt-dlp to get a real, decrypted audio URL then proxies it
app.get('/api/stream', async (req, res) => {
  const videoId = req.query.videoId;
  if (!videoId) return res.status(400).send('Missing videoId');

  try {
    const audioUrl = await getStreamUrl(videoId);

    // Determine range request (enables seeking)
    const rangeHeader = req.headers['range'];
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.youtube.com/',
      'Origin': 'https://www.youtube.com',
    };
    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader;
    }

    const upstreamResp = await undiciRequest(audioUrl, { headers: requestHeaders });

    // Forward relevant headers from upstream
    const status = rangeHeader ? (upstreamResp.statusCode === 206 ? 206 : upstreamResp.statusCode) : 200;
    const contentType = upstreamResp.headers['content-type'] || 'audio/mp4';
    const contentLength = upstreamResp.headers['content-length'];
    const contentRange = upstreamResp.headers['content-range'];

    res.setHeader('Content-Type', contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    // Allow browser to cache the stream
    res.setHeader('Cache-Control', 'public, max-age=3600');

    res.status(status);
    upstreamResp.body.on('error', (err) => {
      console.error('[Stream] Pipe error for', videoId, err.message);
      if (!res.headersSent) res.status(502).end();
      else res.end();
    });
    upstreamResp.body.pipe(res);
  } catch (err) {
    handleUpstreamError(res, err, '/api/stream');
  }
});

// Download Route — forces download with explicit filename using yt-dlp
app.get('/api/download', async (req, res) => {
  const videoId = req.query.videoId;
  const title = req.query.title || 'WaveX Track';
  if (!videoId) return res.status(400).send('Missing videoId');

  try {
    const audioUrl = await getStreamUrl(videoId);
    const upstreamResp = await undiciRequest(audioUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.youtube.com/',
      }
    });

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.m4a"`);
    res.setHeader('Content-Type', upstreamResp.headers['content-type'] || 'audio/mp4');
    if (upstreamResp.headers['content-length']) {
      res.setHeader('Content-Length', upstreamResp.headers['content-length']);
    }

    upstreamResp.body.on('error', (err) => {
      console.error('[Download] Pipe error for', videoId, err.message);
      if (!res.headersSent) res.status(502).end();
      else res.end();
    });

    upstreamResp.body.pipe(res);
  } catch (err) {
    handleUpstreamError(res, err, '/api/download');
  }
});

const PORT = 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Soundify backend listening on port ${PORT}`);
  });
});
