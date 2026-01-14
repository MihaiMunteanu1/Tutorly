import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getJobStatus, uploadQuestion } from "../api";

const TRANSLATIONS = {
  ro: {
    placeholder: "Pune o întrebare prin text sau voce...",
    empty: "Sistem pregătit. Inițiază dialogul.",
    send: "Trimite",
    back: "Înapoi",
    thinking: [
      "Analizez datele...",
      "Procesez răspunsul...",
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
    empty: "System ready. Initiate dialogue.",
    send: "Send",
    back: "Back",
    thinking: [
      "Analyzing data...",
      "Processing response...",
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
    }, 5000);
    return () => clearInterval(interval);
  }, [prompts.length]);

  return (
    <div key={lang + index} className="thinking-text-animation living-title" style={{ fontSize: '20px', fontWeight: 700 }}>
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
      setInteractions(prev =>
        prev.map(item =>
          item.id === thinkingId
            ? { ...item, text: "Failed.", isProcessing: false }
            : item
        )
      );
    }
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  return (
    <div style={pageWrapper}>
      {/* PREMIUM FONT IMPORT: OUTFIT */}
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        
        /* Apply Outfit to all components */
        * { box-sizing: border-box; font-family: 'Outfit', sans-serif; -webkit-font-smoothing: antialiased; }
        
        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); } }

        .living-title {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          text-shadow: 0 0 40px rgba(53, 114, 239, 0.2);
        }

        .elegant-entry { opacity: 0; animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes elegantEntry { from { opacity: 0; filter: blur(10px); transform: translateY(20px); } to { opacity: 1; filter: blur(0); transform: translateY(0); } }

        .scroll-area { flex: 1; width: 100%; overflow-y: auto; padding-bottom: 220px; padding-top: 120px; scrollbar-width: none; -ms-overflow-style: none; z-index: 1; }
        .scroll-area::-webkit-scrollbar { display: none; }
        .content-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 48px; }
        
        .bubble { padding: 32px; font-size: 19px; line-height: 1.7; border-radius: 32px; max-width: 85%; position: relative; backdrop-filter: blur(20px); }
        .user-bubble { align-self: flex-end; background: linear-gradient(135deg, rgba(53, 114, 239, 0.2) 0%, rgba(53, 114, 239, 0.1) 100%); border: 1px solid rgba(53, 114, 239, 0.3); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); font-weight: 500; }
        .ai-bubble { align-self: flex-start; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); color: #f0f0f5; border-bottom-left-radius: 4px; width: 100%; max-width: 1000px; box-shadow: 0 40px 80px rgba(0,0,0,0.3); font-weight: 300; letter-spacing: 0.01em; }
        
        .bubble-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #3572ef; margin-bottom: 16px; display: block; }
        .video-player { width: 100%; border-radius: 24px; background: #000; border: 1px solid rgba(255,255,255,0.1); margin-top: 10px; aspect-ratio: 16/9; box-shadow: 0 30px 60px rgba(0,0,0,0.5); }
        
        .dot { width: 8px; height: 8px; background: #3572ef; border-radius: 50%; animation: jump 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes jump { 0%, 80%, 100% { transform: translateY(0); opacity: 0.3; } 40% { transform: translateY(-8px); opacity: 1; } }

        .floating-back { position: fixed; top: 40px; left: 40px; z-index: 1000; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 12px 24px; border-radius: 100px; cursor: pointer; font-weight: 700; transition: 0.3s; backdrop-filter: blur(12px); }
        .floating-back:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }
        
        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%) rotate(-45deg); } 20%, 100% { transform: translateX(100%) rotate(-45deg); } }

        /* PULSATING MIC ANIMATION - RESTORED */
        .mic-btn.active { 
          background: rgba(255, 69, 58, 0.15) !important; 
          animation: pulse 1.5s infinite; 
          border-radius: 50%; 
          opacity: 1 !important;
        }
        @keyframes pulse { 
          0% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0.4); } 
          70% { box-shadow: 0 0 0 15px rgba(255, 69, 58, 0); } 
          100% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0); } 
        }
      `}</style>

      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <button className="floating-back" onClick={() => navigate("/mode-selection")}>← {t.back}</button>

      <main className="scroll-area" ref={scrollRef}>
        <div className="content-container">
          {interactions.length === 0 && !isListening && (
            <div style={heroEmptyState}>{t.empty}</div>
          )}

          {interactions.map(m => (
            <div key={m.id} className={`bubble elegant-entry ${m.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
              <span className="bubble-label">{m.role === 'user' ? 'Human Query' : 'Expert Synthesis'}</span>

              {m.isProcessing ? (
                <>
                  <DynamicThinkingText lang={lang} />
                  <div style={{ display: 'flex', gap: '6px', marginTop: '20px', alignItems: 'center' }}>
                    <div className="dot" /><div className="dot" /><div className="dot" />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: '18px', fontWeight: 400 }}>{m.text}</div>
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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '8px' }}>
             <button
                className={`mic-btn ${isListening ? 'active' : ''}`}
                onClick={toggleRecording}
                style={iconBtnStyle}
             >
               🎙️
             </button>
             <button onClick={send} className="shimmer-btn" style={{ ...actionSendBtn, opacity: (inputText || audioBlob) ? 1 : 0.3 }}>{t.send}</button>
          </div>
        </div>
      </div>

      <div style={settingsContainer}>
        {settingsOpen && (
          <div style={settingsMenu}>
            <div style={settingsRow}>
              <span>{t.languageLabel}</span>
              <div style={toggleGroup}>
                <button onClick={() => setLang('ro')} style={{ ...langToggleBtn, background: lang === 'ro' ? '#3572ef' : 'transparent', color: '#fff' }}>RO</button>
                <button onClick={() => setLang('en')} style={{ ...langToggleBtn, background: lang === 'en' ? '#3572ef' : 'transparent', color: '#fff' }}>EN</button>
              </div>
            </div>
            <div style={{ ...settingsRow, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '12px' }}>
                <span style={{ color: '#ff453a', fontWeight: 600, cursor: 'pointer' }} onClick={handleLogout}>{t.logout}</span>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

// --- Styles ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' };
const heroEmptyState: React.CSSProperties = { height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.1, fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em', color: 'white' };
const inputDock: React.CSSProperties = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '60px 0', background: 'linear-gradient(transparent, #010409 70%)', display: 'flex', justifyContent: 'center', zIndex: 900 };
const inputConsole: React.CSSProperties = { width: '92%', maxWidth: '1100px', background: 'rgba(25, 25, 30, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '100px', padding: '12px 12px 12px 40px', display: 'flex', alignItems: 'center', backdropFilter: 'blur(40px)', boxShadow: '0 40px 100px rgba(0, 0, 0, 0.5)' };
const invisibleInput: React.CSSProperties = { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '18px', outline: 'none', padding: '12px 0', fontWeight: 400 };
const iconBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', fontSize: '24px', cursor: 'pointer', opacity: 0.5, padding: '12px', transition: '0.3s', display: 'flex', alignItems: 'center' };
const actionSendBtn: React.CSSProperties = { background: '#3572ef', color: 'white', border: 'none', padding: '14px 40px', borderRadius: '100px', fontWeight: 800, fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(20px)' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(30px)', color: '#fff' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };