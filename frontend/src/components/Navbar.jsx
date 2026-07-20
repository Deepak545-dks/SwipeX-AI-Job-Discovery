import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { LogOut, User, Compass, Briefcase, BarChart2, Bell, Search, MessageSquare, Calendar } from 'lucide-react';
import { clearCredentials } from '../store/slices/authSlice';
import api from '../utils/api';

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

  return (
    <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
            SwipeX
          </span>
        </Link>

        <div className="flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              {user?.role === 'job_seeker' && (
                <>
                  <Link to="/swipe" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                    <Compass size={18} />
                    <span className="hidden sm:inline text-sm">Discover</span>
                  </Link>
                  <Link to="/search" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                    <Search size={18} />
                    <span className="hidden sm:inline text-sm">Search</span>
                  </Link>
                  <Link to="/applications" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                    <Briefcase size={18} />
                    <span className="hidden sm:inline text-sm">Applications</span>
                  </Link>
                </>
              )}

              {user?.role === 'recruiter' && (
                <Link to="/recruiter" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                  <BarChart2 size={18} />
                  <span className="hidden sm:inline text-sm">Recruiter Hub</span>
                </Link>
              )}

              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                  <BarChart2 size={18} />
                  <span className="hidden sm:inline text-sm">Admin Panel</span>
                </Link>
              )}

              <Link to="/calendar" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                <Calendar size={18} />
                <span className="hidden sm:inline text-sm">Calendar</span>
              </Link>

              <Link to="/messages" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                <MessageSquare size={18} />
                <span className="hidden sm:inline text-sm">Messages</span>
              </Link>

              <Link to="/profile" className="flex items-center space-x-1 text-slate-300 hover:text-violet-400 transition-colors">
                <User size={18} />
                <span className="hidden sm:inline text-sm">Profile</span>
              </Link>

              <div className="relative">
                <button 
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 text-slate-300 hover:text-violet-400 transition-colors"
                  title="Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full border border-slate-950 animate-pulse" />
                  )}
                </button>

                {showNotifDropdown && (
                  <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <span className="text-xs font-bold text-white">Notifications</span>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead}
                          className="text-violet-400 hover:text-violet-300 text-[10px] font-bold"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                                        <div className="max-h-60 overflow-y-auto space-y-2">
                      {notifications.length === 0 ? (
                        <div className="text-center py-6 px-4 space-y-2">
                          <Bell size={24} className="mx-auto text-slate-700 animate-pulse" />
                          <p className="text-slate-500 text-[10px]">No new alerts or matching notifications.</p>
                        </div>
                      ) : (
                        notifications.map(n => (
                          <div 
                            key={n.id}
                            onClick={() => markSingleAsRead(n.id)}
                            className={`p-2.5 rounded-xl border text-[11px] leading-relaxed cursor-pointer transition-all ${
                              n.is_read 
                                ? 'bg-slate-950/20 border-transparent text-slate-400' 
                                : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-850'
                            }`}
                          >
                            <div className="font-bold text-white flex items-center justify-between">
                              <span>{n.title}</span>
                              {!n.is_read && <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0 ml-2" />}
                            </div>
                            <p className="mt-1">{n.message}</p>
                            <span className="text-[9px] text-slate-500 block mt-1 font-semibold">
                              {formatRelativeTime(n.created_at)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-4 py-2 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-red-400 transition-all text-sm"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-slate-300 hover:text-violet-400 text-sm font-medium transition-colors">
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-lg hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
