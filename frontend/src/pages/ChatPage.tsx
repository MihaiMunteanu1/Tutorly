
import React, {useEffect, useRef, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getJobStatus, uploadQuestion } from "../api";

export function ChatPage() {
  const { token, avatar, voice } = useAuth();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);



  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (!avatar) {
      navigate("/avatars");
    } else if (!voice) {
      navigate("/voices");
    }
  }, [token, avatar, voice, navigate]);

  // Dacă nu avem toate datele, nu randăm (redirect-ul se face în useEffect)
  if (!token || !avatar || !voice) {
    return null;
  }

  async function startRecording() {
    setStatus("");
    setVideoUrl(null);
    setAudioBlob(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      setStatus("Nu am acces la microfon. Verifică permisiunile browserului.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function handleGenerate() {
    if (!audioBlob) {
      setStatus("Nu există înregistrare audio.");
      return;
    }
    setStatus("Trimit întrebarea la server...");
    try {
      const { job_id } = await uploadQuestion(
        token!,
        avatar!.id,
        voice!.id,
        audioBlob
      );
      setStatus("Întrebarea a fost trimisă. Aștept să fie generat video-ul...");

      const interval = setInterval(async () => {
        try {
          const res = await getJobStatus(token!, job_id);
          setStatus(`Status: ${res.status}`);

          if (res.status === "completed" && res.video_url) {
            setVideoUrl(res.video_url);
            clearInterval(interval);
          } else if (
            ["failed", "error", "canceled"].includes(res.status.toLowerCase())
          ) {
            clearInterval(interval);
          }
        } catch {
          clearInterval(interval);
        }
      }, 5000);
    } catch {
      setStatus("Eroare la trimiterea întrebării.");
    }
  }
    function getFirstName(fullName: string) {
      const trimmed = fullName.trim();
      if (!trimmed) return "";
      return trimmed.split(/\s+/)[0] ?? trimmed;
    }

    const avatarFirstName = getFirstName(avatar.name);


  return (
    <div className="card" style={{ width: 960, marginTop: 20 }}>
      {/* Header cu avatar + voce */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 12 }}>
          <div
            style={{
              width: 60,
              height: 90,
              borderRadius: 12,
              overflow: "hidden",
              border: "1px solid rgba(148,163,184,0.7)",
              background: "rgba(15,23,42,0.8)",
            }}
          >
            {avatar.image_url ? (
              <img
                src={avatar.image_url}
                alt={avatar.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  color: "#9ca3af",
                }}
              >
                {avatar.name}
              </div>
            )}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>
              Întrebări vocale către {avatarFirstName}
            </h2>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              Apasă “Start recording”, pune întrebarea, apoi “Generate answer”.
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 11,
                color: "#6b7280",
              }}
            >
              {/*Avatar ID: {avatar.id}*/}
              {/*{" · "}*/}
             <p style={{fontSize: 12, color: "#9ca3af"}}>  Voce: {voice.name}</p>
            </p>
          </div>
        </div>
        {/*<div style={{ fontSize: 12, color: "#9ca3af" }}>Pasul 3 din 3</div>*/}
          <button
  className="button-secondary"
  onClick={() => navigate("/subjects")}
  style={{
    padding: "6px 12px",   // smaller vertical padding => smaller height
    lineHeight: 1.1,
    fontSize: 13,
    minHeight: 0,          // avoid any enforced min-height
    height: 50,
  }}
>
  Back
</button>

      </div>

      {/* Layout 2 coloane: stânga audio, dreapta video */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.2fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        {/* Col stânga – înregistrare audio */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>
            Înregistrare întrebare
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            Max ~8 secunde.
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
            {!isRecording ? (
              <button className="button-primary" onClick={startRecording}>
                🎙️ Start recording
              </button>
            ) : (
              <button className="button-primary" onClick={stopRecording}>
                ⏹️ Stop
              </button>
            )}
            <button
              className="button-secondary"
              onClick={() => setAudioBlob(null)}
              disabled={!audioBlob}
            >
              Șterge înregistrarea
            </button>
          </div>

          {audioBlob && (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.4)",
                padding: 12,
                background: "rgba(15,23,42,0.7)",
              }}
            >
              <p
                style={{
                  fontSize: 13,
                  marginTop: 0,
                  marginBottom: 6,
                }}
              >
                Înregistrare gata. Poți asculta sau genera răspunsul.
              </p>
              <audio controls src={URL.createObjectURL(audioBlob)} />
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <button
              className="button-primary"
              onClick={handleGenerate}
              disabled={!audioBlob}
            >
              🚀 Generate answer (avatar video)
            </button>
          </div>

          {status && (
            <p
              style={{
                marginTop: 12,
                fontSize: 13,
                color: "#e5e7eb",
              }}
            >
              {status}
            </p>
          )}
        </div>

        {/* Col dreapta – video răspuns */}
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>
            Video răspuns
          </h3>
          <p
            style={{
              fontSize: 13,
              color: "#9ca3af",
              marginTop: 0,
              marginBottom: 10,
            }}
          >
            Când se termină randarea, video-ul va apărea aici.
          </p>
          <div
            style={{
              borderRadius: 16,
              border: "1px solid rgba(148,163,184,0.4)",
              padding: 12,
              background: "rgba(15,23,42,0.7)",
              minHeight: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {videoUrl ? (
              <video
                src={videoUrl}
                controls
                style={{ width: "100%", borderRadius: 12 }}
              />
            ) : (
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Încă nu ai generat niciun video. Înregistrează o întrebare și
                apasă “Generate answer”.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
