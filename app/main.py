import uuid
from typing import Optional, List
from fastapi import FastAPI, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal, engine
from app.models import Base, Book, ScrapeJob
from app.schemas import BookResponse, JobStatusResponse
from app.tasks import run_scrape_job_background

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Books Scraper & REST API Service", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to the Books Scraper API!"}

@app.post("/scrape", status_code=status.HTTP_202_ACCEPTED, response_model=JobStatusResponse)
def trigger_scrape(background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Prevent multiple identical active scrape jobs
    active_job = db.query(ScrapeJob).filter(ScrapeJob.status.in_(["PENDING", "RUNNING"])).first()
    if active_job:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A scraping job is already active with ID: {active_job.job_id}"
        )
    
    job_id = str(uuid.uuid4())
    
    # Persist job state in Supabase
    new_job = ScrapeJob(job_id=job_id, status="PENDING", progress="Enqueued")
    db.add(new_job)
    db.commit()
    
    # Trigger background task natively in FastAPI (No Redis/Celery required!)
    background_tasks.add_task(run_scrape_job_background, job_id)
    
    return {"job_id": job_id, "status": "PENDING", "progress": "Enqueued"}

@app.get("/scrape/jobs/{job_id}", response_model=JobStatusResponse)
def get_job_status(job_id: str, db: Session = Depends(get_db)):
    job = db.query(ScrapeJob).filter(ScrapeJob.job_id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return {"job_id": job.job_id, "status": job.status, "progress": job.progress, "error_message": job.error_message}

@app.get("/books", response_model=List[BookResponse])
def list_books(
    category: Optional[str] = None,
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Book)
    if category:
        query = query.filter(Book.category.ilike(f"%{category}%"))
    if min_price is not None:
        query = query.filter(Book.price >= min_price)
    if max_price is not None:
        query = query.filter(Book.price <= max_price)
        
    books = query.offset(skip).limit(limit).all()
    return books

@app.get("/books/{id}", response_model=BookResponse)
def get_book(id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book

@app.get("/health/live")
def health_live():
    return {"status": "alive"}

@app.get("/health/ready")
def health_ready(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="Database not ready")
    return {"status": "ready"}