import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition className="min-h-[80vh] flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-fuchsia-600/10 rounded-full blur-3xl -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full text-center space-y-8 bg-slate-900/40 border border-white/5 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl"
      >
        {/* Icon & 404 Header */}
        <div className="relative inline-block">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
            <AlertTriangle size={36} className="animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[9px] font-black uppercase text-white tracking-widest shadow-md">
            Error 404
          </span>
        </div>

        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Page Not Found</h1>
          <p className="text-slate-400 text-xs mt-3 leading-relaxed">
            The link you followed may be broken, or the page may have been moved. Let's get you back on track!
          </p>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-950/50 hover:bg-white/5 text-slate-350 hover:text-white text-xs font-bold transition-all border border-white/5 active:scale-95 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Go Back</span>
          </button>

          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 active:scale-95"
          >
            <Home size={14} />
            <span>Return Home</span>
          </Link>
        </div>

        {/* Additional Useful Links */}
        <div className="pt-6 border-t border-white/5 flex items-center justify-center space-x-6 text-xxs text-slate-500 uppercase tracking-wider font-bold">
          <Link to="/swipe" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors">
            <Compass size={12} />
            <span>Discover</span>
          </Link>
          <span className="text-slate-800">&bull;</span>
          <Link to="/search" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors font-medium">
            <Search size={12} />
            <span>Search</span>
          </Link>
        </div>
      </motion.div>
    </PageTransition>
  );
}
