<p align="center">
  <img src="https://img.shields.io/badge/SmartBot-Builder-8B5CF6?style=for-the-badge&logo=robot&logoColor=white" alt="SmartBot Builder" height="40"/>
</p>

<h1 align="center">🤖 SmartBot Builder</h1>

<p align="center">
  <strong>Create, customize & deploy AI-powered chatbots in minutes — no code required.</strong>
</p>

<p align="center">
  <a href="https://smartbot-builder.vercel.app">
    <img src="https://img.shields.io/badge/🌐_Live_Demo-smartbot--builder.vercel.app-8B5CF6?style=for-the-badge" alt="Live Demo"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS"/>
  <img src="https://img.shields.io/badge/Flask-000000?style=flat-square&logo=flask&logoColor=white" alt="Flask"/>
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>
  <img src="https://img.shields.io/badge/Groq-FF6600?style=flat-square&logo=lightning&logoColor=white" alt="Groq"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Vercel"/>
  <img src="https://img.shields.io/badge/Render-46E3B7?style=flat-square&logo=render&logoColor=white" alt="Render"/>
</p>

---

## ✨ What is SmartBot Builder?

SmartBot Builder is a **full-stack SaaS platform** that empowers anyone to build intelligent AI chatbots for their business or website. Simply upload a document or fill in your organization's details, and get a fully functional chatbot powered by cutting-edge AI — ready to embed on any website with a single line of code.

> **🎯 Perfect for**: Customer support, FAQ bots, product guides, company knowledge bases, and more.

---

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <strong>🏠 Landing Page</strong><br/>
      <em>Modern dark-themed landing page with animated gradients, feature highlights, and smooth scroll navigation.</em>
    </td>
    <td align="center" width="50%">
      <strong>📊 Dashboard</strong><br/>
      <em>View all your chatbots at a glance — total bots, message stats, and quick actions to chat, delete, or export.</em>
    </td>
  </tr>
  <tr>
    <td align="center" width="50%">
      <strong>🛠️ Create Bot</strong><br/>
      <em>Two modes: Upload a PDF/DOCX for instant AI indexing, or manually enter your organization details.</em>
    </td>
    <td align="center" width="50%">
      <strong>💬 Chat Interface</strong><br/>
      <em>Real-time AI conversations with message history, delete controls, date separators, and typing indicators.</em>
    </td>
  </tr>
</table>

