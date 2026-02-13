# SmartBot Builder 🤖

**SmartBot Builder** is a powerful, full-stack platform that enables users to create, customize, and deploy AI-powered chatbots for their websites in minutes. Whether you upload a PDF for automatic knowledge extraction or manually curate your organization's profile, SmartBot Builder delivers an intelligent conversational interface tailored to your needs.

![SmartBot Builder Dashboard](https://github.com/rali22212/SmartBot-Builder/raw/main/assets/dashboard-preview.png)
*(Note: Add a screenshot of your dashboard here)*

## 🚀 Key Features

### 🌟 Intelligent Chatbot Creation
- **Automatic Mode**: Upload a PDF or DOCX file (e.g., company handbook, product catalog), and our AI instantly indexes it to answer questions accurately.
- **Manual Mode**: Use our structured forms to input organization details, employees, products, and services manually.
- **Hybrid Knowledge Base**: Combine document uploads with manual entries for comprehensive coverage.

### 🎨 Customizable Widget
- **Theme Engine**: Choose from Light or Dark modes, or customize primary colors to match your brand.
- **Positioning**: Place the chat widget anywhere (Bottom Right, Bottom Left, etc.).
- **Real-time Preview**: See your changes instantly as you edit settings.

### 📊 robust Analytics
- **Dashboard**: Track total messages, user interactions, and recent chat history.
- **Conversation Logs**: Review full chat transcripts to improve bot performance.
- **Export Data**: Download chat history and bot configurations as JSON for backup or analysis.

### 🔐 Secure & Scalable
- **Authentication**: JWT-based secure login and session management.
- **Role-Based Access**: Multi-user support with organization isolation.
- **Encryption**: Sensitive data env-protected; passwords hashed with bcrypt.

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **Icons**: Lucide React
- **State Management**: React Hooks & Context API

### Backend
- **Framework**: [Flask](https://flask.palletsprojects.com/) (Python)
- **Database**: PostgreSQL (via SQLAlchemy)
- **AI Engine**: [LlamaIndex](https://www.llamaindex.ai/) + [Groq](https://groq.com/) (LLM)
- **Vector Store**: In-memory / Persistent Vector Store
- **Authentication**: Flask-JWT-Extended

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- PostgreSQL Database

### 1. Clone the Repository
```bash
git clone https://github.com/rali22212/SmartBot-Builder.git
cd SmartBot-Builder
```

### 2. Backend Setup
Navigate to the `server` directory and install dependencies.

```bash
cd server
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Environment Variables**:
Create a `.env` file in the `server` directory:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
```

Run the server:
```bash
python app.py
```
*Server runs on http://localhost:5050*

### 3. Frontend Setup
Navigate to the `frontend` directory.

```bash
cd ../frontend
npm install
```

**Environment Variables**:
Create a `.env` file in the `frontend` directory:
```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

Run the development server:
```bash
npm run dev
```
*Frontend runs on http://localhost:5173*

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

**Ali Raza** - [GitHub Profile](https://github.com/rali22212)

---
*Built with ❤️ by Ali Raza*
