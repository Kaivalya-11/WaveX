import React, { useRef, useState, useEffect } from 'react';
import { Heart, HeartOff, DownloadCloud, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, Repeat1, Mic, Volume2, VolumeX, Plus, Loader2, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useNotification } from '../context/NotificationContext';
import { usePlaylists } from '../context/PlaylistContext';
import { API_BASE_URL } from '../services/api';
import AddToPlaylistModal from './AddToPlaylistModal';

function formatTime(s) {
  if (!s || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function PlayerBar({ activeView, setActiveView, activePlaylist, setActivePlaylist }) {
  const isMobile = useIsMobile();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const { showPrompt } = useNotification();
  const { addDownload } = usePlaylists();
  const {
    currentTrack, isPlaying, togglePlay,
    progress, duration, seek,
    volume, setVolume, isMuted, setIsMuted,
    shuffle, setShuffle, repeat, setRepeat,
    liked, toggleLike, playNext, playPrev,
    isBuffering, hasError, registerBlobUrl
  } = usePlayer();

  const progressRef = useRef(null);

  if (!currentTrack) return null;

  const handleSeek = (e) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    seek(ratio * duration);
  };

  const isLiked = liked.has(currentTrack.id);
  const progressPct = duration ? (progress / duration) * 100 : 0;

  // ─── MOBILE PLAYER ────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Expanded full-screen player */}
        {expanded && (
          <div style={{
            position: 'fixed', inset: 0,
            zIndex: 300, display: 'flex', flexDirection: 'column',
            padding: '48px 24px 100px', alignItems: 'center',
            background: `linear-gradient(to bottom, #001d3d 0%, #000B18 60%)`,
            overflowY: 'auto'
          }}>
            {/* Collapse button */}
            <button onClick={() => setExpanded(false)}
              style={{ position: 'absolute', top: 20, left: 20, background: 'none', border: 'none', cursor: 'pointer', color: '#8d99ae' }}>
              <ChevronDown size={28} />
            </button>

            {/* Album Art */}
            <img src={currentTrack.cover} alt="" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'; }}
              style={{ width: 280, height: 280, borderRadius: 20, objectFit: 'cover', boxShadow: '0 20px 60px rgba(0,0,0,0.6)', marginBottom: 40, marginTop: 20 }} />

            {/* Track Info */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.title}</div>
                <div style={{ fontSize: 15, color: '#8d99ae', marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.artist}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button disabled={isDownloading} onClick={async (e) => {
                  e.preventDefault(); if (isDownloading) return; setIsDownloading(true);
                  try {
                    const downloadUrl = `${API_BASE_URL}/api/download?videoId=${currentTrack.id}&title=${encodeURIComponent(currentTrack.title)}`;
                    const response = await fetch(downloadUrl); const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a'); link.href = blobUrl;
                    link.setAttribute('download', `${currentTrack.title} - ${currentTrack.artist}.mp3`);
                    document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
                    registerBlobUrl && registerBlobUrl(currentTrack.id, blobUrl); 
                    addDownload(currentTrack);
                    showPrompt(`Downloaded "${currentTrack.title}"`, "success");
                  } catch (err) { showPrompt("Download failed.", "error"); } finally { setIsDownloading(false); }
                }} style={{ color: "#8d99ae", background: "none", border: "none", cursor: isDownloading ? "not-allowed" : "pointer", padding: 8 }}>
                  {isDownloading ? <Loader2 size={26} style={{ animation: 'spin 1s linear infinite' }} /> : <DownloadCloud size={26} />}
                </button>
                <button onClick={() => toggleLike(currentTrack)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#00b4d8' : '#8d99ae', padding: 8 }}>
                  {isLiked ? <Heart size={26} fill="#00b4d8" color="#00b4d8" /> : <Heart size={26} color="#8d99ae" />}
                </button>
              </div>
            </div>

            {/* Progress */}
            <div style={{ width: '100%', marginBottom: 8 }}>
              <div ref={progressRef} onClick={handleSeek}
                style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, cursor: 'pointer', position: 'relative', marginBottom: 8 }}>
                <div style={{ width: `${progressPct}%`, height: '100%', background: '#00b4d8', borderRadius: 2 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#8d99ae' }}>{formatTime(progress)}</span>
                <span style={{ fontSize: 12, color: '#8d99ae' }}>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 32 }}>
              <button onClick={() => setShuffle(!shuffle)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: shuffle ? '#00b4d8' : '#8d99ae' }}>
                <Shuffle size={22} />
              </button>
              <button onClick={playPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                <SkipBack size={28} />
              </button>
              <button onClick={togglePlay}
                style={{ width: 64, height: 64, borderRadius: '50%', background: hasError ? '#ff4d4d' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: hasError ? 'none' : '0 4px 20px rgba(0,180,216,0.4)' }}>
                {hasError ? <AlertCircle size={28} color="#fff" /> : isBuffering ? <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Pause size={28} color="#000" /> : <Play size={28} color="#000" style={{ marginLeft: 4 }} />}
              </button>
              <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff' }}>
                <SkipForward size={28} />
              </button>
              <button onClick={() => setRepeat(repeat === 'off' ? 'all' : repeat === 'all' ? 'one' : 'off')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: repeat !== 'off' ? '#00b4d8' : '#8d99ae' }}>
                {repeat === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
              </button>
            </div>

            {/* Extra actions */}
            <div style={{ display: 'flex', gap: 24 }}>
              <button onClick={() => { setShowAddModal(true); setExpanded(false); }}
                style={{ background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '10px 20px', color: '#8d99ae', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
                <Plus size={16} /> Add to playlist
              </button>
              {setActiveView && (
                <button onClick={() => { setActiveView(activeView === 'lyrics' ? 'home' : 'lyrics'); setExpanded(false); }}
                  style={{ background: activeView === 'lyrics' ? 'rgba(0,180,216,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 12, padding: '10px 20px', color: activeView === 'lyrics' ? '#00b4d8' : '#8d99ae', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13 }}>
                  <Mic size={16} /> Lyrics
                </button>
              )}
            </div>
          </div>
        )}

        {/* Mini player bar (above bottom nav) */}
        <div style={{
          position: 'fixed', bottom: 64, left: 0, right: 0,
          background: '#0a1628', borderTop: '1px solid #101828',
          zIndex: 99, padding: '0 12px',
          paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          {/* Thin progress bar at top */}
          <div ref={progressRef} onClick={handleSeek}
            style={{ width: '100%', height: 2, background: 'rgba(255,255,255,0.08)', cursor: 'pointer' }}>
            <div style={{ width: `${progressPct}%`, height: '100%', background: '#00b4d8' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', height: 60, gap: 10 }}>
            {/* Album art — tap to expand */}
            <img src={currentTrack.cover} alt="" onClick={() => setExpanded(true)}
              style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', cursor: 'pointer', flexShrink: 0 }}
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'; }} />

            {/* Track info — tap to expand */}
            <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setExpanded(true)}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.title}</div>
              <div style={{ fontSize: 11, color: '#8d99ae', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentTrack.artist}</div>
            </div>

            {/* Controls */}
            <button onClick={() => toggleLike(currentTrack)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: isLiked ? '#00b4d8' : '#8d99ae', padding: 6 }}>
              {isLiked ? <Heart size={20} fill="#00b4d8" color="#00b4d8" /> : <Heart size={20} color="#8d99ae" />}
            </button>
            <button onClick={playPrev} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}>
              <SkipBack size={20} />
            </button>
            <button onClick={togglePlay}
              style={{ width: 38, height: 38, borderRadius: '50%', background: hasError ? '#ff4d4d' : '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {hasError ? <AlertCircle size={18} color="#fff" /> : isBuffering ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Pause size={18} color="#000" /> : <Play size={18} color="#000" style={{ marginLeft: 2 }} />}
            </button>
            <button onClick={playNext} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}>
              <SkipForward size={20} />
            </button>
          </div>
        </div>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {showAddModal && <AddToPlaylistModal track={currentTrack} onClose={() => setShowAddModal(false)} />}
      </>
    );
  }

  // ─── DESKTOP PLAYER ───────────────────────────────────────────────────────
  return (
    <div style={{ background: "#050B14", borderTop: "1px solid #101828", padding: "0 16px", height: 90, display: "flex", alignItems: "center", flexShrink: 0, zIndex: 50 }}>
      {/* Track Info */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, width: "30%", minWidth: 200, flexShrink: 0 }}>
        <img src={currentTrack.cover} alt="" style={{ width: 56, height: 56, borderRadius: 10, objectFit: "cover", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=200'; }} />
        <div style={{ overflow: "hidden", flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#fff" }}>{currentTrack.title}</div>
          <div style={{ fontSize: 11, color: "#8d99ae", marginTop: 3, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {(() => { const parts = (currentTrack.artist || '').split(',').map(s => s.trim()).filter(Boolean); return parts.length > 2 ? parts.slice(0, 2).join(', ') + '...' : parts.join(', '); })()}
          </div>
        </div>
        <button onClick={() => toggleLike(currentTrack)} style={{ background: "none", border: "none", cursor: "pointer", color: isLiked ? "#00b4d8" : "#8d99ae", padding: 8 }}
          onMouseDown={e => e.currentTarget.style.transform = "scale(0.8)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"} onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
          {isLiked ? <Heart size={20} fill="#00b4d8" color="#00b4d8" /> : <Heart size={20} color="#8d99ae" />}
        </button>
        <button disabled={isDownloading} onClick={async (e) => {
          e.preventDefault(); if (isDownloading) return; setIsDownloading(true);
          try {
            const downloadUrl = `${API_BASE_URL}/api/download?videoId=${currentTrack.id}&title=${encodeURIComponent(currentTrack.title)}`;
            const response = await fetch(downloadUrl); const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a'); link.href = blobUrl;
            link.setAttribute('download', `${currentTrack.title} - ${currentTrack.artist}.mp3`);
            document.body.appendChild(link); link.click(); link.parentNode.removeChild(link);
            registerBlobUrl && registerBlobUrl(currentTrack.id, blobUrl); addDownload(currentTrack);
            showPrompt(`Downloaded "${currentTrack.title}"`, "success");
          } catch (err) { showPrompt("Download failed.", "error"); } finally { setIsDownloading(false); }
        }} style={{ color: "#8d99ae", background: "none", border: "none", cursor: isDownloading ? "not-allowed" : "pointer", padding: 8 }}>
          {isDownloading ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : <DownloadCloud size={20} />}
        </button>
      </div>

      {/* Center Controls */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 24px", maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <button onClick={() => setShuffle(!shuffle)} style={{ background: "none", border: "none", cursor: "pointer", color: shuffle ? "#00b4d8" : "#8d99ae", padding: 4 }}><Shuffle size={18} /></button>
          <button onClick={playPrev} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}><SkipBack size={20} /></button>
          <button onClick={togglePlay} style={{ width: 44, height: 44, borderRadius: "50%", background: hasError ? '#ff4d4d' : "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: hasError ? "#fff" : "#000", boxShadow: hasError ? 'none' : "0 4px 12px rgba(0,180,216,0.3)" }}>
            {hasError ? <AlertCircle size={20} /> : isBuffering ? <Loader2 size={20} style={{ animation: 'spin 1s linear infinite' }} /> : isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: 2 }} />}
          </button>
          <button onClick={playNext} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", padding: 4 }}><SkipForward size={20} /></button>
          <button onClick={() => setRepeat(repeat === "off" ? "all" : repeat === "all" ? "one" : "off")} style={{ background: "none", border: "none", cursor: "pointer", color: repeat !== "off" ? "#00b4d8" : "#8d99ae", padding: 4 }}>
            {repeat === "one" ? <Repeat1 size={18} /> : <Repeat size={18} />}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", marginTop: -2 }}>
          <span style={{ fontSize: 11, color: "#8d99ae", width: 40, textAlign: "right", fontWeight: 700, fontFamily: "monospace" }}>{formatTime(progress)}</span>
          <div ref={progressRef} onClick={handleSeek} style={{ flex: 1, height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, cursor: "pointer", position: "relative" }}>
            <div style={{ width: `${progressPct}%`, height: "100%", background: "#00b4d8", borderRadius: 2, boxShadow: "0 0 10px rgba(0,180,216,0.5)" }} />
          </div>
          <span style={{ fontSize: 11, color: "#8d99ae", width: 40, fontWeight: 700, fontFamily: "monospace" }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ width: "30%", minWidth: 180, display: "flex", alignItems: "center", gap: 16, justifyContent: "flex-end", flexShrink: 0 }}>
        <button onClick={() => setShowAddModal(true)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8d99ae", padding: 4 }} title="Add to playlist"><Plus size={18} /></button>
        {setActiveView && (
          <button onClick={() => setActiveView(activeView === "lyrics" ? "home" : "lyrics")} style={{ background: "none", border: "none", cursor: "pointer", color: activeView === "lyrics" ? "#00b4d8" : "#8d99ae", padding: 4 }}><Mic size={18} /></button>
        )}
        <button onClick={() => setIsMuted(!isMuted)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8d99ae", padding: 4 }}>
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        <div style={{ width: 80, height: 6, background: "#101828", borderRadius: 3, cursor: "pointer", position: "relative" }}
          onMouseDown={(e) => { const rect = e.currentTarget.getBoundingClientRect(); const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); setVolume(v); setIsMuted(false); }}>
          <div style={{ width: `${isMuted ? 0 : volume * 100}%`, height: "100%", background: "#00b4d8", borderRadius: 3 }} />
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      {showAddModal && <AddToPlaylistModal track={currentTrack} onClose={() => setShowAddModal(false)} />}
    </div>
  );
}