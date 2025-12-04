

const API_URL = "http://localhost:8000";

export type Avatar = {
  id: string;
  name: string;
  image_url?: string | null;
  preview_video_url?: string | null;
  gender?: string | null;
};

export type Voice = {
  id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  preview_audio?: string | null;
};

export async function login(username: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json() as Promise<{ access_token: string; token_type: string }>;
}

export async function getAvatars(token: string): Promise<Avatar[]> {
  const res = await fetch(`${API_URL}/avatars`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Cannot get avatars");
  return res.json();
}

export async function getVoices(token: string): Promise<Voice[]> {
  const res = await fetch(`${API_URL}/voices`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Cannot get voices");
  return res.json();
}

export async function uploadQuestion(
  token: string,
  avatarId: string,
  voiceId: string,
  audioBlob: Blob
) {
  const formData = new FormData();
  formData.append("avatar_id", avatarId);
  formData.append("voice_id", voiceId);
  formData.append("audio", audioBlob, "question.webm");

  const res = await fetch(`${API_URL}/questions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) throw new Error("Cannot send question");
  return res.json() as Promise<{ job_id: string }>;
}

export async function getJobStatus(token: string, jobId: string) {
  const res = await fetch(`${API_URL}/questions/${jobId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Cannot get job status");
  return res.json() as Promise<{ status: string; video_url?: string }>;
}
