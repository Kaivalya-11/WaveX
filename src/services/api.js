// ================= BASE URL =================
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const YT_API = `${API_BASE_URL}/api/search`;

// ================= SEARCH =================
export const searchTracks = async (query) => {
  if (!query) return [];

  const requestUrl = `${YT_API}?q=${encodeURIComponent(query)}`;
  const requestOptions = { method: 'GET' };

  console.group("[WaveX Search]");
  console.log("Query:", query);
  console.log("API URL:", requestUrl);
  console.log("Request options:", requestOptions);

  try {
    const response = await fetch(requestUrl, requestOptions);

    console.log("HTTP status:", response.status);
    console.log("HTTP ok:", response.ok);
    console.log("Response URL:", response.url);
    console.log("Response type:", response.type);

    if (!response.ok) {
      console.groupEnd();
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Normalized tracks received:", data.length);
    console.groupEnd();
    return data;
  } catch (err) {
    console.error("Search request failed:", err);
    console.groupEnd();
    throw err;
  }
};

// ================= ALIAS (FOR OLD FILES) =================
export const searchSongs = searchTracks;

// ================= FEATURED (HOME PAGE) =================
const FALLBACK_TRACKS = [
  {
    id: "JGwWNGJdvx8",
    title: "Shape of You",
    artist: "Ed Sheeran",
    cover: "https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg",
    duration: 233,
    src: `${API_BASE_URL}/api/stream?videoId=JGwWNGJdvx8`
  },
  {
    id: "4NRXx6U8ABQ",
    title: "Blinding Lights",
    artist: "The Weeknd",
    cover: "https://i.ytimg.com/vi/4NRXx6U8ABQ/hqdefault.jpg",
    duration: 200,
    src: `${API_BASE_URL}/api/stream?videoId=4NRXx6U8ABQ`
  },
  {
    id: "TUVcZfQe-Kw",
    title: "Levitating",
    artist: "Dua Lipa",
    cover: "https://i.ytimg.com/vi/TUVcZfQe-Kw/hqdefault.jpg",
    duration: 203,
    src: `${API_BASE_URL}/api/stream?videoId=TUVcZfQe-Kw`
  }
];

export const fetchFeaturedTracks = async () => {
  try {
    const tracks = await searchTracks("trending songs india");
    if (tracks && tracks.length > 0) return tracks;
  } catch (err) {
    console.error(err);
  }
  return FALLBACK_TRACKS;
};

// ================= DEFAULT TRACKS =================
export const getDefaultTracks = async () => {
  try {
    const tracks = await searchTracks("top hits 2024");
    if (tracks && tracks.length > 0) return tracks;
  } catch (err) {
    console.error(err);
  }
  return FALLBACK_TRACKS;
};

// ================= PLAYLIST SUPPORT =================
export const fetchTracksByIds = async (ids = []) => {
  if (!ids || ids.length === 0) return [];
  
  try {
    const promises = ids.map(id => fetch(`${API_BASE_URL}/api/track?id=${id}`).then(res => res.ok ? res.json() : null));
    const results = await Promise.all(promises);
    return results.filter(track => track !== null);
  } catch (err) {
    console.error("Failed to fetch tracks by IDs:", err);
    return [];
  }
};

// ================= PLAYLISTS =================
export const PLAYLISTS = [
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
export const fetchLyrics = async (title, artist) => {
  if (!title) return `[00:00.00] No lyrics found.`;
  
  try {
    // Clean up title/artist to improve search accuracy (remove "Official Video", "(feat. ...)", etc.)
    const cleanTitle = title.replace(/\(.*?\)|\[.*?\]|(official.*)/gi, '').trim();
    const cleanArtist = artist ? artist.split(',')[0].trim() : '';

    const res = await fetch(`https://lrclib.net/api/search?track_name=${encodeURIComponent(cleanTitle)}&artist_name=${encodeURIComponent(cleanArtist)}`);
    const data = await res.json();

    if (data && data.length > 0) {
      // Find the first result that has synced lyrics
      const synced = data.find(d => d.syncedLyrics);
      if (synced) return synced.syncedLyrics;

      // Fallback to plain lyrics if synced not available
      if (data[0].plainLyrics) {
        return `[00:00.00] (Lyrics are not synced)\n` + data[0].plainLyrics.split('\n').map((line, i) => `[00:0${(i%9)+1}.00] ${line}`).join('\n');
      }
    }
  } catch (err) {
    console.error("Lyrics fetch failed:", err);
  }

  return `[00:00.00] No lyrics available for "${title}".`;
};