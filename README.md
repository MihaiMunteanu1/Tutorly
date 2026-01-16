# Tutorly — Profesorul tău digital

Tutorly este o platformă educațională care transformă un avatar (inclusiv dintr-o fotografie) într-un **profesor digital expresiv** (text + voce + video) ce explică **pas cu pas**, într-un stil conversațional, pentru a menține atenția elevilor și pentru a oferi feedback instant. :contentReference[oaicite:2]{index=2}

🌐 Demo: https://tutorly-vert.vercel.app :contentReference[oaicite:3]{index=3}

---

## De ce Tutorly?

Problemele pe care le atacăm:
- **Deconectare**: copiii își pierd rapid interesul fără interactivitate
- **Feedback rigid**: lipsa îndrumării adaptate progresului individual
- **Atenție fragmentată**: lecțiile tradiționale lungi devin obositoare și ineficiente :contentReference[oaicite:4]{index=4}

Tutorly pune accent pe:
- dialog activ (nu consum pasiv),
- limbaj adaptat vârstei,
- siguranță emoțională și încurajare. :contentReference[oaicite:5]{index=5}

---

## Funcționalități

### Educaționale
- teste/quiz-uri **personalizate**
- dificultate progresivă
- variație mare de materii disponibile
- mediu sigur de învățare :contentReference[oaicite:6]{index=6}

### Gamificare
- XP + niveluri + leaderboard :contentReference[oaicite:7]{index=7}

### Software / Platformă
- acces **role-based** (elev / profesor)
- chat / video live cu profesorul digital
- “studio de avatare”
- tracking al progresului și preferințelor
- generare profesori pornind de la poze
- personalizare avatar pe bază de prompt
- interfață web intuitivă :contentReference[oaicite:8]{index=8}

---

## Cu ce ne diferențiem?

1. **Conversațional**: răspunde la întrebări, nu doar prezintă conținutul  
2. **Expresiv**: avatar cu voce și video, nu doar text  
3. **Pas cu pas**: oferă explicații intermediare, nu doar răspunsul final :contentReference[oaicite:9]{index=9}

---

## Arhitectură (pipeline)

Fluxul (simplificat):
1. Utilizatorul pune o întrebare (text sau voce)
2. Dacă e voce: **Whisper** (Voice → Text)
3. Întrebarea ajunge la **LLM** (Llama 3.2 3B, quantized, rulând prin **Ollama**) + prompt de tutor
4. Răspunsul este transformat în **Audio + Video** (TTS + HeyGen; opțional SadTalker)
5. Se livrează către UI: **video + transcript** :contentReference[oaicite:10]{index=10}

---

## Tech stack

- **Frontend**: React + TypeScript
- **Backend**: FastAPI + Firestore
- **LLM**: Llama 3.2 3B (quantized), via Ollama
- **STT/TTS**: Whisper (+ TTS)
- **Video**: HeyGen + SadTalker
- **Deployment**: Docker; Frontend pe Vercel; Backend pe Render; DB pe Firebase/Firestore :contentReference[oaicite:11]{index=11}

---

## Structura repo-ului

Repo-ul este organizat ca un monorepo:
- `frontend/`
- `backend/` :contentReference[oaicite:12]{index=12}

---

## Rulare locală (development)

> Notă: numele exacte ale fișierelor de configurare/variabilelor de mediu pot diferi. Dacă ai un `.env.example` în `frontend/` sau `backend/`, folosește-l ca referință.

### Cerințe
- Node.js (recomandat 18+)
- Python (recomandat 3.10+)
- Cont/proiect Firebase (Firestore)
- (Opțional) Docker
- (Dacă rulezi LLM local) Ollama + modelul configurat :contentReference[oaicite:13]{index=13}

### 1) Frontend
```bash
cd frontend
npm install
npm run dev
