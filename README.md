# Tutorly — Profesorul tău digital (AI Tutor)

[![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20TypeScript-61DAFB?logo=react&logoColor=white)](#)
[![Backend](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi&logoColor=white)](#)
[![DB](https://img.shields.io/badge/Database-Firestore-FFCA28?logo=firebase&logoColor=black)](#)
[![Deploy](https://img.shields.io/badge/Deploy-Vercel%20%2B%20Render-000000?logo=vercel&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](#)

Tutorly este o platformă educațională care transformă un avatar (inclusiv dintr-o fotografie) într-un **profesor digital expresiv** (text + voce + video) care explică **pas cu pas**, într-un stil conversațional. Scopul este să crească implicarea elevilor, să ofere feedback rapid și să creeze un mediu de învățare mai “uman”.

🌐 **Live demo:** https://tutorly-vert.vercel.app

---

## Cuprins
- [De ce Tutorly](#de-ce-tutorly)
- [Funcționalități](#funcționalități)
- [Cum funcționează](#cum-funcționează)
- [Tech stack](#tech-stack)
- [Structura proiectului](#structura-proiectului)
- [Quickstart](#quickstart)
  - [Prerechizite](#prerechizite)
  - [Rulare locală](#rulare-locală)
  - [Variabile de mediu](#variabile-de-mediu)
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
- **Atenție fragmentată:** lecțiile lungi, pasive, pierd rapid interesul elevilor.
- **Feedback rigid:** elevii au nevoie de explicații adaptate nivelului lor, pe loc.
- **Interacțiune redusă:** „învățatul” devine consum de conținut, nu dialog.

Tutorly răspunde prin:
- **dialog activ** (întrebare → explicație → verificare),
- **explicații pas cu pas**, cu pași intermediari,
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

> Notă: componentele de video/voce pot fi rulate în diverse moduri (API extern, local, hibrid), în funcție de chei și infrastructură.

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
