import React from 'react';
import { Play, Pause } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export default function TrackResult({ track, viewMode, allTracks }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();

  const isCurrentTrack = currentTrack?.id === track.id;

  const handlePlay = (e) => {
    e.stopPropagation();
    playTrack(track, allTracks || [track]);
  };

  const handleImageError = (e) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200';
  };

  if (viewMode === 'grid') {
    return (
      <div 
        onClick={handlePlay}
        className="track-result-grid"
        style={{
          background: isCurrentTrack ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.03)",
          borderRadius: 16,
          padding: 16,
          cursor: "pointer",
          transition: "all 0.2s ease",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          position: "relative"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = isCurrentTrack ? "rgba(0,180,216,0.2)" : "rgba(255,255,255,0.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = isCurrentTrack ? "rgba(0,180,216,0.15)" : "rgba(255,255,255,0.03)";
        }}
      >
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
          <img 
            src={track.cover} 
            alt={track.title} 
            onError={handleImageError}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
            }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div title={track.title} style={{ fontWeight: 800, fontSize: 15, color: isCurrentTrack ? '#00b4d8' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {track.title}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <div title={track.artist} style={{ fontSize: 13, color: '#8d99ae', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
              {track.artist}
            </div>
            {isCurrentTrack ? (
              <span style={{ fontSize: 12, color: '#00b4d8', fontWeight: 700, marginLeft: 8 }}>● Playing</span>
            ) : (
              <span style={{ fontSize: 12, color: '#8d99ae', marginLeft: 8 }}>{formatTime(track.duration)}</span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // LIST VIEW
  return (
    <div 
      onClick={handlePlay}
      className="track-result-list"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "12px 16px",
        height: 76,
        borderRadius: 12,
        background: isCurrentTrack ? "rgba(0,180,216,0.15)" : "transparent",
        cursor: "pointer",
        transition: "all 0.2s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isCurrentTrack ? "rgba(0,180,216,0.2)" : "rgba(255,255,255,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isCurrentTrack ? "rgba(0,180,216,0.15)" : "transparent";
      }}
    >
      <div style={{ position: 'relative', width: 60, height: 60, flexShrink: 0 }}>
        <img 
          src={track.cover} 
          alt={`${track.title} cover`} 
          onError={handleImageError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} 
        />
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div title={track.title} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ 
            fontSize: 15, fontWeight: 700, 
            color: isCurrentTrack ? '#00b4d8' : '#fff', 
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' 
          }}>
            {track.title}
          </span>
          {isCurrentTrack && (
            <span style={{ fontSize: 11, color: '#00b4d8', fontWeight: 700, padding: '2px 6px', background: 'rgba(0,180,216,0.15)', borderRadius: 10 }}>● Playing</span>
          )}
        </div>
        <div title={track.artist} style={{ fontSize: 13, color: '#8d99ae', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {track.artist}
        </div>
      </div>

      <div style={{ color: '#8d99ae', fontSize: 13, fontWeight: 500, fontFamily: 'monospace', marginLeft: 24 }}>
        {formatTime(track.duration)}
      </div>

      <button 
        onClick={(e) => { e.stopPropagation(); handlePlay(e); }}
        aria-label={isPlaying && isCurrentTrack ? `Pause ${track.title}` : `Play ${track.title}`}
        style={{ 
          background: 'none', border: 'none', 
          color: isCurrentTrack ? '#00b4d8' : '#8d99ae', 
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, marginLeft: 16
        }}
      >
        {isCurrentTrack && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </div>
  );
}
