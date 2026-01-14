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
  setSelectionSource?: (s: string) => void;
  setLiveAvatarId?: (id: string | null) => void;
  setLiveAvatarVoiceId?: (id: string | null) => void;
};
type PresetKey = "mate" | "informatica" | "geografie" | "engleza";
type Preset = {
  key: PresetKey;
  liveAvatarVoiceId: string,
  liveAvatarId: string,
  avatarGroupId: string;
  avatarId: string;
  avatarName: string;
  voiceId: string;
  voiceName: string;
};

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    headerTitle: "Tutorii Digitali",
    headerSubtitle: "Sistem configurat. Selectează expertul pentru a iniția dialogul.",
    loading: "Se analizează baza de date...",
    back: "Înapoi",
    startLesson: "Începe Lecția",
    personalization: "Personalizare",
    customSelection: "Selectare Manuală",
    customDesc: "Alege manual combinația de avatar și voce pentru o experiență unică.",
    openLibrary: "Deschide Biblioteca",
    createAvatar: "Creare Avatar",
    yourAvatar: "Avatarul Tău",
    yourAvatarDesc: "Transformă o fotografie personală într-un tutor digital în timp real.",
    createNow: "Creează Acum",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    presets: {
      informatica: { title: "Informatica", desc: "Arhitectura Codului", long: "Explorează structurile de date și conceptele OOP într-un mod interactiv." },
      geografie: { title: "Geografie", desc: "Orizonturi Globale", long: "Hărți, relief și capitale explicate de un ghid digital pasionat." },
      mate: { title: "Matematica", desc: "Logica Pură", long: "De la algebră la trigonometrie, transformăm formulele în intuiție." },
      engleza: { title: "Engleza", desc: "Fluență Lingvistică", long: "Exersează conversația și gramatica într-un dialog natural." }
    }
  },
  en: {
    headerTitle: "Digital Tutors",
    headerSubtitle: "System ready. Select an expert to begin the interaction.",
    loading: "Analyzing neural database...",
    back: "Back",
    startLesson: "Start Lesson",
    personalization: "Personalization",
    customSelection: "Manual Selection",
    customDesc: "Manually choose any avatar and voice combination for a unique experience.",
    openLibrary: "Open Library",
    createAvatar: "Create Avatar",
    yourAvatar: "Your Avatar",
    yourAvatarDesc: "Transform a personal photo into a real-time digital tutor.",
    createNow: "Create Now",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    presets: {
      informatica: { title: "CompSci", desc: "Code Architecture", long: "Explore data structures and OOP concepts in an interactive way." },
      geografie: { title: "Geography", desc: "Global Horizons", long: "Maps, landforms, and capitals explained by a digital guide." },
      mate: { title: "Mathematics", desc: "Pure Logic", long: "From algebra to trigonometry, we turn formulas into intuition." },
      engleza: { title: "English", desc: "Linguistic Fluency", long: "Practice conversation and grammar in a natural dialogue." }
    }
  }
};

const PRESETS: Preset[] = [
  { key: "informatica", liveAvatarVoiceId:"9c8b542a-bf5c-4f4c-9011-75c79a274387", liveAvatarId:"64b526e4-741c-43b6-a918-4e40f3261c7a", avatarGroupId: "1732148627", avatarId: "Bryan_IT_Sitting_public", avatarName: "Bryan", voiceId: "3787b4ab93174952a3ad649209f1029a", voiceName: "Brandon" },
  { key: "geografie",liveAvatarVoiceId:"4f3b1e99-b580-4f05-9b67-a5f585be0232",liveAvatarId:"b6c94c07-e4e5-483e-8bec-e838d5910b7d",  avatarGroupId: "1732323320", avatarId: "Judy_Teacher_Standing_public", voiceId: "da6a3889803f4ef29db3b9cdd7ec7135", voiceName: "Georgia", avatarName: "Judy" },
  { key: "mate",liveAvatarVoiceId:"de5574fc-009e-4a01-a881-9919ef8f5a0c", liveAvatarId:"513fd1b7-7ef9-466d-9af2-344e51eeb833", avatarGroupId: "1732832799", avatarId: "Ann_Therapist_public", voiceId: "da6a3889803f4ef29db3b9cdd7ec7135", voiceName: "Georgia", avatarName: "Ann" },
  { key: "engleza",liveAvatarVoiceId:"b952f553-f7f3-4e52-8625-86b4c415384f",liveAvatarId:"0930fd59-c8ad-434d-ad53-b391a1768720",  avatarGroupId: "1732323365", avatarId: "Dexter_Lawyer_Sitting_public", voiceId: "3787b4ab93174952a3ad649209f1029a", voiceName: "Georgia", avatarName: "Dexter" },
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
  const { token, setToken, setAvatar, setVoice, setSelectionSource, setLiveAvatarId, setLiveAvatarVoiceId } = (useAuth() as any) as AuthContextShape;
  const [previewByKey, setPreviewByKey] = useState<Record<string, { imageUrl: string; name: string }>>({});
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const entries = await Promise.all(PRESETS.map(async (p) => {
          const preview = await fetchAvatarPreviewFromGroup({ token, groupId: p.avatarGroupId, avatarId: p.avatarId });
          return [p.key, { imageUrl: preview?.imageUrl ?? "", name: preview?.resolvedName ?? p.avatarName }] as const;
        }));
        if (!cancelled) setPreviewByKey(Object.fromEntries(entries));
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [token]);

  const handleLogout = () => { setToken(null); navigate("/login"); };

  const scrollByAmount = (direction: "L" | "R") => {
    if (!sliderRef.current) return;
    const gap = 40;
    const containerWidth = sliderRef.current.offsetWidth;
    const cardWidth = (containerWidth - (gap * 2)) / 3;
    const moveAmount = Math.ceil(cardWidth + gap) + 1;
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
    setAvatar({ id: p.avatarId, name: preview?.name ?? p.avatarName, image_url: preview?.imageUrl ?? "", avatar_type: "avatar" });
    setVoice({ id: p.voiceId, name: p.voiceName });
    setSelectionSource?.("preset");
    setLiveAvatarId?.(p.liveAvatarId);
    setLiveAvatarVoiceId?.(p.liveAvatarVoiceId);
    navigate("/mode-selection");
  };

  if (!token) { navigate("/login"); return null; }

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(60px, -60px) rotate(10deg); } }

        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(53, 114, 239, 0.2);
        }

        .elegant-entry { opacity: 0; animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes elegantEntry { from { opacity: 0; filter: blur(10px); transform: translateY(20px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }

        .flip-container { perspective: 2000px; flex: 0 0 calc((100% - 80px) / 3); aspect-ratio: 4 / 5.5; min-width: 340px; z-index: 1; }
        .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1); transform-style: preserve-3d; }
        .flip-container:hover .flip-inner { transform: rotateY(180deg); }
        .flip-front, .flip-back { position: absolute; inset: 0; backface-visibility: hidden; border-radius: 40px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); }
        .flip-back { transform: rotateY(180deg); background: rgba(28, 28, 30, 0.98); backdrop-filter: blur(40px); display: flex; flex-direction: column; padding: 40px; justify-content: center; align-items: center; text-align: center; cursor: pointer; }
        .flip-back-pro { background: linear-gradient(to bottom, #1c1c1e 0%, #020617 100%) !important; overflow: hidden; }
        
        .pro-content-container { position: relative; z-index: 5; display: flex; flex-direction: column; align-items: center; }
        .slider-container::-webkit-scrollbar { display: none; }
        .slider-container { display: flex; gap: 40px; overflow-x: auto; padding: 20px 0 100px 0; scroll-behavior: smooth; -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes movingGlow { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
        .pro-glow::before { content: ""; position: absolute; inset: -2px; border-radius: 42px; padding: 2px; background: linear-gradient(90deg, #3a86ff, #8338ec, #ff006e, #3a86ff); background-size: 200% 200%; animation: movingGlow 6s linear infinite; -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }
        
        .shimmer-btn { position: relative; overflow: hidden; transition: all 0.4s ease; }
        .shimmer-btn::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%) rotate(-45deg); } 20%, 100% { transform: translateX(100%) rotate(-45deg); } }

        @keyframes skeletonShimmer { 
           0% { background-position: -200% 0; } 
           100% { background-position: 200% 0; } 
        }

        .premium-skeleton {
          width: 100%; height: 100%;
          background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
          background-size: 200% 100%;
          animation: skeletonShimmer 2.5s infinite linear;
          display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding-bottom: 40px;
        }

        .skeleton-tag { width: 100px; height: 10px; background: rgba(255,255,255,0.05); border-radius: 4px; }

        .side-arrow { 
          position: absolute; top: calc(50% - 40px); transform: translateY(-50%); z-index: 100; width: 72px; height: 72px; 
          border-radius: 50%; border: 1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.05); 
          backdrop-filter: blur(30px); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s;
          font-size: 24px;
        }
        .side-arrow:hover { background: rgba(255, 255, 255, 0.15) !important; transform: translateY(-50%) scale(1.1); border-color: rgba(255, 255, 255, 0.3) !important; }

        .glass-orb { position: absolute; border-radius: 50%; filter: blur(45px); opacity: 0.18; z-index: 1; }
        .orb-personalization { animation: floatCard 10s infinite ease-in-out alternate; }
        .orb-create { animation: floatCardAlt 12s infinite ease-in-out alternate; }
        @keyframes floatCard { 0% { transform: translate(0, 0); } 50% { transform: translate(20px, -20px); } 100% { transform: translate(0, 0); } }
        @keyframes floatCardAlt { 0% { transform: translate(0, 0); } 50% { transform: translate(-25px, 20px) scale(1.05); } 100% { transform: translate(0, 0); } }
      `}</style>

      <div className="background-blobs"><div className="blob blob-1" /><div className="blob blob-2" /></div>

      <div style={contentWrapper}>
        <div className="elegant-entry" style={headerLayout}>
          <div style={{ flex: 1 }}>
            <span style={superTag}>Expert Faculty</span>
            <h1 className="living-title" style={titleTypography}>{t.headerTitle}</h1>
            <p style={subtitleTypography}>{loading ? t.loading : t.headerSubtitle}</p>
          </div>
          <button onClick={() => navigate("/login")} style={refinedBackBtn}>{t.back}</button>
        </div>

        <div style={{ position: "relative", width: "100%", padding: '0 80px' }}>
          <button className="side-arrow" onClick={() => scrollByAmount("L")} style={{ left: "-60px" }}>←</button>
          <button className="side-arrow" onClick={() => scrollByAmount("R")} style={{ right: "-60px" }}>→</button>

          <div ref={sliderRef} className="slider-container">
            {PRESETS.map((p, idx) => {
              const preview = previewByKey[p.key];
              const content = t.presets[p.key];
              return (
                <div key={p.key} className="flip-container elegant-entry" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="flip-inner">
                    <div className="flip-front" style={{ background: '#0a0a0c' }}>
                      {!preview?.imageUrl ? (
                         <div className="premium-skeleton"><div className="skeleton-tag" /></div>
                      ) : (
                        <>
                          <img src={preview.imageUrl} style={fullImg} alt={content.title} draggable="false" />
                          <div style={appleGradientOverlay} />
                          <div style={badgeContainer}><span style={disciplineBadge}>{content.title}</span></div>
                        </>
                      )}
                    </div>
                    <div className="flip-back" onClick={() => onPickPreset(p)}>
                      <span style={disciplineBadgeSmall}>{content.title}</span>
                      <h3 style={cardHeaderStyle}>{content.desc}</h3>
                      <p style={cardDescriptionStyle}>{content.long}</p>
                      <button className="shimmer-btn" style={startBtnStyle}>{t.startLesson}</button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* PERSONALIZATION CARD - PRO GLOW RESTORED */}
            <div className="flip-container elegant-entry" style={{ animationDelay: '0.4s' }}>
              <div className="flip-inner pro-glow">
                <div className="flip-front" style={specialVisualArea}>
                  <div style={noiseOverlay} />
                  <div className="glass-orb orb-personalization" style={{ top: '10%', left: '10%', width: '150px', height: '150px', background: '#8338ec' }} />
                  <div className="glass-orb orb-personalization" style={{ bottom: '20%', right: '5%', width: '180px', height: '180px', background: '#3a86ff', animationDelay: '-2s' }} />
                  <div className="glass-orb orb-personalization" style={{ top: '40%', right: '20%', width: '100px', height: '100px', background: '#ff006e', animationDelay: '-5s' }} />

                  <div style={{ ...refinedIconCircle, background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', zIndex: 2 }}>
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                        <circle cx="12" cy="10" r="3" />
                        <path d="M12 13v4" />
                    </svg>
                  </div>
                  <div style={badgeContainer}><span style={disciplineBadge}>{t.personalization}</span></div>
                </div>

                <div className="flip-back flip-back-pro" onClick={() => navigate("/avatars")}>
                   <div style={noiseOverlay} />
                   <div className="glass-orb orb-personalization" style={{ top: '10%', right: '10%', width: '150px', height: '150px', background: '#8338ec' }} />
                   <div className="glass-orb orb-personalization" style={{ bottom: '20%', left: '5%', width: '180px', height: '180px', background: '#3a86ff', animationDelay: '-2s' }} />
                   <div className="pro-content-container">
                      <h3 style={cardHeaderStyle}>{t.customSelection}</h3>
                      <p style={cardDescriptionStyle}>{t.customDesc}</p>
                      <button className="shimmer-btn" style={startBtnStyle}>{t.openLibrary}</button>
                  </div>
                </div>
              </div>
            </div>

            {/* CREATE CARD - PRO GLOW RESTORED */}
            <div className="flip-container elegant-entry" style={{ animationDelay: '0.5s' }}>
              <div className="flip-inner pro-glow">
                <div className="flip-front" style={specialVisualArea}>
                  <div style={noiseOverlay} />
                  <div className="glass-orb orb-create" style={{ top: '5%', right: '10%', width: '160px', height: '160px', background: '#00d2ff' }} />
                  <div className="glass-orb orb-create" style={{ bottom: '15%', left: '10%', width: '190px', height: '190px', background: '#34c759', animationDelay: '-3s' }} />
                  <div className="glass-orb orb-create" style={{ top: '50%', left: '20%', width: '120px', height: '120px', background: '#3572ef', animationDelay: '-6s', transform: 'translateY(-50%)' }} />

                  <div style={{ ...refinedDashedCircle, background: 'rgba(255, 255, 255, 0.03)', border: '1px dashed rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', zIndex: 2 }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  </div>
                  <div style={badgeContainer}><span style={disciplineBadge}>{t.createAvatar}</span></div>
                </div>

                <div className="flip-back flip-back-pro" onClick={() => navigate("/create-yourself")}>
                  <div style={noiseOverlay} />
                  <div className="glass-orb orb-create" style={{ top: '5%', left: '10%', width: '160px', height: '160px', background: '#00d2ff' }} />
                  <div className="glass-orb orb-create" style={{ bottom: '15%', right: '10%', width: '190px', height: '190px', background: '#34c759', animationDelay: '-3s' }} />
                  <div className="pro-content-container">
                    <h3 style={cardHeaderStyle}>{t.yourAvatar}</h3>
                    <p style={cardDescriptionStyle}>{t.yourAvatarDesc}</p>
                    <button className="shimmer-btn" style={startBtnStyle}>{t.createNow}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                <span style={{ color: '#ff453a', fontWeight: 600, cursor: 'pointer' }} onClick={handleLogout}>{t.logout}</span>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

// --- Styles ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", alignItems: "center", justifyContent: "center", position: 'relative', overflow: 'hidden' };
const contentWrapper: React.CSSProperties = { maxWidth: "1600px", width: "94%", zIndex: 1 };
const headerLayout: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "60px", padding: "0 20px" };
const superTag: React.CSSProperties = { color: '#3572ef', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '11px', marginBottom: '16px', display: 'block' };
const titleTypography: React.CSSProperties = { fontSize: "64px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0 };
const subtitleTypography: React.CSSProperties = { fontSize: "17px", color: "#6e7681", marginTop: "12px", fontWeight: 500 };

const fullImg: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const appleGradientOverlay: React.CSSProperties = { position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)" };
const badgeContainer: React.CSSProperties = { position: "absolute", bottom: "40px", left: "0", right: "0", textAlign: "center" };
const disciplineBadge: React.CSSProperties = { fontSize: "14px", fontWeight: 800, color: "#ffffff", textTransform: "uppercase", letterSpacing: "0.3em" };
const disciplineBadgeSmall: React.CSSProperties = { fontSize: "12px", fontWeight: 800, color: "#3572ef", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "20px" };

const cardHeaderStyle: React.CSSProperties = { fontSize: "28px", fontWeight: 800, color: "#fff", marginBottom: "12px" };
const cardDescriptionStyle: React.CSSProperties = { fontSize: "15px", color: "#6e7681", lineHeight: "1.6", marginBottom: "40px" };
const startBtnStyle: React.CSSProperties = { height: "56px", padding: "0 32px", borderRadius: "100px", background: "#3572ef", color: "#fff", border: "none", fontWeight: 800, fontSize: "14px", cursor: "pointer", boxShadow: "0 20px 40px rgba(0,0,0,0.3)" };

const refinedBackBtn: React.CSSProperties = { height: "48px", padding: "0 28px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' };

const specialVisualArea: React.CSSProperties = { height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "28px", background: "linear-gradient(to bottom, #1c1c1e 0%, #020617 100%)", position: 'relative' };
const noiseOverlay: React.CSSProperties = { position: 'absolute', inset: 0, opacity: 0.05, background: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'1\'/%3E%3C/svg%3E")', pointerEvents: 'none', zIndex: 0 };
const refinedIconCircle: React.CSSProperties = { width: "110px", height: "110px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "48px", color: "white" };
const refinedDashedCircle: React.CSSProperties = { width: "110px", height: "110px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.4)" };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(20px)' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(30px)', color: '#fff' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex" };