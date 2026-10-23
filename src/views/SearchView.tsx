"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search as SearchIcon, Mic, Command, X, Play, Pause, Heart,
  DownloadCloud, LayoutGrid, List, Sparkles, CheckCircle2,
  Clock, Flame, Headphones, Disc3, Radio, Compass, Loader2, Plus
} from 'lucide-react';
import { searchTracks } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { Track } from '@/types/music';
import { getFallbackCover } from '@/lib/mediaAssets';
import AddToPlaylistModal from '@/components/AddToPlaylistModal';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const FILTER_PILLS = ['All', 'Tracks', 'Artists', 'Albums', 'Playlists', 'Podcasts'];

const TRENDING_TAGS = [
  '#Aavesham',
  '#TheWeeknd',
  '#MalayalamHipHop',
  '#AfterHours',
  '#Synthwave2024',
];

const CATEGORIES = [
  { name: 'Pop', sub: 'Top 50 • Global Hits', color: '#991B1B', initial: 'P' },
  { name: 'Hip-Hop & Rap', sub: 'Beats • Bars • Street', color: '#92400E', initial: 'H' },
  { name: 'Electronic', sub: 'EDM • House • Techno', color: '#5B21B6', initial: 'E' },
  { name: 'Rock & Metal', sub: 'Classic • Modern • Alt', color: '#7F1D1D', initial: 'R' },
  { name: 'R&B & Soul', sub: 'Grooves • Neo-Soul', color: '#78350F', initial: 'S' },
  { name: 'Jazz & Blues', sub: 'Bebop • Smooth • Blue Note', color: '#115E59', initial: 'J' },
  { name: 'Classical', sub: 'Symphony • Piano • Solo', color: '#1E3A8A', initial: 'C' },
  { name: 'Indie', sub: 'Acoustic • Dream Pop', color: '#065F46', initial: 'I' },
  { name: 'Latin', sub: 'Reggaeton • Salsa • Bachata', color: '#831843', initial: 'L' },
  { name: 'K-Pop', sub: 'Idol Hits • OST • Global', color: '#581C87', initial: 'K' },
  { name: 'Chill', sub: 'Ambient • Study • Relax', color: '#1E40AF', initial: 'C' },
  { name: 'Workout', sub: 'High BPM • Motivation', color: '#155E75', initial: 'W' },
];

const RECENT_SEARCHES = [
  { label: 'Illuminati', tag: 'Song', iconSeed: 'IL', color: '#00E5FF' },
  { label: 'The Weeknd', tag: 'Artist', iconSeed: 'TW', color: '#EF4444' },
  { label: 'Sushin Shyam', tag: 'Composer', iconSeed: 'SS', color: '#10B981' },
  { label: 'Aujla', tag: 'Artist', iconSeed: 'KA', color: '#F97316' },
];

interface SearchViewProps {
  search: string;
  onSearchChange?: (q: string) => void;
}

