import os
import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL")
POOL = None

async def get_pool():
    global POOL
    if POOL is None:
        if not DATABASE_URL:
            raise RuntimeError("DATABASE_URL is not set")
        POOL = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    return POOL

async def close_pool():
    global POOL
    if POOL:
        await POOL.close()
        POOL = None

async def get_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn

TABLES = [
    """
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'student',
        class TEXT,
        school TEXT,
        language TEXT DEFAULT 'en',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS experiment_sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        variables TEXT,
        observations TEXT,
        score INTEGER DEFAULT 0,
        completed INTEGER DEFAULT 0,
        duration_seconds INTEGER DEFAULT 0,
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS observations (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS quiz_attempts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT NOT NULL,
        question TEXT NOT NULL,
        selected_option INTEGER,
        correct_option INTEGER,
        is_correct INTEGER DEFAULT 0,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS ai_interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        experiment_id TEXT,
        message TEXT NOT NULL,
        response TEXT NOT NULL,
        interaction_type TEXT DEFAULT 'hint',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS teacher_classes (
        id TEXT PRIMARY KEY,
        teacher_id TEXT NOT NULL,
        class_name TEXT NOT NULL,
        subject TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users(id)
    )
    """,
]

async def init_db():
    pool = await get_pool()
    async with pool.acquire() as conn:
        async with conn.transaction():
            for ddl in TABLES:
                await conn.execute(ddl)

            import bcrypt
            demo_pw = bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode()
            await conn.execute(
                """
                INSERT INTO users (id, name, email, password_hash, role, class, school, language)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (email) DO NOTHING
                """,
                "demo-student-1",
                "Demo Student",
                "demo@pragya.in",
                demo_pw,
                "student",
                "Class 9",
                "Government Higher Secondary School, Bengaluru",
                "en",
            )

            await conn.execute(
                """
                INSERT INTO users (id, name, email, password_hash, role, school, language)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                ON CONFLICT (email) DO NOTHING
                """,
                "demo-teacher-1",
                "Demo Teacher",
                "teacher@pragya.in",
                demo_pw,
                "teacher",
                "Government Higher Secondary School, Bengaluru",
                "en",
            )

        print("✅ DB initialised with demo users")
