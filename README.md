# Tutorly — Profesorul tău digital (AI Tutor)

Tutorly este o platformă educațională care transformă un avatar (inclusiv dintr-o fotografie) într-un **profesor digital expresiv** (text + voce + video) care explică **pas cu pas**, într-un stil conversațional. Platforma combină tutorat AI, gamificare și progres track-uit pentru a crește implicarea elevilor și a oferi feedback rapid.

🌐 **Live demo:** https://tutorly-vert.vercel.app

---

## Cuprins
- [De ce Tutorly](#de-ce-tutorly)
- [Funcționalități](#funcționalități)
- [Cum funcționează](#cum-funcționează)
- [Tech stack](#tech-stack)
- [Structura proiectului](#structura-proiectului)
- [Rulare locală](#rulare-locală)
  - [Prerechizite](#prerechizite)
  - [Clonare & instalare](#clonare--instalare)
  - [Configurare variabile de mediu](#configurare-variabile-de-mediu)
  - [Pornire backend (FastAPI)](#pornire-backend-fastapi)
  - [Pornire frontend (React)](#pornire-frontend-react)
  - [Verificare rapidă](#verificare-rapidă)
- [Rulare cu Docker](#rulare-cu-docker)
- [Deployment](#deployment)
- [Bune practici & securitate](#bune-practici--securitate)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Echipa](#echipa)
- [Licență](#licență)

---

## De ce Tutorly

Provocări reale în educație:
- **Atenție fragmentată:** lecțiile pasive își pierd rapid eficiența.
- **Feedback rigid:** elevii au nevoie de explicații adaptate nivelului lor, pe loc.
- **Interacțiune redusă:** învățarea devine consum de conținut, nu dialog.

Tutorly răspunde prin:
- **dialog activ** (întrebare → explicație → verificare),
- **explicații pas cu pas** cu pași intermediari,
- **profesor digital expresiv** (nu doar text),
- **gamificare** pentru motivare și progres.

---

## Funcționalități

### Pentru elevi
- 🧠 **Tutor conversațional** (Q&A) pentru clarificări rapide
- 🧩 **Quiz-uri personalizate** (nivel, ritm, stil)
- 🎯 **Explicații pas cu pas** + feedback instant
- 🏆 **Gamificare:** XP, level-up, leaderboard
- 📈 **Progres & statistici:** evoluție, consistență, preferințe

### Pentru profesori / creatori de conținut
- 🎭 **Avatar studio:** personalizare profesor digital (inclusiv pe bază de prompt)
- 🧑‍🏫 **Roluri & control acces** (elev/profesor), experiență adaptată

### Platformă
- 🌐 Interfață web modernă
- 🔐 Acces controlat pe roluri
- ☁️ Persistență în cloud (Firestore)
- 🚀 Deploy rapid (Vercel + Render)

---

## Cum funcționează

Pipeline (simplificat):
1. **Input elev**: text sau voce
2. (opțional) **STT**: voce → text (ex: Whisper)
3. **LLM**: model local (ex: Llama 3.2 3B cuantizat via Ollama) generează explicația în stil tutor
4. **Generare expresivă**: răspuns → audio + video (ex: TTS + HeyGen / SadTalker)
5. **Output**: video + transcript în UI

> Notă: componentele de voce/video pot fi rulate în moduri diferite (API extern, local, hibrid), în funcție de chei și infrastructură.

---

## Tech stack

- **Frontend:** React + TypeScript
- **Backend:** FastAPI (Python)
- **Database:** Firebase Firestore
- **LLM:** Llama 3.2 3B (quantized) via **Ollama**
- **Voice:** Whisper (STT) + TTS
- **Video:** HeyGen + (opțional) SadTalker
- **Deployment:** Vercel (frontend) + Render (backend)
- **Containerizare:** Docker

---

## Structura proiectului

Monorepo:
```text
Tutorly/
├─ frontend/        # aplicația web (React + TS)
└─ backend/         # API (FastAPI) + integrare Firestore + servicii AI

Rulare locală
Prerechizite

Asigură-te că ai instalat:

Git

Node.js (recomandat 18+)

Python (recomandat 3.10+)

Firebase project + Firestore activat

(opțional) Docker

(opțional) Ollama (dacă rulezi LLM local)

Clonare & instalare
git clone https://github.com/MihaiMunteanu1/Tutorly.git
cd Tutorly

Configurare variabile de mediu

Recomandare: creează fișiere .env locale pornind de la .env.example (dacă există în repo).
Nu urca niciodată chei reale în Git.

Backend (backend/.env)

Exemplu (ajustează după proiectul tău):

APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:5173

# Firebase / Firestore
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_JSON=path_or_json_here

# LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct-q4

# Video/TTS (dacă folosești API extern)
HEYGEN_API_KEY=your_key_here

Frontend (frontend/.env)
VITE_API_BASE_URL=http://localhost:8000


Dacă frontend folosește Firebase SDK direct, adaugă și variabilele VITE_FIREBASE_* conform proiectului tău Firebase.

Pornire backend (FastAPI)
cd backend
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000


✅ Backend ar trebui să fie disponibil la:

http://localhost:8000

Documentație API (dacă e activată): http://localhost:8000/docs

Pornire frontend (React)

Într-un terminal nou:

cd frontend
npm install
npm run dev


✅ Frontend pornește de obicei la:

http://localhost:5173

Verificare rapidă

Deschide frontend-ul în browser.

Verifică dacă aplicația poate apela backend-ul (de ex. login / chat / quiz).

Dacă ai funcționalitate LLM locală:

pornește Ollama

verifică OLLAMA_BASE_URL și OLLAMA_MODEL

Rulare cu Docker

Dacă ai Dockerfile / docker-compose.yml în repo:

docker compose up --build


Recomandare (dacă vrei să completezi proiectul):

docker-compose.yml în root cu servicii: backend, frontend, (opțional) ollama.

Deployment
Frontend (Vercel)

setează VITE_API_BASE_URL către backend-ul public (Render)

conectează repo-ul GitHub la Vercel

deploy automat la push pe branch-ul principal

Backend (Render)

conectează repo-ul

selectează root backend/

setează variabilele de mediu din Render Dashboard

gestionează credențialele Firebase ca secret, nu ca fișier în repo

Firestore (Firebase)

configurează colecții și reguli (security rules)

activează autentificarea dacă folosești auth

Bune practici & securitate

🔑 Cheile în env vars / secrets, niciodată în cod.

🔒 CORS: limitează originile permise în production.

🧾 Logging: nu loga token-uri/chei/date personale.

🛡️ Rate limiting (recomandat): endpoint-urile AI pot fi abuzate.

✅ Validări input: limite pentru prompt/audio și sanitizare.

Troubleshooting
Frontend nu vede backend-ul

verifică VITE_API_BASE_URL

verifică CORS în backend (CORS_ORIGINS)

verifică porturile (8000 / 5173)

Firestore errors

verifică FIREBASE_PROJECT_ID

verifică credențialele (service account) / permisiunile

verifică regulile Firestore

Ollama / LLM nu răspunde

verifică dacă rulează pe http://localhost:11434

verifică numele modelului setat în OLLAMA_MODEL

rulează manual: ollama list

Servicii video/TTS

verifică cheile API și limita de utilizare (quota)

verifică formatul cerut de provider (payload, voice id etc.)

Roadmap

🎓 Planuri de învățare pe săptămâni + obiective clare

🧠 Adaptive tutoring: diagnostic + remediere personalizată

📚 Import materiale (PDF) + generare quiz automat

👨‍👩‍👧 Mod “parent view” pentru rapoarte și recomandări

🧪 Teste A/B pentru stiluri de predare (scurt vs detaliat)

Contributing

PR-urile sunt binevenite.

Workflow recomandat:

Fork repo

Creează branch: feat/<nume> sau fix/<nume>

Commit-uri clare (ex: feat: add quiz difficulty scaling)

PR cu descriere + screenshots dacă e UI

Echipa

Munteanu Mihai

Moise Ioana

Mărginean Dan
