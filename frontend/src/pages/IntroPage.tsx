// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Snowfall from "react-snowfall";
//
// // --- Translation Dictionary ---
// const TRANSLATIONS = {
//   ro: {
//     title: "Bun venit la AI Chat",
//     subtitle: "Asistentul tău inteligent, redefinit cu o interfață modernă. Ești gata să începi?",
//     loginBtn: "Intră în aplicație →",
//     footer: "© 2024 AI Interface. Toate drepturile rezervate.",
//     settings: "Setări",
//     languageLabel: "Limbă"
//   },
//   en: {
//     title: "Welcome to AI Chat",
//     subtitle: "Your intelligent assistant, redefined with a modern interface. Ready to begin?",
//     loginBtn: "Login to Continue →",
//     footer: "© 2024 AI Interface. All rights reserved.",
//     settings: "Settings",
//     languageLabel: "Language"
//   }
// };
//
// export default function IntroPage() {
//   const navigate = useNavigate();
//
//   // --- State pentru limbă și meniu ---
//   const [lang, setLang] = useState<'ro' | 'en'>('en'); // Default engleză
//   const [settingsOpen, setSettingsOpen] = useState(false);
//
//   const t = TRANSLATIONS[lang];
//
//   return (
//     <div style={pageWrapper}>
//       {/* 1. Font and Global Animations */}
//       <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
//       <style>{`
//         html, body, #root {
//           margin: 0; padding: 0; width: 100%; height: 100%;
//           overflow: hidden; background-color: #000000;
//           font-family: 'Inter', -apple-system, sans-serif;
//         }
//
//         /* Blob Animations */
//         @keyframes blob {
//           0% { transform: translate(0px, 0px) scale(1); }
//           33% { transform: translate(50px, -70px) scale(1.1); }
//           66% { transform: translate(-30px, 30px) scale(0.95); }
//           100% { transform: translate(0px, 0px) scale(1); }
//         }
//
//         @keyframes fadeInUp {
//           from { opacity: 0; transform: translateY(20px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//
//         .background-blobs {
//           position: fixed; top: -10%; left: -10%; width: 120vw; height: 120vh;
//           overflow: hidden; z-index: 0; pointer-events: none;
//         }
//
//         .blob {
//           position: absolute; filter: blur(120px); opacity: 0.35;
//           animation: blob 18s infinite ease-in-out alternate; border-radius: 50%;
//         }
//
//         .blob-1 { top: 0%; left: 10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%); animation-delay: 0s; }
//         .blob-2 { bottom: 0%; right: 10%; width: 800px; height: 800px; background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(0,0,0,0) 70%); animation-delay: -5s; }
//         .blob-3 { top: 30%; left: 30%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%); animation-delay: -10s; }
//
//         /* Animation Classes */
//         .animate-entry { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
//         .delay-1 { animation-delay: 0.1s; }
//         .delay-2 { animation-delay: 0.2s; }
//         .delay-3 { animation-delay: 0.3s; }
//
//         /* Button Hover Effect */
//         .login-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(79, 70, 229, 0.6) !important; border-color: rgba(255,255,255,0.4) !important; }
//       `}</style>
//
//       {/* 2. Background Layers */}
//       <div className="background-blobs">
//         <div className="blob blob-1"></div>
//         <div className="blob blob-2"></div>
//         <div className="blob blob-3"></div>
//       </div>
//
//       {/* Snowfall Layer */}
//       <Snowfall
//         style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }}
//         color="white"
//         snowflakeCount={100}
//         radius={[0.5, 2.5]}
//         speed={[0.2, 1.5]}
//         wind={[-0.5, 1.5]}
//         opacity={[0.1, 0.4]}
//       />
//
//       {/* 3. Main Glassmorphic Content Card */}
//       <main style={heroContainer}>
//         <h1 className="animate-entry delay-1" style={heroTitle}>{t.title}</h1>
//         <p className="animate-entry delay-2" style={heroSubtitle}>{t.subtitle}</p>
//
//         <button
//             className="login-btn animate-entry delay-3"
//             onClick={() => navigate("/login")}
//             style={loginButtonStyle}
//         >
//           {t.loginBtn}
//         </button>
//       </main>
//
//       {/* Footer/Copyright */}
//       <div style={footerStyle}>{t.footer}</div>
//
//       {/* 4. Language Settings Button (Copied from Login) */}
//       <div style={settingsContainer}>
//         {settingsOpen && (
//           <div style={settingsMenu}>
//             <div style={settingsMenuHeader}>{t.settings}</div>
//             <div style={settingsRow}>
//               <span>{t.languageLabel}</span>
//               <div style={toggleGroup}>
//                 <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
//                 <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
//               </div>
//             </div>
//           </div>
//         )}
//         <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>
//           {settingsOpen ? '✕' : '⚙'}
//         </button>
//       </div>
//
//     </div>
//   );
// }
//
// // --- CSS-in-JS Styles ---
//
// const pageWrapper: React.CSSProperties = {
//   height: "100dvh",
//   width: "100vw",
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   justifyContent: 'center',
//   background: 'linear-gradient(to bottom, #050505, #0a0a0a)',
//   position: 'relative',
//   overflow: 'hidden',
// };
//
// const heroContainer: React.CSSProperties = {
//   position: 'relative',
//   zIndex: 10,
//   width: '90%',
//   maxWidth: '500px',
//   padding: '60px 40px',
//   textAlign: 'center',
//   background: 'rgba(255, 255, 255, 0.03)',
//   border: '1px solid rgba(255, 255, 255, 0.08)',
//   borderRadius: '24px',
//   backdropFilter: 'blur(40px)',
//   boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
//   gap: '32px',
// };
//
// const heroTitle: React.CSSProperties = {
//   margin: 0,
//   fontSize: '42px',
//   fontWeight: 700,
//   background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
//   WebkitBackgroundClip: 'text',
//   WebkitTextFillColor: 'transparent',
//   letterSpacing: '-0.03em',
//   lineHeight: 1.1,
// };
//
// const heroSubtitle: React.CSSProperties = {
//   margin: 0,
//   fontSize: '17px',
//   lineHeight: 1.6,
//   color: '#94a3b8',
//   fontWeight: 400,
//   maxWidth: '400px',
// };
//
// const loginButtonStyle: React.CSSProperties = {
//   background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
//   color: 'white',
//   border: '1px solid rgba(255,255,255,0.1)',
//   padding: '18px 48px',
//   borderRadius: '16px',
//   fontWeight: 600,
//   fontSize: '16px',
//   cursor: 'pointer',
//   boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
//   transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
//   marginTop: '8px',
//   width: '100%',
//   maxWidth: '300px',
// };
//
// const footerStyle: React.CSSProperties = {
//     position: 'absolute',
//     bottom: '20px',
//     color: 'rgba(255,255,255,0.2)',
//     fontSize: '12px',
//     fontWeight: 400,
//     zIndex: 10,
// };
//
// // --- Settings Styles (Copied from Login) ---
// const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
// const settingsFab: React.CSSProperties = { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transition: 'background 0.2s' };
// const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', borderRadius: '16px', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
// const settingsMenuHeader: React.CSSProperties = { fontSize: '14px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', color: '#94a3b8' };
// const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
// const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
// const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' };

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Snowfall from "react-snowfall";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Bun venit la AI Chat",
    subtitle: "Asistentul tău inteligent, redefinit cu o interfață modernă. Ești gata să începi?",
    loginBtn: "Intră în aplicație →",
    footer: "© 2024 AI Interface. Toate drepturile rezervate.",
    settings: "Setări",
    languageLabel: "Limbă"
  },
  en: {
    title: "Welcome to AI Chat",
    subtitle: "Your intelligent assistant, redefined with a modern interface. Ready to begin?",
    loginBtn: "Login to Continue →",
    footer: "© 2024 AI Interface. All rights reserved.",
    settings: "Settings",
    languageLabel: "Language"
  }
};

