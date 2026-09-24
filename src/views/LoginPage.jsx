import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Music2, Play, Users, Sparkles, LogIn, Eye } from 'lucide-react';

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

export default function LoginPage() {
  const { loginWithGoogle } = useAuth();
  const isMobile = useIsMobile();

  // ✅ DEMO MODE
  const handleDemoLogin = () => {
    localStorage.setItem("demo_mode", "true");
    window.location.reload();
  };

  // ✅ GOOGLE LOGIN HANDLER (FIXED)
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("Login failed. Check console.");
    }
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#000814',
      color: '#fff',
      fontFamily: "'DM Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Background Effects */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '-10%',
        width: '60%',
        height: '60%',
        background: 'radial-gradient(circle, rgba(0, 180, 216, 0.15) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '-10%',
        width: '50%',
        height: '50%',
        background: 'radial-gradient(circle, rgba(0, 119, 182, 0.1) 0%, transparent 70%)',
        filter: 'blur(80px)',
        zIndex: 0
      }} />

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
        padding: isMobile ? '20px' : '24px'
      }}>

        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: isMobile ? 32 : 48,
          animation: 'fadeInDown 0.8s ease-out'
        }}>
          <div style={{
            width: isMobile ? 56 : 72,
            height: isMobile ? 56 : 72,
            background: 'linear-gradient(135deg, #0077b6, #00b4d8)',
            borderRadius: isMobile ? 18 : 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 16px 32px rgba(0, 180, 216, 0.3)'
          }}>
            <Music2 size={isMobile ? 30 : 40} color="#fff" strokeWidth={2.5} />
          </div>

          <span style={{
            fontSize: isMobile ? 36 : 48,
            fontWeight: 900,
            letterSpacing: -2
          }}>
            Wavex
          </span>
        </div>

        {/* Hero Text */}
        <h1 style={{
          fontSize: 'min(56px, 10vw)',
          fontWeight: 900,
          textAlign: 'center',
          lineHeight: 1.1,
          marginBottom: isMobile ? 16 : 24,
          background: 'linear-gradient(to bottom, #fff, #94a3b8)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'fadeInUp 0.8s ease-out 0.2s both'
        }}>
          Your Music,<br />Evolved.
        </h1>

        <p style={{
          fontSize: isMobile ? 16 : 18,
          color: '#94a3b8',
          textAlign: 'center',
          maxWidth: 480,
          lineHeight: 1.6,
          marginBottom: isMobile ? 32 : 48,
          animation: 'fadeInUp 0.8s ease-out 0.4s both'
        }}>
          Experience the next generation of audio streaming. High-fidelity sound, 
          synchronized lyrics, and personalized playlists at your fingertips.
        </p>

        {/* Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
          animation: 'fadeInUp 0.8s ease-out 0.6s both'
        }}>
          {/* ✅ GOOGLE LOGIN BUTTON */}
          <button
            onClick={handleGoogleLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: isMobile ? '14px 24px' : '16px 32px',
              borderRadius: 20,
              border: 'none',
              background: '#fff',
              color: '#000',
              fontSize: isMobile ? 16 : 18,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 12px 40px rgba(255,255,255,0.2)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
          >
            <LogIn size={20} />
            Continue with Google
          </button>

          {/* DEMO BUTTON */}
          <button
            onClick={handleDemoLogin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Eye size={16} />
            Explore Demo Mode
          </button>
        </div>

        {/* Footer Features */}
        <div style={{
          marginTop: isMobile ? 50 : 80,
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(3,120px)',
          gap: isMobile ? 12 : 24,
          animation: 'fadeIn 1s ease-out 1s both'
        }}>
          {[
            { icon: Users, label: 'Playlists' },
            { icon: Play, label: '320kbps' },
            { icon: Sparkles, label: 'AI Lyrics' }
          ].map((item, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ color: '#00b4d8', marginBottom: 6 }}>
                <item.icon size={20} />
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}