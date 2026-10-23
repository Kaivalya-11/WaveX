"use client";

import React, { useState } from 'react';
import {
  Headphones, Heart, Plus, RefreshCw, HardDrive, Settings, Trash2,
  MoreHorizontal, Sparkles, Check, CheckCircle2, Music2, Radio, Laptop
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { useConnectedDevice } from '@/context/DeviceContext';
import { Track } from '@/types/music';
import { COVERS, ARTIST_PHOTOS, FEATURED_TRACK, CORE_TRACKS, getFallbackCover } from '@/lib/mediaAssets';

interface RightPanelProps {
  activeView: string;
  setActiveView?: (view: string) => void;
  onSearchQuery?: (query: string) => void;
}

export default function RightPanel({ activeView, setActiveView, onSearchQuery }: RightPanelProps) {
  const { currentTrack, isPlaying, playTrack, recentlyPlayed, liked, toggleLike } = usePlayer();
  const { downloadedTracks } = usePlaylists();
  const { showPrompt } = useNotification();
  const { currentUser } = useAuth();
  const { device, allDevices, storage, selectDevice, promptDevicePicker } = useConnectedDevice();
  const [autoplayOn, setAutoplayOn] = useState(true);
  const [showDevicePicker, setShowDevicePicker] = useState(false);

  const userName = currentUser?.displayName?.split(' ')[0] || 'Kaivalya';
  const trackCount = downloadedTracks.length;
  const usedAudioMB = trackCount * 32.4;
  const usedAudioStr = usedAudioMB >= 1024 ? `${(usedAudioMB / 1024).toFixed(1)} GB` : `${usedAudioMB > 0 ? usedAudioMB.toFixed(1) : '0'} MB`;
  const totalDriveStr = `${storage.totalGB || 475.6} GB`;
  const storagePct = Math.max(usedAudioMB > 0 ? 1 : 0, Math.min(100, Math.round((usedAudioMB / ((storage.totalGB || 475.6) * 1024)) * 100)));

  // Dynamic Connected Device Pill at bottom
  const renderConnectedDevice = (statusLabel = "CONNECTED", subLabel?: string) => {
    const isHeadphone = device.type === 'earbuds' || device.type === 'headphones' || device.type === 'bluetooth';
    const displayTitle = isHeadphone && !device.label.toLowerCase().includes(userName.toLowerCase())
      ? `${device.label} (${userName})`
      : device.label;
    const effectiveSub = subLabel || (isHeadphone ? "Spatial Audio On" : "Stereo Output");

    return (
      <div style={{ position: 'relative', marginTop: 'auto' }}>
        {showDevicePicker && allDevices.length > 1 && (
          <div style={{
            position: 'absolute', bottom: '100%', left: 0, right: 0, marginBottom: 8,
            background: 'var(--wx-surface-raised)', border: '1px solid var(--wx-border-active)',
            borderRadius: 14, padding: '8px', zIndex: 100, boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: 'var(--wx-cyan)', padding: '4px 8px', letterSpacing: 0.5 }}>
              Available Audio Outputs
            </div>
            {allDevices.map(d => (
              <div
                key={d.label}
                onClick={() => { selectDevice(d); setShowDevicePicker(false); }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: d.label === device.label ? 'rgba(0,229,255,0.12)' : 'transparent',
                  color: d.label === device.label ? 'var(--wx-cyan)' : '#fff',
                  fontSize: 12, fontWeight: 700,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {d.type === 'speaker' ? <Laptop size={14} /> : <Headphones size={14} />}
                  <span>{d.label}</span>
                </div>
                {d.label === device.label && <Check size={14} />}
              </div>
            ))}
          </div>
        )}

        <div
          onClick={() => {
            if (allDevices.length > 1) {
              setShowDevicePicker(!showDevicePicker);
            } else {
              promptDevicePicker();
            }
          }}
          title="Click to select audio device"
          style={{
            background: 'rgba(0, 229, 255, 0.04)',
            border: '1px solid rgba(0, 229, 255, 0.18)',
            borderRadius: 16,
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.4)';
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.18)';
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(0, 229, 255, 0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {device.type === 'speaker' ? (
                <Laptop size={17} color="var(--wx-cyan)" />
              ) : (
                <Headphones size={17} color="var(--wx-cyan)" />
              )}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayTitle}
              </div>
              <div style={{ fontSize: 11, color: 'var(--wx-cyan)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--wx-cyan)', flexShrink: 0 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{effectiveSub}</span>
              </div>
            </div>
          </div>
          <span style={{
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            color: 'var(--wx-cyan)',
            fontSize: 10,
            fontWeight: 900,
            padding: '3px 8px',
            borderRadius: 6,
            letterSpacing: 0.5,
            flexShrink: 0,
            marginLeft: 8,
          }}>
            {statusLabel}
          </span>
        </div>
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     1. HOME VIEW RIGHT PANEL (Now Playing & Next in Queue)
  ───────────────────────────────────────────────────────────── */
  if (activeView === 'home') {
    const displayTrack = currentTrack || FEATURED_TRACK;

    const isLiked = liked.has(displayTrack.id);

    return (
      <aside style={asideStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 900, color: '#fff' }}>
            <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12 }}>
              {[6, 12, 8].map((h, i) => (
                <div key={i} style={{ width: 2.5, height: h, background: 'var(--wx-cyan)', borderRadius: 2 }} />
              ))}
            </div>
            Now Playing
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--wx-text-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Large Artwork with Dolby Atmos badge */}
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 18, overflow: 'hidden', marginBottom: 14, boxShadow: '0 12px 32px rgba(0,0,0,0.6)' }}>
          <img
            src={displayTrack.cover}
            alt={displayTrack.title}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(displayTrack.id); }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          {/* Dolby Atmos Badge */}
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 6, padding: '3px 8px',
            fontSize: 10, fontWeight: 900, color: 'var(--wx-cyan)', letterSpacing: 0.5,
          }}>
            DOLBY ATMOS
          </div>
          {/* Like Heart Button */}
          <button
            onClick={() => toggleLike(displayTrack as Track)}
            style={{
              position: 'absolute', bottom: 12, right: 12,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} color={isLiked ? '#ef4444' : '#fff'} />
          </button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {displayTrack.title}
          </div>
          <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', marginTop: 2 }}>
            {displayTrack.artist}
          </div>
        </div>

        {/* Next in Queue */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-text-muted)' }}>
              Next In Queue
            </span>
            <button
              onClick={() => setAutoplayOn(!autoplayOn)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                color: autoplayOn ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
              }}
            >
              Autoplay {autoplayOn ? 'On' : 'Off'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto' }}>
            {(recentlyPlayed && recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 4) : CORE_TRACKS.slice(1, 4)).map((track, i) => (
              <div
                key={track.id || i}
                onClick={() => playTrack(track as Track, recentlyPlayed)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  borderRadius: 12, background: 'var(--wx-surface-card)', cursor: 'pointer',
                }}
              >
                <img
                  src={track.cover} alt=""
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                  style={{ width: 38, height: 38, borderRadius: 8, objectFit: 'cover' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {track.artist}
                  </div>
                </div>
                <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>
                  {track.duration ? `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}` : '3:22'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {renderConnectedDevice("CONNECTED", "Spatial Audio On")}
      </aside>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     2. SEARCH & BROWSE VIEW RIGHT PANEL (Daily Top Searches & Top Artists)
  ───────────────────────────────────────────────────────────── */
  if (activeView === 'search') {
    const dailySearches = [
      { rank: '01', title: 'Illuminati', artist: 'Sushin Shyam, Dabzee', dur: '3:33', color: '#00E5FF' },
      { rank: '02', title: 'Blinding Lights', artist: 'The Weeknd', dur: '3:22', color: '#F97316' },
      { rank: '03', title: 'Starboy', artist: 'The Weeknd, Daft Punk', dur: '3:51', color: '#A855F7' },
      { rank: '04', title: 'Shape of You', artist: 'Ed Sheeran', dur: '3:54', color: '#10B981' },
      { rank: '05', title: 'Jaadugar', artist: 'Paradox', dur: '3:18', color: '#06B6D4' },
    ];

    const topArtists = [
      { name: 'Sushin', seed: 'SS', color: '#3B82F6' },
      { name: 'Weeknd', seed: 'TW', color: '#EF4444' },
      { name: 'Aujla', seed: 'KA', color: '#F97316' },
      { name: 'Ed Sheeran', seed: 'ES', color: '#06D6A0' },
    ];

    return (
      <aside style={asideStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-cyan)' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--wx-cyan)' }} />
            Daily Top Searches
          </div>
          <span style={{ fontSize: 11, color: 'var(--wx-cyan)', fontWeight: 700, cursor: 'pointer' }}>Global</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
          {dailySearches.map(item => (
            <div
              key={item.rank}
              onClick={() => onSearchQuery?.(item.title)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                borderRadius: 12, background: 'var(--wx-surface-card)', cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--wx-surface-raised)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'var(--wx-surface-card)'}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 8, background: item.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 11, color: '#080C14', flexShrink: 0,
              }}>
                {item.rank}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.artist}
                </div>
              </div>
              <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>{item.dur}</span>
            </div>
          ))}
        </div>

        {/* Top Artists Now */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-text-muted)' }}>
            Top Artists Now
          </span>
          <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', fontWeight: 700 }}>Explore</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          {topArtists.map(artist => (
            <div
              key={artist.name}
              onClick={() => onSearchQuery?.(artist.name)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: '50%', background: artist.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: 13, color: '#fff', border: '2px solid rgba(255,255,255,0.2)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
              }}>
                {artist.seed}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{artist.name}</span>
            </div>
          ))}
        </div>

        {renderConnectedDevice("ACTIVE", "Dolby Atmos • 24-bit/96kHz")}
      </aside>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     3. LIKED SONGS VIEW RIGHT PANEL (Liked Analytics & Recommendations)
  ───────────────────────────────────────────────────────────── */
  if (activeView === 'liked') {
    const genres = [
      { name: 'Synthwave / Retro', pct: 38, color: '#00E5FF' },
      { name: 'Malayalam OST', pct: 29, color: '#A855F7' },
      { name: 'Global Pop', pct: 21, color: '#10B981' },
    ];

    const recommended = [
      { title: 'Jaada', artist: 'Sushin Shyam' },
      { title: 'Save Your Tears', artist: 'The Weeknd' },
      { title: 'Perfect', artist: 'Ed Sheeran' },
    ];

    return (
      <aside style={asideStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 900, color: '#fff' }}>
            <Sparkles size={16} color="var(--wx-cyan)" />
            Liked Analytics
          </div>
          <span style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 9999,
            padding: '2px 8px', fontSize: 10, color: 'var(--wx-text-muted)', fontWeight: 700,
          }}>
            This Month
          </span>
        </div>

        {/* Favorite Genres Card */}
        <div style={{ background: 'var(--wx-surface-card)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--wx-border)' }}>
          <div style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wx-text-muted)', marginBottom: 12 }}>
            Favorite Genres
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {genres.map(g => (
              <div key={g.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  <span>{g.name}</span>
                  <span style={{ color: g.color }}>{g.pct}%</span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${g.pct}%`, height: '100%', background: g.color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Liked Artist Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(0,229,255,0.15), var(--wx-surface-card))',
          borderRadius: 16, padding: '14px 16px', marginBottom: 16,
          border: '1px solid rgba(0,229,255,0.25)',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <img
            src={ARTIST_PHOTOS.theWeeknd}
            alt="The Weeknd"
            style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
          />
          <div>
            <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-cyan)' }}>
              Top Liked Artist
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', marginTop: 2 }}>The Weeknd</div>
            <div style={{ fontSize: 11, color: 'var(--wx-text-muted)' }}>14 tracks in your collection</div>
          </div>
        </div>

        {/* Recommended For You */}
        <div style={{ flex: 1, minHeight: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-text-muted)' }}>
              Recommended For You
            </span>
            <span style={{ fontSize: 11, color: 'var(--wx-cyan)', fontWeight: 700, cursor: 'pointer' }}>Refresh</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { title: 'Jaada', artist: 'Sushin Shyam', cover: COVERS.aaveshamSoundtrack },
              { title: 'Save Your Tears', artist: 'The Weeknd', cover: COVERS.blindingLights },
              { title: 'Perfect', artist: 'Ed Sheeran', cover: COVERS.shapeOfYou },
            ].map(track => (
              <div
                key={track.title}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 10px', borderRadius: 12, background: 'var(--wx-surface-card)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <img
                    src={track.cover}
                    alt={track.title}
                    style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.artist}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => showPrompt(`Added "${track.title}" to library`, 'success')}
                  style={{
                    background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 8,
                    width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#fff', flexShrink: 0,
                  }}
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {renderConnectedDevice("CONNECTED", "Spatial Audio On")}
      </aside>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     4. DOWNLOADS VIEW RIGHT PANEL (Storage & Device + Audio Cache)
  ───────────────────────────────────────────────────────────── */
  if (activeView === 'downloads') {
    const handleClearCache = () => {
      showPrompt('Cleared 1.2 GB of temporary cached audio', 'success');
    };

    return (
      <aside style={asideStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#fff' }}>
            <HardDrive size={15} color="var(--wx-cyan)" />
            Storage &amp; Device
          </div>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 8px #10B981' }} />
        </div>

        {/* Host Drive Card */}
        <div style={{ background: 'var(--wx-surface-card)', borderRadius: 16, padding: '16px', marginBottom: 18, border: '1px solid var(--wx-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Laptop size={18} color="#fff" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{storage.diskName}</div>
                <div style={{ fontSize: 11, color: 'var(--wx-text-muted)' }}>{storage.fsType}</div>
              </div>
            </div>
            <span style={{
              background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)',
              color: '#10b981', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 9999,
            }}>
              Healthy
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--wx-text-muted)', marginBottom: 6 }}>
            <span>Audio Cache: <strong style={{ color: '#fff' }}>{usedAudioStr}</strong></span>
            <span>Max: {totalDriveStr}</span>
          </div>

          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{ width: `${Math.max(2, storagePct)}%`, height: '100%', background: 'linear-gradient(90deg, #00E5FF, #06D6A0)', borderRadius: 3 }} />
          </div>
        </div>

        {/* Audio Cache Distribution */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wx-text-muted)', marginBottom: 12 }}>
            Audio Cache Distribution
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { label: 'Hi-Res Lossless FLAC', size: trackCount > 0 ? `${(trackCount * 26.2).toFixed(1)} MB` : '0 MB', color: '#00E5FF' },
              { label: 'Spatial Audio (Dolby Atmos)', size: trackCount > 0 ? `${(trackCount * 4.6).toFixed(1)} MB` : '0 MB', color: '#10B981' },
              { label: 'Standard Compressed', size: trackCount > 0 ? `${(trackCount * 1.6).toFixed(1)} MB` : '0 MB', color: '#F59E0B' },
              { label: 'Allocated Free Headroom', size: `${storage.freeGB} GB`, color: '#64748B' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ color: '#fff', fontWeight: 600 }}>{item.label}</span>
                </div>
                <span style={{ color: 'var(--wx-text-muted)', fontFamily: 'monospace', fontWeight: 700 }}>{item.size}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'auto' }}>
          <button
            onClick={() => setActiveView?.('dashboard')}
            style={{
              background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
              borderRadius: 12, padding: '11px', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Settings size={15} color="var(--wx-cyan)" /> Download Quality Settings
          </button>

          <button
            onClick={handleClearCache}
            style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
              borderRadius: 12, padding: '11px', color: '#ef4444', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Trash2 size={15} /> Clear Unused Cache
          </button>
        </div>
      </aside>
    );
  }

  /* ─────────────────────────────────────────────────────────────
     5. DASHBOARD VIEW RIGHT PANEL (Member Insights & Listening Stats)
  ───────────────────────────────────────────────────────────── */
  if (activeView === 'dashboard') {
    return (
      <aside style={asideStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase', color: '#fff' }}>
            <Radio size={15} color="var(--wx-cyan)" />
            Member Insights
          </div>
          <button style={{ background: 'none', border: 'none', color: 'var(--wx-text-muted)', cursor: 'pointer' }}>
            <MoreHorizontal size={18} />
          </button>
        </div>

        {/* Mini Player Card */}
        <div style={{
          background: 'var(--wx-surface-card)', borderRadius: 16, padding: '14px',
          border: '1px solid var(--wx-border)', marginBottom: 16,
        }}>
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
            <img
              src={COVERS.illuminati}
              alt="Illuminati"
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover('S1jo8K4kDJc'); }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'rgba(0,0,0,0.7)', borderRadius: 6, padding: '2px 6px',
              fontSize: 9, fontWeight: 900, color: 'var(--wx-cyan)',
            }}>
              DOLBY ATMOS
            </div>
            <button
              onClick={() => toggleLike(FEATURED_TRACK)}
              title={liked.has(FEATURED_TRACK.id) ? "Unlike" : "Like"}
              style={{
                position: 'absolute', bottom: 8, right: 8,
                background: 'rgba(0,0,0,0.6)', border: 'none',
                borderRadius: '50%', width: 24, height: 24,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Heart size={13} fill={liked.has(FEATURED_TRACK.id) ? '#ef4444' : 'none'} color={liked.has(FEATURED_TRACK.id) ? '#ef4444' : '#fff'} />
            </button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Illuminati (From &ldquo;Aavesham&rdquo;)
          </div>
          <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', marginTop: 2 }}>
            Sushin Shyam • Dabzee
          </div>
        </div>

        {/* Listening Stats */}
        <div style={{ background: 'var(--wx-surface-card)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--wx-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'var(--wx-text-muted)' }}>Listening Stats (October)</span>
            <span style={{ color: 'var(--wx-cyan)', fontSize: 10, fontWeight: 900 }}>Top 1% Fan</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div style={{ background: 'var(--wx-surface)', padding: '10px 12px', borderRadius: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: '#fff' }}>3,420</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wx-text-muted)', textTransform: 'uppercase' }}>Minutes</div>
            </div>
            <div style={{ background: 'var(--wx-surface)', padding: '10px 12px', borderRadius: 12 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--wx-cyan)' }}>#1</div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--wx-text-muted)', textTransform: 'uppercase' }}>Sushin Shyam</div>
            </div>
          </div>

          <div style={{ fontSize: 12, color: 'var(--wx-text-muted)' }}>
            Top Genre: <strong style={{ color: '#fff' }}>Malayalam Hip-Hop / OST</strong>
          </div>
        </div>

        {/* Offline Hi-Res Storage */}
        <div style={{ background: 'var(--wx-surface-card)', borderRadius: 16, padding: '14px 16px', marginBottom: 16, border: '1px solid var(--wx-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 700, color: '#fff' }}>Offline Hi-Res Storage</span>
            <span style={{ color: 'var(--wx-cyan)', fontWeight: 800 }}>{usedAudioStr} / {totalDriveStr}</span>
          </div>
          <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ width: `${Math.max(2, storagePct)}%`, height: '100%', background: 'var(--wx-cyan)', borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 11, color: 'var(--wx-text-muted)' }}>
            {trackCount} Lossless Master track{trackCount === 1 ? '' : 's'} stored locally.
          </div>
        </div>

        {renderConnectedDevice("CONNECTED • HI-FI", "Lossless 24-bit")}
      </aside>
    );
  }

  // Default Fallback
  return (
    <aside style={asideStyle}>
      {renderConnectedDevice("CONNECTED", "Spatial Audio On")}
    </aside>
  );
}

const asideStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  background: 'var(--wx-sidebar)',
  borderLeft: '1px solid var(--wx-border)',
  display: 'flex',
  flexDirection: 'column',
  padding: '24px 18px 20px',
  boxSizing: 'border-box',
  overflowY: 'auto',
  userSelect: 'none',
};
