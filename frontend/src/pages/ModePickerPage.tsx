// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { useAuth } from "../auth/AuthContext";
//
// // --- Translation Dictionary ---
// const TRANSLATIONS = {
//   ro: {
//     title: "Alege Modul de Învățare",
//     subtitle: "Selectează cum dorești să interacționezi cu tutorii tăi AI astăzi.",
//     chatTitle: "Chat Text",
//     chatDesc: "O experiență rapidă, bazată pe text. Ideal pentru întrebări punctuale și răspunsuri rapide, instantanee.",
//     videoTitle: "Experiență Video",
//     videoDesc: "Interacțiune completă cu avatar video. Lecții vizuale și conversație vocală imersivă.",
//     liveTitle: "Live Chat (Avatar)",
//     liveDesc: "Conversație live cu un avatar. Poți vorbi și primești răspuns în timp real.",
//     select: "Selectează",
//     settings: "Setări",
//     lang: "Limbă",
//     logout: "Deconectare"
//   },
//   en: {
//     title: "Choose Learning Mode",
//     subtitle: "Select how you want to interact with your AI tutors today.",
//     chatTitle: "Text Chat",
//     chatDesc: "A fast, text-based experience. Ideal for quick questions and instant answers.",
//     videoTitle: "Video Experience",
//     videoDesc: "Full interaction with video avatar. Visual lessons and immersive voice conversation.",
//     liveTitle: "Live Chat (Avatar)",
//     liveDesc: "Live conversation with a HeyGen LiveAvatar. Speak or type and get real-time responses.",
//     select: "Select",
//     settings: "Settings",
//     lang: "Language",
//     logout: "Logout"
//   }
// };
//
// export function ModePickerPage() {
//   const navigate = useNavigate();
//   const { setToken } = useAuth();
//
//   const [lang, setLang] = useState<'ro' | 'en'>('ro');
//   const [settingsOpen, setSettingsOpen] = useState(false);
//   const t = TRANSLATIONS[lang];
//
//   const handleLogout = () => {
//     setToken(null);
//     navigate("/login");
//   };
//
//   return (
//     <div style={pageWrapper}>
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
//
//       <style>{`
//         /* 1. Global Reset - Exactly as LoginPage */
//         html, body, #root {
//           margin: 0;
//           padding: 0;
//           width: 100%;
//           height: 100%;
//           overflow: hidden;
//           background-color: #020617;
//         }
//
//         * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
//
//         /* 2. Seamless Background Animation */
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(50px, -70px) scale(1.1); }
//           66% { transform: translate(-30px, 30px) scale(0.95); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//
//         .background-blobs {
//           position: fixed;
//           top: -10%;
//           left: -10%;
//           width: 120vw;
//           height: 120vh;
//           overflow: hidden;
//           z-index: 0;
//           pointer-events: none;
//         }
//
//         .blob {
//           position: absolute;
//           filter: blur(120px);
//           opacity: 0.35;
//           animation: blob 18s infinite ease-in-out alternate;
//           border-radius: 50%;
//         }
//
//         .blob-1 {
//           top: 10%;
//           left: 10%;
//           width: 600px;
//           height: 600px;
//           background: rgba(53, 114, 239, 0.4);
//           animation-delay: 0s;
//         }
//
//         .blob-2 {
//           bottom: 10%;
//           right: 15%;
//           width: 700px;
//           height: 700px;
//           background: rgba(100, 50, 200, 0.3);
//           animation-delay: -5s;
//         }
//
//         .blob-3 {
//           top: 40%;
//           left: 30%;
//           width: 500px;
//           height: 500px;
//           background: rgba(53, 114, 239, 0.2);
//           animation-delay: -10s;
//         }
//
//         /* 3. Page Specific Content UI */
//         .mode-card {
//           flex: 1;
//           max-width: 500px;
//           aspect-ratio: 1 / 1.1;
//           background: rgba(28, 28, 30, 0.65); /* Adjusted to match LoginPage card depth */
//           backdrop-filter: blur(40px);
//           -webkit-backdrop-filter: blur(40px);
//           border-radius: 48px;
//           border: 1px solid rgba(255, 255, 255, 0.1);
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           padding: 60px;
//           cursor: pointer;
//           transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
//           text-align: center;
//           text-decoration: none;
//           z-index: 1;
//         }
//
//         .mode-card:hover {
//           transform: translateY(-15px) scale(1.02);
//           background: rgba(44, 44, 46, 0.8);
//           border-color: #3572ef;
//           box-shadow: 0 40px 80px rgba(0, 0, 0, 0.5);
//         }
//
//         .mode-icon {
//           width: 100px;
//           height: 100px;
//           border-radius: 30px;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           font-size: 42px;
//           margin-bottom: 32px;
//           transition: all 0.5s ease;
//         }
//
//         .mode-card:hover .mode-icon {
//           transform: scale(1.1) rotate(5deg);
//         }
//
//         .logout-btn:hover {
//           background: rgba(255, 255, 255, 0.2) !important;
//           border-color: rgba(255, 255, 255, 0.4) !important;
//           transform: scale(1.05);
//         }
//       `}</style>
//
//       {/* FIXED BACKGROUND LAYER */}
//       <div className="background-blobs">
//         <div className="blob blob-1"></div>
//         <div className="blob blob-2"></div>
//         <div className="blob blob-3"></div>
//       </div>
//
//       <div style={headerLayout}>
//         <h1 style={titleTypography}>{t.title}</h1>
//         <p style={subtitleTypography}>{t.subtitle}</p>
//       </div>
//
//       <div style={gridContainer}>
//         {/* --- Text Chat Mode --- */}
//         <div className="mode-card" onClick={() => navigate("/text-chat")}>
//           <div style={{ ...modeIconBase, background: 'rgba(53, 114, 239, 0.15)', color: '#3572ef' }} className="mode-icon">
//             💬
//           </div>
//           <h2 style={cardTitle}>{t.chatTitle}</h2>
//           <p style={cardDesc}>{t.chatDesc}</p>
//           <div style={selectBadge}>{t.select}</div>
//         </div>
//
//         {/* --- Video Mode --- */}
//         <div className="mode-card" onClick={() => navigate("/subjects")}>
//           <div style={{ ...modeIconBase, background: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa' }} className="mode-icon">
//             🎬
//           </div>
//           <h2 style={cardTitle}>{t.videoTitle}</h2>
//           <p style={cardDesc}>{t.videoDesc}</p>
//           <div style={{ ...selectBadge, background: '#a78bfa33', color: '#a78bfa' }}>{t.select}</div>
//         </div>
//
//         {/* --- Live Chat Mode (HeyGen LiveAvatar) --- */}
//         <div className="mode-card" onClick={() => navigate("/livechat")}>
//           <div style={{ ...modeIconBase, background: 'rgba(34, 211, 238, 0.12)', color: '#22d3ee' }} className="mode-icon">
//             🤖
//           </div>
//           <h2 style={cardTitle}>{t.liveTitle}</h2>
//           <p style={cardDesc}>{t.liveDesc}</p>
//           <div style={{ ...selectBadge, background: 'rgba(34, 211, 238, 0.12)', color: '#22d3ee' }}>{t.select}</div>
//         </div>
//       </div>
//
//       {/* Floating Settings Hub */}
//       <div style={settingsContainer}>
//         {settingsOpen && (
//           <div style={settingsMenu}>
//             <div style={settingsMenuHeader}>{t.settings}</div>
//             <div style={settingsRow}>
//               <span>{t.lang}</span>
//               <div style={toggleGroup}>
//                 <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
//                 <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
//               </div>
//             </div>
//
//             <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
//                 <span style={{ color: '#ff453a' }}>{t.logout}</span>
//                 <button className="logout-btn" onClick={handleLogout} style={logoutActionBtn}>
//                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
//                     <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                     <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
//                   </svg>
//                 </button>
//             </div>
//           </div>
//         )}
//         <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
//           {settingsOpen ? '✕' : '⚙'}
//         </button>
//       </div>
//     </div>
//   );
// }
//
// // --- Style Variables ---
//
// const pageWrapper: React.CSSProperties = {
//   height: "100dvh",
//   width: "100vw",
//   display: "flex",
//   flexDirection: "column",
//   alignItems: "center",
//   justifyContent: "center",
//   background: "transparent",
//   padding: "0",
//   position: 'relative',
//   overflow: 'hidden',
//   color: "#ffffff"
// };
//
// const headerLayout: React.CSSProperties = { textAlign: "center", marginBottom: "80px", maxWidth: "800px", zIndex: 1 };
// const titleTypography: React.CSSProperties = { fontSize: "56px", fontWeight: 800, letterSpacing: "-0.05em", margin: "0 0 16px 0" };
// const subtitleTypography: React.CSSProperties = { fontSize: "20px", color: "#8e8e93", fontWeight: 400, lineHeight: 1.5 };
// const gridContainer: React.CSSProperties = { display: "flex", gap: "40px", width: "100%", maxWidth: "1100px", justifyContent: "center", zIndex: 1 };
// const modeIconBase: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 0 20px rgba(255,255,255,0.05)" };
// const cardTitle: React.CSSProperties = { fontSize: "32px", fontWeight: 700, margin: "0 0 16px 0", letterSpacing: "-0.02em" };
// const cardDesc: React.CSSProperties = { fontSize: "16px", color: "#a1a1a6", lineHeight: 1.6, margin: "0 0 32px 0", maxWidth: "320px" };
// const selectBadge: React.CSSProperties = { padding: "8px 24px", borderRadius: "100px", background: "rgba(53, 114, 239, 0.15)", color: "#3572ef", fontSize: "14px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" };
//
// const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
// const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' };
// const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
// const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
// const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
// const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
// const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
// const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#ffffff", padding: "8px", borderRadius: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };
//
// export default ModePickerPage;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Alege Modul de Învățare",
    subtitle: "Selectează cum dorești să interacționezi cu tutorii tăi AI astăzi.",
    chatTitle: "Chat Text",
    chatDesc: "O experiență rapidă, bazată pe text. Ideal pentru întrebări punctuale și răspunsuri rapide.",
    videoTitle: "Experiență Video",
    videoDesc: "Interacțiune completă cu avatar video. Lecții vizuale și conversație vocală imersivă.",
    liveTitle: "Live Chat (Avatar)",
    liveDesc: "Conversație live cu un avatar. Poți vorbi și primești răspuns în timp real.",
    select: "Selectează",
    settings: "Setări",
    lang: "Limbă",
    logout: "Deconectare"
  },
  en: {
    title: "Choose Learning Mode",
    subtitle: "Select how you want to interact with your AI tutors today.",
    chatTitle: "Text Chat",
    chatDesc: "A fast, text-based experience. Ideal for quick questions and instant answers.",
    videoTitle: "Video Experience",
    videoDesc: "Full interaction with video avatar. Visual lessons and immersive voice conversation.",
    liveTitle: "Live Chat (Avatar)",
    liveDesc: "Live conversation with a HeyGen LiveAvatar. Speak or type and get real-time responses.",
    select: "Select",
    settings: "Settings",
    lang: "Language",
    logout: "Logout"
  }
};

