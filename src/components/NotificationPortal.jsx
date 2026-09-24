import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationPortal() {
  const { notification, hidePrompt } = useNotification();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (notification.isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [notification.isOpen]);

  if (!isVisible && !notification.isOpen) return null;

  const getIcon = () => {
    switch (notification.type) {
      case 'success': return <CheckCircle size={32} color="#4ade80" />;
      case 'error': return <XCircle size={32} color="#f87171" />;
      case 'warning': return <AlertCircle size={32} color="#fbbf24" />;
      default: return <Info size={32} color="#60a5fa" />;
    }
  };

  const colors = {
    info: 'linear-gradient(135deg, #1e3a8a, #001d3d)',
    success: 'linear-gradient(135deg, #064e3b, #065f46)',
    error: 'linear-gradient(135deg, #7f1d1d, #991b1b)',
    warning: 'linear-gradient(135deg, #78350f, #92400e)',
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      opacity: notification.isOpen ? 1 : 0,
      transition: 'opacity 0.3s ease',
      padding: '24px',
    }}>
      <div style={{
        width: 'min(420px, 90%)',
        background: '#050B14',
        border: '1px solid #10283e',
        borderRadius: 24,
        padding: '32px 24px',
        boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
        color: '#fff',
        transform: notification.isOpen ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
        transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle Accent Glow */}
        <div style={{
          position: 'absolute',
          top: -50,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 200,
          height: 100,
          background: notification.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(0, 180, 216, 0.15)',
          filter: 'blur(40px)',
          borderRadius: '50%',
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
            {getIcon()}
          </div>

          <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 2, color: '#8d99ae', marginBottom: 12 }}>
            Notification
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.5, marginBottom: 32, color: '#f1f5f9' }}>
            {notification.message}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => {
                if (notification.onConfirm) notification.onConfirm();
                hidePrompt();
              }}
              style={{
                flex: 1,
                padding: '14px 20px',
                borderRadius: 16,
                border: 'none',
                background: notification.type === 'error' ? '#ef4444' : '#00b4d8',
                color: '#fff',
                fontWeight: 800,
                fontSize: 15,
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(0, 180, 216, 0.3)',
                transition: 'transform 0.1s, background 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              OK
            </button>
            
            {notification.onConfirm && (
               <button
               onClick={hidePrompt}
               style={{
                 flex: 1,
                 padding: '14px 20px',
                 borderRadius: 16,
                 border: '1px solid #10283e',
                 background: 'transparent',
                 color: '#8d99ae',
                 fontWeight: 800,
                 fontSize: 15,
                 cursor: 'pointer',
                 transition: 'background 0.2s',
               }}
               onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
               onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
             >
               Cancel
             </button>
            )}
          </div>
        </div>

        <button
          onClick={hidePrompt}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            color: '#4b5563',
            cursor: 'pointer',
            padding: 8,
            transition: 'color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = '#4b5563'}
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
