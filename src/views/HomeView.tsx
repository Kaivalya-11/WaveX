"use client";

import React, { useEffect, useState } from 'react';
import {
  Sun, Moon, Sunrise, CloudSun, Play, Pause, Heart, Plus,
  Search, ChevronRight, Music2, Clock
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { Track, Playlist } from '@/types/music';
import { COVERS, ARTIST_PHOTOS, FEATURED_TRACK, POPULAR_ARTISTS_LIST, CORE_TRACKS, getFallbackCover } from '@/lib/mediaAssets';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const POPULAR_ARTISTS = POPULAR_ARTISTS_LIST;

const JUMP_BACK_IN_TRACKS: Track[] = CORE_TRACKS.slice(0, 6);

interface HomeViewProps {
  setActiveView: (view: string) => void;
  setActivePlaylist: (playlist: Playlist | null) => void;
}

export default function HomeView({ setActiveView, setActivePlaylist }: HomeViewProps) {
  const { currentTrack, isPlaying, playTrack, liked, toggleLike } = usePlayer();
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState('Browse');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredTrack = FEATURED_TRACK;

  const getGreeting = () => {
    const h = new Date().getHours();
    const name = currentUser ? `, ${currentUser.displayName?.split(' ')[0] || 'Kaivalya'}` : ', Kaivalya';
    if (h < 12) return { text: `Good Morning${name}`, icon: <Sunrise size={22} color="#ffd166" /> };
    if (h < 17) return { text: `Good Afternoon${name}`, icon: <CloudSun size={22} color="var(--wx-cyan)" /> };
    if (h < 21) return { text: `Good Evening${name}`, icon: <Sun size={22} color="#ff8500" /> };
    return { text: `Good Night${name}`, icon: <Moon size={22} color="#90e0ef" /> };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();

  const handleSubTabClick = (tab: string) => {
    setSubTab(tab);
    if (tab === 'Top 2024 Charts' || tab === 'New Releases') {
      setActiveView('search');
    }
  };

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Sub-navigation Bar from Screenshot 5 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {['Browse', 'Top 2024 Charts', 'New Releases', 'New Feed', 'Shuffle Play'].map(tab => (
            <button
              key={tab}
              onClick={() => handleSubTabClick(tab)}
              style={{
                background: 'none', border: 'none',
                color: subTab === tab ? '#fff' : 'var(--wx-text-muted)',
                fontSize: 13, fontWeight: subTab === tab ? 900 : 600,
                cursor: 'pointer', paddingBottom: 6,
                borderBottom: subTab === tab ? '2px solid var(--wx-cyan)' : '2px solid transparent',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
          borderRadius: 12, padding: '8px 14px', width: 260,
        }}>
          <Search size={14} color="var(--wx-text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveView('search');
              }
            }}
            placeholder="Search songs, artists, albums..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: '100%', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* 2. Greeting Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 28, fontWeight: 900, color: '#fff' }}>
          {greetingIcon}
          <span>{greetingText}</span>
        </div>
        <p style={{ color: 'var(--wx-text-muted)', fontSize: 13, margin: '6px 0 0' }}>
          Friday, October 23 
        </p>
      </div>

      {/* 3. Curated Featured Track Hero Card (Exact replica from Screenshot 5) */}
      <div
        onClick={() => playTrack(featuredTrack, JUMP_BACK_IN_TRACKS)}
        style={{
          background: 'linear-gradient(135deg, rgba(146, 64, 14, 0.4) 0%, var(--wx-surface-card) 60%)',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: 24, padding: '28px', marginBottom: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          cursor: 'pointer', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
          gap: 24, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, minWidth: 280 }}>
          <img
            src={featuredTrack.cover} alt=""
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(featuredTrack.id); }}
            style={{ width: 140, height: 140, borderRadius: 18, objectFit: 'cover', boxShadow: '0 12px 36px rgba(0,0,0,0.7)', flexShrink: 0 }}
          />
          <div>
            <span style={{
              display: 'inline-block', background: 'rgba(245, 158, 11, 0.2)',
              border: '1px solid rgba(245, 158, 11, 0.4)', color: '#FBBF24',
              fontSize: 10, fontWeight: 900, padding: '3px 8px', borderRadius: 9999,
              letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10,
            }}>
              ✦ CURATED FEATURED TRACK
            </span>

            <h2 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>
              {featuredTrack.title}
            </h2>

            <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', marginBottom: 12 }}>
              {featuredTrack.artist}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: 'var(--wx-text-muted)' }}>
              <span style={{ color: '#ef4444', fontWeight: 800 }}>♥ 83,012 Likes</span>
              <span>•</span>
              <span style={{ color: 'var(--wx-cyan)' }}>Malayalam Trending #1</span>
              <span>•</span>
              <span>3:33 min</span>
            </div>
          </div>
        </div>

        {/* Big Cyan Circular Pause/Play Button & Heart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0 }}>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(featuredTrack); }}
            title={liked.has(featuredTrack.id) ? "Remove from Liked Songs" : "Save to Liked Songs"}
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${liked.has(featuredTrack.id) ? 'var(--wx-cyan)' : 'rgba(255,255,255,0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: liked.has(featuredTrack.id) ? 'var(--wx-cyan)' : '#fff',
              cursor: 'pointer', transition: 'all 0.15s ease',
            }}
          >
            <Heart size={20} fill={liked.has(featuredTrack.id) ? 'var(--wx-cyan)' : 'none'} />
          </button>

          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: 'var(--wx-cyan)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 28px rgba(0,229,255,0.6)', flexShrink: 0,
          }}>
            {currentTrack?.id === featuredTrack.id && isPlaying ? (
              <Pause size={28} color="#080C14" />
            ) : (
              <Play size={28} color="#080C14" style={{ marginLeft: 3 }} />
            )}
          </div>
        </div>
      </div>

      {/* 4. Popular Artists (6 Circular Avatars with status tags) */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Popular Artists</h2>
          <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--wx-cyan)', cursor: 'pointer' }}>See all</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
          {POPULAR_ARTISTS.map(artist => (
            <div
              key={artist.name}
              onClick={() => setActiveView('search')}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                textAlign: 'center', cursor: 'pointer',
              }}
            >
              <img
                src={artist.img} alt=""
                style={{
                  width: 90, height: 90, borderRadius: '50%', objectFit: 'cover',
                  border: '2px solid rgba(255,255,255,0.1)', marginBottom: 8,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                }}
              />
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>{artist.name}</div>
              <div style={{ fontSize: 11, color: artist.subColor || 'var(--wx-text-muted)', marginTop: 2, fontWeight: 600 }}>
                {artist.sub}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Jump Back In & Your Playlists Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 28, alignItems: 'start' }}>
        {/* Left Column: Jump Back In */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
              <Clock size={15} color="var(--wx-cyan)" />
              Jump Back In
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--wx-cyan)', cursor: 'pointer' }}>See history</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {JUMP_BACK_IN_TRACKS.map((track) => {
              const active = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, JUMP_BACK_IN_TRACKS)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                    borderRadius: 14, background: active ? 'rgba(0,229,255,0.08)' : 'var(--wx-surface-card)',
                    border: `1px solid ${active ? 'rgba(0,229,255,0.25)' : 'var(--wx-border)'}`,
                    cursor: 'pointer',
                  }}
                >
                  <img
                    src={track.cover} alt=""
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(track.id); }}
                    style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover' }}
                  />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: active ? 'var(--wx-cyan)' : '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {track.artist}
                    </div>
                  </div>

                  <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', fontFamily: 'monospace' }}>
                    {formatTime(track.duration)}
                  </span>

                  <button
                    onClick={(e) => { e.stopPropagation(); toggleLike(track); }}
                    title={liked.has(track.id) ? "Unlike" : "Like"}
                    style={{ background: 'none', border: 'none', color: liked.has(track.id) ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', cursor: 'pointer', padding: 4 }}
                  >
                    <Heart size={16} fill={liked.has(track.id) ? 'var(--wx-cyan)' : 'none'} />
                  </button>

                  <button
                    onClick={(e) => { e.stopPropagation(); playTrack(track, JUMP_BACK_IN_TRACKS); }}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 4 }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Your Playlists */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: 1, color: '#fff' }}>
              Your Playlists
            </div>
            <span
              onClick={() => setActiveView('playlist')}
              style={{ fontSize: 11, fontWeight: 700, color: 'var(--wx-cyan)', cursor: 'pointer' }}
            >
              View All
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div
              onClick={() => {
                setActivePlaylist({ id: 'trending', name: 'Trending Now', tracks: [] });
                setActiveView('playlist');
              }}
              style={{
                background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
                borderRadius: 16, padding: '16px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: '100%', aspectRatio: '1/1', borderRadius: 12,
                background: 'linear-gradient(135deg, #00E5FF, #0070F3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Music2 size={32} color="#080C14" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Trending...</div>
              <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', marginTop: 2 }}>3 tracks • Malayalam</div>
            </div>

            <div
              onClick={() => {
                setActivePlaylist({ id: 'top-malayalam', name: 'Top Hits Malayalam', tracks: [] });
                setActiveView('playlist');
              }}
              style={{
                background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
                borderRadius: 16, padding: '16px', cursor: 'pointer',
              }}
            >
              <div style={{
                width: '100%', aspectRatio: '1/1', borderRadius: 12,
                background: 'linear-gradient(135deg, #7928CA, #4C1D95)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12,
              }}>
                <Play size={28} fill="#fff" color="#fff" />
              </div>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff' }}>Top Hits...</div>
              <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', marginTop: 2 }}>18 tracks • Mixed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
