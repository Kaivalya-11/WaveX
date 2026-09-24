import React, { useEffect, useState } from 'react';
import { Heart, Music2, Play } from 'lucide-react';
import TrackList from '../components/TrackList';
import { usePlayer } from '../context/PlayerContext';
import { getDefaultTracks, searchSongs } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import { usePlaylists } from '../context/PlaylistContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function PlaylistView({ activeView, activePlaylist, setActivePlaylist }) {
  const { liked } = usePlayer();
  const { showPrompt } = useNotification();
  const { currentUser } = useAuth();
  const { addTrack } = usePlaylists();
  const isMobile = useIsMobile();
  const [playlistTracks, setPlaylistTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [addingIds, setAddingIds] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    async function getTracks() {
      if (activeView === "liked") {
        setLoadingTracks(true);
        if (currentUser) {
          try {
            const res = await fetch(`http://localhost:5000/api/likes?userId=${currentUser.uid}`);
            const data = await res.json();
            if (Array.isArray(data)) {
              setPlaylistTracks(data.map(t => ({ ...t, id: t.trackId })));
            } else {
              setPlaylistTracks([]);
            }
          } catch (e) {
            console.error("Failed to load liked songs", e);
            setPlaylistTracks([]);
          }
        } else {
          setPlaylistTracks([]);
        }
        setLoadingTracks(false);
        return;
      }
      if (activePlaylist?.id === "trending") {
        setLoadingTracks(true);
        const tracks = await searchSongs("trending pop songs");
        setPlaylistTracks(tracks);
        setLoadingTracks(false);
        return;
      }
      if (activePlaylist?.id === "top") {
        setLoadingTracks(true);
        const tracks = await searchSongs("top hits 2024");
        setPlaylistTracks(tracks);
        setLoadingTracks(false);
        return;
      }
      if (activePlaylist?.songs?.length > 0) {
        setPlaylistTracks(activePlaylist.songs);
        return;
      }
      if (activePlaylist?.tracks?.length > 0) {
        // Map the MongoDB track format back to the frontend format (trackId -> id)
        const mappedTracks = activePlaylist.tracks.map(t => ({ ...t, id: t.trackId }));
        setPlaylistTracks(mappedTracks);
      } else {
        setPlaylistTracks([]); 
      }
    }
    getTracks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlaylist?.id, activePlaylist?.tracks?.length, activeView, liked, currentUser]);

  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      const res = await searchSongs(searchQuery);
      setSearchResults(res.slice(0, 10));
      setIsSearching(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleAddTrack = async (track) => {
    if (!activePlaylist || addingIds.has(track.id)) return;
    const prevPlaylist = { ...activePlaylist };
    const prevTracks = [...playlistTracks];
    setAddingIds(prev => new Set(prev).add(track.id));
    
    const newTrackForPlaylist = { ...track, trackId: track.id };
    setActivePlaylist({ ...activePlaylist, tracks: [...(activePlaylist.tracks || []), newTrackForPlaylist] });
    setPlaylistTracks(prev => [...prev, track]);
    showPrompt(`Added "${track.title}" to playlist.`, "success");
    try { await addTrack(activePlaylist._id || activePlaylist.id, track); }
    catch { setActivePlaylist(prevPlaylist); setPlaylistTracks(prevTracks); }
    finally { setAddingIds(prev => { const n = new Set(prev); n.delete(track.id); return n; }); }
  };

  let headerTitle = activeView === "liked" ? "Liked Songs" : (activePlaylist?.name || "Playlist");
  let headerDesc = activeView === "liked" ? `${playlistTracks.length} songs` : `${activePlaylist?.tracks?.length || 0} songs`;

  const px = isMobile ? 16 : 32;

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* Header */}
      <div style={{
        position: "relative",
        background: "linear-gradient(to bottom, #001d3d 0%, #050B14 100%)",
        padding: isMobile ? "40px 16px 24px" : "80px 32px 32px",
        marginBottom: isMobile ? 16 : 32, overflow: "hidden"
      }}>
        <div style={{ position: "absolute", inset: 0, background: `url(${playlistTracks[0]?.cover || ''})`, backgroundSize: "cover", backgroundPosition: "center", filter: "blur(100px) brightness(0.4)", transform: "scale(1.2)", opacity: 0.6, zIndex: 0 }} />

        <div style={{ display: "flex", alignItems: isMobile ? "center" : "flex-end", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 16 : 32, position: "relative", zIndex: 1, textAlign: isMobile ? "center" : "left" }}>
          <div style={{ width: isMobile ? 140 : 232, height: isMobile ? 140 : 232, borderRadius: 12, backgroundSize: "cover", backgroundPosition: "center", backgroundImage: playlistTracks[0]?.cover ? `url(${playlistTracks[0].cover})` : "none", backgroundColor: "#003049", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 60px rgba(0,0,0,0.6)", flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)" }}>
            {!playlistTracks[0] && (activeView === "liked" ? <Heart size={48} color="#fff" /> : <Music2 size={48} color="#fff" />)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, textTransform: "uppercase", color: "#fff", marginBottom: 8, opacity: 0.7 }}>{activeView === "liked" ? "Collection" : "Playlist"}</div>
            <h1 style={{ fontSize: isMobile ? 32 : 72, fontWeight: 900, margin: "0 0 8px", color: "#fff", letterSpacing: -1, lineHeight: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: isMobile ? 'nowrap' : 'normal' }}>{headerTitle}</h1>
            <div style={{ display: "flex", alignItems: "center", justifyContent: isMobile ? "center" : "flex-start", gap: 8, fontSize: 13, color: "#fff", fontWeight: 700, flexWrap: 'wrap' }}>
              <img src={currentUser?.photoURL || ''} style={{ width: 20, height: 20, borderRadius: "50%" }} alt="" />
              <span>{currentUser?.displayName}</span>
              <span style={{ opacity: 0.5 }}>• {headerDesc}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: `0 ${px}px` }}>
        <div style={{ marginBottom: 40 }}>
          {loadingTracks ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "#8d99ae" }}>Loading tracks...</div>
          ) : playlistTracks.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#8d99ae" }}>
              <Music2 size={48} style={{ marginBottom: 16, opacity: 0.3 }} />
              <div style={{ fontSize: 18, fontWeight: 700 }}>It looks empty here...</div>
              <div style={{ fontSize: 14, marginTop: 8 }}>Go find some awesome music to add!</div>
            </div>
          ) : (
            <TrackList tracks={playlistTracks} />
          )}
        </div>

        {activeView === "playlist" && (
          <div style={{ padding: "32px 0", borderTop: "1px solid #10283e" }}>
            <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 900, marginBottom: 8, color: "#fff" }}>Add songs to your playlist</h2>
            <div style={{ position: "relative", maxWidth: 600, marginBottom: 24 }}>
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search for songs"
                style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1px solid #003049", background: "rgba(255,255,255,0.05)", color: "#fff", outline: "none", fontSize: 14 }} />
              {isSearching && <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, border: "2px solid #00b4d8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {searchResults.map((track) => (
                <div key={track.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: "rgba(255,255,255,0.02)" }}>
                  <img src={track.cover} alt="" style={{ width: 44, height: 44, borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: "#fff", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>{track.title}</div>
                    <div style={{ fontSize: 12, color: "#8d99ae", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{track.artist}</div>
                  </div>
                  <button onClick={() => handleAddTrack(track)} disabled={addingIds.has(track.id)}
                    style={{ padding: "7px 16px", borderRadius: 20, border: addingIds.has(track.id) ? "2px solid #555" : "2px solid #fff", background: "transparent", color: addingIds.has(track.id) ? "#555" : "#fff", fontWeight: 800, cursor: "pointer", fontSize: 12, flexShrink: 0 }}>
                    {addingIds.has(track.id) ? "Adding..." : "Add"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}