# 🧪 PRAGYA – AI-Powered Virtual STEM Labs

> *"Every child deserves a science lab. PRAGYA puts one in their pocket."*

---

## 🎯 What is PRAGYA?

PRAGYA is a **production-ready, full-stack web application** that democratises STEM education for government and rural school students across India by providing:

- 🔬 **10 NCERT-aligned virtual lab experiments** (Physics, Chemistry, Biology · Class 6–12)
- 🤖 **On-device AI tutoring** with personalised hints, gap detection, and adaptive quizzes
- 📊 **Teacher dashboard** with live mastery heatmaps, intervention alerts, and weekly reports
- 📱 **Offline-first architecture** – works on 2GB RAM Android with zero internet
- 🗣️ **5 Indian languages** – English, Hindi, Kannada, Telugu, Tamil

---

## 🚀 Quick Start (3 Steps)

### Prerequisites
- **Node.js** 18+ and **npm** 9+
- **Python** 3.10+ and **pip**

### 1. Clone & Install

```bash
# Frontend
cd frontend
npm install

# Backend
cd ../backend
pip install -r requirements.txt
```

### 2. Start Development Servers

**Terminal 1 – Backend:**
```bash
cd backend
cp .env.example .env
uvicorn main:app --reload --port 8000
```

**Terminal 2 – Frontend:**
```bash
cd frontend
cp .env.example .env
npm run dev
```

### 3. Open the App

```
Frontend:  http://localhost:3000
Backend:   http://localhost:8000
API Docs:  http://localhost:8000/docs
```

### Demo Accounts (pre-seeded)
| Role | Email | Password |
|------|-------|----------|
| Student | demo@pragya.in | demo123 |
| Teacher | teacher@pragya.in | demo123 |

> Or click **"Demo as Student"** / **"Demo as Teacher"** on the login page.

---

## 🐳 Docker Deployment (Zero-Downtime)

```bash
# From the project root
docker-compose up -d --build

# App is live at:
# http://localhost        → Frontend
# http://localhost:8000   → Backend API
# http://localhost:8000/docs → Swagger UI
```

### Health check
```bash
curl http://localhost:8000/health
# {"status":"healthy","service":"pragya-api"}
```

---

## 📁 Project Structure

```
ProjectPRAGYA/
├── frontend/                   # React 18 + Vite SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx       # Public marketing page
│   │   │   ├── LoginPage.jsx         # Auth (login + register)
│   │   │   ├── Dashboard.jsx         # Student dashboard
│   │   │   ├── LabLibrary.jsx        # Experiment browser with filters
│   │   │   ├── ExperimentView.jsx    # Live simulation + AI tutor
│   │   │   ├── TeacherDashboard.jsx  # Analytics + alerts + heatmap
│   │   │   └── StudentProfile.jsx    # Profile + achievements + history
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Responsive nav + language switcher
│   │   │   ├── ProtectedRoute.jsx    # Auth guard
│   │   │   └── LoadingScreen.jsx     # Branded loader
│   │   ├── hooks/
│   │   │   ├── useAuth.jsx           # AuthContext + JWT management
│   │   │   └── useTheme.jsx          # Language preference
│   │   ├── utils/
│   │   │   ├── api.js                # Typed API client
│   │   │   └── experiments.js        # Experiment data constants
│   │   └── styles/globals.css        # Design system tokens + utilities
│   ├── Dockerfile                    # Multi-stage build with Nginx
│   ├── nginx.conf                    # SPA routing + API proxy
│   └── vite.config.js
│
├── backend/                    # FastAPI + SQLite
│   ├── main.py                       # App entry, CORS, lifespan
│   ├── routers/
│   │   ├── auth.py                   # Login, register, /me
│   │   ├── experiments.py            # CRUD + session tracking
│   │   ├── student.py                # Progress, quizzes, profile
│   │   ├── teacher.py                # Overview, heatmap, alerts
│   │   └── ai_tutor.py               # Hints, analysis, quiz generation
│   ├── utils/
│   │   ├── database.py               # Async SQLite init + migrations
│   │   └── auth.py                   # JWT + bcrypt utilities
│   ├── requirements.txt
│   └── Dockerfile
│
└── docker-compose.yml          # Full-stack orchestration
```

---

## 🧪 Experiments Catalogue

| # | Experiment | Subject | Class | Difficulty |
|---|-----------|---------|-------|-----------|
| 1 | Simple Pendulum | Physics | 9 | Beginner |
| 2 | Ohm's Law | Physics | 10 | Intermediate |
| 3 | Acid-Base Indicators | Chemistry | 7 | Beginner |
| 4 | Photosynthesis Rate | Biology | 10 | Intermediate |
| 5 | Projectile Motion | Physics | 11 | Advanced |
| 6 | Cell Division – Mitosis | Biology | 11 | Advanced |
| 7 | Electrolysis of Water | Chemistry | 8 | Beginner |
| 8 | Refraction of Light | Physics | 10 | Intermediate |
| 9 | Osmosis in Plant Cells | Biology | 9 | Intermediate |
| 10 | Calorimetry – Specific Heat | Chemistry | 11 | Advanced |

---

## 🔌 API Reference

```
POST /api/auth/login          – Student/teacher login
POST /api/auth/register       – New account
GET  /api/auth/me             – Current user profile

GET  /api/experiments         – List all (with filters)
GET  /api/experiments/:id     – Single experiment
POST /api/experiments/:id/start  – Begin session
POST /api/experiments/:id/submit – Submit results

GET  /api/student/progress    – Experiment history
GET  /api/student/quizzes     – Quiz history
GET  /api/student/profile     – Profile data
PUT  /api/student/profile     – Update profile

GET  /api/teacher/overview    – Class stats
GET  /api/teacher/students    – All students
GET  /api/teacher/heatmap     – Mastery grid
GET  /api/teacher/alerts      – Intervention alerts
GET  /api/teacher/report/weekly – PDF-ready weekly report

POST /api/ai/hint             – Context-aware hint
POST /api/ai/analyze          – Score analysis + recommendations
POST /api/ai/quiz/:id         – Generate adaptive quiz
```

Full interactive docs: **http://localhost:8000/docs**

---

## 🌐 Language Support

| Code | Language | Native |
|------|----------|--------|
| en | English | English |
| hi | Hindi | हिन्दी |
| kn | Kannada | ಕನ್ನಡ |
| te | Telugu | తెలుగు |
| ta | Tamil | தமிழ் |

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, React Router v6, CSS Modules |
| Simulation | Native Canvas API (physics-accurate) |
| Backend | FastAPI, Uvicorn, Pydantic v2 |
| Database | SQLite via aiosqlite (async) |
| Auth | JWT (PyJWT) + bcrypt |
| Container | Docker + Docker Compose + Nginx |
| AI Engine | Rule-based (offline) + REST hooks for LLM |

---

## ☁️ Production Deployment

### Option A: Docker (Recommended)
```bash
docker-compose up -d --build
```

### Option B: Railway / Render
1. Push to GitHub
2. Connect repo → Backend service (Python), Frontend service (Node)
3. Set env vars: `SECRET_KEY`, `DB_PATH`

### Option C: AWS / GCP
```bash
# Backend
docker build -t pragya-backend ./backend
docker run -d -p 8000:8000 -e SECRET_KEY=... pragya-backend

# Frontend (serve with Nginx after npm run build)
cd frontend && npm run build
# Deploy dist/ to S3, GCS, or Nginx
```

---

## 👥 Team

- Sathvik Hegade

---

## 📄 Licence

MIT © 2026 Project PRAGYA
