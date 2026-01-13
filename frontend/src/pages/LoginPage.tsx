// import React, { useState, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import { login, sendContactEmail } from "../api";
// import { useAuth } from "../auth/AuthContext";
//
// // --- Translation Dictionary ---
// const TRANSLATIONS = {
//   ro: {
//     title: "Autentificare",
//     subtitle: "Intră în aplicație și alege-ți avatarul tutorului tău.",
//     username: "Nume utilizator",
//     password: "Parolă",
//     loginBtn: "Intră în aplicație",
//     loading: "Se autentifică...",
//     error: "Login eșuat. Verifică username/parola.",
//     settings: "Setări",
//     languageLabel: "Limbă",
//     teamLabel: "Ai nevoie de ajutor? Cunoaște echipa",
//     contactTitle: "Contactează pe",
//     formFirstName: "Prenume",
//     formLastName: "Nume",
//     formEmail: "Email-ul tău",
//     formSubject: "Subiect",
//     formContent: "Conținut",
//     btnSend: "Trimite",
//     btnCancel: "Anulează",
//     alertSent: "Mesajul a fost trimis cu succes!",
//     emailInvalid: "Adresa de email nu este validă.",
//     sendError: "A apărut o eroare la trimitere.",
//     sending: "Se trimite..."
//   },
//   en: {
//     title: "Authentication",
//     subtitle: "Log in to the app and choose your AI tutor avatar.",
//     username: "Username",
//     password: "Password",
//     loginBtn: "Enter Application",
//     loading: "Authenticating...",
//     error: "Login failed. Check username/password.",
//     settings: "Settings",
//     languageLabel: "Language",
//     teamLabel: "Need help? Meet our team",
//     contactTitle: "Contact",
//     formFirstName: "First Name",
//     formLastName: "Last Name",
//     formEmail: "Your Email",
//     formSubject: "Subject",
//     formContent: "Content",
//     btnSend: "Send",
//     btnCancel: "Cancel",
//     alertSent: "Message sent successfully!",
//     emailInvalid: "Invalid email address.",
//     sendError: "Error sending message.",
//     sending: "Sending..."
//   }
// };
//
// const TEAM_MEMBERS = [
//   { name: "Moise Ioana", initials: "MI", email: "ioana.moise@stud.ubbcluj.ro" },
//   { name: "Munteanu Mihai", initials: "MM", email: "mihai.munteanu@stud.ubbcluj.ro" },
//   { name: "Marginean Dan", initials: "MD", email: "dan.marginean@stud.ubbcluj.ro" }
// ];
//
// export function LoginPage() {
//   const { setToken } = useAuth();
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("Student");
//   const [password, setPassword] = useState("parola123");
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
//
//   const [lang, setLang] = useState<'ro' | 'en'>('ro');
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const t = TRANSLATIONS[lang];
//
//   const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
//   const [contactOpen, setContactOpen] = useState(false);
//   const [contactTarget, setContactTarget] = useState<{ name: string; email: string } | null>(null);
//   const [contactData, setContactData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     subject: "",
//     content: ""
//   });
//   const [isSendingContact, setIsSendingContact] = useState(false);
//
//   // Generate snowflakes for the snow effect
//   const snowflakes = useMemo(() => {
//     return Array.from({ length: 50 }).map((_, i) => ({
//       id: i,
//       style: {
//         left: `${Math.random() * 100}%`,
//         animationDelay: `-${Math.random() * 10}s`,
//         animationDuration: `${10 + Math.random() * 15}s`,
//         opacity: 0.2 + Math.random() * 0.6,
//         width: `${4 + Math.random() * 6}px`,
//         height: `${4 + Math.random() * 6}px`
//       }
//     }));
//   }, []);
//
//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setLoading(true);
//     try {
//       const res = await login(username, password);
//       setToken(res.access_token);
//       navigate("/mode");
//     } catch {
//       setError(t.error);
//     } finally {
//       setLoading(false);
//     }
//   }
//
//   const handleContactClick = (member: typeof TEAM_MEMBERS[0]) => {
//     setContactTarget(member);
//     setContactData({ firstName: "", lastName: "", email: "", subject: "", content: "" });
//     setContactOpen(true);
//   };
//
//   const validateEmail = (email: string) => {
//     return String(email)
//       .toLowerCase()
//       .match(
//         /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//       );
//   };
//
//   const handleContactSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//
//     if (!validateEmail(contactData.email)) {
//       setNotification({ message: t.emailInvalid, type: 'error' });
//       setTimeout(() => setNotification(null), 3000);
//       return;
//     }
//
//     setIsSendingContact(true);
//
//     try {
//       await sendContactEmail({
//         ...contactData,
//         to: contactTarget?.email || ""
//       });
//
//       setContactOpen(false);
//       setNotification({ message: t.alertSent, type: 'success' });
//       setTimeout(() => setNotification(null), 4000);
//     } catch (error) {
//       console.error(error);
//       setNotification({ message: t.sendError, type: 'error' });
//     } finally {
//       setIsSendingContact(false);
//     }
//   };
//
//   return (
//     <div style={pageWrapper}>
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
//
//       <style>{`
//         /* 1. Reset everything to zero to prevent the "dark rectangle" gap */
//         html, body, #root {
//           margin: 0;
//           padding: 0;
//           width: 100%;
//           height: 100%;
//           overflow: hidden;
//           background-color: #020617; /* Base deep color */
//         }
//
//         * {
//           box-sizing: border-box;
//           font-family: 'Inter', -apple-system, sans-serif;
//         }
//
//         /* 2. Seamless Infinite Background Blobs */
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(50px, -70px) scale(1.1); }
//           66% { transform: translate(-30px, 30px) scale(0.95); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//
//         .background-blobs {
//           position: fixed;
//           top: -10%; /* Overflow edges to hide margins */
//           left: -10%;
//           width: 120vw;
//           height: 120vh;
//           overflow: hidden;
//           z-index: 0;
//           pointer-events: none;
//         }
//
//         .blob {
//           position: absolute;
//           filter: blur(120px);
//           opacity: 0.35; /* Subtler colors */
//           animation: blob 18s infinite ease-in-out alternate;
//           border-radius: 50%;
//         }
//
//         .blob-1 {
//           top: 10%;
//           left: 10%;
//           width: 600px;
//           height: 600px;
//           background: rgba(53, 114, 239, 0.4);
//           animation-delay: 0s;
//         }
//
//         .blob-2 {
//           bottom: 10%;
//           right: 15%;
//           width: 700px;
//           height: 700px;
//           background: rgba(100, 50, 200, 0.3);
//           animation-delay: -5s;
//         }
//
//         .blob-3 {
//           top: 40%;
//           left: 30%;
//           width: 500px;
//           height: 500px;
//           background: rgba(53, 114, 239, 0.2);
//           animation-delay: -10s;
//         }
//
//         /* 3. Snow Effect */
//         .snow-container {
//           position: fixed;
//           top: 0;
//           left: 0;
//           width: 100%;
//           height: 100%;
//           pointer-events: none;
//           z-index: 1;
//         }
//         .snowflake {
//           position: absolute;
//           top: -20px;
//           background: white;
//           border-radius: 50%;
//           filter: blur(1px);
//           animation: fall linear infinite;
//         }
//         @keyframes fall {
//           0% { transform: translateY(-20px) translateX(0); }
//           25% { transform: translateY(25vh) translateX(15px); }
//           50% { transform: translateY(50vh) translateX(-15px); }
//           75% { transform: translateY(75vh) translateX(15px); }
//           100% { transform: translateY(110vh) translateX(0); }
//         }
//
//         /* 4. Card Styling */
//         .login-card {
//           background: rgba(28, 28, 30, 0.8);
//           backdrop-filter: blur(40px);
//           border-radius: 40px;
//           border: 1px solid rgba(255, 255, 255, 0.08);
//           padding: 50px;
//           width: 100%;
//           max-width: 480px;
//           box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
//           animation: fadeIn 0.8s ease-out;
//           position: relative;
//           z-index: 10;
//         }
//
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(15px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//
//         .custom-input {
//           width: 100%;
//           background: rgba(255, 255, 255, 0.04);
//           border: 1px solid rgba(255, 255, 255, 0.08);
//           border-radius: 16px;
//           padding: 16px 20px;
//           color: white;
//           font-size: 16px;
//           outline: none;
//           transition: all 0.3s ease;
//         }
//
//         .custom-input:focus {
//           border-color: #3572ef;
//           background: rgba(53, 114, 239, 0.05);
//         }
//
//         .password-toggle {
//           position: absolute;
//           right: 16px;
//           top: 50%;
//           transform: translateY(-50%);
//           background: transparent;
//           border: none;
//           color: rgba(255, 255, 255, 0.3);
//           cursor: pointer;
//           display: flex;
//         }
//
//         @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
//         .ring-spinner { width: 20px; height: 20px; border: 2px solid rgba(255, 255, 255, 0.3); border-top: 2px solid #fff; border-radius: 50%; animation: spin 0.8s linear infinite; }
//
//         /* 5. Team Details */
//         details.team-details {
//           margin-top: 30px;
//           border-top: 1px solid rgba(255,255,255,0.1);
//           padding-top: 20px;
//           color: #8e8e93;
//         }
//         details.team-details summary {
//           cursor: pointer;
//           font-size: 14px;
//           font-weight: 600;
//           list-style: none;
//           text-align: center;
//           transition: color 0.2s;
//         }
//         details.team-details summary:hover {
//           color: #fff;
//         }
//         details.team-details summary::-webkit-details-marker {
//           display: none;
//         }
//         .team-list {
//           margin-top: 15px;
//           display: flex;
//           flex-direction: column;
//           gap: 12px;
//           animation: fadeIn 0.3s ease-out;
//         }
//         .team-member {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           background: rgba(255,255,255,0.03);
//           padding: 8px 12px;
//           border-radius: 12px;
//         }
//         .avatar-circle {
//           width: 32px; height: 32px;
//           background: linear-gradient(135deg, #3572ef, #6432c8);
//           border-radius: 50%;
//           display: flex; align-items: center; justify-content: center;
//           font-size: 12px; font-weight: 700; color: #fff;
//         }
//         .member-info { flex: 1; font-size: 13px; color: #fff; }
//         .member-email { color: #8e8e93; text-decoration: none; font-size: 16px; transition: color 0.2s; }
//         .member-email:hover { color: #3572ef; }
//
//         .member-email-btn {
//           background: none;
//           border: none;
//           cursor: pointer;
//           font-size: 16px;
//           transition: transform 0.2s;
//           padding: 0;
//           filter: grayscale(100%);
//           opacity: 0.7;
//         }
//         .member-email-btn:hover {
//           transform: scale(1.2);
//           filter: grayscale(0%);
//           opacity: 1;
//         }
//
//         .modal-overlay {
//           position: fixed; top: 0; left: 0; width: 100%; height: 100%;
//           background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
//           z-index: 2000; display: flex; align-items: center; justify-content: center;
//           animation: fadeIn 0.3s ease-out;
//         }
//         .modal-card {
//           background: rgba(28, 28, 30, 0.95); border: 1px solid rgba(255, 255, 255, 0.1);
//           border-radius: 24px; padding: 30px; width: 90%; max-width: 500px;
//           box-shadow: 0 20px 50px rgba(0,0,0,0.5);
//         }
//
//         .notification-toast {
//           position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
//           background: rgba(30, 30, 35, 0.95); border: 1px solid rgba(255,255,255,0.1);
//           padding: 12px 24px; border-radius: 50px; color: #fff; z-index: 3000;
//           box-shadow: 0 10px 40px rgba(0,0,0,0.6); font-weight: 600;
//           display: flex; align-items: center; gap: 10px;
//           animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
//         }
//         .notification-toast.success { border-color: #30d158; color: #30d158; }
//         .notification-toast.error { border-color: #ff453a; color: #ff453a; }
//         @keyframes slideDown {
//           from { transform: translate(-50%, -100px); opacity: 0; }
//           to { transform: translate(-50%, 0); opacity: 1; }
//         }
//       `}</style>
//
//       {/* FIXED BACKGROUND LAYER */}
//       <div className="background-blobs">
//         <div className="blob blob-1"></div>
//         <div className="blob blob-2"></div>
//         <div className="blob blob-3"></div>
//       </div>
//
//       {/* SNOW LAYER */}
//       {/*<div className="snow-container">*/}
//       {/*  {snowflakes.map(flake => (*/}
//       {/*    <div key={flake.id} className="snowflake" style={flake.style} />*/}
//       {/*  ))}*/}
//       {/*</div>*/}
//
//       {notification && (
//         <div className={`notification-toast ${notification.type}`}>
//           {notification.type === 'success' ? '✓' : '✕'} {notification.message}
//         </div>
//       )}
//
//       <div className="login-card">
//         <h1 style={titleTypography}>{t.title}</h1>
//         <p style={subtitleTypography}>{t.subtitle}</p>
//
//         <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
//           <div>
//             <label style={labelStyle}>{t.username}</label>
//             <div style={{ position: 'relative', marginTop: '8px' }}>
//               <input
//                 className="custom-input"
//                 value={username}
//                 onChange={(e) => setUsername(e.target.value)}
//                 autoComplete="username"
//               />
//             </div>
//           </div>
//
//           <div>
//             <label style={labelStyle}>{t.password}</label>
//             <div style={{ position: 'relative', marginTop: '8px' }}>
//               <input
//                 className="custom-input"
//                 type={showPassword ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 autoComplete="current-password"
//                 style={{ paddingRight: '50px' }}
//               />
//               <button
//                 type="button"
//                 className="password-toggle"
//                 onClick={() => setShowPassword(!showPassword)}
//                 tabIndex={-1}
//               >
//                 {showPassword ? (
//                   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" /></svg>
//                 ) : (
//                   <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
//                 )}
//               </button>
//             </div>
//           </div>
//
//           {error && <p style={errorText}>{error}</p>}
//
//           <button style={loginButtonStyle} type="submit" disabled={loading}>
//             {loading ? (
//               <div style={{ display: 'flex', alignItems: 'center', gap: '12px', justifyContent: 'center' }}>
//                 <div className="ring-spinner"></div>
//                 {t.loading}
//               </div>
//             ) : t.loginBtn}
//           </button>
//         </form>
//
//         <details className="team-details">
//           <summary>{t.teamLabel}</summary>
//           <div className="team-list">
//             {TEAM_MEMBERS.map((member, idx) => (
//               <div key={idx} className="team-member">
//                 <div className="avatar-circle">{member.initials}</div>
//                 <div className="member-info"><strong>{member.name}</strong></div>
//                 <button
//                   onClick={() => handleContactClick(member)}
//                   className="member-email-btn"
//                   title="Send email"
//                 >✉️</button>
//               </div>
//             ))}
//           </div>
//         </details>
//       </div>
//
//       <div style={settingsContainer}>
//         {settingsOpen && (
//           <div style={settingsMenu}>
//             <div style={settingsMenuHeader}>{t.settings}</div>
//             <div style={settingsRow}>
//               <span>{t.languageLabel}</span>
//               <div style={toggleGroup}>
//                 <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
//                 <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
//               </div>
//             </div>
//           </div>
//         )}
//         <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
//           {settingsOpen ? '✕' : '⚙'}
//         </button>
//       </div>
//
//       {contactOpen && (
//         <div className="modal-overlay">
//           <div className="modal-card">
//             <h2 style={{ ...titleTypography, fontSize: '24px', marginBottom: '20px' }}>
//               {t.contactTitle} {contactTarget?.name}
//             </h2>
//             <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//               <div style={{ display: 'flex', gap: '12px' }}>
//                 <input className="custom-input" placeholder={t.formLastName} required
//                   value={contactData.lastName} onChange={e => setContactData({ ...contactData, lastName: e.target.value })} />
//                 <input className="custom-input" placeholder={t.formFirstName} required
//                   value={contactData.firstName} onChange={e => setContactData({ ...contactData, firstName: e.target.value })} />
//               </div>
//               <input className="custom-input" type="email" placeholder={t.formEmail} required
//                 value={contactData.email} onChange={e => setContactData({ ...contactData, email: e.target.value })} />
//               <input className="custom-input" placeholder={t.formSubject} required
//                 value={contactData.subject} onChange={e => setContactData({ ...contactData, subject: e.target.value })} />
//               <textarea className="custom-input" placeholder={t.formContent} rows={4} required
//                 value={contactData.content} onChange={e => setContactData({ ...contactData, content: e.target.value })}
//                 style={{ resize: 'vertical', minHeight: '80px' }} />
//
//               <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
//                 <button type="button" onClick={() => setContactOpen(false)}
//                   style={{ ...loginButtonStyle, flex: 1, background: 'rgba(255,255,255,0.1)', boxShadow: 'none' }}>
//                   {t.btnCancel}
//                 </button>
//                 <button type="submit" style={{ ...loginButtonStyle, flex: 1 }} disabled={isSendingContact}>
//                   {isSendingContact ? t.sending : t.btnSend}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
//
// // --- Styles ---
// const pageWrapper: React.CSSProperties = {
//   height: "100dvh", /* Dynamic Viewport Height handles mobile bars seamlessly */
//   width: "100vw",
//   display: "flex",
//   alignItems: "center",
//   justifyContent: "center",
//   background: "transparent", /* Gradient removed to prevent the "dark rectangle" seam */
//   position: 'relative',
//   overflow: 'hidden',
//   margin: 0,
//   padding: 0
// };
//
// const titleTypography: React.CSSProperties = { fontSize: "40px", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 12px 0", color: "#ffffff", textAlign: 'center' };
// const subtitleTypography: React.CSSProperties = { fontSize: "16px", color: "#8e8e93", marginBottom: "40px", textAlign: 'center', lineHeight: "1.5" };
// const labelStyle: React.CSSProperties = { fontSize: "14px", fontWeight: 600, color: "#a1a1a6", marginLeft: "4px" };
// const errorText: React.CSSProperties = { color: "#ff453a", fontSize: "14px", textAlign: "center", margin: "0" };
// const loginButtonStyle: React.CSSProperties = { padding: "18px", borderRadius: "100px", background: "#3572ef", color: "#fff", border: "none", fontWeight: 700, fontSize: "17px", cursor: "pointer", boxShadow: "0 10px 30px rgba(53, 114, 239, 0.3)", marginTop: "10px" };
// const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
// const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
// const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
// const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
// const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
// const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
// const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700 };
//
// export default LoginPage;

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  const canvasRef = useRef(null); // Ref pentru Canvas-ul interactiv

  // --- State ---
  const [username, setUsername] = useState("Student");
  const [password, setPassword] = useState("parola123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [lang, setLang] = useState('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const [notification, setNotification] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactTarget, setContactTarget] = useState(null);
  const [contactData, setContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    content: ""
  });
  const [isSendingContact, setIsSendingContact] = useState(false);

  // --- LOGICA PENTRU EFECTUL DE PARTICULE (Canvas) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Setăm dimensiunea canvasului
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Mouse tracking
    const mouse = { x: undefined, y: undefined, radius: 150 };
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Configurare Particule
    const particlesArray = [];
    const numberOfParticles = (window.innerWidth * window.innerHeight) / 9000; // Densitatea punctelor

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      // Desenare punct
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      // Update poziție și interacțiune mouse
      update() {
        // Verificăm dacă a lovit marginea ecranului
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        // Verificăm coliziunea/proximitatea cu mouse-ul
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius + this.size) {
            // Efectul "Crazy": Particula fuge de mouse
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 3;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 3;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 3;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 3;
            }
        }

        // Mișcare normală
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
      }
    }

    // Inițializare particule
    function init() {
        particlesArray.length = 0;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5;
            let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1) - 0.5;
            let directionY = (Math.random() * 1) - 0.5;
            let color = '#3572ef'; // Culoarea albastră din tema ta
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Conectare puncte (Linii)
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                // Dacă sunt aproape, tragem linie
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(53, 114, 239,' + opacityValue + ')'; // Culoarea liniei
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop-ul de animație
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    init();
    animate();

    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Handlers ---
  async function handleSubmit(e) {
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

  const handleContactClick = (member) => {
    setContactTarget(member);
    setContactData({ firstName: "", lastName: "", email: "", subject: "", content: "" });
    setContactOpen(true);
  };

  const validateEmail = (email) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleContactSubmit = async (e) => {
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

        /* Blob Animations (păstrate, dar mai subtile în spatele particulelor) */
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
          position: absolute; filter: blur(120px); opacity: 0.25; /* Opacitate redusă */
          animation: blob 18s infinite ease-in-out alternate; border-radius: 50%;
        }

        .blob-1 { top: 10%; left: 10%; width: 600px; height: 600px; background: rgba(53, 114, 239, 0.4); animation-delay: 0s; }
        .blob-2 { bottom: 10%; right: 15%; width: 700px; height: 700px; background: rgba(100, 50, 200, 0.3); animation-delay: -5s; }
        .blob-3 { top: 40%; left: 30%; width: 500px; height: 500px; background: rgba(53, 114, 239, 0.2); animation-delay: -10s; }

        /* Card Styling */
        .login-card {
          background: rgba(28, 28, 30, 0.65); /* Mai transparent pentru a vedea particulele */
          backdrop-filter: blur(20px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 50px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5);
          animation: fadeIn 0.8s ease-out;
          position: relative;
          z-index: 10; /* Cardul PESTE canvas */
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

      {/* 1. CANVAS STRAT PARTICULE (INTERACTIV) */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      />

      {/* 2. BACKGROUND BLOBS (AMBIENT) */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

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