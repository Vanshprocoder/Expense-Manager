# Ledgerly — Expense Manager

Web app to manage shop, personal, and home finances in one place.

## Stack

- **Frontend:** React (Vite) + React Router
- **Backend:** FastAPI (Python)
- **Database:** SQLite (swap to PostgreSQL for production by changing the connection URL)

## Features

### Shop
- Daily sales (online vs cash)
- Expenses from online account or cash
- Account balance & cash in hand
- Month-over-month sales comparison

### Personal
- Monthly salary
- Expenses (mark major ones)
- Month-end savings (salary − expenses)

### Home
- Rent / other income
- Household expenses (paid from salary / shop / rent)
- School fees with pending/paid status

### Dashboard
- Total income & total expenses
- Breakdown by source
- Daily shop sales chart

## Run locally

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App: http://localhost:5173

Optional: set `VITE_API_URL` in `frontend/.env` if the API is not on `http://localhost:8000`.

## Production database

SQLite is fine for personal use. For publishing, set PostgreSQL in `backend/database.py`:

```python
SQLALCHEMY_DATABASE_URL = "postgresql://user:pass@host:5432/ledgerly"
```

Then install `psycopg2-binary` and deploy the FastAPI app (Railway, Render, Fly.io, etc.) with the React build as static files or on Vercel/Netlify.
