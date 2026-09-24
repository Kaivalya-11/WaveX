import React, { useEffect, useState } from 'react';
import { Home, Search, Heart, Settings2, Plus, Music2, Trash2, DownloadCloud } from 'lucide-react';
import { PLAYLISTS } from '../services/api';
import { usePlayer } from '../context/PlayerContext';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';
import { useNotification } from '../context/NotificationContext';

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function Sidebar({ activeView, setActiveView, activePlaylist, setActivePlaylist }) {
  const isMobile = useIsMobile();
  const { liked, currentTrack } = usePlayer();
  const { currentUser } = useAuth();
  const { customPlaylists, createPlaylist, deletePlaylist } = usePlaylists();
  const { showPrompt } = useNotification();
  const [creatingPlaylist, setCreatingPlaylist] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [playlistError, setPlaylistError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (currentUser && customPlaylists.length > 0 && activeView === "playlist" && !activePlaylist) {
      const savedId = (() => { try { return localStorage.getItem("soundify_active_playlist"); } catch { return null; } })();
      const match = savedId ? customPlaylists.find((pl) => pl.id === savedId) : null;
      setActivePlaylist(match || customPlaylists[0]);
    }
  }, [currentUser, customPlaylists, activeView, activePlaylist, setActivePlaylist]);

  const handleNavClick = (id) => {
    setActiveView(id);
    setActivePlaylist(null);
    setSidebarOpen(false);
  };

  const handlePlaylistClick = (pl) => {
    setActiveView("playlist");
    setActivePlaylist(pl);
    setSidebarOpen(false);
  };

  const openCreatePlaylist = () => {
    if (!currentUser) return showPrompt("Please log in to create playlists.", "warning");
    setPlaylistError(""); setNewPlaylistName(""); setCreatingPlaylist(true);
  };

  const cancelCreatePlaylist = () => { setCreatingPlaylist(false); setNewPlaylistName(""); setPlaylistError(""); };

  const handleCreatePlaylist = async () => {
    if (!currentUser) return showPrompt("Please log in to create playlists.", "warning");
    const name = newPlaylistName.trim();
    if (!name) { setPlaylistError("Please enter a playlist name."); return; }
    setPlaylistLoading(true);
    try {
      const newPl = await createPlaylist(name);
      setCreatingPlaylist(false); setNewPlaylistName(""); setPlaylistError("");
      setActiveView("playlist"); setActivePlaylist(newPl);
    } catch (err) { setPlaylistError("Unable to create playlist. Please try again."); }
    finally { setPlaylistLoading(false); }
  };

  const requestDeletePlaylist = (playlist) => {
    if (!currentUser) return showPrompt("Please log in to delete playlists.", "warning");
    setDeleteTarget(playlist);
  };

  const confirmDeletePlaylist = async () => {
    if (!deleteTarget) return;
    if (activePlaylist?.id === deleteTarget.id) { setActiveView("home"); setActivePlaylist(null); }
    try { await deletePlaylist(deleteTarget.id); setDeleteTarget(null); } catch (err) { console.error(err); }
  };

  const navItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "liked", label: "Liked", icon: Heart },
    { id: "downloads", label: "Downloads", icon: DownloadCloud },
    { id: "dashboard", label: "Profile", icon: Settings2 }
  ];

  // ─── MOBILE BOTTOM NAV ────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <>
        {/* Drawer overlay */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
        )}

        {/* Slide-up drawer for playlists */}
        <div style={{
          position: 'fixed', left: 0, right: 0, bottom: sidebarOpen ? 64 : '-100%',
          background: '#050B14', borderTop: '1px solid #101828',
          borderRadius: '24px 24px 0 0', zIndex: 201, padding: '20px 16px 24px',
          transition: 'bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          maxHeight: '70vh', overflowY: 'auto'
        }}>
          <div style={{ width: 40, height: 4, background: '#101828', borderRadius: 2, margin: '0 auto 20px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 16, fontWeight: 900, color: '#fff' }}>Your Playlists</span>
            <button onClick={openCreatePlaylist} style={{ background: '#001d3d', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#00b4d8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13 }}>
              <Plus size={14} /> New
            </button>
          </div>

          {creatingPlaylist && (
            <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input value={newPlaylistName} onChange={(e) => { setNewPlaylistName(e.target.value); setPlaylistError(""); }}
                placeholder="Playlist name" autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #003049', background: '#020916', color: '#fff', outline: 'none', fontSize: 14 }} />
              {playlistError && <div style={{ color: '#ff6b6b', fontSize: 12 }}>{playlistError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreatePlaylist} disabled={playlistLoading}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: '#00b4d8', color: '#000', fontWeight: 700, cursor: 'pointer' }}>
                  {playlistLoading ? 'Creating...' : 'Create'}
                </button>
                <button onClick={cancelCreatePlaylist}
                  style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #003049', background: 'transparent', color: '#8d99ae', fontWeight: 700, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          {[...customPlaylists, ...PLAYLISTS].map((pl) => (
            <div key={pl.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <button onClick={() => handlePlaylistClick(pl)}
                style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12, padding: '12px', borderRadius: 12,
                  border: 'none', background: activePlaylist?.id === pl.id ? '#001d3d' : 'transparent',
                  color: activePlaylist?.id === pl.id ? '#fff' : '#8d99ae', cursor: 'pointer', textAlign: 'left' }}>
                <Music2 size={18} />
                <span style={{ fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pl.name}</span>
              </button>
              {customPlaylists.find(c => c.id === pl.id) && (
                <button onClick={() => requestDeletePlaylist(pl)}
                  style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#06152a', color: '#8d99ae', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Trash2 size={15} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Nav Bar */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          height: 64, background: '#050B14', borderTop: '1px solid #101828',
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)'
        }}>
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button key={item.id} onClick={() => handleNavClick(item.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: isActive ? '#00b4d8' : '#8d99ae', padding: '8px 4px', minWidth: 40, flex: 1 }}>
                <item.icon size={22} />
                <span style={{ fontSize: 10, fontWeight: 700 }}>{item.label}</span>
              </button>
            );
          })}
          {/* Playlists button */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer',
              color: sidebarOpen ? '#00b4d8' : '#8d99ae', padding: '8px 12px', minWidth: 48 }}>
            <Music2 size={22} />
            <span style={{ fontSize: 10, fontWeight: 700 }}>Library</span>
          </button>
        </div>

        {/* Delete confirm modal */}
        {deleteTarget && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9000, padding: 24 }}>
            <div style={{ width: '100%', maxWidth: 360, background: '#050B14', border: '1px solid #101828', borderRadius: 24, padding: 24, color: '#fff' }}>
              <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Delete playlist?</div>
              <div style={{ fontSize: 14, color: '#8d99ae', marginBottom: 24 }}>Are you sure you want to delete "{deleteTarget.name}"?</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: '12px', borderRadius: 14, border: '1px solid #003049', background: 'transparent', color: '#8d99ae', cursor: 'pointer', fontWeight: 700 }}>Cancel</button>
                <button onClick={confirmDeletePlaylist} style={{ flex: 1, padding: '12px', borderRadius: 14, border: 'none', background: '#ff5c8a', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // ─── DESKTOP SIDEBAR ──────────────────────────────────────────────────────
  return (
    <div style={{ width: 240, background: "#050B14", display: "flex", flexDirection: "column", padding: "16px 12px", gap: 4, flexShrink: 0, borderRight: "1px solid #101828" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 24px" }}>
        <img src="/favicon.svg" alt="App logo" width="38" height="38" style={{ borderRadius: 16, objectFit: "cover", background: "#0b1f3d" }} />
        <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5, color: "#fff" }}>Wavex</span>
      </div>

      {navItems.map((item) => {
        const isActive = activeView === item.id;
        return (
          <button key={item.id} onClick={() => handleNavClick(item.id)}
            style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 12px", borderRadius: 8, border: "none", background: isActive ? "#001d3d" : "transparent", color: isActive ? "#fff" : "#8d99ae", cursor: "pointer", fontSize: 14, fontWeight: 700, transition: "all 0.15s" }}>
            <item.icon size={18} />
            {item.label}
          </button>
        );
      })}

      <div style={{ height: 1, background: "#101828", margin: "16px 12px 8px" }} />

      <div style={{ padding: "4px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: "#8d99ae", letterSpacing: 1.5, textTransform: "uppercase" }}>Playlists</span>
        <button onClick={openCreatePlaylist} style={{ background: "none", border: "none", cursor: "pointer", color: "#00b4d8" }}><Plus size={16} /></button>
      </div>

      {creatingPlaylist && (
        <div style={{ padding: "0 12px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
          <input value={newPlaylistName} onChange={(e) => { setNewPlaylistName(e.target.value); setPlaylistError(""); }}
            placeholder="New playlist name" autoFocus
            style={{ width: "100%", padding: "10px 12px", borderRadius: 12, border: "1px solid #003049", background: "#020916", color: "#fff", outline: "none", fontSize: 14 }} />
          {playlistError && <div style={{ color: "#ff6b6b", fontSize: 12, fontWeight: 600 }}>{playlistError}</div>}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={handleCreatePlaylist} disabled={playlistLoading}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "none", background: "#00b4d8", color: "#000", fontWeight: 700, cursor: playlistLoading ? "not-allowed" : "pointer", opacity: playlistLoading ? 0.65 : 1 }}>
              {playlistLoading ? "Creating..." : "Create"}
            </button>
            <button onClick={cancelCreatePlaylist} disabled={playlistLoading}
              style={{ flex: 1, padding: "10px 12px", borderRadius: 12, border: "1px solid #003049", background: "transparent", color: "#8d99ae", fontWeight: 700, cursor: "pointer" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {customPlaylists.map((pl) => (
        <div key={pl.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button onClick={() => handlePlaylistClick(pl)}
            style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, border: "none", background: activePlaylist?.id === pl.id ? "#001d3d" : "transparent", color: activePlaylist?.id === pl.id ? "#fff" : "#8d99ae", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
            <Music2 size={16} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.name}</span>
          </button>
          <button type="button" onClick={(e) => { e.stopPropagation(); requestDeletePlaylist(pl); }}
            style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "#06152a", color: "#8d99ae", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trash2 size={16} />
          </button>
        </div>
      ))}

      {PLAYLISTS.map((pl) => (
        <button key={pl.id} onClick={() => handlePlaylistClick(pl)}
          style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 12px", borderRadius: 8, border: "none", background: activePlaylist?.id === pl.id ? "#001d3d" : "transparent", color: activePlaylist?.id === pl.id ? "#fff" : "#8d99ae", cursor: "pointer", fontSize: 13, fontWeight: 600, textAlign: "left" }}>
          <Music2 size={16} />
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pl.name}</span>
        </button>
      ))}

      <div style={{ marginTop: "auto", padding: "8px 0" }}>
        {currentUser && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "linear-gradient(135deg, rgba(0, 180, 216, 0.08), rgba(0,0,0,0))", borderRadius: 16, border: "1px solid rgba(0, 180, 216, 0.15)" }}>
            <div style={{ position: "relative" }}>
              <img src={currentUser.photoURL || currentUser.providerData?.[0]?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`} alt="Avatar"
                style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover", border: "2px solid #00b4d8" }}
                onError={(e) => e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName}`} />
              <div style={{ position: "absolute", bottom: -2, right: -2, width: 12, height: 12, background: "#10b981", borderRadius: "50%", border: "2px solid #050B14" }} />
            </div>
            <div style={{ overflow: "hidden", flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 900, color: "#fff", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentUser.displayName}</div>
              <div style={{ fontSize: 11, color: "#8d99ae", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>{currentUser.email}</div>
            </div>
          </div>
        )}
      </div>

      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ width: "min(420px, 90%)", background: "#050B14", border: "1px solid #101828", borderRadius: 24, padding: 24, color: "#fff" }}>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Delete playlist?</div>
            <div style={{ fontSize: 14, color: "#cbd5e1", marginBottom: 24 }}>Are you sure you want to delete "{deleteTarget.name}"?</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setDeleteTarget(null)} style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "1px solid #003049", background: "transparent", color: "#8d99ae", cursor: "pointer", fontWeight: 700 }}>Cancel</button>
              <button onClick={confirmDeletePlaylist} style={{ flex: 1, padding: "12px 16px", borderRadius: 14, border: "none", background: "#ff5c8a", color: "#fff", cursor: "pointer", fontWeight: 700 }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}