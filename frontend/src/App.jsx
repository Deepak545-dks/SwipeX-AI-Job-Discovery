import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components for code-splitting
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Unauthorized = lazy(() => import('./pages/Unauthorized'));
const NotFound = lazy(() => import('./pages/NotFound'));

const SwipeDiscovery = lazy(() => import('./pages/SwipeDiscovery'));
const JobSearch = lazy(() => import('./pages/JobSearch'));
const ApplicationsDashboard = lazy(() => import('./pages/ApplicationsDashboard'));
const ProfileDashboard = lazy(() => import('./pages/ProfileDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const ChatPanel = lazy(() => import('./pages/ChatPanel'));
const VideoInterview = lazy(() => import('./pages/VideoInterview'));
const CalendarDashboard = lazy(() => import('./pages/CalendarDashboard'));
const AdminPlaceholder = lazy(() => import('./pages/AdminPlaceholder'));

// Center glassmorphic loading spinner fallback
const PageLoader = () => (
  <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-4">
    <div className="relative w-14 h-14">
      <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-r-transparent border-l-violet-500 border-b-fuchsia-500 animate-spin" />
    </div>
    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
      Loading Page...
    </span>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
        <Navbar />
        <main className="flex-grow">
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Job Seeker Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['job_seeker']} />}>
                  <Route path="/swipe" element={<SwipeDiscovery />} />
                  <Route path="/search" element={<JobSearch />} />
                  <Route path="/applications" element={<ApplicationsDashboard />} />
                  <Route path="/profile" element={<ProfileDashboard />} />
                </Route>

                {/* Recruiter Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['recruiter']} />}>
                  <Route path="/recruiter" element={<RecruiterDashboard />} />
                </Route>

                {/* Shared Chat & Video Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['job_seeker', 'recruiter']} />}>
                  <Route path="/messages" element={<ChatPanel />} />
                  <Route path="/call/:roomId" element={<VideoInterview />} />
                  <Route path="/calendar" element={<CalendarDashboard />} />
                </Route>

                {/* Admin Protected Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin" element={<AdminPlaceholder />} />
                </Route>

                {/* 404 Fallback route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
