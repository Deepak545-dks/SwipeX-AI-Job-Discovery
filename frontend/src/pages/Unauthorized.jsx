import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home, LogIn } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function Unauthorized() {
  return (
    <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-650/5 rounded-full blur-3xl -z-10 animate-pulse" />

      <div className="max-w-md w-full bg-slate-900/40 border border-white/5 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
          <ShieldAlert size={32} />
        </div>
        
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Access Denied</h1>
          <p className="text-slate-400 text-xs mt-2 leading-relaxed">
            You do not have the required permissions to view this page. If you believe this is an error, please login with an authorized account or contact support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-slate-950/50 hover:bg-white/5 text-slate-350 hover:text-white text-xs font-bold transition-all border border-white/5 active:scale-95"
          >
            <Home size={14} />
            <span>Go Home</span>
          </Link>
          
          <Link
            to="/login"
            className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-md shadow-violet-500/10 active:scale-95"
          >
            <LogIn size={14} />
            <span>Switch Account</span>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
