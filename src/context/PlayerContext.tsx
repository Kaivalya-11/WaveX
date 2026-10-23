"use client";

import React, { createContext, useContext, useRef, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useNotification } from "./NotificationContext";
import { API_BASE_URL } from "../services/api";
import { Track } from "@/types/music";
import { CORE_TRACKS, getFallbackCover } from "@/lib/mediaAssets";

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  togglePlay: () => void;
  playTrack: (track: Track, trackList?: Track[]) => void;
  progress: number;
  duration: number;
  seek: (time: number) => void;
  shuffle: boolean;
  setShuffle: (shuffle: boolean) => void;
  repeat: "off" | "all" | "one";
  setRepeat: (repeat: "off" | "all" | "one") => void;
  liked: Set<string>;
  likedTracks: Track[];
  toggleLike: (track: Track) => void;
  recentlyPlayed: Track[];
  playNext: () => void;
  playPrev: () => void;
  isBuffering: boolean;
  hasError: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  setIsMuted: (isMuted: boolean) => void;
  registerBlobUrl?: (trackId: string, url: string) => void;
}

const PlayerContext = createContext<PlayerContextType>({
  currentTrack: null,
  isPlaying: false,
  togglePlay: () => {},
  playTrack: () => {},
  progress: 0,
  duration: 0,
  seek: () => {},
  shuffle: false,
  setShuffle: () => {},
  repeat: "off",
  setRepeat: () => {},
  liked: new Set(),
  likedTracks: [],
  toggleLike: () => {},
  recentlyPlayed: [],
  playNext: () => {},
  playPrev: () => {},
  isBuffering: false,
  hasError: false,
  volume: 1,
  setVolume: () => {},
  isMuted: false,
  setIsMuted: () => {},
});

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<"off" | "all" | "one">("off");
  const { currentUser } = useAuth();
  const { showPrompt } = useNotification();

  const [likedTracks, setLikedTracks] = useState<Track[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("wavex_liked_songs");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {}
    }
    return CORE_TRACKS;
  });

  const [liked, setLiked] = useState<Set<string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem("wavex_liked_songs");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return new Set(parsed.map((item: any) => item.trackId || item.id));
          }
        }
      } catch {}
    }
    return new Set(CORE_TRACKS.map(t => t.id));
  });

  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const playRequestIdRef = useRef(0);
  const handleNextRef = useRef<() => void>(() => {});

  // Fetch user data from DB on load and sync with local storage
  useEffect(() => {
    if (currentUser) {
      fetch(`${API_BASE_URL}/api/likes?userId=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            const mapped: Track[] = data.map((item: any) => ({
              id: item.trackId || item.id,
              trackId: item.trackId || item.id,
              title: item.title || 'Unknown Title',
              artist: item.artist || 'Unknown Artist',
              album: item.album || 'Single',
              duration: item.duration || 213,
              cover: item.cover || getFallbackCover(item.trackId || item.id),
              src: item.src || `/api/stream?videoId=${item.trackId || item.id}`,
              dateAdded: item.dateAdded || 'Recently',
            }));
            setLikedTracks(mapped);
            setLiked(new Set(mapped.map(t => t.id)));
            try {
              localStorage.setItem("wavex_liked_songs", JSON.stringify(mapped));
            } catch {}
          }
        })
        .catch(err => console.warn('[WaveX Player] Likes sync notice:', err.message));

      fetch(`${API_BASE_URL}/api/history?userId=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRecentlyPlayed(data);
          }
        })
        .catch(err => console.warn('[WaveX Player] History sync notice:', err.message));
    }
  }, [currentUser]);

  // Initialize HTML5 Audio instance ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const audio = new Audio();
    audioRef.current = audio;
    audio.volume = isMuted ? 0 : volume;
    audio.muted = isMuted;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setHasError(false);
    };
    const onEnded = () => {
      setIsPlaying(false);
      handleNextRef.current();
    };
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };
    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onError = () => {
      if (!audio.src || audio.src === '' || audio.src === window.location.href) {
        return;
      }
      const err = audio.error;
      const codeNames: Record<number, string> = {
        1: 'MEDIA_ERR_ABORTED',
        2: 'MEDIA_ERR_NETWORK',
        3: 'MEDIA_ERR_DECODE',
        4: 'MEDIA_ERR_SRC_NOT_SUPPORTED',
      };
      const networkStates = ['NETWORK_EMPTY', 'NETWORK_IDLE', 'NETWORK_LOADING', 'NETWORK_NO_SOURCE'];
      const readyStates = ['HAVE_NOTHING', 'HAVE_METADATA', 'HAVE_CURRENT_DATA', 'HAVE_FUTURE_DATA', 'HAVE_ENOUGH_DATA'];
      const codeDesc = err?.code ? `${err.code} (${codeNames[err.code] || 'UNKNOWN'})` : 'none';
      console.warn(
        `[WaveX Player] Audio playback error:\n` +
        `code=${codeDesc}\n` +
        `message="${err?.message || ''}"\n` +
        `src="${audio.src}"\n` +
        `currentSrc="${audio.currentSrc || 'none'}"\n` +
        `networkState=${audio.networkState} (${networkStates[audio.networkState] || 'UNKNOWN'})\n` +
        `readyState=${audio.readyState} (${readyStates[audio.readyState] || 'UNKNOWN'})`
      );
      setIsPlaying(false);
      setIsBuffering(false);
      setHasError(true);
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('error', onError);
      audio.pause();
    };
  }, []); // Run strictly once on mount

  // Sync volume and mute changes to active audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!currentTrack || !audioRef.current) return;
    if (hasError) {
      playTrack(currentTrack, queue);
      return;
    }
    if (audioRef.current.paused) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          if (err.name !== 'AbortError') {
            console.warn("[WaveX Player] Toggle play error:", err.message || err);
          }
        });
      }
    } else {
      audioRef.current.pause();
    }
  };

  const seek = (time: number) => {
    if (audioRef.current && Number.isFinite(time)) {
      try {
        audioRef.current.currentTime = Math.max(0, Math.min(time, duration || time));
        setProgress(time);
      } catch (e) {
        console.warn("[WaveX Player] Seek error:", e);
      }
    }
  };

  const playTrack = (track: Track, trackList: Track[] = []) => {
    if (!track) return;
    const trackId = track.id || (track as any).trackId;
    if (!trackId) return;

    const normalizedTrack: Track = {
      ...track,
      id: trackId,
      trackId: trackId,
    };

    setRecentlyPlayed(prevHistory => {
      const remainingHistory = prevHistory.filter(t => t.id !== trackId && (t as any).trackId !== trackId);
      return [normalizedTrack, ...remainingHistory].slice(0, 10);
    });

    setProgress(0);
    setQueue(trackList.length > 0 ? trackList : [normalizedTrack]);

    if (currentTrack?.id === trackId && audioRef.current && audioRef.current.src) {
      if (hasError) {
        // Retry playing
      } else if (isBuffering) {
        return;
      } else {
        togglePlay();
        return;
      }
    }

    setCurrentTrack(normalizedTrack);
    setHasError(false);
    setIsBuffering(true);

    if (audioRef.current) {
      const streamUrl = `/api/stream?videoId=${encodeURIComponent(trackId)}`;

      console.log("[WaveX Player] Track:", normalizedTrack.title);
      console.log("[WaveX Player] Playable ID:", trackId);
      console.log("[WaveX Player] Audio URL:", streamUrl);

      const requestId = ++playRequestIdRef.current;

      let effectiveVolume = volume;
      if (volume <= 0.01 && !isMuted) {
        effectiveVolume = 1;
        setVolume(1);
      }

      audioRef.current.src = streamUrl;
      audioRef.current.volume = isMuted ? 0 : effectiveVolume;
      audioRef.current.muted = isMuted;
      audioRef.current.load();
      console.log("[WaveX Player] Playback Volume:", audioRef.current.volume, "Muted:", audioRef.current.muted);
      setDuration(normalizedTrack.duration || 0);

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            if (requestId !== playRequestIdRef.current) return;
            console.log("[WaveX Player] Play started successfully:", normalizedTrack.title);
            setIsPlaying(true);
            setIsBuffering(false);
            setHasError(false);
            if (currentUser) {
              fetch(`${API_BASE_URL}/api/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, track: normalizedTrack })
              }).catch(err => console.warn("History sync failed", err));
            }
          })
          .catch(err => {
            if (requestId !== playRequestIdRef.current) return;
            if (err.name === 'AbortError') {
              return;
            }
            console.warn(`[WaveX Player] Play rejected for "${normalizedTrack.title}":`, err.message || err);
            setIsPlaying(false);
            setIsBuffering(false);
            setHasError(true);
          });
      }
    }
  };

  const handleNext = () => {
    if (!queue.length) return;
    let nextIndex = queue.findIndex((t) => t.id === currentTrack?.id);
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = nextIndex + 1;
    }

    if (nextIndex >= queue.length) {
      if (repeat === "all") nextIndex = 0;
      else return;
    }
    playTrack(queue[nextIndex], queue);
  };

  const handlePrev = () => {
    if (!queue.length) return;
    let prevIndex = queue.findIndex((t) => t.id === currentTrack?.id) - 1;
    if (prevIndex < 0) prevIndex = 0;
    playTrack(queue[prevIndex], queue);
  };

  useEffect(() => {
    handleNextRef.current = handleNext;
  });

  const toggleLike = (track: Track) => {
    if (!track) return;
    const trackId = track.id || (track as any).trackId;
    if (!trackId) return;

    const normalizedTrack: Track = {
      ...track,
      id: trackId,
      trackId: trackId,
      cover: track.cover || getFallbackCover(trackId),
      dateAdded: (track as any).dateAdded || 'Just now',
      album: track.album || 'Single',
    };

    const isCurrentlyLiked = liked.has(trackId);

    // 1. Immediately update fast O(1) set
    setLiked((prev) => {
      const next = new Set(prev);
      if (isCurrentlyLiked) {
        next.delete(trackId);
      } else {
        next.add(trackId);
      }
      return next;
    });

    // 2. Immediately update full liked tracks playlist and persist locally
    setLikedTracks((prev) => {
      let next: Track[];
      if (isCurrentlyLiked) {
        next = prev.filter(t => (t.id || (t as any).trackId) !== trackId);
      } else {
        next = [normalizedTrack, ...prev.filter(t => (t.id || (t as any).trackId) !== trackId)];
      }
      try {
        localStorage.setItem("wavex_liked_songs", JSON.stringify(next));
      } catch {}
      return next;
    });

    // 3. User feedback notification toast
    if (isCurrentlyLiked) {
      showPrompt(`Removed "${track.title}" from Liked Songs`, 'info');
    } else {
      showPrompt(`Added "${track.title}" to Liked Songs`, 'success');
    }

    // 4. Background DB synchronization when signed in
    if (currentUser) {
      if (isCurrentlyLiked) {
        fetch(`${API_BASE_URL}/api/likes/${trackId}?userId=${currentUser.uid}`, {
          method: 'DELETE'
        }).catch(err => console.warn('Delete like sync notice:', err.message));
      } else {
        fetch(`${API_BASE_URL}/api/likes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.uid, track: normalizedTrack })
        }).catch(err => console.warn('Add like sync notice:', err.message));
      }
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        togglePlay,
        playTrack,
        progress,
        duration,
        seek,
        shuffle,
        setShuffle,
        repeat,
        setRepeat,
        liked,
        likedTracks,
        toggleLike,
        recentlyPlayed,
        playNext: handleNext,
        playPrev: handlePrev,
        isBuffering,
        hasError,
        volume,
        setVolume,
        isMuted,
        setIsMuted
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => useContext(PlayerContext);

