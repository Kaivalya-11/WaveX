"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { X, Music2, Loader2, Plus, Heart, Check } from 'lucide-react';
import { Track } from '@/types/music';

interface AddToPlaylistModalProps {
  track: Track | null;
  onClose: () => void;
}

export default function AddToPlaylistModal({ track, onClose }: AddToPlaylistModalProps) {
  const { currentUser } = useAuth();
  const { customPlaylists, addTrack } = usePlaylists();
  const { liked, likedTracks, toggleLike } = usePlayer();
  const [addingId, setAddingId] = useState<string | null>(null);

  const trackId = track ? (track.id || (track as any).trackId) : null;
  const isLiked = trackId ? liked.has(trackId) : false;

  const handleToggleLiked = () => {
    if (!track) return;
    toggleLike(track);
    onClose();
  };

  const handleAdd = async (playlistId: string) => {
    if (!track) return;
    setAddingId(playlistId);
    try {
      await addTrack(playlistId, track);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  if (!track) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }} onClick={onClose}>
      <div
        style={{
          width: 'min(420px, 92%)',
          background: '#050B14', border: '1px solid #101828',
          borderRadius: 24, padding: 24, color: '#fff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          animation: 'modalSlideUp 0.3s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--wx-cyan)', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Add to playlist</div>
            <div style={{ fontSize: 18, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 300 }}>{track.title}</div>
            <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', marginTop: 2 }}>{track.artist}</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d99ae', padding: 4 }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
          {/* Quick Option: Liked Songs Playlist */}
          <button
            onClick={handleToggleLiked}
            style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: 12,
              borderRadius: 14,
              border: `1px solid ${isLiked ? 'rgba(0, 229, 255, 0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: isLiked ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.04)',
              color: '#fff',
              cursor: 'pointer', transition: 'all 0.15s', textAlign: 'left'
            }}
            onMouseEnter={e => e.currentTarget.style.background = isLiked ? 'rgba(0, 229, 255, 0.16)' : 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = isLiked ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255,255,255,0.04)'}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: isLiked ? 'rgba(0, 229, 255, 0.2)' : 'rgba(255, 255, 255, 0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Heart size={20} fill={isLiked ? 'var(--wx-cyan)' : 'none'} color={isLiked ? 'var(--wx-cyan)' : '#fff'} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: isLiked ? 'var(--wx-cyan)' : '#fff' }}>Liked Songs</div>
              <div style={{ fontSize: 11, color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)' }}>
                {isLiked ? `Saved in Liked Songs • ${likedTracks.length} tracks` : `Save to your Liked Songs library`}
              </div>
            </div>
            {isLiked ? (
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--wx-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={13} color="#080C14" strokeWidth={3} />
              </div>
            ) : (
              <Plus size={18} color="var(--wx-cyan)" />
            )}
          </button>

          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
          {customPlaylists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#8d99ae' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>No custom playlists found.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Create one in the sidebar first!</div>
            </div>
          ) : (
            customPlaylists.map(pl => {
              const trackCount = pl.tracks?.length ?? pl.trackIds?.length ?? pl.songs?.length ?? 0;
              return (
                <button
                  key={pl.id}
                  onClick={() => handleAdd(pl.id || (pl as any)._id)}
                  disabled={addingId === pl.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                    borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)',
                    background: 'rgba(255,255,255,0.03)', color: '#fff',
                    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 8, background: '#001d3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Music2 size={20} color="#00b4d8" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{pl.name}</div>
                    <div style={{ fontSize: 11, color: '#8d99ae' }}>{trackCount} tracks</div>
                  </div>
                  {addingId === pl.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} color="#8d99ae" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

