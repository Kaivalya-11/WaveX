"use client";

import React, { useRef, useState, useEffect } from 'react';
import {
  Heart, DownloadCloud, Shuffle, SkipBack, SkipForward,
  Play, Pause, Repeat, Repeat1, Mic, Volume2, VolumeX,
  Plus, Loader2, ChevronDown, ListMusic, Headphones
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNotification } from '../context/NotificationContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useConnectedDevice } from '@/context/DeviceContext';
import AddToPlaylistModal from './AddToPlaylistModal';
import { getFallbackCover } from '@/lib/mediaAssets';

function formatTime(s: number): string {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

// Waveform tick bar heights
const WAVE_BARS = [
  8, 14, 10, 18, 22, 16, 12, 20, 24, 18, 14, 8, 12, 16, 22, 24,
  18, 12, 16, 20, 14, 8, 14, 18, 22, 16, 12, 20, 16, 12, 18, 14,
  8, 12, 16, 22, 18, 14, 10, 16, 12, 8
];

interface WaveformSeekBarProps {
  progress: number;
  duration: number;
  onSeek: (time: number) => void;
}

function WaveformSeekBar({ progress, duration, onSeek }: WaveformSeekBarProps) {
  const waveRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const pct = duration ? Math.min(1, Math.max(0, progress / duration)) : 0;

  const handleSeek = (clientX: number) => {
    if (!waveRef.current) return;
    const rect = waveRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    handleSeek(e.clientX);
    const move = (ev: MouseEvent) => handleSeek(ev.clientX);
    const up = () => {
      setDragging(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  };

  return (
    <div
      ref={waveRef}
      onMouseDown={onMouseDown}
      style={{
        flex: 1,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 3,
        cursor: 'pointer',
        padding: '0 4px',
        userSelect: 'none',
      }}
    >
      {WAVE_BARS.map((height, idx) => {
        const barRatio = idx / (WAVE_BARS.length - 1);
        const isPlayed = barRatio <= pct;

        return (
          <div
            key={idx}
            style={{
              flex: 1,
              maxWidth: 3,
              height: height,
              borderRadius: 2,
              background: isPlayed ? 'var(--wx-cyan)' : 'rgba(255, 255, 255, 0.18)',
              boxShadow: isPlayed ? '0 0 6px rgba(0, 229, 255, 0.6)' : 'none',
              transition: 'background 0.1s ease, height 0.15s ease',
            }}
          />
        );
      })}
    </div>
  );
}

export default function PlayerBar({ activeView, setActiveView }: { activeView?: string; setActiveView?: (v: string) => void }) {
  const isMobile = useIsMobile();
  const {
    currentTrack, isPlaying, playTrack, togglePlay,
    progress, duration, seek,
    volume, setVolume, isMuted, setIsMuted,
    playNext, playPrev,
    shuffle, setShuffle,
    repeat, setRepeat,
    liked, toggleLike,
  } = usePlayer();

  const { addDownload, downloadedTracks } = usePlaylists();
  const { showPrompt } = useNotification();
  const { device, promptDevicePicker } = useConnectedDevice();

  const [expanded, setExpanded] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const volumeBarRef = useRef<HTMLDivElement | null>(null);

  if (!currentTrack) return null;

  const isLiked = liked.has(currentTrack.id);
  const isDownloaded = downloadedTracks.some(t => t.id === currentTrack.id);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      await addDownload(currentTrack);
      showPrompt(`"${currentTrack.title}" saved to downloads`, 'success');
    } catch {
      showPrompt(`Failed to download "${currentTrack.title}"`, 'error');
    } finally {
      setIsDownloading(false);
    }
  };

  const cycleRepeat = () => {
    if (repeat === 'off') setRepeat('all');
    else if (repeat === 'all') setRepeat('one');
    else setRepeat('off');
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (volume === 0) setVolume(0.8);
    } else {
      setIsMuted(true);
    }
  };

  /* ─── MOBILE PLAYER ─── */
  if (isMobile) {
    const progressPct = duration ? Math.min(100, (progress / duration) * 100) : 0;

    return (
      <>
        {/* Fullscreen Mobile View */}
        {expanded && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'linear-gradient(to bottom, #0A1628 0%, #080C14 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 24px calc(24px + env(safe-area-inset-bottom))',
          }}>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <button onClick={() => setExpanded(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <ChevronDown size={28} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--wx-cyan)' }}>
                Now Playing
              </span>
              <div style={{ width: 28 }} />
            </div>

            <img
              src={currentTrack.cover} alt={currentTrack.title}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(currentTrack.id); }}
              style={{ width: 260, height: 260, borderRadius: 24, objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.7)', marginBottom: 28 }}
            />

            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentTrack.title}
                </div>
                <div style={{ fontSize: 14, color: 'var(--wx-text-muted)', marginTop: 4 }}>
                  {currentTrack.artist}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button onClick={handleDownload} style={{ background: 'none', border: 'none', color: isDownloaded ? '#10b981' : '#fff', cursor: 'pointer', padding: 8 }}>
                  <DownloadCloud size={22} />
                </button>
                <button onClick={() => toggleLike(currentTrack)} style={{ background: 'none', border: 'none', color: isLiked ? 'var(--wx-cyan)' : '#fff', cursor: 'pointer', padding: 8 }}>
                  <Heart size={22} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
                </button>
              </div>
            </div>

            <div style={{ width: '100%', marginBottom: 20 }}>
              <WaveformSeekBar progress={progress} duration={duration} onSeek={seek} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--wx-text-muted)', marginTop: 6, fontFamily: 'monospace' }}>
                <span>{formatTime(progress)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 24 }}>
              <button onClick={() => setShuffle(!shuffle)} style={{ background: 'none', border: 'none', color: shuffle ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', cursor: 'pointer' }}>
                <Shuffle size={20} />
              </button>
              <button onClick={playPrev} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <SkipBack size={26} />
              </button>
              <button
                onClick={togglePlay}
                style={{
                  width: 58, height: 58, borderRadius: '50%',
                  background: 'var(--wx-cyan)', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(0,229,255,0.5)', cursor: 'pointer',
                }}
              >
                {isPlaying ? <Pause size={26} color="#080C14" /> : <Play size={26} color="#080C14" style={{ marginLeft: 3 }} />}
              </button>
              <button onClick={playNext} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
                <SkipForward size={26} />
              </button>
              <button onClick={cycleRepeat} style={{ background: 'none', border: 'none', color: repeat !== 'off' ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', cursor: 'pointer' }}>
                {repeat === 'one' ? <Repeat1 size={20} /> : <Repeat size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Mini Mobile Bar */}
        <div style={{
          position: 'fixed', bottom: 60, left: 0, right: 0,
          background: 'rgba(10, 15, 29, 0.98)',
          borderTop: '1px solid var(--wx-border)',
          zIndex: 99,
        }}>
          {/* Progress thin bar */}
          <div style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.08)' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: 'var(--wx-cyan)' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: 60, padding: '0 14px', gap: 12 }}>
            <img
              src={currentTrack.cover} alt=""
              onClick={() => setExpanded(true)}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(currentTrack.id); }}
              style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
            />
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(true)}>
              <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentTrack.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentTrack.artist}
              </div>
            </div>

            <button onClick={() => toggleLike(currentTrack)} style={{ background: 'none', border: 'none', color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', cursor: 'pointer' }}>
              <Heart size={20} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
            </button>
            <button
              onClick={togglePlay}
              style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'var(--wx-cyan)', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {isPlaying ? <Pause size={18} color="#080C14" /> : <Play size={18} color="#080C14" style={{ marginLeft: 2 }} />}
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ─── DESKTOP PLAYER (Matching Stitch Reference Exactly) ─── */
  return (
    <div style={{
      background: 'var(--wx-sidebar)',
      borderTop: '1px solid var(--wx-border)',
      padding: '0 24px',
      height: 90,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
      zIndex: 50,
      gap: 20,
      boxSizing: 'border-box',
    }}>
      {/* 1. Left Section: Artwork + Title + Tag + Heart + Download */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '25%', minWidth: 220, flexShrink: 0 }}>
        <img
          src={currentTrack.cover}
          alt={currentTrack.title}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = getFallbackCover(currentTrack.id); }}
          style={{
            width: 52, height: 52, borderRadius: 12, objectFit: 'cover',
            border: '1px solid var(--wx-border)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentTrack.title}
            </div>
            <span style={{
              background: 'rgba(0,229,255,0.15)', border: '1px solid rgba(0,229,255,0.3)',
              color: 'var(--wx-cyan)', fontSize: 9, fontWeight: 900, padding: '1px 5px',
              borderRadius: 4, letterSpacing: 0.5, flexShrink: 0,
            }}>
              HQ
            </span>
          </div>

          <div style={{ fontSize: 11, color: 'var(--wx-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTrack.artist}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => toggleLike(currentTrack)}
            aria-label="Like"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isLiked ? 'var(--wx-cyan)' : 'var(--wx-text-muted)' }}
          >
            <Heart size={18} fill={isLiked ? 'var(--wx-cyan)' : 'none'} />
          </button>

          <button
            onClick={handleDownload}
            aria-label="Download"
            disabled={isDownloading}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: isDownloaded ? '#10B981' : 'var(--wx-text-muted)' }}
          >
            {isDownloading ? <Loader2 size={18} style={{ animation: 'wx-spin 1s linear infinite' }} /> : <DownloadCloud size={18} />}
          </button>
        </div>
      </div>

      {/* 2. Center Section: Playback Controls & Waveform Progress Bar */}
      <div style={{ flex: 1, maxWidth: 660, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <button
            onClick={() => setShuffle(!shuffle)}
            title={shuffle ? "Disable Shuffle" : "Enable Shuffle"}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 4 }}
          >
            <Shuffle size={17} />
          </button>

          <button
            onClick={playPrev}
            title="Previous Track"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}
          >
            <SkipBack size={20} strokeWidth={2.2} />
          </button>

          <button
            onClick={togglePlay}
            title={isPlaying ? "Pause" : "Play"}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--wx-cyan)', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(0,229,255,0.5)', cursor: 'pointer',
              transition: 'transform 0.15s ease',
            }}
          >
            {isPlaying ? <Pause size={20} color="#080C14" /> : <Play size={20} color="#080C14" style={{ marginLeft: 2 }} />}
          </button>

          <button
            onClick={playNext}
            title="Next Track"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 4 }}
          >
            <SkipForward size={20} strokeWidth={2.2} />
          </button>

          <button
            onClick={cycleRepeat}
            title={`Repeat: ${repeat}`}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'off' ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 4 }}
          >
            {repeat === 'one' ? <Repeat1 size={17} /> : <Repeat size={17} />}
          </button>
        </div>

        {/* Time + Soundwave Waveform Progress Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
          <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', width: 34, textAlign: 'right', fontFamily: 'monospace', fontWeight: 600 }}>
            {formatTime(progress)}
          </span>

          <WaveformSeekBar progress={progress} duration={duration} onSeek={seek} />

          <span style={{ fontSize: 11, color: 'var(--wx-text-muted)', width: 34, fontFamily: 'monospace', fontWeight: 600 }}>
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. Right Section: Lyrics + Queue + Volume + AirPods Device Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '25%', justifyContent: 'flex-end', flexShrink: 0 }}>
        {setActiveView && (
          <button
            onClick={() => setActiveView(activeView === 'lyrics' ? 'home' : 'lyrics')}
            title="Lyrics"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: activeView === 'lyrics' ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
              padding: 4,
            }}
          >
            <Mic size={18} />
          </button>
        )}

        <button
          onClick={() => setShowAddModal(true)}
          title="Add to Playlist"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--wx-text-muted)', padding: 4 }}
        >
          <ListMusic size={18} />
        </button>

        {/* Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={toggleMute}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: isMuted || volume === 0 ? 'var(--wx-cyan)' : 'var(--wx-text-muted)', padding: 2 }}
          >
            {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div
            ref={volumeBarRef}
            style={{ width: 68, height: 24, display: 'flex', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
            onMouseDown={(e) => {
              const updateVolume = (clientX: number) => {
                if (!volumeBarRef.current) return;
                const rect = volumeBarRef.current.getBoundingClientRect();
                if (!rect.width) return;
                const newVol = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
                setVolume(newVol);
                setIsMuted(newVol === 0);
              };
              updateVolume(e.clientX);
              const move = (ev: MouseEvent) => updateVolume(ev.clientX);
              const up = () => {
                window.removeEventListener('mousemove', move);
                window.removeEventListener('mouseup', up);
              };
              window.addEventListener('mousemove', move);
              window.addEventListener('mouseup', up);
            }}
          >
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${isMuted ? 0 : volume * 100}%`, height: '100%', background: 'var(--wx-cyan)', borderRadius: 2 }} />
            </div>
          </div>
        </div>

        {/* Actual Connected Device Pill Badge */}
        <button
          onClick={promptDevicePicker}
          title={`Audio Output: ${device.label} (Click to switch)`}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(0, 229, 255, 0.12)',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: 9999,
            padding: '4px 10px',
            color: 'var(--wx-cyan)',
            fontSize: 11,
            fontWeight: 800,
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.2)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(0, 229, 255, 0.12)';
            e.currentTarget.style.borderColor = 'rgba(0, 229, 255, 0.3)';
          }}
        >
          {device.type === 'speaker' ? <Volume2 size={13} /> : <Headphones size={13} />}
          <span>{device.shortName}</span>
        </button>
      </div>

      {showAddModal && <AddToPlaylistModal track={currentTrack} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}
