"use client";

import React, { useState } from 'react';
import {
  DownloadCloud, Play, Pause, Heart, MoreHorizontal,
  Search, Check, Trash2, CheckCircle2, ChevronDown
} from 'lucide-react';
import { usePlaylists } from '../context/PlaylistContext';
import { usePlayer } from '../context/PlayerContext';
import { useNotification } from '../context/NotificationContext';
import { useConnectedDevice } from '@/context/DeviceContext';
import { Track } from '@/types/music';
import { COVERS, CORE_TRACKS, getFallbackCover } from '@/lib/mediaAssets';

const OFFLINE_COLLECTIONS = [
  { name: 'Trending Now', count: '48 Tracks', quality: 'HI-RES FLAC', color: '#00E5FF', cover: COVERS.aaveshamSoundtrack },
  { name: 'Top Hits Malayalam', count: '56 Tracks', quality: 'DOLBY ATMOS', color: '#10B981', cover: COVERS.illuminati },
  { name: 'Focus Beats & Lo-Fi', count: '42 Tracks', quality: 'HI-RES FLAC', color: '#00E5FF', cover: COVERS.snowfall },
  { name: 'Aavesham OST', count: '12 Tracks', quality: 'DOLBY ATMOS', color: '#10B981', cover: COVERS.aaveshamSoundtrack },
];

