import os
import tempfile
from datetime import datetime, timedelta
from functools import lru_cache
from typing import List, Optional, Dict, Any

import jwt
import requests
import torch
import whisper
from dotenv import load_dotenv
from fastapi import (
    FastAPI,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel

from app.ollama_client import OllamaTeacher

load_dotenv()

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"

HEYGEN_GENERATE_URL = "https://api.heygen.com/v2/video/generate"
HEYGEN_STATUS_URL = "https://api.heygen.com/v1/video_status.get"
HEYGEN_VOICES_URL = "https://api.heygen.com/v2/voices"
HEYGEN_BASE_URL = "https://api.heygen.com"

if not HEYGEN_API_KEY:
    raise RuntimeError("Missing HEYGEN_API_KEY in .env")

AVATAR_GROUP_IDS: List[str] = [
    "1727664276",
    "1727657268",
    "1727662464",
    "1727686832",
    "1733544514",
    "1727057452",
    "1727648625",
    "1727688445",
    "1727071025",
    "1727064509",
    "1727621284",
    "1727720732",
    "1727708884",
    "1727680915",
    "1727398774",
]

class Avatar(BaseModel):
    id: str
    name: str
    image_url: Optional[str] = None
    preview_video_url: Optional[str] = None
    gender: Optional[str] = None

class Voice(BaseModel):
    id: str
    name: str
    language: Optional[str] = None
    gender: Optional[str] = None
    preview_audio: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class QuestionResponse(BaseModel):
    job_id: str

class QuestionStatusResponse(BaseModel):
    status: str
    video_url: Optional[str] = None

class AvatarSelection(BaseModel):
    id: str
    name: str = ""
    image_url: str = ""

class VoiceSelection(BaseModel):
    id: str
    name: str = ""

class SelectionPayload(BaseModel):
    avatar: AvatarSelection
    voice: VoiceSelection

app = FastAPI(title="Tutor Avatar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

FAKE_USERS_DB = {"Student": "parola123"}

def create_access_token(username: str) -> str:
    payload = {"sub": username, "exp": datetime.utcnow() + timedelta(hours=8)}
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)

def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALG])
        username = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Invalid token.")
        return username
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

@app.post("/auth/login", response_model=LoginResponse)
def login(data: LoginRequest):
    if data.username not in FAKE_USERS_DB or FAKE_USERS_DB[data.username] != data.password:
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    token = create_access_token(data.username)
    return LoginResponse(access_token=token)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print("=== START BACKEND ===")
print("=== LOAD WHISPER ===")
whisper_model = whisper.load_model("base")
print("Whisper loaded.")
model = OllamaTeacher()

def generate_reply_ollama(student_question: str) -> str:
    return model.ask(student_question)

def transcribe_audio_file(filepath: str) -> str:
    try:
        result = whisper_model.transcribe(filepath, language="ro")
    except Exception as e:
        raise RuntimeError(f"Whisper error: {e}")
    text = (result.get("text") or "").strip()
    if not text:
        raise RuntimeError("No speech recognized from audio.")
    return text

