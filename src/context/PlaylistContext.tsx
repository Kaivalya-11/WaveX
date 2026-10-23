"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { API_BASE_URL } from '../services/api';
import { Playlist, Track } from '@/types/music';

import { CORE_TRACKS } from '@/lib/mediaAssets';

interface PlaylistContextType {
  customPlaylists: Playlist[];
  downloadedTracks: Track[];
  loading: boolean;
  addTrack: (playlistId: string, track: Track) => Promise<void>;
  createPlaylist: (name: string) => Promise<Playlist | undefined>;
  deletePlaylist: (playlistId: string) => Promise<void>;
  addDownload: (track: Track) => Promise<void>;
  removeDownload: (trackId: string) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType>({
  customPlaylists: [],
  downloadedTracks: [],
  loading: true,
  addTrack: async () => {},
  createPlaylist: async () => undefined,
  deletePlaylist: async () => {},
  addDownload: async () => {},
  removeDownload: async () => {},
});

export function usePlaylists() {
  return useContext(PlaylistContext);
}

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { showPrompt } = useNotification();
  const [customPlaylists, setCustomPlaylists] = useState<Playlist[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("wavex_downloads");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return CORE_TRACKS.slice(0, 4);
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (downloadedTracks.length > 0) {
        localStorage.setItem("wavex_downloads", JSON.stringify(downloadedTracks));
      }
    } catch {}
  }, [downloadedTracks]);

  const fetchPlaylists = useCallback(async () => {
    if (!currentUser) {
      setCustomPlaylists([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [plRes, dlRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/playlists?userId=${currentUser.uid}`),
        fetch(`${API_BASE_URL}/api/downloads?userId=${currentUser.uid}`)
      ]);
      const plData = await plRes.json();
      const dlData = await dlRes.json();

      setCustomPlaylists(Array.isArray(plData) ? plData : []);
      if (Array.isArray(dlData) && dlData.length > 0) {
        setDownloadedTracks(dlData.map((t: any) => ({
          ...t,
          id: t.trackId || t.id,
          src: t.src?.startsWith('blob:') ? '' : (t.src || '')
        })));
      }
    } catch (err) {
      console.error("Data Sync Error:", err);
      showPrompt("Failed to sync data with cloud.", "error");
    } finally {
      setLoading(false);
    }
  }, [currentUser, showPrompt]);

  useEffect(() => {
    fetchPlaylists();
  }, [fetchPlaylists]);

  const addTrack = async (playlistId: string, track: Track) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track })
      });
      if (!res.ok) throw new Error("Failed");
      await fetchPlaylists();
      showPrompt("Added to playlist!", "success");
    } catch (err) {
      console.error(err);
      showPrompt("Failed to add track.", "error");
      throw err;
    }
  };

  const createPlaylist = async (name: string): Promise<Playlist | undefined> => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/playlists`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, name })
      });
      if (!res.ok) throw new Error("Failed");
      const newPl = await res.json();
      await fetchPlaylists();
      showPrompt(`Playlist "${name}" created!`, "success");
      return newPl;
    } catch (err) {
      console.error(err);
      showPrompt("Failed to create playlist.", "error");
      throw err;
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Failed");
      await fetchPlaylists();
      showPrompt("Playlist deleted.", "success");
    } catch (err) {
      console.error(err);
      showPrompt("Failed to delete playlist.", "error");
      throw err;
    }
  };

  const addDownload = async (track: Track) => {
    if (!downloadedTracks.find(t => t.id === track.id)) {
      setDownloadedTracks(prev => [track, ...prev]);
      if (currentUser) {
        fetch(`${API_BASE_URL}/api/downloads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.uid, track })
        }).catch(console.error);
      }
    }
  };

  const removeDownload = async (trackId: string) => {
    setDownloadedTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/downloads/${trackId}?userId=${currentUser.uid}`, {
        method: 'DELETE'
      }).catch(console.error);
    }
  };

  const value = {
    customPlaylists,
    downloadedTracks,
    loading,
    addTrack,
    createPlaylist,
    deletePlaylist,
    addDownload,
    removeDownload
  };

  return (
    <PlaylistContext.Provider value={value}>
      {children}
    </PlaylistContext.Provider>
  );
}

