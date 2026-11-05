from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class BookResponse(BaseModel):
    id: int
    title: str
    price: float
    rating: int
    availability: str
    category: str
    product_url: str
    image_url: str
    created_at: datetime
    scraped_at: datetime

    class Config:
        from_attributes = True

class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: Optional[str] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True