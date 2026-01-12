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
  if (e instanceof Error) return e.message;
  return String(e);
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
  const [inputText, setInputText] = useState<string>("");

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
        avatar_id: avatar?.id,
        voice_id: voice?.id,
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

  async function handleSendText() {
    const text = inputText.trim();
    if (!text) return;

    setBusy(true);
    setErr(null);

    try {
      const room = lk.room;
      if (!room) throw new Error("LiveKit not connected");

      // comanda către agent (FULL mode)
      const payload = { event_type: "avatar.speak_text", text };
      const bytes = new TextEncoder().encode(JSON.stringify(payload));

      await room.localParticipant.publishData(bytes, {
        reliable: true,
        topic: "agent-control",
      });

      setInputText("");
    } catch (e: unknown) {
      setErr(getErrorMessage(e));
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
        <button onClick={() => navigate("/mode")} style={btnSecondary}>
          ← Back
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ color: "#a1a1a6", fontSize: 13 }}>Status: {status}</span>

          <button disabled={startDisabled} onClick={handleStart} style={btnPrimary}>
            Start session
          </button>

          <button disabled={stopDisabled} onClick={handleStop} style={btnDanger}>
            Stop
          </button>

          <button disabled={busy || status !== "running"} onClick={handleVoiceToggle} style={btnPrimary}>
            {voiceActive ? "Stop Voice" : "Start Voice"}
          </button>

          <button disabled={busy || !voiceActive} onClick={handleMuteToggle} style={btnSecondary}>
            {voiceMuted ? "Unmute" : "Mute"}
          </button>
        </div>
      </div>

      {err && (
        <div style={errorBox}>
          <strong>LiveChat error:</strong> {err}
        </div>
      )}

      <div style={layout}>
        <div style={leftPane}>
          <div style={card}>
            <div style={cardTitle}>Avatar</div>
            <div style={avatarBox}>
              <video ref={videoRef} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div style={{ marginTop: 10, color: "#8e8e93", fontSize: 12 }}>
              Tip: click pe "Start Voice" și acceptă permisiunea de microfon.
            </div>
          </div>
        </div>

        <div style={rightPane}>
          <div style={card}>
            <div style={cardTitle}>Text to avatar</div>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Scrie un mesaj pentru avatar…"
                style={input}
              />
              <button disabled={busy || status !== "running"} onClick={handleSendText} style={btnPrimary}>
                Send
              </button>
            </div>

            <div style={{ marginTop: 14, padding: 12, borderRadius: 14, border: "1px solid rgba(255,255,255,0.08)", color: "#c7c7cc", fontSize: 12 }}>
              <div>
                <strong>Session:</strong> {session.sessionId || "-"}
              </div>
              <div style={{ wordBreak: "break-all" }}>
                <strong>LiveKit Url:</strong> {session.livekitUrl || "-"}
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
  padding: 24,
  background: "radial-gradient(circle at top, #1e293b 0, #020617 55%)",
  color: "#fff",
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
  gridTemplateColumns: "1.3fr 1fr",
  gap: 18,
};

const leftPane: React.CSSProperties = { minWidth: 0 };
const rightPane: React.CSSProperties = { minWidth: 0 };

const card: React.CSSProperties = {
  background: "rgba(28, 28, 30, 0.6)",
  border: "1px solid rgba(255, 255, 255, 0.08)",
  borderRadius: 24,
  padding: 18,
  backdropFilter: "blur(20px)",
};

const cardTitle: React.CSSProperties = { fontWeight: 800, marginBottom: 12 };

const avatarBox: React.CSSProperties = {
  width: "100%",
  minHeight: 520,
  borderRadius: 18,
  overflow: "hidden",
  background: "rgba(0,0,0,0.35)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const input: React.CSSProperties = {
  flex: 1,
  padding: "12px 14px",
  borderRadius: 14,
  border: "1px solid rgba(255,255,255,0.12)",
  background: "rgba(0,0,0,0.35)",
  color: "#fff",
  outline: "none",
};

const btnBase: React.CSSProperties = {
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: 14,
  padding: "10px 14px",
  cursor: "pointer",
  color: "#fff",
  background: "rgba(255,255,255,0.06)",
};

const btnPrimary: React.CSSProperties = {
  ...btnBase,
  background: "rgba(53, 114, 239, 0.25)",
  borderColor: "rgba(53, 114, 239, 0.45)",
};

const btnDanger: React.CSSProperties = {
  ...btnBase,
  background: "rgba(255, 69, 58, 0.18)",
  borderColor: "rgba(255, 69, 58, 0.45)",
};

const btnSecondary: React.CSSProperties = { ...btnBase };

const errorBox: React.CSSProperties = {
  marginBottom: 16,
  background: "rgba(255, 69, 58, 0.1)",
  border: "1px solid rgba(255, 69, 58, 0.35)",
  borderRadius: 16,
  padding: 12,
};
