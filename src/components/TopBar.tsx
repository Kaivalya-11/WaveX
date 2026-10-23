"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  activeView: string;
  search: string;
  setSearch: (value: string) => void;
}

export default function TopBar({ activeView, search, setSearch }: TopBarProps) {
  const { currentUser } = useAuth();
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // ⌘K / Ctrl+K shortcut to focus search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeView]);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '14px 24px',
      background: 'transparent',
      borderBottom: '1px solid var(--wx-border)',
      position: 'sticky',
      top: 0,
      zIndex: 20,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      backgroundColor: 'rgba(3,9,20,0.8)',
      flexShrink: 0,
    }}>
      {/* Search field */}
      <div style={{ flex: 1, maxWidth: 540, position: 'relative' }}>
        <label htmlFor="topbar-search" className="visually-hidden">Search for tracks, artists, or albums</label>
        <Search
          size={16}
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? 'var(--wx-cyan)' : 'var(--wx-text-muted)',
            pointerEvents: 'none', transition: 'color 0.15s',
          }}
        />
        <input
          id="topbar-search"
          ref={inputRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search for tracks, artists, or albums…"
          autoComplete="off"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: focused ? 'var(--wx-surface-raised)' : 'var(--wx-surface)',
            border: `1px solid ${focused ? 'var(--wx-cyan)' : 'var(--wx-border)'}`,
            borderRadius: 100,
            padding: '10px 44px 10px 42px',
            color: 'var(--wx-text)',
            fontSize: 14,
            fontWeight: 500,
            outline: 'none',
            boxShadow: focused ? '0 0 0 3px rgba(0,210,255,0.12)' : 'none',
            transition: 'all 0.18s ease',
            fontFamily: 'var(--font-family)',
          }}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            aria-label="Clear search"
            style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--wx-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 2,
            }}
          >
            <X size={14} />
          </button>
        )}
        {!search && !focused && (
          <kbd style={{
            position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'var(--wx-border)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 6, padding: '2px 7px', fontSize: 11, color: 'var(--wx-text-muted)',
            fontFamily: 'monospace', pointerEvents: 'none', lineHeight: 1.6,
          }}>
            Ctrl K
          </kbd>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        {currentUser && (
          <div style={{ fontSize: 13, color: 'var(--wx-text-muted)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            <img
              src={currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`}
              alt=""
              aria-hidden="true"
              style={{ width: 30, height: 30, borderRadius: 8, objectFit: 'cover', border: '1.5px solid var(--wx-border)' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.displayName || 'User'}`; }}
            />
          </div>
        )}
      </div>
    </header>
  );
}

