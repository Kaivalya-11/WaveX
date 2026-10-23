"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Heart, DownloadCloud, Play, Pause, Loader2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { Track } from '@/types/music';
import { getFallbackCover } from '@/lib/mediaAssets';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

interface TrackListProps {
  tracks: Track[];
  showHeader?: boolean;
}

export default function TrackList({ tracks, showHeader = true }: TrackListProps) {
  const isMobile = useIsMobile();
  const { currentTrack, isPlaying, playTrack, liked, toggleLike } = usePlayer();
  const { downloadedTracks, addDownload } = usePlaylists();
  const { showPrompt } = useNotification();
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  if (!tracks || tracks.length === 0) return null;

  const isTrackDownloaded = (id: string) => downloadedTracks.some(t => t.id === id);

  const handleDownload = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (downloadingIds.has(track.id)) return;
    setDownloadingIds(prev => new Set(prev).add(track.id));
    try {
      await addDownload(track);
      showPrompt(`"${track.title}" saved to downloads`, 'success');
    } catch {
      showPrompt(`Failed to download "${track.title}"`, 'error');
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  /* ─── MOBILE ─── */
  if (isMobile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <style>{`
          @keyframes soundbar0 { 0%,100%{height:6px} 50%{height:16px} }
          @keyframes soundbar1 { 0%,100%{height:14px} 50%{height:6px} }
          @keyframes soundbar2 { 0%,100%{height:10px} 50%{height:16px} }
        `}</style>
        {tracks.map((track, idx) => {
          const active = currentTrack?.id === track.id;
          const isLiked = liked.has(track.id);
          const isDl = isTrackDownloaded(track.id);
          const isDlLoading = downloadingIds.has(track.id);

          return (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, tracks)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 14px",
                borderRadius: 14,
                background: active ? "rgba(0,229,255,0.08)" : "var(--wx-surface-card)",
                border: `1px solid ${active ? "rgba(0,229,255,0.25)" : "var(--wx-border)"}`,
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ position: "relative", width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img
                  src={track.cover}
                  alt={track.title}
                  style={{ width: "100%", height: "100%", objectFit: 'cover' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                />
                {active && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isPlaying ? (
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                        {[0, 1, 2].map(i => (
                          <div key={i} style={{ width: 2.5, background: 'var(--wx-cyan)', borderRadius: 2, animation: `soundbar${i} 0.8s ease infinite`, animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    ) : (
                      <Play size={16} color="var(--wx-cyan)" fill="var(--wx-cyan)" />
                    )}
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: active ? "var(--wx-cyan)" : "var(--wx-text)",
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {track.title}
                </div>
                <div style={{ fontSize: 12, color: "var(--wx-text-muted)", marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {track.artist}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
                >
                  <Heart fill={isLiked ? "var(--wx-cyan)" : "none"} color={isLiked ? "var(--wx-cyan)" : "var(--wx-text-muted)"} size={18} />
                </button>

                <button
                  onClick={(e) => handleDownload(e, track)}
                  aria-label="Download"
                  disabled={isDlLoading}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: isDl ? "#10b981" : "var(--wx-text-muted)" }}
                >
                  {isDlLoading ? <Loader2 size={18} style={{ animation: 'wx-spin 1s linear infinite' }} /> : <DownloadCloud size={18} />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /* ─── DESKTOP ─── */
  return (
    <div>
      <style>{`
        @keyframes soundbar0 { 0%,100%{height:6px} 50%{height:18px} }
        @keyframes soundbar1 { 0%,100%{height:14px} 50%{height:7px} }
        @keyframes soundbar2 { 0%,100%{height:10px} 50%{height:18px} }
        @keyframes wx-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {showHeader && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(240px, 2fr) minmax(160px, 1.5fr) 100px 80px",
          padding: "12px 18px",
          color: "var(--wx-text-muted)",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1,
          borderBottom: "1px solid var(--wx-border)",
          marginBottom: 10,
          alignItems: "center"
        }}>
          <span>#</span>
          <span>TITLE</span>
          <span>ARTIST</span>
          <span style={{ textAlign: "center" }}>ACTIONS</span>
          <span style={{ textAlign: "right", display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
            <Clock size={13} />
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {tracks.map((track, idx) => {
          const active = currentTrack?.id === track.id;
          const isLiked = liked.has(track.id);
          const isDl = isTrackDownloaded(track.id);
          const isDlLoading = downloadingIds.has(track.id);

          return (
            <div
              key={track.id + idx}
              onClick={() => playTrack(track, tracks)}
              style={{
                display: "grid",
                gridTemplateColumns: "40px minmax(240px, 2fr) minmax(160px, 1.5fr) 100px 80px",
                padding: "10px 18px",
                background: active ? "rgba(0,229,255,0.08)" : "transparent",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.15s ease",
                alignItems: "center",
                border: active ? "1px solid rgba(0,229,255,0.2)" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "var(--wx-surface-raised)";
                  e.currentTarget.style.borderColor = "var(--wx-border)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                }
              }}
            >
              {/* Index or Equalizer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {active && isPlaying ? (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
                    {[0, 1, 2].map(i => (
                      <div key={i} style={{ width: 3, background: 'var(--wx-cyan)', borderRadius: 2, animation: `soundbar${i} 0.8s ease infinite`, animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                ) : (
                  <span style={{
                    color: active ? "var(--wx-cyan)" : "var(--wx-text-muted)",
                    fontWeight: active ? 800 : 600,
                    fontSize: 13,
                    fontFamily: 'monospace'
                  }}>
                    {idx + 1}
                  </span>
                )}
              </div>

              {/* Title & Cover */}
              <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
                <img
                  src={track.cover}
                  alt=""
                  style={{ width: 44, height: 44, borderRadius: 10, objectFit: "cover", flexShrink: 0, border: '1px solid var(--wx-border)' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 14,
                    fontWeight: active ? 800 : 700,
                    color: active ? "var(--wx-cyan)" : "var(--wx-text)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis"
                  }}>
                    {track.title}
                  </div>
                </div>
              </div>

              {/* Artist */}
              <div style={{
                fontSize: 13,
                color: "var(--wx-text-muted)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {track.artist}
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(track);
                  }}
                  aria-label={isLiked ? "Unlike" : "Like"}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: isLiked ? "var(--wx-cyan)" : "var(--wx-text-muted)" }}
                >
                  <Heart size={18} fill={isLiked ? "var(--wx-cyan)" : "none"} color={isLiked ? "var(--wx-cyan)" : "var(--wx-text-muted)"} />
                </button>

                <button
                  onClick={(e) => handleDownload(e, track)}
                  aria-label="Download"
                  disabled={isDlLoading}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: isDl ? "#10b981" : "var(--wx-text-muted)" }}
                >
                  {isDlLoading ? <Loader2 size={18} style={{ animation: 'wx-spin 1s linear infinite' }} /> : <DownloadCloud size={18} />}
                </button>
              </div>

              {/* Duration */}
              <div style={{ fontSize: 13, color: "var(--wx-text-muted)", textAlign: "right", fontFamily: 'monospace', fontWeight: 600 }}>
                {formatTime(track.duration)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
