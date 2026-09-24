import React, { useEffect, useState, useRef } from 'react';
import { Sun, Moon, Sunrise, CloudSun, Play, Pause, Music2, TrendingUp, Clock, Headphones } from 'lucide-react';
import { fetchFeaturedTracks, getDefaultTracks, searchTracks, PLAYLISTS } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';

function formatTime(s) {
  if (!s || isNaN(s)) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

// ─── Track Card (compact rectangular) ──────────────────────────────────────────
function QuickCard({ track, queue }) {
  const { currentTrack, isPlaying, playTrack } = usePlayer();
  const isActive = currentTrack?.id === track.id;

  const [hovered, setHovered] = useState(false);
  const handleImageError = (e) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200';
  };

  return (
    <div
      onClick={() => playTrack(track, queue)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: isActive ? 'rgba(0,180,216,0.12)' : hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'background 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
        border: isActive ? '1px solid rgba(0,180,216,0.2)' : '1px solid transparent',
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <img
          src={track.cover}
          alt=""
          onError={handleImageError}
          style={{ width: 52, height: 52, borderRadius: 8, objectFit: 'cover', display: 'block' }}
        />
        {(hovered || isActive) && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {isActive && isPlaying
              ? <Pause size={20} color="#fff" />
              : <Play size={18} color="#fff" style={{ marginLeft: 2 }} />}
          </div>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14, fontWeight: 700,
          color: isActive ? '#00b4d8' : '#fff',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {track.title}
        </div>
        <div style={{
          fontSize: 12, color: '#8d99ae', marginTop: 2,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
        }}>
          {track.artist}
        </div>
      </div>
      {track.duration && (
        <div style={{ fontSize: 12, color: '#8d99ae', fontFamily: 'monospace', flexShrink: 0 }}>
          {formatTime(track.duration)}
        </div>
      )}
      {isActive && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
          background: '#00b4d8', borderRadius: '10px 0 0 10px'
        }} />
      )}
    </div>
  );
}

// ─── Music Card (vertical, for playlists / albums) ──────────────────────────
function MusicCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.03)',
        borderRadius: 14,
        padding: 16,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      <div style={{
        width: '100%', aspectRatio: '1/1', borderRadius: 10, overflow: 'hidden',
        background: 'linear-gradient(135deg, #003049, #001d3d)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14, boxShadow: hovered ? '0 12px 30px rgba(0,0,0,0.5)' : '0 6px 16px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.2s ease',
      }}>
        {item.cover
          ? <img src={item.cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={e => { e.currentTarget.style.display = 'none'; }} />
          : <Music2 size={40} color="#00b4d8" style={{ opacity: 0.8 }} />
        }
      </div>
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.name || item.title}
      </div>
      <div style={{ fontSize: 12, color: '#8d99ae', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {item.desc || item.artist || 'WaveX'}
      </div>
    </div>
  );
}

// ─── Section Label ───────────────────────────────────────────────────────────
function SectionTitle({ children, icon }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      {icon && <span style={{ color: '#00b4d8' }}>{icon}</span>}
      <h2 style={{ fontSize: 'clamp(18px, 2vw, 24px)', fontWeight: 900, margin: 0, letterSpacing: -0.5 }}>
        {children}
      </h2>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 16,
      animation: 'pulse 1.5s ease infinite',
    }}>
      <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: 10, background: 'rgba(255,255,255,0.05)', marginBottom: 14 }} />
      <div style={{ height: 14, width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: 4, marginBottom: 8 }} />
      <div style={{ height: 12, width: '55%', background: 'rgba(255,255,255,0.03)', borderRadius: 4 }} />
    </div>
  );
}

