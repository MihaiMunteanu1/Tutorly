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

type LiveSessionState = {
  sessionId?: string;
  sessionToken?: string;
  livekitUrl?: string;
  livekitClientToken?: string;
};

function getErrorMessage(e: unknown): string {
  let msg = e instanceof Error ? e.message : String(e);

  try {
    // Parse "Livechat start failed: 403 {...}"
    const openBrace = msg.indexOf('{');
    if (openBrace !== -1) {
      const prefix = msg.substring(0, openBrace).trim();
      const jsonPart = msg.substring(openBrace);
      const parsed = JSON.parse(jsonPart);

      if (parsed.detail) {
        let detail = parsed.detail;
        // detail might be a nested JSON string
        if (typeof detail === 'string' && detail.trim().startsWith('{')) {
           try { const inner = JSON.parse(detail); if (inner.message) detail = inner.message; } catch {}
        }
        return `${prefix} -> ${detail}`;
      }
    }
  } catch {}

  return msg;
}

type LivekitState = {
  room?: Room;
  connected?: boolean;
};

export function LiveChatPage() {
  const navigate = useNavigate();

  // IMPORTANT: aici trebuie să ai selecțiile tale (avatar/voice/contextId) din AuthContext
  const { token, avatar, voice, contextId } = useAuth() as any;

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("idle");

  const [session, setSession] = useState<LiveSessionState>({});
  const [lk, setLk] = useState<LivekitState>({});

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const micTrackRef = useRef<any>(null);
  const attachedAudioElsRef = useRef<HTMLAudioElement[]>([]);

  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(true);

  const hasAuth = useMemo(() => Boolean(token), [token]);

  useEffect(() => {
    if (!hasAuth) navigate("/login");
  }, [hasAuth, navigate]);



  function cleanupAttachedAudio() {
    for (const el of attachedAudioElsRef.current) {
      try {
        el.remove();
      } catch {
        // ignore
      }
    }
    attachedAudioElsRef.current = [];
  }

  async function disconnectLiveKit() {
    try {
      await lk.room?.disconnect();
    } catch {
      // ignore
    }
    setLk({});
    cleanupAttachedAudio();

    // curăță video element
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
      } catch {
        // ignore
      }
    }
  }

  async function connectLiveKitRoom(liveKitUrl: string, roomToken: string) {
    // cleanup previous
    await disconnectLiveKit();

    const room = new Room({
      adaptiveStream: true,
      dynacast: true,
    });

    room.on(RoomEvent.ConnectionStateChanged, (state) => {
      console.log("[LiveChat] LiveKit ConnectionState", state);
    });

    room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
      console.log("[LiveChat] TrackSubscribed", {
        kind: track.kind,
        sid: publication.trackSid,
        participant: participant.identity,
      });

      if (track.kind === Track.Kind.Video) {
        const v = videoRef.current;
        if (!v) return;

        // atașează direct pe <video ref={videoRef}>
        track.attach(v);
        v.autoplay = true;
        v.playsInline = true;
        v.muted = false;

        // încearcă play (poate fi blocat fără user gesture pentru audio)
        void v.play().catch(() => {});
        setStatus("running");
      }

      if (track.kind === Track.Kind.Audio) {
        const audioEl = track.attach() as HTMLAudioElement;
        audioEl.autoplay = true;
        audioEl.style.display = "none";
        document.body.appendChild(audioEl);
        attachedAudioElsRef.current.push(audioEl);
      }
    });

    room.on(RoomEvent.DataReceived, (payload, participant, _kind, topic) => {
      try {
        const txt = new TextDecoder().decode(payload);
        console.log("[LiveChat] DataReceived", { topic, from: participant?.identity, txt });
      } catch {
        console.log("[LiveChat] DataReceived (binary)", { topic, from: participant?.identity });
      }
    });

    await room.connect(liveKitUrl, roomToken, { autoSubscribe: true });
    setLk({ room, connected: true });

    console.log("[LiveChat] LiveKit connected. remoteParticipants=", room.remoteParticipants.size);
  }

  async function handleStart() {
    if (!token) return;

    setBusy(true);
    setErr(null);
    setStatus("creating token...");

    try {
      // 1) token cu avatar/voice/context alese
      const tokenResp = await livechatCreateToken(token, {
        //avatar_id: avatar?.id,
        //voice_id: voice?.id,
        context_id: contextId,
        mode: "FULL",
        language: "en",
      });

      setSession((s) => ({
        ...s,
        sessionId: tokenResp.session_id,
        sessionToken: tokenResp.session_token,
      }));

      // 2) start session
      setStatus("starting session...");
      const startResp = await livechatStart(token, tokenResp.session_token);

      setSession((s) => ({
        ...s,
        sessionId: startResp.session_id,
        livekitUrl: startResp.livekit_url,
        livekitClientToken: startResp.livekit_client_token,
      }));

      // 3) pornește agentul (plugin LiveAvatar) – fără el, de obicei nu apar track-uri
      if (startResp.livekit_agent_token) {
        await livechatAgentStart(token, {
          session_id: startResp.session_id,
          livekit_url: startResp.livekit_url,
          livekit_agent_token: startResp.livekit_agent_token,
          avatar_id: avatar?.id,
        });
      } else {
        console.log("[LiveChat] Missing livekit_agent_token from /api/livechat/start");
      }

      // 4) conectează LiveKit și atașează track-urile
      setStatus("connecting livekit...");
      await connectLiveKitRoom(startResp.livekit_url, startResp.livekit_client_token);

      // dacă nu vine video, status rămâne “connecting…” până la TrackSubscribed(video)
      // dar noi îl setăm „running” când vine video.
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function handleStop() {
    if (!token) return;

    setBusy(true);
    setErr(null);
    setStatus("stopping...");

    try {
      // oprește microfonul
      try {
        const track = micTrackRef.current;
        if (track && lk.room) {
          await lk.room.localParticipant.unpublishTrack(track).catch(() => {});
          track.stop?.();
        }
        micTrackRef.current = null;
      } catch {
        // ignore
      }
      setVoiceActive(false);
      setVoiceMuted(true);

      // disconnect LiveKit
      await disconnectLiveKit();

      // stop server session
      if (session.sessionId) {
        await livechatStop(token, session.sessionId);
      }

      // stop agent best effort
      if (session.sessionId) {
        try {
          await livechatAgentStop(token, session.sessionId);
        } catch {
          // ignore
        }
      }

      setSession({});
      setStatus("idle");
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
      setStatus("error");
    } finally {
      setBusy(false);
    }
  }

  async function handleVoiceToggle() {
    setBusy(true);
    setErr(null);

    try {
      const room = lk.room;
      if (!room) throw new Error("LiveKit not connected");

      if (!voiceActive) {
        const track = await createLocalAudioTrack();
        micTrackRef.current = track;
        await room.localParticipant.publishTrack(track);

        setVoiceActive(true);
        setVoiceMuted(false);
      } else {
        const track = micTrackRef.current;
        if (track) {
          await room.localParticipant.unpublishTrack(track).catch(() => {});
          track.stop?.();
        }
        micTrackRef.current = null;

        setVoiceActive(false);
        setVoiceMuted(true);
      }
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleMuteToggle() {
    setBusy(true);
    setErr(null);

    try {
      if (!voiceActive) throw new Error("Voice chat is not active");

      const track = micTrackRef.current;
      if (!track) throw new Error("No mic track");

      if (voiceMuted) {
        track.unmute?.();
        track.enabled = true;
        setVoiceMuted(false);
      } else {
        track.mute?.();
        track.enabled = false;
        setVoiceMuted(true);
      }
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const startDisabled =
    busy || status === "running" || status === "creating token..." || status === "starting session..." || status === "connecting livekit...";

  const stopDisabled = busy || status === "idle";

  return (
    <div style={page}>
      <div style={topBar}>
        <div style={{ display: "flex",height:50, alignItems: "center", gap: 16 }}>
          <button onClick={() => navigate("/mode")} style={btnSecondary}>
            ← Back
          </button>
          <div style={statusBadge}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              backgroundColor: status === "running" ? "#10b981" : (status === "error" ? "#ef4444" : "#f59e0b"),
              boxShadow: status === "running" ? "0 0 8px #10b981" : "none"
            }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {status}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button disabled={startDisabled} onClick={handleStart} style={startDisabled ? btnDisabled : btnPrimary}>
            Start session
          </button>

          <button disabled={stopDisabled} onClick={handleStop} style={stopDisabled ? btnDisabled : btnDanger}>
            Stop
          </button>
        </div>
      </div>

      {err && (
        <div style={errorBox}>
          <div style={{ fontSize: 18 }}>⚠️</div>
          <div><strong>Error:</strong> {err}</div>
        </div>
      )}

      <div style={layout}>
        <div style={leftPane}>
          <div style={card}>
            <div style={cardHeader}>
              <div style={cardTitle}>Avatar Stream</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button disabled={busy || status !== "running"} onClick={handleVoiceToggle} style={voiceActive ? btnActive : btnSecondarySmall}>
                  {voiceActive ? "Mic On 🎙️" : "Mic Off 🔇"}
                </button>
                <button disabled={busy || !voiceActive} onClick={handleMuteToggle} style={voiceMuted ? btnDangerSmall : btnSecondarySmall}>
                  {voiceMuted ? "Unmuted" : "Muted"}
                </button>
              </div>
            </div>
            <div style={avatarBox}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: status === "running" ? 1 : 0, transition: "opacity 0.5s" }} />
              {status !== "running" && (
                <div style={placeholderOverlay}>
                  <div style={{ color: "rgba(255,255,255,0.5)" }}>Waiting for session...</div>
                </div>
              )}
            </div>
            <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #334155", display: "flex", gap: 24, fontSize: 12, color: "#94a3b8" }}>
              <div>
                <span>Session: </span>
                <span style={{ fontFamily: "monospace", color: "#e2e8f0" }}>{session.sessionId || "—"}</span>
              </div>
              <div>
                <span>LiveKit: </span>
                <span style={{ fontFamily: "monospace", color: "#e2e8f0" }}>{session.livekitUrl || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- styles (nemodificate) ---
const page: React.CSSProperties = {
  minHeight: "100vh",
    width: 1500,
  padding: 24,
  background: "#0f172a",
  color: "#f8fafc",
  fontFamily: "'Inter', sans-serif", 
    borderRadius: 9
};

const topBar: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
  marginBottom: 18,
};

const layout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 18,
};

const leftPane: React.CSSProperties = { minWidth: 0 };

const card: React.CSSProperties = {
  background: "#1e293b",
  border: "1px solid #334155",
  borderRadius: 24,
  padding: 24,
  display: "flex",
  flexDirection: "column",
  height: "100%",
};

const cardHeader: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 16,
};

const cardTitle: React.CSSProperties = { fontWeight: 700, fontSize: 18, color: "#fff" };

const avatarBox: React.CSSProperties = {
  width: "100%",
  height: 600,
  borderRadius: 18,
  overflow: "hidden",
  background: "#020617",
  border: "1px solid #334155",
  position: "relative",
};

const placeholderOverlay: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
};

const btnBase: React.CSSProperties = {
  border: "none",
  borderRadius: 12,
  padding: "10px 20px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: 14,
  transition: "all 0.2s",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "#3b82f6",
  color: "#fff",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "#ef4444",
  color: "#fff",
};

const btnSecondary: React.CSSProperties = {
  ...btnBase,
  background: "#334155",
  color: "#e2e8f0",
};

const btnDisabled: React.CSSProperties = {
  ...btnBase,
  background: "#1e293b",
  color: "#64748b",
  cursor: "not-allowed",
  border: "1px solid #334155",
};

const btnActive: React.CSSProperties = {
  ...btnBase,
  background: "#10b981",
  color: "#fff",
  padding: "8px 14px",
  fontSize: 12,
};

const btnSecondarySmall: React.CSSProperties = {
  ...btnSecondary,
  padding: "8px 14px",
  fontSize: 12,
};

const btnDangerSmall: React.CSSProperties = {
  ...btnDanger,
  padding: "8px 14px",
  fontSize: 12,
};

const errorBox: React.CSSProperties = {
  marginBottom: 16,
  background: "#450a0a",
  border: "1px solid #991b1b",
  borderRadius: 12,
  padding: 16,
  color: "#fecaca",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const statusBadge: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  background: "#1e293b",
  padding: "6px 12px",
  borderRadius: 20,
  border: "1px solid #334155",
};
