import React, { useEffect, useState, useCallback, useRef } from 'react';
import { LayoutGrid, List, X, Search as SearchIcon, Play, Pause, Heart } from 'lucide-react';
import { searchTracks } from '../services/api';
import { usePlayer } from '../context/PlayerContext';

function formatTime(s) {
  if (!s || isNaN(s)) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── List Result Row ───────────────────────────────────────────────────────────
function ResultRow({ track, allTracks, index }) {
  const { currentTrack, isPlaying, playTrack, liked, toggleLike } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const isLiked = liked?.has(track.id);
  const [hovered, setHovered] = useState(false);

  const handleImageError = (e) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200';
  };

  return (
    <div
      onClick={() => playTrack(track, allTracks)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '40px 56px 1fr auto auto',
        alignItems: 'center',
        gap: 16,
        padding: '10px 16px',
        borderRadius: 10,
        background: isActive ? 'rgba(0,180,216,0.1)' : hovered ? 'rgba(255,255,255,0.06)' : 'transparent',
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        border: isActive ? '1px solid rgba(0,180,216,0.2)' : '1px solid transparent',
        position: 'relative',
      }}
    >
      {/* Index / Play icon */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, color: isActive ? '#00b4d8' : '#8d99ae', fontFamily: 'monospace', fontWeight: 700,
      }}>
        {isActive && isPlaying ? (
          <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 3, background: '#00b4d8', borderRadius: 2,
                animation: `soundbar${i} 0.8s ease infinite`,
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
          </div>
        ) : hovered ? (
          <Play size={16} color="#fff" style={{ marginLeft: 2 }} />
        ) : (
          <span style={{ color: isActive ? '#00b4d8' : '#4a5568' }}>{index + 1}</span>
        )}
      </div>

      {/* Album Art */}
      <div style={{ position: 'relative', width: 56, height: 56, flexShrink: 0 }}>
        <img
          src={track.cover}
          alt=""
          onError={handleImageError}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
        />
      </div>

      {/* Title + Artist */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: isActive ? '#00b4d8' : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 13, color: '#8d99ae', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {track.artist}
        </div>
      </div>

      {/* Duration */}
      <div style={{ fontSize: 13, color: '#8d99ae', fontFamily: 'monospace', fontWeight: 500 }}>
        {formatTime(track.duration)}
      </div>

      {/* Like button */}
      <button
        onClick={e => { e.stopPropagation(); toggleLike?.(track); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 8,
          color: isLiked ? '#00b4d8' : '#8d99ae', opacity: hovered || isLiked ? 1 : 0,
          transition: 'opacity 0.15s ease, color 0.15s ease',
        }}
        aria-label={isLiked ? `Unlike ${track.title}` : `Like ${track.title}`}
      >
        <Heart size={18} fill={isLiked ? '#00b4d8' : 'none'} color={isLiked ? '#00b4d8' : '#8d99ae'} />
      </button>
    </div>
  );
}

// ─── Grid Card ────────────────────────────────────────────────────────────────
function GridCard({ track, allTracks }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onClick={() => playTrack(track, allTracks)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isActive ? 'rgba(0,180,216,0.1)' : hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        borderRadius: 14, padding: 16, cursor: 'pointer',
        transition: 'all 0.18s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        border: isActive ? '1px solid rgba(0,180,216,0.2)' : '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', marginBottom: 12 }}>
        <img
          src={track.cover}
          alt=""
          onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'; }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, display: 'block' }}
        />
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {isActive && isPlaying
              ? <Pause size={32} color="#fff" />
              : <Play size={32} color="#fff" style={{ marginLeft: 4 }} />}
          </div>
        )}
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, color: isActive ? '#00b4d8' : '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {track.title}
      </div>
      <div style={{ fontSize: 12, color: '#8d99ae', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {track.artist}
      </div>
    </div>
  );
}

// ─── Browse All genre grid ─────────────────────────────────────────────────────
const GENRES = [
  { name: 'Pop', color: '#e63946' }, { name: 'Hip-Hop', color: '#f4a261' },
  { name: 'Electronic', color: '#7b2d8b' }, { name: 'Rock', color: '#c1121f' },
  { name: 'R&B', color: '#e76f51' }, { name: 'Jazz', color: '#1d8f8f' },
  { name: 'Classical', color: '#2d6a9f' }, { name: 'Indie', color: '#2d6a4f' },
  { name: 'Latin', color: '#d62828' }, { name: 'K-Pop', color: '#c77dff' },
  { name: 'Chill', color: '#3a86ff' }, { name: 'Workout', color: '#118ab2' },
];

