import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-slate-900/95 border border-emerald-500/30 text-emerald-400',
          bar: 'bg-emerald-500',
          icon: <CheckCircle className="text-emerald-400 shrink-0" size={18} />
        };
      case 'error':
        return {
          bg: 'bg-slate-900/95 border border-red-500/30 text-red-400',
          bar: 'bg-red-500',
          icon: <AlertCircle className="text-red-400 shrink-0" size={18} />
        };
      case 'warning':
        return {
          bg: 'bg-slate-900/95 border border-amber-500/30 text-amber-400',
          bar: 'bg-amber-500',
          icon: <AlertCircle className="text-amber-400 shrink-0" size={18} />
        };
      case 'info':
      default:
        return {
          bg: 'bg-slate-900/95 border border-violet-500/30 text-violet-400',
          bar: 'bg-violet-500',
          icon: <Info className="text-violet-400 shrink-0" size={18} />
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast floating container */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 space-y-3 z-[9999] max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => {
            const styles = getToastStyles(toast.type);
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ type: 'spring', damping: 22, stiffness: 280 }}
                className={`pointer-events-auto relative overflow-hidden flex items-center justify-between p-4 rounded-2xl shadow-2xl backdrop-blur-xl ${styles.bg}`}
              >
                <div className="flex items-center space-x-3 pr-2">
                  {styles.icon}
                  <span className="text-xs font-semibold tracking-wide leading-relaxed text-slate-100">
                    {toast.message}
                  </span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  aria-label="Close notification"
                  className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <X size={14} />
                </button>

                {/* Animated progress bar */}
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: (toast.duration || 3500) / 1000, ease: 'linear' }}
                  style={{ originX: 0 }}
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${styles.bar} opacity-70`}
                />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
