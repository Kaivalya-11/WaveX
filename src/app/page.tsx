"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import RightPanel from '@/components/RightPanel';
import PlayerBar from '@/components/PlayerBar';
import HomeView from '@/views/HomeView';
import SearchView from '@/views/SearchView';
import PlaylistView from '@/views/PlaylistView';
import LyricsView from '@/views/LyricsView';
import DashboardView from '@/views/DashboardView';
import DownloadsView from '@/views/DownloadsView';
import AiPlaylistView from '@/views/AiPlaylistView';
import LoginPage from '@/views/LoginPage';
import ImportModal from '@/components/ImportModal';
import { getTokenFromUrl } from '@/services/spotify';
import { Playlist } from '@/types/music';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return isMobile;
}

export default function App() {
  const { currentUser } = useAuth();
  const isMobile = useIsMobile();
  const [mounted, setMounted] = useState(false);

  const [activeView, setActiveView] = useState<string>("home");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [search, setSearch] = useState<string>("");
  const [spotifyToken, setSpotifyToken] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const savedView = localStorage.getItem("soundify_active_view");
      if (savedView) setActiveView(savedView);

      const demo = localStorage.getItem("demo_mode") === "true";
      setIsDemo(demo);

      const token = getTokenFromUrl();
      if (token) {
        localStorage.setItem("spotify_token", token);
        setSpotifyToken(token);
      } else {
        const existingToken = localStorage.getItem("spotify_token");
        if (existingToken) setSpotifyToken(existingToken);
      }
    } catch (e) {
      console.warn("Could not read localStorage:", e);
    }
  }, []);

  const saveActiveView = (view: string) => {
    setActiveView(view);
    try {
      localStorage.setItem("soundify_active_view", view);
    } catch {}
  };

  const saveActivePlaylist = (playlist: Playlist | null) => {
    setActivePlaylist(playlist);
    try {
      if (playlist?.id) {
        localStorage.setItem("soundify_active_playlist", playlist.id);
      } else {
        localStorage.removeItem("soundify_active_playlist");
      }
    } catch {}
  };

  // SSR hydration safety
  if (!mounted) {
    return (
      <div style={{ height: '100vh', width: '100vw', background: '#080C14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '3px solid #00E5FF', borderTopColor: 'transparent', animation: 'wx-spin 1s linear infinite' }} />
      </div>
    );
  }

  // Login / Demo gate
  if (!currentUser && !isDemo) {
    return <LoginPage />;
  }

  return (
    <div className="wx-app-shell">
      <style>{`
        .wx-app-shell {
          display: grid;
          height: 100vh;
          width: 100vw;
          background: var(--wx-bg);
          color: var(--wx-text);
          font-family: var(--font-family);
          overflow: hidden;
        }

        /* Desktop Layout (3 columns: Left Sidebar, Center Main, Right Panel + Bottom Player) */
        @media (min-width: 1200px) {
          .wx-app-shell {
            grid-template-columns: 240px minmax(0, 1fr) 330px;
            grid-template-rows: 1fr 90px;
            grid-template-areas:
              "sidebar main right"
              "player player player";
          }
          .wx-right-panel-container {
            display: block;
          }
        }

        /* Medium screens (2 columns: Left Sidebar, Center Main + Bottom Player) */
        @media (min-width: 768px) and (max-width: 1199px) {
          .wx-app-shell {
            grid-template-columns: 240px minmax(0, 1fr);
            grid-template-rows: 1fr 90px;
            grid-template-areas:
              "sidebar main"
              "player player";
          }
          .wx-right-panel-container {
            display: none;
          }
        }

        /* Mobile Layout (1 column + Bottom Player + Bottom Nav) */
        @media (max-width: 767px) {
          .wx-app-shell {
            grid-template-columns: 1fr;
            grid-template-rows: 1fr auto auto;
            grid-template-areas:
              "main"
              "player"
              "sidebar";
          }
          .wx-right-panel-container {
            display: none;
          }
        }
      `}</style>

      {/* 1. Left Sidebar Navigation */}
      <div style={{ gridArea: "sidebar", overflow: "hidden" }}>
        <Sidebar
          activeView={activeView}
          setActiveView={saveActiveView}
          activePlaylist={activePlaylist}
          setActivePlaylist={saveActivePlaylist}
        />
      </div>

      {/* 2. Main Content Area */}
      <div
        style={{
          gridArea: "main",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, #0c1527 0%, var(--wx-bg) 70%)",
          minWidth: 0,
        }}
      >
        {/* Scrollable View Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            animation: "fadeInUp 0.3s ease",
            paddingBottom: isMobile ? 140 : 20,
          }}
        >
          {activeView === "home" && (
            <HomeView
              setActiveView={saveActiveView}
              setActivePlaylist={saveActivePlaylist}
            />
          )}

          {activeView === "search" && (
            <SearchView search={search} onSearchChange={(v: string) => { setSearch(v); }} />
          )}

          {activeView === "lyrics" && <LyricsView />}
          {activeView === "dashboard" && <DashboardView />}
          {activeView === "downloads" && <DownloadsView setActiveView={saveActiveView} />}
          {activeView === "ai" && <AiPlaylistView />}

          {(activeView === "liked" || activeView === "playlist") && (
            <PlaylistView
              activeView={activeView}
              activePlaylist={activePlaylist}
              setActivePlaylist={saveActivePlaylist}
              setActiveView={saveActiveView}
            />
          )}
        </div>
      </div>

      {/* 3. Right Contextual Panel */}
      <div className="wx-right-panel-container" style={{ gridArea: "right", overflow: "hidden" }}>
        <RightPanel
          activeView={activeView}
          setActiveView={saveActiveView}
          onSearchQuery={(q) => {
            setSearch(q);
            saveActiveView("search");
          }}
        />
      </div>

      {/* 4. Bottom Player Bar */}
      <div style={{ gridArea: "player" }}>
        <PlayerBar
          activeView={activeView}
          setActiveView={saveActiveView}
        />
      </div>

      {/* Spotify Import Modal */}
      {spotifyToken && (
        <ImportModal
          token={spotifyToken}
          onClose={() => setSpotifyToken(null)}
        />
      )}
    </div>
  );
}
