import React from 'react';
import { DownloadCloud } from 'lucide-react';
import TrackList from '../components/TrackList';
import { usePlaylists } from '../context/PlaylistContext';

function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile;
}

export default function DownloadsView() {
  const { downloadedTracks } = usePlaylists();
  const isMobile = useIsMobile();

  return (
    <div style={{ padding: isMobile ? "0 16px 40px" : "0 32px 60px" }}>

      {/* Header */}
      <div style={{
        background: "linear-gradient(to bottom, #003049 0%, #050B14 100%)",
        padding: isMobile ? "60px 16px 24px" : "80px 32px 32px",
        margin: isMobile ? "0 -16px 24px" : "0 -32px 32px",
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "center" : "flex-end",
        gap: 20,
        textAlign: isMobile ? "center" : "left"
      }}>
        <div style={{
          width: isMobile ? 120 : 192,
          height: isMobile ? 120 : 192,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 12px 48px rgba(0,0,0,0.5)"
        }}>
          <DownloadCloud size={isMobile ? 48 : 80} color="#00b4d8" />
        </div>

        <div>
          <div style={{
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1.5,
            textTransform: "uppercase",
            color: "#fff",
            marginBottom: 8,
            opacity: 0.9
          }}>
            Collection
          </div>

          <h1 style={{
            fontSize: "clamp(32px, 8vw, 72px)",
            fontWeight: 900,
            margin: 0,
            color: "#fff",
            lineHeight: 1
          }}>
            Downloads
          </h1>

          <div style={{
            fontSize: 14,
            color: "#8d99ae",
            fontWeight: 700,
            marginTop: 12
          }}>
            {downloadedTracks.length} tracks saved locally
          </div>
        </div>
      </div>

      {/* Content */}
      {downloadedTracks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "#8d99ae" }}>
          <DownloadCloud size={48} style={{ opacity: 0.2 }} />
          <div style={{ fontSize: 20, fontWeight: 700 }}>
            Your downloads will appear here
          </div>
          <p>Click download on any song</p>
        </div>
      ) : (
        <TrackList tracks={downloadedTracks} />
      )}
    </div>
  );
}