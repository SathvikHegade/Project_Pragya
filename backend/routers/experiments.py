from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter()

EXPERIMENTS_DB = [
    {"id": "pendulum", "title": "Simple Pendulum", "subject": "Physics", "class": "Class 9", "chapter": "Gravitation", "difficulty": "Beginner", "duration": "20 min", "icon": "🔭"},
    {"id": "ohms-law", "title": "Ohm's Law", "subject": "Physics", "class": "Class 10", "chapter": "Electricity", "difficulty": "Intermediate", "duration": "25 min", "icon": "⚡"},
    {"id": "acid-base", "title": "Acid-Base Indicators", "subject": "Chemistry", "class": "Class 7", "chapter": "Acids, Bases and Salts", "difficulty": "Beginner", "duration": "15 min", "icon": "🧪"},
    {"id": "photosynthesis", "title": "Photosynthesis Rate", "subject": "Biology", "class": "Class 10", "chapter": "Life Processes", "difficulty": "Intermediate", "duration": "30 min", "icon": "🌿"},
    {"id": "projectile", "title": "Projectile Motion", "subject": "Physics", "class": "Class 11", "chapter": "Laws of Motion", "difficulty": "Advanced", "duration": "35 min", "icon": "🎯"},
    {"id": "mitosis", "title": "Cell Division – Mitosis", "subject": "Biology", "class": "Class 11", "chapter": "Cell Cycle", "difficulty": "Advanced", "duration": "25 min", "icon": "🔬"},
    {"id": "electrolysis", "title": "Electrolysis of Water", "subject": "Chemistry", "class": "Class 8", "chapter": "Chemical Effects of Electric Current", "difficulty": "Beginner", "duration": "20 min", "icon": "💧"},
    {"id": "refraction", "title": "Refraction of Light", "subject": "Physics", "class": "Class 10", "chapter": "Light – Reflection and Refraction", "difficulty": "Intermediate", "duration": "25 min", "icon": "🌈"},
    {"id": "osmosis", "title": "Osmosis in Plant Cells", "subject": "Biology", "class": "Class 9", "chapter": "Fundamental Unit of Life", "difficulty": "Intermediate", "duration": "20 min", "icon": "🧫"},
    {"id": "calorimetry", "title": "Calorimetry – Specific Heat", "subject": "Chemistry", "class": "Class 11", "chapter": "Thermodynamics", "difficulty": "Advanced", "duration": "30 min", "icon": "🌡️"},
]

class StartSession(BaseModel):
    variables: dict = {}

class SubmitSession(BaseModel):
    variables: dict = {}
    observations: list = []
    score: int = 0
    duration_seconds: int = 0

class ObservationCreate(BaseModel):
    text: str

@router.get("/")
async def list_experiments(
    subject: Optional[str] = None,
    cls: Optional[str] = None,
    difficulty: Optional[str] = None,
    current_user=Depends(get_current_user)
):
    experiments = EXPERIMENTS_DB
    if subject and subject != "All":
        experiments = [e for e in experiments if e["subject"] == subject]
    if cls and cls != "All":
        experiments = [e for e in experiments if e["class"] == cls]
    if difficulty and difficulty != "All":
        experiments = [e for e in experiments if e["difficulty"] == difficulty]
    return {"experiments": experiments, "total": len(experiments)}

@router.get("/{experiment_id}")
async def get_experiment(experiment_id: str, current_user=Depends(get_current_user)):
    exp = next((e for e in EXPERIMENTS_DB if e["id"] == experiment_id), None)
    if not exp:
        raise HTTPException(status_code=404, detail="Experiment not found")
    return exp

@router.post("/{experiment_id}/start")
async def start_session(experiment_id: str, body: StartSession, current_user=Depends(get_current_user), db=Depends(get_db)):
    import json
    session_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO experiment_sessions (id, user_id, experiment_id, variables) VALUES (?,?,?,?)",
        (session_id, current_user["id"], experiment_id, json.dumps(body.variables))
    )
    await db.commit()
    return {"session_id": session_id, "status": "started"}

@router.post("/{experiment_id}/submit")
async def submit_session(experiment_id: str, body: SubmitSession, current_user=Depends(get_current_user), db=Depends(get_db)):
    import json
    from datetime import datetime
    session_id = str(uuid.uuid4())
    await db.execute(
        "INSERT INTO experiment_sessions (id, user_id, experiment_id, variables, observations, score, completed, duration_seconds, completed_at) VALUES (?,?,?,?,?,?,?,?,?)",
        (session_id, current_user["id"], experiment_id, json.dumps(body.variables), json.dumps(body.observations), body.score, 1, body.duration_seconds, datetime.utcnow().isoformat())
    )
    await db.commit()
    return {"session_id": session_id, "score": body.score, "status": "completed"}

@router.get("/{experiment_id}/observations")
async def list_observations(experiment_id: str, current_user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute(
        "SELECT id, text, created_at FROM observations WHERE user_id=? AND experiment_id=? ORDER BY created_at ASC",
        (current_user["id"], experiment_id)
    ) as cur:
        rows = await cur.fetchall()
    return {"observations": [dict(r) for r in rows]}

@router.post("/{experiment_id}/observations")
async def add_observation(experiment_id: str, body: ObservationCreate, current_user=Depends(get_current_user), db=Depends(get_db)):
    text = (body.text or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Observation text is required")
    obs_id = str(uuid.uuid4())
    created_at = datetime.utcnow().isoformat()
    await db.execute(
        "INSERT INTO observations (id, user_id, experiment_id, text, created_at) VALUES (?,?,?,?,?)",
        (obs_id, current_user["id"], experiment_id, text, created_at)
    )
    await db.commit()
    return {"id": obs_id, "experiment_id": experiment_id, "text": text, "created_at": created_at}
