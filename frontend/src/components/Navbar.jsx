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

  return (
    <div className="w-full sticky top-4 z-50 px-4 sm:px-6">
      <nav className="max-w-6xl mx-auto rounded-full border border-slate-200/80 bg-white/75 backdrop-blur-2xl px-6 py-3.5 shadow-xl shadow-slate-900/5 flex items-center justify-between transition-all duration-300">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2.5 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-blue-600 to-cyan-500 shadow-sm shadow-violet-500/10 group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={16} className="text-white animate-pulse" />
          </div>
          <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">
            SwipeX
          </span>
        </Link>

        {/* Menu Links */}
        <div className="flex items-center space-x-2">
          {isAuthenticated ? (
            <>
              {/* Seeker / Recruiter Tab Views */}
              <div className="hidden lg:flex items-center space-x-1.5">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link 
                      to="/swipe" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/swipe') 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                          : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <Compass size={16} />
                      <span>Discover</span>
                    </Link>
                    <Link 
                      to="/search" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/search') 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                          : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
                      }`}
                    >
                      <Search size={16} />
                      <span>Search</span>
                    </Link>
                    <Link 
                      to="/applications" 
                      className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                        isActive('/applications') 
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                          : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
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
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                        : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
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
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                        : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
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
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                      : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
                  }`}
                >
                  <Calendar size={16} />
                  <span>Calendar</span>
                </Link>

                <Link 
                  to="/messages" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/messages') 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                      : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
                  }`}
                >
                  <MessageSquare size={16} />
                  <span>Messages</span>
                </Link>

                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-full text-base font-black transition-all border ${
                    isActive('/profile') 
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 border-violet-550 text-white shadow-md shadow-violet-600/10' 
                      : 'text-slate-600 border-transparent hover:text-violet-600 hover:bg-slate-100/60'
                  }`}
                >
                  <User size={16} />
                  <span>Profile</span>
                </Link>
              </div>

              {/* Mobile Navigation Icons */}
              <div className="flex lg:hidden items-center space-x-1">
                {user?.role === 'job_seeker' && (
                  <>
                    <Link to="/swipe" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/swipe') && 'text-violet-600 bg-violet-50'}`} title="Discover"><Compass size={18} /></Link>
                    <Link to="/search" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/search') && 'text-violet-600 bg-violet-50'}`} title="Search"><Search size={18} /></Link>
                    <Link to="/applications" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/applications') && 'text-violet-600 bg-violet-50'}`} title="Applications"><Briefcase size={18} /></Link>
                  </>
                )}
                {user?.role === 'recruiter' && (
                  <Link to="/recruiter" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/recruiter') && 'text-violet-600 bg-violet-50'}`} title="Recruiter Hub"><BarChart2 size={18} /></Link>
                )}
                <Link to="/calendar" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/calendar') && 'text-violet-600 bg-violet-50'}`} title="Calendar"><Calendar size={18} /></Link>
                <Link to="/messages" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/messages') && 'text-violet-600 bg-violet-50'}`} title="Messages"><MessageSquare size={18} /></Link>
                <Link to="/profile" className={`p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 ${isActive('/profile') && 'text-violet-600 bg-violet-50'}`} title="Profile"><User size={18} /></Link>
              </div>

              {/* Notifications Toggle */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2.5 rounded-full text-slate-500 hover:text-violet-600 hover:bg-slate-100/50 transition-all cursor-pointer"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-violet-600 rounded-full border-2 border-white animate-pulse" />
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
                        className="absolute right-0 mt-3.5 w-76 bg-white/95 border border-slate-200 rounded-2xl shadow-xl p-4 z-50 space-y-3 backdrop-blur-2xl"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <span className="text-[10px] font-black text-slate-800 uppercase tracking-wider">Notifications</span>
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead}
                              className="text-violet-600 hover:text-violet-500 text-[9px] font-extrabold transition-colors cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                        </div>

                        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 space-y-2 text-left">
                          {notifications.length === 0 ? (
                            <p className="text-slate-400 text-xxs text-center py-4">No notifications yet.</p>
                          ) : (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                onClick={() => markSingleAsRead(notif.id)}
                                className={`pt-2 pb-2 text-[11px] leading-relaxed cursor-pointer transition-colors ${notif.is_read ? 'text-slate-450' : 'text-slate-800 hover:text-violet-600'}`}
                              >
                                <p className="font-semibold">{notif.message}</p>
                                <span className="text-[9px] text-slate-400 block mt-1">{formatRelativeTime(notif.created_at)}</span>
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
                className="p-2.5 rounded-full text-slate-500 hover:text-rose-500 hover:bg-slate-100/50 transition-all cursor-pointer"
                title="Log Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-extrabold text-xs rounded-full transition-all text-center uppercase tracking-wider"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-full transition-all text-center shadow-md shadow-violet-600/10 uppercase tracking-wider"
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
