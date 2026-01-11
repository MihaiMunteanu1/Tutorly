import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Studioul de Avatare",
    subtitle: "Configurează-ți caracteristicile și generează un tutor digital unic.",
    back: "Înapoi",
    generate: "Generează Avatar",
    generating: "Se generează...",
    ready: "Avatarul este gata!",
    save: "Salvează și Continuă",
    nameLabel: "Nume",
    ageLabel: "Vârstă",
    genderLabel: "Gen",
    ethnicityLabel: "Etnie",
    styleLabel: "Stil Vizual",
    promptLabel: "Detalii Aspect (Prompt)",
    previewTitle: "Previzualizare Studio",
    yourCustomAvatar: "Avatarul Tău",
    processing: "Aproape gata...",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare"
  },
  en: {
    title: "Avatar Studio",
    subtitle: "Configure your characteristics and generate a unique digital tutor.",
    back: "Back",
    generate: "Generate Avatar",
    generating: "Generating...",
    ready: "Avatar is ready!",
    save: "Save and Continue",
    nameLabel: "Name",
    ageLabel: "Age",
    genderLabel: "Gender",
    ethnicityLabel: "Ethnicity",
    styleLabel: "Visual Style",
    promptLabel: "Appearance Details (Prompt)",
    previewTitle: "Studio Preview",
    yourCustomAvatar: "Your Avatar",
    processing: "Almost done...",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout"
  }
};

type AuthShape = { token: string | null; setToken: (t: string | null) => void };

