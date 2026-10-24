import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

const globalWithCache = global as typeof globalThis & {
  _streamUrlCache?: Map<string, { url: string; expires: number }>;
  _inFlightExtractions?: Map<string, Promise<string>>;
};

if (!globalWithCache._streamUrlCache) {
  globalWithCache._streamUrlCache = new Map();
}
if (!globalWithCache._inFlightExtractions) {
  globalWithCache._inFlightExtractions = new Map();
}

const streamUrlCache = globalWithCache._streamUrlCache;
const inFlightExtractions = globalWithCache._inFlightExtractions;

export function invalidateStreamUrl(videoId: string): void {
  streamUrlCache.delete(videoId);
}

export function clearStreamUrlCache(): void {
  streamUrlCache.clear();
}

export interface YtDlpCommand {
  executable: string;
  prefixArgs: string[];
}

export function resolveYtDlp(): YtDlpCommand {
  const isWindows = process.platform === 'win32';
  const customPath = process.env.YTDLP_PATH ? process.env.YTDLP_PATH.replace(/^["']|["']$/g, '').trim() : '';

  if (customPath) {
    if (!isWindows && (/^[a-zA-Z]:[\\/]/.test(customPath) || customPath.includes('\\'))) {
      // Ignore Windows paths on non-Windows environments
    } else if (fs.existsSync(customPath)) {
      return { executable: customPath, prefixArgs: [] };
    } else if (!customPath.includes('/') && !customPath.includes('\\')) {
      return { executable: customPath, prefixArgs: [] };
    }
  }

  const candidateExecutables = isWindows
    ? [
        path.join(process.env.LOCALAPPDATA || '', 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
        path.join(process.env.APPDATA || '', 'Python', 'Scripts', 'yt-dlp.exe'),
      ]
    : [
        '/usr/local/bin/yt-dlp',
        '/usr/bin/yt-dlp',
        '/opt/render/.local/bin/yt-dlp',
        path.join(process.env.HOME || '', '.local', 'bin', 'yt-dlp'),
      ];

  for (const candidate of candidateExecutables) {
    try {
      if (candidate && fs.existsSync(candidate)) {
        return { executable: candidate, prefixArgs: [] };
      }
    } catch {
      // ignore existence error
    }
  }

  const fallbackPath = !isWindows && customPath && customPath.includes('\\') ? 'yt-dlp' : (customPath || 'yt-dlp');
  return { executable: fallbackPath, prefixArgs: [] };
}

function executeYtDlp(executable: string, args: string[], timeoutMs = 8000): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { timeout: timeoutMs, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        const errorText = (stderr || err.message || '').trim();
        return reject(new Error(errorText));
      }
      const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const url = lines.find(l => l.startsWith('http://') || l.startsWith('https://'));
      if (!url) {
        return reject(new Error('Invalid URL in yt-dlp output: ' + stdout.substring(0, 100)));
      }
      resolve(url);
    });
  });
}

async function extractStreamUrlInternal(videoId: string): Promise<string> {
  const { executable, prefixArgs } = resolveYtDlp();
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Tier 1: Modern yt-dlp with Node JS runtime and default client hierarchy
  const tier1Args = [
    ...prefixArgs,
    '--no-warnings',
    '--no-playlist',
    '-f', 'bestaudio[ext=m4a]/bestaudio/best',
    '--get-url',
    '--js-runtimes', 'node',
    ytUrl,
  ];

  try {
    const url = await executeYtDlp(executable, tier1Args, 6000);
    streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
    return url;
  } catch (err: any) {
    const msg = String(err?.message || '').toLowerCase();

    if (msg.includes('unavailable') || msg.includes('private video')) {
      throw new Error(`TRACK_UNAVAILABLE: Video ${videoId} is unavailable on YouTube`);
    }
    if (msg.includes('429') || msg.includes('too many requests') || msg.includes('confirm you\'re not a bot')) {
      throw new Error(`RATE_LIMITED: YouTube rate-limiting active (HTTP 429)`);
    }

    // Tier 2: Universal minimal fallback
    const tier2Args = [
      ...prefixArgs,
      '--no-warnings',
      '--no-playlist',
      '-f', 'bestaudio/best',
      '--get-url',
      ytUrl,
    ];

    const url = await executeYtDlp(executable, tier2Args, 5000);
    streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
    return url;
  }
}

export function getStreamUrl(videoId: string): Promise<string> {
  if (!videoId || typeof videoId !== 'string' || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
    return Promise.reject(new Error('TRACK_UNAVAILABLE: Empty or invalid track ID'));
  }

  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return Promise.resolve(cached.url);
  }

  if (inFlightExtractions.has(videoId)) {
    return inFlightExtractions.get(videoId)!;
  }

  const extractionPromise = extractStreamUrlInternal(videoId).finally(() => {
    inFlightExtractions.delete(videoId);
  });

  inFlightExtractions.set(videoId, extractionPromise);
  return extractionPromise;
}


