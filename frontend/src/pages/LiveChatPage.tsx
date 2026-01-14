import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import {
  livechatCreateToken,
  livechatStart,
  livechatStop,
  livechatAgentStart,
  livechatAgentStop,
} from "../api";
import { Room, RoomEvent, Track, createLocalAudioTrack } from "livekit-client";

// --- Translation Dictionary ---
const TRANSLATIONS = {
  ro: {
    title: "Sesiune Live",
    subtitle: "Conversație în timp real cu tutorul tău digital.",
    back: "Înapoi",
    start: "Începe Sesiunea",
    stop: "Încheie",
    micOn: "Microfon Pornit",
    micOff: "Microfon Oprit",
    initializing: "Se pregătește studioul...",
    connecting: "Se stabilește conexiunea...",
    error: "Eroare",
    settings: "Setări",
    languageLabel: "Limbă",
    logout: "Deconectare",
    readyToStart: "Sistemul este pregătit pentru dialog."
  },
  en: {
    title: "Live Session",
    subtitle: "Real-time conversation with your digital tutor.",
    back: "Back",
    start: "Start Session",
    stop: "Stop",
    micOn: "Mic On",
    micOff: "Mic Off",
    initializing: "Preparing studio...",
    connecting: "Establishing connection...",
    error: "Error",
    settings: "Settings",
    languageLabel: "Language",
    logout: "Logout",
    readyToStart: "The system is ready for dialog."
  }
};

function getErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e);
  try {
    const openBrace = msg.indexOf('{');
    if (openBrace !== -1) {
      const jsonPart = msg.substring(openBrace);
      const parsed = JSON.parse(jsonPart);
      if (parsed.detail) return parsed.detail;
    }
  } catch {}
  return msg;
}

