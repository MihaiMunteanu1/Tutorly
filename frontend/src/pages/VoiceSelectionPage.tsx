import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVoices, type Voice } from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Alege Vocea Tutorului",
    subtitle: "Selectează tonul perfect pentru expertul tău digital.",
    loading: "Se încarcă vocile...",
    error: "Nu pot încărca vocile. Verifică backend-ul.",
    back: "Înapoi",
    select: "Selectează Vocea",
    noAudio: "Fără preview audio disponibil",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare"
  },
  en: {
    title: "Choose Tutor Voice",
    subtitle: "Select the perfect tone for your digital expert.",
    loading: "Loading voices...",
    error: "Could not load voices. Check the backend.",
    back: "Back",
    select: "Select Voice",
    noAudio: "No audio preview available",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout"
  }
};

export function VoiceSelectionPage() {
  const { token, setVoice, avatar, setToken } = useAuth() as any;
  const navigate = useNavigate();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (!avatar) { navigate("/avatars"); return; }

    (async () => {
      try {
        const data = await getVoices(token);
        setVoices(data);
      } catch {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, avatar, navigate, t.error]);

  function handleSelect(voice: Voice) {
    setVoice(voice);
    navigate("/chat");
  }

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  if (!token || !avatar) return null;

  return (
    <div style={pageWrapper} className="hide-scrollbar">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        /* 1. Global Reset - Exactly as LoginPage */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #020617;
        }

        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        
        /* 2. Hidden Scrollbar Logic */
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* 3. Seamless Background Animation */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .background-blobs {
          position: fixed;
          top: -10%;
          left: -10%;
          width: 120vw;
          height: 120vh;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
        }

        .blob {
          position: absolute;
          filter: blur(120px);
          opacity: 0.35;
          animation: blob 18s infinite ease-in-out alternate;
          border-radius: 50%;
        }

        .blob-1 {
          top: 10%; left: 10%;
          width: 600px; height: 600px;
          background: rgba(53, 114, 239, 0.4); 
          animation-delay: 0s;
        }

        .blob-2 {
          bottom: 10%; right: 15%;
          width: 700px; height: 700px;
          background: rgba(100, 50, 200, 0.3); 
          animation-delay: -5s;
        }

        .blob-3 {
          top: 40%; left: 30%;
          width: 500px; height: 500px;
          background: rgba(53, 114, 239, 0.2); 
          animation-delay: -10s;
        }

        /* 4. Page Elements */
        .content-layer {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1200px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .voice-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
          width: 100%;
          margin-top: 20px;
          padding-bottom: 120px; /* Space for settings fab */
        }

        .voice-card {
          background: rgba(28, 28, 30, 0.6);
          backdrop-filter: blur(30px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 24px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .voice-card:hover {
          transform: translateY(-8px);
          border-color: #3572ef;
          background: rgba(44, 44, 46, 0.8);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .voice-meta { display: flex; justify-content: space-between; align-items: center; }
        .voice-name { font-size: 18px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em; }
        .voice-tag { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; padding: 4px 10px; border-radius: 100px; background: rgba(53, 114, 239, 0.15); color: #3572ef; }
        .voice-lang { font-size: 13px; color: #8e8e93; font-weight: 500; }

        .audio-wrapper { background: rgba(255, 255, 255, 0.03); border-radius: 16px; padding: 8px; border: 1px solid rgba(255, 255, 255, 0.05); }
        audio { height: 32px; width: 100%; filter: invert(100%) hue-rotate(180deg) brightness(1.5); }

        .select-btn { width: 100%; padding: 12px; border-radius: 14px; background: transparent; border: 1px solid rgba(53, 114, 239, 0.3); color: #3572ef; font-weight: 700; font-size: 13px; transition: all 0.3s; margin-top: 4px; }
        .voice-card:hover .select-btn { background: #3572ef; color: white; border-color: #3572ef; }

        .back-button:hover { background: rgba(255, 255, 255, 0.15) !important; border-color: rgba(255, 255, 255, 0.3) !important; transform: translateY(-2px); }
        .logout-btn:hover { background: rgba(255, 255, 255, 0.2) !important; border-color: rgba(255, 255, 255, 0.4) !important; transform: scale(1.05); }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 50px; height: 50px; border: 4px solid rgba(53, 114, 239, 0.1); border-top: 4px solid #3572ef; border-radius: 50%; animation: spin 1s linear infinite; }
      `}</style>

      {/* Background is provided globally (particles + blobs) */}

      <div className="content-layer">
        <div style={headerWrapper}>
          <div style={headerText}>
            <h1 style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
          </div>
          <button className="back-button" onClick={() => navigate("/avatars")} style={slickBackBtn}>
            {t.back}
          </button>
        </div>

        {loading ? (
          <div style={loaderContainer}>
            <div className="ring-spinner" />
            <p style={{ marginTop: 20, color: "#8e8e93", fontWeight: 500 }}>{t.loading}</p>
          </div>
        ) : error ? (
          <div style={errorCard}>{error}</div>
        ) : (
          <div className="voice-grid">
            {voices.map((v) => (
              <div key={v.id} className="voice-card" onClick={() => handleSelect(v)}>
                <div className="voice-meta">
                  <span className="voice-name">{v.name}</span>
                  {v.gender && <span className="voice-tag">{v.gender}</span>}
                </div>
                <div className="voice-lang">🌐 {v.language}</div>
                <div className="audio-wrapper" onClick={(e) => e.stopPropagation()}>
                  {v.preview_audio ? <audio controls src={v.preview_audio} /> : <div style={{ fontSize: 11, color: "#48484a", textAlign: 'center', padding: '8px' }}>{t.noAudio}</div>}
                </div>
                <button className="select-btn">{t.select}</button>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ color: '#ff453a' }}>{t.logout}</span>
                <button className="logout-btn" onClick={handleLogout} style={logoutActionBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

// --- Style Objects ---
const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: "transparent",
  position: 'relative',
  overflowY: 'auto',
  padding: "60px 40px 0 40px"
};

const headerWrapper: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', maxWidth: '1200px', marginBottom: '40px' };
const headerText: React.CSSProperties = { textAlign: "left", flex: 1 };
const titleTypography: React.CSSProperties = { fontSize: "48px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "18px", color: "#8e8e93", marginTop: "8px", lineHeight: 1.5, maxWidth: "700px" };
const slickBackBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.08)", backdropFilter: "blur(12px)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#ffffff", padding: "12px 24px", borderRadius: "100px", fontSize: "14px", fontWeight: 700, cursor: "pointer", transition: "all 0.3s ease", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" };
const loaderContainer: React.CSSProperties = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "400px" };
const errorCard: React.CSSProperties = { background: "rgba(255, 69, 58, 0.1)", border: "1px solid #ff453a", padding: "20px 40px", borderRadius: "20px", color: "#ff453a", marginTop: "40px", fontWeight: 600 };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };

export default VoiceSelectionPage;