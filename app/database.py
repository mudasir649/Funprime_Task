import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Default to local SQLite if DATABASE_URL environment variable is not set
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./books.db")

connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)