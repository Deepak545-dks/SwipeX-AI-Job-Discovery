import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion } from 'framer-motion';

export default function Unauthorized() {
  return (
    <PageTransition className="min-h-screen flex items-center justify-center px-4 py-12 text-center relative overflow-hidden bg-[#090e1a] text-white">
      
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
          
          <div className="w-16 h-16 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-md">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-white tracking-tight">Access Denied</h1>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-semibold">
              You do not have the required permissions to view this page. If you believe this is an error, please login with an authorized account or contact support.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/"
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 border border-white/10 hover:bg-slate-950 text-slate-350 hover:text-white text-xs font-bold transition-all active:scale-95 text-center"
            >
              <Home size={14} />
              <span>Go Home</span>
            </Link>
            
            <Link
              to="/login"
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-violet-555 text-center uppercase tracking-wider"
            >
              <LogIn size={14} />
              <span>Switch Account</span>
            </Link>
          </div>

        </div>
      </motion.div>
    </PageTransition>
  );
}
