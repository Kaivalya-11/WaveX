"use client";

import React, { useState } from 'react';
import {
  Camera, Edit3, Share2, Search, Bell, Sliders, Check, Music2,
  CheckCircle2, Radio, Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConnectedDevice } from '@/context/DeviceContext';
import { usePlaylists } from '@/context/PlaylistContext';
import { usePlayer } from '@/context/PlayerContext';

export default function DashboardView() {
  const { currentUser, logout } = useAuth();
  const { showPrompt } = useNotification();
  const { device } = useConnectedDevice();
  const { customPlaylists } = usePlaylists();
  const { liked, likedTracks } = usePlayer();

  const [dolbyAtmos, setDolbyAtmos] = useState(true);
  const [explicitContent, setExplicitContent] = useState(true);
  const [quality, setQuality] = useState('Lossless FLAC (24-bit / 192kHz)');
  const [editingProfile, setEditingProfile] = useState(false);
  const [name, setName] = useState(currentUser?.displayName || 'Kaivalya Gavaskar');

  const totalPlaylists = (customPlaylists?.length || 0) + 4;
  const totalLiked = likedTracks ? likedTracks.length : (liked ? liked.size : 0);
  const followingCount = 6; // Real count of followed artists

  const memberSince = currentUser?.metadata?.creationTime
    ? new Date(currentUser.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : 'Oct 2024';

  const photoURL = currentUser?.photoURL || (currentUser as any)?.providerData?.[0]?.photoURL;
  const avatarUrl = photoURL?.replace(/=s96-c/, "=s400-c") || `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400`;

  const handleSaveProfile = () => {
    setEditingProfile(false);
    showPrompt('Profile updated successfully', 'success');
  };

  return (
    <div style={{ padding: '24px 32px 100px', maxWidth: 1100, margin: '0 auto' }}>
      {/* 1. Top Header from Screenshot 4 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 800 }}>
          <span style={{ color: 'var(--wx-text-muted)' }}>Account</span>
          <span style={{ color: 'var(--wx-border)' }}>/</span>
          <span style={{ color: '#fff' }}>Profile &amp; Preferences</span>
        </div>

        {/* Center Search */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
          borderRadius: 12, padding: '8px 14px', width: 280,
        }}>
          <Search size={14} color="var(--wx-text-muted)" />
          <input
            type="text"
            placeholder="Search settings, audio devices, quality..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 12, width: '100%', fontFamily: 'inherit' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
            <Bell size={15} />
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0, 229, 255, 0.12)', border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 9999, padding: '5px 12px', color: 'var(--wx-cyan)', fontSize: 11, fontWeight: 800,
          }}>
            Syncs across all devices
          </div>
        </div>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.08) 0%, var(--wx-surface-card) 60%)',
        border: '1px solid rgba(0, 229, 255, 0.25)',
        borderRadius: 24, padding: '32px', marginBottom: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap' }}>
          {/* Avatar with Camera Icon */}
          <div style={{ position: 'relative', width: 110, height: 110, flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt=""
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=Kaivalya`; }}
              style={{
                width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover',
                border: '3px solid var(--wx-cyan)', boxShadow: '0 0 24px rgba(0,229,255,0.4)',
              }}
            />
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--wx-surface-card)', border: '1px solid var(--wx-cyan)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--wx-cyan)',
              cursor: 'pointer',
            }}>
              <Camera size={14} />
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <span style={{
                background: 'rgba(0, 229, 255, 0.15)', border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--wx-cyan)', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 9999,
              }}>
                PROFILE
              </span>
              <span style={{
                background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#10B981', fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 9999,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#10B981' }} />
                Wavex Hi-Fi Premium
              </span>
            </div>

            {editingProfile ? (
              <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ background: 'var(--wx-surface)', border: '1px solid var(--wx-cyan)', borderRadius: 8, padding: '6px 12px', color: '#fff', fontSize: 18, fontWeight: 900 }}
                />
                <button onClick={handleSaveProfile} style={{ background: 'var(--wx-cyan)', color: '#080C14', border: 'none', borderRadius: 8, padding: '6px 14px', fontWeight: 800, cursor: 'pointer' }}>
                  Save
                </button>
              </div>
            ) : (
              <h1 style={{ fontSize: 32, fontWeight: 900, color: '#fff', margin: '0 0 6px', letterSpacing: -0.5 }}>
                {name}
              </h1>
            )}

            <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', marginBottom: 16 }}>
              {currentUser?.email || 'kaivalyagavaskar1425@gmail.com'} <span style={{ margin: '0 4px' }}>•</span> Member since {memberSince}
            </div>

            {/* Counter Stats */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
              <div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginRight: 4 }}>{totalPlaylists}</span>
                <span style={{ fontSize: 12, color: 'var(--wx-text-muted)' }}>Playlists</span>
              </div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginRight: 4 }}>{totalLiked.toLocaleString()}</span>
                <span style={{ fontSize: 12, color: 'var(--wx-text-muted)' }}>Liked Songs</span>
              </div>
              <div>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#fff', marginRight: 4 }}>{followingCount}</span>
                <span style={{ fontSize: 12, color: 'var(--wx-text-muted)' }}>Following</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => setEditingProfile(!editingProfile)}
            style={{
              background: 'var(--wx-cyan)', color: '#080C14',
              border: 'none', borderRadius: 12, padding: '10px 20px',
              fontSize: 13, fontWeight: 900, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 0 16px rgba(0,229,255,0.3)',
            }}
          >
            <Edit3 size={15} /> Edit Profile
          </button>
          <button
            onClick={() => showPrompt('Profile link copied to clipboard', 'success')}
            style={{
              background: 'var(--wx-surface)', border: '1px solid var(--wx-border)',
              color: '#fff', borderRadius: 12, padding: '10px 18px',
              fontSize: 13, fontWeight: 800, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Share2 size={15} /> Share
          </button>
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: 0 }}>Audio &amp; Playback Settings</h2>
            <p style={{ fontSize: 13, color: 'var(--wx-text-muted)', margin: '4px 0 0' }}>
              Customize your playback fidelity, spatial audio, and content policies.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{
            background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'rgba(0, 229, 255, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Music2 size={20} color="var(--wx-cyan)" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Streaming &amp; Download Quality</span>
                  <span style={{ background: '#78350F', color: '#FBBF24', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>LOSSLESS AVAILABLE</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', marginTop: 2 }}>
                  Stream in pristine 24-bit/192kHz Studio Master quality on Wi-Fi and 5G.
                </div>
              </div>
            </div>

            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              style={{
                background: 'var(--wx-surface)', border: '1px solid rgba(0, 229, 255, 0.3)',
                color: 'var(--wx-cyan)', borderRadius: 10, padding: '8px 16px',
                fontSize: 12, fontWeight: 800, outline: 'none', cursor: 'pointer',
              }}
            >
              <option>Lossless FLAC (24-bit / 192kHz)</option>
              <option>High Fidelity (320 kbps)</option>
              <option>Standard AAC (160 kbps)</option>
            </select>
          </div>

          <div style={{
            background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Radio size={20} color="#A855F7" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Dolby Atmos &amp; Spatial 3D Audio</span>
                  <span style={{ background: '#581C87', color: '#D8B4FE', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 4 }}>Surround</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', marginTop: 2 }}>
                  Immersive multi-channel acoustics mapped specifically for {device.label} and studio headphones.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={dolbyAtmos}
              onChange={(e) => setDolbyAtmos(e.target.checked)}
              style={{ width: 22, height: 22, accentColor: 'var(--wx-cyan)', cursor: 'pointer' }}
            />
          </div>

          <div style={{
            background: 'var(--wx-surface-card)', border: '1px solid var(--wx-border)',
            borderRadius: 16, padding: '20px 24px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, background: 'rgba(255, 255, 255, 0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 13, color: '#fff',
              }}>
                18+
              </div>
              <div>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>Explicit Content</span>
                <div style={{ fontSize: 12, color: 'var(--wx-text-muted)', marginTop: 2 }}>
                  Allow explicit rated content and uncensored lyrical playback.
                </div>
              </div>
            </div>

            <input
              type="checkbox"
              checked={explicitContent}
              onChange={(e) => setExplicitContent(e.target.checked)}
              style={{ width: 22, height: 22, accentColor: 'var(--wx-cyan)', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
