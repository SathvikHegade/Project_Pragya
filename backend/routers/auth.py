from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr
import uuid
from utils.database import get_db
from utils.auth import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
    role: str = "student"
    class_name: str = None
    school: str = None
    language: str = "en"

def row_to_user(row):
    return {
        "id": row["id"],
        "name": row["name"],
        "email": row["email"],
        "role": row["role"],
        "class": row["class"],
        "school": row["school"],
        "language": row["language"],
    }

@router.post("/login")
async def login(req: LoginRequest, db=Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE email = ?", (req.email,)) as cursor:
        user = await cursor.fetchone()

    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user["id"], user["role"])
    return {"access_token": token, "token_type": "bearer", "user": row_to_user(user)}

@router.post("/register")
async def register(req: RegisterRequest, db=Depends(get_db)):
    async with db.execute("SELECT id FROM users WHERE email = ?", (req.email,)) as cursor:
        existing = await cursor.fetchone()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    pw_hash = hash_password(req.password)
    await db.execute(
        "INSERT INTO users (id, name, email, password_hash, role, class, school, language) VALUES (?,?,?,?,?,?,?,?)",
        (user_id, req.name, req.email, pw_hash, req.role, req.class_name, req.school, req.language)
    )
    await db.commit()

    token = create_access_token(user_id, req.role)
    user = {"id": user_id, "name": req.name, "email": req.email, "role": req.role, "class": req.class_name, "school": req.school, "language": req.language}
    return {"access_token": token, "token_type": "bearer", "user": user}

@router.get("/me")
async def me(current_user=Depends(get_current_user), db=Depends(get_db)):
    async with db.execute("SELECT * FROM users WHERE id = ?", (current_user["id"],)) as cursor:
        user = await cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return row_to_user(user)
