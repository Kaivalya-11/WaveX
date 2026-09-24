import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './context/PlayerContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PlayerBar from './components/PlayerBar';
import HomeView from './views/HomeView';
import SearchView from './views/SearchView';
import PlaylistView from './views/PlaylistView';
import LyricsView from './views/LyricsView';
import DashboardView from './views/DashboardView';
import DownloadsView from './views/DownloadsView';
import AiPlaylistView from './views/AiPlaylistView';
import LoginPage from './views/LoginPage';
import { NotificationProvider } from './context/NotificationContext';
import { PlaylistProvider } from './context/PlaylistContext';
import NotificationPortal from './components/NotificationPortal';
import ImportModal from './components/ImportModal';
import { getTokenFromUrl } from './services/spotify';
import './App.css';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

function MainApp() {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();

  const [activeView, setActiveView] = useState(() => {
    try {
      return localStorage.getItem("soundify_active_view") || "home";
    } catch {
      return "home";
    }
  });

  const [activePlaylist, setActivePlaylist] = useState(null);
  const [search, setSearch] = useState("");
  const [spotifyToken, setSpotifyToken] = useState(null);

  const isDemo = localStorage.getItem("demo_mode") === "true";

  // 🔥 FIXED TOKEN HANDLING
  useEffect(() => {
    const token = getTokenFromUrl();

    if (token) {
      localStorage.setItem("spotify_token", token);
      setSpotifyToken(token);
      console.log("Spotify token saved:", token);
    } else {
      const existingToken = localStorage.getItem("spotify_token");
      if (existingToken) {
        setSpotifyToken(existingToken);
      }
    }
  }, []);

  const saveActiveView = (view) => {
    setActiveView(view);
    try {
      localStorage.setItem("soundify_active_view", view);
    } catch {}
  };

  const saveActivePlaylist = (playlist) => {
    setActivePlaylist(playlist);
    try {
      if (playlist?.id) {
        localStorage.setItem("soundify_active_playlist", playlist.id);
      } else {
        localStorage.removeItem("soundify_active_playlist");
      }
    } catch {}
  };

  // ✅ LOGIN / DEMO CHECK
  if (!currentUser && !isDemo) return <LoginPage />;

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `var(--sidebar-width, clamp(220px, 18vw, 280px)) 1fr`,
      gridTemplateRows: `1fr var(--player-height, 88px)`,
      gridTemplateAreas: `"sidebar main" "player player"`,
      height: "100vh",
      width: "100vw",
      background: "#000B18",
      color: "#fff",
      fontFamily: "'DM Sans', 'Inter', sans-serif",
      overflow: "hidden",
    }}>
      {/* Sidebar */}
      <div style={{ gridArea: "sidebar", overflow: "hidden" }}>
        <Sidebar
          activeView={activeView}
          setActiveView={saveActiveView}
          activePlaylist={activePlaylist}
          setActivePlaylist={saveActivePlaylist}
        />
      </div>

      {/* Main content area */}
      <div style={{
        gridArea: "main",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 60% at 70% 0%, #001d3d 0%, #000B18 60%)",
        minWidth: 0,
      }}>
        {/* TopBar (search only on search view) */}
        <TopBar
          activeView={activeView}
          search={search}
          setSearch={setSearch}
        />

        {/* Scrollable content */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          overflowX: "hidden",
          animation: "fadeInUp 0.35s ease",
          paddingBottom: isMobile ? 140 : 0,
        }}>
          {activeView === "home" && (
            <HomeView
              setActiveView={saveActiveView}
              setActivePlaylist={saveActivePlaylist}
            />
          )}

          {activeView === "search" && (
            <SearchView search={search} />
          )}

          {activeView === "lyrics" && <LyricsView />}
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "downloads" && <DownloadsView />}
          {activeView === "ai" && <AiPlaylistView />}

          {(activeView === "liked" || activeView === "playlist") && (
            <PlaylistView
              activeView={activeView}
              activePlaylist={activePlaylist}
              setActivePlaylist={saveActivePlaylist}
            />
          )}
        </div>
      </div>

      {/* Player — spans full width via grid area */}
      <div style={{ gridArea: "player" }}>
        <PlayerBar
          activeView={activeView}
          setActiveView={saveActiveView}
          activePlaylist={activePlaylist}
          setActivePlaylist={saveActivePlaylist}
        />
      </div>

      {/* Spotify Import Modal */}
      {spotifyToken && (
        <ImportModal
          token={spotifyToken}
          onClose={() => setSpotifyToken(null)}
        />
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          div[style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
            grid-template-rows: 1fr auto auto !important;
            grid-template-areas: "main" "player" "sidebar" !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <AuthProvider>
        <PlaylistProvider>
          <PlayerProvider>
            <MainApp />
            <NotificationPortal />
          </PlayerProvider>
        </PlaylistProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}