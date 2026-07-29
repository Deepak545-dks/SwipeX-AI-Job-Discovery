import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Compass, Briefcase, Calendar, MessageSquare, User, Settings, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const items = [
    { label: 'Discover Jobs', icon: Compass, path: '/swipe', keywords: 'swipe, recommend, match' },
    { label: 'Search Console', icon: Search, path: '/search', keywords: 'query, filters, salary' },
    { label: 'Applications Pipeline', icon: Briefcase, path: '/applications', keywords: 'kanban, resume, statuses' },
    { label: 'Interview Calendar', icon: Calendar, path: '/calendar', keywords: 'appointments, schedules, calls' },
    { label: 'Messages Inbox', icon: MessageSquare, path: '/messages', keywords: 'chat, direct, contact' },
    { label: 'Profile Hub', icon: User, path: '/profile', keywords: 'skills, resume, qualifications' },
    { label: 'Account Settings', icon: Settings, path: '/settings', keywords: 'security, theme, configurations' }
  ];

  const filteredItems = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.keywords.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path) => {
    navigate(path);
    setOpen(false);
    setQuery('');
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        {/* Command Menu Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.97, y: -15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="w-full max-w-lg p-[1px] rounded-3xl bg-gradient-to-tr from-violet-500/30 via-cyan-500/20 to-transparent relative overflow-hidden shadow-2xl z-10"
        >
          <div className="bg-[#0b0f19] rounded-[23px] border border-white/5 overflow-hidden flex flex-col text-left">
            
            {/* Input Bar */}
            <div className="p-4.5 border-b border-white/10 flex items-center gap-3 relative">
              <Search size={18} className="text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search command shortcuts or help pages..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-550 outline-none font-semibold"
                autoFocus
              />
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* List options */}
            <div className="p-3 max-h-72 overflow-y-auto space-y-1.5">
              {filteredItems.length === 0 ? (
                <p className="text-slate-500 text-xxs font-bold py-6 text-center">No shortcut matches found.</p>
              ) : (
                filteredItems.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(item.path)}
                      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 text-slate-405 hover:text-white transition-all cursor-pointer font-semibold"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="p-2 rounded-lg bg-slate-900 border border-white/5 text-violet-400 group-hover:text-cyan-400">
                          <Icon size={14} />
                        </div>
                        <span className="text-xs text-slate-200">{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-550 uppercase tracking-widest font-black">Jump &rarr;</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-white/5 bg-slate-950 flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-550">
              <span className="flex items-center gap-1.5">
                <Sparkles size={11} className="text-violet-400" />
                <span>SwipeX command dashboard</span>
              </span>
              <span>ESC to exit</span>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
