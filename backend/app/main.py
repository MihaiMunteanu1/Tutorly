import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
from app.liveavatar_agent import AGENT_MANAGER

load_dotenv()

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
# LiveAvatar (HeyGen) key for https://api.liveavatar.com
HEYGEN_API_LIVEAVATAR_KEY = os.getenv("HEYGEN_API_LIVEAVATAR_KEY")

# default LiveAvatar config (can be overridden later if needed)
HEYGEN_LIVEAVATAR_AVATAR_ID = os.getenv("HEYGEN_LIVEAVATAR_AVATAR_ID", "1c690fe7-23e0-49f9-bfba-14344450285b")
HEYGEN_LIVEAVATAR_VOICE_ID = os.getenv("HEYGEN_LIVEAVATAR_VOICE_ID", "c2527536-6d1f-4412-a643-53a3497dada9")
HEYGEN_LIVEAVATAR_CONTEXT_ID = os.getenv("HEYGEN_LIVEAVATAR_CONTEXT_ID", "84fbd930-e2ad-4d16-a4ee-966bbfe3aff9")

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
    error: Optional[Any] = None
    error_message: Optional[str] = None
    raw_status: Optional[dict] = None

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

class ContactEmailRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    subject: str
    content: str
    to: str

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

    data = _heygen_post_generate(payload)
    video_id = (data.get("data") or {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise HTTPException(status_code=502, detail=f"Missing video_id in HeyGen response: {data}")
    return video_id

def create_heygen_video_from_photo_url(text: str, photo_url: str, voice_id: str) -> str:
    payload = {
        "title": "Photo avatar raspuns",
        "video_inputs": [
            {
                "character": {
                    "type": "talking_photo",
                    "talking_photo_url": photo_url,
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

    data = _heygen_post_generate(payload)
    video_id = (data.get("data") or {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise HTTPException(status_code=502, detail=f"Missing video_id in HeyGen response: {data}")
    return video_id


def create_heygen_video_from_talking_photo_id(text: str, talking_photo_id: str, voice_id: str) -> str:
    """Generate a video using a HeyGen talking photo (photo avatar group) id.

    HeyGen requirement (per user):
    - Use talking_photo_id
    - Set character.type = talking_photo
    """
    payload = {
        "title": "Photo avatar raspuns",
        "video_inputs": [
            {
                "character": {
                    "type": "talking_photo",
                    "talking_photo_id": talking_photo_id,
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

    data = _heygen_post_generate(payload)
    video_id = (data.get("data") or {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise HTTPException(status_code=502, detail=f"Missing video_id in HeyGen response: {data}")
    return video_id

# def create_heygen_video_from_avatar_id(text: str, avatar_id: str, voice_id: str) -> str:
#     payload = {
#         "title": "Avatar raspuns",
#         "video_inputs": [
#             {
#                 "character": {
#                     "type": "avatar",
#                     "avatar_id": avatar_id,
#                     "avatar_style": "normal",
#                 },
#                 "voice": {
#                     "type": "text",
#                     "voice_id": voice_id,
#                     "input_text": text,
#                 },
#                 "background": {"type": "color", "value": "#000000"},
#             }
#         ],
#         "dimension": {"width": 1280, "height": 720},
#     }
#     headers = {"X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
#     resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
#     resp.raise_for_status()
#     data = resp.json()
#     video_id = data.get("data", {}).get("video_id") or data.get("video_id")
#     if not video_id:
#         raise RuntimeError(f"Missing video_id in HeyGen response: {data}")
#     return video_id
#
# def create_heygen_video_from_photo_url(text: str, photo_url: str, voice_id: str) -> str:
#     """
#     Solution for \`no avatar_id\`: generate video using a photo/image character.
#     HeyGen supports image/photo based character inputs in v2 video generate.
#     """
#     payload = {
#         "title": "Photo avatar raspuns",
#         "video_inputs": [
#             {
#                 "character": {
#                     "type": "photo",
#                     "photo_url": photo_url,
#                 },
#                 "voice": {
#                     "type": "text",
#                     "voice_id": voice_id,
#                     "input_text": text,
#                 },
#                 "background": {"type": "color", "value": "#000000"},
#             }
#         ],
#         "dimension": {"width": 1280, "height": 720},
#     }
#     headers = {"X-Api-Key": HEYGEN_API_KEY, "Content-Type": "application/json", "Accept": "application/json"}
#     resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
#     resp.raise_for_status()
#     data = resp.json()
#     video_id = data.get("data", {}).get("video_id") or data.get("video_id")
#     if not video_id:
#         raise RuntimeError(f"Missing video_id in HeyGen response: {data}")
#     return video_id

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
    # keep old field for backwards compat
    photo_url: Optional[str] = None
    generation_id: str
    image_key: Optional[str] = None
    group_id: Optional[str] = None


class PhotoAvatarGroupCreateRequest(BaseModel):
    generation_id: str
    image_key: str
    name: Optional[str] = None


class PhotoAvatarGroupCreateResponse(BaseModel):
    group_id: str


@app.post("/api/heygen/photo-avatar/avatar-group/create", response_model=PhotoAvatarGroupCreateResponse)
def photo_avatar_group_create(
    req: PhotoAvatarGroupCreateRequest,
    user: str = Depends(get_current_user),
) -> PhotoAvatarGroupCreateResponse:
    url = f"{HEYGEN_BASE_URL}/v2/photo_avatar/avatar_group/create"
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "x-api-key": HEYGEN_API_KEY,
    }
    payload: Dict[str, Any] = {
        "generation_id": req.generation_id,
        "image_key": req.image_key,
        "name": (req.name or "Gen").strip() or "Gen",
    }

    resp = requests.post(url, json=payload, headers=headers, timeout=60)
    if not resp.ok:
        raise HTTPException(status_code=resp.status_code, detail=resp.text)

    raw = resp.json() or {}
    data = raw.get("data") or {}
    group_id = data.get("group_id") or data.get("id")
    if not group_id:
        raise HTTPException(status_code=502, detail=f"Unexpected HeyGen response: {raw}")

    return PhotoAvatarGroupCreateResponse(group_id=str(group_id))


@app.post("/api/session/photo-avatar")
def set_photo_avatar(
    payload: PhotoAvatarPickRequest,
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
) -> Dict[str, Any]:
    token_key = _token_key_from_bearer(creds)
    _PHOTO_AVATAR_BY_TOKEN[token_key] = {
        "photo_url": (payload.photo_url or "").strip(),
        "generation_id": payload.generation_id,
        "image_key": (payload.image_key or "").strip(),
        "group_id": (payload.group_id or "").strip(),
    }
    return {"ok": True}

# --- NEW: Email Sending Endpoint ---

@app.post("/api/send-email")
def send_email(req: ContactEmailRequest):
    # Configurare SMTP - Poti pune aceste valori in .env
    # Exemplu pentru Gmail: server="smtp.gmail.com", port=587
    smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USERNAME", "") 
    smtp_pass = os.getenv("SMTP_PASSWORD", "") 

    # Daca nu avem credentiale, simulam trimiterea (print in consola serverului)
    if not smtp_user or not smtp_pass:
        print(f"\n=== SIMULARE EMAIL (Configureaza SMTP in .env pentru live) ===")
        print(f"Catre: {req.to}")
        print(f"De la: {req.firstName} {req.lastName} <{req.email}>")
        print(f"Subiect: {req.subject}")
        print(f"Mesaj:\n{req.content}")
        print("==============================================================\n")
        # Returnam succes pentru a nu bloca interfata
        return {"message": "Email simulated (check backend console)"}

    try:
        msg = MIMEMultipart()
        msg['From'] = smtp_user
        msg['To'] = req.to
        msg['Subject'] = f"[Contact App] {req.subject}"
        msg['Reply-To'] = req.email

        body = f"""
Ai primit un mesaj nou prin aplicatia Avatar.

Expeditor: {req.firstName} {req.lastName}
Email expeditor: {req.email}

Mesaj:
{req.content}
        """
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(smtp_user, smtp_pass)
        text = msg.as_string()
        server.sendmail(smtp_user, req.to, text)
        server.quit()
        
        return {"message": "Email sent successfully"}
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

# --- Existing endpoints (unchanged) ---

@app.post("/questions", response_model=QuestionResponse)
async def ask_question(
    avatar_id: str = Form(""),
    talking_photo_id: str = Form(""),
    voice_id: str = Form(...),
    audio: UploadFile = File(...),
    avatar_url: str = Form(""),
    text: str = Form(""),
    creds: HTTPAuthorizationCredentials = Depends(security),
    user: str = Depends(get_current_user),
):
    avatar_id = (avatar_id or "").strip()
    talking_photo_id = (talking_photo_id or "").strip()
    avatar_url = (avatar_url or "").strip()
    text = (text or "").strip()

    tmp_path: Optional[str] = None
    if not text:
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
                content = await audio.read()
                tmp.write(content)
                tmp_path = tmp.name
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed saving audio: {e}")

    try:
        student_text = text if text else transcribe_audio_file(tmp_path)  # type: ignore[arg-type]
        tutor_reply = generate_reply_ollama(student_text)

        # Priority order:
        # 1) explicit talking_photo_id (photo avatar group id)
        # 2) explicit avatar_id (stock HeyGen avatar)
        # 3) legacy avatar_url (talking_photo_url)
        # 4) session stored group_id (if present)
        if talking_photo_id:
            video_id = create_heygen_video_from_talking_photo_id(tutor_reply, talking_photo_id, voice_id)
        elif avatar_id:
            video_id = create_heygen_video_from_avatar_id(tutor_reply, avatar_id, voice_id)
        elif avatar_url:
            video_id = create_heygen_video_from_photo_url(tutor_reply, avatar_url, voice_id)
        else:
            # try session
            token_key = _token_key_from_bearer(creds)
            photo_sel = _PHOTO_AVATAR_BY_TOKEN.get(token_key) or {}
            session_group_id = (photo_sel.get("group_id") or "").strip()
            session_photo_url = (photo_sel.get("photo_url") or "").strip()
            if session_group_id:
                video_id = create_heygen_video_from_talking_photo_id(tutor_reply, session_group_id, voice_id)
            elif session_photo_url:
                video_id = create_heygen_video_from_photo_url(tutor_reply, session_photo_url, voice_id)
            else:
                raise HTTPException(status_code=400, detail="Missing avatar\_id or talking\_photo\_id.")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error ({type(e).__name__}): {e}")
    finally:
        if tmp_path:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass

    return QuestionResponse(job_id=video_id)

# @app.post("/questions", response_model=QuestionResponse)
# async def ask_question(
#     avatar_id: str = Form(...),
#     voice_id: str = Form(...),
#     audio: UploadFile = File(...),
#     avatar_url: str = Form(...)  ,
#     text: str = Form(...),
#     user: str = Depends(get_current_user),
# ):
#     if not text :
#         try:
#             with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
#                 content = await audio.read()
#                 tmp.write(content)
#                 tmp_path = tmp.name
#         except Exception as e:
#             raise HTTPException(status_code=500, detail=f"Failed saving audio: {e}")
#
#     try:
#         if not text:
#             student_text = transcribe_audio_file(tmp_path)
#         else :
#             student_text = text
#         tutor_reply = generate_reply_ollama(student_text)
#         if avatar_id:
#             video_id = create_heygen_video_from_avatar_id(tutor_reply, avatar_id, voice_id)
#         elif avatar_url:
#             video_id = create_heygen_video_from_photo_url(tutor_reply, avatar_url, voice_id)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Processing error ({type(e).__name__}): {e}")
#
#     return QuestionResponse(job_id=video_id)

@app.get("/questions/{job_id}", response_model=QuestionStatusResponse)
def get_question_status(job_id: str, user: str = Depends(get_current_user)):
    try:
        data = get_heygen_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HeyGen error: {e}")

    status = (data.get("status") or "unknown").lower()
    completed_statuses = {"completed", "complete", "success", "done", "finished"}
    failed_statuses = {"failed", "error", "canceled", "cancelled"}

    video_url = data.get("video_url") or data.get("url")
    raw_error = data.get("error") or data.get("message")

    def _stringify_err(v: Any) -> Optional[str]:
        if v is None:
            return None
        if isinstance(v, str):
            return v
        # common HeyGen format: {"code": "...", "message": "..."}
        if isinstance(v, dict):
            msg = v.get("message") or v.get("msg")
            code = v.get("code")
            if code and msg:
                return f"{code}: {msg}"
            if msg:
                return str(msg)
            return str(v)
        return str(v)

    error_message = _stringify_err(raw_error)

    out_status = status
    if status in completed_statuses or (video_url and status not in failed_statuses):
        out_status = "completed"
    elif status in failed_statuses:
        out_status = "failed"

    return QuestionStatusResponse(
        status=out_status,
        video_url=video_url,
        error=raw_error,
        error_message=error_message,
        raw_status=data,
    )

class ChatRequest(BaseModel):
    text: str

class ChatResponse(BaseModel):
    text: str

# -----------------------------
# LiveAvatar (LiveChat) endpoints
# -----------------------------

LIVEAVATAR_BASE_URL = "https://api.liveavatar.com"

class LiveAvatarTokenRequest(BaseModel):
    # allow frontend to override if you want, but defaults are set from env
    avatar_id: Optional[str] = None
    voice_id: Optional[str] = None
    context_id: Optional[str] = None
    language: Optional[str] = "en"
    mode: Optional[str] = "FULL"  # FULL recommended for interactive chat

class LiveAvatarTokenResponse(BaseModel):
    session_id: str
    session_token: str

class LiveAvatarStartResponse(BaseModel):
    session_id: str
    livekit_url: str
    livekit_client_token: str
    livekit_agent_token: Optional[str] = None
    max_session_duration: Optional[int] = None
    ws_url: Optional[str] = None

class LiveAvatarStopRequest(BaseModel):
    session_id: str
    reason: Optional[str] = "USER_CLOSED"

class LiveAvatarStopResponse(BaseModel):
    ok: bool


def _require_liveavatar_key() -> str:
    if not HEYGEN_API_LIVEAVATAR_KEY:
        raise HTTPException(status_code=500, detail="Missing HEYGEN_API_LIVEAVATAR_KEY in .env")
    return HEYGEN_API_LIVEAVATAR_KEY

@app.post("/api/livechat/token", response_model=LiveAvatarTokenResponse)
def livechat_create_session_token(
    req: LiveAvatarTokenRequest,
    user: str = Depends(get_current_user),
) -> LiveAvatarTokenResponse:
    api_key = _require_liveavatar_key()

    avatar_id = (req.avatar_id or HEYGEN_LIVEAVATAR_AVATAR_ID).strip()
    voice_id = (req.voice_id or HEYGEN_LIVEAVATAR_VOICE_ID).strip()
    context_id = (req.context_id or HEYGEN_LIVEAVATAR_CONTEXT_ID).strip()
    language = (req.language or "en").strip() or "en"
    mode = (req.mode or "FULL").strip().upper()

    payload: Dict[str, Any] = {
        "mode": mode,
        "avatar_id": avatar_id,
        "avatar_persona": {
            "voice_id": voice_id,
            "context_id": context_id,
            "language": language,
        },
    }

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key,
    }

    try:
        resp = requests.post(f"{LIVEAVATAR_BASE_URL}/v1/sessions/token", json=payload, headers=headers, timeout=30)
        if not resp.ok:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        raw = resp.json() or {}
        data = raw.get("data") or {}
        session_id = data.get("session_id")
        session_token = data.get("session_token")
        if not session_id or not session_token:
            raise HTTPException(status_code=502, detail=f"Unexpected LiveAvatar response: {raw}")
        return LiveAvatarTokenResponse(session_id=session_id, session_token=session_token)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LiveAvatar token error: {type(e).__name__}: {e}")

@app.post("/api/livechat/start", response_model=LiveAvatarStartResponse)
def livechat_start(
    session_token: str = Form(""),
    user: str = Depends(get_current_user),
) -> LiveAvatarStartResponse:
    session_token = (session_token or "").strip()
    if not session_token:
        raise HTTPException(status_code=400, detail="Missing session_token")

    headers = {
        "accept": "application/json",
        "authorization": f"Bearer {session_token}",
    }

    try:
        resp = requests.post(f"{LIVEAVATAR_BASE_URL}/v1/sessions/start", headers=headers, timeout=30)
        if not resp.ok:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        raw = resp.json() or {}
        data = raw.get("data") or {}
        session_id = data.get("session_id")
        livekit_url = data.get("livekit_url")
        livekit_client_token = data.get("livekit_client_token")
        if not session_id or not livekit_url or not livekit_client_token:
            raise HTTPException(status_code=502, detail=f"Unexpected LiveAvatar response: {raw}")
        return LiveAvatarStartResponse(
            session_id=session_id,
            livekit_url=livekit_url,
            livekit_client_token=livekit_client_token,
            livekit_agent_token=data.get("livekit_agent_token"),
            max_session_duration=data.get("max_session_duration"),
            ws_url=data.get("ws_url"),
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LiveAvatar start error: {type(e).__name__}: {e}")

@app.post("/api/livechat/stop", response_model=LiveAvatarStopResponse)
def livechat_stop(
    req: LiveAvatarStopRequest,
    user: str = Depends(get_current_user),
) -> LiveAvatarStopResponse:
    api_key = _require_liveavatar_key()

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "X-API-KEY": api_key,
    }
    payload = {
        "session_id": req.session_id,
        "reason": (req.reason or "USER_CLOSED").strip() or "USER_CLOSED",
    }

    try:
        resp = requests.post(f"{LIVEAVATAR_BASE_URL}/v1/sessions/stop", json=payload, headers=headers, timeout=30)
        if not resp.ok:
            raise HTTPException(status_code=resp.status_code, detail=resp.text)
        return LiveAvatarStopResponse(ok=True)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"LiveAvatar stop error: {type(e).__name__}: {e}")

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

    sel = _SELECTION_BY_TOKEN.get(token_key) or {}
    voice_id = ((sel.get("voice") or {}).get("id") or "").strip()
    if not voice_id:
        raise HTTPException(status_code=400, detail="No voice selected.")

    photo_sel = _PHOTO_AVATAR_BY_TOKEN.get(token_key)
    if not photo_sel:
        raise HTTPException(status_code=400, detail="No photo avatar selected.")

    reply = generate_reply_ollama(chat_text)

    group_id = (photo_sel.get("group_id") or "").strip()
    if group_id:
        video_id = create_heygen_video_from_talking_photo_id(reply, group_id, voice_id)
        return VideoFromChatResponse(job_id=video_id)

    photo_url = (photo_sel.get("photo_url") or "").strip()
    if not photo_url:
        raise HTTPException(status_code=400, detail="Invalid stored photo avatar.")

    video_id = create_heygen_video_from_photo_url(reply, photo_url, voice_id)
    return VideoFromChatResponse(job_id=video_id)

def _heygen_post_generate(payload: dict) -> dict:
    headers = {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }
    try:
        resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
        if not resp.ok:
            raise HTTPException(
                status_code=502,
                detail=f"HeyGen generate failed: {resp.status_code} {resp.text}",
            )
        return resp.json() or {}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"HeyGen generate error: {type(e).__name__}: {e}")

# --- NEW: LiveKit Agent control endpoints ---

class LiveAvatarAgentStartRequest(BaseModel):
    session_id: str
    livekit_url: str
    livekit_agent_token: str
    avatar_id: Optional[str] = None

class LiveAvatarAgentStatusResponse(BaseModel):
    running: bool

@app.post("/api/livechat/agent/start", response_model=LiveAvatarStopResponse)
def livechat_agent_start(
    req: LiveAvatarAgentStartRequest,
    user: str = Depends(get_current_user),
) -> LiveAvatarStopResponse:
    avatar_id = (req.avatar_id or HEYGEN_LIVEAVATAR_AVATAR_ID).strip()

    # Kick off agent in background (in-process).
    # Important: this agent participant publishes avatar A/V tracks.
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    loop.create_task(
        AGENT_MANAGER.start(
            livekit_url=req.livekit_url,
            livekit_agent_token=req.livekit_agent_token,
            avatar_id=avatar_id,
            session_id=req.session_id,
        )
    )

    return LiveAvatarStopResponse(ok=True)

@app.get("/api/livechat/agent/status/{session_id}", response_model=LiveAvatarAgentStatusResponse)
def livechat_agent_status(session_id: str, user: str = Depends(get_current_user)) -> LiveAvatarAgentStatusResponse:
    return LiveAvatarAgentStatusResponse(running=AGENT_MANAGER.is_running(session_id))

@app.post("/api/livechat/agent/stop", response_model=LiveAvatarStopResponse)
def livechat_agent_stop(
    req: LiveAvatarStopRequest,
    user: str = Depends(get_current_user),
) -> LiveAvatarStopResponse:
    import asyncio
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    loop.create_task(AGENT_MANAGER.stop(req.session_id))
    return LiveAvatarStopResponse(ok=True)
