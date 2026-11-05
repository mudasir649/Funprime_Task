from datetime import datetime
from sqlalchemy import Column, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    price = Column(Float, nullable=False, index=True)
    rating = Column(Integer, nullable=False)
    availability = Column(String(100), nullable=False)
    category = Column(String(200), nullable=False, index=True)
    product_url = Column(String(1000), unique=True, index=True, nullable=False)
    image_url = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    scraped_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

class ScrapeJob(Base):
    __tablename__ = "scrape_jobs"

    job_id = Column(String(36), primary_key=True, index=True)
    status = Column(String(50), nullable=False, default="PENDING")
    progress = Column(String(255), nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)