import { Track, Playlist } from '@/types/music';
import { CORE_TRACKS, COVERS } from '@/lib/mediaAssets';

// ================= BASE URL =================
// In Next.js, relative paths ('') work seamlessly on client and server
export const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || '')
  : (process.env.API_BASE_URL || 'http://localhost:3000');

const YT_API = `${API_BASE_URL}/api/search`;

// ================= SEARCH =================
export const searchTracks = async (query: string): Promise<Track[]> => {
  if (!query) return [];

  const requestUrl = `${YT_API}?q=${encodeURIComponent(query)}`;
  const requestOptions = { method: 'GET' };

  try {
    const response = await fetch(requestUrl, requestOptions);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data: Track[] = await response.json();
    return data;
  } catch (err) {
    console.error('Search request failed:', err);
    throw err;
  }
};

// ================= ALIAS =================
export const searchSongs = searchTracks;

// ================= FEATURED (HOME PAGE) =================
export const FALLBACK_TRACKS: Track[] = CORE_TRACKS;

export const fetchFeaturedTracks = async (): Promise<Track[]> => {
  try {
    const tracks = await searchTracks("trending songs india");
    if (tracks && tracks.length > 0) return tracks;
  } catch (err) {
    console.error(err);
  }
  return FALLBACK_TRACKS;
};

// ================= DEFAULT TRACKS =================
export const getDefaultTracks = async (): Promise<Track[]> => {
  try {
    const tracks = await searchTracks("top hits 2024");
    if (tracks && tracks.length > 0) return tracks;
  } catch (err) {
    console.error(err);
  }
  return FALLBACK_TRACKS;
};

// ================= PLAYLIST SUPPORT =================
export const fetchTracksByIds = async (ids: string[] = []): Promise<Track[]> => {
  if (!ids || ids.length === 0) return [];

  try {
    const promises = ids.map(id =>
      fetch(`${API_BASE_URL}/api/track?id=${id}`).then(res => res.ok ? res.json() : null)
    );
    const results = await Promise.all(promises);
    return results.filter((track): track is Track => track !== null);
  } catch (err) {
    console.error("Failed to fetch tracks by IDs:", err);
    return [];
  }
};

// ================= PLAYLISTS =================
export const PLAYLISTS: Playlist[] = [
  {
    id: "trending",
    name: "Trending Now",
    songs: FALLBACK_TRACKS
  },
  {
    id: "top",
    name: "Top Hits",
    songs: FALLBACK_TRACKS
  }
];

// ================= LYRICS =================
export const fetchLyrics = async (title: string, artist?: string): Promise<string> => {
  if (!title) return `[00:00.00] No lyrics found.`;

  try {
    const cleanTitle = title.replace(/\(.*?\)|\[.*?\]|(official.*)/gi, '').trim();
    const cleanArtist = artist ? artist.split(',')[0].trim() : '';

    const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
    const data = await res.json();

    if (data && data.length > 0) {
      const synced = data.find((d: any) => d.syncedLyrics);
      if (synced) return synced.syncedLyrics;

      if (data[0].plainLyrics) {
        return `[00:00.00] (Lyrics are not synced)\n` + data[0].plainLyrics.split('\n').map((line: string, i: number) => `[00:0${(i % 9) + 1}.00] ${line}`).join('\n');
      }
    }
  } catch (err) {
    console.error("Lyrics fetch failed:", err);
  }

  return `[00:00.00] No lyrics available for "${title}".`;
};

