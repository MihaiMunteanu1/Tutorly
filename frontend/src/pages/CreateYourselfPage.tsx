// Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/CreateYourselfPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

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

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

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
    logout: "Deconectare",
    orientationLabel: "Orientare",
    poseLabel: "Poză",
    statusLabel: "Status",
    noImages: "Nu există imagini încă.",
    pickMain: "Alege imaginea principală:",
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
    logout: "Logout",
    orientationLabel: "Orientation",
    poseLabel: "Pose",
    statusLabel: "Status",
    noImages: "No images yet.",
    pickMain: "Pick a main image:",
  },
};

export function CreateYourselfPage() {
  const navigate = useNavigate();
  const { token, setToken, setAvatar } = useAuth() as unknown as AuthShape;

  const AGE_OPTIONS = ["Young Adult", "Early Middle Age", "Late Middle Age", "Senior", "Unspecified"] as const;
  const GENDER_OPTIONS = ["Man", "Woman", "Unspecified"] as const;
  const ETHNICITY_OPTIONS = [
    "White",
    "Black",
    "Asian American",
    "East Asian",
    "South East Asian",
    "South Asian",
    "Middle Eastern",
    "Pacific",
    "Hispanic",
    "Unspecified",
  ] as const;
  const ORIENTATION_OPTIONS = ["square", "horizontal", "vertical"] as const;
  const POSE_OPTIONS = ["half_body", "close_up", "full_body"] as const;
  const STYLE_OPTIONS = ["Realistic", "Pixar", "Cinematic", "Vintage", "Noir", "Cyberpunk", "Unspecified"] as const;

  const [form, setForm] = useState<GenerateReq>({
    name: "",
    age: "Young Adult",
    gender: "Man",
    ethnicity: "White",
    orientation: "square",
    pose: "half_body",
    style: "Realistic",
    appearance: "",
  });

  const [generationId, setGenerationId] = useState<string | null>(null);

  const [status, setStatus] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  const [busyGenerate, setBusyGenerate] = useState(false);
  const [busySave, setBusySave] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [lang, setLang] = useState<"ro" | "en">("ro");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const mainImage = useMemo(() => selected ?? images[0] ?? null, [selected, images]);
  const mainImageKey = useMemo(() => {
    if (!mainImage) return null;
    const idx = images.findIndex((u) => u === mainImage);
    if (idx < 0) return null;
    return imageKeys[idx] ?? null;
  }, [mainImage, images, imageKeys]);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  async function startGeneration() {
    if (!token) return;

    setErr(null);
    setBusyGenerate(true);

    setImages([]);
    setImageKeys([]);
    setSelected(null);
    setGenerationId(null);
    setStatus(null);
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_URL}/api/heygen/photo-avatar/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Generate failed: ${res.status} ${res.statusText} ${txt}`.trim());
      }

      const gen = (await res.json()) as GenerateRes;
      setGenerationId(gen.generation_id);

      for (let i = 0; i < 90; i += 1) {
        const sres = await fetch(
          `${API_URL}/api/heygen/photo-avatar/status/${encodeURIComponent(gen.generation_id)}`,
          {
            method: "GET",
            headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
          }
        );

        if (!sres.ok) {
          const txt = await sres.text().catch(() => "");
          throw new Error(`Status failed: ${sres.status} ${sres.statusText} ${txt}`.trim());
        }

        const st = (await sres.json()) as StatusRes;
        setStatus(st.status ?? "unknown");
        setStatusMsg(st.msg ?? null);

        if (st.status === "success") {
          const urls = (st.image_url_list ?? []).filter(Boolean);
          const keys = (st.image_key_list ?? []).filter(Boolean);

          setImages(urls);
          setImageKeys(keys);

          setSelected(urls[0] ?? null);
          return;
        }

        if (st.status === "failed") {
          throw new Error(st.msg ?? "Generation failed.");
        }

        await sleep(1500);
      }

      throw new Error("Timed out waiting for generation.");
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    } finally {
      setBusyGenerate(false);
    }
  }

  async function saveAndContinue() {
    if (!token) return;
    if (!generationId || !mainImage || !mainImageKey) {
      setErr("Missing generation\\_id, selected image, or image\\_key.");
      return;
    }

    setErr(null);
    setBusySave(true);

    try {
      // 1) Create HeyGen avatar group (this returns the group_id aka talking_photo_id)
      const groupName = (form.name || "Gen1").slice(0, 64);

      const res2 = await fetch(`${API_URL}/api/heygen/photo-avatar/avatar-group/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          generation_id: generationId,
          image_key: mainImageKey,
          name: groupName,
        } satisfies CreateGroupReq),
      });

      if (!res2.ok) {
        const txt = await res2.text().catch(() => "");
        throw new Error(`Create group failed: ${res2.status} ${res2.statusText} ${txt}`.trim());
      }

      const group = (await res2.json()) as CreateGroupRes;
      const groupId = group.group_id || group.id;
      if (!groupId) throw new Error("Missing group\\_id in create group response.");

      // 2) Store the chosen photo avatar in the backend session (generation_id + image_key + group_id)
      {
        const res = await fetch(`${API_URL}/api/session/photo-avatar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            generation_id: generationId,
            photo_url: mainImage,
            image_key: mainImageKey,
            group_id: groupId,
          }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Save session failed: ${res.status} ${res.statusText} ${txt}`.trim());
        }
      }

      // 3) Store avatar in AuthContext, using group_id as avatar id (this is the talking_photo_id)
      setAvatar({
        id: groupId,
        name: form.name || "My avatar",
        image_url: mainImage,
        avatar_type: "talking_photo",
      });

      navigate("/voices");
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    } finally {
      setBusySave(false);
    }
  }

  return (
    <div style={pageWrapper}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
      `}</style>

      <div style={headerWrapper}>
        <div style={headerText}>
          <h1 style={titleTypography}>{t.title}</h1>
          <p style={subtitleTypography}>{t.subtitle}</p>
        </div>
        <button onClick={() => navigate("/mode")} style={slickBackBtn}>
          {t.back}
        </button>
      </div>

      <div style={{ width: "100%", maxWidth: 1200, display: "grid", gridTemplateColumns: "420px 1fr", gap: 20 }}>
        <div style={panelLeft}>
          <div style={formGrid}>
            <label style={labelStyle}>
              {t.nameLabel}
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. John"
              />
            </label>

            <label style={labelStyle}>
              {t.ageLabel}
              <select value={form.age} onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))} style={inputStyle}>
                {AGE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.genderLabel}
              <select value={form.gender} onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))} style={inputStyle}>
                {GENDER_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.ethnicityLabel}
              <select value={form.ethnicity} onChange={(e) => setForm((p) => ({ ...p, ethnicity: e.target.value }))} style={inputStyle}>
                {ETHNICITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.orientationLabel}
              <select
                value={form.orientation}
                onChange={(e) => setForm((p) => ({ ...p, orientation: e.target.value }))}
                style={inputStyle}
              >
                {ORIENTATION_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.poseLabel}
              <select value={form.pose} onChange={(e) => setForm((p) => ({ ...p, pose: e.target.value }))} style={inputStyle}>
                {POSE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.styleLabel}
              <select value={form.style} onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))} style={inputStyle}>
                {STYLE_OPTIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </label>

            <label style={labelStyle}>
              {t.promptLabel}
              <input
                value={form.appearance}
                onChange={(e) => setForm((p) => ({ ...p, appearance: e.target.value }))}
                style={inputStyle}
                placeholder="e.g. friendly, teacher, studio lighting"
              />
            </label>

            <button onClick={() => void startGeneration()} disabled={busyGenerate || busySave} style={primaryBtn}>
              {busyGenerate ? t.generating : t.generate}
            </button>

            <button
              onClick={() => void saveAndContinue()}
              disabled={!generationId || !mainImage || !mainImageKey || busyGenerate || busySave}
              style={secondaryBtn}
            >
              {busySave ? t.processing : t.save}
            </button>

            {err ? <div style={errorBox}>{err}</div> : null}

            {status ? (
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
                {t.statusLabel}: {status}
                {statusMsg ? ` \u2014 ${statusMsg}` : ""}
              </div>
            ) : null}

            <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 10 }}>
              <button onClick={() => setSettingsOpen((p) => !p)} style={smallBtn}>
                {t.settings}
              </button>
              <button onClick={handleLogout} style={{ ...smallBtn, borderColor: "rgba(255,69,58,0.35)", color: "#ff453a" }}>
                {t.logout}
              </button>
            </div>

            {settingsOpen ? (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setLang("ro")} style={lang === "ro" ? langActiveBtn : langBtn}>RO</button>
                <button onClick={() => setLang("en")} style={lang === "en" ? langActiveBtn : langBtn}>EN</button>
              </div>
            ) : null}
          </div>
        </div>

        <div style={panelRight}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 10 }}>
            {mainImage ? t.pickMain : t.noImages}
          </div>

          {mainImage ? (
            <>
              <div style={bigPreview}>
                <img src={mainImage} alt="Generated avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>

              <div style={thumbGrid}>
                {images.slice(0, 4).map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelected(u)}
                    style={{
                      padding: 0,
                      borderRadius: 14,
                      overflow: "hidden",
                      border: u === mainImage ? "2px solid #3572ef" : "1px solid rgba(255,255,255,0.12)",
                      background: "rgba(255,255,255,0.03)",
                      cursor: "pointer",
                      height: 92,
                    }}
                    title="Select"
                  >
                    <img src={u} alt="Option" style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{t.noImages}</div>
          )}
        </div>
      </div>
    </div>
  );
}

// Minimal styles (kept simple to avoid breaking existing layout)
const pageWrapper: React.CSSProperties = {
  minHeight: "100vh",
  width: "100%",
  background: "radial-gradient(circle at top, #1e293b 0, #020617 55%)",
  padding: "60px 40px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
};
const headerWrapper: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  width: "100%",
  maxWidth: "1200px",
  marginBottom: "24px",
};
const headerText: React.CSSProperties = { textAlign: "left", flex: 1 };
const titleTypography: React.CSSProperties = { fontSize: "42px", fontWeight: 800, margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "16px", color: "rgba(255,255,255,0.6)", marginTop: 8, lineHeight: 1.5, maxWidth: 720 };
const slickBackBtn: React.CSSProperties = {
  background: "rgba(255, 255, 255, 0.08)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(255, 255, 255, 0.15)",
  color: "#ffffff",
  padding: "12px 18px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 700,
  cursor: "pointer",
};

const panelLeft: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 22,
  padding: 18,
  background: "rgba(28, 28, 30, 0.70)",
  backdropFilter: "blur(24px)",
};
const panelRight: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: 22,
  padding: 18,
  background: "rgba(28, 28, 30, 0.35)",
  backdropFilter: "blur(24px)",
  minHeight: 520,
};

const formGrid: React.CSSProperties = { display: "grid", gap: 10 };
const labelStyle: React.CSSProperties = { display: "grid", gap: 6, fontSize: 12, color: "rgba(255,255,255,0.75)", fontWeight: 700 };
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.25)",
  color: "white",
  outline: "none",
};

const primaryBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(53,114,239,0.55)",
  background: "#3572ef",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
const secondaryBtn: React.CSSProperties = {
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.06)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
const smallBtn: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "rgba(255,255,255,0.05)",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};

const langBtn: React.CSSProperties = {
  flex: 1,
  padding: "10px 12px",
  borderRadius: 12,
  border: "1px solid rgba(255,255,255,0.14)",
  background: "transparent",
  color: "white",
  fontWeight: 800,
  cursor: "pointer",
};
const langActiveBtn: React.CSSProperties = { ...langBtn, background: "#3572ef", borderColor: "#3572ef" };

const errorBox: React.CSSProperties = { fontSize: 12, color: "#fca5a5", whiteSpace: "pre-wrap" };

const bigPreview: React.CSSProperties = {
  width: "100%",
  height: 420,
  borderRadius: 18,
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
};
const thumbGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginTop: 12 };

export default CreateYourselfPage;