export default function SearchView({ search, onSearchChange }: SearchViewProps) {
  const { currentTrack, isPlaying, playTrack, liked, toggleLike } = usePlayer();
  const { downloadedTracks, addDownload } = usePlaylists();
  const { showPrompt } = useNotification();

  const [localInput, setLocalInput] = useState(search || '');
  const [activePill, setActivePill] = useState('All');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());
  const [modalTrack, setModalTrack] = useState<Track | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setLocalInput(search || '');
  }, [search]);

  const executeSearch = useCallback(async (query: string) => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchTracks(q);
      setResults(data || []);
    } catch (err: any) {
      setResults([]);
      setError('Unable to load tracks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    executeSearch(search || '');
  }, [search, executeSearch]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) onSearchChange(localInput);
    else executeSearch(localInput);
  };

  const handleSelectQuery = (q: string) => {
    setLocalInput(q);
    if (onSearchChange) onSearchChange(q);
    else executeSearch(q);
  };

  const handleClear = () => {
    setLocalInput('');
    if (onSearchChange) onSearchChange('');
    setResults([]);
    setError(null);
    inputRef.current?.focus();
  };

  const handleDownloadTrack = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if (downloadingIds.has(track.id)) return;
    setDownloadingIds(prev => new Set(prev).add(track.id));
    try {
      await addDownload(track);
      showPrompt(`"${track.title}" saved to downloads`, 'success');
    } catch {
      showPrompt(`Failed to save "${track.title}"`, 'error');
    } finally {
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(track.id);
        return next;
      });
    }
  };

  const isTrackDownloaded = (id: string) => downloadedTracks.some(t => t.id === id);

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Top Breadcrumb Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>
          <span style={{ color: 'var(--wx-text-muted)' }}>WAVEX SUITE</span>
          <span style={{ color: 'var(--wx-border)' }}>/</span>
          <span style={{ color: 'var(--wx-cyan)' }}>SEARCH &amp; BROWSE</span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.25)',
          borderRadius: 9999, padding: '4px 12px',
          color: '#10B981', fontSize: 11, fontWeight: 800,
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', boxShadow: '0 0 6px #10B981' }} />
          Ultra Audio Engine: Active
        </div>
      </div>

      {/* 2. Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
        <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 42px)', fontWeight: 900, margin: 0, color: '#fff', letterSpacing: -0.5 }}>
          Explore Music
        </h1>
        <span style={{
          background: 'var(--wx-surface-card)',
          border: '1px solid var(--wx-border)',
          borderRadius: 9999, padding: '4px 12px',
          fontSize: 12, fontWeight: 700, color: 'var(--wx-text-muted)',
        }}>
          120M+ tracks
        </span>
      </div>

      {/* 3. Large Search Input with ⌘K & Mic */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%', marginBottom: 16 }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          background: 'var(--wx-surface-card)',
          border: '1px solid var(--wx-border)',
          borderRadius: 16, padding: '14px 20px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <SearchIcon size={20} color="var(--wx-text-muted)" style={{ flexShrink: 0, marginRight: 14 }} />
          <input
            ref={inputRef}
            type="text"
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
            placeholder="Search songs, artists, albums, podcasts, or genres..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: '#fff', fontSize: 15, fontWeight: 600, fontFamily: 'inherit',
            }}
          />
          {localInput ? (
            <button
              type="button"
              onClick={handleClear}
              style={{ background: 'none', border: 'none', color: 'var(--wx-text-muted)', cursor: 'pointer', padding: 4, marginRight: 8 }}
            >
              <X size={16} />
            </button>
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.06)', borderRadius: 6,
              padding: '2px 8px', fontSize: 11, fontWeight: 700, color: 'var(--wx-text-muted)', marginRight: 12,
            }}>
              <Command size={12} /> K
            </div>
          )}
          <Mic size={18} color="var(--wx-text-muted)" style={{ cursor: 'pointer', flexShrink: 0 }} />
        </div>
      </form>

      {/* 4. Filter Pills */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {FILTER_PILLS.map(pill => {
          const isActive = activePill === pill;
          return (
            <button
              key={pill}
              onClick={() => setActivePill(pill)}
              style={{
                background: isActive ? 'var(--wx-cyan)' : 'var(--wx-surface-card)',
                color: isActive ? '#080C14' : 'var(--wx-text-muted)',
                border: `1px solid ${isActive ? 'var(--wx-cyan)' : 'var(--wx-border)'}`,
                borderRadius: 9999, padding: '6px 18px',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pill}
            </button>
          );
        })}
      </div>

      {/* 5. Trending Tags */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wx-text-muted)', marginRight: 4 }}>
          TRENDING TAGS:
        </span>
        {TRENDING_TAGS.map(tag => (
          <button
            key={tag}
            onClick={() => handleSelectQuery(tag.replace('#', ''))}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--wx-border)',
              borderRadius: 8, padding: '4px 10px',
              fontSize: 12, fontWeight: 700, color: 'var(--wx-cyan)',
              cursor: 'pointer',
            }}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 32 }}>
          {Array(5).fill(null).map((_, i) => (
            <div key={i} style={{ height: 68, borderRadius: 14, background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)', animation: 'pulse 1.2s infinite' }} />
          ))}
        </div>
      )}

      {/* Active Search Results Table */}
      {!loading && results.length > 0 && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginBottom: 16 }}>
            Top Results ({results.length})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {results.map((track, idx) => {
              const active = currentTrack?.id === track.id;
              const isLiked = liked.has(track.id);
              const isDl = isTrackDownloaded(track.id);

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, results)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 48px 1fr 100px 80px',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 16px',
                    borderRadius: 14,
                    background: active ? 'rgba(0,229,255,0.08)' : 'var(--wx-surface-card)',
                    border: `1px solid ${active ? 'rgba(0,229,255,0.25)' : 'var(--wx-border)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: active ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', textAlign: 'center' }}>
                    {idx + 1}
                  </span>

                  <img
                    src={track.cover} alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: active ? 'var(--wx-cyan)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                      {track.artist}
                    </div>
                  </div>

                  <span style={{ fontSize: 12, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>
                    {formatTime(track.duration)}
                  </span>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 6 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                      title={isLiked ? "Unlike" : "Like"}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 4 }}
                    >
                      <Heart size={16} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => handleDownloadTrack(e, track)}
                      title="Download"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDl ? '#10B981' : 'var(--wx-text-muted)', padding: 4 }}
                    >
                      <DownloadCloud size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setModalTrack(track); }}
                      title="Add to Playlist"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wx-text-muted)', padding: 4 }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 6. Browse All Categories (12 Cards with large watermark letters from screenshot) */}
      {!search && !loading && (
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>Browse All Categories</h2>
              <p style={{ fontSize: 13, color: 'var(--wx-text-muted)', margin: '4px 0 0' }}>
                Explore curated sonic landscapes, top charts &amp; global moods
              </p>
            </div>
            <button
              onClick={() => handleSelectQuery('Top Charts')}
              style={{ background: 'none', border: 'none', color: 'var(--wx-cyan)', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
            >
              View All 36 Moods →
            </button>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: 14,
          }}>
            {CATEGORIES.map(cat => (
              <div
                key={cat.name}
                onClick={() => handleSelectQuery(cat.name)}
                style={{
                  background: cat.color,
                  borderRadius: 16,
                  padding: '16px 14px',
                  minHeight: 120,
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'transform 0.15s ease',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <div style={{ zIndex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 600 }}>
                    {cat.sub}
                  </div>
                </div>

                {/* Big watermark letter in the corner */}
                <div style={{
                  position: 'absolute', right: -6, bottom: -14,
                  fontSize: 70, fontWeight: 900, color: '#fff',
                  opacity: 0.15, lineHeight: 1, userSelect: 'none', pointerEvents: 'none',
                }}>
                  {cat.initial}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Recent Searches Chips */}
      {!search && !loading && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--wx-text-muted)' }}>
              <Clock size={13} color="var(--wx-cyan)" />
              Recent Searches
            </div>
            <button
              onClick={() => {}}
              style={{ background: 'none', border: 'none', color: 'var(--wx-text-muted)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              Clear history
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {RECENT_SEARCHES.map(item => (
              <div
                key={item.label}
                onClick={() => handleSelectQuery(item.label)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--wx-surface-card)',
                  border: '1px solid var(--wx-border)',
                  borderRadius: 12, padding: '8px 14px',
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  width: 24, height: 24, borderRadius: 6, background: item.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900, color: '#080C14',
                }}>
                  {item.iconSeed}
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{item.label}</span>
                <span style={{ fontSize: 11, color: 'var(--wx-text-muted)' }}>• {item.tag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {modalTrack && <AddToPlaylistModal track={modalTrack} onClose={() => setModalTrack(null)} />}
    </div>
  );
}
