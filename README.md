# Tutorly — Profesorul tau digital (AI Tutor)

**Tutorly** este o platforma educationala care transforma un avatar (inclusiv dintr-o fotografie) intr-un **profesor digital expresiv** (text + voce + video). Acesta explica conceptele **pas cu pas**, intr-un stil conversational, combinand tutoratul AI, gamificarea si urmarirea progresului pentru a creste implicarea elevilor.

**Live demo:** https://tutorly-indol.vercel.app

---

## Cuprins
- [De ce Tutorly](#de-ce-tutorly)
- [Functionalitati](#functionalitati)
- [Cum functioneaza](#cum-functioneaza)
- [Tech Stack](#tech-stack)
- [Structura proiectului](#structura-proiectului)
- [Rulare locala](#rulare-locala)
  - [1. Prerechizite](#1-prerechizite)
  - [2. Clonare si instalare](#2-clonare-si-instalare)
  - [3. Configurare variabile de mediu](#3-configurare-variabile-de-mediu)
  - [4. Pornire backend (FastAPI)](#4-pornire-backend-fastapi)
  - [5. Pornire frontend (React)](#5-pornire-frontend-react)
  - [6. Verificare rapida](#6-verificare-rapida)
- [Rulare cu Docker](#rulare-cu-docker)
- [Deployment](#deployment)
- [Bune practici si securitate](#bune-practici-si-securitate)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Echipa](#echipa)

---

## De ce Tutorly

**Provocari reale in educatie:**
- Atentie fragmentata: lectiile pasive isi pierd rapid eficienta.
- Feedback rigid: elevii au nevoie de explicatii adaptate nivelului lor, pe loc.
- Interactiune redusa: invatarea devine consum de continut, nu dialog.

**Solutia Tutorly:**
- Dialog activ (intrebare -> explicatie -> verificare).
- Explicatii pas cu pas cu pasi intermediari clari.
- Profesor digital expresiv (video/audio, nu doar text).
- Gamificare pentru motivare si progres vizibil.

---

## Functionalitati

### Pentru elevi
- Tutor conversational (Q&A): clarificari rapide si contextuale.
- Quiz-uri personalizate: nivel, ritm si stil adaptabil.
- Explicatii pas cu pas + feedback instant.
- Gamificare: XP, level-up, leaderboard.
- Progres si statistici: evolutie, consistenta, preferinte.

### Pentru profesori / creatori
- Avatar Studio: personalizare profesor digital (inclusiv pe baza de prompt).
- Control: roluri si control acces (elev/profesor).

### Platforma
- Interfata web moderna.
- Persistenta in cloud (Firestore).
- Deploy rapid (Vercel + Render).

---

## Cum functioneaza

Pipeline simplificat:
1. Input elev: text sau voce.
2. (Optional) STT: voce -> text (ex: Whisper).
3. LLM: model local (ex: Llama 3.2 3B cuantizat via Ollama) genereaza explicatia.
4. Generare expresiva: raspuns -> audio + video (ex: TTS + HeyGen / SadTalker).
5. Output: video + transcript in UI.

> Nota: Componentele de voce/video pot fi rulate in moduri diferite (API extern, local, hibrid), in functie de chei si infrastructura.

---

## Tech Stack

| Componenta | Tehnologie |
| :--- | :--- |
| Frontend | React, TypeScript, Vite |
| Backend | FastAPI (Python) |
| Database | Firebase Firestore |
| LLM | Llama 3.2 3B (quantized) via Ollama |
| Voice/Video | Whisper (STT) + TTS + HeyGen / SadTalker |
| Deployment | Vercel (FE) + Render (BE) |
| DevOps | Docker |

---

## Structura proiectului

Proiectul este organizat ca un monorepo:

```text
Tutorly/
├── frontend/        # Aplicatia web (React + TS)
└── backend/         # API (FastAPI) + integrare Firestore + servicii AI
```

---

## Rulare locala

### 1. Prerechizite

Asigura-te ca ai instalat:

* Git
* Node.js (recomandat 18+)
* Python (recomandat 3.10+)
* Proiect Firebase + Firestore activat
* (Optional) Docker
* (Optional) Ollama (daca rulezi LLM local)

### 2. Clonare si instalare

```bash
git clone https://github.com/MihaiMunteanu1/Tutorly.git
```

### 3. Configurare variabile de mediu

Recomandare: creeaza fisiere `.env` locale pornind de la `.env.example`.

**Backend (`backend/.env`):**

```env
HEYGEN_API_KEY=...
JWT_SECRET=...
HEYGEN_API_LIVEAVATAR_KEY=...

# Configurare Email (SMTP)
SMTP_SERVER=...
SMTP_PORT=...
SMTP_USERNAME=...
SMTP_PASSWORD=...
```

**Frontend (`frontend/.env`):**

```env
VITE_API_BASE_URL=http://localhost:8000
# Daca folosesti Firebase SDK direct in FE, adauga variabilele VITE_FIREBASE_*
```

### 4. Pornire backend (FastAPI)

Deschide un terminal in folderul `backend`:

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

Backend disponibil la: `http://localhost:8000` (Docs: `/docs`)

### 5. Pornire frontend (React)

Deschide un terminal nou in folderul `frontend`:

```bash
cd frontend
npm install
npm run dev
```

Frontend disponibil la: `http://localhost:5173`

### 6. Verificare rapida

1. Deschide frontend-ul in browser.
2. Testeaza functionalitatea de chat / login.
3. Daca folosesti LLM local, asigura-te ca Ollama ruleaza si modelul este descarcat.

---

## Rulare cu Docker

Daca ai `docker-compose.yml` in radacina proiectului, poti porni totul cu o singura comanda:

```bash
docker compose up --build
```

> Aceasta va porni backend-ul si frontend-ul in containere izolate.

---

## Deployment

### Frontend (Vercel)

1. Seteaza `VITE_API_BASE_URL` catre URL-ul backend-ului public (ex: Render).
2. Conecteaza repo-ul GitHub la Vercel.
3. Deploy automat la push pe branch-ul principal.

### Backend (Render)

1. Conecteaza repo-ul in Render.
2. Selecteaza folderul `backend/` ca Root Directory.
3. Adauga variabilele de mediu in Render Dashboard.
4. Important: gestioneaza credentialele Firebase ca secret file sau variabila de mediu, nu le urca in repo.

### Firestore (Firebase)

1. Configureaza colectiile si regulile (security rules).
2. Activeaza autentificarea daca folosesti Firebase Auth.

---

## Bune practici si securitate

* Chei: nu stoca niciodata chei in Git. Foloseste `.env`.
* CORS: limiteaza originile permise in production.
* Logging: nu loga token-uri sau date personale.
* Rate limiting: recomandat pentru endpoint-urile AI.
* Validari: sanitizarea input-urilor de la utilizatori.

---

## Troubleshooting

| Problema                 | Solutie posibila                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------- |
| Frontend nu vede Backend | Verifica `VITE_API_BASE_URL` si setarile CORS din backend.                         |
| Erori Firestore          | Verifica `FIREBASE_PROJECT_ID`, credentialele si Security Rules.                   |
| Ollama nu raspunde       | Verifica daca ruleaza pe portul 11434 si daca modelul este corect setat in `.env`. |
| Erori Video/TTS          | Verifica cheile API si cotele de utilizare (quota).                                |

---

## Roadmap

* [ ] Planuri de invatare pe saptamani + obiective clare.
* [ ] Adaptive tutoring: diagnostic + remediere personalizata.
* [ ] Import materiale (PDF) + generare quiz automat.
* [ ] Mod "Parent View" pentru rapoarte.
* [ ] Teste A/B pentru stiluri de predare.

---

## Contributing

PR-urile sunt binevenite!

1. Fork repo.
2. Creeaza branch: `feat/nume` sau `fix/nume`.
3. Commit-uri clare.
4. PR cu descriere si screenshots.

---

## Echipa

* Munteanu Mihai
* Moise Ioana
* Marginean Dan

