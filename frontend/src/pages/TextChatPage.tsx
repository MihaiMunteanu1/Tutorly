import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const API_URL = "http://localhost:8000";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ChatResponse = {
  text: string;
};

type AuthAvatar = { name?: string | null };
type AuthShape = { token: string | null; avatar?: AuthAvatar | null };

function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

/**
 * Minimal Web Speech API typings (so TS stops erroring even if lib.dom.d.ts lacks these).
 */
type SpeechRecognitionErrorCode =
  | "no-speech"
  | "aborted"
  | "audio-capture"
  | "network"
  | "not-allowed"
  | "service-not-allowed"
  | "bad-grammar"
  | "language-not-supported"
  | string;

type SpeechRecognitionAlternative = { transcript: string; confidence?: number };

type SpeechRecognitionResult = {
  readonly isFinal: boolean;
  readonly length: number;
  [index: number]: SpeechRecognitionAlternative;
};

type SpeechRecognitionResultList = {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
};

type SpeechRecognitionEventLike = { results: SpeechRecognitionResultList };

type SpeechRecognitionErrorEventLike = { error?: SpeechRecognitionErrorCode };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: ((this: SpeechRecognitionLike, ev?: Event) => unknown) | null;
  onresult: ((this: SpeechRecognitionLike, ev: SpeechRecognitionEventLike) => unknown) | null;
  onerror:
    | ((this: SpeechRecognitionLike, ev: SpeechRecognitionErrorEventLike) => unknown)
    | null;
  onend: ((this: SpeechRecognitionLike, ev?: Event) => unknown) | null;
  start(): void;
  stop(): void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function TextChatPage() {
  const navigate = useNavigate();
  const { token, avatar } = useAuth() as unknown as AuthShape;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  // Used to cancel an in-progress typing animation when a new send happens.
  const typingJobRef = useRef(0);

  const title = useMemo(() => {
    const name = (avatar?.name ?? "").trim();
    return name ? `Chat` : "Chat";
  }, [avatar]);

  const speechSupported = useMemo(() => Boolean(getSpeechRecognitionCtor()), []);

  if (!token) {
    navigate("/login");
    return null;
  }

  async function typeIntoMessage(messageId: string, fullText: string) {
    const jobId = ++typingJobRef.current;

    // Tune these for speed.
    const chunkSize = 2; // characters per tick
    const delayMs = 18; // ms between ticks

    let i = 0;
    while (i < fullText.length) {
      if (typingJobRef.current !== jobId) return; // cancelled

      i = Math.min(fullText.length, i + chunkSize);
      const partial = fullText.slice(0, i);

      setMessages((m) =>
        m.map((msg) => (msg.id === messageId ? { ...msg, text: partial } : msg))
      );

      await sleep(delayMs);
    }
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Cancel any previous typing animation.
    typingJobRef.current++;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: trimmed,
    };

    const thinkingId = crypto.randomUUID();
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: "assistant",
      text: "Thinking...",
    };

    setMessages((m) => [...m, userMsg, thinkingMsg]);
    setText("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        body: JSON.stringify({ text: trimmed }),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${res.statusText} ${errText}`.trim());
      }

      const data = (await res.json()) as ChatResponse;
      const reply = (data.text ?? "").trim() || "(empty response)";

      // Start from empty so it “types” in.
      setMessages((m) =>
        m.map((msg) => (msg.id === thinkingId ? { ...msg, text: "" } : msg))
      );

      await typeIntoMessage(thinkingId, reply);
    } catch (e: unknown) {
      const msg = toErrorMessage(e);
      setMessages((m) =>
        m.map((x) => (x.id === thinkingId ? { ...x, text: `Error: ${msg}` } : x))
      );
    }
  }

  function stopListening() {
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
  }

  function toggleListening() {
    setSpeechError(null);

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setSpeechError("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const recognition = new Ctor();
    recognitionRef.current = recognition;

    recognition.lang = "ro-RO";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from({ length: event.results.length }, (_, i) => {
        const res = event.results[i];
        return res?.[0]?.transcript ?? "";
      })
        .join("")
        .trim();

      if (transcript) setText(transcript);
    };

    recognition.onerror = (event) => {
      setSpeechError(event.error || "Speech recognition error.");
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    try {
      recognition.start();
    } catch (e: unknown) {
      setSpeechError(toErrorMessage(e));
      setIsListening(false);
    }
  }

  return (
    <div
      className="card"
      style={{
        width: 960,
        marginTop: 20,
        height: 520,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <p style={{ margin: "6px 0 0", fontSize: 13, color: "#9ca3af" }}>
            Tastează întrebarea și primești răspuns direct în chat.
          </p>
        </div>
        <button className="button-secondary" onClick={() => navigate("/mode")}>
          Back
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: 12,
          borderRadius: 12,
          border: "1px solid rgba(148,163,184,0.4)",
          background: "rgba(15,23,42,0.7)",
        }}
      >
        {messages.length === 0 ? (
          <div style={{ color: "#6b7280", fontSize: 13 }}>Trimite primul mesaj.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "75%",
                  padding: "10px 12px",
                  borderRadius: 12,
                  background:
                    m.role === "user"
                      ? "rgba(59,130,246,0.35)"
                      : "rgba(148,163,184,0.18)",
                  border: "1px solid rgba(148,163,184,0.25)",
                  color: "#e5e7eb",
                  fontSize: 13,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          placeholder="Scrie mesajul..."
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(148,163,184,0.4)",
            background: "rgba(2,6,23,0.6)",
            color: "#e5e7eb",
            outline: "none",
          }}
        />
        <button className="button-primary" onClick={() => void send()}>
          Send
        </button>
      </div>

      <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
        <button
          className="button-secondary"
          onClick={toggleListening}
          disabled={!speechSupported}
          aria-pressed={isListening}
          title={!speechSupported ? "Speech recognition not supported" : undefined}
        >
          {isListening ? "Stop mic" : "Speak"}
        </button>

        <div style={{ fontSize: 12, color: "#9ca3af" }}>
          {!speechSupported
            ? "Voice input unavailable in this browser."
            : isListening
              ? "Listening… speak now."
              : "Press Speak to dictate text into the input."}
        </div>
      </div>

      {speechError ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#fca5a5" }}>{speechError}</div>
      ) : null}
    </div>
  );
}