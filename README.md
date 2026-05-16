# 🧪 PRAGYA – Virtual STEM Lab

<p align="center">
  <img src="https://project-pragya-ui.onrender.com/favicon.svg" width="120" height="120" alt="PRAGYA Logo">
</p>

> *Every child deserves a science lab. PRAGYA puts one in their pocket.*

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit-2ecc71?style=flat&logo=firefox)](https://project-pragya-ui.onrender.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-3498db?style=flat)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Production-27ae60?style=flat)](#)

---

## Problem Statement

India has over 1.5 million government schools serving over 260 million students — nearly 70% of the school-going population. The overwhelming majority of these schools lack basic science laboratories. According to the **UDISE+ 2021-22 report**, only 28% of government secondary schools have a functional physics lab, 26% have a chemistry lab, and a staggering 19% have access to any biology lab infrastructure.

This is not just a logistics problem — it is a structural barrier that kills curiosity and closes career paths. When a child in a rural village cannot see a pendulum swing, cannot measure voltage with a voltmeter, cannot watch a plant cell osmosize, they do not just miss a class 9 experiment. They lose their only window into what STEM could be. Without hands-on exposure, the pipeline from school to college to careers in science, engineering, and technology remains broken before it even begins. Trained science teachers are scarce — over 40% of science teacher positions in government schools remain vacant per **MHRD data** — and even when teachers exist, they are forced to teach abstract concepts without any experimental validation. The result is rote memorization, fear of science, and an entire generation locked out of innovation.

---

## Our Approach

PRAGYA replaces the physical laboratory with a browser-based virtual simulation engine that delivers authentic, interactive lab experiences without any hardware dependency. Every experiment is built on top of physics-accurate simulation logic using HTML5 Canvas, meaning students manipulate real variables — mass, voltage, temperature, concentration — and see real-time results, exactly as they would in a physical lab.

We combine this simulation layer with an AI tutor that sits inside every experiment. The tutor provides contextual hints when a student is stuck, detects conceptual gaps through answer pattern analysis, and generates adaptive quizzes based on individual performance. All of this runs client-side or with minimal server calls, making PRAGYA functional even on low-bandwidth connections common in rural India.

We designed for scale from day one. The entire frontend is a single-page React application that loads under 2MB and works offline once cached. The backend is a lightweight FastAPI service that can run on a single $5 server. We support five Indian languages out of the box — English, Hindi, Kannada, Telugu, and Tamil — because the problem is not just access, it is access in a language the student understands.

---

## How PRAGYA Solves It

- 🔬 **No physical labs in government schools** → Virtual simulations run in any browser, on any device, zero hardware required
- 🔬 **Lack of trained science teachers** → AI tutor provides personalized hints, explanations, and adaptive quizzes 24/7
- 🔬 **Students cannot afford expensive lab equipment** → All simulations are free, open-source, and require only a smartphone or school computer
- 🔬 **Rural areas have poor or no internet** → Offline-first architecture caches experiments; works on 2G with graceful degradation
- 🔬 **Language barrier in Tier 2/3 cities** → Full UI and experiment content available in 5 regional Indian languages
- 🔬 **Teachers have no visibility into student progress** → Teacher dashboard shows mastery heatmaps, intervention alerts, and weekly reports

---

## Features

- 🧪 **10 NCERT-aligned virtual experiments** across Physics, Chemistry, and Biology (Classes 6–12)
- 🤖 **AI-powered tutor** with contextual hints, gap analysis, and adaptive quizzes
- 📊 **Teacher dashboard** with live mastery heatmaps and intervention alerts
- 🌐 **5 Indian languages** — English, Hindi, Kannada, Telugu, Tamil
- 📱 **Offline-first** — works on 2GB RAM Android with minimal connectivity
- 📈 **Real-time graphing** — live data visualization using Recharts

---

## Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-18-61dafb?logo=react) ![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite) ![React Router](https://img.shields.io/badge/React_Router-6-fca311?logo=react-router) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer) ![Recharts](https://img.shields.io/badge/Recharts-3-^3f76a4)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi) ![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python) ![SQLite](https://img.shields.io/badge/SQLite-async-003B57?logo=sqlite)

### AI & Auth
![PyJWT](https://img.shields.io/badge/PyJWT-2.9-d63aff) ![Bcrypt](https://img.shields.io/badge/Bcrypt-4.2-d01d2d) ![Rule-based AI](https://img.shields.io/badge/AI-Rule_based-orange)

### Infrastructure
![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker) ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx) ![Render](https://img.shields.io/badge/Render-Deployed-46e3b7?logo=render)

---

## File Structure

<details>
<summary>Project Directory Tree</summary>

```
pragya/
├── frontend/                    # React 18 + Vite SPA
│   ├── src/
│   │   ├── pages/               # Route pages (Login, Dashboard, Lab, etc.)
│   │   ├── components/          # Reusable UI (Navbar, AITutorChat, etc.)
│   │   ├── simulations/         # Physics/Chemistry/Biology simulation engines
│   │   ├── hooks/               # Custom React hooks (useAuth, useTheme)
│   │   ├── utils/               # API client, translations, experiment data
│   │   └── styles/              # Global CSS tokens and utilities
│   ├── Dockerfile               # Multi-stage build with Nginx
│   ├── nginx.conf               # SPA routing + API proxy
│   └── vite.config.js
│
├── backend/                     # FastAPI REST API
│   ├── main.py                  # App entry, CORS, lifespan, routers
│   ├── routers/
│   │   ├── auth.py              # Login, register, JWT validation
│   │   ├── experiments.py       # Experiment CRUD and session tracking
│   │   ├── student.py           # Progress, quizzes, profile endpoints
│   │   ├── teacher.py           # Class overview, heatmap, alerts
│   │   └── ai_tutor.py          # Hint generation, gap analysis
│   ├── utils/
│   │   ├── database.py          # Async SQLite initialization
│   │   └── auth.py              # JWT token creation and verification
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml           # Full-stack orchestration
```
</details>

---

## Getting Started

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Python** 3.10+ and **pip**

### Installation

```bash
# Frontend
cd frontend && npm install

# Backend
cd backend && pip install -r requirements.txt
```

### Run Locally

**Terminal 1 – Backend:**
```bash
cd backend
cp .env.example .env
uvicorn main:app --reload --port 8000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** to view the app.

### Demo Credentials
| Role | Email | Password |
|------|-------|----------|
| Student | demo@pragya.in | demo123 |
| Teacher | teacher@pragya.in | demo123 |

---

## Challenges Faced

- **Problem:** Canvas-based physics simulations are computationally heavy on low-end Android devices. **Fix:** Optimized rendering loops, reduced polygon counts, and added requestAnimationFrame throttling for smoother 30fps performance on older devices.

- **Problem:** Building an AI tutor that works offline without requiring expensive API calls. **Fix:** Implemented a rule-based hint engine with heuristic decision trees; only escalates to LLM API when offline mode detects connectivity.

- **Problem:** SQLite is not built for concurrent writes in production. **Fix:** Switched to asyncpg with connection pooling and refactored all database calls to async/await, plus added proper transaction handling.

- **Problem:** CORS and cookie-based auth don't work well across domains on Render. **Fix:** Switched to Authorization header with Bearer tokens, explicitly allowed production origin in CORS middleware.

- **Problem:** Offline functionality requires aggressive caching but session state must stay secure. **Fix:** Used Service Worker for static asset caching while keeping auth tokens in memory-only storage to prevent XSS token theft.

---

## Lessons Learned

- Build for the lowest-spec device first — performance bottlenecks reveal themselves only when you test on a ₹6,000 Android phone, not on a MacBook.
- Offline-first is not "add a service worker" — it requires rethinking every API call, every state update, and every user flow to gracefully degrade without breaking.
- AI features need a fallback chain — local rules → cached LLM responses → human teacher escalation — because real-world connectivity is too unpredictable.
- Document your environment variables early — .env.example and clear startup instructions saved hours of debugging across team machines.

---

## Roadmap

- [x] 10 virtual experiments (Physics, Chemistry, Biology)
- [x] AI tutor with contextual hints and adaptive quizzes
- [x] Teacher dashboard with mastery heatmaps
- [x] 5 Indian languages (en, hi, kn, te, ta)
- [x] Offline-first PWA with service worker
- [ ] Virtual reality (WebXR) experiment support
- [ ] Blockchain-based certificates and achievement badges
- [ ] Parent mobile app for progress notifications
- [ ] Integration with government DIKSHA platform
- [ ] Voice-first UI for visually impaired students

---

## Team & Contact

| Name | Role | GitHub | LinkedIn |
|------|------|--------|----------|
| Sathvik Hegade | Full Stack Developer & AI Engineer | [GitHub](https://github.com/sathvikhegade) | [LinkedIn](https://linkedin.com/in/sathvik-hegade) |

---

*Looking forward to improving the system design.*