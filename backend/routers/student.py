from fastapi import APIRouter, Depends
from utils.database import get_db
from utils.auth import get_current_user

router = APIRouter()

@router.get("/progress")
async def get_progress(current_user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute(
        "SELECT experiment_id, MAX(score) as best_score, COUNT(*) as attempts, MAX(completed) as completed FROM experiment_sessions WHERE user_id=? GROUP BY experiment_id",
        (current_user["id"],)
    ) as cur:
        rows = await cur.fetchall()

    return {
        "user_id": current_user["id"],
        "experiments": [{"experiment_id": r["experiment_id"], "best_score": r["best_score"], "attempts": r["attempts"], "completed": bool(r["completed"])} for r in rows],
        "total_completed": sum(1 for r in rows if r["completed"]),
    }

@router.get("/quizzes")
async def get_quizzes(current_user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute(
        "SELECT * FROM quiz_attempts WHERE user_id=? ORDER BY attempted_at DESC LIMIT 20",
        (current_user["id"],)
    ) as cur:
        rows = await cur.fetchall()
    return {"quizzes": [dict(r) for r in rows]}

@router.get("/profile")
async def get_profile(current_user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE id=?", (current_user["id"],)) as cur:
        user = await cur.fetchone()
    if not user:
        return {"error": "User not found"}
    return {k: user[k] for k in ["id","name","email","role","class","school","language"]}

@router.put("/profile")
async def update_profile(data: dict, current_user=Depends(get_current_user), db=Depends(get_db)):
    allowed = {"name", "school", "class", "language"}
    updates = {k: v for k, v in data.items() if k in allowed}
    if not updates:
        return {"status": "no changes"}
    set_clause = ", ".join(f"{k}=?" for k in updates)
    await db.execute(f"UPDATE users SET {set_clause} WHERE id=?", (*updates.values(), current_user["id"]))
    await db.commit()
    return {"status": "updated"}
