import React, { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { fetchLyrics } from '../services/api';

function parseLRC(lrcText) {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');

  return lines.map(line => {
    const match = line.match(/\[(\d+):(\d+(?:\.\d+)?)\](.*)/);
    if (!match) return null;

    const min = parseInt(match[1]);
    const sec = parseFloat(match[2]);

    return {
      time: min * 60 + sec,
      text: match[3].trim()
    };
  }).filter(Boolean);
}

export default function LyricsView() {
  const { currentTrack, progress, seek } = usePlayer();

  const [lyrics, setLyrics] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (!currentTrack) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);

    fetchLyrics(currentTrack.title, currentTrack.artist)
      .then(res => {
        setLyrics(parseLRC(res));
        setLoading(false);
      })
      .catch(() => setLoading(false));

  }, [currentTrack]);

  const activeIndex = lyrics.findIndex((line, i) => {
    return progress >= line.time &&
      (i === lyrics.length - 1 || progress < lyrics[i + 1].time);
  });

  useEffect(() => {
    if (scrollRef.current && activeIndex >= 0) {
      const el = scrollRef.current.children[activeIndex];
      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  }, [activeIndex]);

  const bgImage = currentTrack?.cover;

  return (
    <div style={{
      height: "100%",
      overflowY: "auto",
      display: "flex",
      justifyContent: "center",
      padding: "60px 20px 120px",

      background: `
        linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.95)),
        url(${bgImage})
      `,
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <div
        ref={scrollRef}
        style={{
          width: "100%",
          maxWidth: 700,
          textAlign: "center",
          background: "rgba(0,0,0,0.4)",
          borderRadius: 20,
          padding: "20px",
          backdropFilter: "blur(10px)"
        }}
      >
        {loading && (
          <p style={{ color: "#8d99ae" }}>Loading lyrics...</p>
        )}

        {!loading && lyrics.map((line, i) => {
          const active = i === activeIndex;

          return (
            <p
              key={i}
              onClick={() => seek(line.time)}
              style={{
                fontSize: active ? 34 : 20,
                fontWeight: active ? 900 : 600,
                color: active ? "#fff" : "#6c7a89",
                margin: "16px 0",
                cursor: "pointer",
                transition: "all 0.4s ease",
                transform: active ? "scale(1.08)" : "scale(1)",
                opacity: active ? 1 : 0.5,
                filter: active ? "blur(0px)" : "blur(1px)",
                textShadow: active ? "0 0 20px rgba(255,255,255,0.4)" : "none",
                lineHeight: 1.6,
                wordBreak: "break-word"
              }}
            >
              {line.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}