export default function IntroPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null); // Ref pentru Canvas-ul interactiv

  // --- State pentru limbă și meniu ---
  const [lang, setLang] = useState('en');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const t = TRANSLATIONS[lang];

  // --- LOGICA PENTRU EFECTUL DE PARTICULE INTERACTIVE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Setăm dimensiunea canvasului
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    // Mouse tracking
    const mouse = { x: undefined, y: undefined, radius: 150 };
    const handleMouseMove = (event) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Configurare Particule
    const particlesArray = [];
    const numberOfParticles = (window.innerWidth * window.innerHeight) / 9000; // Densitatea punctelor

    class Particle {
      constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
      }

      // Desenare punct
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      // Update poziție și interacțiune mouse
      update() {
        // Verificăm dacă a lovit marginea ecranului
        if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
        if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;

        // Verificăm coliziunea/proximitatea cu mouse-ul
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius + this.size) {
            // Efectul "Crazy": Particula fuge de mouse
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 3;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 3;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 3;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 3;
            }
        }

        // Mișcare normală
        this.x += this.directionX;
        this.y += this.directionY;

        this.draw();
      }
    }

    // Inițializare particule
    function init() {
        particlesArray.length = 0;
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 0.5; // Dimensiune variabilă
            let x = (Math.random() * ((window.innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((window.innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 1) - 0.5; // Viteză X
            let directionY = (Math.random() * 1) - 0.5; // Viteză Y
            let color = '#4f46e5'; // Culoarea punctelor (Indigo)
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    }

    // Conectare puncte (Linii)
    function connect() {
        let opacityValue = 1;
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                let distance = ((particlesArray[a].x - particlesArray[b].x) * (particlesArray[a].x - particlesArray[b].x)) +
                               ((particlesArray[a].y - particlesArray[b].y) * (particlesArray[a].y - particlesArray[b].y));

                // Dacă sunt aproape, tragem linie
                if (distance < (canvas.width / 7) * (canvas.height / 7)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = 'rgba(79, 70, 229,' + opacityValue + ')'; // Culoarea liniei
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Loop-ul de animație
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
        }
        connect();
    }

    init();
    animate();

    // Cleanup la unmount
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('mousemove', handleMouseMove);
        cancelAnimationFrame(animationFrameId);
    };
  }, []); // Empty dependency array = run once

  return (
    <div style={pageWrapper}>
      {/* 1. Font and Global Animations */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        html, body, #root {
          margin: 0; padding: 0; width: 100%; height: 100%;
          overflow: hidden; background-color: #000000;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        /* Blob Animations (păstrate subtil în spate pentru atmosferă) */
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(50px, -70px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
          100% { transform: translate(0px, 0px) scale(1); }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .background-blobs {
          position: fixed; top: -10%; left: -10%; width: 120vw; height: 120vh;
          overflow: hidden; z-index: 0; pointer-events: none;
        }

        .blob {
          position: absolute; filter: blur(120px); opacity: 0.2; /* Opacitate redusă pentru a vedea particulele */
          animation: blob 18s infinite ease-in-out alternate; border-radius: 50%;
        }

        .blob-1 { top: 0%; left: 10%; width: 700px; height: 700px; background: radial-gradient(circle, rgba(79, 70, 229, 0.25) 0%, rgba(0,0,0,0) 70%); animation-delay: 0s; }
        .blob-2 { bottom: 0%; right: 10%; width: 800px; height: 800px; background: radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(0,0,0,0) 70%); animation-delay: -5s; }
        .blob-3 { top: 30%; left: 30%; width: 600px; height: 600px; background: radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, rgba(0,0,0,0) 70%); animation-delay: -10s; }
       
        /* Animation Classes */
        .animate-entry { opacity: 0; animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .delay-1 { animation-delay: 0.1s; }
        .delay-2 { animation-delay: 0.2s; }
        .delay-3 { animation-delay: 0.3s; }

        /* Button Hover Effect */
        .login-btn:hover { transform: translateY(-2px); box-shadow: 0 0 30px rgba(79, 70, 229, 0.6) !important; border-color: rgba(255,255,255,0.4) !important; }
      `}</style>

      {/* 2. Background Layers */}

      {/* A. Canvas-ul Interactiv (Particule) */}
      <canvas
        ref={canvasRef}
        style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
      />

      {/* B. Blobs (Fundal colorat difuz) */}
      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* C. Snowfall (Opțional - l-am pus pe zIndex 1 ca să se suprapună ok) */}
      <Snowfall
        style={{ position: 'fixed', width: '100vw', height: '100vh', zIndex: 1 }}
        color="white"
        snowflakeCount={40}
        radius={[0.5, 1.5]}
        opacity={[0.1, 0.3]}
      />

      {/* 3. Main Glassmorphic Content Card */}
      <main style={heroContainer}>
        <h1 className="animate-entry delay-1" style={heroTitle}>{t.title}</h1>
        <p className="animate-entry delay-2" style={heroSubtitle}>{t.subtitle}</p>

        <button
            className="login-btn animate-entry delay-3"
            onClick={() => navigate("/login")}
            style={loginButtonStyle}
        >
          {t.loginBtn}
        </button>
      </main>

      {/* Footer/Copyright */}
      <div style={footerStyle}>{t.footer}</div>

      {/* 4. Language Settings Button */}
      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsMenuHeader}>{t.settings}</div>
            <div style={settingsRow}>
              <span>{t.languageLabel}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
                <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
              </div>
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

// --- CSS-in-JS Styles ---

const pageWrapper: React.CSSProperties = {
  height: "100dvh",
  width: "100vw",
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(to bottom, #050505, #0a0a0a)',
  position: 'relative',
  overflow: 'hidden',
};

const heroContainer: React.CSSProperties = {
  position: 'relative',
  zIndex: 10, // Conținutul trebuie să fie PESTE particule
  width: '90%',
  maxWidth: '500px',
  padding: '60px 40px',
  textAlign: 'center',
  background: 'rgba(20, 20, 20, 0.4)', // Mai întunecat pentru contrast cu particulele
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '24px',
  backdropFilter: 'blur(40px)',
  boxShadow: '0 40px 80px rgba(0, 0, 0, 0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '32px',
};

const heroTitle: React.CSSProperties = {
  margin: 0,
  fontSize: '42px',
  fontWeight: 700,
  background: 'linear-gradient(180deg, #ffffff 0%, #94a3b8 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '-0.03em',
  lineHeight: 1.1,
};

const heroSubtitle: React.CSSProperties = {
  margin: 0,
  fontSize: '17px',
  lineHeight: 1.6,
  color: '#94a3b8',
  fontWeight: 400,
  maxWidth: '400px',
};

const loginButtonStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
  color: 'white',
  border: '1px solid rgba(255,255,255,0.1)',
  padding: '18px 48px',
  borderRadius: '16px',
  fontWeight: 600,
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(79, 70, 229, 0.4)',
  transition: 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)',
  marginTop: '8px',
  width: '100%',
  maxWidth: '300px',
};

const footerStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '20px',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '12px',
    fontWeight: 400,
    zIndex: 10,
};

// --- Settings Styles ---
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" };
const settingsFab: React.CSSProperties = { width: '50px', height: '50px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '20px', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', transition: 'background 0.2s' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', borderRadius: '16px', background: 'rgba(20, 20, 20, 0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '14px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', color: '#94a3b8' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 600, transition: 'all 0.2s' };