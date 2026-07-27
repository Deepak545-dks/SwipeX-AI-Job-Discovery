import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Briefcase, FileText, CheckCircle2, ChevronRight, Star, Sparkles, ShieldCheck, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="relative overflow-hidden min-h-[90vh] pb-16">
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] bg-fuchsia-600/10 rounded-full blur-[140px] -z-10" />
      <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] -z-10" />

      {/* Grid Overlay Line styling */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20" />

      <div className="max-w-7xl mx-auto px-6 pt-16 lg:pt-24 grid lg:grid-cols-12 gap-12 items-center">
        {/* Left Hero Column */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-7 space-y-8"
        >
          <motion.div 
            variants={itemVariants} 
            className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-violet-400 text-xxs font-extrabold uppercase tracking-widest"
          >
            <Sparkles size={12} className="text-violet-400 animate-spin" />
            <span>Introducing SwipeX 2.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] tracking-tight">
            Swipe Right on Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400">
              Dream Career
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
            The next-generation career discovery engine. Find jobs and hire qualified talent using gesture swiping, AI-driven match metrics, automated cover letter generation, and real-time messaging.
          </motion.p>

          {/* Quick Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4 border-y border-white/5 py-6 max-w-lg">
            <div>
              <span className="text-xl sm:text-2xl font-black text-white block">98%</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Match Accuracy</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white block">12ms</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Swipe Latency</span>
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-black text-white block">45K+</span>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Active Candidates</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-600/20 hover:scale-[1.02] active:scale-95 group"
            >
              <span>Get Started Free</span>
              <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white font-bold text-xs rounded-xl transition-all hover:scale-[1.02] active:scale-95"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>

        {/* Right Feature Cards Column */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6"
        >
          {/* Card 1 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-105 transition-transform">
              <Compass size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Swipe-Based Jobs</h3>
            <p className="text-slate-400 text-xxs leading-relaxed">
              Match with jobs that fit your exact stack. Swipe right to apply, swipe left to skip. Zero friction.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-fuchsia-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-105 transition-transform">
              <FileText size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">AI Resume Analyzer</h3>
            <p className="text-slate-400 text-xxs leading-relaxed">
              Upload CV to fetch instantaneous ATS matching scores, missing technical tags, and optimization advice.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-violet-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-105 transition-transform">
              <Briefcase size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Recruiter Panel</h3>
            <p className="text-slate-400 text-xxs leading-relaxed">
              Post listings, audit applicants, filter candidate scores, and manage pipelines through simple card gestures.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card p-6 rounded-2xl border border-white/5 hover:border-fuchsia-500/30 transition-all hover:translate-y-[-4px] group">
            <div className="w-10 h-10 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-105 transition-transform">
              <Flame size={20} />
            </div>
            <h3 className="text-sm font-bold text-white mb-2">Instant Web Chat</h3>
            <p className="text-slate-400 text-xxs leading-relaxed">
              Connect directly with hiring managers when a match occurs. Set up video interviews, audio meetings, and more.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Trust & Badges footer strip */}
      <div className="max-w-7xl mx-auto px-6 mt-20 border-t border-white/5 pt-10 text-center">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Trusted by developers at leading companies</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-30 text-white font-extrabold text-sm tracking-widest">
          <span>GOOGLE</span>
          <span>NETFLIX</span>
          <span>STRIPE</span>
          <span>VERCEL</span>
          <span>META</span>
        </div>
      </div>
    </div>
  );
}
