const API_URL = "http://localhost:8000";

export type Avatar = {
  id: string;
  name: string;
  image_url?: string | null;
  preview_video_url?: string | null;
  gender?: string | null;
  avatar_type?: "avatar" | "talking_photo";
};

export type Voice = {
  id: string;
  name: string;
  language?: string | null;
  gender?: string | null;
  preview_audio?: string | null;
};

export type HeygenGroupAvatarItem = {
  avatar_id: string;
  avatar_name?: string;
  preview_image_url?: string;
  preview_video_url?: string;
  gender?: string;
};

export type HeygenGroupResponse = {
  data?: {
    avatar_list?: HeygenGroupAvatarItem[];
    avatars?: HeygenGroupAvatarItem[];
  };
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

export async function getHeygenAvatarsByGroup(
  token: string,
  groupId: string
): Promise<HeygenGroupResponse> {
  const res = await fetch(`${API_URL}/api/heygen/avatar-group/${groupId}/avatars`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HeyGen group avatars failed: ${res.status} ${text}`);
  }

  return res.json();
}

export async function uploadQuestion(
  token: string,
  voiceId: string,
  audioBlob?: Blob,
  text?: string,
  avatarId?: string,
  avatar_url?: string,
  talkingPhotoId?: string
) {
  const formData = new FormData();
  formData.append("avatar_id", avatarId || "");
  formData.append("talking_photo_id", talkingPhotoId || "");
  formData.append("voice_id", voiceId);
  formData.append("audio", audioBlob ?? new Blob([], { type: "application/octet-stream" }), "question.webm");
  formData.append("avatar_url", avatar_url || "");
  formData.append("text", text || "");

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