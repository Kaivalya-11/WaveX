import { execFile } from 'child_process';
import fs from 'fs';
import path from 'path';

const globalWithCache = global as typeof globalThis & {
  _streamUrlCache?: Map<string, { url: string; expires: number }>;
};

if (!globalWithCache._streamUrlCache) {
  globalWithCache._streamUrlCache = new Map();
}

const streamUrlCache = globalWithCache._streamUrlCache;

export function invalidateStreamUrl(videoId: string): void {
  streamUrlCache.delete(videoId);
}

export function clearStreamUrlCache(): void {
  streamUrlCache.clear();
}

// Clear any stale cached URLs on module reload
clearStreamUrlCache();

export interface YtDlpCommand {
  executable: string;
  prefixArgs: string[];
}

export function resolveYtDlp(): YtDlpCommand {
  const localAppData = process.env.LOCALAPPDATA || 'C:\\Users\\Kaivalya\\AppData\\Local';
  const appData = process.env.APPDATA || 'C:\\Users\\Kaivalya\\AppData\\Roaming';
  const userProfile = process.env.USERPROFILE || 'C:\\Users\\Kaivalya';

  // 1. Direct path from environment
  if (process.env.YTDLP_PATH) {
    const p = process.env.YTDLP_PATH.replace(/^["']|["']$/g, '').trim();
    if (p && fs.existsSync(p)) {
      return { executable: p, prefixArgs: [] };
    }
  }

  // 2. Common Windows python script locations for yt-dlp.exe
  const candidateExecutables = [
    'C:\\Users\\Kaivalya\\AppData\\Local\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe',
    path.join(localAppData, 'Python', 'pythoncore-3.14-64', 'Scripts', 'yt-dlp.exe'),
    path.join(localAppData, 'Programs', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(localAppData, 'Programs', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    path.join(localAppData, 'Programs', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
    path.join(appData, 'Python', 'Scripts', 'yt-dlp.exe'),
    path.join(userProfile, 'AppData', 'Roaming', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(userProfile, 'AppData', 'Roaming', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    path.join(userProfile, 'AppData', 'Roaming', 'Python', 'Python310', 'Scripts', 'yt-dlp.exe'),
    path.join(localAppData, 'Microsoft', 'WindowsApps', 'yt-dlp.exe'),
  ];

  for (const candidate of candidateExecutables) {
    try {
      if (fs.existsSync(candidate)) {
        return { executable: candidate, prefixArgs: [] };
      }
    } catch {
      // ignore permission error during existence check and proceed
    }
  }

  // 3. Fallback: run via Python module if python.exe exists
  const pythonBin = path.join(localAppData, 'Python', 'bin', 'python.exe');
  try {
    if (fs.existsSync(pythonBin)) {
      return { executable: pythonBin, prefixArgs: ['-m', 'yt_dlp'] };
    }
  } catch {
    // ignore
  }

  // 4. Default to standard command in system PATH or configured env path
  const fallbackPath = process.env.YTDLP_PATH?.replace(/^["']|["']$/g, '').trim() || 'yt-dlp';
  return { executable: fallbackPath, prefixArgs: [] };
}

function executeYtDlp(executable: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(executable, args, { timeout: 25000 }, (err, stdout, stderr) => {
      if (err) {
        const errorText = (stderr || err.message || '').trim();
        return reject(new Error(errorText));
      }
      const lines = stdout.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      const url = lines.find(l => l.startsWith('http'));
      if (!url) {
        return reject(new Error('Invalid URL in yt-dlp output: ' + stdout.substring(0, 100)));
      }
      resolve(url);
    });
  });
}

export async function getStreamUrl(videoId: string): Promise<string> {
  if (!videoId || typeof videoId !== 'string') {
    throw new Error('TRACK_UNAVAILABLE: Empty or invalid track ID');
  }

  const cached = streamUrlCache.get(videoId);
  if (cached && cached.expires > Date.now()) {
    return cached.url;
  }

  const { executable, prefixArgs } = resolveYtDlp();
  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  // Priority 1: Android client + pure audio formats (AAC itag 140 or Opus itag 251)
  // The Android client bypasses web PO token challenges and returns direct playable audio streams
  const tier1Args = [
    ...prefixArgs,
    '--extractor-args', 'youtube:player_client=android,web',
    '--format', 'ba[ext=m4a]/ba[ext=webm]/ba/b[acodec!=none]',
    '--get-url',
    '--no-playlist',
    '--no-warnings',
    '--quiet',
    ytUrl,
  ];

  try {
    const url = await executeYtDlp(executable, tier1Args);
    streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
    return url;
  } catch (err: any) {
    const msg = err?.message || '';

    if (msg.includes('This video is unavailable') || msg.includes('Private video') || msg.includes('Video unavailable')) {
      throw new Error(`TRACK_UNAVAILABLE: Video ${videoId} is unavailable on YouTube`);
    }

    // Priority 2: Standard client with --js-runtimes node, strictly enforcing audio codec
    const tier2Args = [
      ...prefixArgs,
      '--js-runtimes', 'node',
      '--format', 'ba[ext=m4a]/ba[ext=webm]/ba/b[acodec!=none]',
      '--get-url',
      '--no-playlist',
      '--no-warnings',
      '--quiet',
      ytUrl,
    ];

    try {
      const url = await executeYtDlp(executable, tier2Args);
      streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
      return url;
    } catch (err2: any) {
      // Priority 3: Fallback without special flags, strictly requiring non-empty audio codec
      const tier3Args = [
        ...prefixArgs,
        '-f', 'bestaudio[acodec!=none]/best[acodec!=none]',
        '--get-url',
        '--no-playlist',
        '--no-warnings',
        '--quiet',
        ytUrl,
      ];
      const url = await executeYtDlp(executable, tier3Args);
      streamUrlCache.set(videoId, { url, expires: Date.now() + 90 * 60 * 1000 });
      return url;
    }
  }
}
