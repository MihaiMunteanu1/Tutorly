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
