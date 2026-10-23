"use client";

import React, { useEffect, useState } from 'react';
import {
  Home, Compass, Heart, DownloadCloud, Radio, Settings2,
  Plus, ChevronRight, Star, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { useNotification } from '../context/NotificationContext';
import { Playlist } from '@/types/music';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

const DEFAULT_PLAYLISTS = [
  { id: 'trending', name: 'Trending Now', color: '#00E5FF' },
  { id: 'top-malayalam', name: 'Top Hits Malayalam', color: '#A855F7' },
  { id: 'focus-lofi', name: 'Focus Beats & Lo-Fi', color: '#10B981' },
  { id: 'late-night', name: 'Late Night Drive', color: '#64748B' },
];

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  activePlaylist: Playlist | null;
  setActivePlaylist: (playlist: Playlist | null) => void;
}

export default function Sidebar({ activeView, setActiveView, activePlaylist, setActivePlaylist }: SidebarProps) {
  const isMobile = useIsMobile();
  const { currentUser } = useAuth();
  const { customPlaylists, downloadedTracks, createPlaylist, deletePlaylist } = usePlaylists();
  const { likedTracks } = usePlayer();
  const { showPrompt } = useNotification();
  const [newPlName, setNewPlName] = useState('');
  const [creating, setCreating] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Browse', icon: Compass },
    { id: 'liked', label: 'Liked Tracks', icon: Heart },
    { id: 'downloads', label: 'Downloads', icon: DownloadCloud },
    { id: 'ai', label: 'Radio', icon: Radio },
    { id: 'dashboard', label: 'Profile & Settings', icon: Settings2 },
  ];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlName.trim()) return;
    try {
      const pl = await createPlaylist(newPlName.trim());
      if (pl) {
        setActivePlaylist(pl);
        setActiveView('playlist');
        showPrompt(`Created playlist "${newPlName.trim()}"`, 'success');
      }
      setNewPlName('');
      setCreating(false);
    } catch {
      showPrompt('Failed to create playlist', 'error');
    }
  };

  const photoURL = currentUser?.photoURL || (currentUser as any)?.providerData?.[0]?.photoURL;
  const avatarUrl = photoURL?.replace(/=s96-c/, "=s200-c") || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName || 'Kaivalya'}`;

  /* ─── MOBILE BOTTOM BAR ─── */
  if (isMobile) {
    return (
      <nav
        aria-label="Mobile Navigation"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'rgba(10, 15, 29, 0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--wx-border)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '8px 4px calc(8px + env(safe-area-inset-bottom))',
          zIndex: 100,
        }}
      >
        {navItems.slice(0, 5).map(item => {
          const isActive = activeView === item.id;
          const Icon = item.icon;
          const count = item.id === 'liked' ? likedTracks.length : (item.id === 'downloads' ? downloadedTracks.length : null);
          return (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setActivePlaylist(null); }}
              aria-label={item.label}
              style={{
                background: 'none', border: 'none',
                color: isActive ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '6px 12px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {count !== null && count > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -8,
                    fontSize: 8, fontWeight: 900,
                    background: 'var(--wx-cyan)', color: '#080C14',
                    borderRadius: 9999, padding: '1px 4px',
                  }}>
                    {count}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  /* ─── DESKTOP SIDEBAR ─── */
  return (
    <aside
      aria-label="Main Sidebar"
      style={{
        width: '100%', height: '100%',
        background: 'var(--wx-sidebar)',
        borderRight: '1px solid var(--wx-border)',
        display: 'flex', flexDirection: 'column',
        padding: '24px 16px 20px',
        userSelect: 'none',
        boxSizing: 'border-box',
      }}
    >
      {/* Brand Logo & Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {/* Soundwave square cyan icon */}
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: 'linear-gradient(135deg, #00E5FF 0%, #0070F3 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 20px rgba(0,229,255,0.4)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, height: 18 }}>
            {[10, 18, 14, 18, 10].map((h, i) => (
              <div key={i} style={{ width: 2.5, height: h, background: '#080C14', borderRadius: 2 }} />
            ))}
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: -0.5, color: '#fff' }}>Wavex</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 20 }}>
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setActivePlaylist(null); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 14,
                border: isActive ? '1px solid rgba(0,229,255,0.3)' : '1px solid transparent',
                background: isActive ? 'rgba(0,229,255,0.08)' : 'transparent',
                color: isActive ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                fontSize: 14,
                fontWeight: isActive ? 800 : 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.color = 'var(--wx-text)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--wx-text-muted)';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} color={isActive ? 'var(--wx-cyan)' : 'currentColor'} />
                <span>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {item.id === 'liked' && likedTracks.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: isActive ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                    borderRadius: 9999, padding: '1px 6px',
                  }}>
                    {likedTracks.length}
                  </span>
                )}
                {item.id === 'downloads' && downloadedTracks.length > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: isActive ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.06)',
                    color: isActive ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                    borderRadius: 9999, padding: '1px 6px',
                  }}>
                    {downloadedTracks.length}
                  </span>
                )}
                {isActive && (
                  <div style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'var(--wx-cyan)',
                    boxShadow: '0 0 8px var(--wx-cyan)',
                  }} />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Playlists Section */}
      <div style={{ marginTop: 28, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 10px' }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1.5, color: 'var(--wx-text-muted)', textTransform: 'uppercase' }}>
            Playlists
          </span>
          <button
            onClick={() => setCreating(!creating)}
            title="Create Playlist"
            style={{
              background: 'none', border: 'none', color: 'var(--wx-text-muted)',
              cursor: 'pointer', padding: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={16} />
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} style={{ padding: '0 8px 12px' }}>
            <input
              autoFocus
              type="text"
              value={newPlName}
              onChange={(e) => setNewPlName(e.target.value)}
              placeholder="Playlist name..."
              style={{
                width: '100%', background: 'var(--wx-surface-card)', border: '1px solid var(--wx-cyan)',
                borderRadius: 8, padding: '6px 10px', color: '#fff', fontSize: 13, outline: 'none',
              }}
            />
          </form>
        )}

        {/* Scrollable Playlists List */}
        <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {DEFAULT_PLAYLISTS.map((pl) => {
            const isSelected = activeView === 'playlist' && activePlaylist?.id === pl.id;

            return (
              <div
                key={pl.id}
                onClick={() => {
                  setActivePlaylist({ id: pl.id, name: pl.name, tracks: [] });
                  setActiveView('playlist');
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                  color: isSelected ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                  fontSize: 13, fontWeight: isSelected ? 800 : 500,
                  transition: 'background 0.15s',
                  background: isSelected ? 'rgba(0,229,255,0.08)' : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.color = 'var(--wx-text)'; }}
                onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.color = 'var(--wx-text-muted)'; }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: pl.color, flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
              </div>
            );
          })}

          {customPlaylists.map((pl) => {
            const isSelected = activeView === 'playlist' && (activePlaylist?._id === pl._id || activePlaylist?.id === pl.id);
            return (
              <div
                key={pl._id || pl.id}
                onClick={() => { setActivePlaylist(pl); setActiveView('playlist'); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                  color: isSelected ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
                  fontSize: 13, fontWeight: isSelected ? 800 : 500,
                  background: isSelected ? 'rgba(0,229,255,0.08)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--wx-cyan)', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(pl._id || pl.id); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', opacity: 0.6, cursor: 'pointer', padding: 2 }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Account Card */}
      <div
        onClick={() => { setActiveView('dashboard'); setActivePlaylist(null); }}
        style={{
          marginTop: 16,
          background: 'var(--wx-surface-card)',
          border: '1px solid var(--wx-border)',
          borderRadius: 16,
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          transition: 'border-color 0.15s, transform 0.15s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'rgba(0,229,255,0.4)';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--wx-border)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {/* Avatar with online dot */}
          <div style={{ position: 'relative', width: 36, height: 36, flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt=""
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=User`; }}
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: -1, right: -1,
              width: 10, height: 10, borderRadius: '50%',
              background: '#10B981',
              border: '2px solid var(--wx-surface-card)',
              boxShadow: '0 0 6px rgba(16,185,129,0.8)',
            }} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.displayName || 'Kaivalya Gavaskar'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--wx-cyan)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, marginTop: 1 }}>
            </div>
          </div>
        </div>

        <ChevronRight size={16} color="var(--wx-text-muted)" style={{ flexShrink: 0 }} />
      </div>
    </aside>
  );
}
