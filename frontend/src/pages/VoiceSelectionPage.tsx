import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getVoices, type Voice } from "../api";
import { useAuth } from "../auth/AuthContext";

export function VoiceSelectionPage() {
  const { token, setVoice, avatar } = useAuth();
  const navigate = useNavigate();
  const [voices, setVoices] = useState<Voice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (!avatar) {
      navigate("/avatars");
      return;
    }
    (async () => {
      try {
        const data = await getVoices(token);
        setVoices(data);
      } catch {
        setError("Nu pot încărca vocile. Verifică backend-ul.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, avatar, navigate]);

  function handleSelect(voice: Voice) {
    setVoice(voice);
    navigate("/chat");
  }

  if (!token || !avatar) return null;

  if (loading) {
    return (
      <div className="card" style={{ width: 720, marginTop: 30 }}>
        <p>Se încarcă vocile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card" style={{ width: 720, marginTop: 30 }}>
        <p style={{ color: "#f97373" }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ width: 960, marginTop: 20 }}>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Alege vocea</h2>
          <p
            style={{
              margin: 0,
              fontSize: 13,
              color: "#9ca3af",
            }}
          >
            Selectează vocea cu care avatarul tău va răspunde.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Pasul 3 din 4</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16,
          marginTop: 8,
        }}
      >
        {voices.map((v) => (
          <button
            key={v.id}
            onClick={() => handleSelect(v)}
            style={{
              border: "none",
              padding: 0,
              background: "transparent",
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                borderRadius: 16,
                border: "1px solid rgba(148,163,184,0.5)",
                padding: 12,
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <div style={{color:"white", fontSize: 14, fontWeight: 600 }}>{v.name}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>
                {v.language} {v.gender ? `· ${v.gender}` : ""}
              </div>
            <div style={{ marginTop: 8 }}>
              {v.preview_audio ? (
                <audio style={{ width: "100%" }} controls src={v.preview_audio} />
              ) : (
                <span style={{ fontSize: 11, color: "#6b7280" }}>
                  Fără preview audio disponibil
                </span>
              )}
            </div>

              {/*{v.preview_audio && (*/}
              {/*  <div style={{ marginTop: 8 }}>*/}
              {/*    <audio controls src={v.preview_audio} />*/}
              {/*  </div>*/}
              {/*)}*/}

              <div
                style={{
                  marginTop: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                {/*<span>ID: {v.id.slice(0, 8)}…</span>*/}
                <span>Selectează</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
