import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 py-16 text-slate-400 relative z-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-5">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-violet-400 transition-colors duration-300">
              SwipeX
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-slate-500 font-medium">
            Intelligent swipe-based career discovery platform. Swipe right, match instantly, and direct chat with enterprise recruiters.
          </p>
          <div className="flex space-x-3 pt-2">
            <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all hover:scale-110" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all hover:scale-110" aria-label="GitHub">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a href="#" className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5 hover:border-white/10 transition-all hover:scale-110" aria-label="LinkedIn">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        
        <div>
          <h4 className="text-white text-xs font-black uppercase tracking-wider mb-5">Product</h4>
          <ul className="space-y-3 text-xs font-medium">
            <li><Link to="/swipe" className="hover:text-violet-400 transition-colors">Discover Deck</Link></li>
            <li><Link to="/search" className="hover:text-violet-400 transition-colors">ATS Filter Job Search</Link></li>
            <li><Link to="/profile" className="hover:text-violet-400 transition-colors">AI Resume Optimization</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-black uppercase tracking-wider mb-5">Resources</h4>
          <ul className="space-y-3 text-xs font-medium">
            <li><a href="#" className="hover:text-violet-400 transition-colors">API Reference</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">System Status</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Documentation</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-black uppercase tracking-wider mb-5">Legal</h4>
          <ul className="space-y-3 text-xs font-medium">
            <li><a href="#" className="hover:text-violet-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-violet-400 transition-colors">Security Policies</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xxs text-slate-500 font-extrabold uppercase tracking-widest">
        <p>&copy; {new Date().getFullYear()} SwipeX Tech. All rights reserved.</p>
        <p className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Built for the future of work.</p>
      </div>
    </footer>
  );
}

