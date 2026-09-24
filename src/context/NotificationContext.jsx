import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState({
    isOpen: false,
    message: '',
    type: 'info',
    onConfirm: null,
  });

  const showPrompt = (message, type = 'info', onConfirm = null) => {
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
