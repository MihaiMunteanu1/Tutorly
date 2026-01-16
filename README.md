# 🎓 Tutorly — Profesorul tău digital (AI Tutor)

**Tutorly** este o platformă educațională care transformă un avatar (inclusiv dintr-o fotografie) într-un **profesor digital expresiv** (text + voce + video). Acesta explică conceptele **pas cu pas**, într-un stil conversațional, combinând tutoratul AI, gamificarea și urmărirea progresului pentru a crește implicarea elevilor.

🌐 **Live demo:** [https://tutorly-vert.vercel.app](https://tutorly-vert.vercel.app)

---

## 📑 Cuprins
- [De ce Tutorly](#-de-ce-tutorly)
- [Funcționalități](#-funcționalități)
- [Cum funcționează](#-cum-funcționează)
- [Tech Stack](#-tech-stack)
- [Structura Proiectului](#-structura-proiectului)
- [Rulare Locală](#-rulare-locală)
  - [Prerechizite](#1-prerechizite)
  - [Clonare](#2-clonare--instalare)
  - [Variabile de Mediu](#3-configurare-variabile-de-mediu)
  - [Backend](#4-pornire-backend-fastapi)
  - [Frontend](#5-pornire-frontend-react)
- [Rulare cu Docker](#-rulare-cu-docker)
- [Deployment](#-deployment)
- [Bune practici & Securitate](#-bune-practici--securitate)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Echipa](#-echipa)

---

## 🚀 De ce Tutorly

**Provocări reale în educație:**
* ❌ **Atenție fragmentată:** lecțiile pasive își pierd rapid eficiența.
* ❌ **Feedback rigid:** elevii au nevoie de explicații adaptate nivelului lor, pe loc.
* ❌ **Interacțiune redusă:** învățarea devine consum de conținut, nu dialog.

**Soluția Tutorly:**
* ✅ **Dialog activ** (întrebare → explicație → verificare).
* ✅ **Explicații pas cu pas** cu pași intermediari clari.
* ✅ **Profesor digital expresiv** (video/audio, nu doar text).
* ✅ **Gamificare** pentru motivare și progres vizibil.

---

## ✨ Funcționalități

### 👨‍🎓 Pentru Elevi
* 🧠 **Tutor conversațional (Q&A):** Clarificări rapide și contextuale.
* 🧩 **Quiz-uri personalizate:** Nivel, ritm și stil adaptabil.
* 🎯 **Explicații pas cu pas** + feedback instant.
* 🏆 **Gamificare:** XP, level-up, leaderboard.
* 📈 **Progres & statistici:** Evoluție, consistență, preferințe.

### 🧑‍🏫 Pentru Profesori / Creatori
* 🎭 **Avatar Studio:** Personalizare profesor digital (inclusiv pe bază de prompt).
* 🔐 **Control:** Roluri & control acces (elev/profesor).

### ⚙️ Platformă
* Interfață web modernă.
* Persistență în cloud (Firestore).
* Deploy rapid (Vercel + Render).

---

## ⚙️ Cum funcționează

Pipeline simplificat:
1.  **Input elev:** Text sau voce.
2.  **(Opțional) STT:** Voce → text (ex: Whisper).
3.  **LLM:** Model local (ex: Llama 3.2 3B cuantizat via Ollama) generează explicația.
4.  **Generare expresivă:** Răspuns → audio + video (ex: TTS + HeyGen / SadTalker).
5.  **Output:** Video + transcript în UI.

> **Notă:** Componentele de voce/video pot fi rulate în moduri diferite (API extern, local, hibrid), în funcție de chei și infrastructură.

---

## 🛠️ Tech Stack

| Componentă | Tehnologie |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite |
| **Backend** | FastAPI (Python) |
| **Database** | Firebase Firestore |
| **LLM** | Llama 3.2 3B (quantized) via **Ollama** |
| **Voice/Video** | Whisper (STT) + TTS + HeyGen / SadTalker |
| **Deployment** | Vercel (FE) + Render (BE) |
| **DevOps** | Docker |

---

## 📂 Structura proiectului

Proiectul este organizat ca un monorepo:

```text
Tutorly/
├── frontend/        # Aplicația web (React + TS)
└── backend/         # API (FastAPI) + integrare Firestore + servicii AI
```
---

## 💻 Rulare Locală

### 1. Prerechizite

Asigură-te că ai instalat:

* Git
* Node.js (recomandat 18+)
* Python (recomandat 3.10+)
* Proiect Firebase + Firestore activat
* *(Opțional)* Docker
* *(Opțional)* Ollama (dacă rulezi LLM local)

### 2. Clonare & Instalare

```bash
git clone [https://github.com/MihaiMunteanu1/Tutorly.git](https://github.com/MihaiMunteanu1/Tutorly.git)
cd Tutorly

```

### 3. Configurare Variabile de Mediu

Recomandare: creează fișiere `.env` locale pornind de la `.env.example`.

**Backend (`backend/.env`):**

```env
APP_ENV=development
APP_HOST=0.0.0.0
APP_PORT=8000
CORS_ORIGINS=http://localhost:5173

# Firebase / Firestore
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CREDENTIALS_JSON=path_or_json_content

# LLM (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b-instruct-q4

# Video/TTS (dacă folosești API extern)
HEYGEN_API_KEY=your_key_here

```

**Frontend (`frontend/.env`):**

```env
VITE_API_BASE_URL=http://localhost:8000
# Dacă folosești Firebase SDK direct în FE, adaugă variabilele VITE_FIREBASE_*

```

### 4. Pornire Backend (FastAPI)

Deschide un terminal în folderul `backend`:

```bash
cd backend
python -m venv .venv

# Linux/macOS
source .venv/bin/activate

# Windows (PowerShell)
# .venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

```

✅ Backend disponibil la: `http://localhost:8000` (Docs: `/docs`)

### 5. Pornire Frontend (React)

Deschide un terminal **nou** în folderul `frontend`:

```bash
cd frontend
npm install
npm run dev

```

✅ Frontend disponibil la: `http://localhost:5173`

### 6. Verificare rapidă

1. Deschide frontend-ul în browser.
2. Testează funcționalitatea de chat / login.
3. Dacă folosești LLM local, asigură-te că Ollama rulează și modelul este descărcat.

---

## 🐳 Rulare cu Docker

Dacă ai `docker-compose.yml` în rădăcina proiectului, poți porni totul cu o singură comandă:

```bash
docker compose up --build

```

> Aceasta va porni backend-ul și frontend-ul în containere izolate.

---

## 🌍 Deployment

### Frontend (Vercel)

1. Setează `VITE_API_BASE_URL` către URL-ul backend-ului public (ex: Render).
2. Conectează repo-ul GitHub la Vercel.
3. Deploy automat la push pe branch-ul principal.

### Backend (Render)

1. Conectează repo-ul în Render.
2. Selectează folderul `backend/` ca Root Directory.
3. Adaugă variabilele de mediu în Render Dashboard.
4. **Important:** Gestionează credențialele Firebase ca secret file sau variabilă de mediu, nu le urca în repo.

### Firestore (Firebase)

1. Configurează colecțiile și regulile (security rules).
2. Activează autentificarea dacă folosești Firebase Auth.

---

## 🛡️ Bune practici & Securitate

* 🔑 **Chei:** Nu stoca niciodată chei în Git. Folosește `.env`.
* 🔒 **CORS:** Limitează originile permise în production.
* 🧾 **Logging:** Nu loga token-uri sau date personale.
* 🛡️ **Rate limiting:** Recomandat pentru endpoint-urile AI.
* ✅ **Validări:** Sanitizarea input-urilor de la utilizatori.

---

## 🔧 Troubleshooting

| Problemă | Soluție Posibilă |
| --- | --- |
| **Frontend nu vede Backend** | Verifică `VITE_API_BASE_URL` și setările CORS din backend. |
| **Erori Firestore** | Verifică `FIREBASE_PROJECT_ID`, credențialele și Security Rules. |
| **Ollama nu răspunde** | Verifică dacă rulează pe portul 11434 și dacă modelul este corect setat în `.env`. |
| **Erori Video/TTS** | Verifică cheile API și cotele de utilizare (quota). |

---

## 🗺️ Roadmap

* [ ] 🎓 Planuri de învățare pe săptămâni + obiective clare.
* [ ] 🧠 Adaptive tutoring: diagnostic + remediere personalizată.
* [ ] 📚 Import materiale (PDF) + generare quiz automat.
* [ ] 👨‍👩‍👧 Mod “Parent View” pentru rapoarte.
* [ ] 🧪 Teste A/B pentru stiluri de predare.

---

## 🤝 Contributing

PR-urile sunt binevenite!

1. Fork repo.
2. Creează branch: `feat/nume` sau `fix/nume`.
3. Commit-uri clare.
4. PR cu descriere și screenshots.

---

## 👥 Echipa

* **Munteanu Mihai**
* **Moise Ioana**
* **Mărginean Dan**
