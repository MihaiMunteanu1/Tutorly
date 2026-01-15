import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { AvatarSelectionPage } from "./pages/AvatarSelectionPage";
import { VoiceSelectionPage } from "./pages/VoiceSelectionPage";
import { ChatPage } from "./pages/ChatPage";
import "./App.css";
import { SubjectAvatarsPage } from "./pages/SubjectAvatarsPage";
import { TextChatPage } from "./pages/TextChatPage";
import { CreateYourselfPage } from "./pages/CreateYourselfPage";
import { LiveChatPage } from "./pages/LiveChatPage";
import IntroPage from "./pages/IntroPage";
import { ParticleBackground } from "./components/ParticleBackground";
import { ModeSelectionPage } from "./pages/ModeSelectionPage";
import {QuizPage} from "./pages/QuizPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-shell">
          <ParticleBackground />

          <main className="app-main" style={{ position: "relative", zIndex: 10 }}>
            <Routes>
              <Route path={"/"} element={<IntroPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/subjects" element={<SubjectAvatarsPage />} />
              <Route path="/create-yourself" element={<CreateYourselfPage />} />
              <Route path="/avatars" element={<AvatarSelectionPage />} />
              <Route path="/voices" element={<VoiceSelectionPage />} />

              <Route path="/mode-selection" element={<ModeSelectionPage />} />
              {/* backward compat */}
              <Route path="/mode" element={<Navigate to="/mode-selection" replace />} />
              <Route path="/quiz" element = {<QuizPage />} />
              <Route path="/text-chat" element={<TextChatPage />} />
              <Route path="/livechat" element={<LiveChatPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}