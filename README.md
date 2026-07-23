# 🚀 SwipeX – AI-Powered Swipe-Based Intelligent Job Discovery Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20?logo=django)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Language-Python%203.11-3776AB?logo=python)](https://www.python.org/)

SwipeX is a full-stack AI-powered job discovery and career assistance platform built with React, Django REST Framework, and PostgreSQL. It enables job seekers to discover opportunities through a swipe-based interface, manage applications, analyze resumes, generate AI-assisted cover letters, identify skill gaps, and prepare for interviews with an intuitive and modern user experience.

---

# ✨ Key Features

## 🔥 Interactive Swipe Job Discovery

- Tinder-style swipe interface for job discovery
- Swipe Left → Pass
- Swipe Right → Apply
- Swipe Up → Save
- Undo previous swipe
- Keyboard navigation support
- Smooth Framer Motion animations

---

## 🤖 AI-Powered Career Assistant

- AI Resume Analyzer
- AI Profile Analysis
- AI Cover Letter Generator
- AI Interview Question Generator
- AI Skill Gap Analysis
- ATS Score Evaluation
- Personalized Improvement Suggestions

---

## 💬 Real-Time Messaging

- Django Channels WebSocket integration
- Real-time candidate & recruiter chat
- Typing indicators
- Online status
- Unread message badges
- Mobile responsive chat interface

---

## 📊 Recruiter Dashboard

- Job posting management
- Candidate management
- Application tracking
- Interview scheduling
- Recruitment workflow
- Analytics dashboard

---

## 🔒 Security & Performance

- JWT Authentication
- Role-Based Authorization
- Rate Limiting
- Security Headers
- Custom Error Handling
- Responsive Design
- Accessibility Improvements
- Loading Skeletons
- Custom 404 & Error Pages

---

# 🛠 Technology Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 18, Vite, Redux Toolkit, Tailwind CSS, Framer Motion |
| Backend | Django 5, Django REST Framework, Simple JWT |
| Database | PostgreSQL / SQLite |
| Real-Time | Django Channels, WebSockets |
| AI Services | Python-based AI service layer |
| Deployment | Docker, Docker Compose |

---

# 📁 Project Structure

```text
swipex1234/
├── backend/
│   ├── authentication/
│   ├── profiles/
│   ├── jobs/
│   ├── chat/
│   ├── notifications/
│   ├── swipex/
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── store/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

# ⚙ Local Setup

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python seed.py

python manage.py runserver
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# 💻 Local Development

Follow the setup instructions above to configure the project locally.

After completing the installation, create a new account using the registration page or seed the database for testing purposes.

---

# ✅ Running Tests

## Backend Tests

```bash
cd backend

python manage.py test
```

---

## Frontend Production Build

```bash
cd frontend

npm run build
```

---

# 🚀 Future Improvements

- Resume Parsing using LLMs
- AI Job Recommendation Engine
- Resume Ranking
- Email Notifications
- Push Notifications
- Video Interview Integration
- Multi-language Support
- Cloud Deployment
- Advanced Analytics Dashboard


---

⭐ If you found this project useful, consider giving it a star on GitHub!
