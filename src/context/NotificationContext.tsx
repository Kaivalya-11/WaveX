"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { NotificationState } from '@/types/music';

interface NotificationContextType {
  notification: NotificationState;
  showPrompt: (message: string, type?: 'info' | 'success' | 'warning' | 'error', onConfirm?: (() => void) | null) => void;
  hidePrompt: () => void;
}

const NotificationContext = createContext<NotificationContextType>({
  notification: { isOpen: false, message: '', type: 'info', onConfirm: null },
  showPrompt: () => {},
  hidePrompt: () => {},
});

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationState>({
    isOpen: false,
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const showPrompt = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
    onConfirm: (() => void) | null = null
  ) => {
    setNotification({
      isOpen: true,
      message,
      type,
      onConfirm,
    });
  };

  const hidePrompt = () => {
    setNotification(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <NotificationContext.Provider value={{ showPrompt, hidePrompt, notification }}>
      {children}
    </NotificationContext.Provider>
  );
}

