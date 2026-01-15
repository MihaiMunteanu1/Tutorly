import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Tutorly",
    subtitle: "Asistentul tău inteligent, redefinit pentru viitor.",
    loginBtn: "Începe Conversația",
    footer: "© 2026 Tutorly",
    settings: "Setări",
    languageLabel: "Limbă"
  },
  en: {
    title: "Tutorly",
    subtitle: "Your intelligent assistant, redefined for the future.",
    loginBtn: "Start Conversation",
    footer: "© 2026 Tutorly" ,
    settings: "Settings",
    languageLabel: "Language"
  }
};

export default function IntroPage() {
  const navigate = useNavigate();
  const [lang, setLang] = useState<keyof typeof TRANSLATIONS>('en');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        
        /* Premium Background Blobs */
        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.5; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1) rotate(0deg); }
          to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); }
        }

        /* Living Text Effect */
        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 50px rgba(53, 114, 239, 0.15);
        }

        /* Elegant Entry Animation */
        .animate-reveal { opacity: 0; animation: elegantEntry 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.2s; }
        .delay-2 { animation-delay: 0.4s; }

        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(20px); transform: scale(0.98) translateY(30px); }
          to { opacity: 1; filter: blur(0); transform: scale(1) translateY(0); }
        }

        /* Shimmer Button Effect */
        .shimmer-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 60%, transparent 100%);
          transform: rotate(-45deg);
          animation: shimmer 5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(-45deg); }
          20%, 100% { transform: translateX(100%) rotate(-45deg); }
        }
        .shimmer-btn:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(53, 114, 239, 0.3); }
        .shimmer-btn:active { transform: translateY(-1px); }
      `}</style>

      {/* 1. Background Layers */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      {/* 2. Main Cinematic Content */}
      <main style={heroWrapper}>
        <div className="animate-reveal delay-1" style={titleGroup}>
          <img src="/TUTORLY_LOGO.png" rel={"icon"} style={{width: '120px', marginBottom: '20px'}}/>
                    <span style={superTitle}>Intelligence Redefined</span>
          <h1 className="living-title" style={mainTitle}>{t.title}</h1>

          <div style={decorativeLine}/>
        </div>

        <p className="animate-reveal delay-2" style={heroSubtitle}>{t.subtitle}</p>

        <button
          className="shimmer-btn animate-reveal delay-2"
          onClick={() => navigate("/login")}
          style={primaryButtonStyle}
        >
          {t.loginBtn}
        </button>
      </main>

      {/* 3. Minimal Footer */}
      <div style={footerStyle}>{t.footer}</div>

      {/* 4. Settings UI */}
      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
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

// --- Ultra-Premium Styles ---

const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const heroWrapper: React.CSSProperties = {
  position: 'relative',
  zIndex: 10,
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '40px',
  maxWidth: '800px',
  width: '90%',
};

const titleGroup: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const superTitle: React.CSSProperties = {
  color: '#3572ef',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '0.4em',
  fontSize: '12px',
  marginBottom: '20px',
};

const mainTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '100px',
  fontWeight: 800,
  letterSpacing: '-0.06em',
  lineHeight: 1.1,
  paddingBottom: 10
};

const decorativeLine: React.CSSProperties = {
  width: '60px',
  height: '3px',
  background: '#3572ef',
  marginTop: '10px',
  borderRadius: '2px',
};

const heroSubtitle: React.CSSProperties = {
  margin: 0,
  fontSize: '20px',
  lineHeight: 1.6,
  color: '#6e7681',
  fontWeight: 500,
  maxWidth: '500px',
};

const primaryButtonStyle: React.CSSProperties = {
  background: '#3572ef',
  color: 'white',
  border: 'none',
  padding: '0 56px',
  height: '72px',
  borderRadius: '100px',
  fontWeight: 800,
  fontSize: '18px',
  cursor: 'pointer',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255,255,255,0.1)',
  marginTop: '20px',
};

const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '30px',
    color: '#484f58',
    fontSize: '12px',
    fontWeight: 600,
    letterSpacing: '0.05em',
    zIndex: 1,
};

// --- Settings Styles ---
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(28, 28, 30, 0.8)', color: '#fff', backdropFilter: 'blur(20px)', cursor: 'pointer', fontSize: '20px' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', borderRadius: '24px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '12px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 };
