"use client";

import React, { useEffect, useState } from 'react';
import { fetchSpotifyPlaylists, fetchSpotifyPlaylistTracks, fetchSpotifyLikedSongs } from '../services/spotify';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { Loader2, X, CheckCircle2, AlertTriangle, ArrowRight, Heart } from 'lucide-react';

interface ImportModalProps {
  token: string;
  onClose: () => void;
  onComplete?: () => void;
}

export default function ImportModal({ token, onClose, onComplete }: ImportModalProps) {
  const { currentUser } = useAuth();
  const { createPlaylist, addTrack } = usePlaylists();
  const { showPrompt } = useNotification();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState<string | null>(null);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (token) {
      fetchSpotifyPlaylists(token)
        .then(data => setPlaylists(data || []))
        .catch(err => {
          console.error(err);
          showPrompt("Failed to load Spotify playlists", "error");
        })
        .finally(() => setLoading(false));
    }
  }, [token, showPrompt]);

  const handleImport = async (spotifyPl: any) => {
    if (!currentUser) return;
    setImporting(spotifyPl.id);

    try {
      const sTracks = await fetchSpotifyPlaylistTracks(token, spotifyPl.id);
      setProgress({ current: 0, total: sTracks.length });

      const newPlaylist = await createPlaylist(spotifyPl.name);
      if (!newPlaylist) throw new Error("Could not create playlist");

      for (const track of sTracks) {
        await addTrack(newPlaylist.id || (newPlaylist as any)._id, track);
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      showPrompt(`✅ Imported "${spotifyPl.name}" with ${sTracks.length} tracks!`, "success");
      onComplete?.();
      onClose();
    } catch (err) {
      console.error(err);
      showPrompt("Import failed. Please try again.", "error");
    } finally {
      setImporting(null);
    }
  };

  const handleImportLiked = async () => {
    if (!currentUser) return;
    setImporting("liked");

    try {
      const likedTracks = await fetchSpotifyLikedSongs(token);
      setProgress({ current: 0, total: likedTracks.length });

      const newPlaylist = await createPlaylist("💚 Liked from Spotify");
      if (!newPlaylist) throw new Error("Could not create playlist");

      for (const track of likedTracks) {
        await addTrack(newPlaylist.id || (newPlaylist as any)._id, track);
        setProgress(prev => ({ ...prev, current: prev.current + 1 }));
      }

      showPrompt(`✅ Imported ${likedTracks.length} liked songs from Spotify!`, "success");
      onComplete?.();
      onClose();
    } catch (err) {
      console.error(err);
      showPrompt("Failed to import liked songs.", "error");
    } finally {
      setImporting(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000
    }} onClick={onClose}>
      <div
        style={{
          width: 'min(500px, 95%)',
          background: '#050B14', border: '1px solid rgba(0, 180, 216, 0.2)',
          borderRadius: 32, padding: 32, color: '#fff',
          boxShadow: '0 32px 80px rgba(0,0,0,0.8)',
          animation: 'modalFadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1DB954', marginBottom: 8 }}>
              <CheckCircle2 size={16} />
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase' }}>Spotify Connected</div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 900 }}>Import Playlists</div>
            <div style={{ fontSize: 14, color: '#8d99ae', marginTop: 4 }}>Select a playlist to migrate to Wavex.</div>
          </div>
          <button onClick={onClose} aria-label="Close" style={{ background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer', color: '#8d99ae', padding: 8, borderRadius: 12 }}>
            <X size={20} />
          </button>
        </div>

        {!importing && !loading && (
          <button
            onClick={handleImportLiked}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', borderRadius: 16, marginBottom: 16,
              border: '1px solid rgba(29,185,84,0.3)',
              background: 'rgba(29,185,84,0.07)', color: '#fff',
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(29,185,84,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Heart size={22} color="#1DB954" />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>Liked Songs</div>
              <div style={{ fontSize: 12, color: '#8d99ae', marginTop: 2 }}>Import all your Spotify liked songs</div>
            </div>
            <ArrowRight size={18} color="#1DB954" style={{ marginLeft: 'auto' }} />
          </button>
        )}

        <div style={{ maxHeight: 340, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingRight: 4 }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#00b4d8', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 14, color: '#8d99ae' }}>Loading your Spotify playlists...</div>
            </div>
          ) : importing ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '4px solid #00b4d8', borderTopColor: 'transparent', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Importing...</div>
              <div style={{ fontSize: 13, color: '#8d99ae' }}>
                {progress.total > 0 ? `Processing track ${progress.current} of ${progress.total}` : 'Fetching tracks...'}
              </div>
              {progress.total > 0 && (
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, marginTop: 16 }}>
                  <div style={{
                    width: `${(progress.current / progress.total) * 100}%`,
                    height: '100%', background: '#00b4d8', borderRadius: 2, transition: 'width 0.3s ease'
                  }} />
                </div>
              )}
            </div>
          ) : playlists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#8d99ae' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎵</div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>No Spotify playlists found.</div>
              <div style={{ fontSize: 13, marginTop: 8 }}>Make sure your Spotify account has playlists.</div>
            </div>
          ) : (
            playlists.map(pl => (
              <button
                key={pl.id}
                onClick={() => handleImport(pl)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 14,
                  borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)',
                  background: 'rgba(255,255,255,0.02)', color: '#fff',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                }}
              >
                <div style={{ width: 52, height: 52, borderRadius: 10, overflow: 'hidden', flexShrink: 0, background: '#0a1628' }}>
                  {pl.images?.[0]?.url ? (
                    <img src={pl.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🎵</div>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{pl.name}</div>
                  <div style={{ fontSize: 12, color: '#8d99ae', marginTop: 2 }}>{pl.tracks?.total ?? 0} tracks</div>
                </div>
                <ArrowRight size={16} color="#00b4d8" />
              </button>
            ))
          )}
        </div>

        <div style={{ marginTop: 24, padding: 14, background: 'rgba(0,180,216,0.05)', borderRadius: 14, display: 'flex', gap: 10 }}>
          <AlertTriangle size={18} color="#00b4d8" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 12, color: '#8d99ae', margin: 0, lineHeight: 1.6 }}>
            Playlists are saved to your Wavex cloud library in MongoDB. Song previews are 30 seconds due to Spotify API limits.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

