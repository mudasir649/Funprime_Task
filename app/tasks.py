from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Book, ScrapeJob
from app.scraper import scrape_catalog

def run_scrape_job_background(job_id: str):
    db: Session = SessionLocal()
    
    job = db.query(ScrapeJob).filter(ScrapeJob.job_id == job_id).first()
    if job:
        job.status = "RUNNING"
        job.progress = "Scraping started..."
        db.commit()

    try:
        books_data = scrape_catalog()
        
        saved_count = 0
        for b_data in books_data:
            existing = db.query(Book).filter(Book.product_url == b_data["product_url"]).first()
            if existing:
                existing.title = b_data["title"]
                existing.price = b_data["price"]
                existing.rating = b_data["rating"]
                existing.availability = b_data["availability"]
                existing.category = b_data["category"]
                existing.image_url = b_data["image_url"]
            else:
                new_book = Book(**b_data)
                db.add(new_book)
            saved_count += 1
            
        db.commit()
        
        if job:
            job.status = "COMPLETED"
            job.progress = f"Successfully scraped and upserted {saved_count} books."
            db.commit()
    except Exception as e:
        db.rollback()
        if job:
            job.status = "FAILED"
            job.error_message = str(e)
            db.commit()
    finally:
        db.close()