import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatars, type Avatar } from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Biblioteca de Avatare",
    subtitle: "Selectează expertul care te va ghida în această lecție.",
    loading: "Se încarcă experții...",
    error: "Nu pot încărca avatar-ele. Verifică backend-ul.",
    back: "Înapoi",
    noPreview: "Fără preview",
    select: "Selectează",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare"
  },
  en: {
    title: "Avatar Library",
    subtitle: "Select the expert who will guide you through this lesson.",
    loading: "Loading experts...",
    error: "Could not load avatars. Check the backend.",
    back: "Back",
    noPreview: "No preview",
    select: "Select",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout"
  }
};

export function AvatarSelectionPage() {
  const { token, setAvatar, setToken } = useAuth() as any;
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const data = await getAvatars(token);
        setAvatars(data.slice(0, -3));
      } catch {
        setError(t.error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate, t.error]);

  const handleSelect = (av: Avatar) => {
    setAvatar({ ...av, avatar_type: "avatar" });
    navigate("/voices");
  };

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  if (!token) return null;

  return (
    <div style={pageWrapper} className="hide-scrollbar">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        /* 1. Global Reset - Consistent with other pages */
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
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE/Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
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

        .avatar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 32px;
          width: 100%;
          margin-top: 20px;
          padding-bottom: 120px; /* Padding for floating settings */
        }

        .avatar-card {
          background: rgba(28, 28, 30, 0.6);
          backdrop-filter: blur(30px);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          overflow: hidden;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
        }

        .avatar-card:hover {
          transform: translateY(-10px) scale(1.03);
          border-color: #3572ef;
          background: rgba(44, 44, 46, 0.8);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
        }

        .avatar-img-container { aspect-ratio: 9 / 14; width: 100%; overflow: hidden; background: #1c1c1e; }
        .avatar-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s ease; }
        .avatar-card:hover .avatar-img { transform: scale(1.1); }

        .avatar-info {
          padding: 20px;
          text-align: center;
          background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
          position: absolute;
          bottom: 0; left: 0; right: 0;
        }

        .select-badge {
          position: absolute;
          top: 20px; right: 20px;
          background: #3572ef;
          color: white;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }

        .avatar-card:hover .select-badge { opacity: 1; transform: translateY(0); }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 50px; height: 50px; border: 4px solid rgba(53, 114, 239, 0.1); border-top: 4px solid #3572ef; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .loader-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; }

        .back-button:hover {
          background: rgba(255, 255, 255, 0.15) !important;
          border-color: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
        }

        .logout-btn:hover {
          background: rgba(255, 255, 255, 0.2) !important;
          border-color: rgba(255, 255, 255, 0.4) !important;
          transform: scale(1.05);
        }
      `}</style>

      {/* Background is provided globally (particles + blobs) */}

      <div className="content-layer">
        <div style={headerWrapper}>
          <div style={headerText}>
            <h1 style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
          </div>
          <button className="back-button" onClick={() => navigate("/subjects")} style={slickBackBtn}>
            {t.back}
          </button>
        </div>

        {loading ? (
          <div className="loader-container">
            <div className="ring-spinner" />
            <p style={{ marginTop: 20, color: "#8e8e93", fontWeight: 500 }}>{t.loading}</p>
          </div>
        ) : error ? (
          <div style={errorCard}><p style={{ margin: 0 }}>{error}</p></div>
        ) : (
          <div className="avatar-grid">
            {avatars.map((av) => {
              const firstName = (av.name ?? "").trim().split(/\s+/)[0] ?? "";
              return (
                <div key={av.id} className="avatar-card" onClick={() => handleSelect(av)}>
                  <div className="select-badge">{t.select}</div>
                  <div className="avatar-img-container">
                    {av.image_url ? (
                      <img src={av.image_url} alt={firstName} className="avatar-img" />
                    ) : (
                      <div style={noPreviewStyle}>{t.noPreview}</div>
                    )}
                  </div>
                  <div className="avatar-info">
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#ffffff", letterSpacing: '-0.02em' }}>{firstName}</div>
                  </div>
                </div>
              );
            })}
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
const noPreviewStyle: React.CSSProperties = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#48484a", fontWeight: 600 };
const errorCard: React.CSSProperties = { background: "rgba(255, 69, 58, 0.1)", border: "1px solid #ff453a", padding: "20px 40px", borderRadius: "20px", color: "#ff453a", marginTop: "40px", fontWeight: 600 };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };

export default AvatarSelectionPage;

