import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, sendContactEmail } from "../api";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Autentificare",
    subtitle: "Sistemul este pregătit. Introdu datele pentru acces.",
    username: "Nume utilizator",
    password: "Parolă",
    loginBtn: "Accesează Contul",
    loading: "Se verifică datele...",
    error: "Login eșuat. Verifică username/parola.",
    settings: "Setări",
    languageLabel: "Limbă",
    teamLabel: "Suport Tehnic • Echipa",
    contactTitle: "Mesaj către",
    formFirstName: "Prenume",
    formLastName: "Nume",
    formEmail: "Email-ul tău",
    formSubject: "Subiect",
    formContent: "Conținut",
    btnSend: "Trimite",
    btnCancel: "Anulează",
    alertSent: "Mesajul a fost trimis!",
    emailInvalid: "Adresa de email invalidă.",
    sendError: "Eroare la trimitere.",
    sending: "Trimitere..."
  },
  en: {
    title: "Authentication",
    subtitle: "System ready. Enter your credentials to proceed.",
    username: "Username",
    password: "Password",
    loginBtn: "Access Account",
    loading: "Verifying credentials...",
    error: "Login failed. Check username/password.",
    settings: "Settings",
    languageLabel: "Language",
    teamLabel: "Technical Support • Team",
    contactTitle: "Message to",
    formFirstName: "First Name",
    formLastName: "Last Name",
    formEmail: "Your Email",
    formSubject: "Subject",
    formContent: "Content",
    btnSend: "Send",
    btnCancel: "Cancel",
    alertSent: "Message sent successfully!",
    emailInvalid: "Invalid email address.",
    sendError: "Error sending message.",
    sending: "Sending..."
  }
};

