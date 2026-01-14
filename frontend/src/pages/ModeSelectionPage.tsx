import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Modul de Interacțiune",
    subtitle: "Sistemul este configurat. Selectează interfața de dialog pentru avatarul ales.",
    chatTitle: "Chat Text",
    chatDesc: "Experiență minimalistă bazată pe text. Ideală pentru logică și răspunsuri rapide.",
    videoTitle: "Experiență Video",
    videoDesc: "Interacțiune vizuală completă. Lecții imersive cu avatar digital sincronizat.",
    liveTitle: "Live Avatar",
    liveDesc: "Conversație în timp real. Speak-and-respond cu latență minimă.",
    select: "Accesează",
    back: "Înapoi",
  },
  en: {
    title: "Interaction Mode",
    subtitle: "System configured. Select the dialog interface for your selected avatar.",
    chatTitle: "Text Chat",
    chatDesc: "Minimalist text-based experience. Ideal for logic and rapid responses.",
    videoTitle: "Video Experience",
    videoDesc: "Full visual interaction. Immersive lessons with synchronized digital avatars.",
    liveTitle: "Live Avatar",
    liveDesc: "Real-time conversation. Speak-and-respond with minimal latency and live presence.",
    select: "Access Mode",
    back: "Back",
  },
};

export function ModeSelectionPage() {
  const navigate = useNavigate();
  const { token, avatar, voice, selectionSource, liveAvatarId, liveAvatarVoiceId } = useAuth() as any;

  const [lang] = useState<"ro" | "en">("ro");
  const t = TRANSLATIONS[lang];

  const canUseLive = useMemo(() => {
    return selectionSource === "preset" && Boolean(liveAvatarId) && Boolean(liveAvatarVoiceId);
  }, [selectionSource, liveAvatarId, liveAvatarVoiceId]);

  if (!token) { navigate("/login", { replace: true }); return null; }
  if (!avatar || !voice) { navigate("/subjects", { replace: true }); return null; }

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { box-sizing: border-box; font-family: 'Inter', -apple-system, sans-serif; }

        /* Premium Background Blobs */
        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1) rotate(0deg); }
          to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); }
        }

        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(53, 114, 239, 0.2);
        }

        .mode-card {
          flex: 1;
          min-width: 320px;
          max-width: 380px;
          background: rgba(28, 28, 30, 0.4);
          backdrop-filter: blur(40px);
          border-radius: 48px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 60px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.4), inset 0 0 0 1px rgba(255,255,255,0.05);
          position: relative;
        }

        .mode-card:hover {
          transform: translateY(-12px) scale(1.02);
          background: rgba(35, 35, 38, 0.6);
          border-color: rgba(53, 114, 239, 0.4);
        }

        .shimmer-pill {
          position: relative; overflow: hidden;
          transition: all 0.4s ease;
        }
        .shimmer-pill::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0) 40%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0) 60%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(-45deg); }
          25%, 100% { transform: translateX(100%) rotate(-45deg); }
        }

        /* HIDDEN START: Elements are invisible until animation kicks in */
        .elegant-entry { 
          opacity: 0; 
          animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(20px); transform: scale(0.98) translateY(20px); }
          to { opacity: 1; filter: blur(0); transform: scale(1) translateY(0); }
        }
      `}</style>

      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div style={contentWrapper}>
        <div style={headerLayout}>
          {/* Header Text Group (Animated) */}
          <div className="elegant-entry" style={headerTextGroup}>
            <span style={superTag}>Interface Selection</span>
            <h1 className="living-title" style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
          </div>

          {/* Back Button (Animated & Symmetrical) */}
          <button
            className="elegant-entry back-btn"
            style={{ ...refinedBackBtn, animationDelay: '0.1s' }}
            onClick={() => navigate("/subjects")}
          >
            {t.back}
          </button>
        </div>

        <div style={gridContainer}>
          {/* Chat Mode */}
          <div className="mode-card elegant-entry" style={{ animationDelay: '0.2s' }} onClick={() => navigate("/text-chat")}>
            <div style={{ ...iconCircle, color: '#3572ef', background: 'rgba(53, 114, 239, 0.1)' }}>💬</div>
            <h2 style={cardTitleStyle}>{t.chatTitle}</h2>
            <p style={cardDescStyle}>{t.chatDesc}</p>
            <div className="shimmer-pill" style={pillStyle}>{t.select}</div>
          </div>

          {/* Video Mode */}
          <div className="mode-card elegant-entry" style={{ animationDelay: '0.35s' }} onClick={() => navigate("/chat")}>
            <div style={{ ...iconCircle, color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>🎬</div>
            <h2 style={cardTitleStyle}>{t.videoTitle}</h2>
            <p style={cardDescStyle}>{t.videoDesc}</p>
            <div className="shimmer-pill" style={{ ...pillStyle, color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.3)', background: 'rgba(168, 85, 247, 0.05)' }}>{t.select}</div>
          </div>

          {/* Live Mode */}
          {canUseLive && (
            <div className="mode-card elegant-entry" style={{ animationDelay: '0.5s' }} onClick={() => navigate("/livechat")}>
              <div style={{ ...iconCircle, color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>🤖</div>
              <h2 style={cardTitleStyle}>{t.liveTitle}</h2>
              <p style={cardDescStyle}>{t.liveDesc}</p>
              <div className="shimmer-pill" style={{ ...pillStyle, color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.3)', background: 'rgba(6, 182, 212, 0.05)' }}>{t.select}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Style Objects ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", position: 'relative', overflow: 'hidden' };
const contentWrapper: React.CSSProperties = { maxWidth: "1400px", width: "94%", zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0' };

/* FIXED ALIGNMENT: items centered for perfect symmetry */
const headerLayout: React.CSSProperties = {
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "80px"
};

const headerTextGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' };
const superTag: React.CSSProperties = { color: '#3572ef', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '11px', marginBottom: '16px' };
const titleTypography: React.CSSProperties = { fontSize: "64px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, lineHeight: 1 };
const subtitleTypography: React.CSSProperties = { fontSize: "18px", color: "#6e7681", marginTop: "16px", fontWeight: 500, maxWidth: '600px' };

const gridContainer: React.CSSProperties = { display: "flex", gap: "32px", width: "100%", justifyContent: "center", flexWrap: "wrap" };
const iconCircle: React.CSSProperties = { width: "80px", height: "80px", borderRadius: "30px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", marginBottom: "32px" };
const cardTitleStyle: React.CSSProperties = { fontSize: "28px", fontWeight: 800, color: "#fff", margin: "0 0 12px 0", letterSpacing: "-0.02em" };
const cardDescStyle: React.CSSProperties = { fontSize: "15px", color: "#6e7681", lineHeight: 1.6, margin: "0 0 40px 0", fontWeight: 500 };
const pillStyle: React.CSSProperties = { padding: "12px 32px", borderRadius: "100px", border: '1px solid rgba(53, 114, 239, 0.3)', background: 'rgba(53, 114, 239, 0.05)', color: "#3572ef", fontSize: "12px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em" };

const refinedBackBtn: React.CSSProperties = { height: "48px", padding: "0 28px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.05)", color: "#fff", fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' };