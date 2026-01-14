import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const TRANSLATIONS = {
  ro: {
    title: "Alege modul",
    subtitle: "Selectează cum vrei să interacționezi cu avatarul ales.",
    chatTitle: "Chat",
    chatDesc: "Chat text rapid (TextChatPage).",
    videoTitle: "Video",
    videoDesc: "Conversație video cu avatar (ChatPage).",
    liveTitle: "Live",
    liveDesc: "Conversație Live (LiveChatPage) cu HeyGen LiveAvatar.",
    select: "Deschide",
    back: "Înapoi",
  },
  en: {
    title: "Choose mode",
    subtitle: "Select how you want to interact with your selected avatar.",
    chatTitle: "Chat",
    chatDesc: "Fast text chat (TextChatPage).",
    videoTitle: "Video",
    videoDesc: "Video conversation with the avatar (ChatPage).",
    liveTitle: "Live",
    liveDesc: "Live conversation (LiveChatPage) with HeyGen LiveAvatar.",
    select: "Open",
    back: "Back",
  },
};

export function ModeSelectionPage() {
  const navigate = useNavigate();
  const { token, avatar, voice, selectionSource, liveAvatarId, liveAvatarVoiceId } =
    useAuth() as any;

  const [lang] = useState<"ro" | "en">("ro");
  const t = TRANSLATIONS[lang];

  const canUseLive = useMemo(() => {
    return (
      selectionSource === "preset" &&
      Boolean(liveAvatarId) &&
      Boolean(liveAvatarVoiceId)
    );
  }, [selectionSource, liveAvatarId, liveAvatarVoiceId]);

  // Basic guard: if user refreshes here and we lost selection in memory.
  if (!token) {
    navigate("/login", { replace: true });
    return null;
  }
  if (!avatar || !voice) {
    navigate("/subjects", { replace: true });
    return null;
  }

  return (
    <div style={pageWrapper}>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #020617; }
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }

        .mode-card {
          flex: 1;
          max-width: 420px;
          min-width: 280px;
          background: rgba(28, 28, 30, 0.65);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 44px;
          cursor: pointer;
          transition: all 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);
          text-align: center;
          text-decoration: none;
          z-index: 1;
        }

        .mode-card:hover {
          transform: translateY(-10px) scale(1.015);
          background: rgba(44, 44, 46, 0.8);
          border-color: #3572ef;
          box-shadow: 0 30px 70px rgba(0, 0, 0, 0.5);
        }

        .mode-icon {
          width: 92px;
          height: 92px;
          border-radius: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 40px;
          margin-bottom: 26px;
          transition: all 0.45s ease;
        }

        .mode-card:hover .mode-icon { transform: scale(1.08) rotate(4deg); }

        .back-btn:hover { background: rgba(255, 255, 255, 0.15) !important; border-color: rgba(255, 255, 255, 0.3) !important; transform: translateY(-2px); }
      `}</style>

      <div style={headerLayout}>
        <div style={{ textAlign: "center" }}>
          <h1 style={titleTypography}>{t.title}</h1>
          <p style={subtitleTypography}>{t.subtitle}</p>
        </div>
        <button className="back-btn" onClick={() => navigate("/subjects")} style={backBtn}>
          {t.back}
        </button>
      </div>

      <div style={gridContainer}>
        <div className="mode-card" onClick={() => navigate("/text-chat")}>
          <div
            style={{ ...modeIconBase, background: "rgba(53, 114, 239, 0.15)", color: "#3572ef" }}
            className="mode-icon"
          >
            💬
          </div>
          <h2 style={cardTitle}>{t.chatTitle}</h2>
          <p style={cardDesc}>{t.chatDesc}</p>
          <div style={selectBadge}>{t.select}</div>
        </div>

        <div className="mode-card" onClick={() => navigate("/chat")}>
          <div
            style={{ ...modeIconBase, background: "rgba(167, 139, 250, 0.15)", color: "#a78bfa" }}
            className="mode-icon"
          >
            🎬
          </div>
          <h2 style={cardTitle}>{t.videoTitle}</h2>
          <p style={cardDesc}>{t.videoDesc}</p>
          <div style={{ ...selectBadge, background: "#a78bfa33", color: "#a78bfa" }}>{t.select}</div>
        </div>

        {canUseLive && (
          <div className="mode-card" onClick={() => navigate("/livechat")}>
            <div
              style={{ ...modeIconBase, background: "rgba(34, 211, 238, 0.12)", color: "#22d3ee" }}
              className="mode-icon"
            >
              🤖
            </div>
            <h2 style={cardTitle}>{t.liveTitle}</h2>
            <p style={cardDesc}>{t.liveDesc}</p>
            <div
              style={{ ...selectBadge, background: "rgba(34, 211, 238, 0.12)", color: "#22d3ee" }}
            >
              {t.select}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  padding: "40px 18px",
  position: "relative",
};

const headerLayout: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 24,
};

const gridContainer: React.CSSProperties = {
  width: "100%",
  maxWidth: 1200,
  display: "flex",
  alignItems: "stretch",
  justifyContent: "center",
  gap: 24,
  flexWrap: "wrap",
};

const titleTypography: React.CSSProperties = {
  fontSize: 44,
  fontWeight: 800,
  color: "#ffffff",
  letterSpacing: "-0.03em",
  margin: 0,
};

const subtitleTypography: React.CSSProperties = {
  marginTop: 10,
  fontSize: 16,
  color: "rgba(255,255,255,0.65)",
  maxWidth: 680,
};

const cardTitle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 800,
  color: "#ffffff",
  margin: 0,
};

const cardDesc: React.CSSProperties = {
  marginTop: 10,
  marginBottom: 18,
  fontSize: 14,
  color: "rgba(255,255,255,0.7)",
  lineHeight: 1.6,
};

const modeIconBase: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const selectBadge: React.CSSProperties = {
  marginTop: 6,
  background: "rgba(53, 114, 239, 0.15)",
  color: "#3572ef",
  fontWeight: 800,
  fontSize: 12,
  padding: "10px 18px",
  borderRadius: 100,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const backBtn: React.CSSProperties = {
  padding: "10px 18px",
  borderRadius: 14,
  background: "rgba(255, 255, 255, 0.08)",
  border: "1px solid rgba(255, 255, 255, 0.12)",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.25s ease",
};

