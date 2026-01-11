# import os
# import tempfile
# from datetime import datetime, timedelta
# from functools import lru_cache
# from typing import List, Optional, Dict, Any
#
# import jwt
# import requests
# import torch
# import whisper
# import ollama
# from dotenv import load_dotenv
# from fastapi import (
#     FastAPI,
#     Depends,
#     File,
#     Form,
#     HTTPException,
#     UploadFile,
# )
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# from pydantic import BaseModel
# from transformers import AutoTokenizer, AutoModelForCausalLM
# from app.ollama_client import OllamaTeacher
# import requests
# from flask import Flask, request, jsonify
#
#
# # -------------------------------------------------------------------
# # CONFIG & ENV
# # -------------------------------------------------------------------
#
# load_dotenv()  # încarcă .env
#
# HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")
# HEYGEN_VOICE_ID = os.getenv("HEYGEN_VOICE_ID")
# # DIALOG_MODEL_PATH = os.getenv(
# #     "DIALOG_MODEL_PATH", "../model/fine_tuned_dialoGPT/fine_tuned_dialoGPT"
# # )
# JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
# JWT_ALG = "HS256"
#
# HEYGEN_GENERATE_URL = "https://api.heygen.com/v2/video/generate"
# HEYGEN_STATUS_URL = "https://api.heygen.com/v1/video_status.get"
# HEYGEN_AVATARS_URL = "https://api.heygen.com/v2/avatars"  # (nu-l mai folosim direct)
# HEYGEN_VOICES_URL = "https://api.heygen.com/v2/voices"
# HEYGEN_BASE_URL = "https://api.heygen.com"
#
# model = OllamaTeacher()
#
# if not HEYGEN_API_KEY:
#     raise RuntimeError("Lipsește HEYGEN_API_KEY în .env")
#
# # Group IDs de la HeyGen — momentan 10
# AVATAR_GROUP_IDS: List[str] = [
#     "1727664276",
#     "1727672614",
#     "1727662464",
#     "1727686832",
#     "1733544514",
#     "1731908055",
#     "1731895711",
#     "1733876788",
#     "1733086948",
#     "1727064509",
#     "1727621284",
#     "1727720732",
#     "1727708884",
#     "1727713206",
#     "1732927739",
# ]
#
#
# # -------------------------------------------------------------------
# # MODELE Pydantic
# # -------------------------------------------------------------------
#
# class Avatar(BaseModel):
#     id: str
#     name: str
#     image_url: Optional[str] = None
#     preview_video_url: Optional[str] = None
#     gender: Optional[str] = None
#
#
# class Voice(BaseModel):
#     id: str
#     name: str
#     language: Optional[str] = None
#     gender: Optional[str] = None
#     preview_audio: Optional[str] = None
#
#
# class LoginRequest(BaseModel):
#     username: str
#     password: str
#
#
# class LoginResponse(BaseModel):
#     access_token: str
#     token_type: str = "bearer"
#
#
# class QuestionResponse(BaseModel):
#     job_id: str
#
#
# class QuestionStatusResponse(BaseModel):
#     status: str
#     video_url: Optional[str] = None
#
#
# # -------------------------------------------------------------------
# # APP INIT
# # -------------------------------------------------------------------
#
# app = FastAPI(title="Tutor Avatar API")
#
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173", "http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )
#
# security = HTTPBearer()
#
# # -------------------------------------------------------------------
# # AUTENTIFICARE SIMPLĂ (fake users)
# # -------------------------------------------------------------------
#
# FAKE_USERS_DB = {
#     "Student": "parola123"
# }
#
#
# def create_access_token(username: str) -> str:
#     payload = {
#         "sub": username,
#         "exp": datetime.utcnow() + timedelta(hours=8),
#     }
#     return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
#
#
# def get_current_user(token: HTTPAuthorizationCredentials = Depends(security)) -> str:
#     try:
#         payload = jwt.decode(token.credentials, JWT_SECRET, algorithms=[JWT_ALG])
#         username = payload.get("sub")
#         if not username:
#             raise HTTPException(status_code=401, detail="Token invalid.")
#         return username
#     except jwt.PyJWTError:
#         raise HTTPException(status_code=401, detail="Token invalid sau expirat.")
#
#
# @app.post("/auth/login", response_model=LoginResponse)
# def login(data: LoginRequest):
#     if data.username not in FAKE_USERS_DB or FAKE_USERS_DB[data.username] != data.password:
#         raise HTTPException(status_code=401, detail="Credențiale invalide.")
#     token = create_access_token(data.username)
#     return LoginResponse(access_token=token)
#
#
# # -------------------------------------------------------------------
# # ÎNCĂRCARE MODELE (DialoGPT + Whisper)
# # -------------------------------------------------------------------
#
# device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
#
#
# def load_dialog_model(path: str):
#     print("=== ÎNCARC MODELUL DE DIALOG (DialoGPT fine-tuned) ===")
#     tokenizer = AutoTokenizer.from_pretrained(path, local_files_only=True)
#     model = AutoModelForCausalLM.from_pretrained(path, local_files_only=True)
#     tokenizer.pad_token = tokenizer.eos_token
#     model.to(device)
#     print("Model încărcat pe device:", device)
#     return tokenizer, model
#
#
# print("=== PORNIRE BACKEND ===")
# # dialog_tokenizer, dialog_model = load_dialog_model(DIALOG_MODEL_PATH)
#
# print("=== ÎNCARC MODELUL WHISPER ===")
# whisper_model = whisper.load_model("base")  # poți schimba în "small"/"medium"/"large"
# print("Whisper încărcat.")
#
#
# def generate_reply_ollama(student_question: str) -> str:
#     return model.ask(student_question)
#
#
# def transcribe_audio_file(filepath: str) -> str:
#     """
#     Rulează Whisper local pentru STT (limba română).
#     """
#     try:
#         result = whisper_model.transcribe(filepath, language="ro")
#     except Exception as e:
#         raise RuntimeError(f"Eroare Whisper: {e}")
#
#     text = result.get("text", "").strip()
#     if not text:
#         raise RuntimeError("Nu am putut recunoaște nimic din audio.")
#     return text
#
#
# def create_heygen_video(text: str, avatar_id: str, voice_id: str) -> str:
#     """
#     Creează un video HeyGen pe baza textului, avatarului și vocii selectate.
#     """
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
#                 "background": {
#                     "type": "color",
#                     "value": "#000000",
#                 },
#             }
#         ],
#         "dimension": {
#             "width": 1280,
#             "height": 720,
#         },
#     }
#
#     headers = {
#         "X-Api-Key": HEYGEN_API_KEY,
#         "Content-Type": "application/json",
#         "Accept": "application/json",
#     }
#
#     resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
#     resp.raise_for_status()
#     data = resp.json()
#
#     video_id = data.get("data", {}).get("video_id") or data.get("video_id")
#     if not video_id:
#         raise RuntimeError(f"Nu am găsit video_id în răspunsul HeyGen: {data}")
#     return video_id
#
#
# def get_heygen_status(video_id: str) -> dict:
#     headers = {
#         "X-Api-Key": HEYGEN_API_KEY,
#         "Accept": "application/json",
#     }
#     resp = requests.get(HEYGEN_STATUS_URL, headers=headers, params={"video_id": video_id}, timeout=30)
#     resp.raise_for_status()
#     return resp.json().get("data", {})
#
#
# # -------------------------------------------------------------------
# # AVATARE: 1 avatar din fiecare group_id
# # -------------------------------------------------------------------
#
# def fetch_one_avatar_from_group(group_id: str) -> Optional[Avatar]:
#     """
#     Ia lista de avatare dintr-un avatar_group și întoarce UN avatar (de obicei primul).
#     Endpoint: GET /v2/avatar_group/{group_id}/avatars
#     """
#     url = f"https://api.heygen.com/v2/avatar_group/{group_id}/avatars"
#
#     headers = {
#         "X-Api-Key": HEYGEN_API_KEY,
#         "Accept": "application/json",
#     }
#
#     try:
#         resp = requests.get(url, headers=headers, timeout=30)
#         resp.raise_for_status()
#         raw = resp.json()
#     except Exception as e:
#         print(f"[WARN] Nu pot lua avatarele pentru group_id={group_id}: {e}")
#         return None
#
#     data = raw.get("data", {})
#     items = data.get("avatar_list") or data.get("avatars") or []
#     if not items:
#         print(f"[WARN] avatar_list este gol pentru group_id={group_id}")
#         return None
#
#     # Aici poți introduce reguli mai fine (ex: preferă LIFELIKE, premium == False etc.).
#     item = items[0]
#
#     avatar_id = item.get("avatar_id")
#     avatar_name = item.get("avatar_name") or avatar_id
#     image_url = item.get("preview_image_url")
#     preview_video_url = item.get("preview_video_url")
#     gender = item.get("gender")
#
#     if not avatar_id:
#         return None
#
#     return Avatar(
#         id=avatar_id,
#         name=avatar_name,
#         image_url=image_url,
#         preview_video_url=preview_video_url,
#         gender=gender,
#     )
#
#
# def fetch_avatars_from_heygen() -> List[Avatar]:
#     """
#     Ia câte UN avatar din fiecare avatar_group din AVATAR_GROUP_IDS.
#     Rezultatul va avea până la len(AVATAR_GROUP_IDS) avatare
#     (ignorând grupurile care dau eroare/nu au avatare).
#     """
#     avatars: List[Avatar] = []
#
#     for group_id in AVATAR_GROUP_IDS:
#         avatar = fetch_one_avatar_from_group(group_id)
#         if avatar:
#             avatars.append(avatar)
#         else:
#             print(f"[WARN] Nu am putut selecta avatar pentru group_id={group_id}")
#
#     return avatars
#
#
# @lru_cache(maxsize=1)
# def get_cached_avatars() -> List[Avatar]:
#     """
#     Cache simplu ca să nu lovim HeyGen la fiecare request.
#     Se reîncarcă doar când repornești backend-ul.
#     """
#     try:
#         avatars = fetch_avatars_from_heygen()
#         if avatars:
#             print(f"Am încărcat {len(avatars)} avatar-e de la HeyGen (1 per group).")
#         else:
#             print("Nu am primit niciun avatar de la HeyGen.")
#         return avatars
#     except Exception as e:
#         print(f"[WARN] Nu pot lua avatarele de la HeyGen: {e}")
#         return []
#
#
# @app.get("/avatars", response_model=List[Avatar])
# def list_avatars(user: str = Depends(get_current_user)):
#     avatars = get_cached_avatars()
#     if not avatars:
#         # fallback minimal dacă chiar nu merge nimic
#         return [
#             Avatar(
#                 id="Abigail_standing_office_front",
#                 name="Abigail Office Front",
#                 image_url=None,
#             )
#         ]
#     return avatars
#
#
# # -------------------------------------------------------------------
# # VOCILE HEYGEN
# # -------------------------------------------------------------------
#
# @lru_cache(maxsize=1)
# def get_cached_voices() -> List[Voice]:
#     """
#     Ia lista de voci de la HeyGen (max 20, nume unice),
#     păstrând DOAR vocile care au preview_audio nenul.
#     Astfel, toate vocile afișate în UI au un audio de preview valid.
#     """
#     headers = {
#         "X-Api-Key": HEYGEN_API_KEY,
#         "Accept": "application/json",
#     }
#
#     try:
#         resp = requests.get(HEYGEN_VOICES_URL, headers=headers, timeout=30)
#         resp.raise_for_status()
#         raw = resp.json()
#         items = raw.get("data", {}).get("voices", [])
#     except Exception as e:
#         print(f"[WARN] Nu pot lua vocile de la HeyGen: {e}")
#         return []
#
#     by_name: dict[str, Voice] = {}
#
#     for item in items:
#         voice_id = item.get("voice_id")
#         name = ((item.get("name") or "").strip().split()[:1] or [""])[0]
#
#         language = item.get("language")
#         gender = item.get("gender")
#         preview_audio = (item.get("preview_audio") or "").strip()
#
#         # vrem doar voci cu preview_audio non-gol
#         if not voice_id or not name or not preview_audio:
#             continue
#
#         key = name.lower()
#         if key in by_name:
#             continue  # deja avem o voce cu acest nume
#
#         by_name[key] = Voice(
#             id=voice_id,
#             name=name,
#             language=language,
#             gender=gender,
#             preview_audio=preview_audio,
#         )
#
#     voices = list(by_name.values())
#
#     # limitează la max 20 ca să nu fie listă uriașă
#     if len(voices) > 20:
#         voices = voices[:20]
#
#     print(f"[INFO] Voci disponibile cu preview_audio: {len(voices)}")
#     return voices
#
#
# @app.get("/voices", response_model=List[Voice])
# def list_voices(user: str = Depends(get_current_user)):
#     voices = get_cached_voices()
#     if not voices:
#         raise HTTPException(status_code=500, detail="Nu pot încărca vocile de la HeyGen.")
#     return voices
#
#
# # -------------------------------------------------------------------
# # ENDPOINT-uri principale: /questions
# # -------------------------------------------------------------------
#
# @app.post("/questions", response_model=QuestionResponse)
# async def ask_question(
#     avatar_id: str = Form(...),
#     voice_id: str = Form(...),
#     audio: UploadFile = File(...),
#     user: str = Depends(get_current_user),
# ):
#     valid_avatar_ids = {a.id for a in get_cached_avatars()}
#     if avatar_id not in valid_avatar_ids:
#         raise HTTPException(status_code=400, detail="Avatar necunoscut.")
#
#     valid_voice_ids = {v.id for v in get_cached_voices()}
#     if voice_id not in valid_voice_ids:
#         raise HTTPException(status_code=400, detail="Voce necunoscută.")
#
#     # salvăm audio într-un fișier temporar
#     try:
#         with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
#             content = await audio.read()
#             tmp.write(content)
#             tmp_path = tmp.name
#         print(f"[DEBUG] Audio salvat în {tmp_path}, size={len(content)} bytes")
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail=f"Eroare la salvarea audio: {e}")
#
#     try:
#         # 1. Speech-to-text cu Whisper
#         print(f"[DEBUG] Pornesc transcrierea cu Whisper pentru {tmp_path}")
#         student_text = transcribe_audio_file(tmp_path)
#         print(f"[DEBUG] Text recunoscut: {student_text!r}")
#
#         # 2. Răspuns tutor AI
#         tutor_reply = generate_reply_ollama(student_text)
#         print(f"[DEBUG] Răspuns tutor: {tutor_reply!r}")
#
#         # 3. Creare video HeyGen cu vocea și avatarul selectate
#         video_id = create_heygen_video(tutor_reply, avatar_id, voice_id)
#         print(f"[DEBUG] Video ID HeyGen: {video_id}")
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         raise HTTPException(
#             status_code=500,
#             detail=f"Eroare la procesare întrebare ({type(e).__name__}): {e}",
#         )
#
#     return QuestionResponse(job_id=video_id)
#
#
# @app.get("/questions/{job_id}", response_model=QuestionStatusResponse)
# def get_question_status(job_id: str, user: str = Depends(get_current_user)):
#     """
#     Verifică statusul video-ului HeyGen (completed / processing / failed etc.).
#     """
#     try:
#         data = get_heygen_status(job_id)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Eroare HeyGen: {e}")
#
#     status = data.get("status", "unknown")
#     video_url = data.get("video_url")
#
#     return QuestionStatusResponse(status=status, video_url=video_url)
#
#
# # -------------------------------------------------------------------
# # OPTIONAL: Generare preview voice (dacă vrei să o folosești ulterior)
# # -------------------------------------------------------------------
#
# def generate_voice_preview(voice_id: str) -> Optional[str]:
#     """
#     Folosește endpoint-ul HeyGen /v2/voices/{voice_id}/preview ca să genereze
#     un audio scurt de preview pentru vocea dată.
#     ATENȚIE: consumă credite HeyGen și necesită plan Enterprise.
#     """
#     url = f"https://api.heygen.com/v2/voices/{voice_id}/preview"
#
#     headers = {
#         "X-Api-Key": HEYGEN_API_KEY,
#         "Accept": "application/json",
#         "Content-Type": "application/json",
#     }
#
#     payload = {
#         "text": "This is a short sample preview of this voice."
#     }
#
#     try:
#         resp = requests.post(url, headers=headers, json=payload, timeout=30)
#         resp.raise_for_status()
#         data = resp.json()
#         audio_url = (
#             data.get("data", {}).get("audio_url")
#             or data.get("audio_url")
#         )
#         return audio_url
#     except Exception as e:
#         print(f"[WARN] Nu pot genera preview pentru voice_id={voice_id}: {e}")
#         return None
#
#
# # Very simple in-memory store keyed by bearer token (replace with DB/redis later)
# _SELECTION_BY_TOKEN: Dict[str, Dict[str, Any]] = {}
#
#
# def _bearer_token() -> Optional[str]:
#     auth = request.headers.get("Authorization", "")
#     if auth.startswith("Bearer "):
#         return auth.removeprefix("Bearer ").strip()
#     return None
#
# @app.get("/api/heygen/avatars")
# def list_heygen_avatars():
#     if not HEYGEN_API_KEY:
#         return jsonify({"error": "HEYGEN_API_KEY is not set"}), 500
#
#     r = requests.get(
#         f"{HEYGEN_BASE_URL}/v2/avatars",
#         headers={
#             "accept": "application/json",
#             "x-api-key": HEYGEN_API_KEY,
#         },
#         timeout=30,
#     )
#     return (r.text, r.status_code, {"Content-Type": "application/json"})
#
#
# @app.post("/api/session/selection")
# def set_selection():
#     token = _bearer_token()
#     if not token:
#         return jsonify({"error": "Missing Bearer token"}), 401
#
#     data = request.get_json(silent=True) or {}
#     avatar = data.get("avatar") or {}
#     voice = data.get("voice") or {}
#
#     avatar_id = avatar.get("id")
#     voice_id = voice.get("id")
#
#     if not avatar_id:
#         return jsonify({"error": "avatar.id is required"}), 400
#     if not voice_id:
#         return jsonify({"error": "voice.id is required"}), 400
#
#     _SELECTION_BY_TOKEN[token] = {
#         "avatar": {
#             "id": avatar_id,
#             "name": avatar.get("name", ""),
#             "image_url": avatar.get("image_url", ""),
#         },
#         "voice": {
#             "id": voice_id,
#             "name": voice.get("name", ""),
#         },
#     }
#     return jsonify({"ok": True})
#
#
# @app.get("/api/session/selection")
# def get_selection():
#     token = _bearer_token()
#     if not token:
#         return jsonify({"error": "Missing Bearer token"}), 401
#
#     sel = _SELECTION_BY_TOKEN.get(token)
#     if not sel:
#         return jsonify({"error": "No selection stored"}), 404
#     return jsonify(sel)


# Conversational-Avatar/ProjectWithHeyGen/backend/app/main.py
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

# -------------------------------------------------------------------
# CONFIG & ENV
# -------------------------------------------------------------------

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

# Group IDs de la HeyGen — momentan 10+
AVATAR_GROUP_IDS: List[str] = [
    "1727664276",
    "1727657268",
    "1727662464",
    "1727686832",
    "1733544514",
    "1731908055",
    "1731895711",
    "1733876788",
    "1733086948",
    "1727064509",
    "1727621284",
    "1727720732",
    "1727708884",
    "1727713206",
    "1732927739",

]

# -------------------------------------------------------------------
# MODELE Pydantic
# -------------------------------------------------------------------


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


# -------------------------------------------------------------------
# APP INIT
# -------------------------------------------------------------------

app = FastAPI(title="Tutor Avatar API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

# -------------------------------------------------------------------
# AUTENTIFICARE SIMPLĂ (fake users)
# -------------------------------------------------------------------

FAKE_USERS_DB = {
    "Student": "parola123",
}


def create_access_token(username: str) -> str:
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=8),
    }
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


