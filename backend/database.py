import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Only switches to SQLite if this env variable is set
USE_SQLITE = os.getenv("USE_SQLITE_FOR_TESTS") == "1"

if USE_SQLITE:
    SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
    connect_args = {"check_same_thread": False}
else:
    SQLALCHEMY_DATABASE_URL = "postgresql://localhost/YOUR_DB_NAME"
    connect_args = {}

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
