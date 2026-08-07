import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function PublicNavbar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

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

        {/* Center Public Links */}
        <div className="hidden md:flex items-center space-x-6 font-bold text-xs uppercase tracking-wider text-slate-400">
          <a href="/#features" className="hover:text-white transition-colors">Features</a>
          <Link to="/pricing" className={`hover:text-white transition-colors ${isActive('/pricing') ? 'text-white' : ''}`}>Pricing</Link>
          <Link to="/about" className={`hover:text-white transition-colors ${isActive('/about') ? 'text-white' : ''}`}>About</Link>
          <Link to="/contact" className={`hover:text-white transition-colors ${isActive('/contact') ? 'text-white' : ''}`}>Contact</Link>
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex items-center space-x-2.5">
          <Link
            to="/login"
            className="px-5 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold text-xs rounded-full transition-all text-center uppercase tracking-wider"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-5 py-2 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-505 text-white font-extrabold text-xs rounded-full transition-all text-center shadow-lg shadow-violet-600/10 uppercase tracking-wider"
          >
            Sign Up
          </Link>
        </div>
      </nav>
    </div>
  );
}
