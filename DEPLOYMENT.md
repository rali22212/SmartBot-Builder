# 🚀 SmartBot Builder Deployment Guide

This guide covers how to deploy the full stack application for **free** (or low cost) while ensuring high availability.

## 🏗️ Architecture
- **Frontend**: React (Vite) -> Deployed on **Vercel**
- **Backend**: Python (Flask) -> Deployed on **Render**
- **Database**: PostgreSQL -> Hosted on **Neon** (Already set up)

---

## 🟢 Part 1: Backend Deployment (Render)

We use Render because it natively supports Python/Flask.

### 1. Create Web Service
1.  Go to [dashboard.render.com](https://dashboard.render.com/).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repo: `rali22212/SmartBot-Builder`.
4.  **Settings**:
    -   **Name**: `smartbot-backend`
    -   **Root Directory**: `server` (Important!)
    -   **Runtime**: Python 3
    -   **Build Command**: `pip install -r requirements.txt`
    -   **Start Command**: `gunicorn app:app` (We need to add gunicorn to requirements first!)

### 2. Environment Variables
In Render Dashboard -> **Environment**, add:

| Key | Value |
| :--- | :--- |
| `DATABASE_URL` | *(Your Neon DB URL)* |
| `JWT_SECRET` | *(Generate a strong random string)* |
| `GROQ_API_KEY` | *(Your Groq API Key)* |
| `MAIL_USERNAME` | *(Your Gmail)* |
| `MAIL_PASSWORD` | *(Your App Password)* |
| `PYTHON_VERSION` | `3.9.0` |

### 3. preventing "Cold Starts" (The "Awake" Problem)
Free tier services on Render "sleep" after 15 minutes of inactivity, causing a 30-50s delay on the next request.

**Solution: Use a Free Pinger**
1.  Copy your Render URL (e.g., `https://smartbot-backend.onrender.com`).
2.  Go to [cron-job.org](https://cron-job.org/en/) (Free).
3.  Create a **Cronjob**:
    -   **URL**: `https://smartbot-backend.onrender.com/` (This hits the home route which returns "ok").
    -   **Schedule**: Every 5 minutes.
4.  Save. This will ping your server 24/7, preventing it from sleeping.

---

## 🔵 Part 2: Frontend Deployment (Vercel)

### 1. Create Project
1.  Go to [vercel.com](https://vercel.com/dashboard).
2.  **Add New...** -> **Project**.
3.  Import `SmartBot-Builder`.
4.  **Settings**:
    -   **Framework Preset**: Vite
    -   **Root Directory**: `frontend` (Edit this!)

### 2. Environment Variables
In Vercel Project Settings -> **Environment Variables**, add:

| Key | Value |
| :--- | :--- |
| `VITE_API_URL` | `https://smartbot-backend.onrender.com/api` (Your actual backend URL) |
| `VITE_EMAILJS_SERVICE_ID` | *(From your local .env)* |
| `VITE_EMAILJS_TEMPLATE_ID` | *(From your local .env)* |
| `VITE_EMAILJS_PUBLIC_KEY` | *(From your local .env)* |

### 3. Deploy
Click **Deploy**. Vercel will build your React app and provide a URL (e.g., `https://smartbot-builder.vercel.app`).

---

## 🟡 Part 3: Final Configuration

### 1. Update Backend CORS
Once you have your **Frontend URL** (e.g., `https://smartbot-builder.vercel.app`), go back to **Render**:
1.  Add/Update Env Var: `FRONTEND_URL` = `https://smartbot-builder.vercel.app`
2.  (Optional) Update `app.py` to only allow CORS from this URL for better security, or keep `*` for now.

### 2. Update Google OAuth (If used)
If you use Google Login, add your new Vercel domain to the "Authorized Javascript Origins" in Google Cloud Console.

---

## ✅ Deployment Checklist

- [ ] Backend is running on Render.
- [ ] Cron-job is set up to ping Backend every 5 mins.
- [ ] Frontend is running on Vercel.
- [ ] Frontend `VITE_API_URL` points to Backend.
- [ ] All environment variables are set on both platforms.

🚀 **Your system is now live!**
