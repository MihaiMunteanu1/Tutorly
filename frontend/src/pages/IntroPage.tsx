import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Snowfall from "react-snowfall";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Bun venit la AI Chat",
    subtitle: "Asistentul tău inteligent, redefinit cu o interfață modernă. Ești gata să începi?",
    loginBtn: "Intră în aplicație →",
    footer: "© 2024 AI Interface. Toate drepturile rezervate.",
    settings: "Setări",
    languageLabel: "Limbă"
  },
  en: {
    title: "Welcome to AI Chat",
    subtitle: "Your intelligent assistant, redefined with a modern interface. Ready to begin?",
    loginBtn: "Login to Continue →",
    footer: "© 2024 AI Interface. All rights reserved.",
    settings: "Settings",
    languageLabel: "Language"
  }
};

export default function IntroPage() {
  const navigate = useNavigate();

  // --- State pentru limbă și meniu ---
  const [lang, setLang] = useState<'ro' | 'en'>('en'); // Default engleză
  const [settingsOpen, setSettingsOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  return (
    <div style={pageWrapper}>
      {/* 1. Font and Global Animations */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        html, body, #root {
          margin: 0; padding: 0; width: 100%; height: 100%;
          overflow: hidden; background-color: #000000;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Blob Animations */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .background-blobs {
          position: fixed; top: -10%; left: -10%; width: 120vw; height: 120vh;
          overflow: hidden; z-index: 0; pointer-events: none;
        }

        .blob {
          position: absolute; filter: blur(120px); opacity: 0.35;
          animation: blob 18s infinite ease-in-out alternate; border-radius: 50%;
        }

        .blob-1 { top: 0%; left: 10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%); animation-delay: 0s; }
        .blob-2 { bottom: 0%; right: 10%; width: 800px; height: 800px; background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(0,0,0,0) 70%); animation-delay: -5s; }
        .blob-3 { top: 30%; left: 30%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%); animation-delay: -10s; }
        
        /* Animation Classes */
        .animate-entry { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        /* Button Hover Effect */
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(79, 70, 229, 0.6) !important; border-color: rgba(255,255,255,0.4) !important; }
      `}</style>

      {/* 2. Background Layers */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Snowfall Layer */}
      <Snowfall
        style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }}
        color="white"
        snowflakeCount={100}
        radius={[0.5, 2.5]}
        speed={[0.2, 1.5]}
        wind={[-0.5, 1.5]}
        opacity={[0.1, 0.4]}
      />

      {/* 3. Main Glassmorphic Content Card */}
      <main style={heroContainer}>
        <h1 className="animate-entry delay-1" style={heroTitle}>{t.title}</h1>
        <p className="animate-entry delay-2" style={heroSubtitle}>{t.subtitle}</p>

        <button
            className="login-btn animate-entry delay-3"
            onClick={() => navigate("/login")}
            style={loginButtonStyle}
        >
          {t.loginBtn}
        </button>
      </main>

      {/* Footer/Copyright */}
      <div style={footerStyle}>{t.footer}</div>

      {/* 4. Language Settings Button (Copied from Login) */}
      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsMenuHeader}>{t.settings}</div>
            <div style={settingsRow}>
              <span>{t.languageLabel}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
                <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
              </div>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
          {settingsOpen ? '✕' : '⚙'}
        </button>
      </div>

    </div>
  );
}

// --- CSS-in-JS Styles ---

const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, #050505, #0a0a0a)',
  position: 'relative',
  overflow: 'hidden',
};

const heroContainer: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  width: '90%',
  maxWidth: '500px',
  padding: '60px 40px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  backdropFilter: 'blur(40px)',
  boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '32px',
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '42px',
  fontWeight: 700,
  background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const heroSubtitle: React.CSSProperties = {
  margin: 0,
  fontSize: '17px',
  lineHeight: 1.6,
  color: '#94a3b8',
  fontWeight: 400,
  maxWidth: '400px',
};

const loginButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '18px 48px',
  borderRadius: '16px',
  fontWeight: 600,
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
  transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  marginTop: '8px',
  width: '100%',
  maxWidth: '300px',
};

const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '12px',
    fontWeight: 400,
    zIndex: 10,
};

// --- Settings Styles (Copied from Login) ---
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transition: 'background 0.2s' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', borderRadius: '16px', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '14px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', color: '#94a3b8' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' };