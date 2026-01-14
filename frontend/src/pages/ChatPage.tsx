import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getJobStatus, uploadQuestion } from "../api";

const TRANSLATIONS = {
  ro: {
    placeholder: "Pune o întrebare prin text sau voce...",
    empty: "Pregătit pentru o nouă sesiune video.",
    send: "Trimite",
    back: "Înapoi",
    thinking: [
      "Analizez datele...",
      "Generez răspunsul video...",
      "Randez avatarul digital...",
      "Sintetizez vocea...",
      "Pregătesc lecția video...",
      "Aproape gata..."
    ],
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    statusReady: "Înregistrare gata.",
    recording: "Ascult...",
  },
  en: {
    placeholder: "Ask a question via text or voice...",
    empty: "Ready for a new video session.",
    send: "Send",
    back: "Back",
    thinking: [
      "Analyzing data...",
      "Generating video response...",
      "Rendering digital avatar...",
      "Synthesizing voice...",
      "Preparing video lesson...",
      "Almost there..."
    ],
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    statusReady: "Recording ready.",
    recording: "Listening...",
  }
};

const DynamicThinkingText = ({ lang }: { lang: 'ro' | 'en' }) => {
  const prompts = TRANSLATIONS[lang].thinking;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % prompts.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [prompts.length]);

  return (
    <div key={lang + index} className="thinking-text-animation">
      {prompts[index]}
    </div>
  );
};

type Interaction = {
  id: string;
  role: "user" | "assistant";
  text: string;
  videoUrl?: string;
  isProcessing?: boolean;
};

type JobStatus = { status: string; video_url?: string; error?: unknown; error_message?: string };

