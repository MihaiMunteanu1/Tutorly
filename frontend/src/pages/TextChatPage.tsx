// `Conversational-Avatar/ProjectWithHeyGen/frontend/src/pages/TextChatPage.tsx`

import { useMemo, useState } from "react";
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

export function TextChatPage() {
  const navigate = useNavigate();
  const { token, avatar } = useAuth() as unknown as AuthShape;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");

  const title = useMemo(() => {
    const name = (avatar?.name ?? "").trim();
    return name ? `Chat cu ${name}` : "Chat";
  }, [avatar]);

  if (!token) {
    navigate("/login");
    return null;
  }

  async function send() {
    const trimmed = text.trim();
    if (!trimmed) return;

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
      const reply = (data.text ?? "").trim();

      setMessages((m) =>
        m.map((msg) =>
          msg.id === thinkingId
            ? { ...msg, text: reply || "(empty response)" }
            : msg
        )
      );
    } catch (e: unknown) {
      const msg = toErrorMessage(e);
      setMessages((m) =>
        m.map((x) => (x.id === thinkingId ? { ...x, text: `Error: ${msg}` } : x))
      );
    }
  }

  return (
    <div
      className="card"
      style={{
        width: 960,
        marginTop: 20,
        height: 680,
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
        <button className="button-secondary" onClick={() => navigate("/chat")}>
          Înapoi la video
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
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            Trimite primul mesaj.
          </div>
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
    </div>
  );
}
