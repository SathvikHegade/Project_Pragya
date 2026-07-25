import os
import asyncio
import logging
import asyncpg

logger = logging.getLogger(__name__)

POOL = None


def _get_database_url():
    url = os.getenv("DATABASE_URL")
    if not url:
        raise RuntimeError(
            "DATABASE_URL environment variable is not set. "
            "Set it in your Render dashboard under Environment → Environment Variables "
            "with your Supabase connection string."
        )
    return url


async def get_pool():
    global POOL
    if POOL is None:
        url = _get_database_url()
        logger.info("🔌 Connecting to database...")
        POOL = await asyncpg.create_pool(
            url,
            min_size=1,
            max_size=5,
            statement_cache_size=0,
            timeout=30,
            command_timeout=30,
        )
        logger.info("✅ Database pool created")
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


_TABLES = [
    (
        "users",
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
    ),
    (
        "experiment_sessions",
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
    ),
    (
        "observations",
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
    ),
    (
        "quiz_attempts",
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
    ),
    (
        "ai_interactions",
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
    ),
    (
        "teacher_classes",
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
    ),
]


async def init_db(retries=3):
    for attempt in range(1, retries + 1):
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                for table_name, ddl in _TABLES:
                    await conn.execute(ddl)
                    logger.info(f"  ✔ table '{table_name}' ready")

                import bcrypt
                demo_pw = await asyncio.to_thread(
                    lambda: bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode()
                )

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

            logger.info("✅ DB initialised with demo users")
            return

        except Exception as e:
            logger.error(f"❌ init_db attempt {attempt}/{retries} failed: {e}")
            if attempt < retries:
                wait = 2 ** attempt
                logger.info(f"Retrying in {wait}s...")
                await asyncio.sleep(wait)
            else:
                raise