export function CreateYourselfPage() {
  const navigate = useNavigate();
  // Added setToken for logout logic
  const { token, setToken } = useAuth() as unknown as AuthShape;

  const AGE_OPTIONS = ["Young Adult", "Early Middle Age", "Late Middle Age", "Senior", "Unspecified"];
  const GENDER_OPTIONS = ["Man", "Woman", "Unspecified"];
  const ETHNICITY_OPTIONS = ["White", "Black", "Asian American", "East Asian", "South East Asian", "South Asian", "Middle Eastern", "Pacific", "Hispanic", "Unspecified"];
  const STYLE_OPTIONS = ["Realistic", "Pixar", "Cinematic", "Vintage", "Noir", "Cyberpunk", "Unspecified"];

  const [form, setForm] = useState({
    name: "", age: "Young Adult", gender: "Man", ethnicity: "White", orientation: "vertical", pose: "close_up", style: "Realistic", appearance: "",
  });

  const [images, setImages] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const t = TRANSLATIONS[lang];
  const mainImage = useMemo(() => selected ?? images[0] ?? null, [selected, images]);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  async function startGeneration() {
    setBusy(true);
    setIsReady(false);
    await new Promise(r => setTimeout(r, 3000));

    const mockImages = [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800",
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800"
    ];

    setImages(mockImages);
    setBusy(false);
    setIsReady(true);
  }

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { font-family: 'Inter', sans-serif; box-sizing: border-box; }
        .studio-container { width: 100%; display: flex; flex-direction: column; align-items: center; padding-bottom: 100px; }
        .flip-container { perspective: 2000px; width: 550px; height: 850px; z-index: 1; }
        .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 48px; overflow: hidden; box-sizing: border-box; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
        .flip-front { background: rgba(28, 28, 30, 0.9); backdrop-filter: blur(40px); padding: 50px; display: flex; flex-direction: column; gap: 24px; }
        .flip-back { transform: rotateY(180deg); background: rgba(28, 28, 30, 0.98); backdrop-filter: blur(40px); padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        .input-row { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .input-row label { font-size: 13px; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.1em; margin-left: 4px; }
        .custom-field { background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 16px 20px; color: white; outline: none; transition: 0.3s; font-size: 15px; width: 100%; }
        .custom-field option { background-color: #1c1c1e; color: white; }
        .custom-field:focus { border-color: #3572ef; background: rgba(53, 114, 239, 0.08); }
        .preview-stage { width: 100%; max-width: 380px; aspect-ratio: 4/5.5; border-radius: 32px; overflow: hidden; background: #000; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 24px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 50px; height: 50px; border: 4px solid rgba(53, 114, 239, 0.1); border-top: 4px solid #3572ef; border-radius: 50%; animation: spin 1s linear infinite; }
        .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; max-width: 380px; }
        .gallery-thumb { aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: 0.3s; }
        .gallery-thumb.active { border-color: #3572ef; transform: scale(1.05); }
        .loading-overlay { position: absolute; inset: 0; background: rgba(28, 28, 30, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; }
        .logout-btn:hover { background: rgba(255, 255, 255, 0.2) !important; border-color: rgba(255, 255, 255, 0.4) !important; transform: scale(1.05); }
      `}</style>

      <div style={centeredHeaderLayout}>
        <h1 style={titleTypography}>{t.title}</h1>
        <p style={subtitleTypography}>{t.subtitle}</p>
      </div>

      <div className="studio-container">
        <div className="flip-container">
          <div className={`flip-inner ${isReady ? 'flipped' : ''}`}>
            <div className="flip-front">
              {busy && (
                <div className="loading-overlay">
                    <div className="ring-spinner" />
                    <span style={{ color: '#fff', marginTop: '20px', fontWeight: 600 }}>{t.processing}</span>
                </div>
              )}
              <div className="input-row">
                <label>{t.nameLabel}</label>
                <input className="custom-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Andrei" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="input-row">
                  <label>{t.ageLabel}</label>
                  <select className="custom-field" value={form.age} onChange={e => setForm(p => ({ ...p, age: e.target.value }))}>
                    {AGE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="input-row">
                  <label>{t.genderLabel}</label>
                  <select className="custom-field" value={form.gender} onChange={e => setForm(p => ({ ...p, gender: e.target.value }))}>
                    {GENDER_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              </div>
              <div className="input-row">
                <label>{t.ethnicityLabel}</label>
                <select className="custom-field" value={form.ethnicity} onChange={e => setForm(p => ({ ...p, ethnicity: e.target.value }))}>
                  {ETHNICITY_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="input-row">
                <label>{t.styleLabel}</label>
                <select className="custom-field" value={form.style} onChange={e => setForm(p => ({ ...p, style: e.target.value }))}>
                  {STYLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className="input-row">
                <label>{t.promptLabel}</label>
                <textarea className="custom-field" style={{ height: '100px', resize: 'none', lineHeight: '1.5' }} value={form.appearance} onChange={e => setForm(p => ({ ...p, appearance: e.target.value }))} placeholder="Ex: Păr șaten..." />
              </div>
              <button className="button-primary" style={{ ...actionBtn, background: '#3572ef', marginTop: 'auto' }} onClick={startGeneration} disabled={busy}>{busy ? t.generating : t.generate}</button>
            </div>

            <div className="flip-back">
              <div style={{ marginBottom: '20px', fontSize: '13px', fontWeight: 800, color: '#3572ef', textTransform: 'uppercase', letterSpacing: '0.2em' }}>{t.previewTitle}</div>
              <div className="preview-stage"><img src={mainImage!} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" /></div>
              <div className="gallery-grid">
                {images.map(img => (
                  <div key={img} className={`gallery-thumb ${selected === img ? 'active' : ''}`} onClick={() => setSelected(img)}><img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Option" /></div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '380px', marginTop: '30px' }}>
                  <button className="button-secondary" style={{ flex: 1, height: '56px', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', background: 'transparent', borderRadius: '16px' }} onClick={() => { setIsReady(false); setImages([]); }}>{t.back}</button>
                  <button className="button-primary" style={{ flex: 2, height: '56px', background: '#34c759', borderRadius: '16px', border: 'none', color: '#fff', fontWeight: 700 }} onClick={() => navigate("/voices")}>{t.save}</button>
              </div>
            </div>
          </div>
        </div>
        <button className="button-secondary" onClick={() => navigate("/mode")} style={{ ...refinedBackBtn, marginTop: '40px' }}>{t.back}</button>
      </div>

      {/* SETTINGS HUB WITH LOGOUT */}
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

// --- Style Variables ---
const pageWrapper: React.CSSProperties = { minHeight: "100vh", width: "100%", background: "radial-gradient(circle at top, #1e293b 0, #020617 55%)", padding: "60px 40px", display: 'flex', flexDirection: 'column', alignItems: 'center' };
const centeredHeaderLayout: React.CSSProperties = { width: '100%', maxWidth: '800px', textAlign: "center", marginBottom: "40px" };
const titleTypography: React.CSSProperties = { fontSize: "52px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "20px", color: "#8e8e93", marginTop: "12px" };
const refinedBackBtn: React.CSSProperties = { height: "56px", padding: "0 40px", borderRadius: "100px", fontWeight: 700, fontSize: "16px", border: "1px solid rgba(255,255,255,0.2)", cursor: 'pointer', color: '#fff', background: 'transparent' };
const actionBtn: React.CSSProperties = { height: '64px', borderRadius: '16px', color: "#fff", border: "none", fontWeight: 700, fontSize: "18px", cursor: "pointer", boxShadow: "0 10px 25px rgba(53, 114, 239, 0.3)" };
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };

export default CreateYourselfPage;