export function LiveChatPage() {
  const navigate = useNavigate();
  const { token, setToken, avatar, selectionSource, liveAvatarId, liveAvatarVoiceId } = useAuth() as any;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  const [session, setSession] = useState<any>({});
  const [lk, setLk] = useState<any>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const micTrackRef = useRef<any>(null);
  const attachedAudioElsRef = useRef<HTMLAudioElement[]>([]);
  const [voiceActive, setVoiceActive] = useState(false);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    if (selectionSource !== "preset" || !liveAvatarId || !liveAvatarVoiceId) {
      navigate("/mode-selection", { replace: true });
    }
  }, [token, selectionSource, liveAvatarId, liveAvatarVoiceId, navigate]);

  // --- Logic Functions ---
  function cleanupAttachedAudio() {
    for (const el of attachedAudioElsRef.current) { try { el.remove(); } catch {} }
    attachedAudioElsRef.current = [];
  }
  async function disconnectLiveKit() {
    try { await lk.room?.disconnect(); } catch {}
    setLk({}); cleanupAttachedAudio();
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function connectLiveKitRoom(liveKitUrl: string, roomToken: string) {
    await disconnectLiveKit();
    const room = new Room({ adaptiveStream: true, dynacast: true });
    room.on(RoomEvent.TrackSubscribed, (track) => {
      if (track.kind === Track.Kind.Video) {
        const v = videoRef.current;
        if (!v) return;
        track.attach(v);
        v.autoplay = true; v.playsInline = true; v.muted = false;
        void v.play().catch(() => {});
        setStatus("running");
      }
      if (track.kind === Track.Kind.Audio) {
        const audioEl = track.attach() as HTMLAudioElement;
        audioEl.autoplay = true;
        document.body.appendChild(audioEl);
        attachedAudioElsRef.current.push(audioEl);
      }
    });
    await room.connect(liveKitUrl, roomToken, { autoSubscribe: true });
    setLk({ room, connected: true });
  }

  async function handleStart() {
    if (!token) return;
    setBusy(true); setErr(null); setStatus("initializing");
    try {
      const tokenResp = await livechatCreateToken(token, {
        avatar_id: liveAvatarId, voice_id: liveAvatarVoiceId, mode: "FULL", language: "en",
      });
      const startResp = await livechatStart(token, tokenResp.session_token);
      setSession({ sessionId: startResp.session_id, livekitUrl: startResp.livekit_url, livekitClientToken: startResp.livekit_client_token });
      if (startResp.livekit_agent_token) {
        await livechatAgentStart(token, {
          session_id: startResp.session_id, livekit_url: startResp.livekit_url,
          livekit_agent_token: startResp.livekit_agent_token, avatar_id: liveAvatarId,
        });
      }
      setStatus("connecting");
      await connectLiveKitRoom(startResp.livekit_url, startResp.livekit_client_token);
    } catch (e) { setErr(getErrorMessage(e)); setStatus("error"); } finally { setBusy(false); }
  }

  async function handleStop() {
    setBusy(true);
    try {
      if (micTrackRef.current && lk.room) { await lk.room.localParticipant.unpublishTrack(micTrackRef.current); micTrackRef.current.stop?.(); }
      micTrackRef.current = null; setVoiceActive(false);
      await disconnectLiveKit();
      if (session.sessionId) { await livechatStop(token, session.sessionId); try { await livechatAgentStop(token, session.sessionId); } catch {} }
      setSession({}); setStatus("idle");
    } catch (e) { setErr(getErrorMessage(e)); } finally { setBusy(false); }
  }

  const handleLogout = () => { setToken(null); navigate("/login"); };

  return (
    <div style={pageWrapper}>
      <style>{`
        html, body, #root { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background-color: #010409; }
        * { font-family: 'Inter', -apple-system, sans-serif; box-sizing: border-box; }
        
        .background-blobs { position: fixed; inset: -10%; width: 120vw; height: 120vh; overflow: hidden; z-index: 0; pointer-events: none; opacity: 0.6; }
        .blob { position: absolute; filter: blur(140px); border-radius: 50%; mix-blend-mode: screen; }
        .blob-1 { top: 10%; left: 15%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(53, 114, 239, 0.3) 0%, transparent 70%); animation: drift 25s infinite alternate ease-in-out; }
        .blob-2 { bottom: 10%; right: 10%; width: 45vw; height: 45vw; background: radial-gradient(circle, rgba(100, 50, 200, 0.2) 0%, transparent 70%); animation: drift 20s infinite alternate-reverse ease-in-out; }

        @keyframes drift {
          from { transform: translate(0, 0) scale(1) rotate(0deg); }
          to { transform: translate(100px, -80px) scale(1.1) rotate(15deg); }
        }

        .shimmer-btn {
          position: relative;
          overflow: hidden;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
        }
        .shimmer-btn::after {
          content: "";
          position: absolute;
          top: -50%; left: -50%;
          width: 200%; height: 200%;
          background: linear-gradient(
            45deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.2) 50%,
            rgba(255, 255, 255, 0) 60%,
            transparent 100%
          );
          transform: rotate(-45deg);
          animation: shimmer 4s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(-45deg); }
          20%, 100% { transform: translateX(100%) rotate(-45deg); }
        }
        
        .living-name {
          background: linear-gradient(180deg, #fff 0%, rgba(255,255,255,0.7) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .reveal-stage { animation: elegantEntry 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes elegantEntry {
          from { opacity: 0; filter: blur(10px); transform: scale(0.99) translateY(10px); }
          to { opacity: 1; filter: blur(0); transform: scale(1) translateY(0); }
        }

        .loader-ring { width: 56px; height: 56px; border: 2px solid rgba(255,255,255,0.05); border-top: 2px solid #3572ef; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="background-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div style={contentWrapper}>
        <div style={headerLayout}>
          <div style={{ flex: 1 }}>
            <h1 style={titleTypography}>{t.title}</h1>
            <p style={subtitleTypography}>{t.subtitle}</p>
          </div>
          <button onClick={() => navigate("/mode-selection")} style={refinedBackBtn}>{t.back}</button>
        </div>

        {err && <div style={errorBanner}><span>{err}</span></div>}

        <div style={mainDisplayArea}>
          {status === "idle" ? (
            <div className="reveal-stage" style={idleContainer}>
              <div style={nameGroup}>
                <span style={tutorTag}>System Online</span>
            <h2 className="living-name" style={tutorNameDisplay}>
              {(avatar?.name ?? "Judy").trim().split(/\s+/)[0]}
            </h2>
                  <div style={lineDecoration} />
                <p style={readyText}>{t.readyToStart}</p>
              </div>
              <button onClick={handleStart} className="shimmer-btn" style={startPrimaryBtn}>
                {t.start}
              </button>
            </div>
          ) : (
            <div className="reveal-stage" style={videoStageWrapper}>
              <div style={premiumVideoBox}>
                <video
                  ref={videoRef}
                  style={{
                    width: "100%", height: "100%", objectFit: "cover",
                    opacity: status === "running" ? 1 : 0, transition: "opacity 1.2s ease"
                  }}
                />

                {status !== "running" && (
                  <div style={loadingLayer}>
                    <div className="loader-ring" />
                    <p style={loadingLabelText}>
                      {status === "initializing" ? t.initializing : t.connecting}
                    </p>
                  </div>
                )}

                {status === "running" && (
                  <div style={dockIsland}>
                    <button
                      onClick={() => {
                        if (!lk.room) return;
                        if (!voiceActive) {
                          createLocalAudioTrack().then(track => {
                            micTrackRef.current = track;
                            lk.room!.localParticipant.publishTrack(track);
                            setVoiceActive(true);
                          });
                        } else {
                          lk.room.localParticipant.unpublishTrack(micTrackRef.current);
                          micTrackRef.current.stop();
                          setVoiceActive(false);
                        }
                      }}
                      style={voiceActive ? activePill : glassPill}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{marginRight: 8}}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
                      {voiceActive ? t.micOn : t.micOff}
                    </button>

                    <div style={verticalDivider} />
                    <button onClick={handleStop} style={stopActionBtn}>{t.stop}</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Settings FAB */}
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
                <span style={{ color: '#ff453a', cursor: 'pointer', fontWeight: 600 }} onClick={handleLogout}>{t.logout}</span>
            </div>
          </div>
        )}
        <button onClick={() => setSettingsOpen(!settingsOpen)} style={settingsFab}>{settingsOpen ? '✕' : '⚙'}</button>
      </div>
    </div>
  );
}

// --- Style Objects (Ultra-Minimalist) ---
const pageWrapper: React.CSSProperties = { height: "100dvh", width: "100vw", display: "flex", justifyContent: "center", position: 'relative', overflow: 'hidden' };
const contentWrapper: React.CSSProperties = { maxWidth: "1600px", width: "94%", zIndex: 1, display: 'flex', flexDirection: 'column', padding: '40px 0' };
const headerLayout: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "40px" };
const titleTypography: React.CSSProperties = { fontSize: "40px", fontWeight: 800, letterSpacing: "-0.05em", margin: 0, color: "#ffffff" };
const subtitleTypography: React.CSSProperties = { fontSize: "16px", color: "#6e7681", marginTop: "8px", fontWeight: 500 };
const refinedBackBtn: React.CSSProperties = { height: "44px", padding: "0 24px", borderRadius: "100px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "#fff", fontWeight: 700, cursor: 'pointer', backdropFilter: 'blur(10px)' };

const mainDisplayArea: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' };

const idleContainer: React.CSSProperties = { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '60px' };
const nameGroup: React.CSSProperties = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
const tutorTag: React.CSSProperties = { color: '#3572ef', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: '11px', marginBottom: '20px' };
const tutorNameDisplay: React.CSSProperties = { fontSize: '110px', fontWeight: 800, margin: 0, letterSpacing: '-0.06em', lineHeight: 1 };
const lineDecoration: React.CSSProperties = { width: '40px', height: '2px', background: '#3572ef', margin: '40px 0', borderRadius: '2px' };
const readyText: React.CSSProperties = { color: '#6e7681', fontSize: '16px', fontWeight: 500 };

const startPrimaryBtn: React.CSSProperties = {
  height: '68px', padding: '0 56px', borderRadius: '100px',
  background: '#3572ef', color: '#fff', border: 'none',
  fontSize: '18px', fontWeight: 800, cursor: 'pointer',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), inset 0 0 0 1px rgba(255,255,255,0.1)'
};

const videoStageWrapper: React.CSSProperties = { width: '100%', height: '100%' };
const premiumVideoBox: React.CSSProperties = {
  width: '100%', height: '100%', borderRadius: '56px', overflow: 'hidden',
  background: '#000', border: '1px solid rgba(255,255,255,0.08)', position: 'relative',
  boxShadow: '0 60px 120px rgba(0,0,0,0.6), inset 0 0 100px rgba(0,0,0,0.5)'
};

const loadingLayer: React.CSSProperties = { position: 'absolute', inset: 0, background: '#010409', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' };
const loadingLabelText: React.CSSProperties = { marginTop: '24px', fontSize: '15px', fontWeight: 600, color: '#6e7681', letterSpacing: '0.05em' };

const dockIsland: React.CSSProperties = {
  position: 'absolute', bottom: '40px', left: '50%', transform: 'translateX(-50%)',
  display: 'flex', alignItems: 'center', gap: '16px', padding: '10px 14px',
  background: 'rgba(20, 20, 22, 0.7)', backdropFilter: 'blur(40px)',
  borderRadius: '100px', border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 30px 60px rgba(0,0,0,0.5)'
};

const glassPill: React.CSSProperties = { background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const activePill: React.CSSProperties = { background: '#3572ef', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '100px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center' };
const stopActionBtn: React.CSSProperties = { background: 'transparent', color: '#ff453a', border: 'none', padding: '10px 16px', fontWeight: 800, fontSize: '13px', cursor: 'pointer' };
const verticalDivider: React.CSSProperties = { width: '1px', background: 'rgba(255,255,255,0.1)', height: '24px', margin: '0 4px' };

const settingsContainer: React.CSSProperties = { position: 'fixed', bottom: '40px', right: '40px', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' };
const settingsFab: React.CSSProperties = { width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(28, 28, 30, 0.8)', border: '1px solid rgba(255,255,255,0.08)', color: '#fff', fontSize: '20px', cursor: 'pointer', backdropFilter: 'blur(20px)' };
const settingsMenu: React.CSSProperties = { width: '220px', padding: '16px', background: 'rgba(13, 17, 23, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', backdropFilter: 'blur(30px)', color: '#fff' };
const settingsRow: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', fontSize: '13px' };
const toggleGroup: React.CSSProperties = { display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', padding: '2px' };
const langToggleBtn: React.CSSProperties = { border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' };
const errorBanner: React.CSSProperties = { background: 'rgba(255,69,58,0.1)', border: '1px solid rgba(255, 69, 58, 0.3)', color: '#ff453a', padding: '14px 24px', borderRadius: '16px', marginBottom: '24px', fontWeight: 600, fontSize: '14px' };