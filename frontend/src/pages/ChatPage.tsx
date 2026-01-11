import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { getJobStatus, uploadQuestion } from "../api";

interface Message {
  id: string;
  sender: "user" | "bot";
  type: "text" | "audio" | "video";
  content?: string;
  status?: "pending" | "completed" | "failed";
}

export function ChatPage() {
  const { token, avatar, voice } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // NEW: Toggle for Video vs Text
  const [useVideoResponse, setUseVideoResponse] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  useEffect(() => {
    if (!token) navigate("/login");
    else if (!avatar) navigate("/avatars");
    else if (!voice) navigate("/voices");
  }, [token, avatar, voice, navigate]);

  if (!token || !avatar || !voice) return null;

  // --- STREAMING LOGIC ---
  const simulateStreaming = (fullText: string, messageId: string) => {
    const words = fullText.split(" ");
    let currentText = "";
    let index = 0;

    const interval = setInterval(() => {
      if (index < words.length) {
        currentText += words[index] + " ";
        updateMessage(messageId, {
          content: currentText,
          status: "completed",
          type: "text"
        });
        index++;
      } else {
        clearInterval(interval);
        setIsProcessing(false);
      }
    }, 70); // Adjust speed here (ms per word)
  };

  // --- RECORDING LOGIC ---
  async function startRecording() {
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        handleSend(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch {
      alert("Nu am acces la microfon.");
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  // --- MESSAGE HANDLING ---
  async function handleSend(audioBlob?: Blob) {
    if (!inputText.trim() && !audioBlob) return;

    const userMsgId = Date.now().toString();
    const botMsgId = (Date.now() + 1).toString();

    const userMsg: Message = {
      id: userMsgId,
      sender: "user",
      type: audioBlob ? "audio" : "text",
      content: audioBlob ? URL.createObjectURL(audioBlob) : inputText,
    };

    const botMsg: Message = {
      id: botMsgId,
      sender: "bot",
      type: useVideoResponse ? "video" : "text",
      status: "pending",
      content: "",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Logic assumes uploadQuestion might need to be adjusted later
      // to return text immediately if you want text-only mode
      const { job_id } = await uploadQuestion(
        token!,
        avatar!.id,
        voice!.id,
        audioBlob || new Blob()
      );

      if (useVideoResponse) {
        // VIDEO MODE: Poll HeyGen
        const interval = setInterval(async () => {
          try {
            const res = await getJobStatus(token!, job_id);
            if (res.status === "completed" && res.video_url) {
              updateMessage(botMsgId, { status: "completed", content: res.video_url });
              clearInterval(interval);
              setIsProcessing(false);
            } else if (["failed", "error", "canceled"].includes(res.status.toLowerCase())) {
              updateMessage(botMsgId, { status: "failed" });
              clearInterval(interval);
              setIsProcessing(false);
            }
          } catch {
            clearInterval(interval);
            setIsProcessing(false);
          }
        }, 4000);
      } else {
        // TEXT MODE:
        // Note: For now, we simulate a text response.
        // In a real scenario, your backend should return the text string here.
        const mockResponse = "Acesta este un răspuns text simulat de la tutorul tău AI, generat cuvânt cu cuvânt.";
        simulateStreaming(mockResponse, botMsgId);
      }
    } catch (err) {
      updateMessage(botMsgId, { status: "failed" });
      setIsProcessing(false);
    }
  }

  function updateMessage(id: string, updates: Partial<Message>) {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }

  return (
    <div className="card" style={{
      width: 960, height: "85vh", display: "flex", flexDirection: "column",
      marginTop: 20, padding: 0, overflow: "hidden"
    }}>

      {/* HEADER */}
      <div style={{
        padding: "16px 24px", borderBottom: "1px solid rgba(148,163,184,0.2)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "rgba(15,23,42,0.9)"
      }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <img
            src={avatar.image_url ?? ""} alt={avatar.name}
            style={{ width: 45, height: 45, borderRadius: "50%", objectFit: "cover", border: "1px solid #3b82f6" }}
          />
          <div>
            <h3 style={{ margin: 0, fontSize: 16 }}>{avatar.name}</h3>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>Voce: {voice.name}</span>
          </div>
        </div>

        {/* NEW: MODE TOGGLE */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(30,41,59,0.5)", padding: "4px 12px", borderRadius: 20 }}>
          <span style={{ fontSize: 12, color: !useVideoResponse ? "#fff" : "#6b7280" }}>Text</span>
          <div
            onClick={() => setUseVideoResponse(!useVideoResponse)}
            style={{
              width: 40, height: 20, background: useVideoResponse ? "#3b82f6" : "#475569",
              borderRadius: 10, position: "relative", cursor: "pointer", transition: "0.3s"
            }}
          >
            <div style={{
              width: 16, height: 16, background: "white", borderRadius: "50%",
              position: "absolute", top: 2, left: useVideoResponse ? 22 : 2, transition: "0.3s"
            }} />
          </div>
          <span style={{ fontSize: 12, color: useVideoResponse ? "#fff" : "#6b7280" }}>Video</span>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{
        flex: 1, overflowY: "auto", padding: "24px", display: "flex",
        flexDirection: "column", gap: 20, background: "linear-gradient(to bottom, transparent, rgba(15,23,42,0.5))"
      }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "70%", padding: "12px 16px", borderRadius: 18,
              background: msg.sender === "user" ? "#3b82f6" : "rgba(30,41,59,0.8)",
              border: msg.sender === "bot" ? "1px solid rgba(148,163,184,0.2)" : "none",
              color: "white"
            }}>
              {msg.type === "text" && <p style={{ margin: 0, fontSize: 14, lineHeight: "1.5" }}>{msg.content}</p>}
              {msg.type === "audio" && <audio src={msg.content ?? ""} controls style={{ height: 32 }} />}
              {msg.type === "video" && (
                <div style={{ minWidth: 280 }}>
                  {msg.status === "pending" ? (
                    <div style={{ padding: 10, fontSize: 13, color: "#9ca3af" }}>⚡ {avatar.name} generează video...</div>
                  ) : msg.status === "failed" ? (
                    <div style={{ color: "#f97373", fontSize: 13 }}>Eroare la generare video.</div>
                  ) : (
                    <video src={msg.content ?? ""} controls autoPlay style={{ width: "100%", borderRadius: 12 }} />
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* INPUT AREA */}
      <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(148,163,184,0.2)", background: "rgba(15,23,42,0.95)" }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className="button-primary"
            disabled={isProcessing}
            style={{ width: 50, height: 50, borderRadius: "50%", padding: 0, background: isRecording ? "#ef4444" : undefined }}
          >
            {isRecording ? "⏹️" : "🎙️"}
          </button>
          <input
            className="input-field"
            placeholder="Scrie o întrebare..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isProcessing && handleSend()}
            disabled={isProcessing}
            style={{ flex: 1, borderRadius: 25, padding: "12px 20px" }}
          />
          <button
            className="button-primary"
            onClick={() => handleSend()}
            disabled={isProcessing || (!inputText.trim() && !isRecording)}
            style={{ borderRadius: 25, padding: "10px 20px" }}
          >
            Trimite
          </button>
        </div>
      </div>
    </div>
  );
}