export function ChatPage() {
  const { token, avatar, voice, setToken } = useAuth() as any;
  const navigate = useNavigate();

  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!token) navigate("/login");
    else if (!avatar) navigate("/avatars");
    else if (!voice) navigate("/voices");
  }, [token, avatar, voice, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [interactions, inputText, isListening]);

  function toggleRecording() {
    if (isListening) {
      mediaRecorderRef.current?.stop();
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    setAudioBlob(null);
    setInputText("");

    const SpeechCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechCtor) {
      const recognition = new SpeechCtor();
      recognitionRef.current = recognition;
      recognition.lang = lang === 'ro' ? "ro-RO" : "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (e: any) => {
        let full = "";
        for (let i = 0; i < e.results.length; i++) full += e.results[i][0].transcript;
        setInputText(full.trim());
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        setAudioBlob(new Blob(chunksRef.current, { type: "audio/webm" }));
        stream.getTracks().forEach(t => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
    });
  }

  async function send() {
    const finalMsg = inputText.trim();
    if (!finalMsg && !audioBlob) return;

    const thinkingId = crypto.randomUUID();
    setInteractions(prev => [...prev,
      { id: crypto.randomUUID(), role: "user", text: finalMsg || "Audio Question" },
      { id: thinkingId, role: "assistant", text: "", isProcessing: true }
    ]);

    const currentBlob = audioBlob;
    setInputText("");
    setAudioBlob(null);

    try {
      const blobToSend = currentBlob || new Blob([finalMsg], { type: 'text/plain' });
        const { job_id } = await uploadQuestion(
          token,
          voice.id,
          blobToSend,
          finalMsg,
          avatar?.avatar_type === "avatar" ? (avatar?.id || "") : "",
          avatar?.image_url,
          avatar?.avatar_type === "talking_photo" ? (avatar?.id || "") : ""
        );
      const interval = setInterval(async () => {
        const res = (await getJobStatus(token, job_id)) as unknown as JobStatus;
        const st = (res.status || "").toLowerCase();
        if (st === "completed" && res.video_url) {
          setInteractions(prev => prev.map(item =>
            item.id === thinkingId ? { ...item, videoUrl: res.video_url, isProcessing: false } : item
          ));
          clearInterval(interval);
        } else if (["failed", "error", "canceled", "cancelled"].includes(st)) {
          const msg = res.error_message || (typeof res.error === "string" ? res.error : "Error.");
          setInteractions(prev => prev.map(item =>
            item.id === thinkingId ? { ...item, text: msg, isProcessing: false } : item
          ));
          clearInterval(interval);
        }
      }, 4000);
    } catch {
      setInteractions(prev => prev.map(item => item.id === thinkingId ? { ...item, text: "Failed.", isProcessing: false } : item));
    }
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        /* 1. Global Reset - Exactly as LoginPage */
        html, body, #root {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background-color: #020617;
        }

        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        /* 2. Seamless Background Animation */
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

        .blob-1 {
          top: 10%;
          left: 10%;
          width: 600px;
          height: 600px;
          background: rgba(53, 114, 239, 0.4); 
          animation-delay: 0s;
        }

        .blob-2 {
          bottom: 10%;
          right: 15%;
          width: 700px;
          height: 700px;
          background: rgba(100, 50, 200, 0.3); 
          animation-delay: -5s;
        }

        .blob-3 {
          top: 40%;
          left: 30%;
          width: 500px;
          height: 500px;
          background: rgba(53, 114, 239, 0.2); 
          animation-delay: -10s;
        }

        .scroll-area { flex: 1; width: 100%; overflow-y: auto; padding-bottom: 220px; padding-top: 100px; scrollbar-width: none; -ms-overflow-style: none; z-index: 1; position: relative; }
        .scroll-area::-webkit-scrollbar { display: none; }
        .content-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 48px; }
        
        .bubble { padding: 24px 32px; font-size: 17px; line-height: 1.7; border-radius: 28px; max-width: 80%; animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1); position: relative; }
        .user-bubble { align-self: flex-end; background: linear-gradient(135deg, rgba(53, 114, 239, 0.15) 0%, rgba(53, 114, 239, 0.08) 100%); border: 1px solid rgba(53, 114, 239, 0.25); color: #fff; border-bottom-right-radius: 6px; }
        .ai-bubble { align-self: flex-start; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); color: #e1e1e6; border-bottom-left-radius: 6px; backdrop-filter: blur(20px); width: 100%; max-width: 900px; }
        .bubble-label { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.3); margin-bottom: 12px; display: block; }
        .video-player { width: 100%; border-radius: 20px; background: #000; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px; aspect-ratio: 16/9; }
        
        .thinking-text-animation { animation: textFadeIn 0.6s ease-out; }
        @keyframes textFadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

        .typing-dots { display: flex; gap: 4px; margin-top: 14px; align-items: center; }
        .dot { width: 6px; height: 6px; background: #3572ef; border-radius: 50%; animation: jump 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes jump { 0%, 80%, 100% { transform: translateY(0); opacity: 0.3; } 40% { transform: translateY(-6px); opacity: 1; } }

        .floating-back { position: fixed; top: 40px; left: 40px; z-index: 1000; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 100px; cursor: pointer; font-weight: 600; transition: 0.3s; backdrop-filter: blur(12px); }
        .floating-back:hover { background: rgba(255,255,255,0.08); color: #fff; transform: translateY(-2px); }
        .mic-btn.active { background: rgba(255, 69, 58, 0.15) !important; animation: pulse 1.5s infinite; border-radius: 50%; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0.3); } 70% { box-shadow: 0 0 0 10px rgba(255, 69, 58, 0); } 100% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .logout-btn:hover { background: rgba(255, 255, 255, 0.2) !important; transform: scale(1.05); }
      `}</style>

      {/* Background is provided globally (particles + blobs) */}

      <button className="floating-back" onClick={() => navigate("/mode")}>{t.back}</button>

      <main className="scroll-area" ref={scrollRef}>
        <div className="content-container">
          {interactions.length === 0 && !isListening && (
            <div style={heroEmptyState}>{t.empty}</div>
          )}

          {interactions.map(m => (
            <div key={m.id} className={`bubble ${m.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <span className="bubble-label">{m.role === 'user' ? 'User' : 'Assistant'}</span>

              {m.isProcessing ? (
                <>
                  <DynamicThinkingText lang={lang} />
                  <div className="typing-dots"><div className="dot" /><div className="dot" /><div className="dot" /></div>
                </>
              ) : (
                <>
                  {m.text}
                  {m.videoUrl && <video src={m.videoUrl} controls className="video-player" autoPlay />}
                </>
              )}
            </div>
          ))}
        </div>
      </main>

      <div style={inputDock}>
        <div style={inputConsole}>
          <input
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={audioBlob ? t.statusReady : t.placeholder}
            style={invisibleInput}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingRight: '8px' }}>
             <button
                className={`mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleRecording}
                style={iconBtnStyle}
             >
               🎙️
             </button>
             <button onClick={send} style={{ ...actionSendBtn, opacity: (inputText || audioBlob) ? 1 : 0.4 }}>{t.send}</button>
          </div>
        </div>
      </div>

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
            <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px', marginTop: '4px' }}>
                <span style={{ color: '#ff453a' }}>{t.logout}</span>
                <button className="logout-btn" onClick={handleLogout} style={logoutActionBtn}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                </button>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: 'flex', flexDirection: 'column', background: 'transparent', position: 'relative', overflow: 'hidden' };
const heroEmptyState: React.CSSProperties = { height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.15, fontSize: '24px', fontWeight: 600, color: 'white' };
const inputDock: React.CSSProperties = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '50px 0', background: 'linear-gradient(transparent, #020617 80%)', display: 'flex', justifyContent: 'center', zIndex: 900 };
const inputConsole: React.CSSProperties = { width: '100%', maxWidth: '1000px', background: 'rgba(25, 25, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '40px', padding: '12px 12px 12px 32px', display: 'flex', alignItems: 'center', backdropFilter: 'blur(40px)', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)' };
const invisibleInput: React.CSSProperties = { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '17px', outline: 'none', padding: '10px 0' };
const iconBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', opacity: 0.6, padding: '10px', borderRadius: '50%', transition: '0.2s' };
const actionSendBtn: React.CSSProperties = { background: '#3572ef', color: 'white', border: 'none', padding: '14px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '14px', cursor: 'pointer' };
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '30px', right: '30px', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '15px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", padding: "8px", borderRadius: "10px", cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default ChatPage;

