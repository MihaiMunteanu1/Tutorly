import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Autentificare",
    subtitle: "Intră în aplicație și alege-ți avatarul tutorului tău.",
    username: "Nume utilizator",
    password: "Parolă",
    loginBtn: "Intră în aplicație",
    loading: "Se autentifică...",
    error: "Login eșuat. Verifică username/parola.",
    settings: "Setări",
    languageLabel: "Limbă"
  },
  en: {
    title: "Authentication",
    subtitle: "Log in to the app and choose your AI tutor avatar.",
    username: "Username",
    password: "Password",
    loginBtn: "Enter Application",
    loading: "Authenticating...",
    error: "Login failed. Check username/password.",
    settings: "Settings",
    languageLabel: "Language"
  }
};

export function LoginPage() {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("Student");
  const [password, setPassword] = useState("parola123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setToken(res.access_token);
      navigate("/mode");
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        /* 1. Reset everything to zero to prevent the "dark rectangle" gap */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #020617; /* Base deep color */
        }

        * { 
          box-sizing: border-box; 
          font-family: 'Inter', -apple-system, sans-serif; 
        }

        /* 2. Seamless Infinite Background Blobs */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        .background-blobs {
          position: fixed;
          top: -10%; /* Overflow edges to hide margins */
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
          opacity: 0.35; /* Subtler colors */
          animation: blob 18s infinite ease-in-out alternate;
          border-radius: 50%;
        }

        .blob-1 {
          top: 10%;
          left: 10%;
          width: 600px;
          height: 600px;
          background: rgba(53, 114, 239, 0.4); 
          animation-delay: 0s;
        }

        .blob-2 {
          bottom: 10%;
          right: 15%;
          width: 700px;
          height: 700px;
          background: rgba(100, 50, 200, 0.3); 
          animation-delay: -5s;
        }

        .blob-3 {
          top: 40%;
          left: 30%;
          width: 500px;
          height: 500px;
          background: rgba(53, 114, 239, 0.2); 
          animation-delay: -10s;
        }

        /* 3. Card Styling */
        .login-card {
          background: rgba(28, 28, 30, 0.8);
          backdrop-filter: blur(40px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 50px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-out;
          position: relative;
          z-index: 1;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 16px 20px;
          color: white;
          font-size: 16px;
          outline: none;
          transition: all 0.3s ease;
        }

        .custom-input:focus {
          border-color: #3572ef;
          background: rgba(53, 114, 239, 0.05);
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          display: flex;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
      `}</style>

      {/* FIXED BACKGROUND LAYER */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="login-card">
        <h1 style={titleTypography}>{t.title}</h1>
        <p style={subtitleTypography}>{t.subtitle}</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={labelStyle}>{t.username}</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <input
                className="custom-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
          </div>

          <div>
            <label style={labelStyle}>{t.password}</label>
            <div style={{ position: 'relative', marginTop: '8px' }}>
              <input
                className="custom-input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '50px' }}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
                ) : (
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                )}
              </button>
            </div>
          </div>

          {error && <p style={errorText}>{error}</p>}

          <button style={loginButtonStyle} type="submit" disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
                <div className="ring-spinner"></div>
                {t.loading}
              </div>
            ) : t.loginBtn}
          </button>
        </form>
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
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
          {settingsOpen ? '✕' : '⚙'}
        </button>
      </div>
    </div>
  );
}

// --- Styles ---
const pageWrapper: React.CSSProperties = {
  height: "100dvh", /* Dynamic Viewport Height handles mobile bars seamlessly */
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent", /* Gradient removed to prevent the "dark rectangle" seam */
  position: 'relative',
  overflow: 'hidden',
  margin: 0,
  padding: 0
};

const titleTypography: React.CSSProperties = { fontSize: "40px", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center' };
const subtitleTypography: React.CSSProperties = { fontSize: "16px", color: "#8e8e93", marginBottom: "40px", textAlign: 'center', lineHeight: "1.5" };
const labelStyle: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#a1a1a6", marginLeft: "4px" };
const errorText: React.CSSProperties = { color: "#ff453a", fontSize: "14px", textAlign: "center", margin: "0" };
const loginButtonStyle: React.CSSProperties = { padding: "18px", borderRadius: "100px", background: "#3572ef", color: "#fff", border: "none", fontWeight: 700, fontSize: "17px", cursor: "pointer", boxShadow: "0 10px 30px rgba(53, 114, 239, 0.3)", marginTop: "10px" };
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 };

export default LoginPage;