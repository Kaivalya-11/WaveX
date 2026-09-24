import React from 'react';
import { Search } from 'lucide-react';

export default function TopBar({ activeView, search, setSearch }) {
  // Only render the TopBar if we are explicitly on the Search view
  if (activeView !== "search") return null;

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "16px 24px", background: "transparent",
      position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ width: "100%", maxWidth: 600, position: "relative" }}>
        <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16 }}><Search size={16} /></span>
        <input
          autoFocus
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for tracks, artists..."
          style={{
            width: "100%",
            background: "#001d3d", border: "1px solid #003049", borderRadius: 24,
            padding: "12px 16px 12px 46px", color: "#fff", fontSize: 14,
            fontWeight: 500, outline: "none",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            transition: "border 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "#00b4d8"}
          onBlur={(e) => e.target.style.borderColor = "#003049"}
        />
      </div>
    </div>
  );
}
