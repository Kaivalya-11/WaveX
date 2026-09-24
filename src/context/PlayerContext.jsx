import { createContext, useContext, useRef, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const PlayerContext = createContext();

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState("off");
  const { currentUser } = useAuth();
  
  const [liked, setLiked] = useState(new Set());
  const [recentlyPlayed, setRecentlyPlayed] = useState([]);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Fetch user data from DB on load
  useEffect(() => {
    if (currentUser) {
      // Fetch Likes
      fetch(`http://localhost:5000/api/likes?userId=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setLiked(new Set(data.map(item => item.trackId)));
          }
        })
        .catch(console.error);
        
      // Fetch History
      fetch(`http://localhost:5000/api/history?userId=${currentUser.uid}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRecentlyPlayed(data);
          }
        })
        .catch(console.error);
    } else {
      setLiked(new Set());
      setRecentlyPlayed([]);
    }
  }, [currentUser]);
  
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    // Initialize native Audio element
    audioRef.current = new Audio();
    audioRef.current.crossOrigin = "anonymous";
    
    const audio = audioRef.current;
    
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => {
      if (!hasError) setIsBuffering(true);
    };
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

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.pause();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const playTrack = (track, trackList = []) => {
    if (!track || !track.id) return;
    
    // Add to local state immediately
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(t => t.id !== track.id && t.trackId !== track.id);
      const newTrack = { ...track, trackId: track.id };
      return [newTrack, ...filtered].slice(0, 10);
    });
    
    setProgress(0);
    
    setCurrentTrack(track);
    setQueue(trackList);
    setHasError(false);
    
    if (audioRef.current) {
      const sourceUrl = track.src || `http://localhost:5000/api/stream?videoId=${track.id}`;
      
      console.log("[WaveX Player] Track:", track.title);
      console.log("[WaveX Player] Playable ID:", track.id);
      console.log("[WaveX Player] Audio URL:", sourceUrl);
      
      if (!sourceUrl) {
        console.error("No playable media source was resolved for this track.");
        setHasError(true);
        return;
      }
      
      // Use the native backend stream
      audioRef.current.src = sourceUrl;
      // Set a fallback duration if available since stream duration might not be immediately known
      setDuration(track.duration || 0);
      
      // Explicitly load the new source before playing
      audioRef.current.load();
      
      console.log("[WaveX Player] Play requested");
      audioRef.current.play()
        .then(() => {
          console.log("[WaveX Player] Play started");
          // Persist history to backend when playback genuinely succeeds
          if (currentUser) {
            fetch(`http://localhost:5000/api/history`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: currentUser.uid, track })
            }).catch(err => console.error("History sync failed", err));
          }
        })
        .catch(err => {
          console.error("[WaveX Player] Playback error:", err);
          setIsPlaying(false);
          setIsBuffering(false);
          setHasError(true);
      });
    }
  };

  const togglePlay = () => {
    if (!currentTrack || !audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play().catch(console.error);
    } else {
      audioRef.current.pause();
    }
  };

  const seek = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleNext = () => {
    if (!queue.length) return;
    let index = queue.findIndex((t) => t.id === currentTrack?.id);
    if (shuffle) {
      index = Math.floor(Math.random() * queue.length);
    } else {
      index = index + 1;
    }

    if (index >= queue.length) {
      if (repeat === "all") index = 0;
      else return;
    }
    playTrack(queue[index], queue);
  };

  const handlePrev = () => {
    if (!queue.length) return;
    let index = queue.findIndex((t) => t.id === currentTrack?.id) - 1;
    if (index < 0) index = 0;
    playTrack(queue[index], queue);
  };

  const handleNextRef = useRef(handleNext);
  useEffect(() => { handleNextRef.current = handleNext; }, [handleNext]);

  const toggleLike = (track) => {
    if (!currentUser || !track || !track.id) return;
    
    const isLiked = liked.has(track.id);
    
    // Optimistic UI Update
    setLiked((prev) => {
      const newSet = new Set(prev);
      isLiked ? newSet.delete(track.id) : newSet.add(track.id);
      return newSet;
    });
    
    // Backend Sync
    if (isLiked) {
      fetch(`http://localhost:5000/api/likes/${track.id}?userId=${currentUser.uid}`, {
        method: 'DELETE'
      }).catch(console.error);
    } else {
      fetch(`http://localhost:5000/api/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid, track })
      }).catch(console.error);
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