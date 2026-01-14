import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { Avatar, Voice } from "../api";

type SelectionSource = "preset" | "custom";

type AuthContextType = {
  token: string | null;
  setToken: (t: string | null) => void;
  avatar: Avatar | null;
  setAvatar: (a: Avatar | null) => void;
  voice: Voice | null;
  setVoice: (v: Voice | null) => void;

  // used for ModeSelection + LiveChat
  selectionSource: SelectionSource | null;
  setSelectionSource: (s: SelectionSource | null) => void;
  liveAvatarId: string | null;
  setLiveAvatarId: (id: string | null) => void;
  liveAvatarVoiceId: string | null;
  setLiveAvatarVoiceId: (id: string | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem("token")
  );
  const [avatar, setAvatar] = useState<Avatar | null>(null);
  const [voice, setVoice] = useState<Voice | null>(null);

  const [selectionSource, setSelectionSource] = useState<SelectionSource | null>(null);
  const [liveAvatarId, setLiveAvatarId] = useState<string | null>(null);
  const [liveAvatarVoiceId, setLiveAvatarVoiceId] = useState<string | null>(null);

  const setToken = (t: string | null) => {
    setTokenState(t);
    if (t) localStorage.setItem("token", t);
    else localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        avatar,
        setAvatar,
        voice,
        setVoice,
        selectionSource,
        setSelectionSource,
        liveAvatarId,
        setLiveAvatarId,
        liveAvatarVoiceId,
        setLiveAvatarVoiceId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
