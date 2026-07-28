import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Briefcase, FileText, CheckCircle2, ChevronRight, 
  Star, Sparkles, ShieldCheck, Flame, Heart, X, MessageSquare, Award, Orbit, Cpu, Zap, ChevronDown, Check, Users, Terminal, Play, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [demoState, setDemoState] = useState('swipe');
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [faqOpen, setFaqOpen] = useState(null);
  const [demoTilt, setDemoTilt] = useState({ rx: 0, ry: 0 });

  // AI assistant preview mock states
  const [aiMessageIndex, setAiMessageIndex] = useState(0);
  const aiMessages = [
    { sender: 'assistant', text: "Analyzing your profile... I found a 98% match for 'Lead AI Platform Engineer' at NVIDIA." },
    { sender: 'user', text: "Wow, that's high! Does my resume highlight enough CUDA experience?" },
    { sender: 'assistant', text: "Yes! Your resume has 3 years of CUDA and PyTorch optimization work. Swiping right now..." },
    { sender: 'assistant', text: "Match confirmed! NVIDIA's recruiter just sent you a calendar link. Let's schedule the call." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setAiMessageIndex(prev => (prev + 1) % aiMessages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

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

  // 3D Card tilt calculation on hover
  const handleCardMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const rx = -(y / (rect.height / 2)) * 10;
    const ry = (x / (rect.width / 2)) * 10;
    setDemoTilt({ rx, ry });
  };

  const handleCardMouseLeave = () => {
    setDemoTilt({ rx: 0, ry: 0 });
  };

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
    { size: 'w-2.5 h-2.5', top: '10%', left: '5%', delay: 0 },
    { size: 'w-3.5 h-3.5', top: '18%', left: '85%', delay: 1 },
    { size: 'w-2 h-2', top: '75%', left: '8%', delay: 0.5 },
    { size: 'w-3 h-3', top: '65%', left: '90%', delay: 2 },
    { size: 'w-2 h-2', top: '45%', left: '3%', delay: 1.5 },
    { size: 'w-4 h-4', top: '85%', left: '45%', delay: 2.5 }
  ];

  return (
    <div className="relative min-h-screen pb-32 overflow-hidden selection:bg-violet-500/30 text-left">
      
      {/* Immersive Aurora Background Engine (Navy, Indigo, Purple, Cyan, Pink Theme) */}
      <div className="absolute inset-0 bg-[#070913] -z-30" />
      <motion.div 
        animate={{ 
          x: mousePos.x * -1.8, 
          y: mousePos.y * -1.8 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute top-[-10%] left-[-15%] w-[85vw] h-[85vh] bg-gradient-to-tr from-indigo-700/25 via-violet-600/20 to-transparent rounded-full blur-[150px] -z-10 pointer-events-none animate-pulse duration-[7000ms]"
      />
      <motion.div 
        animate={{ 
          x: mousePos.x * 2.2, 
          y: mousePos.y * 2.2 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute bottom-[-10%] right-[-15%] w-[80vw] h-[80vh] bg-gradient-to-br from-cyan-600/20 via-pink-650/15 to-transparent rounded-full blur-[150px] -z-10 pointer-events-none"
      />

      {/* Floating Interactive Glow Particles */}
      {particles.map((p, i) => (
        <motion.span
          key={i}
          animate={{
            y: [0, -25, 0],
            x: [0, 12, 0],
            opacity: [0.35, 0.8, 0.35]
          }}
          transition={{
            duration: 7 + i,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut'
          }}
          style={{ top: p.top, left: p.left }}
          className={`absolute ${p.size} rounded-full bg-gradient-to-tr from-violet-500 to-blue-450 blur-[2px] pointer-events-none -z-5`}
        />
      ))}

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:5rem_5rem] -z-20" />

      {/* Full-Screen Immersive Hero Area */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16 grid lg:grid-cols-12 gap-12 items-center min-h-[90vh] relative z-10">
        
        {/* Left Side: Massive Headline, Subtitle, and Buttons */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Glowing Pill Tag */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-slate-900/60 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-violet-300 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.15)] backdrop-blur-md"
          >
            <Sparkles size={11} className="text-violet-400 animate-spin mr-1 shrink-0" />
            <span>The Future of AI Job Discovery</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-6xl sm:text-7xl md:text-[5rem] font-black leading-[0.95] tracking-tight"
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-400 to-emerald-400">Discover Better Jobs.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400">Match Faster.</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-300 drop-shadow-[0_0_40px_rgba(245,158,11,0.2)]">Get Hired.</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-slate-350 text-base sm:text-lg max-w-xl leading-relaxed font-semibold"
          >
            Find jobs smarter with AI, swipe through personalized opportunities, match instantly with top companies, and build your career faster than ever.
          </motion.p>

          {/* Premium Call-to-Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/register"
              className="flex items-center space-x-2.5 px-9 py-5 bg-gradient-to-r from-violet-605 via-blue-605 to-violet-500 hover:from-violet-500 hover:to-blue-500 text-white font-black text-xs rounded-full transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.03] active:scale-95 group uppercase tracking-widest"
            >
              <span>🚀 Start Swiping</span>
              <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button
              onClick={() => setDemoState('swipe')}
              className="flex items-center space-x-2 px-9 py-5 border border-white/10 hover:border-white/20 bg-slate-950/60 hover:bg-slate-950/90 text-slate-300 hover:text-white font-black text-xs rounded-full transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest backdrop-blur-md cursor-pointer"
            >
              <Play size={14} className="fill-slate-300 text-slate-300 mr-1.5" />
              <span>▶ Watch Live Demo</span>
            </button>
          </motion.div>

          {/* Floating Company Logos section */}
          <div className="pt-6 space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Recruiting Teams Matches</p>
            <div className="flex flex-wrap items-center gap-6 opacity-35 hover:opacity-75 transition-opacity duration-300">
              {['Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix'].map((cName) => (
                <span key={cName} className="text-white font-black text-xs uppercase tracking-widest">{cName}</span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Side: Interactive 3D Swiper Card */}
        <div className="lg:col-span-5 flex justify-center items-center">
          <div 
            style={{ perspective: 1000 }}
            className="w-full max-w-sm"
          >
            <motion.div
              style={{
                transform: `rotateX(${demoTilt.rx}deg) rotateY(${demoTilt.ry}deg)`,
                transformStyle: 'preserve-3d'
              }}
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full relative p-[1px] rounded-[38px] bg-gradient-to-tr from-violet-500/30 to-blue-500/30 shadow-[0_0_60px_rgba(139,92,246,0.25)] select-none cursor-pointer"
            >
              <div className="w-full h-[470px] bg-slate-955/95 backdrop-blur-3xl rounded-[37px] p-8 flex flex-col justify-between overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-44 bg-gradient-to-b from-violet-600/15 to-transparent -z-10" />

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
                      <div className="text-left space-y-3.5">
                        <div className="flex justify-between items-start">
                          <span className="px-3 py-1 rounded bg-violet-600/10 border border-violet-500/20 text-violet-400 text-[9px] font-black uppercase tracking-widest">
                            Full-Time
                          </span>
                          <span className="px-3 py-1 rounded bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                            <Cpu size={10} className="animate-pulse" />
                            <span>98% Match</span>
                          </span>
                        </div>

                        <div>
                          <h3 className="text-2xl font-black text-white leading-tight">Lead AI Platform Engineer</h3>
                          <p className="text-violet-405 text-xs font-black mt-1">NVIDIA Corporation</p>
                        </div>

                        <div className="flex items-center space-x-2 text-slate-500 text-xxs font-extrabold uppercase tracking-wider">
                          <span className="text-white">$230,000 - $280,000</span>
                          <span>•</span>
                          <span>Santa Clara, CA (Hybrid)</span>
                        </div>

                        <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 font-semibold">
                          Orchestrate high-performance ML inference clusters. Optimize CUDA compiler configurations and GPU streaming grids for generative agent pipelines.
                        </p>
                      </div>

                      {/* Recruiter Action Badge */}
                      <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xxs text-slate-300 font-bold flex items-center gap-2 text-left">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                        </span>
                        <span>Recruiter from NVIDIA is online and looking...</span>
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
                          className="w-14 h-14 rounded-full bg-gradient-to-r from-violet-650 to-blue-650 hover:from-violet-500 hover:to-blue-550 flex items-center justify-center text-white shadow-xl shadow-blue-600/20 hover:scale-110 active:scale-95 transition-all cursor-pointer"
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
                        <div className="inline-flex p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-450 animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                          <Sparkles size={32} />
                        </div>
                        <h4 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-450 to-cyan-400 tracking-tight">It's a Match!</h4>
                        <p className="text-slate-400 text-xs leading-relaxed max-w-[280px] mx-auto font-semibold">
                          NVIDIA's tech recruitment squad approved your stack. Direct chat is unlocked!
                        </p>
                      </div>

                      <div className="flex items-center justify-center -space-x-3 my-4">
                        <div className="w-12 h-12 rounded-full border-2 border-slate-950 bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center font-black text-xs text-white shadow-lg">
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
                        <p className="text-slate-500 text-xs leading-relaxed max-w-[240px] mx-auto font-semibold">
                          Skip records committed successfully. Fetching next recommendation...
                        </p>
                      </div>

                      <button 
                        onClick={resetDemo}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-extrabold text-xs transition-all uppercase tracking-widest cursor-pointer"
                      >
                        Reswipe
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>

      </div>

      {/* AI Assistant Console Feed & Statistics Grid */}
      <div className="max-w-6xl mx-auto px-6 mt-16 grid md:grid-cols-2 gap-12 items-center relative z-10">
        
        {/* AI Assistant Console Feed */}
        <div className="p-[1.5px] rounded-3xl bg-gradient-to-tr from-blue-500/20 to-violet-500/20 shadow-2xl">
          <div className="bg-slate-950/90 rounded-[23px] p-6 space-y-6 backdrop-blur-3xl min-h-[360px] flex flex-col justify-between border border-white/5">
            
            {/* Console Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2">
                <Terminal size={14} className="text-violet-405" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">SwipeX AI Assistant</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[8px] text-slate-500 font-extrabold uppercase">Live Feed</span>
              </div>
            </div>

            {/* Message Window Area */}
            <div className="flex-grow space-y-4 flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={aiMessageIndex}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`flex ${aiMessages[aiMessageIndex].sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs leading-relaxed font-semibold ${
                    aiMessages[aiMessageIndex].sender === 'user'
                      ? 'bg-gradient-to-r from-violet-605 to-blue-605 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                  }`}>
                    {aiMessages[aiMessageIndex].text}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-3 bg-slate-905 border border-white/5 rounded-2xl text-[9px] text-slate-500 font-black uppercase tracking-widest text-center">
              Simulated AI profile scanner loop
            </div>
          </div>
        </div>

        {/* Statistics Deck */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { val: "12,000+", title: "Matches Made", color: "from-violet-400 to-blue-400" },
            { val: "200+", title: "Seeded Roles", color: "from-blue-400 to-violet-300" },
            { val: "98.2%", title: "AI Match Rate", color: "from-violet-405 to-blue-400" },
            { val: "15m", title: "Avg Match Time", color: "from-blue-400 to-violet-405" }
          ].map((st, i) => (
            <div key={i} className="p-6 rounded-3xl bg-slate-950/60 border border-white/5 hover:border-violet-500/25 transition-all backdrop-blur-xl relative">
              <span className={`text-2xl font-black text-white bg-clip-text bg-gradient-to-r ${st.color}`}>{st.val}</span>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">{st.title}</p>
            </div>
          ))}
        </div>

      </div>

      {/* Scrolling Logo Carousel section */}
      <div className="max-w-7xl mx-auto px-6 mt-36 relative z-10">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-550 text-center mb-8">Trusted by talent at world-class technology companies</p>
        <div className="w-full overflow-hidden relative py-4 bg-slate-950/20 border-y border-white/5">
          <div className="flex space-x-12 animate-scroll-left whitespace-nowrap">
            {[
              'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb',
              'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb',
              'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb',
              'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb'
            ].map((logo, i) => (
              <span key={i} className="text-xl font-black tracking-widest text-slate-550 hover:text-slate-300 transition-colors cursor-default select-none uppercase inline-block">
                {logo}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Features Deck Section */}
      <div className="max-w-6xl mx-auto px-6 mt-36 space-y-12">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Features Deck</h2>
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
              <div key={i} className="p-8 bg-slate-950/60 border border-white/5 rounded-3xl space-y-4 hover:border-violet-500/25 transition-all">
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

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-6 mt-36 space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-white tracking-tight uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">FAQ console</h2>
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
                      <p className="text-slate-405 text-xxs leading-relaxed pt-3 font-semibold border-t border-white/5 mt-3">
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
