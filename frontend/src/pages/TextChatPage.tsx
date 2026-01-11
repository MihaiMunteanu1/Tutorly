import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

// --- Updated Translation Dictionary with Dynamic Prompts ---
const TRANSLATIONS = {
  ro: {
    placeholder: "Trimite un mesaj...",
    empty: "Pregătit pentru o nouă sesiune.",
    send: "Trimite",
    back: "Înapoi",
    thinking: [
      "Analizez datele...",
      "Procesez răspunsul...",
      "Generez idei noi...",
      "Consult baza de date...",
      "Aproape gata...",
      "Sunt pe cale să răspund...",
      "Corelez informațiile..."
    ],
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    speak: "Vorbește",
  },
  en: {
    placeholder: "Message...",
    empty: "Ready for a new session.",
    send: "Send",
    back: "Back",
    thinking: [
      "Analyzing data...",
      "Processing response...",
      "Generating ideas...",
      "Consulting database...",
      "Almost there...",
      "Getting ready to respond...",
      "Synthesizing info..."
    ],
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    speak: "Speak",
  }
};

export function TextChatPage() {
  const navigate = useNavigate();
  const { token, setToken } = useAuth() as any;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const typingJobRef = useRef(0);
  const recognitionRef = useRef<any>(null);

  const t = TRANSLATIONS[lang];

  useEffect(() => { if (!token) navigate("/login"); }, [token, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  function toggleListening() {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechCtor) return;
    const recognition = new SpeechCtor();
    recognitionRef.current = recognition;
    recognition.lang = lang === 'ro' ? "ro-RO" : "en-US";
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join("");
      setText(transcript);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;
    typingJobRef.current++;

    // Randomize Thinking Prompt
    const thinkingPrompts = t.thinking;
    const randomPrompt = thinkingPrompts[Math.floor(Math.random() * thinkingPrompts.length)];

    const userMsg = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const thinkingId = crypto.randomUUID();
    setMessages(m => [...m, userMsg, { id: thinkingId, role: "assistant", text: randomPrompt }]);
    setText("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();
      setMessages(m => m.map(msg => msg.id === thinkingId ? { ...msg, text: "" } : msg));

      const jobId = ++typingJobRef.current;
      const fullText = data.text || "";
      let i = 0;
      while (i < fullText.length) {
        if (typingJobRef.current !== jobId) return;
        i = Math.min(fullText.length, i + 4);
        const partial = fullText.slice(0, i);
        setMessages(m => m.map(msg => msg.id === thinkingId ? { ...msg, text: partial } : msg));
        await new Promise(r => setTimeout(r, 8));
      }
    } catch {
      setMessages(m => m.map(x => x.id === thinkingId ? { ...x, text: "Error." } : x));
    }
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        .scroll-area {
          flex: 1; width: 100%; overflow-y: auto; padding-bottom: 220px; padding-top: 100px;
          scrollbar-width: none; -ms-overflow-style: none;
        }
        .scroll-area::-webkit-scrollbar { display: none; }

        .content-container { width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 40px; display: flex; flex-direction: column; gap: 48px; }

        .bubble {
          padding: 24px 32px;
          font-size: 17px;
          line-height: 1.7;
          border-radius: 28px;
          max-width: 80%;
          animation: slideUp 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
          position: relative;
        }

        .user-bubble {
          align-self: flex-end;
          background: linear-gradient(135deg, rgba(53, 114, 239, 0.12) 0%, rgba(53, 114, 239, 0.08) 100%);
          border: 1px solid rgba(53, 114, 239, 0.25);
          color: #fff;
          border-bottom-right-radius: 6px;
        }

        .ai-bubble {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: #a1a1a6;
          border-bottom-left-radius: 6px;
          backdrop-filter: blur(20px);
        }

        .bubble-label {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: rgba(255,255,255,0.3);
          margin-bottom: 12px;
          display: block;
        }

        .floating-back {
          position: fixed; top: 40px; left: 40px; z-index: 1000;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          color: rgba(255,255,255,0.6); padding: 10px 20px; border-radius: 100px; cursor: pointer;
          font-weight: 600; transition: 0.3s; backdrop-filter: blur(12px); font-size: 13px;
        }
        .floating-back:hover { background: rgba(255,255,255,0.08); color: #fff; transform: translateY(-2px); }

        .mic-btn.active { background: rgba(255, 69, 58, 0.15) !important; animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0.3); } 70% { box-shadow: 0 0 0 10px rgba(255, 69, 58, 0); } 100% { box-shadow: 0 0 0 0px rgba(255, 69, 58, 0); } }

        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <button className="floating-back" onClick={() => navigate("/mode")}>← {t.back}</button>

      <main className="scroll-area" ref={scrollRef}>
        <div className="content-container">
          {messages.length === 0 ? (
            <div style={heroEmptyState}>{t.empty}</div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`bubble ${m.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <span className="bubble-label">{m.role === 'user' ? 'User' : 'Assistant'}</span>
                {m.text}
              </div>
            ))
          )}
        </div>
      </main>

      <div style={inputDock}>
        <div style={inputConsole}>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={t.placeholder}
            style={invisibleInput}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingRight: '8px' }}>
             <button className={`mic-btn ${isListening ? 'active' : ''}`} onClick={toggleListening} style={iconBtnStyle}>🎙️</button>
             <button onClick={send} style={actionSendBtn}>{t.send}</button>
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

// --- Layout Styles ---
const pageWrapper: React.CSSProperties = { height: "100vh", width: "100%", background: "#020617", display: 'flex', flexDirection: 'column' };
const heroEmptyState: React.CSSProperties = { height: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.15, fontSize: '24px', fontWeight: 600, color: 'white' };
const inputDock: React.CSSProperties = { position: 'fixed', bottom: 0, left: 0, right: 0, padding: '50px 0', background: 'linear-gradient(transparent, #020617 80%)', display: 'flex', justifyContent: 'center', zIndex: 900 };
const inputConsole: React.CSSProperties = { width: '100%', maxWidth: '1000px', background: 'rgba(25, 25, 30, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '40px', padding: '12px 12px 12px 32px', display: 'flex', alignItems: 'center', backdropFilter: 'blur(40px)', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.5)' };
const invisibleInput: React.CSSProperties = { flex: 1, background: 'transparent', border: 'none', color: 'white', fontSize: '17px', outline: 'none', padding: '12px 0' };
const iconBtnStyle: React.CSSProperties = { background: 'transparent', border: 'none', fontSize: '22px', cursor: 'pointer', opacity: 0.6, padding: '10px', borderRadius: '50%', transition: '0.2s' };
const actionSendBtn: React.CSSProperties = { background: '#3572ef', color: 'white', border: 'none', padding: '14px 36px', borderRadius: '30px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(53, 114, 239, 0.3)' };
const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '30px', right: '30px', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(25, 25, 25, 0.8)', color: '#fff', backdropFilter: 'blur(10px)', cursor: 'pointer', fontSize: '24px' };
const settingsMenu: React.CSSProperties = { width: '240px', padding: '20px', borderRadius: '24px', background: 'rgba(28, 28, 30, 0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(30px)', color: '#fff', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow: '0 30px 60px rgba(0,0,0,0.5)' };
const settingsMenuHeader: React.CSSProperties = { fontSize: '15px', fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', fontWeight: 600 };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 };
const logoutActionBtn: React.CSSProperties = { background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)", color: "#fff", padding: "8px", borderRadius: "10px", cursor: 'pointer', display: 'flex', alignItems: 'center' };

export default TextChatPage;