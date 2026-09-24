import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';

const PlaylistContext = createContext();

export function usePlaylists() {
  return useContext(PlaylistContext);
}

export function PlaylistProvider({ children }) {
  const { currentUser } = useAuth();
  const { showPrompt } = useNotification();
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const [downloadedTracks, setDownloadedTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Still optionally persist to localStorage for immediate UI reads or offline
  useEffect(() => {
    localStorage.setItem("wavex_downloads", JSON.stringify(downloadedTracks));
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
        fetch(`http://localhost:5000/api/playlists?userId=${currentUser.uid}`),
        fetch(`http://localhost:5000/api/downloads?userId=${currentUser.uid}`)
      ]);
      const plData = await plRes.json();
      const dlData = await dlRes.json();
      
      setCustomPlaylists(Array.isArray(plData) ? plData : []);
      if (Array.isArray(dlData)) {
        setDownloadedTracks(dlData.map(t => ({
          ...t,
          id: t.trackId,
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

  const addTrack = async (playlistId, track) => {
    try {
      const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}/tracks`, {
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

  const createPlaylist = async (name) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`http://localhost:5000/api/playlists`, {
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

  const deletePlaylist = async (playlistId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/playlists/${playlistId}`, {
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

  const addDownload = async (track) => {
    if (!downloadedTracks.find(t => t.id === track.id)) {
      setDownloadedTracks(prev => [track, ...prev]);
      if (currentUser) {
        fetch(`http://localhost:5000/api/downloads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.uid, track })
        }).catch(console.error);
      }
    }
  };

  const removeDownload = async (trackId) => {
    setDownloadedTracks(prev => prev.filter(t => t.id !== trackId));
    if (currentUser) {
      fetch(`http://localhost:5000/api/downloads/${trackId}?userId=${currentUser.uid}`, {
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
