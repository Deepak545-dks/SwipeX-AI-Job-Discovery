import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Briefcase, FileText, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } }
  };

  return (
    <div className="relative overflow-hidden min-h-[90vh]">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-3xl -z-10" />

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 px-3 py-1 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-xs font-semibold uppercase tracking-wider">
            <span>✨ Introducing SwipeX 1.0</span>
          </motion.div>

          <motion.h1 variants={itemVariants} className="text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
            Swipe Right on Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-500">
              Future Career
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-slate-400 text-base lg:text-lg max-w-xl leading-relaxed">
            The next-generation career discovery engine. Connect recruiters and job seekers using smart swipe mechanics, AI-driven matches, resume insights, and real-time alerts.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 pt-2">
            <Link
              to="/register"
              className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-violet-500/20 group"
            >
              <span>Get Started</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 border border-slate-800 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-sm rounded-xl transition-all"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid sm:grid-cols-2 gap-6"
        >
          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Swipe-Based Jobs</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Match with jobs that fit your profile. Swipe right to apply, swipe left to skip. Speed up recruitment.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">AI Resume Analyzer</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload your resume and instantly retrieve ATS matching score, skill gaps, and custom optimization advice.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-110 transition-transform">
              <Briefcase size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Recruiter Dashboard</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Post roles, trace applicants, filter candidates, and accept or reject with seamless pipeline controls.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md hover:border-violet-500/50 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-fuchsia-600/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 mb-4 group-hover:scale-110 transition-transform">
              <CheckCircle2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Smart Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Engineered using sentence transformers and vector similarity. Fits candidates precisely.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
