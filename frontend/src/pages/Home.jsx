import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Briefcase, FileText, CheckCircle2, ChevronRight, 
  Star, Sparkles, ShieldCheck, Flame, Heart, X, MessageSquare, Award, Orbit, Cpu, Zap, ChevronDown, Check, Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [demoState, setDemoState] = useState('swipe');
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [faqOpen, setFaqOpen] = useState(null);

  // Mouse Parallax coordinates tracker
  useEffect(() => {
    const handleMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 35;
      const y = (e.clientY - window.innerHeight / 2) / 35;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

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

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  // Render floating particle trails
  const particles = [
    { size: 'w-2.5 h-2.5', top: '12%', left: '8%', delay: 0 },
    { size: 'w-3 h-3', top: '22%', left: '82%', delay: 1.5 },
    { size: 'w-2 h-2', top: '72%', left: '12%', delay: 0.5 },
    { size: 'w-3.5 h-3.5', top: '62%', left: '88%', delay: 2 },
    { size: 'w-2 h-2', top: '42%', left: '4%', delay: 1 },
    { size: 'w-4 h-4', top: '82%', left: '48%', delay: 2.5 }
  ];

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden pt-16 selection:bg-fuchsia-500/30">
      
      {/* Dynamic Parallax Glow Spotlight */}
      <motion.div 
        animate={{ 
          x: mousePos.x * -1.2, 
          y: mousePos.y * -1.2 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute top-[6%] left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-violet-600/15 via-fuchsia-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none"
      />
      <motion.div 
        animate={{ 
          x: mousePos.x * 1.4, 
          y: mousePos.y * 1.4 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute bottom-[25%] right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-cyan-600/15 via-emerald-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none"
      />

      {/* Floating Interactive Glow Particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -20, 0],
            x: [0, 10, 0],
            opacity: [0.35, 0.75, 0.35]
          }}
          transition={{
            duration: 6 + i,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }}
          style={{ top: p.top, left: p.left }}
          className={`absolute ${p.size} rounded-full bg-gradient-to-tr from-violet-400 via-pink-400 to-cyan-400 blur-[1px] pointer-events-none -z-5`}
        />
      ))}

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] -z-20" />

      {/* Hero Header */}
      <div className="max-w-6xl mx-auto px-6 text-center space-y-10 relative z-10">
        
        {/* Animated Pill Logo Tag */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-slate-950/80 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 via-pink-400 to-cyan-400 text-xs font-black uppercase tracking-widest shadow-[0_0_30px_rgba(139,92,246,0.15)] backdrop-blur-md hover:border-white/20 transition-all duration-300"
        >
          <Zap size={13} className="text-violet-400 animate-bounce mr-1 shrink-0" />
          <span>Intelligent Swipe Matching Ecosystem</span>
        </motion.div>

        {/* Brand Mission Title */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-7xl md:text-9xl font-black text-white leading-[0.95] tracking-tight max-w-5xl mx-auto"
        >
          Swipe Right,{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-450 via-pink-400 via-cyan-400 to-emerald-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.15)]">
            Hire Instantly.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-405 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-semibold"
        >
          No cover letters. No ghosting. SwipeX aligns enterprise-ready engineering talent straight to recruiters' calendars using algorithmic matching.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4.5 pt-4"
        >
          <Link
            to="/register"
            className="flex items-center space-x-2.5 px-9 py-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-400 text-white font-black text-xs rounded-full transition-all shadow-[0_0_35px_rgba(139,92,246,0.3)] hover:scale-[1.03] active:scale-95 group uppercase tracking-widest"
          >
            <span>Launch Discovery</span>
            <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-9 py-5 border border-white/10 hover:border-white/20 bg-slate-950/60 hover:bg-slate-950/95 text-slate-350 hover:text-white font-black text-xs rounded-full transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest backdrop-blur-md"
          >
            Enter Dashboard
          </Link>
        </motion.div>
      </div>

      {/* Interactive Tinder Demo Widget */}
      <div className="mt-24 max-w-xl mx-auto px-6 relative z-10">
        
        {/* Decorative orbits */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] rounded-full border border-dashed border-white/5 pointer-events-none -z-10 animate-spin duration-[60000ms]" />

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full relative p-[1px] rounded-[38px] overflow-hidden bg-gradient-to-tr from-violet-500/30 via-fuchsia-500/30 to-cyan-500/35 shadow-[0_0_60px_rgba(139,92,246,0.25)]"
        >
          <div className="w-full h-[470px] bg-slate-955/95 backdrop-blur-3xl rounded-[37px] p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

            <AnimatePresence mode="wait">
              {demoState === 'swipe' && (
                <motion.div
                  key="demo-deck"
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: 1, 
                    x: swipeDirection === 'right' ? 320 : swipeDirection === 'left' ? -320 : 0,
                    rotate: swipeDirection === 'right' ? 14 : swipeDirection === 'left' ? -14 : 0
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="h-full flex flex-col justify-between"
                >
                  <div className="text-left">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 rounded bg-violet-605/10 border border-violet-500/20 text-violet-400 text-[10px] font-black uppercase tracking-widest">
                        Full-Time
                      </span>
                      <span className="px-3 py-1 rounded bg-cyan-600/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <Cpu size={10} className="animate-pulse" />
                        <span>98% AI MATCH</span>
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white leading-tight">Lead AI Platform Engineer</h3>
                    <p className="text-violet-400 text-xs font-black mt-1">NVIDIA Inc.</p>

                    <div className="flex items-center space-x-2 text-slate-500 text-xxs mt-3 font-extrabold uppercase tracking-wider">
                      <span className="text-white">$230,000 - $280,000</span>
                      <span>•</span>
                      <span>Santa Clara, CA (Hybrid)</span>
                    </div>

                    <p className="text-slate-405 text-xs leading-relaxed mt-4 line-clamp-3 font-semibold">
                      Orchestrate high-performance ML inference clusters. Optimize CUDA compiler configurations and GPU streaming grids for generative agent pipelines.
                    </p>
                  </div>

                  <div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['CUDA', 'PyTorch', 'System Design', 'C++'].map(skill => (
                        <span key={skill} className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-[10px] font-extrabold text-slate-300">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Mock Swiping Controller Bar */}
                  <div className="flex justify-center items-center space-x-6 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleDemoAction('dislike')}
                      className="w-12 h-12 rounded-full bg-slate-900 border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-md hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                    <button 
                      onClick={() => handleDemoAction('like')}
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-550 flex items-center justify-center text-white shadow-xl shadow-indigo-650/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    >
                      <Heart size={22} className="fill-white animate-pulse" />
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
                    <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      <Sparkles size={32} />
                    </div>
                    <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 tracking-tight">It's a Match!</h4>
                    <p className="text-slate-450 text-xs leading-relaxed max-w-[280px] mx-auto font-bold">
                      NVIDIA's tech recruitment squad approved your stack. Direct chat is unlocked!
                    </p>
                  </div>

                  <div className="flex items-center justify-center -space-x-3 my-4">
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
                      YOU
                    </div>
                    <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-slate-900 flex items-center justify-center font-black text-[9px] text-violet-400 border-white/10 shadow-lg">
                      NVDA
                    </div>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="w-full py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-350 font-extrabold text-xs transition-all border border-white/10 uppercase tracking-widest cursor-pointer"
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
                    <div className="inline-flex p-4 rounded-full bg-slate-900 border border-white/10 text-slate-500">
                      <Compass size={32} />
                    </div>
                    <h4 className="text-xl font-black text-white">Listing Passed</h4>
                    <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto font-bold">
                      Skip records committed successfully. Fetching next recommendation...
                    </p>
                  </div>

                  <button 
                    onClick={resetDemo}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-650 text-white font-extrabold text-xs transition-all uppercase tracking-widest cursor-pointer"
                  >
                    Reswipe
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-6xl mx-auto px-6 mt-36 grid sm:grid-cols-3 gap-8 text-left">
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-white/5 hover:border-violet-500/20 transition-all backdrop-blur-xl relative">
          <div className="text-3xl font-black text-white bg-clip-text bg-gradient-to-r from-violet-450 to-fuchsia-450">12,000+</div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-2">Verified Matches Made</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-white/5 hover:border-cyan-500/20 transition-all backdrop-blur-xl relative">
          <div className="text-3xl font-black text-white bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">200+</div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-2">Seeded Tech Roles</p>
        </div>
        <div className="p-8 rounded-3xl bg-slate-950/60 border border-white/5 hover:border-pink-500/20 transition-all backdrop-blur-xl relative">
          <div className="text-3xl font-black text-white bg-clip-text bg-gradient-to-r from-pink-405 to-orange-400">98.2%</div>
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-2">AI Match Rate</p>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 mt-36 text-left space-y-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">Features Deck</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Engineered to skip the traditional ATS queues entirely.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { title: "Tinder-Style Swiper", desc: "Swipe right on matching roles. Skip long applications and connect directly to engineering recruiters.", icon: Compass },
            { title: "AI Cover Letters", desc: "Generate tailored cover letters automatically computed using matching profiles and role requirements.", icon: Sparkles },
            { title: "WebRTC Video Calls", desc: "Unlock immediate scheduled calls directly in the app. No external Zoom codes needed.", icon: MessageSquare }
          ].map((feat, i) => {
            const Icon = feat.icon;
            return (
              <div key={i} className="p-8 bg-slate-950/60 border border-white/5 rounded-3xl space-y-4 hover:border-violet-500/20 transition-all">
                <div className="w-10 h-10 rounded-xl bg-violet-605/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                  <Icon size={16} />
                </div>
                <h3 className="text-white font-extrabold text-sm">{feat.title}</h3>
                <p className="text-slate-405 text-xxs leading-relaxed font-semibold">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Testimonials Section */}
      <div className="max-w-6xl mx-auto px-6 mt-36 text-left space-y-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">Matched Engineers</h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Real feedback from job seekers who matches instantly.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            { quote: "SwipeX bypassed the resume black hole. Swiped right on Nvidia, got matched, and scheduled my technical call within 15 minutes.", author: "Alex R., AI Architect", role: "Matched at NVIDIA" },
            { quote: "Drafting custom cover notes for every job used to take hours. The automated match analyzer handled all details cleanly.", author: "Sarah M., Backend Dev", role: "Matched at Stripe" }
          ].map((test, i) => (
            <div key={i} className="p-8 bg-slate-950/60 border border-white/5 rounded-3xl space-y-4 hover:border-cyan-500/20 transition-all relative">
              <span className="absolute top-6 right-6 text-fuchsia-400 font-black text-[9px] uppercase tracking-widest">Matched</span>
              <p className="text-slate-350 text-xs leading-relaxed italic font-semibold">"{test.quote}"</p>
              <div>
                <h4 className="text-white font-extrabold text-xxs">{test.author}</h4>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest font-black mt-1">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accordion FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 mt-36 text-left space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400">FAQ console</h2>
          <p className="text-slate-400 text-xs font-semibold">Quick guides to query operations</p>
        </div>
        
        <div className="space-y-4">
          {[
            { q: "How does Swipe matching work?", a: "When you swipe right (like) on a job, it registers as an application. If the recruiter likes your profile back, a Match is immediately declared, unlocking chat messaging and video call rounds." },
            { q: "Is a resume file mandatory?", a: "Yes, you must upload at least one PDF resume in your Profile section before you can swipe right to apply for roles." },
            { q: "How is the Match score computed?", a: "Our AI match engine compares skills list keywords in your resume against job profile metadata, assigning a percentage score." }
          ].map((faq, i) => (
            <div key={i} className="p-1 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent">
              <div className="bg-slate-950/90 rounded-[15px] p-5">
                <button
                  type="button"
                  onClick={() => toggleFaq(i)}
                  className="w-full flex items-center justify-between text-left text-xs font-black text-white uppercase tracking-wider cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown size={14} className={`text-slate-450 transition-transform ${faqOpen === i ? 'rotate-180 text-violet-400' : ''}`} />
                </button>
                <AnimatePresence>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-400 text-xxs leading-relaxed pt-3 font-semibold border-t border-white/5 mt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
