# Books Scraper & REST API Dashboard

A full-stack application that scrapes book data from [Books to Scrape](https://books.toscrape.com/), stores it in a database, and displays the results through a React dashboard.

The application uses **FastAPI** for the backend, **React + Vite** for the frontend, and **SQLAlchemy** for database operations.

## Tech Stack

**Backend**
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- HTTPX
- BeautifulSoup4

**Frontend**
- React
- Vite
- JavaScript
- CSS

**Database**
- SQLite
- Supabase PostgreSQL

## Project Structure

```text
funprime_task/
├── app/
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── scraper.py
│   └── tasks.py
│
├── book-scraper-dashboard/
│   ├── src/
│   │   ├── components/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   └── vite.config.js
│
├── requirements.txt
└── .env.example
```

## Features

- Start book scraping jobs from the dashboard.
- Run scraping tasks in the background.
- Track job status (Pending, Running, Completed, Failed).
- Store scraped books in SQLite or Supabase PostgreSQL.
- Prevent duplicate scraping jobs.
- View scraped books in a table.
- Filter books by category and price.
- Paginate through book records.
- REST API with Swagger documentation.
- Configure the API base URL from the frontend.

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd funprime_task
```

### 2. Backend Setup

Create a virtual environment:

**Windows**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux / macOS**
```bash
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

If you encounter an `lxml` installation error on Windows, you can try:

```bash
pip install lxml --only-binary=lxml
```

Start the backend:

```bash
uvicorn app.main:app --reload --port 8000
```

Backend URLs:

- API: http://127.0.0.1:8000
- Swagger Documentation: http://127.0.0.1:8000/docs
- Health Check: http://127.0.0.1:8000/health/live

### 3. Frontend Setup

Open another terminal:

```bash
cd book-scraper-dashboard
npm install
npm run dev
```

Open the frontend:

http://localhost:5173

## Background Tasks: Why Celery and Redis Were Not Used

Due to local laptop hardware limitations and space constraints, **Celery and Redis were omitted** from this implementation.

Instead, the project uses **FastAPI's native `BackgroundTasks`**, together with SQLite or Supabase PostgreSQL for storage.

This approach was chosen because:

- It avoids installing and running external services such as Redis.
- It does not require separate Celery worker processes.
- Scraping jobs can execute in the background within the FastAPI server process.
- Job creation, status tracking, and duplicate prevention can be handled without additional infrastructure.

For this project's requirements, FastAPI `BackgroundTasks` provides a simpler and lighter solution.

**Note:** FastAPI `BackgroundTasks` is suitable for lightweight background operations. For large-scale production workloads requiring distributed workers, advanced retries, or guaranteed job persistence, Celery or another dedicated task queue would be a better choice.

## Testing the Application

1. Start the backend and frontend.
2. Open http://localhost:5173.
3. Set the API base URL to `http://127.0.0.1:8000`.
4. Click **Save**.
5. Click **Start Scraping**.
6. Monitor the job status until it is completed.
7. View the scraped books in the dashboard.

You can also explore the API through Swagger:

http://127.0.0.1:8000/docs

## Notes

- Python 3.10 or higher is required.
- Node.js 18 or higher is required.
- Make sure your database configuration is correct before starting the backend.
- Do not commit your `.env` file or virtual environment to GitHub.
