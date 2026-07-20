import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Search, ArrowLeft, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-8 bg-slate-900/40 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        {/* Icon & 404 Header */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <AlertTriangle size={40} className="animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-violet-600 text-[10px] font-black uppercase text-white tracking-widest shadow-md">
            Error 404
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">Page Not Found</h1>
          <p className="text-slate-400 text-sm mt-3 leading-relaxed">
            The link you followed may be broken, or the page may have been moved. Let's get you back on track!
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <ArrowLeft size={16} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-lg shadow-violet-500/10 hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <Home size={16} />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Additional Useful Links */}
        <div className="pt-6 border-t border-slate-850/60 flex items-center justify-center space-x-6 text-xs text-slate-400">
          <Link to="/swipe" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors font-medium">
            <Compass size={14} />
            <span>Discover Jobs</span>
          </Link>
          <span className="text-slate-700">&bull;</span>
          <Link to="/search" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors font-medium">
            <Search size={14} />
            <span>Search Roles</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