export default function HomeView({ setActiveView, setActivePlaylist }) {
  const [featuredTracks, setFeaturedTracks] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newTracks, setNewTracks] = useState([]);
  const [suggestionLabel, setSuggestionLabel] = useState('Recommended for You');
  const [loading, setLoading] = useState(true);

  const player = usePlayer() || {};
  const { playTrack, recentlyPlayed = [], currentTrack, isPlaying } = player;
  const { currentUser } = useAuth();
  const { customPlaylists } = usePlaylists();

  // Load core data
  useEffect(() => {
    async function loadData() {
      try {
        const [featured, top, newMusic] = await Promise.all([
          fetchFeaturedTracks(),
          getDefaultTracks(),
          searchTracks('new music 2024'),
        ]);
        setFeaturedTracks(featured || []);
        setTopTracks(top || []);
        setNewTracks(newMusic?.slice(0, 8) || []);
      } catch (err) {
        console.error('HomeView load error:', err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Dynamic suggestions based on listening behavior
  useEffect(() => {
    async function loadSuggestions() {
      try {
        let query = 'top hits 2024';
        let label = 'Recommended for You';

        if (currentTrack?.artist) {
          query = `${currentTrack.artist} similar songs`;
          label = `More like ${currentTrack.title}`;
        } else if (recentlyPlayed.length > 0) {
          const recent = recentlyPlayed[0];
          query = `${recent.artist} songs`;
          label = `Because you listened to ${recent.artist}`;
        }

        setSuggestionLabel(label);
        const results = await searchTracks(query);
        if (results?.length) setRecommendations(results.slice(0, 8));
      } catch (err) {
        console.error('Suggestion error:', err);
      }
    }
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack?.id, recentlyPlayed.length > 0 ? recentlyPlayed[0].id : null]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const name = currentUser ? `, ${currentUser.displayName?.split(' ')[0] || ''}` : '';
    if (hour < 12) return { text: `Good Morning${name}`, icon: <Sunrise size={24} color="#ffd166" /> };
    if (hour < 17) return { text: `Good Afternoon${name}`, icon: <CloudSun size={24} color="#00b4d8" /> };
    if (hour < 21) return { text: `Good Evening${name}`, icon: <Sun size={24} color="#ff8500" /> };
    return { text: `Good Night${name}`, icon: <Moon size={24} color="#90e0ef" /> };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();
  const featured = featuredTracks[0];
  const featuredQueue = featuredTracks.slice(0, 10);
  const allPlaylists = [...customPlaylists, ...PLAYLISTS];

  return (
    <div style={{
      padding: 'clamp(16px, 2.5vw, 40px) clamp(16px, 3vw, 48px) 100px',
      display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 4vw, 56px)',
    }}>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4}50%{opacity:.8} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* ─── Greeting ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontSize: 'clamp(22px, 3vw, 38px)', fontWeight: 900, letterSpacing: -0.8
          }}>
            {greetingIcon} {greetingText}
          </div>
          <div style={{ color: '#8d99ae', fontSize: 14, marginTop: 6 }}>
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ─── Featured Hero Banner ──────────────────────── */}
      {loading ? (
        <div style={{
          height: 'clamp(180px, 22vh, 300px)', borderRadius: 20,
          background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease infinite'
        }} />
      ) : featured && (
        <div
          onClick={() => playTrack && playTrack(featured, featuredQueue)}
          style={{
            position: 'relative', borderRadius: 20, overflow: 'hidden',
            height: 'clamp(180px, 22vh, 300px)', cursor: 'pointer',
            transition: 'transform 0.25s ease, box-shadow 0.25s ease',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.008)'; e.currentTarget.style.boxShadow = '0 28px 80px rgba(0,0,0,0.7)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.6)'; }}
        >
          {/* Background art */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${featured.cover})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            filter: 'blur(8px) brightness(0.45)',
            transform: 'scale(1.1)',
          }} />
          {/* Gradient overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(90deg, rgba(0,11,24,0.85) 0%, rgba(0,11,24,0.4) 50%, rgba(0,11,24,0.1) 100%)',
          }} />

          {/* Content */}
          <div style={{
            position: 'relative', zIndex: 2,
            height: '100%', display: 'flex', alignItems: 'center', gap: 'clamp(20px, 3vw, 40px)',
            padding: 'clamp(20px, 3vw, 40px)',
          }}>
            <img
              src={featured.cover}
              alt={featured.title}
              style={{
                height: 'clamp(100px, 14vh, 200px)', width: 'clamp(100px, 14vh, 200px)',
                borderRadius: 14, objectFit: 'cover',
                boxShadow: '0 16px 48px rgba(0,0,0,0.7)',
                flexShrink: 0,
              }}
              onError={e => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400'; }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 11, fontWeight: 800, letterSpacing: 2.5,
                textTransform: 'uppercase', color: '#00b4d8', marginBottom: 10
              }}>
                ✦ Featured Track
              </div>
              <div style={{
                fontSize: 'clamp(20px, 3.5vw, 48px)', fontWeight: 900,
                lineHeight: 1.05, letterSpacing: -1, marginBottom: 8,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {featured.title}
              </div>
              <div style={{ fontSize: 'clamp(14px, 1.5vw, 20px)', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                {featured.artist}
              </div>
            </div>
            <button
              onClick={e => { e.stopPropagation(); playTrack && playTrack(featured, featuredQueue); }}
              style={{
                width: 'clamp(48px, 5vw, 72px)', height: 'clamp(48px, 5vw, 72px)',
                borderRadius: '50%', background: '#00b4d8', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,180,216,0.5)',
                flexShrink: 0, transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {currentTrack?.id === featured.id && isPlaying
                ? <Pause size={28} color="#000" />
                : <Play size={28} color="#000" style={{ marginLeft: 3 }} />}
            </button>
          </div>
        </div>
      )}

      {/* ─── Two-column layout for track lists + sidebar ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
        gap: 'clamp(20px, 3vw, 48px)',
        alignItems: 'start',
      }}>
        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(28px, 3.5vw, 48px)' }}>

          {/* Jump Back In (Recently Played) */}
          {recentlyPlayed.length > 0 && (
            <section>
              <SectionTitle icon={<Clock size={18} />}>Jump Back In</SectionTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 10,
              }}>
                {recentlyPlayed.slice(0, 6).map(track => (
                  <QuickCard key={track.id} track={track} queue={recentlyPlayed} />
                ))}
              </div>
            </section>
          )}

          {/* Trending Mix */}
          {(loading ? Array(5).fill(null) : topTracks.slice(0, 8)).length > 0 && (
            <section>
              <SectionTitle icon={<TrendingUp size={18} />}>Trending Mix</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {loading
                  ? Array(5).fill(null).map((_, i) => (
                    <div key={i} style={{ height: 72, borderRadius: 10, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease infinite' }} />
                  ))
                  : topTracks.slice(0, 8).map(track => (
                    <QuickCard key={track.id} track={track} queue={topTracks} />
                  ))}
              </div>
            </section>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <section>
              <SectionTitle icon={<Headphones size={18} />}>{suggestionLabel}</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recommendations.slice(0, 6).map(track => (
                  <QuickCard key={track.id} track={track} queue={recommendations} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN — Playlists + New Music */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(28px, 3.5vw, 48px)' }}>
          {/* Your Playlists */}
          {allPlaylists.length > 0 && (
            <section>
              <SectionTitle>Your Playlists</SectionTitle>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: 16,
              }}>
                {loading
                  ? Array(4).fill(null).map((_, i) => <SkeletonCard key={i} />)
                  : allPlaylists.slice(0, 6).map(pl => (
                    <MusicCard
                      key={pl.id}
                      item={{ ...pl, desc: `${pl.tracks?.length || pl.songs?.length || 0} songs` }}
                      onClick={() => {
                        if (setActiveView) setActiveView('playlist');
                        if (setActivePlaylist) setActivePlaylist(pl);
                      }}
                    />
                  ))}
              </div>
            </section>
          )}

          {/* Discover New */}
          {newTracks.length > 0 && (
            <section>
              <SectionTitle>New Releases</SectionTitle>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {newTracks.slice(0, 5).map(track => (
                  <QuickCard key={track.id} track={track} queue={newTracks} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}