"use client";

import React, { useEffect, useState } from 'react';
import {
  Heart, Play, Pause, Shuffle, DownloadCloud, ChevronLeft, ChevronRight,
  Search, SlidersHorizontal, Bell, Lock, MoreHorizontal, Clock, Plus, Loader2
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { searchSongs, API_BASE_URL } from '../services/api';
import { Track, Playlist } from '../types/music';
import { CORE_TRACKS, COVERS, getFallbackCover } from '@/lib/mediaAssets';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface PlaylistViewProps {
  activeView: string;
  activePlaylist: Playlist | null;
  setActivePlaylist: (pl: Playlist | null) => void;
  setActiveView?: (view: string) => void;
}

export default function PlaylistView({ activeView, activePlaylist, setActivePlaylist, setActiveView }: PlaylistViewProps) {
  const { currentTrack, isPlaying, playTrack, liked, likedTracks, toggleLike, setShuffle } = usePlayer();
  const { currentUser } = useAuth();
  const { addTrack } = usePlaylists();
  const { showPrompt } = useNotification();

  const [playlistTracks, setPlaylistTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  // Sample seed tracks matching reference screenshot 2 when database has few items
  const fallbackLikedTracks: Track[] = CORE_TRACKS;

  useEffect(() => {
    if (activeView === 'liked') {
      setPlaylistTracks(likedTracks);
      setLoading(false);
    } else if (activePlaylist?.tracks && activePlaylist.tracks.length > 0) {
      setPlaylistTracks(activePlaylist.tracks.map((t: any) => ({
        ...t,
        id: t.trackId || t.id,
        album: t.album || 'Single',
        dateAdded: t.dateAdded || 'Recently'
      })));
      setLoading(false);
    } else {
      setPlaylistTracks(fallbackLikedTracks);
      setLoading(false);
    }
  }, [activeView, activePlaylist?.id, activePlaylist?.tracks, likedTracks]);

  const filteredTracks = searchFilter
    ? playlistTracks.filter(t => t.title.toLowerCase().includes(searchFilter.toLowerCase()) || t.artist.toLowerCase().includes(searchFilter.toLowerCase()))
    : playlistTracks;

  const handlePlayAll = () => {
    if (playlistTracks.length > 0) playTrack(playlistTracks[0], playlistTracks);
  };

  const handleShuffle = () => {
    if (playlistTracks.length > 0) {
      setShuffle(true);
      const randIdx = Math.floor(Math.random() * playlistTracks.length);
      playTrack(playlistTracks[randIdx], playlistTracks);
    }
  };

  const isLikedView = activeView === 'liked';
  const heroTitle = isLikedView ? 'Liked Songs' : (activePlaylist?.name || 'Playlist');

  const totalTrackCount = playlistTracks.length;
  const totalDurationSecs = playlistTracks.reduce((acc, t) => acc + (t.duration || 213), 0);
  const totalHours = Math.floor(totalDurationSecs / 3600);
  const totalMinutes = Math.floor((totalDurationSecs % 3600) / 60);
  const durationString = totalHours > 0
    ? `${totalHours} hr${totalHours === 1 ? '' : 's'} ${totalMinutes} min${totalMinutes === 1 ? '' : 's'}`
    : `${totalMinutes} min${totalMinutes === 1 ? '' : 's'}`;

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Top Header (< > search filter bell) from Screenshot 2 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 16 }}>
        {/* Navigation arrows */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <ChevronLeft size={16} />
          </button>
          <button style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wx-text-muted)', cursor: 'pointer' }}>
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Search bar */}
        <div style={{
          flex: 1, maxWidth: 440, display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
          borderRadius: 12, padding: '8px 14px',
        }}>
          <Search size={15} color="var(--wx-text-muted)" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder={`Search in ${heroTitle}...`}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 13, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        {/* Actions: Filter & Bell */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
            borderRadius: 10, padding: '7px 14px', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer',
          }}>
            <SlidersHorizontal size={14} /> Filter
          </button>

          <button style={{
            position: 'relative', width: 36, height: 36, borderRadius: '50%',
            background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer',
          }}>
            <Bell size={16} />
            <div style={{ position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: '50%', background: 'var(--wx-cyan)' }} />
          </button>
        </div>
      </div>

      {/* 2. Hero Card (Exact replica from Screenshot 2) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.8) 0%, var(--wx-surface-card) 60%)',
        border: '1px solid var(--wx-border)',
        borderRadius: 24, padding: '28px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap',
      }}>
        {/* Big Artwork Box */}
        <div style={{
          width: 170, height: 170, borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,0.7)', flexShrink: 0,
        }}>
          <img
            src={playlistTracks[0]?.cover || COVERS.blindingLights}
            alt=""
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = COVERS.blindingLights; }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Center Metadata */}
        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              background: 'rgba(0, 229, 255, 0.15)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: 'var(--wx-cyan)', fontSize: 10, fontWeight: 900,
              padding: '2px 8px', borderRadius: 9999, letterSpacing: 0.5, textTransform: 'uppercase',
            }}>
              COLLECTION - AUTO-SYNCED
            </span>
            <span style={{ color: 'var(--wx-text-muted)', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Lock size={12} /> Private Playlist
            </span>
          </div>

          <h1 style={{ fontSize: 44, fontWeight: 900, color: '#fff', margin: '0 0 10px', letterSpacing: -1 }}>
            {heroTitle}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--wx-text-muted)', flexWrap: 'wrap', marginBottom: 16 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--wx-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: '#080C14' }}>
              {currentUser?.displayName?.[0] || 'K'}
            </div>
            <strong style={{ color: '#fff' }}>{currentUser?.displayName || 'Kaivalya Gavaskar'}</strong>
            <span>•</span>
            <span>{totalTrackCount} song{totalTrackCount === 1 ? '' : 's'}</span>
            <span>•</span>
            <span>{durationString}</span>
            <span>•</span>
            <span style={{ color: 'var(--wx-cyan)' }}>Updated today</span>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handlePlayAll}
              style={{
                background: 'var(--wx-cyan)', color: '#080C14',
                border: 'none', borderRadius: 12, padding: '12px 28px',
                fontSize: 14, fontWeight: 900, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 0 20px rgba(0,229,255,0.4)',
              }}
            >
              <Play size={16} fill="#080C14" /> PLAY ALL
            </button>

            <button
              onClick={handleShuffle}
              style={{
                background: 'var(--wx-surface)', border: '1px solid var(--wx-border)',
                borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', cursor: 'pointer',
              }}
            >
              <Shuffle size={18} />
            </button>

            <button
              onClick={() => showPrompt('Downloading playlist', 'success')}
              style={{
                background: 'var(--wx-surface)', border: '1px solid var(--wx-border)',
                borderRadius: 12, width: 42, height: 42, display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: '#fff', cursor: 'pointer',
              }}
            >
              <DownloadCloud size={18} />
            </button>

            <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', marginLeft: 8 }}>
              Sort by: <strong style={{ color: '#fff' }}>Date Added ∨</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Track Table (Exact replica from Screenshot 2) */}
      <div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '40px 2fr 1.2fr 110px 40px 60px',
          padding: '10px 16px',
          fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase',
          color: 'var(--wx-text-muted)', borderBottom: '1px solid var(--wx-border)',
          alignItems: 'center', marginBottom: 4,
        }}>
          <span>#</span>
          <span>TITLE &amp; ARTIST</span>
          <span>ALBUM</span>
          <span>DATE ADDED</span>
          <span style={{ textAlign: 'center' }}><Clock size={13} /></span>
          <span style={{ textAlign: 'right' }}>ACTIONS</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTracks.map((track, idx) => {
            const active = currentTrack?.id === track.id;
            const isLiked = liked.has(track.id);

            return (
              <div
                key={track.id + idx}
                onClick={() => playTrack(track, filteredTracks)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '40px 2fr 1.2fr 110px 40px 60px',
                  alignItems: 'center',
                  padding: '10px 16px',
                  borderRadius: 12,
                  background: active ? 'rgba(0, 229, 255, 0.08)' : 'transparent',
                  border: active ? '1px solid rgba(0, 229, 255, 0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--wx-surface-card)'; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Index / Equalizer */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {active && isPlaying ? (
                    <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14 }}>
                      {[6, 14, 10].map((h, i) => (
                        <div key={i} style={{ width: 2.5, height: h, background: 'var(--wx-cyan)', borderRadius: 2 }} />
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--wx-cyan)' : 'var(--wx-text-muted)' }}>
                      {idx + 1}
                    </span>
                  )}
                </div>

                {/* Title & Artist */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                  <img
                    src={track.cover} alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                    style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover' }}
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

                {/* Album */}
                <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {track.album || 'WaveX Hits'}
                </div>

                {/* Date Added */}
                <div style={{ fontSize: 12, color: 'var(--wx-text-muted)' }}>
                  {(track as any).dateAdded || 'Recently'}
                </div>

                {/* Duration */}
                <div style={{ fontSize: 12, color: active ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', textAlign: 'center', fontFamily: 'monospace' }}>
                  {formatTime(track.duration)}
                </div>

                {/* Like + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 2 }}
                  >
                    <Heart size={16} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setModalTrack(track); }}
                    title="Add to Playlist"
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

      {modalTrack && <AddToPlaylistModal track={modalTrack} onClose={() => setModalTrack(null)} />}
    </div>
  );
}