> 💡 **Tip**: Visit the [live demo](https://smartbot-builder.vercel.app) to see it in action!

---

## 🚀 Key Features

### 🧠 Intelligent Bot Creation
| Feature | Description |
|---------|-------------|
| **📄 Automatic Mode** | Upload a PDF or DOCX — AI extracts the content and powers your chatbot instantly |
| **✍️ Manual Mode** | Structured forms for organization name, employees, products & services |
| **📥 Import/Export** | Download bot configs as JSON, import them on another account |

### 💬 Smart Chat Experience
| Feature | Description |
|---------|-------------|
| **⚡ Real-time AI** | Powered by Groq's lightning-fast LLM (Llama 3.3 70B) |
| **📜 Chat History** | Full conversation persistence with date separators |
| **🗑️ Message Management** | Hover to delete individual messages, bulk select, or clear all |
| **🔄 Context-Aware** | Bot answers based exclusively on YOUR organization's data |

### 🎨 Embeddable Widget
| Feature | Description |
|---------|-------------|
| **🌓 Theme Engine** | Light & Dark modes with custom primary colors |
| **📐 Positioning** | Place the widget anywhere on your page |
| **📋 One-Line Embed** | Copy-paste a `<script>` tag to add the bot to any website |

### 🔐 Enterprise-Ready Security
| Feature | Description |
|---------|-------------|
| **🔑 JWT Auth** | Secure token-based authentication with auto-expiry |
| **📧 Email Verification** | OTP-based registration with real email delivery |
| **🔒 Password Security** | Bcrypt hashing, change password, forgot password flow |
| **👥 Multi-User** | Each user sees only their own bots — full data isolation |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                     │
│  React + TypeScript + Vite + Tailwind + Shadcn UI       │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Landing  │ │Dashboard │ │CreateBot │ │   Chat    │  │
│  │  Page    │ │  Page    │ │  Page    │ │ Interface │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────────┘  │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS (REST API)
┌────────────────────────▼────────────────────────────────┐
│                   BACKEND (Render)                       │
│  Flask + Gunicorn + SQLAlchemy                          │
│                                                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐  │
│  │   Auth   │ │   Bot    │ │  Query   │ │   Chat    │  │
│  │  Routes  │ │  CRUD    │ │  Engine  │ │  History  │  │
│  └──────────┘ └──────────┘ └─────┬────┘ └───────────┘  │
└──────────┬───────────────────────┼──────────────────────┘
           │                       │
    ┌──────▼──────┐         ┌──────▼──────┐
    │  PostgreSQL │         │   Groq API  │
    │   (Neon)    │         │ Llama 3.3   │
    │             │         │   70B LLM   │
    └─────────────┘         └─────────────┘
```

---

## 🛠️ Tech Stack

<table>
  <tr>
    <th align="left">Layer</th>
    <th align="left">Technology</th>
    <th align="left">Purpose</th>
  </tr>
  <tr>
    <td><strong>Frontend</strong></td>
    <td>React 18 + TypeScript</td>
    <td>UI framework with type safety</td>
  </tr>
  <tr>
    <td></td>
    <td>Vite</td>
    <td>Lightning-fast build tool</td>
  </tr>
  <tr>
    <td></td>
    <td>Tailwind CSS + Shadcn UI</td>
    <td>Beautiful, responsive components</td>
  </tr>
  <tr>
    <td></td>
    <td>Lucide React</td>
    <td>Modern icon library</td>
  </tr>
  <tr>
    <td><strong>Backend</strong></td>
    <td>Flask (Python)</td>
    <td>REST API server</td>
  </tr>
  <tr>
    <td></td>
    <td>Gunicorn</td>
    <td>Production WSGI server</td>
  </tr>
  <tr>
    <td></td>
    <td>SQLAlchemy + Flask-SQLAlchemy</td>
    <td>ORM & database management</td>
  </tr>
  <tr>
    <td><strong>AI</strong></td>
    <td>Groq SDK</td>
    <td>Ultra-fast LLM inference</td>
  </tr>
  <tr>
    <td></td>
    <td>Llama 3.3 70B Versatile</td>
    <td>Large language model</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>PostgreSQL (Neon)</td>
    <td>Serverless PostgreSQL</td>
  </tr>
  <tr>
    <td><strong>Auth</strong></td>
    <td>JWT + Bcrypt</td>
    <td>Tokens & password hashing</td>
  </tr>
  <tr>
    <td><strong>Email</strong></td>
    <td>Flask-Mail (SMTP)</td>
    <td>OTP verification emails</td>
  </tr>
  <tr>
    <td><strong>Hosting</strong></td>
    <td>Vercel (frontend) + Render (backend)</td>
    <td>Free-tier cloud deployment</td>
  </tr>
</table>

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | v18+ |
| Python | v3.9+ |
| PostgreSQL | Any (or use [Neon](https://neon.tech) free tier) |
| Groq API Key | [Get one free](https://console.groq.com) |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/rali22212/SmartBot-Builder.git
cd SmartBot-Builder
```

### 2️⃣ Backend Setup

```bash
cd server
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Create a `.env` file in `/server`:

```env
DATABASE_URL=postgresql://user:password@host/dbname
JWT_SECRET=your_secure_jwt_secret_key_here
GROQ_API_KEY=gsk_your_groq_api_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_gmail_app_password
```

> 💡 **Tip**: For `MAIL_PASSWORD`, use a [Gmail App Password](https://myaccount.google.com/apppasswords), not your regular password.

Start the server:

```bash
python app.py
```

> Server runs at `http://localhost:5050`

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create a `.env` file in `/frontend`:

```env
VITE_API_URL=http://localhost:5050/api
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Start the development server:

```bash
npm run dev
```

> Frontend runs at `http://localhost:5173`

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Import the repo on [Vercel](https://vercel.com)
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
   - EmailJS variables
5. Deploy ✅

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. Set **Build Command** to `pip install -r requirements.txt`
5. Set **Start Command** to `gunicorn app:app --bind 0.0.0.0:$PORT`
6. Add environment variables: `DATABASE_URL`, `JWT_SECRET`, `GROQ_API_KEY`, `MAIL_USERNAME`, `MAIL_PASSWORD`
7. Deploy ✅

---

## 📁 Project Structure

```
SmartBot-Builder/
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ChatInterface.tsx       # Real-time chat UI
│   │   │   ├── ChatbotCard.tsx         # Bot card on dashboard
│   │   │   ├── Navbar.tsx              # Navigation bar
│   │   │   ├── Footer.tsx              # Footer
│   │   │   └── ui/                     # Shadcn UI components
│   │   ├── pages/              # Application pages
│   │   │   ├── Dashboard.tsx           # Main dashboard
│   │   │   ├── CreateBot.tsx           # Bot creation wizard
│   │   │   ├── Login.tsx               # Login page
│   │   │   ├── Register.tsx            # Registration page
│   │   │   ├── VerifyOTP.tsx           # Email verification
│   │   │   ├── ForgotPassword.tsx      # Password recovery
│   │   │   ├── ChangePassword.tsx      # Password change
│   │   │   ├── About.tsx               # About page
│   │   │   ├── Privacy.tsx             # Privacy policy
│   │   │   └── Terms.tsx               # Terms of service
│   │   ├── contexts/           # React context providers
│   │   │   └── AuthContext.tsx         # Authentication state
│   │   ├── config.ts           # API URL configuration
│   │   └── App.tsx             # Main app with routing
│   └── package.json
│
├── server/                     # Flask backend
│   ├── app.py                  # Main application & API routes
│   ├── models.py               # SQLAlchemy database models
│   ├── auth.py                 # Authentication routes
│   ├── middleware.py           # JWT middleware
│   ├── email_service.py        # Email (OTP) service
│   ├── requirements.txt        # Python dependencies
│   └── Procfile                # Render deployment config
│
├── render.yaml                 # Render service blueprint
└── README.md
```

---

## 🔌 API Endpoints

<details>
<summary><strong>🔐 Authentication</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register a new account |
| `POST` | `/api/auth/verify-otp` | Verify email with OTP |
| `POST` | `/api/auth/login` | Login & get JWT token |
| `POST` | `/api/auth/forgot-password` | Request password reset |
| `POST` | `/api/auth/reset-password` | Reset with OTP |
| `POST` | `/api/auth/change-password` | Change password (auth) |

</details>

<details>
<summary><strong>🤖 Bot Management</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/create-bot` | Create a new chatbot |
| `GET` | `/api/organizations` | List all user's bots |
| `DELETE` | `/api/bot/:id` | Delete a chatbot |
| `GET` | `/api/bot/:id/export` | Export bot as JSON |
| `POST` | `/api/bot/import` | Import bot from JSON |

</details>

<details>
<summary><strong>💬 Chat & History</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/query/:id` | Send message to bot |
| `GET` | `/api/bot/:id/chat-history` | Get chat history |
| `DELETE` | `/api/chat-history/:id` | Delete a message |
| `DELETE` | `/api/bot/:id/chat-history` | Clear all history |

</details>

<details>
<summary><strong>⚙️ Widget & Settings</strong></summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bot/:id/settings` | Get widget settings |
| `PUT` | `/api/bot/:id/settings` | Update widget settings |
| `GET` | `/api/bot/:id/embed-code` | Get embed script |
| `GET` | `/api/bot/:id/analytics` | Get bot analytics |

</details>

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the project
2. **Create** your feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push** to the branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

<p align="center">
  <strong>Ali Raza</strong><br/>
  <a href="https://github.com/rali22212">
    <img src="https://img.shields.io/badge/GitHub-rali22212-181717?style=for-the-badge&logo=github" alt="GitHub"/>
  </a>
</p>

---

<p align="center">
  Built with ❤️ using React, Flask & Groq AI
</p>
