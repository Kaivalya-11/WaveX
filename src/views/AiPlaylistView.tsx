"use client";

import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import TrackList from '../components/TrackList';
import { Track } from '../types/music';

export default function AiPlaylistView() {
  const [prompt, setPrompt] = useState("");
  const [playlist, setPlaylist] = useState<Track[]>([]);

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
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', marginBottom: 8 }}>
        AI Playlist Generator
      </h1>
      <p style={{ color: '#8d99ae', fontSize: 14, marginBottom: 20 }}>
        Describe the vibe or mood, and we will curate a personalized playlist based on your listening history.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <input
          placeholder="e.g. chill night, gym workout, sad songs, upbeat party..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') generatePlaylist(); }}
          style={{
            flex: 1,
            padding: '12px 16px',
            borderRadius: 10,
            border: "1px solid #152B47",
            background: "#0a1628",
            color: "#fff",
            fontSize: 14,
            outline: 'none'
          }}
        />

        <button
          onClick={generatePlaylist}
          style={{
            padding: "12px 24px",
            background: "#00b4d8",
            color: "#030914",
            border: "none",
            borderRadius: 10,
            cursor: "pointer",
            fontWeight: 800,
            fontSize: 14
          }}
        >
          Generate
        </button>
      </div>

      {playlist.length > 0 ? (
        <div style={{ marginTop: 20 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: '#fff' }}>
            Generated Tracks
          </h2>
          <TrackList tracks={playlist} />
        </div>
      ) : prompt.trim() ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: '#8d99ae' }}>
          No matching tracks found in your listening history. Try searching songs or playing some music first!
        </div>
      ) : null}
    </div>
  );
}

