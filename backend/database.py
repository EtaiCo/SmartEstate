import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # dotenv is optional, just skip if not installed

# Toggle to use SQLite for tests or dev
USE_SQLITE = os.getenv("USE_SQLITE_FOR_TESTS") == "1" or os.getenv("USE_SQLITE_FOR_DEV") == "1"

if USE_SQLITE:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    connect_args = {"check_same_thread": False}
else:
    # PostgreSQL configuration
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "eisben75")
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "SmartEstate")

    SQLALCHEMY_DATABASE_URL = (
        f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    connect_args = {}

# Engine setup
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base model
Base = declarative_base()

# DB dependency (used in FastAPI routes)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
