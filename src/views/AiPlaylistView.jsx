import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackList from '../components/TrackList';

export default function AiPlaylistView() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState([]);

  const { recentlyPlayed } = usePlayer();

  const generatePlaylist = () => {
    if (!prompt.trim()) return;

    const mood = prompt.toLowerCase();

    const filtered = recentlyPlayed.filter(track => {
      if (mood.includes("chill")) return track.title.toLowerCase().includes("love");
      if (mood.includes("sad")) return track.title.toLowerCase().includes("slow");
      if (mood.includes("party")) return track.title.toLowerCase().includes("remix");
      return true;
    });

    setPlaylist(filtered.slice(0, 10));
  };

  return (
    <div style={{ padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 900 }}>
        AI Playlist
      </h1>

      <input
        placeholder="e.g. chill night, gym, sad songs..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={{
          width: "100%",
          padding: 12,
          marginTop: 16,
          borderRadius: 10,
          border: "none",
          background: "#0a1628",
          color: "#fff"
        }}
      />

      <button
        onClick={generatePlaylist}
        style={{
          marginTop: 12,
          padding: "10px 20px",
          background: "#00b4d8",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: 700
        }}
      >
        Generate
      </button>

      {playlist.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <TrackList tracks={playlist} />
        </div>
      )}
    </div>
  );
}