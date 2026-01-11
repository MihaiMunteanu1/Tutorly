import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getJobStatus, uploadQuestion } from "../api";

type SpeechRecognitionType = typeof window extends { webkitSpeechRecognition: infer T }
  ? T
  : any;

export function ChatPage() {
  const { token, avatar, voice } = useAuth();
  const navigate = useNavigate();

  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [status, setStatus] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const [transcript, setTranscript] = useState<string>("");

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (!avatar) {
      navigate("/avatars");
    } else if (!voice) {
      navigate("/voices");
    }
  }, [token, avatar, voice, navigate]);

  if (!token || !avatar || !voice) return null;

  function startSpeechToText() {
    const AnyWindow = window as any;
    const SpeechRecognition: SpeechRecognitionType =
      AnyWindow.SpeechRecognition || AnyWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setStatus(
        "Speech-to-text is not supported in this browser. Try Chrome or Edge."
      );
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ro-RO";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: any) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      setTranscript(full.trim());
    };

    recognition.onerror = () => {
      // Keep status minimal; errors vary by browser permissions.
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopSpeechToText() {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }

  async function startRecording() {
    setStatus("");
    setVideoUrl(null);
    setAudioBlob(null);
    setTranscript("");

    startSpeechToText();

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
      stopSpeechToText();
      setStatus("Nu am acces la microfon. Verifică permisiunile browserului.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    stopSpeechToText();
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
          } else if (["failed", "error", "canceled"].includes(res.status.toLowerCase())) {
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
            <h2 style={{ margin: 0 }}>Întrebări vocale către {avatarFirstName}</h2>
            <p style={{ margin: 0, fontSize: 13, color: "#9ca3af" }}>
              Apasă “Start recording”, pune întrebarea, apoi “Generate answer”.
            </p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#9ca3af" }}>
              Voce: {voice.name}
            </p>
          </div>
        </div>

        <button
          className="button-secondary"
          onClick={() => navigate("/subjects")}
          style={{
            padding: "6px 12px",
            lineHeight: 1.1,
            fontSize: 13,
            minHeight: 0,
            height: 50,
          }}
        >
          Back
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 1.2fr)",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>
            Înregistrare întrebare
          </h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 0, marginBottom: 10 }}>
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
              onClick={() => {
                setAudioBlob(null);
                setTranscript("");
              }}
              disabled={!audioBlob && !transcript}
            >
              Șterge înregistrarea
            </button>
          </div>

          {(transcript || isRecording) && (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.4)",
                padding: 12,
                background: "rgba(15,23,42,0.7)",
                marginBottom: 10,
              }}
            >
              <p style={{ fontSize: 13, marginTop: 0, marginBottom: 6 }}>
                Text recunoscut:
              </p>
              <div style={{ fontSize: 13, color: "#e5e7eb", whiteSpace: "pre-wrap" }}>
                {transcript || (isRecording ? "Ascult..." : "")}
              </div>
            </div>
          )}

          {audioBlob && (
            <div
              style={{
                borderRadius: 12,
                border: "1px solid rgba(148,163,184,0.4)",
                padding: 12,
                background: "rgba(15,23,42,0.7)",
                marginBottom: 10,
              }}
            >
              <p style={{ fontSize: 13, marginTop: 0, marginBottom: 6 }}>
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
            <p style={{ marginTop: 12, fontSize: 13, color: "#e5e7eb" }}>
              {status}
            </p>
          )}
        </div>

        <div>
          <h3 style={{ marginTop: 0, marginBottom: 8, fontSize: 15 }}>
            Video răspuns
          </h3>
          <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 0, marginBottom: 10 }}>
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
              <video src={videoUrl} controls style={{ width: "100%", borderRadius: 12 }} />
            ) : (
              <span style={{ fontSize: 13, color: "#6b7280" }}>
                Încă nu ai generat niciun video. Înregistrează o întrebare și apasă
                “Generate answer”.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}