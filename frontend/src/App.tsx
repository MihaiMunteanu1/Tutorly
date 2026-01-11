import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AvatarSelectionPage } from "./pages/AvatarSelectionPage";
import { VoiceSelectionPage } from "./pages/VoiceSelectionPage";
import { ChatPage } from "./pages/ChatPage";
import "./App.css";
import { SubjectAvatarsPage } from "./pages/SubjectAvatarsPage";
import { TextChatPage } from "./pages/TextChatPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          {/* header */}
          <header className="app-header">
            <div className="app-header-left">
              <span className="app-logo">🎓</span>
              <div>
                <h1 className="app-title">Tutor Avatar</h1>
                <p className="app-subtitle">
                  Întrebări vocale, răspunsuri video cu avatar AI
                </p>
              </div>
            </div>
          </header>

          <main className="app-main">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/subjects" element={<SubjectAvatarsPage />} />
              <Route path="/avatars" element={<AvatarSelectionPage />} />
              <Route path="/text-chat" element={<TextChatPage />} />
                <Route path="/voices" element={<VoiceSelectionPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