def create_heygen_video_from_avatar_id(text: str, avatar_id: str, voice_id: str) -> str:
    payload = {
        "title": "Avatar raspuns",
        "video_inputs": [
            {
                "character": {
                    "type": "avatar",
                    "avatar_id": avatar_id,
                    "avatar_style": "normal",
                },
                "voice": {
                    "type": "text",
                    "voice_id": voice_id,
                    "input_text": text,
                },
                "background": {"type": "color", "value": "#000000"},
            }
        ],
        "dimension": {"width": 1280, "height": 720},
    }
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
    resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    video_id = data.get("data", {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise RuntimeError(f"Missing video_id in HeyGen response: {data}")
    return video_id

def create_heygen_video_from_photo_url(text: str, photo_url: str, voice_id: str) -> str:
    """
    Solution for \`no avatar_id\`: generate video using a photo/image character.
    HeyGen supports image/photo based character inputs in v2 video generate.
    """
    payload = {
        "title": "Photo avatar raspuns",
        "video_inputs": [
            {
                "character": {
                    "type": "photo",
                    "photo_url": photo_url,
                },
                "voice": {
                    "type": "text",
                    "voice_id": voice_id,
                    "input_text": text,
                },
                "background": {"type": "color", "value": "#000000"},
            }
        ],
        "dimension": {"width": 1280, "height": 720},
    }
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
    resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()
    video_id = data.get("data", {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise RuntimeError(f"Missing video_id in HeyGen response: {data}")
    return video_id

def get_heygen_status(video_id: str) -> dict:
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Accept": "application/json"}
    resp = requests.get(HEYGEN_STATUS_URL, headers=headers, params={"video_id": video_id}, timeout=30)
    resp.raise_for_status()
    return resp.json().get("data", {})

def fetch_one_avatar_from_group(group_id: str) -> Optional[Avatar]:
    url = f"{HEYGEN_BASE_URL}/v2/avatar_group/{group_id}/avatars"
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Accept": "application/json"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        raw = resp.json()
    except Exception as e:
        print(f"[WARN] Failed avatars for group_id={group_id}: {e}")
        return None
    data = raw.get("data", {}) or {}
    items = (data.get("avatar_list") or data.get("avatars") or [])
    if not items:
        return None
    item = items[0]
    avatar_id = item.get("avatar_id")
    if not avatar_id:
        return None
    return Avatar(
        id=avatar_id,
        name=item.get("avatar_name") or avatar_id,
        image_url=item.get("preview_image_url"),
        preview_video_url=item.get("preview_video_url"),
        gender=item.get("gender"),
    )

def fetch_avatars_from_heygen() -> List[Avatar]:
    avatars: List[Avatar] = []
    for group_id in AVATAR_GROUP_IDS:
        a = fetch_one_avatar_from_group(group_id)
        if a:
            avatars.append(a)
    return avatars

@lru_cache(maxsize=1)
def get_cached_avatars() -> List[Avatar]:
    try:
        return fetch_avatars_from_heygen()
    except Exception:
        return []

@app.get("/avatars", response_model=List[Avatar])
def list_avatars(user: str = Depends(get_current_user)):
    avatars = get_cached_avatars()
    if not avatars:
        return [Avatar(id="Abigail_standing_office_front", name="Abigail Office Front", image_url=None)]
    return avatars

@lru_cache(maxsize=1)
def get_cached_voices() -> List[Voice]:
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Accept": "application/json"}
    try:
        resp = requests.get(HEYGEN_VOICES_URL, headers=headers, timeout=30)
        resp.raise_for_status()
        raw = resp.json()
        items = raw.get("data", {}).get("voices", []) or []
    except Exception:
        return []
    by_name: dict[str, Voice] = {}
    for item in items:
        voice_id = item.get("voice_id")
        name = ((item.get("name") or "").strip().split()[:1] or [""])[0]
        preview_audio = (item.get("preview_audio") or "").strip()
        if not voice_id or not name or not preview_audio:
            continue
        key = name.lower()
        if key in by_name:
            continue
        by_name[key] = Voice(
            id=voice_id,
            name=name,
            language=item.get("language"),
            gender=item.get("gender"),
            preview_audio=preview_audio,
        )
    voices = list(by_name.values())
    return voices[:20] if len(voices) > 20 else voices

@app.get("/voices", response_model=List[Voice])
def list_voices(user: str = Depends(get_current_user)):
    voices = get_cached_voices()
    if not voices:
        raise HTTPException(status_code=500, detail="Cannot load HeyGen voices.")
    return voices

@app.get("/api/heygen/avatar-group/{group_id}/avatars")
def heygen_avatar_group_avatars(group_id: str, user: str = Depends(get_current_user)) -> Dict[str, Any]:
    url = f"{HEYGEN_BASE_URL}/v2/avatar_group/{group_id}/avatars"
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Accept": "application/json"}
    try:
        resp = requests.get(url, headers=headers, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except requests.HTTPError as e:
        status = e.response.status_code if e.response is not None else 502
        detail = e.response.text if e.response is not None else str(e)
        raise HTTPException(status_code=status, detail=detail)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"HeyGen proxy error: {e}")

_SELECTION_BY_TOKEN: Dict[str, Dict[str, Any]] = {}
_PHOTO_AVATAR_BY_TOKEN: Dict[str, Dict[str, Any]] = {}

def _token_key_from_bearer(creds: HTTPAuthorizationCredentials) -> str:
    return creds.credentials

@app.post("/api/session/selection")
def set_selection(
    payload: SelectionPayload,
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> Dict[str, Any]:
    token_key = _token_key_from_bearer(creds)
    _SELECTION_BY_TOKEN[token_key] = {
        "avatar": payload.avatar.model_dump(),
        "voice": payload.voice.model_dump(),
    }
    return {"ok": True}

@app.get("/api/session/selection")
def get_selection(
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> Dict[str, Any]:
    token_key = _token_key_from_bearer(creds)
    sel = _SELECTION_BY_TOKEN.get(token_key)
    if not sel:
        raise HTTPException(status_code=404, detail="No selection stored.")
    return sel

# --- NEW: HeyGen photo avatar generation proxy ---

# class PhotoAvatarGenerateRequest(BaseModel):
#     age: str
#     gender: str
#     ethnicity: str
#     orientation: str
#     pose: str
#     style: str

# class PhotoAvatarGenerateResponse(BaseModel):
#     generation_id: str
#
class PhotoAvatarStatusResponse(BaseModel):
    id: str
    status: str
    msg: Optional[str] = None
    image_url_list: List[str] = []
    image_key_list: List[str] = []
#
# @app.post("/api/heygen/photo-avatar/generate", response_model=PhotoAvatarGenerateResponse)
# def photo_avatar_generate(
#     payload: PhotoAvatarGenerateRequest,
#     creds: HTTPAuthorizationCredentials = Depends(security),
#     user: str = Depends(get_current_user),
# ) -> PhotoAvatarGenerateResponse:
#     url = f"{HEYGEN_BASE_URL}/v2/photo_avatar/photo/generate"
#     headers = {
#         "accept": "application/json",
#         "content-type": "application/json",
#         "x-api-key": HEYGEN_API_KEY,
#     }
#     resp = requests.post(url, json=payload.model_dump(), headers=headers, timeout=60)
#     if not resp.ok:
#         raise HTTPException(status_code=resp.status_code, detail=resp.text)
#     data = resp.json()
#     generation_id = (data.get("data") or {}).get("generation_id")
#     if not generation_id:
#         raise HTTPException(status_code=502, detail=f"Unexpected HeyGen response: {data}")
#     return PhotoAvatarGenerateResponse(generation_id=generation_id)

class PhotoAvatarGenerateRequest(BaseModel):
    name: str
    age: str
    gender: str
    ethnicity: str
    orientation: str
    pose: str
    style: str
    appearance: Optional[str] = None

class PhotoAvatarGenerateResponse(BaseModel):
    generation_id: str

@app.post("/api/heygen/photo-avatar/generate", response_model=PhotoAvatarGenerateResponse)
def photo_avatar_generate(
    req: PhotoAvatarGenerateRequest,
    user: str = Depends(get_current_user),
) -> PhotoAvatarGenerateResponse:
    url = f"{HEYGEN_BASE_URL}/v2/photo_avatar/photo/generate"
    headers = {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "X-Api-Key": HEYGEN_API_KEY,
    }

    payload: Dict[str, Any] = {
        "name": req.name,
        "age": req.age,
        "gender": req.gender,
        "ethnicity": req.ethnicity,
        "orientation": req.orientation,
        "pose": req.pose,
        "style": req.style,
    }
    if req.appearance:
        payload["appearance"] = req.appearance

    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    raw = resp.json() or {}
    gen_id = (raw.get("data") or {}).get("generation_id")
    if not gen_id:
        raise HTTPException(status_code=502, detail=f"Unexpected HeyGen response: {raw}")

    return PhotoAvatarGenerateResponse(generation_id=gen_id)

@app.get("/api/heygen/photo-avatar/status/{generation_id}", response_model=PhotoAvatarStatusResponse)
def photo_avatar_status(
    generation_id: str,
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> PhotoAvatarStatusResponse:
    url = f"{HEYGEN_BASE_URL}/v2/photo_avatar/generation/{generation_id}"
    headers = {"accept": "application/json", "x-api-key": HEYGEN_API_KEY}
    resp = requests.get(url, headers=headers, timeout=60)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)
    raw = resp.json()
    data = raw.get("data") or {}
    return PhotoAvatarStatusResponse(
        id=str(data.get("id") or generation_id),
        status=str(data.get("status") or "unknown"),
        msg=data.get("msg"),
        image_url_list=list(data.get("image_url_list") or []),
        image_key_list=list(data.get("image_key_list") or []),
    )

class PhotoAvatarPickRequest(BaseModel):
    photo_url: str
    generation_id: str

@app.post("/api/session/photo-avatar")
def set_photo_avatar(
    payload: PhotoAvatarPickRequest,
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> Dict[str, Any]:
    token_key = _token_key_from_bearer(creds)
    photo_url = (payload.photo_url or "").strip()
    if not photo_url:
        raise HTTPException(status_code=400, detail="photo_url is required.")
    _PHOTO_AVATAR_BY_TOKEN[token_key] = {
        "photo_url": photo_url,
        "generation_id": payload.generation_id,
    }
    return {"ok": True}

@app.get("/api/session/photo-avatar")
def get_photo_avatar(
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> Dict[str, Any]:
    token_key = _token_key_from_bearer(creds)
    sel = _PHOTO_AVATAR_BY_TOKEN.get(token_key)
    if not sel:
        raise HTTPException(status_code=404, detail="No photo avatar stored.")
    return sel

# --- Existing endpoints (unchanged) ---

@app.post("/questions", response_model=QuestionResponse)
async def ask_question(
    avatar_id: str = Form(...),
    voice_id: str = Form(...),
    audio: UploadFile = File(...),
    user: str = Depends(get_current_user),
):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed saving audio: {e}")

    try:
        student_text = transcribe_audio_file(tmp_path)
        tutor_reply = generate_reply_ollama(student_text)
        video_id = create_heygen_video_from_avatar_id(tutor_reply, avatar_id, voice_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error ({type(e).__name__}): {e}")

    return QuestionResponse(job_id=video_id)

@app.get("/questions/{job_id}", response_model=QuestionStatusResponse)
def get_question_status(job_id: str, user: str = Depends(get_current_user)):
    try:
        data = get_heygen_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HeyGen error: {e}")
    return QuestionStatusResponse(status=data.get("status", "unknown"), video_url=data.get("video_url"))

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    text: str

@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest, user: str = Depends(get_current_user)) -> ChatResponse:
    text = (req.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text.")
    reply = generate_reply_ollama(text)
    return ChatResponse(text=reply)

# --- NEW: video generation using selected photo avatar + selected voice ---

class VideoFromChatResponse(BaseModel):
    job_id: str

@app.post("/api/video/from-chat", response_model=VideoFromChatResponse)
def video_from_chat(
    req: ChatRequest,
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> VideoFromChatResponse:
    token_key = _token_key_from_bearer(creds)

    chat_text = (req.text or "").strip()
    if not chat_text:
        raise HTTPException(status_code=400, detail="Empty text.")

    # voice comes from existing selection endpoint
    sel = _SELECTION_BY_TOKEN.get(token_key) or {}
    voice_id = ((sel.get("voice") or {}).get("id") or "").strip()
    if not voice_id:
        raise HTTPException(status_code=400, detail="No voice selected.")

    # photo avatar comes from new session store
    photo_sel = _PHOTO_AVATAR_BY_TOKEN.get(token_key)
    if not photo_sel:
        raise HTTPException(status_code=400, detail="No photo avatar selected.")
    photo_url = (photo_sel.get("photo_url") or "").strip()
    if not photo_url:
        raise HTTPException(status_code=400, detail="Invalid stored photo avatar.")

    reply = generate_reply_ollama(chat_text)
    video_id = create_heygen_video_from_photo_url(reply, photo_url, voice_id)
    return VideoFromChatResponse(job_id=video_id)