export function ModePickerPage() {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const canvasRef = useRef(null);

  const [lang, setLang] = useState('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };

  // --- 3D HEXAGON ANIMATION LOGIC ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const mouse = { x: undefined, y: undefined };
    const handleMouseMove = (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const hexRadius = 25;
    const hexGap = 2;
    const hexWidth = Math.sqrt(3) * hexRadius;
    const hexHeight = 2 * hexRadius;
    const hexagons = [];

    class Hexagon {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.opacity = 0.02; // Foarte sters by default
        this.targetOpacity = 0.02;
        this.scale = 1;      // Scara normală
        this.targetScale = 1;
      }

      draw() {
        ctx.save();
        ctx.beginPath();

        // Calculăm vârfurile hexagonului ținând cont de scală
        const currentRadius = hexRadius * this.scale;

        for (let i = 0; i < 6; i++) {
          const angleDeg = 60 * i - 30;
          const angleRad = (Math.PI / 180) * angleDeg;
          const px = this.x + currentRadius * Math.cos(angleRad);
          const py = this.y + currentRadius * Math.sin(angleRad);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();

        // --- EFECTUL 3D ---
        // 1. Shadow (Glow) doar dacă e activ
        if (this.opacity > 0.1) {
            ctx.shadowColor = `rgba(53, 114, 239, ${this.opacity})`;
            ctx.shadowBlur = 15 * this.opacity; // Glow variabil
        }

        // 2. Gradient Radial (Lumină în centru -> Întuneric margini)
        // Asta creează efectul de "bombat" sau 3D
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, currentRadius);
        gradient.addColorStop(0, `rgba(100, 160, 255, ${this.opacity * 1.5})`); // Centru luminos
        gradient.addColorStop(0.8, `rgba(53, 114, 239, ${this.opacity})`);     // Culoare bază
        gradient.addColorStop(1, `rgba(20, 40, 100, ${this.opacity * 0.5})`);  // Margine întunecată

        ctx.fillStyle = gradient;
        ctx.fill();

        // 3. Stroke fin
        ctx.strokeStyle = `rgba(100, 150, 255, ${this.opacity * 0.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Logică interacțiune
        if (distance < 150) {
          // Cu cât e mai aproape, cu atât e mai opac și mai mare
          const intensity = 1 - (distance / 150);
          this.targetOpacity = 0.8 * intensity;
          this.targetScale = 1 + (0.15 * intensity); // Crește cu max 15%
        } else {
          this.targetOpacity = 0.02;
          this.targetScale = 1;
        }

        // Smooth transition (Lerp)
        this.opacity += (this.targetOpacity - this.opacity) * 0.1;
        this.scale += (this.targetScale - this.scale) * 0.1;

        this.draw();
      }
    }

    function initGrid() {
        hexagons.length = 0;
        let row = 0;
        for (let y = 0; y < canvas.height + hexRadius; y += hexHeight * 0.75) {
            let col = 0;
            const offset = row % 2 === 0 ? 0 : hexWidth / 2;
            for (let x = -hexWidth; x < canvas.width + hexWidth; x += hexWidth) {
                hexagons.push(new Hexagon(x + offset + col * hexGap, y + row * hexGap));
                col++;
            }
            row++;
        }
    }

    window.addEventListener('resize', initGrid);
    initGrid();

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hexagons.forEach(hex => hex.update());
      animationFrameId = requestAnimationFrame(animate);
    }
    animate();

    return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('resize', resizeCanvas);
        window.removeEventListener('resize', initGrid);
        cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        /* Reset & Base */
        html, body, #root {
          margin: 0; padding: 0; width: 100%; height: 100%;
          overflow: hidden; background-color: #020617;
          font-family: 'Inter', sans-serif;
        }

        /* CARDURILE - CSS REPARAT (Stil original) */
        .mode-card {
          flex: 1;
          min-width: 280px;
          max-width: 350px;
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          display: flex;
          flex-direction: column; /* Esențial pentru layout vertical */
          align-items: center;    /* Centrează orizontal */
          justify-content: center; /* Centrează vertical */
          padding: 40px 30px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          text-align: center;
          backdrop-filter: blur(12px);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.5);
          z-index: 10;
        }

        .mode-card:hover {
          transform: translateY(-10px);
          background: rgba(30, 41, 59, 0.8);
          border-color: rgba(53, 114, 239, 0.5);
          box-shadow: 0 20px 50px rgba(53, 114, 239, 0.2);
        }

        .mode-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          margin-bottom: 24px;
          background: rgba(255,255,255,0.05);
          transition: transform 0.3s ease;
        }

        .mode-card:hover .mode-icon {
          transform: scale(1.1) rotate(5deg);
        }

        /* Responsive Grid */
        .cards-grid {
          display: flex;
          gap: 30px;
          width: 100%;
          max-width: 1200px;
          justify-content: center;
          padding: 0 20px;
          flex-wrap: wrap;
        }
      `}</style>

      {/* Canvas Layer */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      />

      {/* Content */}
      <div style={contentWrapper}>
        <div style={headerLayout}>
            <h1 style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
        </div>

        <div className="cards-grid">
            {/* 1. Text Chat */}
            <div className="mode-card" onClick={() => navigate("/text-chat")}>
                <div className="mode-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>💬</div>
                <h2 style={cardTitle}>{t.chatTitle}</h2>
                <p style={cardDesc}>{t.chatDesc}</p>
                <div style={selectBadge}>{t.select}</div>
            </div>

            {/* 2. Video Mode */}
            <div className="mode-card" onClick={() => navigate("/subjects")}>
                <div className="mode-icon" style={{ color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)' }}>🎬</div>
                <h2 style={cardTitle}>{t.videoTitle}</h2>
                <p style={cardDesc}>{t.videoDesc}</p>
                <div style={{ ...selectBadge, color: '#a855f7', background: 'rgba(168, 85, 247, 0.15)' }}>{t.select}</div>
            </div>

            {/* 3. Live Avatar */}
            <div className="mode-card" onClick={() => navigate("/livechat")}>
                <div className="mode-icon" style={{ color: '#06b6d4', background: 'rgba(6, 182, 212, 0.1)' }}>🤖</div>
                <h2 style={cardTitle}>{t.liveTitle}</h2>
                <p style={cardDesc}>{t.liveDesc}</p>
                <div style={{ ...selectBadge, color: '#06b6d4', background: 'rgba(6, 182, 212, 0.15)' }}>{t.select}</div>
            </div>
        </div>
      </div>

      {/* Settings (Neschimbat) */}
      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsMenuHeader}>{t.settings}</div>
            <div style={settingsRow}>
              <span>{t.lang}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
                <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
              </div>
            </div>
            <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ color: '#ff453a' }}>{t.logout}</span>
                <button onClick={handleLogout} style={logoutActionBtn}>
                  <span style={{ fontSize: '18px' }}>⎋</span>
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

// --- JS Styles ---

const pageWrapper: React.CSSProperties = {
  height: "100dvh", width: "100vw",
  display: "flex", flexDirection: "column",
  position: 'relative', overflow: 'hidden',
  color: "#ffffff"
};

const contentWrapper: React.CSSProperties = {
    zIndex: 10,
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '20px'
};

const headerLayout: React.CSSProperties = { textAlign: "center", marginBottom: "50px", maxWidth: "700px" };
const titleTypography: React.CSSProperties = { fontSize: "48px", fontWeight: 800, letterSpacing: "-0.03em", margin: "0 0 16px 0", background: "linear-gradient(to right, #fff, #94a3b8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" };
const subtitleTypography: React.CSSProperties = { fontSize: "18px", color: "#94a3b8", fontWeight: 400, lineHeight: 1.6 };

const cardTitle: React.CSSProperties = { fontSize: "24px", fontWeight: 700, margin: "0 0 12px 0", width: '100%' };
const cardDesc: React.CSSProperties = { fontSize: "14px", color: "#a1a1a6", lineHeight: 1.6, margin: "0 0 30px 0", width: '100%' };
const selectBadge: React.CSSProperties = { padding: "10px 24px", borderRadius: "100px", background: "rgba(53, 114, 239, 0.15)", color: "#3572ef", fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", border: '1px solid rgba(53, 114, 239, 0.3)' };

// Settings styles
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.9)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '16px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, transition: 'all 0.2s' };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 69, 58, 0.1)", border: "1px solid rgba(255, 69, 58, 0.2)", color: "#ff453a", width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s ease" };

export default ModePickerPage;