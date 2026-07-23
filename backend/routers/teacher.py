from fastapi import APIRouter, Depends
from typing import Optional
from utils.database import get_db
from utils.auth import require_teacher

router = APIRouter()

@router.get("/overview")
async def class_overview(current_user=Depends(require_teacher), db=Depends(get_db)):
    total = (await db.fetchrow("SELECT COUNT(*) as total FROM users WHERE role='student'"))["total"]
    active = (await db.fetchrow("SELECT COUNT(DISTINCT user_id) as active FROM experiment_sessions WHERE started_at >= NOW() - INTERVAL '7 days'"))["active"]
    avg = (await db.fetchrow("SELECT AVG(score) as avg FROM experiment_sessions WHERE completed=1"))["avg"] or 0
    return {"total_students": total, "active_this_week": active, "class_avg_score": round(avg, 1)}

@router.get("/students")
async def get_students(current_user=Depends(require_teacher), db=Depends(get_db)):
    rows = await db.fetch(
        "SELECT u.id, u.name, u.class, u.school, COUNT(es.id) as sessions, AVG(es.score) as avg_score "
        "FROM users u LEFT JOIN experiment_sessions es ON u.id=es.user_id WHERE u.role='student' GROUP BY u.id"
    )
    return {"students": [dict(r) for r in rows]}

@router.get("/observations")
async def get_observations(
    student_id: Optional[str] = None,
    experiment_id: Optional[str] = None,
    limit: int = 100,
    current_user=Depends(require_teacher),
    db=Depends(get_db)
):
    safe_limit = max(1, min(limit, 200))
    query = (
        "SELECT o.id, o.user_id, u.name as student_name, u.class as student_class, "
        "o.experiment_id, o.text, o.created_at "
        "FROM observations o JOIN users u ON o.user_id = u.id"
    )
    clauses = []
    params = []
    idx = 1
    if student_id:
        clauses.append(f"o.user_id = ${idx}")
        params.append(student_id)
        idx += 1
    if experiment_id:
        clauses.append(f"o.experiment_id = ${idx}")
        params.append(experiment_id)
        idx += 1
    if clauses:
        query += " WHERE " + " AND ".join(clauses)
    query += f" ORDER BY o.created_at DESC LIMIT ${idx}"
    params.append(safe_limit)

    rows = await db.fetch(query, *params)
    return {"observations": [dict(r) for r in rows]}

@router.get("/heatmap")
async def get_heatmap(current_user=Depends(require_teacher), db=Depends(get_db)):
    rows = await db.fetch(
        "SELECT user_id, experiment_id, MAX(score) as best_score FROM experiment_sessions GROUP BY user_id, experiment_id"
    )
    return {"heatmap": [dict(r) for r in rows]}

@router.get("/alerts")
async def get_alerts(current_user=Depends(require_teacher), db=Depends(get_db)):
    alerts = []
    inactive = await db.fetch(
        "SELECT u.name, u.id FROM users u WHERE u.role='student' AND u.id NOT IN "
        "(SELECT DISTINCT user_id FROM experiment_sessions WHERE started_at >= NOW() - INTERVAL '5 days')"
    )
    for s in inactive:
        alerts.append({"type": "inactive", "student": s["name"], "message": f"{s['name']} has not logged in for 5+ days"})
    return {"alerts": alerts}

@router.get("/report/weekly")
async def weekly_report(current_user=Depends(require_teacher), db=Depends(get_db)):
    sessions = (await db.fetchrow("SELECT COUNT(*) as sessions FROM experiment_sessions WHERE started_at >= NOW() - INTERVAL '7 days'"))["sessions"]
    return {"week": "current", "total_sessions": sessions, "status": "generated"}
