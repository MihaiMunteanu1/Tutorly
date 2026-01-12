import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

// --- Types ---
type AvatarSelection = { id: string; name: string; image_url?: string; avatar_type?: "avatar" | "talking_photo" };
type VoiceSelection = { id: string; name: string };
type AuthContextShape = {
  token: string | null;
  setToken: (t: string | null) => void;
  setAvatar: (a: AvatarSelection) => void;
  setVoice: (v: VoiceSelection) => void;
};
type PresetKey = "mate" | "informatica" | "geografie" | "engleza";
type Preset = {
  key: PresetKey;
  avatarGroupId: string;
  avatarId: string;
  avatarName: string;
  voiceId: string;
  voiceName: string;
};

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    headerTitle: "Tutorii tăi Digitali",
    headerSubtitle: "Selectează un expert pentru a începe conversația video.",
    loading: "Pregătim lecțiile...",
    back: "Înapoi",
    startLesson: "Începe Lecția",
    personalization: "Personalizare",
    customSelection: "Selectare Manuală",
    customDesc: "Alege manual orice combinație de avatar și voce pentru o experiență unică.",
    openLibrary: "Deschide Biblioteca",
    createAvatar: "Creare Avatar",
    cloneImage: "Clonare Imagine",
    yourAvatar: "Avatarul Tău",
    yourAvatarDesc: "Transformă o fotografie personală întrun tutor digital care îți vorbește în timp real.",
    createNow: "Creează Acum",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    presets: {
      informatica: { title: "Informatica", desc: "Lumea Algoritmilor", long: "Explorează structurile de date și conceptele OOP într-un mod interactiv." },
      geografie: { title: "Geografie", desc: "Orizonturi Globale", long: "Hărți, relief și capitale explicate de un ghid digital pasionat." },
      mate: { title: "Matematica", desc: "Logica Numerelor", long: "De la algebră la trigonometrie, transformăm formulele în intuiție." },
      engleza: { title: "Engleza", desc: "Fluență Digitală", long: "Exersează conversația și gramatica într-un dialog natural." }
    }
  },
  en: {
    headerTitle: "Your Digital Tutors",
    headerSubtitle: "Select an expert to begin the video conversation.",
    loading: "Preparing lessons...",
    back: "Back",
    startLesson: "Start Lesson",
    personalization: "Personalization",
    customSelection: "Manual Selection",
    customDesc: "Manually choose any avatar and voice combination for a unique experience.",
    openLibrary: "Open Library",
    createAvatar: "Create Avatar",
    cloneImage: "Image Cloning",
    yourAvatar: "Your Avatar",
    yourAvatarDesc: "Transform a personal photo into a digital tutor that speaks to you in real-time.",
    createNow: "Create Now",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    presets: {
      informatica: { title: "Computer Science", desc: "World of Algorithms", long: "Explore data structures and OOP concepts in an interactive way." },
      geografie: { title: "Geography", desc: "Global Horizons", long: "Maps, landforms, and capitals explained by a digital guide." },
      mate: { title: "Mathematics", desc: "Logic of Numbers", long: "From algebra to trigonometry, we turn formulas into intuition." },
      engleza: { title: "English", desc: "Digital Fluency", long: "Practice conversation and grammar in a natural dialogue." }
    }
  }
};