const TEAM_MEMBERS = [
  { name: "Moise Ioana", initials: "MI", email: "ioana.moise@stud.ubbcluj.ro" },
  { name: "Munteanu Mihai", initials: "MM", email: "mihai.munteanu@stud.ubbcluj.ro" },
  { name: "Marginean Dan", initials: "MD", email: "dan.marginean@stud.ubbcluj.ro" }
];

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

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState<{ name: string; email: string } | null>(null);
  const [contactData, setContactData] = useState({ firstName: "", lastName: "", email: "", subject: "", content: "" });
  const [isSendingContact, setIsSendingContact] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(username, password);
      setToken(res.access_token);
      navigate("/subjects");
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  const handleContactClick = (member: typeof TEAM_MEMBERS[0]) => {
    setContactTarget(member);
    setContactData({ firstName: "", lastName: "", email: "", subject: "", content: "" });
    setContactOpen(true);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingContact(true);
    try {
      await sendContactEmail({ ...contactData, to: contactTarget?.email || "" });
      setContactOpen(false);
      setNotification({ message: t.alertSent, type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch {
      setNotification({ message: t.sendError, type: 'error' });
    } finally {
      setIsSendingContact(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1) rotate(0deg); }
          to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); }
        }

        .login-card {
          background: rgba(28, 28, 30, 0.4);
          backdrop-filter: blur(40px);
          border-radius: 48px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 60px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 60px 120px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255,255,255,0.05);
          animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          z-index: 10;
        }

        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(20px); transform: scale(0.98) translateY(20px); }
          to { opacity: 1; filter: blur(0); transform: scale(1) translateY(0); }
        }

        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(53, 114, 239, 0.2);
        }

        .custom-input {
          width: 100%; background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 18px; padding: 18px 22px;
          color: white; font-size: 16px; outline: none;
          transition: all 0.3s ease;
        }
        .custom-input:focus { border-color: #3572ef; background: rgba(53, 114, 239, 0.05); }

        .shimmer-btn {
          position: relative; overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .shimmer-btn::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 60%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(-45deg); }
          20%, 100% { transform: translateX(100%) rotate(-45deg); }
        }

        /* NEW: Support Team Hover Animation */
        summary {
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          outline: none;
        }
        summary:hover {
          color: #ffffff !important;
          transform: translateY(-1px);
          text-shadow: 0 0 15px rgba(53, 114, 239, 0.6);
          letter-spacing: 0.02em;
        }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(20px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
        .modal-card { background: rgba(20, 20, 22, 0.85); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 32px; padding: 40px; width: 90%; max-width: 520px; box-shadow: 0 40px 100px rgba(0,0,0,0.6); }

        .notification-toast { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); background: rgba(28, 28, 30, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); padding: 14px 28px; border-radius: 100px; color: #fff; z-index: 3000; font-weight: 700; display: flex; align-items: center; gap: 12px; }
      `}</style>

      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="login-card">
        <h1 className="living-title" style={titleTypography}>{t.title}</h1>
        <p style={subtitleTypography}>{t.subtitle}</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div>
            <label style={labelStyle}>{t.username}</label>
            <div style={{ marginTop: '8px' }}>
              <input className="custom-input" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
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
                style={{ paddingRight: '60px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={passwordToggleStyle}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && <p style={errorText}>{error}</p>}

          <button className="shimmer-btn" style={loginButtonStyle} type="submit" disabled={loading}>
            {loading ? t.loading : t.loginBtn}
          </button>
        </form>

        <details className="team-details" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
          <summary style={summaryStyle}>{t.teamLabel}</summary>
          <div style={{ marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} style={memberRowStyle}>
                <div style={initialsCircle}>{member.initials}</div>
                <div style={{ flex: 1, fontSize: '14px', color: '#fff', fontWeight: 600 }}>{member.name}</div>
                <button onClick={() => handleContactClick(member)} style={contactBtnStyle}>✉️</button>
              </div>
            ))}
          </div>
        </details>
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
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>

      {contactOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 className="living-title" style={{ fontSize: '24px', fontWeight: 800, marginBottom: '24px' }}>
              {t.contactTitle} {contactTarget?.name}
            </h2>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="custom-input" placeholder={t.formLastName} required value={contactData.lastName} onChange={e => setContactData({ ...contactData, lastName: e.target.value })} />
                <input className="custom-input" placeholder={t.formFirstName} required value={contactData.firstName} onChange={e => setContactData({ ...contactData, firstName: e.target.value })} />
              </div>
              <input className="custom-input" type="email" placeholder={t.formEmail} required value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
              <input className="custom-input" placeholder={t.formSubject} required value={contactData.subject} onChange={e => setContactData({ ...contactData, subject: e.target.value })} />
              <textarea className="custom-input" placeholder={t.formContent} rows={4} required value={contactData.content} onChange={e => setContactData({ ...contactData, content: e.target.value })} style={{ resize: 'none' }} />

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setContactOpen(false)} style={{ ...loginButtonStyle, background: 'rgba(255,255,255,0.05)', color: '#fff', boxShadow: 'none' }}>{t.btnCancel}</button>
                <button type="submit" className="shimmer-btn" style={loginButtonStyle} disabled={isSendingContact}>{isSendingContact ? t.sending : t.btnSend}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Specific Inline Styles ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", position: 'relative', overflow: 'hidden' };
const titleTypography: React.CSSProperties = { fontSize: "42px", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 12px 0", textAlign: 'center' };
const subtitleTypography: React.CSSProperties = { fontSize: "16px", color: "#6e7681", marginBottom: "40px", textAlign: 'center', fontWeight: 500 };
const labelStyle: React.CSSProperties = { fontSize: "12px", fontWeight: 800, color: "#3572ef", textTransform: 'uppercase', letterSpacing: '0.15em', marginLeft: '4px' };
const errorText: React.CSSProperties = { color: "#ff453a", fontSize: "14px", textAlign: "center", fontWeight: 600 };
const loginButtonStyle: React.CSSProperties = { padding: "0 30px", height: '64px', borderRadius: '100px', background: "#3572ef", color: "#fff", border: "none", fontWeight: 800, fontSize: "17px", cursor: "pointer", boxShadow: "0 20px 40px rgba(0,0,0,0.3)", width: '100%' };
const passwordToggleStyle: React.CSSProperties = { position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#3572ef', fontWeight: 700, fontSize: '13px', cursor: 'pointer' };
const summaryStyle: React.CSSProperties = { cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: '#6e7681', textAlign: 'center', listStyle: 'none' };
const memberRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.02)', padding: '10px 16px', borderRadius: '16px' };
const initialsCircle: React.CSSProperties = { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3572ef, #6432c8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff' };
const contactBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6 };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(20px)' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', borderRadius: '24px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', color: '#fff' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 };