# -------------------------------------------------------------------
# ÎNCĂRCARE MODELE (Whisper + Ollama)
# -------------------------------------------------------------------

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


def create_heygen_video(text: str, avatar_id: str, voice_id: str) -> str:
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
                "background": {
                    "type": "color",
                    "value": "#000000",
                },
            }
        ],
        "dimension": {"width": 1280, "height": 720},
    }

    headers = {
        "X-Api-Key": HEYGEN_API_KEY,
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    resp = requests.post(HEYGEN_GENERATE_URL, json=payload, headers=headers, timeout=60)
    resp.raise_for_status()
    data = resp.json()

    video_id = data.get("data", {}).get("video_id") or data.get("video_id")
    if not video_id:
        raise RuntimeError(f"Missing video_id in HeyGen response: {data}")
    return video_id


def get_heygen_status(video_id: str) -> dict:
    headers = {
        "X-Api-Key": HEYGEN_API_KEY,
        "Accept": "application/json",
    }
    resp = requests.get(HEYGEN_STATUS_URL, headers=headers, params={"video_id": video_id}, timeout=30)
    resp.raise_for_status()
    return resp.json().get("data", {})


# -------------------------------------------------------------------
# HEYGEN: avatar_group helpers + cache
# -------------------------------------------------------------------


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
    items = (data.get("avatar_list") or data.get("avatars") or [])  # HeyGen varies
    if not items:
        print(f"[WARN] Empty avatar_list for group_id={group_id}")
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
        else:
            print(f"[WARN] No avatar selected for group_id={group_id}")
    return avatars


@lru_cache(maxsize=1)
def get_cached_avatars() -> List[Avatar]:
    try:
        avatars = fetch_avatars_from_heygen()
        print(f"[INFO] Loaded avatars: {len(avatars)} (1 per group)")
        return avatars
    except Exception as e:
        print(f"[WARN] Cannot load avatars: {e}")
        return []


@app.get("/avatars", response_model=List[Avatar])
def list_avatars(user: str = Depends(get_current_user)):
    avatars = get_cached_avatars()
    if not avatars:
        return [Avatar(id="Abigail_standing_office_front", name="Abigail Office Front", image_url=None)]
    return avatars


# -------------------------------------------------------------------
# HEYGEN: voices cache
# -------------------------------------------------------------------


@lru_cache(maxsize=1)
def get_cached_voices() -> List[Voice]:
    headers = {"X-Api-Key": HEYGEN_API_KEY, "Accept": "application/json"}
    try:
        resp = requests.get(HEYGEN_VOICES_URL, headers=headers, timeout=30)
        resp.raise_for_status()
        raw = resp.json()
        items = raw.get("data", {}).get("voices", []) or []
    except Exception as e:
        print(f"[WARN] Failed voices: {e}")
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
    if len(voices) > 20:
        voices = voices[:20]

    print(f"[INFO] Voices with preview_audio: {len(voices)}")
    return voices


@app.get("/voices", response_model=List[Voice])
def list_voices(user: str = Depends(get_current_user)):
    voices = get_cached_voices()
    if not voices:
        raise HTTPException(status_code=500, detail="Cannot load HeyGen voices.")
    return voices


# -------------------------------------------------------------------
# Proxy: avatar_group/{group_id}/avatars (used by SubjectAvatarsPage.tsx)
# -------------------------------------------------------------------


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


# -------------------------------------------------------------------
# Session: store selection (in-memory) per token
# -------------------------------------------------------------------

_SELECTION_BY_TOKEN: Dict[str, Dict[str, Any]] = {}


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


# -------------------------------------------------------------------
# ENDPOINT-uri principale: /questions
# -------------------------------------------------------------------


@app.post("/questions", response_model=QuestionResponse)
async def ask_question(
    avatar_id: str = Form(...),
    voice_id: str = Form(...),
    audio: UploadFile = File(...),
    user: str = Depends(get_current_user),
):
    # valid_avatar_ids = {a.id for a in get_cached_avatars()}
    # if avatar_id not in valid_avatar_ids:
    #     # Allows only avatars from the cached list
    #     raise HTTPException(status_code=400, detail="Unknown avatar.")
    #
    # valid_voice_ids = {v.id for v in get_cached_voices()}
    # if voice_id not in valid_voice_ids:
    #     raise HTTPException(status_code=400, detail="Unknown voice.")

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            content = await audio.read()
            tmp.write(content)
            tmp_path = tmp.name
        print(f"[DEBUG] Audio saved: {tmp_path}, bytes={len(content)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed saving audio: {e}")

    try:
        student_text = transcribe_audio_file(tmp_path)
        tutor_reply = generate_reply_ollama(student_text)
        video_id = create_heygen_video(tutor_reply, avatar_id, voice_id)
        print(f"[DEBUG] HeyGen video_id: {video_id}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error ({type(e).__name__}): {e}")

    return QuestionResponse(job_id=video_id)


@app.get("/questions/{job_id}", response_model=QuestionStatusResponse)
def get_question_status(job_id: str, user: str = Depends(get_current_user)):
    try:
        data = get_heygen_status(job_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"HeyGen error: {e}")

    return QuestionStatusResponse(
        status=data.get("status", "unknown"),
        video_url=data.get("video_url"),
    )


from pydantic import BaseModel
from fastapi import Depends, HTTPException

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