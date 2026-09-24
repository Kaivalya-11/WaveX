// spotify.js - FINAL SAFE VERSION (NO CLIENT SECRET IN FRONTEND)

// ================= CONFIG =================
const CLIENT_ID = "340289c32a044473b93a6d32b0bf8b59";
const REDIRECT_URI = window.location.origin;

const SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "user-library-read"
];

// ================= AUTH (FOR IMPORT + SEARCH TOKEN) =================
export const getSpotifyAuthUrl = () => {
  return `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(
    REDIRECT_URI
  )}&scope=${encodeURIComponent(SCOPES.join(" "))}`;
};

export const getTokenFromUrl = () => {
  const hash = window.location.hash;
  if (!hash) return localStorage.getItem("spotify_token");

  const params = new URLSearchParams(hash.substring(1));
  const token = params.get("access_token");

  if (token) {
    localStorage.setItem("spotify_token", token);
    window.location.hash = "";
  }

  return token || localStorage.getItem("spotify_token");
};

// ================= 🔍 SEARCH (SAFE VERSION) =================
export const searchSpotify = async (query) => {
  if (!query) return [];

  const token = localStorage.getItem("spotify_token");

  // ❌ If user not connected → don't crash
  if (!token) {
    console.warn("Spotify not connected — skipping API search");
    return [];
  }

  try {
    const res = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    // ❌ If blocked / expired token
    if (!res.ok) {
      console.warn("Spotify search failed:", res.status);
      return [];
    }

    const data = await res.json();

    return (data.tracks?.items || []).map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      cover: track.album.images[0]?.url || "",
      url: track.preview_url,
      duration: Math.floor(track.duration_ms / 1000),
    }));
  } catch (err) {
    console.error("Spotify search error:", err);
    return [];
  }
};

// ================= IMPORT FEATURES =================
export const fetchSpotifyPlaylists = async (token) => {
  try {
    const res = await fetch(
      "https://api.spotify.com/v1/me/playlists?limit=50",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Failed playlists");

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchSpotifyPlaylistTracks = async (token, playlistId) => {
  try {
    const res = await fetch(
      `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Failed tracks");

    const data = await res.json();

    return (data.items || [])
      .filter(item => item.track)
      .map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map(a => a.name).join(", "),
        cover: item.track.album.images[0]?.url || "",
        url: item.track.preview_url,
        duration: Math.floor(item.track.duration_ms / 1000),
      }));
  } catch (err) {
    console.error(err);
    return [];
  }
};

export const fetchSpotifyLikedSongs = async (token) => {
  try {
    const res = await fetch(
      "https://api.spotify.com/v1/me/tracks?limit=50",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    if (!res.ok) throw new Error("Failed liked songs");

    const data = await res.json();

    return (data.items || []).map(item => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map(a => a.name).join(", "),
      cover: item.track.album.images[0]?.url || "",
      url: item.track.preview_url,
      duration: Math.floor(item.track.duration_ms / 1000),
    }));
  } catch (err) {
    console.error(err);
    return [];
  }
};