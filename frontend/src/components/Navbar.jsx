import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Compass, Briefcase, BarChart2, Bell, Search, MessageSquare, Calendar, Shield, Sparkles } from 'lucide-react';
import { clearCredentials } from '../store/slices/authSlice';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const formatRelativeTime = (dateString) => {
  try {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch (e) {
    return 'Recently';
  }
};

export default function Navbar() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.get('/notifications/');
      setNotifications(response.data.results || response.data);
    } catch (e) {
      console.error("Failed to fetch notifications:", e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all/');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.error("Logout failed on server:", e);
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-2xl px-6 py-4.5 shadow-lg shadow-black/20">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 shadow-lg shadow-violet-500/25 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={20} className="text-white animate-pulse" />
          </div>
          <span className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 group-hover:from-white group-hover:to-white transition-all duration-300">
            SwipeX
          </span>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          {isAuthenticated ? (
            <>
              <div className="hidden lg:flex items-center space-x-1.5">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link 
                      to="/swipe" 
                      className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive('/swipe') 
                          ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Compass size={15} />
                      <span>Discover</span>
                    </Link>
                    <Link 
                      to="/search" 
                      className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive('/search') 
                          ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Search size={15} />
                      <span>Search</span>
                    </Link>
                    <Link 
                      to="/applications" 
                      className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                        isActive('/applications') 
                          ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Briefcase size={15} />
                      <span>Applications</span>
                    </Link>
                  </>
                )}

                {user?.role === 'recruiter' && (
                  <Link 
                    to="/recruiter" 
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive('/recruiter') 
                        ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <BarChart2 size={15} />
                    <span>Recruiter Hub</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      isActive('/admin') 
                        ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Shield size={15} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link 
                  to="/calendar" 
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive('/calendar') 
                      ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Calendar size={15} />
                  <span>Calendar</span>
                </Link>

                <Link 
                  to="/messages" 
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive('/messages') 
                      ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <MessageSquare size={15} />
                  <span>Messages</span>
                </Link>

                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-violet-600/15 to-fuchsia-600/15 border-violet-500/30 text-violet-400 shadow-inner' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <User size={15} />
                  <span>Profile</span>
                </Link>
              </div>

              {/* Mobile Navigation Icons */}
              <div className="flex lg:hidden items-center space-x-0.5">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link to="/swipe" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/swipe') && 'text-violet-400 bg-violet-500/5'}`} title="Discover"><Compass size={18} /></Link>
                    <Link to="/search" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/search') && 'text-violet-400 bg-violet-500/5'}`} title="Search"><Search size={18} /></Link>
                    <Link to="/applications" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/applications') && 'text-violet-400 bg-violet-500/5'}`} title="Applications"><Briefcase size={18} /></Link>
                  </>
                )}
                {user?.role === 'recruiter' && (
                  <Link to="/recruiter" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/recruiter') && 'text-violet-400 bg-violet-500/5'}`} title="Recruiter Hub"><BarChart2 size={18} /></Link>
                )}
                <Link to="/calendar" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/calendar') && 'text-violet-400 bg-violet-500/5'}`} title="Calendar"><Calendar size={18} /></Link>
                <Link to="/messages" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/messages') && 'text-violet-400 bg-violet-500/5'}`} title="Messages"><MessageSquare size={18} /></Link>
                <Link to="/profile" className={`p-2 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/profile') && 'text-violet-400 bg-violet-500/5'}`} title="Profile"><User size={18} /></Link>
              </div>

              {/* Notifications Dropdown Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 rounded-xl text-slate-400 hover:text-violet-400 hover:bg-white/5 transition-all"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full border-2 border-slate-950 animate-pulse" />
                  )}
                </button>

                <AnimatePresence>
                  {showNotifDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-3 w-80 bg-slate-900/95 border border-white/5 rounded-2xl shadow-2xl p-4 z-50 space-y-3 backdrop-blur-xl"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-xs font-bold text-white">Notifications</span>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-violet-400 hover:text-violet-300 text-[10px] font-bold transition-colors"
                            >
                              Mark all read
                            </button>
                          )}
                        </div>

                        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                          {notifications.length === 0 ? (
                            <div className="text-center py-8 space-y-2">
                              <Bell size={24} className="mx-auto text-slate-700" />
                              <p className="text-slate-500 text-[10px]">No notifications available.</p>
                            </div>
                          ) : (
                            notifications.map(n => (
                              <div 
                                key={n.id}
                                onClick={() => { markSingleAsRead(n.id); }}
                                className={`p-2.5 rounded-xl border text-[11px] leading-relaxed cursor-pointer transition-all ${
                                  n.is_read 
                                    ? 'bg-transparent border-transparent text-slate-400' 
                                    : 'bg-white/5 border-white/5 text-slate-200 hover:bg-white/10'
                                }`}
                              >
                                <div className="font-bold text-white flex items-center justify-between">
                                  <span>{n.title}</span>
                                  {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 ml-2" />}
                                </div>
                                <p className="mt-1 text-slate-400">{n.message}</p>
                                <span className="text-[9px] text-slate-500 block mt-1 font-semibold">
                                  {formatRelativeTime(n.created_at)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl border border-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-all text-xs font-semibold"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-350 hover:text-violet-400 text-xs font-bold transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl hover:scale-[1.02] active:scale-95 transition-all shadow-md shadow-violet-500/10"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
