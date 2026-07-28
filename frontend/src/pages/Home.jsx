import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Briefcase, FileText, CheckCircle2, ChevronRight, 
  Star, Sparkles, ShieldCheck, Flame, Heart, X, MessageSquare, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [demoState, setDemoState] = useState('swipe');
  const [swipeDirection, setSwipeDirection] = useState(null);

  const handleDemoAction = (action) => {
    if (action === 'like') {
      setSwipeDirection('right');
      setTimeout(() => {
        setDemoState('match');
      }, 250);
    } else {
      setSwipeDirection('left');
      setTimeout(() => {
        setDemoState('disliked');
      }, 250);
    }
  };

  const resetDemo = () => {
    setSwipeDirection(null);
    setDemoState('swipe');
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden pt-12">
      {/* Background Gradients */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-cyan-600/10 rounded-full blur-[160px] -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20" />

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-6 text-center space-y-8 pt-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/60 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 text-xs font-black uppercase tracking-widest shadow-xl"
        >
          <Sparkles size={12} className="text-violet-400 animate-spin mr-1 shrink-0" />
          <span>SwipeX Career Ecosystem 2.0</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl sm:text-6xl md:text-8xl font-black text-white leading-[1.02] tracking-tight max-w-4xl mx-auto"
        >
          Match with the{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 via-pink-400 via-cyan-400 to-emerald-400">
            Future of Work
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed font-semibold"
        >
          Bypass complex resumes. swipe matching aligns verified tech stacks directly to recruiters for seamless interviewing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <Link
            to="/register"
            className="flex items-center space-x-2 px-8 py-4.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-full transition-all shadow-xl shadow-violet-650/30 hover:scale-[1.03] active:scale-95 group uppercase tracking-widest"
          >
            <span>Create Free Account</span>
            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4.5 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-900/70 text-slate-300 hover:text-white font-extrabold text-xs rounded-full transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest"
          >
            Sign In
          </Link>
        </motion.div>
      </div>

      {/* Interactive Swiper Card Section centered underneath */}
      <div className="mt-20 max-w-lg mx-auto px-6 flex justify-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full relative p-[1px] rounded-[36px] overflow-hidden bg-gradient-to-tr from-violet-500/30 via-fuchsia-500/30 to-cyan-500/35 shadow-2xl shadow-black/80"
        >
          <div className="w-full h-[460px] bg-slate-950/90 backdrop-blur-3xl rounded-[35px] p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

            <AnimatePresence mode="wait">
              {demoState === 'swipe' && (
                <motion.div
                  key="demo-deck"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: swipeDirection === 'right' ? 300 : swipeDirection === 'left' ? -300 : 0,
                    rotate: swipeDirection === 'right' ? 12 : swipeDirection === 'left' ? -12 : 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2.5 py-1 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-wider">
                        Full-Time
                      </span>
                      <span className="px-2.5 py-1 rounded bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-wider">
                        98% Match
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight">Staff Systems Engineer</h3>
                    <p className="text-violet-400 text-xs font-bold mt-1">Google Inc.</p>

                    <div className="flex items-center space-x-2 text-slate-500 text-xxs mt-3 font-semibold">
                      <span className="text-white">$210k - $260k</span>
                      <span>•</span>
                      <span>Mountain View, CA</span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mt-4 line-clamp-3">
                      Build core storage infrastructure utilizing Go, Kubernetes, and gRPC frameworks. Handle peta-scale streaming data pipelines.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Golang', 'Kubernetes', 'gRPC', 'Systems Design'].map(skill => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-350">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-center items-center space-x-6 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleDemoAction('dislike')}
                      className="w-12 h-12 rounded-full bg-slate-900 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-md shadow-rose-950/10 hover:scale-110 active:scale-95 transition-all"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={() => handleDemoAction('like')}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/25 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Heart size={22} className="fill-white" />
                    </button>
                  </div>
                </motion.div>
              )}

              {demoState === 'match' && (
                <motion.div
                  key="demo-match"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between items-center text-center py-6"
                >
                  <div className="space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-bounce">
                      <Sparkles size={28} />
                    </div>
                    <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">It's a Match!</h4>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto font-semibold">
                      Google's engineering director has accepted your profile. Direct chat opened!
                    </p>
                  </div>

                  <div className="flex items-center justify-center -space-x-3 my-4">
                    <div className="w-11 h-11 rounded-full border-2 border-slate-950 bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-extrabold text-xs text-white">
                      YOU
                    </div>
                    <div className="w-11 h-11 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center font-extrabold text-[9px] text-violet-400 border-white/10">
                      GGL
                    </div>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 font-extrabold text-xs transition-all border border-white/10 uppercase tracking-wider"
                  >
                    Reswipe Deck
                  </button>
                </motion.div>
              )}

              {demoState === 'disliked' && (
                <motion.div
                  key="demo-dislike"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between items-center text-center py-8"
                >
                  <div className="space-y-3">
                    <div className="inline-flex p-3 rounded-full bg-slate-900 border border-white/10 text-slate-500">
                      <Compass size={28} />
                    </div>
                    <h4 className="text-lg font-black text-white">Job Skipped</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto font-medium">
                      Google's listing was passed. Try swiping on another.
                    </p>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs transition-all uppercase tracking-wider"
                  >
                    Reswipe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Curated Grid Options */}
      <div className="max-w-6xl mx-auto px-6 mt-36">
        <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Product Layout Features</h2>
          <p className="text-slate-400 text-xs sm:text-sm font-semibold">Match directly, gap test, and chat in one consolidated interface.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/30 border border-white/5 hover:border-violet-500/35 transition-all backdrop-blur-xl relative group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6">
              <Compass size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">Tinder Swipe Deck</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Match based on tech stack metrics. Swipe right to apply immediately, skip left if not interested.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/30 border border-white/5 hover:border-fuchsia-500/35 transition-all backdrop-blur-xl relative group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6">
              <FileText size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">AI Gap Optimization</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Identify key skills you lack for specific target roles and receive customized optimization recommendations.
            </p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/30 border border-white/5 hover:border-cyan-500/35 transition-all backdrop-blur-xl relative group">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6">
              <MessageSquare size={22} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">Direct Messaging</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Skip agency filters. Connect with engineers and hiring managers immediately via WebSockets once you match.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
