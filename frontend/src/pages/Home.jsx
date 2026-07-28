import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Briefcase, FileText, CheckCircle2, ChevronRight, 
  Star, Sparkles, ShieldCheck, Flame, Heart, X, MessageSquare, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [demoState, setDemoState] = useState('swipe'); // 'swipe', 'liked', 'disliked', 'match'
  const [swipeDirection, setSwipeDirection] = useState(null);

  const handleDemoAction = (action) => {
    if (action === 'like') {
      setSwipeDirection('right');
      setTimeout(() => {
        setDemoState('match');
      }, 300);
    } else {
      setSwipeDirection('left');
      setTimeout(() => {
        setDemoState('disliked');
      }, 300);
    }
  };

  const resetDemo = () => {
    setSwipeDirection(null);
    setDemoState('swipe');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="relative min-h-screen pb-24 overflow-hidden">
      {/* Aurora Ambient Lighting */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-full blur-[140px] -z-10 animate-pulse duration-[8000ms]" />
      <div className="absolute top-[30%] right-10 w-[500px] h-[500px] bg-gradient-to-r from-pink-600/10 to-fuchsia-600/10 rounded-full blur-[120px] -z-10 animate-pulse duration-[6000ms]" />
      <div className="absolute bottom-[10%] left-10 w-[600px] h-[600px] bg-gradient-to-r from-cyan-600/10 to-blue-600/10 rounded-full blur-[150px] -z-10" />

      {/* Cyber Grid Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] -z-20" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 pt-20 lg:pt-28 grid lg:grid-cols-12 gap-16 items-center">
        {/* Left Hero Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-8"
        >
          {/* Badge */}
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-slate-900/80 border border-violet-500/30 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400 text-xs font-black uppercase tracking-widest shadow-lg shadow-violet-950/20"
          >
            <Sparkles size={14} className="text-violet-400 animate-spin shrink-0" />
            <span>AI-Driven Job Discovery 2.0</span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight"
          >
            Swipe Right on Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 animate-gradient-flow">
              Dream Career
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants} 
            className="text-slate-400 text-base sm:text-lg max-w-xl leading-relaxed font-medium"
          >
            The next-generation career discovery engine. Match with top-tier companies, analyze resume skill gaps, generate AI cover letters, and chat instantly with recruiters.
          </motion.p>

          {/* Quick Metrics */}
          <motion.div 
            variants={itemVariants} 
            className="grid grid-cols-3 gap-6 border-y border-white/10 py-6 max-w-lg"
          >
            <div>
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400 block">98%</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mt-1">Match Accuracy</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-pink-400 block">12ms</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mt-1">Swipe Latency</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 block">45K+</span>
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mt-1">Hired Candidates</span>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-wrap gap-4 pt-2"
          >
            <Link
              to="/register"
              className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-xl shadow-violet-600/35 hover:scale-[1.03] active:scale-95 group uppercase tracking-widest"
            >
              <span>Get Started Free</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-8 py-4 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold text-xs rounded-xl transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Interactive Swipe Demo Column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="lg:col-span-5 flex justify-center items-center"
        >
          <div className="relative w-full max-w-[380px] h-[480px] bg-slate-900/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/10 shadow-2xl shadow-black/80 flex flex-col justify-between overflow-hidden">
            {/* Ambient Background Gradient inside card */}
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-violet-600/20 to-transparent -z-10" />

            <AnimatePresence mode="wait">
              {demoState === 'swipe' && (
                <motion.div
                  key="swipe-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    x: swipeDirection === 'right' ? 300 : swipeDirection === 'left' ? -300 : 0,
                    rotate: swipeDirection === 'right' ? 15 : swipeDirection === 'left' ? -15 : 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="h-full flex flex-col justify-between"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/30 text-violet-400 text-[10px] font-black uppercase tracking-wider">
                          Full-Time
                        </span>
                        <span className="ml-2 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-wider">
                          Remote
                        </span>
                      </div>
                      <div className="flex items-center text-amber-400 bg-amber-400/5 px-2 py-0.5 rounded-lg border border-amber-400/20">
                        <Star size={12} className="fill-amber-400 mr-1" />
                        <span className="text-[10px] font-black">99% Match</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-white leading-snug">Senior React Architect</h3>
                    <p className="text-violet-400 text-xs font-bold mt-1">Stripe Inc.</p>

                    <div className="flex items-center space-x-2 text-slate-400 text-xxs mt-3">
                      <span className="font-extrabold text-slate-300">$180,000 - $220,000</span>
                      <span>•</span>
                      <span>San Francisco, CA</span>
                    </div>

                    <p className="text-slate-400 text-xs leading-relaxed mt-4 line-clamp-3">
                      Scale the world's finest payment user interfaces. Leverage React 19, TailwindCSS, and custom design systems.
                    </p>
                  </div>

                  {/* Skills Tag Section */}
                  <div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest block mb-2">Required Skills</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['React', 'TypeScript', 'TailwindCSS', 'UX Design'].map(skill => (
                        <span key={skill} className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action Controllers */}
                  <div className="flex justify-center items-center space-x-6 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleDemoAction('dislike')}
                      className="w-12 h-12 rounded-full bg-slate-950 border border-rose-500/20 hover:border-rose-500/50 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-md shadow-rose-950/10 hover:scale-110 active:scale-95 transition-all"
                    >
                      <X size={20} />
                    </button>
                    <button 
                      onClick={() => handleDemoAction('like')}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-600/30 hover:scale-110 active:scale-95 transition-all"
                    >
                      <Heart size={24} className="fill-white" />
                    </button>
                  </div>
                </motion.div>
              )}

              {demoState === 'match' && (
                <motion.div
                  key="match-celebration"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between items-center text-center py-6"
                >
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-bounce">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">It's a Match!</h4>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-[240px] mx-auto">
                      Stripe's recruiter is interested in your profile. A chat channel has been unlocked!
                    </p>
                  </div>

                  {/* Bubble Mock Avatar */}
                  <div className="flex items-center justify-center -space-x-4 my-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-extrabold text-sm text-white shadow-lg">
                      YOU
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-900 bg-slate-950 flex items-center justify-center font-extrabold text-xs text-violet-400 border-white/10 shadow-lg">
                      STR
                    </div>
                  </div>

                  <div className="space-y-2 w-full">
                    <button 
                      onClick={resetDemo}
                      className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-xs transition-all border border-white/5 uppercase tracking-wider"
                    >
                      Reset Swipe Demo
                    </button>
                  </div>
                </motion.div>
              )}

              {demoState === 'disliked' && (
                <motion.div
                  key="dislike-screen"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col justify-between items-center text-center py-8"
                >
                  <div className="space-y-4">
                    <div className="inline-flex p-3 rounded-full bg-slate-950 border border-white/5 text-slate-500">
                      <Compass size={32} />
                    </div>
                    <h4 className="text-xl font-black text-white">Job Skipped</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto">
                      This job has been skipped. It will not show up in your deck again.
                    </p>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold text-xs transition-all uppercase tracking-wider"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Feature Grid Section */}
      <div className="max-w-7xl mx-auto px-6 mt-32">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Engineered for the Modern Tech Talent
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm font-medium">
            Skip long application forms. SwipeX matches you with jobs based on verified skills and connects you instantly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl hover:border-violet-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-violet-500 to-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-3">Tinder-Style Discovery</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Match with listings based on your exact profile. Swipe right to apply, left to discard. Completely frictionless flow.
            </p>
          </div>

          {/* Card 2 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl hover:border-fuchsia-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-fuchsia-500 to-pink-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-3">AI Skill Gap Analysis</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Find exactly which skills you lack for any specific job and get personalized, curated learning recommendations.
            </p>
          </div>

          {/* Card 3 */}
          <div className="relative group overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-8 backdrop-blur-xl hover:border-cyan-500/40 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform duration-300">
              <MessageSquare size={24} />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-3">Direct Recruiter Access</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              When a mutual match occurs, a real-time messaging pipeline opens immediately, bypass recruiter filters completely.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
