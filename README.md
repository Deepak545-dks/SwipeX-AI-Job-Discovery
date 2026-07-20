# SwipeX – AI-Powered Swipe-Based Intelligent Job Discovery Platform

[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Backend-Django%20REST%20Framework-092E20?logo=django)](https://www.djangoproject.com/)
[![Python](https://img.shields.io/badge/Language-Python%203.11-3776AB?logo=python)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

SwipeX is a state-of-the-art, full-stack job discovery platform designed to revolutionize the candidate recruitment experience. Featuring a Tinder-style swipe interface, AI-driven candidate utilities, real-time WebSockets messaging, and candidate/recruiter analytics dashboards.

---

## Key Feature Highlights

### 1. Interactive Swipe Job Discovery Deck
- **Card Deck Motion**: Framer Motion powered drag-and-drop card deck with threshold detection.
- **Action Controls**: Swipe left to **Pass**, right to **Apply**, up to **Save**, or click **Undo** to revert accidental swipes.
- **Keyboard Navigation**: Native arrow key controls (Left = Pass, Right = Apply, Up = Save).

### 2. AI-Powered Candidate Suite
- **AI Resume & Profile Analyzer**: Evaluates candidate PDF resume text and profile skills. Returns overall ATS score (0-100), green strengths, improvement alerts, missing technical skills, and recommendations.
- **AI Cover Letter Generator**: Generates customized 3-paragraph professional cover letters tailored to target job requirements with one-click clipboard copy.
- **AI Interview Question Generator**: Role-specific technical, system architecture, and behavioral practice questions with collapsible strategy tips.
- **AI Skill Gap Analysis**: Embedded widget showing match percentage progress bars, matching skills, missing skills, and actionable learning suggestions.

### 3. Real-Time WebSockets Messaging
- **Instant Candidate-Recruiter Inbox**: Real-time message streaming powered by Django Channels & WebSockets.
- **Status Indicators**: Typing indicators, active online dots, and unread counter badges.
- **Mobile Responsive Design**: Toggle between inbox contact list and message thread on mobile devices.

### 4. Recruiter Management & Analytics
- **Listing Creation & Analytics**: Post job listings, monitor applicant conversion funnels, and filter candidates.
- **Application Workflow & Interview Scheduler**: Move candidates across stages (*Applied*, *Under Review*, *Shortlisted*, *Interview Scheduled*, *Offered*, *Rejected*) and schedule interviews with calendar integration.

### 5. Production Ready Security & UI Polish
- **UI Aesthetics**: Dark mode violet/fuchsia theme with shimmer loading skeletons, glassmorphism, and responsive grid layouts.
- **Accessibility & Error Pages**: `:focus-visible` accessibility rings, custom 404 Page (`NotFound.jsx`), and custom 500 Error Boundary (`ErrorBoundary.jsx`).
- **Production Security**: Security headers middleware (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`), rate limiting (DRF Throttling), custom DRF exception handler, and structured logging.

---

## Project Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend SPA** | React 18, Vite, Redux Toolkit, Tailwind CSS, Lucide Icons, Framer Motion |
| **Backend REST API** | Django 5.0, Django REST Framework (DRF), SimpleJWT Authentication |
| **Real-time WebSockets** | Django Channels, Daphne, ASGI WebSocket Protocol |
| **AI Microservices** | Python AI Service Layer (Mock/Heuristic provider with Gemini/OpenAI adapter interface) |
| **Database** | PostgreSQL / SQLite3 |
| **API Documentation** | OpenAPI 3.0, DRF Spectacular (Swagger UI & Redoc) |
| **Containerization** | Docker, Docker Compose |

---

## Directory Structure

```text
swipex1234/
├── backend/
│   ├── authentication/      # JWT auth, user models, email verification, password reset
│   ├── profiles/            # Candidate profile, skills, experience, education, AI resume service
│   ├── jobs/                # Job listings, swipe history, applications, AI cover letter & skill gap
│   ├── chat/                # WebSockets real-time chat rooms and messaging history
│   ├── notifications/       # User notification system
│   ├── swipex/              # Django settings, ASGI/WSGI configs, security middleware, utils
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI widgets (AiSkillGapWidget, AiInterviewModal, ErrorBoundary, PageTransition)
│   │   ├── pages/           # Application views (SwipeDiscovery, JobSearch, ApplicationsDashboard, ProfileDashboard, ChatPanel)
│   │   ├── context/         # ToastContext with progress timer bar
│   │   ├── store/           # Redux Toolkit state slices
│   │   └── utils/           # Axios API client with automatic token refresh
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Local Setup & Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Seed demo database with initial job listings & test users
python seed.py

# Run development server
python manage.py runserver 8000
```
Backend API will run at `http://127.0.0.1:8000/`.

### 2. Frontend Setup
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Frontend client will run at `http://localhost:5173/`.

---

## Demo Login Credentials

For instant testing, use the pre-seeded credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Job Seeker** | `seeker@example.com` | ******** |
| **Recruiter** | `recruiter@example.com` | `*******` |

---

## OpenAPI Documentation

SwipeX includes automated OpenAPI 3.0 documentation:
- **Interactive Swagger UI**: `http://127.0.0.1:8000/api/docs/swagger/`
- **Redoc UI**: `http://127.0.0.1:8000/api/docs/redoc/`
- **OpenAPI Schema (JSON)**: `http://127.0.0.1:8000/api/schema/`

---

## Running Test Suite & Builds

### Backend Django Test Suite (50 Tests)
```bash
cd backend
python manage.py test
```

### Frontend Production Build
```bash
cd frontend
npm run build
```

---

## License
Distributed under the MIT License. See `LICENSE` for more information.
