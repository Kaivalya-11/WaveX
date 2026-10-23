"use client";

import React, { ReactNode } from 'react';
import { NotificationProvider } from '@/context/NotificationContext';
import { AuthProvider } from '@/context/AuthContext';
import { PlaylistProvider } from '@/context/PlaylistContext';
import { PlayerProvider } from '@/context/PlayerContext';
import { DeviceProvider } from '@/context/DeviceContext';
import NotificationPortal from '@/components/NotificationPortal';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider>
      <AuthProvider>
        <DeviceProvider>
          <PlaylistProvider>
            <PlayerProvider>
              {children}
              <NotificationPortal />
            </PlayerProvider>
          </PlaylistProvider>
        </DeviceProvider>
      </AuthProvider>
    </NotificationProvider>
  );
}

