import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext"; // Added Auth import

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Alege Modul de Învățare",
    subtitle: "Selectează cum dorești să interacționezi cu tutorii tăi AI astăzi.",
    chatTitle: "Chat Text",
    chatDesc: "O experiență rapidă, bazată pe text. Ideal pentru întrebări punctuale și răspunsuri instantanee.",
    videoTitle: "Experiență Video",
    videoDesc: "Interacțiune completă cu avatar video. Lecții vizuale și conversație vocală imersivă.",
    select: "Selectează",
    settings: "Setări",
    lang: "Limbă",
    logout: "Deconectare" // Added translation
  },
  en: {
    title: "Choose Learning Mode",
    subtitle: "Select how you want to interact with your AI tutors today.",
    chatTitle: "Text Chat",
    chatDesc: "A fast, text-based experience. Ideal for quick questions and instant answers.",
    videoTitle: "Video Experience",
    videoDesc: "Full interaction with video avatar. Visual lessons and immersive voice conversation.",
    select: "Select",
    settings: "Settings",
    lang: "Language",
    logout: "Logout" // Added translation
  }
};

export function ModePickerPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth() as any; // Destructured setToken for logout
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // Logout functionality
  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        .mode-card {
          flex: 1;
          max-width: 500px;
          aspect-ratio: 1 / 1.1;
          background: rgba(28, 28, 30, 0.6);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 48px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
          text-align: center;
          text-decoration: none;
        }

        .mode-card:hover {
          transform: translateY(-15px) scale(1.02);
          background: rgba(44, 44, 46, 0.8);
          border-color: #3572ef;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
        }

        .mode-icon {
          width: 100px;
          height: 100px;
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 42px;
          margin-bottom: 32px;
          transition: all 0.5s ease;
        }

        .mode-card:hover .mode-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .lang-toggle:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          transform: scale(1.05);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.05);
        }
      `}</style>

      <div style={headerLayout}>
        <h1 style={titleTypography}>{t.title}</h1>
        <p style={subtitleTypography}>{t.subtitle}</p>
      </div>

      <div style={gridContainer}>
        {/* --- Text Chat Mode --- */}
        <div className="mode-card" onClick={() => navigate("/text-chat")}>
          <div style={{ ...modeIconBase, background: 'rgba(53, 114, 239, 0.15)', color: '#3572ef' }} className="mode-icon">
            💬
          </div>
          <h2 style={cardTitle}>{t.chatTitle}</h2>
          <p style={cardDesc}>{t.chatDesc}</p>
          <div style={selectBadge}>{t.select}</div>
        </div>

        {/* --- Video Mode --- */}
        <div className="mode-card" onClick={() => navigate("/subjects")}>
          <div style={{ ...modeIconBase, background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }} className="mode-icon">
            🎬
          </div>
          <h2 style={cardTitle}>{t.videoTitle}</h2>
          <p style={cardDesc}>{t.videoDesc}</p>
          <div style={{ ...selectBadge, background: '#a78bfa33', color: '#a78bfa' }}>{t.select}</div>
        </div>
      </div>

      {/* Floating Settings Hub with Logout Integrated */}
      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsMenuHeader}>{t.settings}</div>
            <div style={settingsRow}>
              <span>{t.lang}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
                <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
              </div>
            </div>

            {/* Logout Row */}
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
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
          {settingsOpen ? '✕' : '⚙'}
        </button>
      </div>
    </div>
  );
}

// --- Style Variables ---

const pageWrapper: React.CSSProperties = { minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "radial-gradient(circle at top, #1e293b 0, #020617 55%)", padding: "40px", color: "#ffffff" };
const headerLayout: React.CSSProperties = { textAlign: "center", marginBottom: "80px", maxWidth: "800px" };
const titleTypography: React.CSSProperties = { fontSize: "56px", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 16px 0" };
const subtitleTypography: React.CSSProperties = { fontSize: "20px", color: "#8e8e93", fontWeight: 400, lineHeight: 1.5 };
const gridContainer: React.CSSProperties = { display: "flex", gap: "40px", width: "100%", maxWidth: "1100px", justifyContent: "center" };
const modeIconBase: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)" };
const cardTitle: React.CSSProperties = { fontSize: "32px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-0.02em" };
const cardDesc: React.CSSProperties = { fontSize: "16px", color: "#a1a1a6", lineHeight: 1.6, margin: "0 0 32px 0", maxWidth: "320px" };
const selectBadge: React.CSSProperties = { padding: "8px 24px", borderRadius: "100px", background: "rgba(53, 114, 239, 0.15)", color: "#3572ef", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" };

// Settings HUB Styles
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };

// Cleaner Logout Button Style
const logoutActionBtn: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  color: "#ffffff",
  padding: "8px",
  borderRadius: "12px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.2s ease"
};

export default ModePickerPage;