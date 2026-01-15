import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const API_URL = "https://avatar-server-gxmj.onrender.com";

const TRANSLATIONS = {
  ro: {
    placeholder: "Trimite un mesaj...",
    empty: "Sistem pregătit. Inițiază dialogul.",
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
    copy: "Copiază",
    copied: "Copiat!"
  },
  en: {
    placeholder: "Message...",
    empty: "System ready. Initiate dialogue.",
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
    copy: "Copy",
    copied: "Copied!"
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

export function TextChatPage() {
  const navigate = useNavigate();
  const { token, setToken } = useAuth() as any;

  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopy = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

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

    const userMsg = { id: crypto.randomUUID(), role: "user", text: trimmed };
    const thinkingId = crypto.randomUUID();

    setMessages(m => [...m, userMsg, { id: thinkingId, role: "assistant", text: "", isProcessing: true }]);
    setText("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: trimmed }),
      });
      const data = await res.json();

      const jobId = ++typingJobRef.current;
      const fullText = data.text || "";

      setMessages(m => m.map(msg => msg.id === thinkingId ? { ...msg, isProcessing: false } : msg));

      let i = 0;
      while (i < fullText.length) {
        if (typingJobRef.current !== jobId) return;
        i += 1;
        const partial = fullText.slice(0, i);
        setMessages(m => m.map(msg => msg.id === thinkingId ? { ...msg, text: partial } : msg));
        await new Promise(r => setTimeout(r, 25));
      }
    } catch {
      setMessages(m => m.map(x => x.id === thinkingId ? { ...x, text: "Error.", isProcessing: false } : x));
    }
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  return (
    <div style={pageWrapper}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
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
        .user-bubble { align-self: flex-end; background: linear-gradient(135deg, rgba(53, 114, 239, 0.2) 0%, rgba(53, 114, 239, 0.1) 100%); border: 1px solid rgba(53, 114, 239, 0.3); color: #fff; border-bottom-right-radius: 4px; box-shadow: 0 20px 40px rgba(0,0,0,0.2); }
        .ai-bubble { align-self: flex-start; background: rgba(255, 255, 255, 0.04); border: 1px solid rgba(255, 255, 255, 0.08); color: #f0f0f5; border-bottom-left-radius: 4px; width: 100%; max-width: 1000px; box-shadow: 0 40px 80px rgba(0,0,0,0.3); font-weight: 300; letter-spacing: 0.01em; }

        .bubble-label { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; color: #3572ef; margin-bottom: 16px; display: block; }
        
        .dot { width: 8px; height: 8px; background: #3572ef; border-radius: 50%; animation: jump 1.4s infinite ease-in-out; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes jump { 0%, 80%, 100% { transform: translateY(0); opacity: 0.3; } 40% { transform: translateY(-8px); opacity: 1; } }

        .floating-back { position: fixed; top: 40px; left: 40px; z-index: 1000; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 12px 24px; border-radius: 100px; cursor: pointer; font-weight: 700; transition: 0.3s; backdrop-filter: blur(12px); }
        .floating-back:hover { background: rgba(255,255,255,0.08); transform: translateY(-2px); border-color: rgba(255,255,255,0.2); }

        /* PREMIIUM COPY BUTTON */
        .copy-btn {
          position: absolute; top: 24px; right: 24px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(8px);
          color: rgba(255, 255, 255, 0.5);
          padding: 8px 14px; border-radius: 12px;
          font-size: 11px; font-weight: 700; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex; align-items: center; gap: 6px;
          opacity: 0; transform: translateY(-5px);
        }
        .ai-bubble:hover .copy-btn { opacity: 1; transform: translateY(0); }
        .copy-btn:hover { background: rgba(255, 255, 255, 0.1); color: #fff; border-color: rgba(255, 255, 255, 0.2); }
        .copy-btn.copied { background: rgba(48, 209, 88, 0.15); color: #30d158; border-color: rgba(48, 209, 88, 0.3); opacity: 1; transform: translateY(0); }

        .shimmer-btn { position: relative; overflow: hidden; }
        .shimmer-btn::after {
          content: ""; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
          background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%);
          transform: rotate(-45deg); animation: shimmer 5s infinite;
        }
        @keyframes shimmer { 0% { transform: translateX(-100%) rotate(-45deg); } 20%, 100% { transform: translateX(100%) rotate(-45deg); } }

        .ai-bubble p { margin: 0 0 16px 0; }
        .ai-bubble p:last-child { margin-bottom: 0; }
      `}</style>

      <div className="background-blobs"><div className="blob blob-1" /><div className="blob blob-2" /></div>

      <button className="floating-back" onClick={() => navigate("/mode-selection")}>← {t.back}</button>

      <main className="scroll-area" ref={scrollRef}>
        <div className="content-container">
          {messages.length === 0 ? (
            <div style={heroEmptyState}>{t.empty}</div>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`bubble elegant-entry ${m.role === 'user' ? 'user-bubble' : 'ai-bubble'}`}>
                <span className="bubble-label">{m.role === 'user' ? 'Human Query' : 'Expert Synthesis'}</span>

                {/* AI COPY BUTTON */}
                {m.role === 'assistant' && !m.isProcessing && m.text && (
                  <button
                    className={`copy-btn ${copiedId === m.id ? 'copied' : ''}`}
                    onClick={() => handleCopy(m.text, m.id)}
                  >
                    {copiedId === m.id ? (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                        {t.copied}
                      </>
                    ) : (
                      <>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        {t.copy}
                      </>
                    )}
                  </button>
                )}

                {m.isProcessing ? (
                  <>
                    <DynamicThinkingText lang={lang} />
                    <div style={{ display: 'flex', gap: '6px', marginTop: '20px', alignItems: 'center' }}>
                      <div className="dot" /><div className="dot" /><div className="dot" />
                    </div>
                  </>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      code(props: any) {
                        const { children, className, ...rest } = props;
                        const match = /language-(\w+)/.exec(className || '');
                        return match ? (
                          <SyntaxHighlighter
                            {...rest}
                            PreTag="div"
                            children={String(children).replace(/\n$/, '')}
                            language={match[1]}
                            style={vscDarkPlus}
                          />
                        ) : (
                          <code {...rest} className={className}>{children}</code>
                        );
                      }
                    }}
                  >
                    {m.text}
                  </ReactMarkdown>
                )}
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
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingRight: '8px' }}>
             <button className={`mic-btn ${isListening ? 'active' : ''}`} onClick={toggleListening} style={iconBtnStyle}>
               🎙️
             </button>
             <button onClick={send} className="shimmer-btn" style={{ ...actionSendBtn, opacity: text.trim() ? 1 : 0.3 }}>{t.send}</button>
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

// --- Layout Styles ---
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