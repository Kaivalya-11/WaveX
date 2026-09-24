import React, { useState, useEffect } from 'react';
import { Clock, Heart, HeartOff } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

export default function TrackList({ tracks, showHeader = true }) {
  const isMobile = useIsMobile();

  const { currentTrack, playTrack, liked, toggleLike } = usePlayer();

  if (!tracks || tracks.length === 0) return null;

  // ================= MOBILE =================
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {tracks.map(track => {
          const active = currentTrack?.id === track.id;
          const isLiked = liked.has(track.id);

          return (
            <div
              key={track.id}
              onClick={() => playTrack(track, tracks)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 16px",
                borderRadius: 12,
                background: active ? "rgba(0,180,216,0.1)" : "transparent",
                cursor: "pointer",
                transition: "all 0.25s ease"
              }}
            >
              <img src={track.cover} style={{ width: 46, height: 46, borderRadius: 8 }} />

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: active ? "#00b4d8" : "#fff"
                }}>
                  {track.title}
                </div>
                <div style={{ fontSize: 12, color: "#8d99ae" }}>
                  {track.artist}
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLike(track);
                }}
                style={{ background: "none", border: "none" }}
              >
                {isLiked ? <Heart fill="#00b4d8" color="#00b4d8" /> : <Heart color="#8d99ae" />}
              </button>

              <span style={{ fontSize: 12 }}>
                {formatTime(track.duration)}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // ================= DESKTOP =================
  return (
    <div style={{ padding: "0 10px" }}>
      {showHeader && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(200px, 1fr) minmax(120px, 300px) 60px 80px",
          padding: "10px 16px",
          color: "#8d99ae",
          fontSize: 12,
          fontWeight: 700,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          marginBottom: 10,
          alignItems: "center"
        }}>
          <span>#</span>
          <span>TITLE</span>
          <span>ARTIST</span>
          <span></span>
          <span style={{ textAlign: "right" }}><Clock size={14} /></span>
        </div>
      )}

      {tracks.map((track, idx) => {
        const active = currentTrack?.id === track.id;
        const isLiked = liked.has(track.id);

        return (
          <div
            key={track.id + idx}
            onDoubleClick={() => playTrack(track, tracks)}
            style={{
              display: "grid",
              gridTemplateColumns: "40px minmax(200px, 1fr) minmax(120px, 300px) 60px 80px",
              padding: "8px 16px",
              background: active ? "rgba(0,180,216,0.15)" : "transparent",
              borderRadius: 8,
              cursor: "default",
              transition: "all 0.2s ease",
              alignItems: "center",
              gap: 16
            }}
            onMouseEnter={(e) => {
              if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              const btn = e.currentTarget.querySelector('.play-btn');
              const idxSpan = e.currentTarget.querySelector('.idx-span');
              if (btn && idxSpan) {
                btn.style.opacity = '1';
                idxSpan.style.opacity = '0';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = active ? "rgba(0,180,216,0.15)" : "transparent";
              const btn = e.currentTarget.querySelector('.play-btn');
              const idxSpan = e.currentTarget.querySelector('.idx-span');
              if (btn && idxSpan) {
                btn.style.opacity = '0';
                idxSpan.style.opacity = '1';
              }
            }}
          >
            {/* Column 1: Index / Play Button */}
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span className="idx-span" style={{ 
                color: active ? "#00b4d8" : "#8d99ae", 
                fontWeight: active ? 800 : 500,
                fontSize: 14,
                transition: "opacity 0.2s" 
              }}>
                {idx + 1}
              </span>
              <button className="play-btn" onClick={() => playTrack(track, tracks)} style={{
                position: "absolute",
                background: "transparent",
                border: "none",
                color: active ? "#00b4d8" : "#fff",
                cursor: "pointer",
                opacity: 0,
                transition: "opacity 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#00b4d8" : "white"}><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              </button>
            </div>

            {/* Column 2: Title & Cover */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
              <img src={track.cover} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: "cover" }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ 
                  fontSize: 15, 
                  fontWeight: active ? 800 : 600, 
                  color: active ? "#00b4d8" : "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis"
                }}>
                  {track.title}
                </div>
              </div>
            </div>

            {/* Column 3: Artist */}
            <div style={{ 
              fontSize: 14, 
              color: "#8d99ae", 
              whiteSpace: "nowrap", 
              overflow: "hidden", 
              textOverflow: "ellipsis" 
            }}>
              {track.artist}
            </div>

            {/* Column 4: Like */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <button
                onClick={() => toggleLike(track)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
              >
                {isLiked ? <Heart size={18} fill="#00b4d8" color="#00b4d8" /> : <Heart size={18} color="#8d99ae" />}
              </button>
            </div>

            {/* Column 5: Duration */}
            <div style={{ fontSize: 13, color: "#8d99ae", textAlign: "right" }}>
              {formatTime(track.duration)}
            </div>
          </div>
        );
      })}
    </div>
  );
}