const PRESETS: Preset[] = [
  { key: "informatica", avatarGroupId: "d08c85e6cff84d78b6dc41d83a2eccce", avatarId: "Brandon_Office_Sitting_Front_public", avatarName: "Brandon Office Sitting Front", voiceId: "3787b4ab93174952a3ad649209f1029a", voiceName: "Brandon" },
  { key: "geografie", avatarGroupId: "1727672614", avatarId: "Georgia_sitting_office_front", voiceId: "da6a3889803f4ef29db3b9cdd7ec7135", voiceName: "Georgia", avatarName: "Georgia Sitting Office Front" },
  { key: "mate", avatarGroupId: "977b1ab85dba4eefb159a6072677effd", avatarId: "Caroline_Business_Sitting_Side_public", voiceId: "da6a3889803f4ef29db3b9cdd7ec7135", voiceName: "Georgia", avatarName: "Caroline Business Sitting Side" },
  { key: "engleza", avatarGroupId: "977b1ab85dba4eefb159a6072677effd", avatarId: "Caroline_Lobby_Standing_Side_public", voiceId: "da6a3889803f4ef29db3b9cdd7ec7135", voiceName: "Georgia", avatarName: "Caroline Lobby Standing Side" },
];

async function fetchAvatarPreviewFromGroup(params: { token: string; groupId: string; avatarId: string }) {
  const res = await fetch(`${API_URL}/api/heygen/avatar-group/${params.groupId}/avatars`, {
    headers: { Authorization: `Bearer ${params.token}` },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const list = json.data?.avatar_list ?? json.data?.avatars ?? [];
  const found = list.find((a: any) => a.avatar_id === params.avatarId);
  return found ? { imageUrl: found.preview_image_url, resolvedName: found.avatar_name } : null;
}

export function SubjectAvatarsPage() {
  const navigate = useNavigate();
  const { token, setToken, setAvatar, setVoice } = (useAuth() as unknown) as AuthContextShape;
  const [previewByKey, setPreviewByKey] = useState<Record<string, { imageUrl: string; name: string }>>({});
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  const work = useMemo(() => PRESETS.map(p => ({ key: p.key, groupId: p.avatarGroupId, avatarId: p.avatarId, fallbackName: p.avatarName })), []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(work.map(async (w) => {
          const preview = await fetchAvatarPreviewFromGroup({ token, groupId: w.groupId, avatarId: w.avatarId });
          return [w.key, { imageUrl: preview?.imageUrl ?? "", name: preview?.resolvedName ?? w.fallbackName }] as const;
        }));
        if (!cancelled) setPreviewByKey(Object.fromEntries(entries));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [token, work]);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  const scrollByAmount = (direction: "L" | "R") => {
    if (!sliderRef.current) return;
    const gap = 40;
    const horizontalPadding = 40;
    const containerWidth = sliderRef.current.offsetWidth - horizontalPadding;
    const cardWidth = (containerWidth - (gap * 2)) / 3;
    const moveAmount = cardWidth + gap;
    sliderRef.current.scrollBy({ left: direction === "L" ? -moveAmount : moveAmount, behavior: "smooth" });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") scrollByAmount("L");
      if (e.key === "ArrowRight") scrollByAmount("R");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const onPickPreset = (p: Preset) => {
    const preview = previewByKey[p.key];
    setAvatar({
      id: p.avatarId,
      name: preview?.name ?? p.avatarName,
      image_url: preview?.imageUrl ?? "",
      avatar_type: "avatar",
    });
    setVoice({ id: p.voiceId, name: p.voiceName });
    navigate("/chat");
  };

  if (!token) { navigate("/login"); return null; }

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        /* 1. Global Reset - Exactly as LoginPage */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden; /* Removes browser scrollbar */
          background-color: #020617;
        }

        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        /* 2. Seamless Background Animation */
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

        /* 3. Page Styles */
        .flip-container { perspective: 2000px; perspective-origin: center center; flex: 0 0 calc((100% - (80px)) / 3); aspect-ratio: 4 / 5.5; min-width: 340px; z-index: 1; transition: z-index 0.4s step-end; }
        .flip-container:hover { z-index: 50; transition: z-index 0s step-start; }
        .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); transform-style: preserve-3d; transform-origin: center center; }
        .flip-container:hover .flip-inner { transform: rotateY(180deg); }
        .flip-front, .flip-back { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 40px; overflow: hidden; box-sizing: border-box; border: 1px solid rgba(255, 255, 255, 0.12); }
        .flip-back { transform: rotateY(180deg); background: rgba(28, 28, 30, 0.98); backdrop-filter: blur(40px); display: flex; flex-direction: column; padding: 40px; justify-content: center; align-items: center; text-align: center; }
        
        /* Slider needs horizontal overflow while keeping page locked vertically */
        .slider-container::-webkit-scrollbar { display: none; }
        .slider-container { -ms-overflow-style: none; scrollbar-width: none; overflow-x: auto !important; overflow-y: visible !important; }
        
        @keyframes movingGlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .pro-glow::before { content: ""; position: absolute; inset: -2px; border-radius: 42px; padding: 2px; background: linear-gradient(90deg, #3a86ff, #8338ec, #ff006e, #3a86ff); background-size: 200% 200%; animation: movingGlow 6s linear infinite; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        .side-arrow:hover { background: rgba(255, 255, 255, 0.15) !important; transform: translateY(-50%) scale(1.1); border-color: rgba(255, 255, 255, 0.3) !important; }
        
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .loader-wrapper { display: flex; justify-content: center; align-items: center; height: 100%; width: 100%; background: #1c1c1e; }
        .ring-spinner { width: 45px; height: 45px; border: 3px solid rgba(53, 114, 239, 0.1); border-top: 3px solid #3572ef; border-radius: 50%; animation: spin 0.8s linear infinite; }
        .logout-btn:hover { background: rgba(255, 255, 255, 0.2) !important; border-color: rgba(255, 255, 255, 0.4) !important; transform: scale(1.05); }
      `}</style>

      {/* FIXED BACKGROUND LAYER */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={contentWrapper}>
        <div style={headerLayout}>
          <div style={{ flex: 1 }}>
            <h1 style={titleTypography}>{t.headerTitle}</h1>
            <p style={subtitleTypography}>{loading ? t.loading : t.headerSubtitle}</p>
          </div>
          <button className="button-secondary" onClick={() => navigate("/mode")} style={refinedBackBtn}>{t.back}</button>
        </div>

        <div style={{ position: "relative", width: "100%" }}>
          <button className="side-arrow" onClick={() => scrollByAmount("L")} style={{ ...refinedArrowBtn, left: "-100px" }}>←</button>
          <button className="side-arrow" onClick={() => scrollByAmount("R")} style={{ ...refinedArrowBtn, right: "-100px" }}>→</button>

          <div ref={sliderRef} className="slider-container" style={sliderLayout}>
            {PRESETS.map((p) => {
              const preview = previewByKey[p.key];
              const content = t.presets[p.key];
              return (
                <div key={p.key} className="flip-container">
                  <div className="flip-inner">
                    <div className="flip-front" style={{ background: '#1c1c1e' }}>
                      {!preview?.imageUrl ? (
                        <div className="loader-wrapper"><div className="ring-spinner"></div></div>
                      ) : (
                        <>
                          <img src={preview.imageUrl} style={fullImg} alt={content.title} draggable="false" />
                          <div style={appleGradientOverlay} />
                          <div style={badgeContainer}><span style={disciplineBadge}>{content.title}</span></div>
                        </>
                      )}
                    </div>
                    <div className="flip-back" onClick={(e) => { e.stopPropagation(); onPickPreset(p); }}>
                      <span style={disciplineBadgeSmall}>{content.title}</span>
                      <h3 style={cardHeaderStyle}>{content.desc}</h3>
                      <p style={cardDescriptionStyle}>{content.long}</p>
                      <button style={startBtnStyle}>{t.startLesson}</button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="flip-container">
              <div className="flip-inner pro-glow">
                <div className="flip-front" style={specialVisualArea}>
                  <div style={refinedIconCircle}>✨</div>
                  <div style={badgeContainer}><span style={disciplineBadge}>{t.personalization}</span></div>
                </div>
                <div className="flip-back" onClick={() => navigate("/avatars")}>
                  <h3 style={cardHeaderStyle}>{t.customSelection}</h3>
                  <p style={cardDescriptionStyle}>{t.customDesc}</p>
                  <button style={startBtnStyle}>{t.openLibrary}</button>
                </div>
              </div>
            </div>

            <div className="flip-container">
              <div className="flip-inner pro-glow">
                <div className="flip-front" style={specialVisualArea}>
                  <div style={refinedDashedCircle}>+</div>
                  <div style={badgeContainer}><span style={disciplineBadge}>{t.createAvatar}</span></div>
                </div>
                <div className="flip-back" onClick={() => navigate("/create-yourself")}>
                  <h3 style={cardHeaderStyle}>{t.yourAvatar}</h3>
                  <p style={cardDescriptionStyle}>{t.yourAvatarDesc}</p>
                  <button style={startBtnStyle}>{t.createNow}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
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

const contentWrapper: React.CSSProperties = { maxWidth: "1500px", width: "95%", zIndex: 1 };
const headerLayout: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px", padding: "0 20px" };
const titleTypography: React.CSSProperties = { fontSize: "52px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "20px", color: "#8e8e93", marginTop: "12px", fontWeight: 400 };
const sliderLayout: React.CSSProperties = { display: "flex", gap: "40px", overflowX: "auto", padding: "20px 20px 100px 20px", scrollSnapType: "x mandatory", scrollBehavior: "smooth" };
const fullImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const appleGradientOverlay: React.CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.1) 70%, transparent 100%)" };
const badgeContainer: React.CSSProperties = { position: "absolute", bottom: "40px", left: "0", right: "0", textAlign: "center" };
const disciplineBadge: React.CSSProperties = { fontSize: "15px", fontWeight: 600, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.5em", textShadow: "0 2px 12px rgba(0,0,0,0.8)", display: "block" };
const disciplineBadgeSmall: React.CSSProperties = { fontSize: "14px", fontWeight: 800, color: "#3572ef", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: "20px" };
const cardHeaderStyle: React.CSSProperties = { fontSize: "32px", fontWeight: 700, color: "#f5f5f7", margin: "0 0 16px 0", lineHeight: 1.1 };
const cardDescriptionStyle: React.CSSProperties = { fontSize: "17px", color: "#a1a1a6", lineHeight: "1.7", margin: "0 0 44px 0" };
const startBtnStyle: React.CSSProperties = { padding: "16px 36px", borderRadius: "100px", background: "#3572ef", color: "#fff", border: "none", fontWeight: 700, fontSize: "16px", cursor: "pointer", boxShadow: "0 10px 25px rgba(53, 114, 239, 0.3)" };
const refinedArrowBtn: React.CSSProperties = {
  position: "absolute",
  top: "calc(50% - 40px)",
  transform: "translateY(-50%)",
  zIndex: 100,
  width: "70px",
  height: "70px",
  borderRadius: "50%",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(15px)",
  color: "white",
  cursor: "pointer",
  fontSize: "26px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
};
const refinedBackBtn: React.CSSProperties = { height: "56px", padding: "0 40px", borderRadius: "100px", fontWeight: 700, fontSize: "16px", border: "1px solid rgba(255, 255, 255, 0.2)", cursor: 'pointer', color: '#fff', background: 'transparent' };
const specialVisualArea: React.CSSProperties = { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "28px", background: "#1c1c1e" };
const refinedIconCircle: React.CSSProperties = { width: "110px", height: "110px", borderRadius: "50%", background: "linear-gradient(135deg, #3572ef, #5e5ce6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", boxShadow: "0 25px 50px rgba(53, 114, 239, 0.4)" };
const refinedDashedCircle: React.CSSProperties = { width: "110px", height: "110px", borderRadius: "50%", border: "2px dashed #48484a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "52px", color: "#48484a" };
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };

export default SubjectAvatarsPage;