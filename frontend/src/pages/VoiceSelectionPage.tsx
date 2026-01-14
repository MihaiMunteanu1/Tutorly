import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVoices, type Voice } from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Vibrația Tutorului",
    subtitle: "Sistem online. Configurează profilul acustic al expertului tău.",
    loading: "Se calibrează frecvențele...",
    error: "Eroare de conexiune. Nu s-au putut prelua profilele vocale.",
    back: "Înapoi",
    select: "Selectează Vocea",
    noAudio: "Fără previzualizare",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare"
  },
  en: {
    title: "Tutor Vibration",
    subtitle: "System online. Configure the acoustic profile of your expert.",
    loading: "Calibrating frequencies...",
    error: "Connection error. Could not retrieve voice profiles.",
    back: "Back",
    select: "Select Voice",
    noAudio: "No preview available",
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
    if (!avatar) { navigate("/subjects"); return; }

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
    navigate("/mode-selection");
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  if (!token || !avatar) return null;

  return (
    <div style={pageWrapper} className="hide-scrollbar">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overflow-y: auto !important; height: 100vh; }

        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(100px, -80px) rotate(15deg); } }

        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(53, 114, 239, 0.2);
        }

        .elegant-entry { 
          opacity: 0; 
          animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(15px); transform: translateY(25px); }
          to { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        .voice-card {
          background: rgba(28, 28, 30, 0.4);
          backdrop-filter: blur(40px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 32px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .voice-card:hover {
          transform: translateY(-10px) scale(1.02);
          border-color: rgba(53, 114, 239, 0.5);
          background: rgba(35, 35, 38, 0.6);
        }

        .shimmer-btn {
          position: relative; overflow: hidden;
          transition: all 0.4s ease;
        }
        .shimmer-btn::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 60%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%) rotate(-45deg); } 20%, 100% { transform: translateX(100%) rotate(-45deg); } }

        audio { height: 36px; width: 100%; filter: invert(100%) hue-rotate(180deg) brightness(1.8) contrast(1.2); }

        @keyframes skeletonShimmer { 
           0% { background-position: -200% 0; } 
           100% { background-position: 200% 0; } 
        }

        .premium-skeleton {
          width: 100%; height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.02) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.02) 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 2s infinite linear;
        }
      `}</style>

      <div className="background-blobs">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      <div style={contentWrapper}>
        <div className="elegant-entry" style={headerLayout}>
          <div style={headerTextGroup}>
            <span style={superTag}>Acoustic Profile</span>
            <h1 className="living-title" style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
          </div>
          <button className="back-btn" onClick={() => navigate("/avatars")} style={refinedBackBtn}>
            {t.back}
          </button>
        </div>

        {loading ? (
          <div style={gridContainer}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} style={{ ...skeletonCard, animationDelay: `${i * 0.1}s` }} className="elegant-entry">
                <div className="premium-skeleton" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="elegant-entry" style={errorBanner}><span>{error}</span></div>
        ) : (
          <div style={gridContainer}>
            {voices.map((v, idx) => (
              <div
                key={v.id}
                className="voice-card elegant-entry"
                style={{ animationDelay: `${idx * 0.05}s` }}
                onClick={() => handleSelect(v)}
              >
                <div style={voiceHeader}>
                  <div style={nameGroup}>
                    <span style={voiceNameTypography}>{v.name}</span>
                    <span style={langBadge}>🌐 {v.language}</span>
                  </div>
                  {v.gender && <span style={genderTag}>{v.gender}</span>}
                </div>

                <div style={audioContainer} onClick={(e) => e.stopPropagation()}>
                  {v.preview_audio ? (
                    <audio controls src={v.preview_audio} />
                  ) : (
                    <div style={noAudioBox}>{t.noAudio}</div>
                  )}
                </div>

                <div className="shimmer-btn" style={selectPill}>{t.select}</div>
              </div>
            ))}
          </div>
        )}
      </div>

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
            <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <span style={{ color: '#ff453a', fontWeight: 700, cursor: 'pointer' }} onClick={handleLogout}>{t.logout}</span>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

// --- Styles ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", position: 'relative' };
const contentWrapper: React.CSSProperties = { maxWidth: "1400px", width: "94%", zIndex: 1, display: 'flex', flexDirection: 'column', padding: '60px 0' };

const headerLayout: React.CSSProperties = { width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px" };
const headerTextGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
const superTag: React.CSSProperties = { color: '#3572ef', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '11px', marginBottom: '16px' };
const titleTypography: React.CSSProperties = { fontSize: "64px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, lineHeight: 1 };
const subtitleTypography: React.CSSProperties = { fontSize: "18px", color: "#6e7681", marginTop: "16px", fontWeight: 500 };

const gridContainer: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", width: "100%", paddingBottom: "100px" };

const voiceHeader: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' };
const nameGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '4px' };
const voiceNameTypography: React.CSSProperties = { fontSize: "22px", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" };
const langBadge: React.CSSProperties = { fontSize: '12px', color: '#6e7681', fontWeight: 600 };
const genderTag: React.CSSProperties = { fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 10px', borderRadius: '100px', background: 'rgba(53, 114, 239, 0.1)', color: '#3572ef', border: '1px solid rgba(53, 114, 239, 0.2)' };

const audioContainer: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.05)' };
const noAudioBox: React.CSSProperties = { textAlign: 'center', fontSize: '12px', color: '#484f58', padding: '8px' };

const selectPill: React.CSSProperties = { background: '#3572ef', color: '#fff', padding: '14px', borderRadius: '100px', textAlign: 'center', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', boxShadow: '0 10px 20px rgba(53, 114, 239, 0.2)' };

const skeletonCard: React.CSSProperties = { height: "240px", borderRadius: "32px", overflow: "hidden", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" };
const errorBanner: React.CSSProperties = { background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255,69,58,0.3)', color: '#ff453a', padding: '20px 30px', borderRadius: '20px', fontWeight: 700 };

const refinedBackBtn: React.CSSProperties = { height: "48px", padding: "0 28px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' };

// Settings Hub Styles
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(20px)' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(30px)', color: '#fff' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };