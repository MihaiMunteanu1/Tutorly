import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

// --- Types ---
type AuthAvatar = {
  id: string;
  name?: string;
  image_url?: string | null;
  avatar_type?: "avatar" | "talking_photo";
};

type AuthShape = {
  token: string | null;
  setToken: (t: string | null) => void;
  setAvatar: (a: AuthAvatar) => void;
};

type GenerateReq = {
  name: string;
  age: string;
  gender: string;
  ethnicity: string;
  orientation: string;
  pose: string;
  style: string;
  appearance: string;
};

type GenerateRes = { generation_id: string };

type StatusRes = {
  id: string;
  status: string;
  msg?: string | null;
  image_url_list: string[];
  image_key_list?: string[];
};

type CreateGroupReq = {
  generation_id: string;
  image_key: string;
  name: string;
};

type CreateGroupRes = {
  group_id: string;
  id?: string;
  image_url?: string;
  name?: string;
  status?: string;
};

// --- Helper Functions ---
function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

// --- Placeholder Data ---
const NAME_PLACEHOLDERS = {
  ro: ["Andrei", "Maria", "Alexandru", "Elena", "Matei", "Ioana", "Stefan", "Cristina", "David", "Daria"],
  en: ["John", "Sarah", "Michael", "Emma", "David", "Olivia", "James", "Sophia", "Robert", "Isabella"]
};

const PROMPT_PLACEHOLDERS = {
  ro: [
    "Păr șaten, ochelari, stil studio...",
    "Costum business, fundal de birou modern...",
    "Zâmbet prietenos, lumină naturală...",
    "Tânăr cercetător, stil cinematic...",
    "Profesoară cu părul alb, ochelari rotunzi...",
    "Look academic, fundal de bibliotecă veche...",
    "Expert în tehnologie, căști moderne...",
    "Cămașă albă, stil minimalist și elegant...",
    "Inginer tech, lumină neon subtilă...",
    "Artist creativ, eșarfă colorată..."
  ],
  en: [
    "Brown hair, glasses, studio style...",
    "Business suit, modern office background...",
    "Friendly smile, natural lighting...",
    "Young researcher, cinematic style...",
    "Elderly teacher, round glasses...",
    "Academic look, old library background...",
    "Technology expert, modern headphones...",
    "White shirt, minimalist and elegant style...",
    "Tech engineer, subtle neon lighting...",
    "Creative artist, colorful scarf..."
  ]
};

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
    processing: "Aproape gata...",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    orientationLabel: "Orientare",
    poseLabel: "Poză",
    statusLabel: "Status",
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
    processing: "Almost done...",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    orientationLabel: "Orientation",
    poseLabel: "Pose",
    statusLabel: "Status",
  },
};

