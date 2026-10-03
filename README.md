# Ledgerly — Expense Manager

A full-stack web application for managing **shop, personal, and household finances** in one place.

## 🛠️ Tech Stack

* **Frontend:** React (Vite) + React Router
* **Backend:** FastAPI (Python)
* **Database:** SQLite for local development
* **ORM:** SQLAlchemy

For production deployments, SQLite can be replaced with PostgreSQL using an environment-based database configuration.

## ✨ Features

### 🏪 Shop

* Daily sales tracking
* Online vs. cash sales
* Shop expenses
* Account balance
* Cash in hand
* Month-over-month sales comparison

### 👤 Personal

* Monthly salary tracking
* Personal expenses
* Major expense identification
* Month-end savings calculation

### 🏠 Home

* Rent and other income
* Household expenses
* Expense source tracking
* School fee tracking
* Paid / pending fee status

### 📊 Dashboard

* Total income
* Total expenses
* Income and expense breakdown
* Daily shop sales chart
* Financial overview

## 📁 Project Structure

```text
Ledgerly/
├── backend/
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

## 🚀 Run Locally

### Backend

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

On Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start the FastAPI server:

```bash
python -m uvicorn main:app --reload --port 8000
```

API documentation:

```text
http://localhost:8000/docs
```

### Frontend

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will normally be available at:

```text
http://localhost:5173
```

## 🔗 API Configuration

The frontend can use an environment variable to specify the backend API URL.

Create:

```text
frontend/.env
```

and add:

```env
VITE_API_URL=http://localhost:8000
```

For production, configure `VITE_API_URL` through your hosting provider's environment-variable settings.

**Do not commit `.env` files containing private credentials or secrets.**

## 🔐 Security

The repository intentionally excludes private and generated files such as:

* Environment files (`.env`)
* Python virtual environments
* Node.js dependencies
* Local SQLite databases
* Build output
* Cache files
* Operating-system files
* Logs

Never commit:

* API keys
* Passwords
* Database credentials
* Authentication tokens
* Private keys
* Personal financial records

## 🗄️ Database

SQLite is suitable for local development and personal use.

For production deployments with multiple users or persistent cloud storage, PostgreSQL is recommended.

Configure the production database using an environment variable rather than hardcoding credentials in the source code.

Example:

```env
DATABASE_URL=postgresql://<username>:<password>@<host>:<port>/<database>
```

Keep the actual value in your hosting provider's environment-variable settings.

## ☁️ Deployment

The recommended deployment architecture is:

```text
React Frontend
      │
      ▼
   Vercel
      │
      │ API Requests
      ▼
 FastAPI Backend
      │
      ▼
 PostgreSQL
```

The frontend and backend can be deployed independently.

## 🔧 Development

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

GitHub will then contain the latest version of the project.

## 📄 License
This project is for personal and educational use.

