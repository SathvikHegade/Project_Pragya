from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
import logging

from routers import auth, experiments, student, teacher, ai_tutor
from utils.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 PRAGYA Backend starting...")
    await init_db()
    logger.info("✅ Database initialised")
    yield
    logger.info("🛑 PRAGYA Backend shutting down")

app = FastAPI(
    title="PRAGYA API",
    description="AI-Powered Virtual STEM Lab for Equitable Education",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(experiments.router, prefix="/api/experiments", tags=["Experiments"])
app.include_router(student.router, prefix="/api/student", tags=["Student"])
app.include_router(teacher.router, prefix="/api/teacher", tags=["Teacher"])
app.include_router(ai_tutor.router, prefix="/api/ai", tags=["AI Tutor"])

@app.get("/")
async def root():
    return {
        "project": "PRAGYA",
        "tagline": "Every child deserves a science lab.",
        "version": "1.0.0",
        "status": "running",
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "pragya-api"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
