import React, { Component } from 'react';
import { ShieldAlert, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught application error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full text-center space-y-6 bg-slate-900/60 border border-slate-800 p-8 sm:p-10 rounded-3xl backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
              <ShieldAlert size={36} />
            </div>

            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-850 text-red-400 text-xxs font-extrabold uppercase tracking-widest mb-3">
                System Error (500)
              </span>
              <h1 className="text-2xl font-black text-white">Something Went Wrong</h1>
              <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                An unexpected application rendering issue occurred. Don't worry, our system remains secure.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-850 text-left text-xxs font-mono text-red-300/80 overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>

              <a
                href="/"
                className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <Home size={14} />
                <span>Go Home</span>
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
