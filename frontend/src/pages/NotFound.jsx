import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Compass, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-16 relative overflow-hidden bg-[#090e1a] text-white">
      
      {/* Background spotlights: Purple + Pink Theme for Error */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-605/15 via-pink-500/10 to-transparent rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-gradient-to-br from-pink-500/15 via-violet-650/10 to-transparent rounded-full blur-[130px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500/35 via-fuchsia-500/30 to-cyan-500/35 shadow-2xl"
      >
        <div className="w-full bg-[#0d1325]/90 rounded-[28px] p-8 sm:p-10 border border-white/5 shadow-lg text-white flex flex-col justify-between text-left space-y-6">
          
          <div className="relative inline-block text-center mx-auto">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-lg">
              <AlertTriangle size={36} className="animate-bounce" />
            </div>
            <span className="absolute -bottom-2 -right-2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-[9px] font-black uppercase text-white tracking-widest shadow-md border border-violet-555">
              Error 404
            </span>
          </div>

          <div className="text-center">
            <h1 className="text-3xl font-black text-white tracking-tight">Page Not Found</h1>
            <p className="text-slate-400 text-xs mt-3 leading-relaxed font-semibold">
              The link you followed may be broken, or the page may have been moved. Let's get you back on track!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-950 text-slate-350 hover:text-white text-xs font-bold transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Go Back</span>
            </button>

            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-violet-555 text-center uppercase tracking-wider"
            >
              <Home size={14} />
              <span>Return Home</span>
            </Link>
          </div>

          <div className="pt-6 border-t border-white/5 flex items-center justify-center space-x-6 text-xxs text-slate-500 uppercase tracking-widest font-black">
            <Link to="/swipe" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors">
              <Compass size={12} />
              <span>Discover</span>
            </Link>
            <span className="text-slate-800">&bull;</span>
            <Link to="/search" className="flex items-center space-x-1.5 hover:text-violet-400 transition-colors">
              <Search size={12} />
              <span>Search</span>
            </Link>
          </div>

        </div>
      </motion.div>
    </PageTransition>
  );
}