export default function DownloadsView({ setActiveView }: { setActiveView?: (view: string) => void }) {
  const { downloadedTracks, removeDownload, customPlaylists } = usePlaylists();
  const { currentTrack, isPlaying, playTrack, liked, toggleLike } = usePlayer();
  const { showPrompt } = useNotification();
  const { storage } = useConnectedDevice();

  const [activeTab, setActiveTab] = useState('all');
  const [autoDownload, setAutoDownload] = useState(true);
  const [searchFilter, setSearchFilter] = useState('');

  const trackCount = downloadedTracks.length;
  const usedAudioMB = trackCount * 32.4;
  const usedAudioStr = usedAudioMB >= 1024 ? `${(usedAudioMB / 1024).toFixed(1)} GB` : `${usedAudioMB > 0 ? usedAudioMB.toFixed(1) : '0'} MB`;
  const totalDriveStr = `${storage.totalGB || 475.6} GB`;
  const freeStr = `${storage.freeGB || 268.6} GB`;
  const storagePct = Math.max(usedAudioMB > 0 ? 1 : 0, Math.min(100, Math.round((usedAudioMB / ((storage.totalGB || 475.6) * 1024)) * 100)));

  const filterTabs = [
    { id: 'all', label: `All Downloads (${trackCount})` },
    { id: 'playlists', label: `Playlists (${(customPlaylists?.length || 0) + 4})` },
    { id: 'albums', label: `Albums (${Math.min(trackCount, 4)})` },
    { id: 'flac', label: `Lossless FLAC (${trackCount})` },
    { id: 'atmos', label: `Dolby Atmos (${Math.min(trackCount, 2)})` },
  ];

  // Fallback sample list populated with real downloadedTracks first
  const displayTracks: Track[] = downloadedTracks.length > 0 ? downloadedTracks : CORE_TRACKS;

  const filteredTracks = searchFilter
    ? displayTracks.filter(t => t.title.toLowerCase().includes(searchFilter.toLowerCase()) || t.artist.toLowerCase().includes(searchFilter.toLowerCase()))
    : displayTracks;

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Top Breadcrumb & Offline Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--wx-text-muted)' }}>Library</span>
          <span style={{ color: 'var(--wx-border)' }}>/</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Offline Downloads</span>
          <span style={{
            background: 'rgba(0, 229, 255, 0.15)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 9999, padding: '2px 8px',
            fontSize: 10, fontWeight: 900, color: 'var(--wx-cyan)',
          }}>
            {trackCount} Track{trackCount === 1 ? '' : 's'}
          </span>
        </div>

        {/* Search input in offline downloads */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--wx-surface-card)',
          border: '1px solid var(--wx-border)',
          borderRadius: 12, padding: '8px 14px', width: 260,
        }}>
          <Search size={15} color="var(--wx-text-muted)" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search in offline downloads..."
            style={{
              background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 13, width: '100%', fontFamily: 'inherit',
            }}
          />
        </div>
      </div>

      {/* 2. Hero Card (Exact replica from Screenshot 1) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, var(--wx-surface-card) 60%)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        borderRadius: 24, padding: '28px 32px', marginBottom: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, flexWrap: 'wrap',
      }}>
        {/* Left: Download Icon Box */}
        <div style={{
          width: 84, height: 84, borderRadius: 20,
          background: 'rgba(0, 229, 255, 0.1)',
          border: '1px solid rgba(0, 229, 255, 0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 24px rgba(0,229,255,0.2)',
          flexShrink: 0,
        }}>
          <DownloadCloud size={44} color="var(--wx-cyan)" />
        </div>

        {/* Center info & storage progress bar */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(0, 229, 255, 0.12)',
            borderRadius: 9999, padding: '3px 10px',
            fontSize: 10, fontWeight: 900, letterSpacing: 1,
            textTransform: 'uppercase', color: 'var(--wx-cyan)', marginBottom: 6,
          }}>
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--wx-cyan)' }} />
            OFFLINE STORAGE • HI-RES LOSSLESS
          </div>

          <h1 style={{ fontSize: 34, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>
            Downloads
          </h1>
          <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', marginBottom: 12 }}>
            <strong style={{ color: '#fff' }}>{trackCount} track{trackCount === 1 ? '' : 's'}</strong> saved locally • {usedAudioStr} of {totalDriveStr} offline storage used
          </div>

          {/* Progress bar */}
          <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ width: `${Math.max(2, storagePct)}%`, height: '100%', background: 'var(--wx-cyan)', borderRadius: 3 }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>
            <span>{usedAudioStr} Downloaded</span>
            <span>{freeStr} Free</span>
          </div>
        </div>

        {/* Right Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 160 }}>
          <button
            onClick={() => playTrack(displayTracks[0], displayTracks)}
            style={{
              background: 'var(--wx-cyan)', color: '#080C14',
              border: 'none', borderRadius: 12, padding: '12px 24px',
              fontSize: 14, fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: '0 0 20px rgba(0,229,255,0.4)',
            }}
          >
            <Play size={16} fill="#080C14" /> Play Offline
          </button>

          <button
            onClick={() => showPrompt('Downloading all liked tracks to local storage', 'success')}
            style={{
              background: 'var(--wx-surface)', color: '#fff',
              border: '1px solid var(--wx-border)', borderRadius: 12, padding: '10px 18px',
              fontSize: 12, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <DownloadCloud size={14} /> Download All Liked
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', fontWeight: 600 }}>Auto-download new liked</span>
            <input
              type="checkbox"
              checked={autoDownload}
              onChange={(e) => setAutoDownload(e.target.checked)}
              style={{ accentColor: 'var(--wx-cyan)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      {/* 3. Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28, overflowX: 'auto', paddingBottom: 4 }}>
        {filterTabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? 'var(--wx-cyan)' : 'var(--wx-surface-card)',
                color: isActive ? '#080C14' : 'var(--wx-text-muted)',
                border: `1px solid ${isActive ? 'var(--wx-cyan)' : 'var(--wx-border)'}`,
                borderRadius: 9999, padding: '6px 16px',
                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 4. Offline Playlists & Albums Horizontal Carousel */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>
            Offline Playlists &amp; Albums
          </h2>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--wx-cyan)', cursor: 'pointer' }}>
            View all (16)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14 }}>
          {OFFLINE_COLLECTIONS.map(item => (
            <div
              key={item.name}
              style={{
                background: 'var(--wx-surface-card)',
                border: '1px solid var(--wx-border)',
                borderRadius: 16, padding: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
              }}
            >
              <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={item.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 14, height: 14, borderRadius: '50%', background: 'var(--wx-cyan)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={9} color="#080C14" strokeWidth={3} />
                </div>
              </div>

              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', marginTop: 1 }}>{item.count}</div>
                <span style={{
                  display: 'inline-block', marginTop: 4,
                  fontSize: 9, fontWeight: 900, color: item.color,
                  letterSpacing: 0.5,
                }}>
                  {item.quality}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Downloaded Songs (Local Cache) Table */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: '#fff', margin: 0 }}>
            Downloaded Songs (Local Cache)
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--wx-text-muted)', cursor: 'pointer' }}>
            <span>Sort by: <strong style={{ color: '#fff' }}>Date Downloaded</strong></span>
            <ChevronDown size={14} />
          </div>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 2fr 150px 80px 120px 80px',
          padding: '10px 16px',
          fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--wx-text-muted)', borderBottom: '1px solid var(--wx-border)',
          alignItems: 'center',
        }}>
          <span>#</span>
          <span>TITLE &amp; ARTIST</span>
          <span>AUDIO QUALITY</span>
          <span>SIZE</span>
          <span>STATUS</span>
          <span style={{ textAlign: 'right' }}>ACTIONS</span>
        </div>

        {/* Table Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
          {filteredTracks.map((track, idx) => {
            const active = currentTrack?.id === track.id;
            const isLiked = liked.has(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, filteredTracks)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 150px 80px 120px 80px',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--wx-surface-card)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--wx-cyan)' : 'var(--wx-text-muted)' }}>
                  {idx + 1}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <img
                    src={track.cover} alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                    style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: active ? 'var(--wx-cyan)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.artist}
                    </div>
                  </div>
                </div>

                {/* Quality Pill */}
                <div>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: idx % 2 === 0 ? 'rgba(0, 229, 255, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                    border: `1px solid ${idx % 2 === 0 ? 'rgba(0, 229, 255, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
                    color: idx % 2 === 0 ? 'var(--wx-cyan)' : '#10B981',
                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 6,
                  }}>
                    {idx % 2 === 0 ? 'FLAC 24-bit • 192kHz' : 'Dolby Atmos'}
                  </span>
                </div>

                {/* Size */}
                <span style={{ fontSize: 12, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>
                  {idx % 2 === 0 ? '64 MB' : '88 MB'}
                </span>

                {/* Status */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#10B981', fontSize: 12, fontWeight: 700 }}>
                  <Check size={14} strokeWidth={3} />
                  <span>Downloaded</span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 2 }}
                  >
                    <Heart size={16} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); playTrack(track, filteredTracks); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 2 }}
                  >
                    <Play size={16} fill="#fff" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeDownload(track.id); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wx-text-muted)', padding: 2 }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