export function CreateYourselfPage() {
  const navigate = useNavigate();
  const { token, setToken, setAvatar } = useAuth() as unknown as AuthShape;

  const AGE_OPTIONS = ["Young Adult", "Early Middle Age", "Late Middle Age", "Senior", "Unspecified"];
  const GENDER_OPTIONS = ["Man", "Woman", "Unspecified"];
  const ETHNICITY_OPTIONS = ["White", "Black", "Asian American", "East Asian", "South East Asian", "South Asian", "Middle Eastern", "Pacific", "Hispanic", "Unspecified"];
  const STYLE_OPTIONS = ["Realistic", "Pixar", "Cinematic", "Vintage", "Noir", "Cyberpunk", "Unspecified"];
  const ORIENTATION_OPTIONS = ["square", "horizontal", "vertical"];
  const POSE_OPTIONS = ["half_body", "close_up", "full_body"];

  const [form, setForm] = useState<GenerateReq>({
    name: "", age: "Young Adult", gender: "Man", ethnicity: "White", orientation: "square", pose: "half_body", style: "Realistic", appearance: "",
  });

  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [busyGenerate, setBusyGenerate] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [lang, setLang] = useState<"ro" | "en">("ro");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  // --- Typewriter Logic: NAME ---
  const [namePlaceholder, setNamePlaceholder] = useState("");
  const [nameIdx, setNameIdx] = useState(0);
  const [nameDeleting, setNameDeleting] = useState(false);

  useEffect(() => {
    const list = NAME_PLACEHOLDERS[lang];
    const full = list[nameIdx];
    let timer: NodeJS.Timeout;

    if (!nameDeleting && namePlaceholder !== full) {
      timer = setTimeout(() => setNamePlaceholder(full.slice(0, namePlaceholder.length + 1)), 150);
    } else if (nameDeleting && namePlaceholder !== "") {
      timer = setTimeout(() => setNamePlaceholder(full.slice(0, namePlaceholder.length - 1)), 80);
    } else if (!nameDeleting && namePlaceholder === full) {
      timer = setTimeout(() => setNameDeleting(true), 3000);
    } else {
      setNameDeleting(false);
      setNameIdx((prev) => (prev + 1) % list.length);
    }
    return () => clearTimeout(timer);
  }, [namePlaceholder, nameDeleting, nameIdx, lang]);

  // --- Typewriter Logic: PROMPT ---
  const [promptPlaceholder, setPromptPlaceholder] = useState("");
  const [promptIdx, setPromptIdx] = useState(0);
  const [promptDeleting, setPromptDeleting] = useState(false);

  useEffect(() => {
    const list = PROMPT_PLACEHOLDERS[lang];
    const full = list[promptIdx];
    let timer: NodeJS.Timeout;

    if (!promptDeleting && promptPlaceholder !== full) {
      timer = setTimeout(() => setPromptPlaceholder(full.slice(0, promptPlaceholder.length + 1)), 70);
    } else if (promptDeleting && promptPlaceholder !== "") {
      timer = setTimeout(() => setPromptPlaceholder(full.slice(0, promptPlaceholder.length - 1)), 40);
    } else if (!promptDeleting && promptPlaceholder === full) {
      timer = setTimeout(() => setPromptDeleting(true), 2000);
    } else {
      setPromptDeleting(false);
      setPromptIdx((prev) => (prev + 1) % list.length);
    }
    return () => clearTimeout(timer);
  }, [promptPlaceholder, promptDeleting, promptIdx, lang]);

  const mainImage = useMemo(() => selected ?? images[0] ?? null, [selected, images]);
  const mainImageKey = useMemo(() => {
    if (!mainImage) return null;
    const idx = images.findIndex((u) => u === mainImage);
    return idx >= 0 ? imageKeys[idx] : null;
  }, [mainImage, images, imageKeys]);

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  async function startGeneration() {
    if (!token) return;
    setErr(null);
    setBusyGenerate(true);
    setIsReady(false);
    setImages([]);
    setImageKeys([]);
    setGenerationId(null);
    setStatus(null);

    try {
      const res = await fetch(`${API_URL}/api/heygen/photo-avatar/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Generate failed: ${res.status}. ${txt}`);
      }

      const gen = (await res.json()) as GenerateRes;
      setGenerationId(gen.generation_id);

      for (let i = 0; i < 90; i++) {
        try {
          const sres = await fetch(`${API_URL}/api/heygen/photo-avatar/status/${encodeURIComponent(gen.generation_id)}`, {
            method: "GET",
            headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
          });

          if (!sres.ok) {
            if (sres.status === 502 || sres.status === 504) {
              await sleep(2000);
              continue;
            }
            throw new Error(`Status failed: ${sres.status}`);
          }

          const st = (await sres.json()) as StatusRes;
          setStatus(st.status);

          if (st.status === "success") {
            setImages(st.image_url_list || []);
            setImageKeys(st.image_key_list || []);
            setIsReady(true);
            return;
          }
          if (st.status === "failed") throw new Error(st.msg || "Generation failed.");

        } catch (pollErr) {
          console.error("Polling hiccup:", pollErr);
        }
        await sleep(2000);
      }
      throw new Error("Timed out waiting for generation.");
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusyGenerate(false);
    }
  }

  async function saveAndContinue() {
    if (!token || !generationId || !mainImage || !mainImageKey) return;
    setBusySave(true);
    setErr(null);

    try {
      const groupName = (form.name || "Gen1").slice(0, 64);
      const resGroup = await fetch(`${API_URL}/api/heygen/photo-avatar/avatar-group/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ generation_id: generationId, image_key: mainImageKey, name: groupName } as CreateGroupReq),
      });

      if (!resGroup.ok) throw new Error("Create group failed.");
      const group = (await resGroup.json()) as CreateGroupRes;
      const groupId = group.group_id || group.id;
      if (!groupId) throw new Error("Missing group ID.");

      await fetch(`${API_URL}/api/session/photo-avatar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ generation_id: generationId, photo_url: mainImage, image_key: mainImageKey, group_id: groupId }),
      });

      setAvatar({ id: groupId, name: form.name || "My Avatar", image_url: mainImage, avatar_type: "talking_photo" });
      navigate("/voices");
    } catch (e) {
      setErr(toErrorMessage(e));
    } finally {
      setBusySave(false);
    }
  }

  return (
    <div style={pageWrapper} className="hide-scrollbar">
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        /* Global CSS reset for seamless feel */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #020617;
        }

        * { font-family: 'Inter', sans-serif; box-sizing: border-box; -webkit-font-smoothing: antialiased; }
        
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

        .blob-1 { top: 10%; left: 10%; width: 600px; height: 600px; background: rgba(53, 114, 239, 0.4); animation-delay: 0s; }
        .blob-2 { bottom: 10%; right: 15%; width: 700px; height: 700px; background: rgba(100, 50, 200, 0.3); animation-delay: -5s; }
        .blob-3 { top: 40%; left: 30%; width: 500px; height: 500px; background: rgba(53, 114, 239, 0.2); animation-delay: -10s; }

        .hide-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }

        .studio-container { width: 100%; display: flex; flex-direction: column; align-items: center; padding-bottom: 100px; position: relative; z-index: 1; }
        .flip-container { perspective: 2000px; width: 550px; height: 920px; z-index: 1; }
        .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1); transform-style: preserve-3d; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back { position: absolute; top: 0; left: 0; width: 100%; height: 100%; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 48px; overflow: hidden; box-sizing: border-box; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: 0 40px 100px rgba(0, 0, 0, 0.5); }
        
        .flip-front { 
            background: rgba(28, 28, 30, 0.9); 
            backdrop-filter: blur(40px); 
            padding: 48px 40px; 
            display: flex; 
            flex-direction: column; 
            justify-content: space-between; 
            height: 100%;
        }

        .flip-back { transform: rotateY(180deg); background: rgba(28, 28, 30, 0.98); backdrop-filter: blur(40px); padding: 40px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
        
        .input-row { display: flex; flex-direction: column; gap: 6px; width: 100%; }
        .input-row label { font-size: 11px; font-weight: 700; color: #8e8e93; text-transform: uppercase; letter-spacing: 0.08em; margin-left: 4px; }
        
        .custom-field { 
          background: rgba(255, 255, 255, 0.06); 
          border: 1px solid rgba(255, 255, 255, 0.12); 
          border-radius: 14px; 
          padding: 14px 16px; 
          color: white; 
          outline: none; 
          transition: border-color 0.2s, background 0.2s; 
          font-size: 15px; 
          width: 100%; 
          backdrop-filter: blur(10px);
        }

        select.custom-field {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 12 12' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2.5 4.5L6 8L9.5 4.5' stroke='rgba(255,255,255,0.5)' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
          padding-right: 40px;
          cursor: pointer;
        }

        .custom-field option { background-color: #1c1c1e; color: white; }
        .custom-field:focus { border-color: #3572ef; background: rgba(53, 114, 239, 0.08); }

        .preview-stage { width: 100%; max-width: 380px; aspect-ratio: 4/5; border-radius: 24px; overflow: hidden; background: #000; border: 1px solid rgba(255, 255, 255, 0.1); margin-bottom: 20px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .ring-spinner { width: 50px; height: 50px; border: 4px solid rgba(53, 114, 239, 0.1); border-top: 4px solid #3572ef; border-radius: 50%; animation: spin 1s linear infinite; }
        .gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; width: 100%; max-width: 380px; }
        .gallery-thumb { aspect-ratio: 1/1; border-radius: 12px; overflow: hidden; cursor: pointer; border: 2px solid transparent; transition: 0.3s; }
        .gallery-thumb.active { border-color: #3572ef; transform: scale(1.05); }
        .loading-overlay { position: absolute; inset: 0; background: rgba(28, 28, 30, 0.95); display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 10; border-radius: 48px; }
      `}</style>

      {/* FIXED BACKGROUND LAYER */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div style={centeredHeaderLayout}>
        <h1 style={titleTypography}>{t.title}</h1>
        <p style={subtitleTypography}>{t.subtitle}</p>
      </div>

      <div className="studio-container">
        <div className="flip-container">
          <div className={`flip-inner ${isReady ? "flipped" : ""}`}>
            <div className="flip-front">
              {busyGenerate && (
                <div className="loading-overlay">
                  <div className="ring-spinner" />
                  <span style={{ color: "#fff", marginTop: "20px", fontWeight: 600 }}>{t.processing}</span>
                </div>
              )}

              <div className="input-row">
                <label>{t.nameLabel}</label>
                <input
                  className="custom-field"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder={namePlaceholder}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="input-row">
                  <label>{t.ageLabel}</label>
                  <select className="custom-field" value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}>
                    {AGE_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div className="input-row">
                  <label>{t.genderLabel}</label>
                  <select className="custom-field" value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}>
                    {GENDER_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div className="input-row">
                  <label>{t.orientationLabel}</label>
                  <select className="custom-field" value={form.orientation} onChange={(e) => setForm((p) => ({ ...p, orientation: e.target.value }))}>
                    {ORIENTATION_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
                <div className="input-row">
                  <label>{t.poseLabel}</label>
                  <select className="custom-field" value={form.pose} onChange={(e) => setForm((p) => ({ ...p, pose: e.target.value }))}>
                    {POSE_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                  </select>
                </div>
              </div>

              <div className="input-row">
                <label>{t.ethnicityLabel}</label>
                <select className="custom-field" value={form.ethnicity} onChange={(e) => setForm((p) => ({ ...p, ethnicity: e.target.value }))}>
                  {ETHNICITY_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              </div>

              <div className="input-row">
                <label>{t.styleLabel}</label>
                <select className="custom-field" value={form.style} onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))}>
                  {STYLE_OPTIONS.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              </div>

              <div className="input-row">
                <label>{t.promptLabel}</label>
                <textarea
                  className="custom-field"
                  style={{ height: "100px", resize: "none" }}
                  value={form.appearance}
                  onChange={(e) => setForm((p) => ({ ...p, appearance: e.target.value }))}
                  placeholder={promptPlaceholder}
                />
              </div>

              {err && <div style={{ color: "#ff453a", fontSize: "12px", textAlign: "center" }}>{err}</div>}

              <button className="button-primary" style={actionBtn} onClick={startGeneration} disabled={busyGenerate}>
                {busyGenerate ? t.generating : t.generate}
              </button>
            </div>

            <div className="flip-back">
              <div style={{ marginBottom: "20px", fontSize: "13px", fontWeight: 800, color: "#3572ef", textTransform: "uppercase", letterSpacing: "0.2em" }}>{t.previewTitle}</div>
              <div className="preview-stage">
                {mainImage && <img src={mainImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Avatar" />}
              </div>
              <div className="gallery-grid">
                {images.map((img) => (
                  <div key={img} className={`gallery-thumb ${mainImage === img ? "active" : ""}`} onClick={() => setSelected(img)}>
                    <img src={img} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="Option" />
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: "15px", width: "100%", maxWidth: "380px", marginTop: "30px" }}>
                <button className="button-secondary" style={{ flex: 1, height: "56px", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", background: "transparent", borderRadius: "16px", cursor: 'pointer' }} onClick={() => { setIsReady(false); setImages([]); }}>{t.back}</button>
                <button className="button-primary" style={{ flex: 2, height: "56px", background: "#34c759", borderRadius: "16px", border: "none", color: "#fff", fontWeight: 700, cursor: 'pointer' }} onClick={saveAndContinue} disabled={busySave}>
                  {busySave ? t.processing : t.save}
                </button>
              </div>
              {status && <div style={{ marginTop: 10, fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Status: {status}</div>}
            </div>
          </div>
        </div>
        <button className="button-secondary" onClick={() => navigate("/subjects")} style={{ ...refinedBackBtn, marginTop: "40px" }}>{t.back}</button>
      </div>

      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsMenuHeader}>{t.settings}</div>
            <div style={settingsRow}>
              <span>{t.languageLabel}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang("ro")} style={{ ...langToggleBtn, background: lang === "ro" ? "#3572ef" : "transparent", color: "#fff" }}>RO</button>
                <button onClick={() => setLang("en")} style={{ ...langToggleBtn, background: lang === "en" ? "#3572ef" : "transparent", color: "#fff" }}>EN</button>
              </div>
            </div>
            <div style={{ ...settingsRow, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px", marginTop: "4px" }}>
              <span style={{ color: "#ff453a" }}>{t.logout}</span>
              <button onClick={handleLogout} style={logoutActionBtn}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
              </button>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? "✕" : "⚙"}</button>
      </div>
    </div>
  );
}

// --- Styles ---
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

const centeredHeaderLayout: React.CSSProperties = { width: "100%", maxWidth: "800px", textAlign: "center", marginBottom: "40px", zIndex: 1 };
const titleTypography: React.CSSProperties = { fontSize: "52px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "20px", color: "#8e8e93", marginTop: "12px" };
const refinedBackBtn: React.CSSProperties = { height: "56px", padding: "0 40px", borderRadius: "100px", fontWeight: 700, fontSize: "16px", border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", color: "#fff", background: "transparent" };
const actionBtn: React.CSSProperties = { height: "64px", borderRadius: "16px", color: "#fff", border: "none", background: "#3572ef", fontWeight: 700, fontSize: "18px", cursor: "pointer", boxShadow: "0 10px 25px rgba(53, 114, 239, 0.3)", width: '100%' };
const settingsContainer: React.CSSProperties = { position: "fixed", bottom: "40px", right: "40px", zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: "56px", height: "56px", borderRadius: "50%", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(25, 25, 25, 0.8)", color: "#fff", backdropFilter: "blur(10px)", cursor: "pointer", fontSize: "24px" };
const settingsMenu: React.CSSProperties = { width: "240px", padding: "20px", borderRadius: "24px", background: "rgba(28, 28, 30, 0.95)", border: "1px solid rgba(255, 255, 255, 0.1)", backdropFilter: "blur(20px)", color: "#fff", display: "flex", flexDirection: "column", gap: "15px" };
const settingsMenuHeader: React.CSSProperties = { fontSize: "16px", fontWeight: 800, borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" };
const settingsRow: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "14px", fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: "flex", background: "rgba(255, 255, 255, 0.05)", borderRadius: "10px", padding: "2px" };
const langToggleBtn: React.CSSProperties = { border: "none", padding: "6px 12px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontWeight: 700 };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex" };

export default CreateYourselfPage;