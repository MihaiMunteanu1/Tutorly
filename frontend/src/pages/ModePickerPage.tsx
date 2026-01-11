// Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/ModePickerPage.tsx

import React from "react";
import { useNavigate } from "react-router-dom";

export function ModePickerPage() {
  const navigate = useNavigate();

  const container: React.CSSProperties = {
    minHeight: "100vh",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "110px 24px 24px",
    background: "transparent",
    color: "#e5e7eb",
  };

  const grid: React.CSSProperties = {
    width: "min(820px, 100%)",
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 100,
  };

  const buttonBase: React.CSSProperties = {
    height: 220,
    borderRadius: 999,
    border: "1px solid rgba(148,163,184,0.22)",
    background:
      "linear-gradient(180deg, rgba(30,41,59,0.55) 0%, rgba(2,6,23,0.25) 100%)",
    boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
    padding: 18,
    cursor: "pointer",
    color: "#e5e7eb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    gap: 10,
    transition: "transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease",
    outline: "none",
    willChange: "transform",
    animation: "floating 4.8s ease-in-out infinite",
  };

  const label: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 900,
    letterSpacing: -0.2,
    margin: 0,
    lineHeight: 1.1,
  };

  const desc: React.CSSProperties = {
    fontSize: 13,
    color: "#94a3b8",
    margin: 0,
    lineHeight: 1.45,
    maxWidth: 260,
  };

  const interactive = (accent: string): React.ButtonHTMLAttributes<HTMLButtonElement> => ({
    onMouseEnter: (e) => {
      e.currentTarget.style.animationPlayState = "paused";
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.boxShadow = `0 22px 70px rgba(0,0,0,0.45), 0 0 0 4px ${accent}1f`;
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.animationPlayState = "running";
      e.currentTarget.style.transform = "translateY(0px)";
      e.currentTarget.style.borderColor = "rgba(148,163,184,0.22)";
      e.currentTarget.style.boxShadow = "0 18px 50px rgba(0,0,0,0.35)";
    },
    onFocus: (e) => {
      e.currentTarget.style.animationPlayState = "paused";
      e.currentTarget.style.borderColor = accent;
      e.currentTarget.style.boxShadow = `0 22px 70px rgba(0,0,0,0.45), 0 0 0 4px ${accent}33`;
    },
    onBlur: (e) => {
      e.currentTarget.style.animationPlayState = "running";
      e.currentTarget.style.borderColor = "rgba(148,163,184,0.22)";
      e.currentTarget.style.boxShadow = "0 18px 50px rgba(0,0,0,0.35)";
    },
  });

  return (
    <div style={container}>
      <style>
        {`
          @keyframes floating {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }

          @media (prefers-reduced-motion: reduce) {
            .floatingButton { animation: none !important; }
          }
        `}
      </style>

      <div style={grid}>
        <button
          type="button"
          className="floatingButton"
          style={{ ...buttonBase, animationDelay: "0ms" }}
          onClick={() => navigate("/text-chat")}
          aria-label="Chat"
          {...interactive("#38bdf8")}
        >
          <h2 style={label}>Chat</h2>
          <p style={desc}>Text chat, fast and lightweight.</p>
        </button>

        <button
          type="button"
          className="floatingButton"
          style={{ ...buttonBase, animationDelay: "450ms" }}
          onClick={() => navigate("/subjects")}
          aria-label="Video"
          {...interactive("#a78bfa")}
        >
          <h2 style={label}>Video</h2>
          <p style={desc}>Avatar video experience.</p>
        </button>
      </div>
    </div>
  );
}

export default ModePickerPage;