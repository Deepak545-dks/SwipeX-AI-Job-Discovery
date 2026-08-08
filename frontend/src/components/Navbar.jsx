import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Compass, Briefcase, BarChart2, Bell, Search, MessageSquare, Calendar, Shield, Sparkles, Settings } from 'lucide-react';
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
    const interval = setInterval(fetchNotifications, 15000);
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

  const workspacePaths = [
    '/swipe',
    '/discover',
    '/ats-analyzer',
    '/ai-studio',
    '/smart-search',
    '/analytics',
    '/saved-jobs'
  ];

  if (workspacePaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="w-full sticky top-4 z-50 px-4 sm:px-6">
      <nav className="max-w-6xl mx-auto rounded-full border border-white/10 bg-slate-950/75 backdrop-blur-2xl px-6 py-3.5 shadow-2xl shadow-violet-950/20 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
            SwipeX
          </span>
        </Link>

        {/* Menu Links */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {isAuthenticated ? (
            <>
              {/* Seeker / Recruiter Tab Views */}
              <div className="hidden lg:flex items-center space-x-1.5 font-bold">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link 
                      to="/discover" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/discover') 
                          ? 'bg-gradient-to-r from-violet-650 via-fuchsia-600 to-indigo-650 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Compass size={16} />
                      <span>Discover</span>
                    </Link>
                    <Link 
                      to="/search" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/search') 
                          ? 'bg-gradient-to-r from-violet-650 via-fuchsia-600 to-indigo-650 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Search size={16} />
                      <span>Search</span>
                    </Link>
                    <Link 
                      to="/applications" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/applications') 
                          ? 'bg-gradient-to-r from-violet-650 via-fuchsia-600 to-indigo-650 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                          : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Briefcase size={16} />
                      <span>Applications</span>
                    </Link>
                  </>
                )}

                {user?.role === 'recruiter' && (
                  <Link 
                    to="/recruiter" 
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full text-base font-black transition-all border ${
                      isActive('/recruiter') 
                        ? 'bg-gradient-to-r from-violet-655 via-fuchsia-600 to-indigo-655 border-violet-500/30 text-white shadow-lg' 
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <BarChart2 size={16} />
                    <span>Recruiter Hub</span>
                  </Link>
                )}

                {user?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full text-base font-black transition-all border ${
                      isActive('/admin') 
                        ? 'bg-gradient-to-r from-violet-655 via-fuchsia-600 to-indigo-655 border-violet-500/30 text-white shadow-lg' 
                        : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Shield size={16} />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link 
                  to="/calendar" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/calendar') 
                      ? 'bg-gradient-to-r from-violet-650 via-fuchsia-600 to-indigo-650 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Calendar size={16} />
                  <span>Calendar</span>
                </Link>

                <Link 
                  to="/messages" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/messages') 
                      ? 'bg-gradient-to-r from-violet-655 via-fuchsia-600 to-indigo-655 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Messages</span>
                </Link>

                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-violet-655 via-fuchsia-600 to-indigo-655 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>

                <Link 
                  to="/settings" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/settings') 
                      ? 'bg-gradient-to-r from-violet-655 via-fuchsia-600 to-indigo-655 border-violet-500/30 text-white shadow-lg shadow-violet-500/10' 
                      : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </Link>
              </div>

              {/* Mobile Navigation Icons */}
              <div className="flex lg:hidden items-center space-x-1">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link to="/discover" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/discover') && 'text-violet-400 bg-violet-500/5'}`} title="Discover"><Compass size={18} /></Link>
                    <Link to="/search" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/search') && 'text-violet-400 bg-violet-500/5'}`} title="Search"><Search size={18} /></Link>
                    <Link to="/applications" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/applications') && 'text-violet-400 bg-violet-500/5'}`} title="Applications"><Briefcase size={18} /></Link>
                  </>
                )}
                {user?.role === 'recruiter' && (
                  <Link to="/recruiter" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/recruiter') && 'text-violet-400 bg-violet-500/5'}`} title="Recruiter Hub"><BarChart2 size={18} /></Link>
                )}
                <Link to="/calendar" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/calendar') && 'text-violet-400 bg-violet-500/5'}`} title="Calendar"><Calendar size={18} /></Link>
                <Link to="/messages" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/messages') && 'text-violet-400 bg-violet-500/5'}`} title="Messages"><MessageSquare size={18} /></Link>
                <Link to="/profile" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/profile') && 'text-violet-400 bg-violet-500/5'}`} title="Profile"><User size={18} /></Link>
                <Link to="/settings" className={`p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 ${isActive('/settings') && 'text-violet-400 bg-violet-500/5'}`} title="Settings"><Settings size={18} /></Link>
              </div>

              {/* Notifications Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2.5 rounded-full text-slate-400 hover:text-violet-400 hover:bg-white/5 transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-violet-550 rounded-full border-2 border-slate-950 animate-pulse" />
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
                        className="absolute right-0 mt-3.5 w-76 bg-slate-950/95 border border-white/10 rounded-2xl shadow-2xl p-4 z-50 space-y-3 backdrop-blur-3xl"
                      >
                        <div className="flex items-center justify-between border-b border-white/5 pb-2">
                          <span className="text-[10px] font-black text-white uppercase tracking-wider">Notifications</span>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-violet-400 hover:text-violet-300 text-[9px] font-extrabold transition-colors cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-white/5 space-y-2 text-left">
                          {notifications.length === 0 ? (
                            <p className="text-slate-500 text-xxs text-center py-4">No notifications yet.</p>
                          ) : (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                onClick={() => markSingleAsRead(notif.id)}
                                className={`pt-2 pb-2 text-[11px] leading-relaxed cursor-pointer transition-colors ${notif.is_read ? 'text-slate-500' : 'text-white hover:text-violet-305'}`}
                              >
                                <p className="font-semibold">{notif.message}</p>
                                <span className="text-[9px] text-slate-500 block mt-1">{formatRelativeTime(notif.created_at)}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2.5 rounded-full text-slate-400 hover:text-rose-455 hover:bg-white/5 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-5 py-2.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold text-xs rounded-full transition-all text-center uppercase tracking-wider"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-505 text-white font-extrabold text-xs rounded-full transition-all text-center shadow-lg shadow-violet-600/10 uppercase tracking-wider"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
