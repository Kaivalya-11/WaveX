import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';
import { Plus, X, Music2, Loader2 } from 'lucide-react';

export default function AddToPlaylistModal({ track, onClose }) {
  const { currentUser } = useAuth();
  const { customPlaylists, addTrack } = usePlaylists();
  const { showPrompt } = useNotification();
  const [addingId, setAddingId] = useState(null);

  const handleAdd = async (playlistId) => {
    setAddingId(playlistId);
    try {
      await addTrack(playlistId, track);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingId(null);
    }
  };

  if (!track) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, 
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000
    }} onClick={onClose}>
      <div 
        style={{
          width: 'min(400px, 90%)', 
          background: '#050B14', border: '1px solid #101828',
          borderRadius: 24, padding: 24, color: '#fff',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          animation: 'modalSlideUp 0.3s ease-out'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00b4d8', letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 4 }}>Add to playlist</div>
            <div style={{ fontSize: 20, fontWeight: 900 }}>{track.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8d99ae' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ maxHeight: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, paddingRight: 4 }}>
          {customPlaylists.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px 0', color: '#8d99ae' }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>No custom playlists found.</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Create one in the sidebar first!</div>
            </div>
          ) : (
            customPlaylists.map(pl => (
              <button
                key={pl.id}
                onClick={() => handleAdd(pl.id)}
                disabled={addingId === pl.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                  borderRadius: 14, border: '1px solid rgba(255,255,255,0.05)',
                  background: 'rgba(255,255,255,0.03)', color: '#fff',
                  cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div style={{ width: 40, height: 40, borderRadius: 8, background: '#001d3d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Music2 size={20} color="#00b4d8" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{pl.name}</div>
                  <div style={{ fontSize: 11, color: '#8d99ae' }}>{pl.trackIds.length} tracks</div>
                </div>
                {addingId === pl.id ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} color="#8d99ae" />}
              </button>
            ))
          )}
        </div>
      </div>

      <style>{`
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
