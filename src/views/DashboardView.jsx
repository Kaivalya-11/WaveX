import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getSpotifyAuthUrl } from '../services/spotify';
import { Share2 } from 'lucide-react';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function DashboardView() {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const isMobile = useIsMobile();

  if (!currentUser) {
    return (
      <div style={{ padding: 40, color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%" }}>
        <h1 style={{ fontSize: isMobile ? 32 : 48, fontWeight: 900, marginBottom: 16, textAlign: 'center' }}>Welcome to Wavex</h1>
        <p style={{ color: "#8d99ae", marginBottom: 32, fontSize: isMobile ? 15 : 18, textAlign: 'center' }}>Log in to save settings and create custom playlists.</p>
        <button onClick={loginWithGoogle} style={{ padding: "16px 32px", borderRadius: 30, background: "#00b4d8", color: "#000", border: "none", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
          Log In With Google
        </button>
      </div>
    );
  }

  const photoURL = currentUser?.photoURL || currentUser?.providerData?.[0]?.photoURL;
  const highResPhoto = photoURL?.replace(/=s96-c/, "=s400-c") || photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName || 'User'}`;
  const px = isMobile ? 16 : 40;

  return (
    <div style={{ padding: `${isMobile ? 24 : 40}px ${px}px`, color: "#fff", maxWidth: 800, margin: "0 auto" }}>
      {/* Profile Header */}
      <div style={{
        display: "flex", alignItems: isMobile ? "center" : "center",
        flexDirection: isMobile ? "column" : "row",
        gap: isMobile ? 16 : 24, marginBottom: isMobile ? 32 : 48,
        textAlign: isMobile ? "center" : "left"
      }}>
        <img src={highResPhoto} alt="User"
          onError={(e) => { e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.displayName || 'User'}`; }}
          style={{ width: isMobile ? 100 : 150, height: isMobile ? 100 : 150, borderRadius: "50%", border: "4px solid #00b4d8", boxShadow: "0 10px 30px rgba(0,180,216,0.3)", flexShrink: 0 }} />
        <div style={{ overflow: "hidden" }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#00b4d8", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}>Profile</div>
          <h1 style={{ fontSize: isMobile ? 32 : 56, fontWeight: 900, margin: "0 0 8px", letterSpacing: -1, lineHeight: 1.1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {currentUser.displayName}
          </h1>
          <p style={{ color: "#8d99ae", fontSize: isMobile ? 13 : 16, margin: 0 }}>{currentUser.email}</p>
        </div>
      </div>

      <div style={{ height: 1, background: "#101828", margin: "0 0 24px" }} />

      <h2 style={{ fontSize: isMobile ? 18 : 24, fontWeight: 800, marginBottom: 16 }}>Settings</h2>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Audio Quality */}
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", padding: isMobile ? 16 : 24, background: "#050B14", borderRadius: 12, border: "1px solid #101828", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Audio Quality</h3>
            <p style={{ margin: "6px 0 0", color: "#8d99ae", fontSize: 12 }}>Stream in the highest possible quality.</p>
          </div>
          <select style={{ background: "#001d3d", color: "#fff", border: "1px solid #003049", padding: "8px 14px", borderRadius: 8, outline: "none", fontSize: 13, flexShrink: 0 }}>
            <option>320kbps (Premium)</option>
            <option>128kbps (Standard)</option>
          </select>
        </div>

        {/* Explicit Content */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? 16 : 24, background: "#050B14", borderRadius: 12, border: "1px solid #101828" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Explicit Content</h3>
            <p style={{ margin: "6px 0 0", color: "#8d99ae", fontSize: 12 }}>Allow explicit rated content.</p>
          </div>
          <input type="checkbox" defaultChecked style={{ width: 20, height: 20, cursor: "pointer", accentColor: "#00b4d8" }} />
        </div>

        {/* Spotify Import */}
        <div style={{ display: "flex", alignItems: isMobile ? "flex-start" : "center", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", padding: isMobile ? 16 : 24, background: "#050B14", borderRadius: 12, border: "1px solid #101828", gap: 12 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Import from Spotify</h3>
            <p style={{ margin: "6px 0 0", color: "#8d99ae", fontSize: 12 }}>Bring your playlists and saved tracks from Spotify.</p>
          </div>
          <button
            onClick={() => {
              const url = getSpotifyAuthUrl();
              if (url) window.location.href = url;
              else alert("Please configure a Spotify Client ID in src/services/spotify.js");
            }}
            style={{ padding: "10px 20px", borderRadius: 20, border: "none", background: "#1DB954", color: "#fff", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontSize: 13, flexShrink: 0, whiteSpace: 'nowrap' }}>
            <Share2 size={16} /> Connect Spotify
          </button>
        </div>

        {/* Log Out */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobile ? 16 : 24, background: "#050B14", borderRadius: 12, border: "1px solid #101828" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15 }}>Log Out</h3>
            <p style={{ margin: "6px 0 0", color: "#8d99ae", fontSize: 12 }}>Disconnect your Google Account from Wavex.</p>
          </div>
          <button onClick={logout} style={{ padding: "8px 20px", borderRadius: 20, border: "2px solid #e63946", background: "transparent", color: "#e63946", fontWeight: 800, cursor: "pointer", fontSize: 13, whiteSpace: 'nowrap' }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}