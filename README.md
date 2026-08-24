# PRAGYA – Virtual STEM Lab

A browser-based virtual science laboratory that brings hands-on STEM experiments to students without access to physical labs.

MIT License  
v1.0.0  
Node 18+ • Python 3.10+  
PRs welcome  
[Live demo →](https://project-pragya-ui.onrender.com/)

---

## Problem Statement

India has over 260 million students in government schools, but only 28% have a functional physics lab, 26% have a chemistry lab, and 19% have access to any biology lab. Without hands-on experimentation, students resort to rote memorization, lose curiosity in science, and are locked out of STEM careers. The problem is compounded by a 40% vacancy rate in science teacher positions and poor connectivity in rural areas.

---

## How I Solved It

PRAGYA replaces the physical laboratory with a browser-based simulation engine. Every experiment uses physics-accurate calculations — students manipulate real variables like mass, voltage, temperature, and concentration, seeing real-time results just like in a physical lab. Combined with an AI tutor that provides contextual hints, detects conceptual gaps, and generates adaptive quizzes, students get personalized learning without requiring a teacher present. The entire frontend works offline once cached, making it functional even on 2G connections common in rural India.

---

## Approach

1. **Physics-accurate simulation engine** — Built on HTML5 Canvas with real-time variable manipulation. Students don't just see animations; they change inputs and observe authentic physical/chemical/biological outcomes. This was the foundation — without realistic simulations, there's no value.

2. **Rule-based AI tutor with fallback chain** — Implemented a heuristic decision tree that provides hints based on student actions. Only escalates to LLM API when connectivity is available. This ensures the AI works even offline — the critical requirement for rural deployment.

3. **Offline-first React frontend + lightweight FastAPI backend** — The SPA loads under 2MB and caches via Service Worker. The backend runs on a single $5 server. This architecture was chosen specifically to work on low-end Android devices (2GB RAM) and unreliable connections.

---

## Challenges Faced

01. **Canvas performance on low-end devices** — Physics simulations were computationally heavy on ₹6,000 Android phones. Diagnosed through device testing and fixed by optimizing rendering loops, reducing polygon counts, and adding requestAnimationFrame throttling for smooth 30fps.

02. **AI tutor without expensive API dependencies** — Needed an AI that works offline without requiring per-call payments. Built a rule-based hint engine with heuristic decision trees that analyzes student answers locally, only calling external APIs when connectivity exists.

03. **CORS and auth across production domains** — Bearer token auth with cookies failed across Render's domain setup. Fixed by explicitly allowing production origin in CORS middleware and using Authorization headers instead of cookies.

---

## Features

- 10 NCERT-aligned virtual experiments across Physics, Chemistry, and Biology (Classes 6–12)
- AI-powered tutor with contextual hints, gap analysis, and adaptive quizzes
- Teacher dashboard with live mastery heatmaps and intervention alerts
- 5 Indian languages — English, Hindi, Kannada, Telugu, Tamil
- Offline-first — works on 2GB RAM Android with minimal connectivity
- Real-time graphing with live data visualization
- JWT-based authentication with role separation (Student/Teacher)

---

## Quick Start

### Install

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

Open **http://localhost:5173**

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Student | demo@pragya.in | demo123 |
| Teacher | teacher@pragya.in | demo123 |

---

## Installation

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- **Python** 3.10+ and **pip**

### Setup

```bash
git clone https://github.com/sathvikhegade/pragya.git
cd pragya

# Frontend
cd frontend && npm install

# Backend
cd ../backend
pip install -r requirements.txt
cp .env.example .env
```

---

## File Structure

```
pragya/
├── frontend/                        # React 18 + Vite SPA
│   ├── src/
│   │   ├── pages/                   # Route pages (Login, Dashboard, Lab, etc.)
│   │   ├── components/             # Reusable UI (Navbar, AITutorChat, etc.)
│   │   ├── simulations/            # Physics/Chemistry/Biology simulation engines
│   │   │   ├── CalorimetrySim.jsx
│   │   │   ├── ElectrolysisSim.jsx
│   │   │   ├── MitosisSim.jsx
│   │   │   ├── OhmsLawSim.jsx
│   │   │   ├── OsmosisSim.jsx
│   │   │   ├── PendulumSim.jsx
│   │   │   ├── PhotosynthesisSim.jsx
│   │   │   ├── ProjectileSim.jsx
│   │   │   ├── RefractionSim.jsx
│   │   │   └── AcidBaseSim.jsx
│   │   ├── hooks/                  # Custom hooks (useAuth, useTheme)
│   │   ├── utils/                  # API client, translations, experiment data
│   │   └── styles/                 # Global CSS tokens and utilities
│   ├── public/                     # Static assets
│   ├── Dockerfile                  # Multi-stage build with Nginx
│   ├── nginx.conf                  # SPA routing + API proxy
│   ├── vite.config.js
│   └── package.json
│
├── backend/                         # FastAPI REST API
│   ├── main.py                     # App entry, CORS, lifespan, routers
│   ├── requirements.txt
│   ├── .env.example
│   ├── Dockerfile
│   ├── routers/
│   │   ├── auth.py                 # Login, register, JWT validation
│   │   ├── experiments.py          # Experiment CRUD and session tracking
│   │   ├── student.py              # Progress, quizzes, profile endpoints
│   │   ├── teacher.py              # Class overview, heatmap, alerts
│   │   └── ai_tutor.py             # Hint generation, gap analysis
│   └── utils/
│       ├── database.py             # Async SQLite initialization
│       └── auth.py                 # JWT token creation and verification
│
├── docker-compose.yml              # Full-stack orchestration
└── README.md
```

---

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | http://localhost:8000/api | Backend API URL |
| `DATABASE_URL` | pragya.db | SQLite database path |
| `SECRET_KEY` | — | JWT signing secret (required) |
| `PORT` | 8000 | Backend server port |

---

## Usage

**Student – Run an experiment:**
```javascript
const response = await fetch('/api/experiments/ohms-law', {
  headers: { Authorization: `Bearer ${token}` }
});
const experiment = await response.json();
// Manipulate voltage, resistance, see current update in real-time
```

**Teacher – Get class progress:**
```javascript
const progress = await fetch('/api/teacher/class/heatmap', {
  headers: { Authorization: `Bearer ${teacherToken}` }
});
// Returns mastery levels per student per experiment
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Authenticate user |
| GET | /api/experiments | List all experiments |
| GET | /api/experiments/{id} | Get experiment details |
| POST | /api/student/progress | Save student progress |
| GET | /api/teacher/class/{id} | Get class overview |
| POST | /api/ai/tutor | Get AI hint or quiz |

---

## Contributing

Fork → branch → PR. Run lint checks before submitting.

```bash
cd frontend && npm run lint
```

See CONTRIBUTING.md for the full guide.

---

## Tech Stack

**Frontend:** React 18, Vite, React Router, Framer Motion, Recharts  
**Backend:** FastAPI, Python 3.10+, SQLite (async)  
**Infrastructure:** Docker, Nginx, Render

---

## License

MIT © 2026 Sathvik Hegade — see LICENSE for details.
