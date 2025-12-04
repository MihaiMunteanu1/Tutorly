import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAvatars, type Avatar } from "../api";
import { useAuth } from "../auth/AuthContext";

export function AvatarSelectionPage() {
  const { token, setAvatar } = useAuth();
  const navigate = useNavigate();
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    (async () => {
      try {
        const data = await getAvatars(token);
        setAvatars(data);
      } catch {
        setError("Nu pot încărca avatar-ele. Verifică backend-ul.");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, navigate]);

  function handleSelect(av: Avatar) {
    setAvatar(av);
    navigate("/voices"); // era chat
  }

  if (!token) return null;

  if (loading) {
    return (
      <div className="card" style={{ width: 720, marginTop: 30 }}>
        <p>Se încarcă avatar-ele...</p>
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
          <h2 style={{ margin: 0 }}>Alege avatarul tutorului</h2>
          <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
            Selectează avatarul care îți place. Va răspunde video la întrebările tale.
          </p>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af" }}>Pasul 2 din 3</div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: 16,
          marginTop: 8,
        }}
      >
        {avatars.map((av) => (
          <button
            key={av.id}
            onClick={() => handleSelect(av)}
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
                overflow: "hidden",
                background: "rgba(15,23,42,0.9)",
              }}
            >
              <div style={{ aspectRatio: "9 / 16", overflow: "hidden" }}>
                {av.image_url ? (
                  <img
                    src={av.image_url}
                    alt={av.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 13,
                      color: "#6b7280",
                    }}
                  >
                    Fără preview
                  </div>
                )}
              </div>
              <div style={{ padding: "10px 10px 12px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb" }}>{av.name}</div>
                {/*<div*/}
                {/*  style={{*/}
                {/*    fontSize: 11,*/}
                {/*    color: "#9ca3af",*/}
                {/*    marginTop: 2,*/}
                {/*    whiteSpace: "nowrap",*/}
                {/*    overflow: "hidden",*/}
                {/*    textOverflow: "ellipsis",*/}
                {/*  }}*/}
                {/*>*/}
                {/*  {av.id}*/}
                {/*</div>*/}
                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  {/*<span style={{ fontSize: 11, color: "#a5b4fc" }}>*/}
                  {/*  Video avatar*/}
                  {/*</span>*/}
                  {/*<span style={{ fontSize: 11, color: "#9ca3af" }}>*/}
                  {/*  Selectează*/}
                  {/*</span>*/}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
