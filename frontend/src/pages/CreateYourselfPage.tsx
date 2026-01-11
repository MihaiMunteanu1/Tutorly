import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

type AuthShape = { token: string | null };

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
};

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

export function CreateYourselfPage() {
  const navigate = useNavigate();
  const { token } = useAuth() as unknown as AuthShape;

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
  const [selected, setSelected] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const mainImage = useMemo(() => selected ?? images[0] ?? null, [selected, images]);

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  async function startGeneration() {
    if (!token) return;

    setErr(null);
    setBusy(true);
    setImages([]);
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

      // if (!res.ok) {
      //   const t = await res.text().catch(() => "");
      //   throw new Error(`Generate failed: ${res.status} ${res.statusText} ${t}`.trim());
      // }
        if (!res.ok) {
  let msg = `Generate failed: ${res.status} ${res.statusText}`;
  try {
    const data = await res.json();
    // Try to parse the nested JSON in detail, if present
    if (typeof data.detail === "string") {
      const detail = JSON.parse(data.detail);
      if (detail?.error?.message) {
        msg += `\n${detail.error.message}`;
      }
    }
  } catch {
    // fallback: try to get plain text
    const t = await res.text().catch(() => "");
    if (t) msg += `\n${t}`;
  }
  throw new Error(msg.trim());
}

      const gen = (await res.json()) as GenerateRes;
      setGenerationId(gen.generation_id);

      for (let i = 0; i < 90; i += 1) {
        const sres = await fetch(
          `${API_URL}/api/heygen/photo-avatar/status/${encodeURIComponent(gen.generation_id)}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!sres.ok) {
          const t = await sres.text().catch(() => "");
          throw new Error(`Status failed: ${sres.status} ${sres.statusText} ${t}`.trim());
        }

        const st = (await sres.json()) as StatusRes;
        setStatus(st.status ?? "unknown");
        setStatusMsg(st.msg ?? null);

        if (st.status === "success") {
          const list = (st.image_url_list ?? []).filter(Boolean);
          setImages(list);
          setSelected(list[0] ?? null);
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
      setBusy(false);
    }
  }

  async function saveAndContinue() {
    if (!token) return;
    if (!generationId || !mainImage) return;

    setErr(null);
    try {
      const res = await fetch(`${API_URL}/api/session/photo-avatar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ generation_id: generationId, photo_url: mainImage }),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Save failed: ${res.status} ${res.statusText} ${t}`.trim());
      }

      navigate("/voices");
    } catch (e: unknown) {
      setErr(toErrorMessage(e));
    }
  }

  return (
    <div className="card" style={{ width: 2000, marginTop: 20 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Create yourself</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Generate a photo avatar and pick the main image.
          </p>
        </div>
        <button className="button-secondary" onClick={() => navigate("/subjects")}>
          Back
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "420px 1fr", gap: 16 }}>
        <div
          style={{
            border: "1px solid rgba(148,163,184,0.25)",
            borderRadius: 12,
            padding: 12,
            background: "rgba(15,23,42,0.6)",
          }}
        >
          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                style={{ width: "100%" }}
                placeholder="e.g. John"
              />
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Age
              <select
                value={form.age}
                onChange={(e) => setForm((p) => ({ ...p, age: e.target.value }))}
                style={{ width: "100%" }}
              >
                {AGE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Gender
              <select
                value={form.gender}
                onChange={(e) => setForm((p) => ({ ...p, gender: e.target.value }))}
                style={{ width: "100%" }}
              >
                {GENDER_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Ethnicity
              <select
                value={form.ethnicity}
                onChange={(e) => setForm((p) => ({ ...p, ethnicity: e.target.value }))}
                style={{ width: "100%" }}
              >
                {ETHNICITY_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Orientation
              <select
                value={form.orientation}
                onChange={(e) => setForm((p) => ({ ...p, orientation: e.target.value }))}
                style={{ width: "100%" }}
              >
                {ORIENTATION_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Pose
              <select
                value={form.pose}
                onChange={(e) => setForm((p) => ({ ...p, pose: e.target.value }))}
                style={{ width: "100%" }}
              >
                {POSE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Style
              <select
                value={form.style}
                onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))}
                style={{ width: "100%" }}
              >
                {STYLE_OPTIONS.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 6, fontSize: 12, color: "#cbd5e1" }}>
              Appearance
              <input
                value={form.appearance}
                onChange={(e) => setForm((p) => ({ ...p, appearance: e.target.value }))}
                style={{ width: "100%" }}
                placeholder="Your prompt for the avatar appearence"
              />
            </label>

            <button className="button-primary" onClick={() => void startGeneration()} disabled={busy}>
              {busy ? "Generating..." : "Generate"}
            </button>

            <button
              className="button-secondary"
              onClick={() => void saveAndContinue()}
              disabled={!generationId || !mainImage || busy}
            >
              Save and continue
            </button>

            {err ? (
              <div style={{ fontSize: 12, color: "#fca5a5", whiteSpace: "pre-wrap" }}>{err}</div>
            ) : null}

            {status ? (
              <div style={{ fontSize: 12, color: "#9ca3af" }}>
                Status: {status}
                {statusMsg ? ` \u2014 ${statusMsg}` : ""}
              </div>
            ) : null}
          </div>
        </div>

        <div
          style={{
            border: "1px solid #1f2937",
            borderRadius: 14,
            padding: 14,
            background: "#0b1220",
          }}
        >
          <div style={{ fontSize: 12, color: "#cbd5e1", marginBottom: 10 }}>
            {mainImage ? "Pick a main image:" : "Generated images will show here."}
          </div>

          {mainImage ? (
            <>
              <div
                style={{
                  width: "100%",
                  height: 420,
                  borderRadius: 14,
                  overflow: "hidden",
                  border: "1px solid #1f2937",
                  background: "#111827",
                }}
              >
                <img
                  src={mainImage}
                  alt="Generated avatar"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: 10,
                  marginTop: 10,
                }}
              >
                {images.slice(0, 4).map((u) => (
                  <button
                    key={u}
                    onClick={() => setSelected(u)}
                    style={{
                      padding: 0,
                      borderRadius: 12,
                      overflow: "hidden",
                      border: u === mainImage ? "2px solid #60a5fa" : "1px solid #1f2937",
                      background: "#111827",
                      cursor: "pointer",
                      height: 92,
                    }}
                    title="Select"
                  >
                    <img
                      src={u}
                      alt="Option"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>No images yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}

