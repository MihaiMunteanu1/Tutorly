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
          overflow: hidden; background-color: #020617;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Blob Animations */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .background-blobs {
          position: fixed; top: -10%; left: -10%; width: 120vw; height: 120vh;
          overflow: hidden; z-index: 0; pointer-events: none;
        }

        .blob {
          position: absolute; filter: blur(120px); opacity: 0.35;
          animation: blob 18s infinite ease-in-out alternate; border-radius: 50%;
        }

        .blob-1 { top: 10%; left: 10%; width: 600px; height: 600px; background: rgba(53, 114, 239, 0.4); animation-delay: 0s; }
        .blob-2 { bottom: 10%; right: 15%; width: 700px; height: 700px; background: rgba(100, 50, 200, 0.3); animation-delay: -5s; }
        .blob-3 { top: 40%; left: 30%; width: 500px; height: 500px; background: rgba(53, 114, 239, 0.2); animation-delay: -10s; }
        
        /* Button Hover Effect */
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 24px rgba(53, 114, 239, 0.4) !important; }
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
        snowflakeCount={150}
        radius={[0.5, 2.5]}
        speed={[0.5, 2.5]}
        wind={[-0.5, 1.5]}
      />

      {/* 3. Main Glassmorphic Content Card */}
      <main style={heroContainer}>
        <h1 style={heroTitle}>{t.title}</h1>
        <p style={heroSubtitle}>{t.subtitle}</p>

        <button
            className="login-btn"
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
  background: 'transparent',
  position: 'relative',
  overflow: 'hidden',
};

const heroContainer: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  width: '90%',
  maxWidth: '500px',
  padding: '48px 32px',
  textAlign: 'center',
  background: 'rgba(28, 28, 30, 0.75)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '32px',
  backdropFilter: 'blur(40px)',
  boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '36px',
  fontWeight: 800,
  background: 'linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.02em',
};

const heroSubtitle: React.CSSProperties = {
  margin: 0,
  fontSize: '16px',
  lineHeight: 1.6,
  color: 'rgba(255, 255, 255, 0.7)',
  fontWeight: 500,
  maxWidth: '400px',
};

const loginButtonStyle: React.CSSProperties = {
  background: '#3572ef',
  color: 'white',
  border: 'none',
  padding: '16px 48px',
  borderRadius: '100px',
  fontWeight: 700,
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(53, 114, 239, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
  marginTop: '16px',
  width: '100%',
  maxWidth: '300px',
};

const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    fontWeight: 500,
    zIndex: 10,
};

// --- Settings Styles (Copied from Login) ---
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 };