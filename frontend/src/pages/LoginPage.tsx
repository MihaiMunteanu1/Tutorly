import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, sendContactEmail } from "../api"; // Asigură-te că calea este corectă
import { useAuth } from "../auth/AuthContext"; // Asigură-te că calea este corectă

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
    languageLabel: "Limbă",
    teamLabel: "Ai nevoie de ajutor? Cunoaște echipa",
    contactTitle: "Contactează pe",
    formFirstName: "Prenume",
    formLastName: "Nume",
    formEmail: "Email-ul tău",
    formSubject: "Subiect",
    formContent: "Conținut",
    btnSend: "Trimite",
    btnCancel: "Anulează",
    alertSent: "Mesajul a fost trimis cu succes!",
    emailInvalid: "Adresa de email nu este validă.",
    sendError: "A apărut o eroare la trimitere.",
    sending: "Se trimite..."
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
    languageLabel: "Language",
    teamLabel: "Need help? Meet our team",
    contactTitle: "Contact",
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

  // --- State ---
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
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    content: ""
  });
  const [isSendingContact, setIsSendingContact] = useState(false);

  // --- Handlers ---
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

  const handleContactClick = (member: typeof TEAM_MEMBERS[0]) => {
    setContactTarget(member);
    setContactData({ firstName: "", lastName: "", email: "", subject: "", content: "" });
    setContactOpen(true);
  };

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(contactData.email)) {
      setNotification({ message: t.emailInvalid, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setIsSendingContact(true);
    try {
      await sendContactEmail({ ...contactData, to: contactTarget?.email || "" });
      setContactOpen(false);
      setNotification({ message: t.alertSent, type: 'success' });
      setTimeout(() => setNotification(null), 4000);
    } catch (error) {
      setNotification({ message: t.sendError, type: 'error' });
    } finally {
      setIsSendingContact(false);
    }
  };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root {
          margin: 0; padding: 0; width: 100%; height: 100%;
          overflow: hidden; background-color: #020617;
        }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        /* Card Styling */
        .login-card {
          background: rgba(28, 28, 30, 0.65);
          backdrop-filter: blur(20px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 50px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-out;
          position: relative;
          z-index: 10;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .custom-input {
          width: 100%; background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px; padding: 16px 20px;
          color: white; font-size: 16px; outline: none;
          transition: all 0.3s ease;
        }
        .custom-input:focus { border-color: #3572ef; background: rgba(53, 114, 239, 0.05); }

        .password-toggle {
          position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
          background: transparent; border: none; color: rgba(255, 255, 255, 0.3);
          cursor: pointer; display: flex;
        }

        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }

        /* Team Details */
        details.team-details { margin-top: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 20px; color: #8e8e93; }
        details.team-details summary { cursor: pointer; font-size: 14px; font-weight: 600; list-style: none; text-align: center; transition: color 0.2s; }
        details.team-details summary:hover { color: #fff; }
        details.team-details summary::-webkit-details-marker { display: none; }
        .team-list { margin-top: 15px; display: flex; flex-direction: column; gap: 12px; animation: fadeIn 0.3s ease-out; }
        .team-member { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 12px; }
        .avatar-circle { width: 32px; height: 32px; background: linear-gradient(135deg, #3572ef, #6432c8); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #fff; }
        .member-info { flex: 1; font-size: 13px; color: #fff; }
        .member-email-btn { background: none; border: none; cursor: pointer; font-size: 16px; transition: transform 0.2s; padding: 0; filter: grayscale(100%); opacity: 0.7; }
        .member-email-btn:hover { transform: scale(1.2); filter: grayscale(0%); opacity: 1; }

        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px); z-index: 2000; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out; }
        .modal-card { background: rgba(28, 28, 30, 0.95); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }

        .notification-toast { position: fixed; top: 30px; left: 50%; transform: translateX(-50%); background: rgba(30, 30, 35, 0.95); border: 1px solid rgba(255,255,255,0.1); padding: 12px 24px; border-radius: 50px; color: #fff; z-index: 3000; box-shadow: 0 10px 40px rgba(0,0,0,0.6); font-weight: 600; display: flex; align-items: center; gap: 10px; animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .notification-toast.success { border-color: #30d158; color: #30d158; }
        .notification-toast.error { border-color: #ff453a; color: #ff453a; }
        @keyframes slideDown { from { transform: translate(-50%, -100px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {/* Background is now provided globally (particles + blobs) */}

      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          {notification.type === 'success' ? '✓' : '✕'} {notification.message}
        </div>
      )}

      {/* 3. MAIN LOGIN CARD */}
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

        <details className="team-details">
          <summary>{t.teamLabel}</summary>
          <div className="team-list">
            {TEAM_MEMBERS.map((member, idx) => (
              <div key={idx} className="team-member">
                <div className="avatar-circle">{member.initials}</div>
                <div className="member-info"><strong>{member.name}</strong></div>
                <button
                  onClick={() => handleContactClick(member)}
                  className="member-email-btn"
                  title="Send email"
                >✉️</button>
              </div>
            ))}
          </div>
        </details>
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

      {contactOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2 style={{ ...titleTypography, fontSize: '24px', marginBottom: '20px' }}>
              {t.contactTitle} {contactTarget?.name}
            </h2>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input className="custom-input" placeholder={t.formLastName} required
                  value={contactData.lastName} onChange={e => setContactData({ ...contactData, lastName: e.target.value })} />
                <input className="custom-input" placeholder={t.formFirstName} required
                  value={contactData.firstName} onChange={e => setContactData({ ...contactData, firstName: e.target.value })} />
              </div>
              <input className="custom-input" type="email" placeholder={t.formEmail} required
                value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
              <input className="custom-input" placeholder={t.formSubject} required
                value={contactData.subject} onChange={e => setContactData({ ...contactData, subject: e.target.value })} />
              <textarea className="custom-input" placeholder={t.formContent} rows={4} required
                value={contactData.content} onChange={e => setContactData({ ...contactData, content: e.target.value })}
                style={{ resize: 'vertical', minHeight: '80px' }} />

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setContactOpen(false)}
                  style={{ ...loginButtonStyle, flex: 1, background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
                  {t.btnCancel}
                </button>
                <button type="submit" style={{ ...loginButtonStyle, flex: 1 }} disabled={isSendingContact}>
                  {isSendingContact ? t.sending : t.btnSend}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
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

