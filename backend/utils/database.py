import aiosqlite
import os
import json
from datetime import datetime

DB_PATH = os.getenv("DB_PATH", "pragya.db")

async def get_db():
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        yield db

async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                role TEXT DEFAULT 'student',
                class TEXT,
                school TEXT,
                language TEXT DEFAULT 'en',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS experiment_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                experiment_id TEXT NOT NULL,
                variables TEXT,
                observations TEXT,
                score INTEGER DEFAULT 0,
                completed INTEGER DEFAULT 0,
                duration_seconds INTEGER DEFAULT 0,
                started_at TEXT DEFAULT CURRENT_TIMESTAMP,
                completed_at TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS observations (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                experiment_id TEXT NOT NULL,
                text TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS quiz_attempts (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                experiment_id TEXT NOT NULL,
                question TEXT NOT NULL,
                selected_option INTEGER,
                correct_option INTEGER,
                is_correct INTEGER DEFAULT 0,
                attempted_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS ai_interactions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                experiment_id TEXT,
                message TEXT NOT NULL,
                response TEXT NOT NULL,
                interaction_type TEXT DEFAULT 'hint',
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS teacher_classes (
                id TEXT PRIMARY KEY,
                teacher_id TEXT NOT NULL,
                class_name TEXT NOT NULL,
                subject TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (teacher_id) REFERENCES users(id)
            );
        """)

        # Seed demo users
        import bcrypt
        demo_pw = bcrypt.hashpw(b"demo123", bcrypt.gensalt()).decode()
        await db.execute("""
            INSERT OR IGNORE INTO users (id, name, email, password_hash, role, class, school, language)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, ("demo-student-1", "Demo Student", "demo@pragya.in", demo_pw, "student", "Class 9", "Government Higher Secondary School, Bengaluru", "en"))

        await db.execute("""
            INSERT OR IGNORE INTO users (id, name, email, password_hash, role, school, language)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, ("demo-teacher-1", "Demo Teacher", "teacher@pragya.in", demo_pw, "teacher", "Government Higher Secondary School, Bengaluru", "en"))

        await db.commit()
        print("✅ DB initialised with demo users")