function BrowseAll() {
  return (
    <div>
      <h2 style={{ fontSize: 'clamp(20px, 2.5vw, 28px)', fontWeight: 900, marginBottom: 24 }}>Browse All</h2>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
        gap: 16,
      }}>
        {GENRES.map(genre => (
          <div
            key={genre.name}
            style={{
              background: `linear-gradient(145deg, ${genre.color}cc, ${genre.color}44)`,
              borderRadius: 14, padding: 20, cursor: 'pointer',
              height: 100, position: 'relative', overflow: 'hidden',
              border: `1px solid ${genre.color}40`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = `0 12px 30px ${genre.color}40`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: '#fff', position: 'relative', zIndex: 1 }}>{genre.name}</div>
            <div style={{
              position: 'absolute', right: -16, bottom: -16, fontSize: 72, fontWeight: 900,
              color: '#fff', opacity: 0.12, lineHeight: 1, userSelect: 'none',
            }}>
              {genre.name[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchView({ search }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    try { return localStorage.getItem('wavex_search_view') || 'list'; } catch { return 'list'; }
  });

  const handleViewChange = (mode) => {
    setViewMode(mode);
    try { localStorage.setItem('wavex_search_view', mode); } catch { /* ignore */ }
  };

  const runSearch = useCallback(async () => {
    if (!search?.trim()) { setResults([]); setError(null); return; }
    setLoading(true); setError(null);
    try {
      const data = await searchTracks(search);
      setResults(data || []);
    } catch (err) {
      setResults([]);
      setError(err.message?.includes('HTTP') ? 'Unable to load results. Please try again.' : 'Cannot reach music service. Check your network.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { runSearch(); }, [runSearch]);

  const px = 'clamp(16px, 3vw, 40px)';

  return (
    <div style={{ padding: `20px ${px} 100px` }}>
      <style>{`
        @keyframes soundbar0 { 0%,100%{height:8px}50%{height:20px} }
        @keyframes soundbar1 { 0%,100%{height:16px}50%{height:8px} }
        @keyframes soundbar2 { 0%,100%{height:12px}50%{height:20px} }
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:.8} }
      `}</style>

      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          {search
            ? <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 900, margin: 0 }}>
                Search results for <span style={{ color: '#00b4d8' }}>"{search}"</span>
              </h1>
            : <h1 style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', fontWeight: 900, margin: 0 }}>Search</h1>
          }
          {!loading && results.length > 0 && (
            <div style={{ color: '#8d99ae', fontSize: 13, marginTop: 6 }}>
              {results.length} track{results.length !== 1 ? 's' : ''} found
            </div>
          )}
        </div>

        {/* View toggle — only show if there are results */}
        {results.length > 0 && (
          <div role="group" aria-label="View mode" style={{
            display: 'flex', background: 'rgba(255,255,255,0.04)',
            borderRadius: 10, padding: 4, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            {[
              { id: 'list', Icon: List, label: 'List' },
              { id: 'grid', Icon: LayoutGrid, label: 'Grid' },
            ].map(({ id, Icon, label }) => (
              <button
                key={id}
                onClick={() => handleViewChange(id)}
                aria-pressed={viewMode === id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 7, border: 'none',
                  background: viewMode === id ? 'rgba(0,180,216,0.15)' : 'transparent',
                  color: viewMode === id ? '#00b4d8' : '#8d99ae',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={16} /> {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array(6).fill(null).map((_, i) => (
            <div key={i} style={{
              height: 76, borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease infinite',
              animationDelay: `${i * 0.08}s`,
            }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <>
          {search && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
              padding: '12px 16px', background: 'rgba(0,180,216,0.06)',
              borderRadius: 10, border: '1px solid rgba(0,180,216,0.15)',
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                background: results[0]?.cover ? 'none' : 'rgba(0,180,216,0.2)',
              }}>
                {results[0]?.cover && <img src={results[0].cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: '#00b4d8', textTransform: 'uppercase', marginBottom: 4 }}>
                  Top Result
                </div>
                <div style={{ fontWeight: 900, fontSize: 15 }}>{results[0]?.title}</div>
                <div style={{ fontSize: 13, color: '#8d99ae' }}>{results[0]?.artist}</div>
              </div>
            </div>
          )}

          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            flexDirection: viewMode === 'list' ? 'column' : 'row',
            gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(160px, 1fr))' : 'none',
            gap: viewMode === 'grid' ? 16 : 2,
          }}>
            {results.map((track, i) => viewMode === 'grid'
              ? <GridCard key={track.id} track={track} allTracks={results} />
              : <ResultRow key={track.id} track={track} allTracks={results} index={i} />
            )}
          </div>
        </>
      )}

      {/* Empty state - browse */}
      {!search && !loading && <BrowseAll />}

      {/* No results */}
      {search && !loading && !error && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <SearchIcon size={48} color="#1d2d44" style={{ marginBottom: 16 }} />
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>No results found</div>
          <div style={{ color: '#8d99ae', fontSize: 14 }}>Try a different search term</div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ color: '#ff4d4d', fontSize: 16, fontWeight: 600, marginBottom: 20 }}>{error}</div>
          <button
            onClick={runSearch}
            style={{
              background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.3)',
              color: '#ff4d4d', padding: '10px 28px', borderRadius: 24,
              fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}