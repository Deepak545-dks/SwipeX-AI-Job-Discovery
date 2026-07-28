import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Compass, Briefcase, FileText, CheckCircle2, ChevronRight, 
  Star, Sparkles, ShieldCheck, Flame, Heart, X, MessageSquare, Award, Orbit, Cpu, Zap, ChevronDown, Check, Users, Terminal, Play, Bell,
  User, CheckCircle, Database, Phone, Mail, Globe, ArrowRight, Shield, ZapOff, CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [demoState, setDemoState] = useState('swipe');
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [faqOpen, setFaqOpen] = useState(null);

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
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 30,
        y: (e.clientY - window.innerHeight / 2) / 30
      });
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

  return (
    <div className="relative min-h-screen overflow-hidden text-left bg-[#070913]">
      
      {/* 1. HERO SECTION (Theme: Purple + Blue) */}
      <section className="relative pt-32 pb-24 overflow-hidden border-b border-white/5 bg-gradient-to-b from-violet-950/20 via-[#070913] to-[#070913]">
        {/* Parallax glows */}
        <motion.div 
          animate={{ x: mousePos.x * -1.2, y: mousePos.y * -1.2 }}
          transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
          className="absolute top-[-10%] left-[-10%] w-[80vw] h-[80vh] bg-gradient-to-tr from-violet-600/15 via-blue-600/10 to-transparent rounded-full blur-[140px] pointer-events-none"
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:5rem_5rem] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Headline details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full bg-slate-900/60 border border-white/10 text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-violet-300 text-[10px] font-black uppercase tracking-widest shadow-md">
              <Sparkles size={11} className="text-violet-400 mr-1 animate-spin" />
              <span>Swipe Your Way to Your Dream Career</span>
            </div>

            <h1 className="text-6xl sm:text-7xl md:text-[5.2rem] font-black leading-[0.9] tracking-tight text-white">
              Discover Better Jobs.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 drop-shadow-[0_0_35px_rgba(139,92,246,0.2)]">
                Match Faster.
              </span>
            </h1>

            <p className="text-slate-350 text-base sm:text-lg max-w-xl leading-relaxed font-semibold">
              Find jobs smarter with AI, swipe through personalized opportunities, match instantly with top companies, and build your career faster than ever.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="flex items-center space-x-2.5 px-9 py-5 bg-gradient-to-r from-violet-600 via-blue-600 to-violet-500 hover:from-violet-500 hover:to-blue-500 text-white font-black text-xs rounded-full transition-all shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-[1.03] active:scale-95 group uppercase tracking-widest"
              >
                <span>🚀 Start Swiping</span>
                <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setDemoState('swipe')}
                className="flex items-center space-x-2 px-9 py-5 border border-white/10 hover:border-white/20 bg-slate-900/40 hover:bg-slate-900/80 text-slate-300 hover:text-white font-black text-xs rounded-full transition-all hover:scale-[1.03] active:scale-95 uppercase tracking-widest backdrop-blur-md cursor-pointer"
              >
                <Play size={14} className="fill-slate-300 text-slate-300 mr-1.5" />
                <span>▶ Watch Live Demo</span>
              </button>
            </div>
          </div>

          {/* 3D card deck side */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div style={{ perspective: 1000 }} className="w-full max-w-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full relative p-[1px] rounded-[38px] bg-gradient-to-tr from-violet-500/30 to-blue-500/30 shadow-[0_0_50px_rgba(139,92,246,0.25)] select-none"
              >
                <div className="w-full h-[450px] bg-slate-955/95 backdrop-blur-3xl rounded-[37px] p-8 flex flex-col justify-between overflow-hidden relative">
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
                        className="h-full flex flex-col justify-between text-left"
                      >
                        <div className="space-y-3">
                          <div className="flex justify-between items-start">
                            <span className="px-3 py-1 rounded bg-violet-600/10 border border-violet-500/20 text-violet-405 text-[9px] font-black uppercase tracking-widest">
                              Full-Time
                            </span>
                            <span className="px-3 py-1 rounded bg-blue-600/10 border border-blue-500/20 text-blue-400 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                              <Cpu size={10} className="animate-pulse" />
                              <span>98% Match</span>
                            </span>
                          </div>

                          <div>
                            <h3 className="text-xl font-black text-white leading-tight">Lead AI Platform Engineer</h3>
                            <p className="text-violet-400 text-xs font-black mt-0.5">NVIDIA Corporation</p>
                          </div>

                          <div className="flex items-center space-x-2 text-slate-500 text-xxs font-extrabold uppercase tracking-wider">
                            <span className="text-white">$230k - $280k</span>
                            <span>•</span>
                            <span>Santa Clara, CA</span>
                          </div>

                          <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 font-semibold">
                            Orchestrate high-performance ML inference clusters. Optimize CUDA compiler configurations and GPU streaming grids for generative agent pipelines.
                          </p>
                        </div>

                        {/* Recruiter Action Badge */}
                        <div className="p-3 bg-white/5 border border-white/10 rounded-2xl text-xxs text-slate-350 font-bold flex items-center gap-2">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                          </span>
                          <span>NVIDIA recruiter is looking...</span>
                        </div>

                        {/* Swiper controls */}
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
      </section>

      {/* 2. TRUSTED COMPANIES LOGOS (Theme: White Glass Cards & Scrolling loop) */}
      <section className="py-12 bg-gradient-to-r from-slate-900/40 via-slate-950/20 to-slate-900/40 border-y border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 text-center mb-8">Trusted by talent matching at world-class enterprise squads</p>
          <div className="w-full overflow-hidden relative">
            <div className="flex space-x-8 animate-scroll-left whitespace-nowrap">
              {[
                'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb',
                'Google', 'Microsoft', 'Apple', 'Amazon', 'Netflix', 'Figma', 'Stripe', 'Nvidia', 'Meta', 'Airbnb'
              ].map((logo, i) => (
                <div key={i} className="inline-block px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-all text-xs font-black tracking-widest text-slate-300 uppercase shadow-sm select-none cursor-default">
                  {logo}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. STATISTICS SECTION (Theme: Cyan + Blue Glow cards) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-blue-950/20 to-[#070913] border-b border-white/5">
        <div className="absolute top-[20%] left-[20%] w-[380px] h-[380px] bg-gradient-to-tr from-cyan-600/10 via-blue-600/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[9px] font-black text-cyan-400 uppercase tracking-widest">Platform Telemetry</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">SwipeX Match Metrics</h2>
            <p className="text-slate-400 text-xs max-w-lg mx-auto font-semibold">Real-time statistics updated across seeker networks and recruiting offices.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { val: "12,000+", label: "Verified Matches Made", desc: "Seekers connected directly to engineering recruiters", icon: Sparkles, color: "from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400" },
              { val: "98.2%", label: "AI Stack Fit Index", desc: "Automated candidate-job match success rate", icon: Cpu, color: "from-blue-500/20 to-indigo-500/10 border-blue-500/30 text-blue-400" },
              { val: "15 mins", label: "Average Call Scheduled", desc: "Average duration to unlock calendars from matches", icon: Clock, color: "from-violet-500/20 to-cyan-500/10 border-violet-500/30 text-violet-400" }
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div key={i} className={`p-[1.5px] rounded-3xl bg-gradient-to-b ${st.color.includes('cyan') ? 'from-cyan-500/20' : 'from-blue-500/20'} to-transparent shadow-xl transform hover:-translate-y-1.5 transition-all duration-300`}>
                  <div className="bg-[#0b0f1a]/95 backdrop-blur-2xl p-8 rounded-[23px] text-center space-y-4">
                    <div className={`w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center ${st.text}`}>
                      <Icon size={20} />
                    </div>
                    <div className="space-y-1">
                      <span className="text-4xl font-black text-white block">{st.val}</span>
                      <span className="text-xs font-black text-slate-300 block uppercase tracking-wider">{st.label}</span>
                    </div>
                    <p className="text-slate-455 text-xxs font-semibold leading-relaxed">{st.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. FEATURES SECTION (Theme: Purple + Pink Gradient cards) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-violet-950/20 to-[#070913] border-b border-white/5">
        <div className="absolute bottom-[10%] right-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-violet-605/10 via-pink-500/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-left space-y-3">
            <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest">Enterprise Core Capabilities</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">High-Performance Matching</h2>
            <p className="text-slate-400 text-xs font-semibold">Engineered to bypass traditional ATS bottlenecks completely.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Tinder-Style Swiper", desc: "Swipe right on matching roles. Skip long questionnaires and lock direct pipelines.", icon: Compass, grad: "from-violet-600/15 via-pink-600/10 to-transparent" },
              { title: "Smart Resume Analysis", desc: "Upload PDFs to compile real-time ATS match audits and identify keyword stack gaps.", icon: FileText, grad: "from-pink-600/15 via-violet-600/10 to-transparent" },
              { title: "WebRTC Conferences", desc: "Practice video calls or attend recruiter meetups directly inside matching channels.", icon: MessageSquare, grad: "from-violet-600/15 via-blue-600/10 to-transparent" }
            ].map((feat, i) => {
              const Icon = feat.icon;
              return (
                <div key={i} className="p-[1.2px] rounded-3xl bg-gradient-to-br from-white/10 hover:from-white/20 to-transparent shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className={`bg-gradient-to-b ${feat.grad} backdrop-blur-2xl p-8 rounded-[23px] h-full flex flex-col justify-between text-left relative overflow-hidden border border-white/5`}>
                    <div className="space-y-4">
                      <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-violet-400">
                        <Icon size={18} />
                      </div>
                      <h3 className="text-white font-black text-lg">{feat.title}</h3>
                      <p className="text-slate-400 text-xs leading-relaxed font-semibold">{feat.desc}</p>
                    </div>
                    <div className="pt-6 mt-6 border-t border-white/5">
                      <Link to="/register" className="text-xxs font-black text-violet-405 hover:underline uppercase tracking-wider flex items-center gap-1">
                        Learn More <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. WHY SWIPEX SECTION (Theme: Emerald + Cyan Grid) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-emerald-950/20 to-[#070913] border-b border-white/5">
        <div className="absolute top-[20%] right-[20%] w-[380px] h-[380px] bg-gradient-to-tr from-emerald-600/10 via-cyan-600/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Algorithmic Talent Sourcing</h2>
            <p className="text-slate-400 text-xs max-w-lg mx-auto font-semibold">We connect stack proficiencies directly to recruiter calendars, eliminating intermediate forms.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: "AI Matching", desc: "Automated analysis comparing job skills lists with candidate profiles.", icon: Sparkles },
              { title: "Smart Resume Analysis", desc: "Upload resumes in CV dashboard to verify ATS score metrics.", icon: FileText },
              { title: "Swipe Interface", desc: "Tinder deck swiper to skip filters and directly apply to teams.", icon: Compass },
              { title: "Instant Recruiter Connect", desc: "Chat matching rooms unlock immediately after mutual likes.", icon: Users },
              { title: "AI Cover Letters", desc: "Generates professional introduction statements matching role description requirements.", icon: Cpu },
              { title: "Career Analytics", desc: "Detailed seeker dashboard timelines summarizing match applications pipelines.", icon: Award }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-6 rounded-3xl bg-[#0b0f1a]/80 border border-white/10 hover:border-emerald-500/25 transition-all text-left space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-405">
                    <Icon size={16} />
                  </div>
                  <h4 className="text-white font-extrabold text-sm">{item.title}</h4>
                  <p className="text-slate-400 text-xxs leading-relaxed font-semibold">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS TIMELINE (Theme: Orange + Purple) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-orange-950/20 to-[#070913] border-b border-white/5">
        <div className="absolute bottom-[20%] left-[20%] w-[380px] h-[380px] bg-gradient-to-tr from-orange-650/10 via-violet-600/10 to-transparent rounded-full blur-[110px] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[9px] font-black text-orange-400 uppercase tracking-widest">How It Works</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Your Route to Landing Roles</h2>
            <p className="text-slate-405 text-xs max-w-sm mx-auto font-semibold">Deploy profiles, check match indexes, swiping cards, and match directly.</p>
          </div>

          <div className="relative border-l border-dashed border-white/10 pl-6 ml-2 space-y-12 text-left">
            {[
              { step: "Step 1", title: "Create Profile", desc: "Build your professional seeker account and list stack specializations.", icon: User },
              { step: "Step 2", title: "AI Analysis", desc: "Upload PDF resumes to run automated parser diagnostics.", icon: Cpu },
              { step: "Step 3", title: "Swipe Jobs", desc: "Explore matching roles. Swipe right to like, swipe left to pass.", icon: Compass },
              { step: "Step 4", title: "Get Matched", desc: "Recruiter mutual likes unlock instant chat threads.", icon: Sparkles },
              { step: "Step 5", title: "Get Hired", desc: "Schedule calls directly inside channel calendars.", icon: Award }
            ].map((node, i) => {
              const Icon = node.icon;
              return (
                <div key={i} className="relative space-y-1">
                  <span className="absolute -left-[33.5px] top-1 w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-violet-500 flex items-center justify-center ring-4 ring-[#070913] shadow-md text-white text-[9px] font-black">
                    {i+1}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-black text-orange-400 uppercase tracking-wider">{node.step}</span>
                    <Icon size={12} className="text-violet-400" />
                  </div>
                  <h4 className="text-white font-extrabold text-sm">{node.title}</h4>
                  <p className="text-slate-400 text-xxs font-semibold max-w-lg leading-relaxed">{node.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS (Theme: Pink + Blue cards) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-pink-950/20 to-[#070913] border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 space-y-16 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">Seeker Reviews</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">Matched and Deployed</h2>
            <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto">Success reports sent directly from engineering team members.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Jenkins", role: "Software Engineer", company: "Google", text: "SwipeX bypassed the resume black hole completely. Swiped right, matched with Google recruiter, scheduled interview directly.", grad: "from-pink-500/10 via-blue-500/10 to-[#0b0f1a]/80" },
              { name: "David Chen", role: "AI Tech Lead", company: "Microsoft", text: "Match score accuracy was extremely high. The built-in practice questions prepared me for the WebRTC panel session perfectly.", grad: "from-blue-500/10 via-pink-500/10 to-[#0b0f1a]/80" },
              { name: "Elena Rostova", role: "Product Designer", company: "Amazon", text: "Redesign dashboard layout is very modern. Direct messaging unlocked calendar synchronization immediately.", grad: "from-pink-500/10 via-violet-500/10 to-[#0b0f1a]/80" }
            ].map((user, i) => (
              <div key={i} className="p-[1px] rounded-3xl bg-gradient-to-br from-white/10 hover:from-white/20 to-transparent shadow-xl transition-all duration-300">
                <div className={`bg-gradient-to-b ${user.grad} backdrop-blur-2xl p-8 rounded-[23px] h-full flex flex-col justify-between text-left border border-white/5`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-1.5 text-amber-400">
                      {[...Array(5)].map((_, idx) => <Star key={idx} size={11} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-slate-350 text-xxs leading-relaxed italic font-semibold">"{user.text}"</p>
                  </div>
                  <div className="pt-6 border-t border-white/5 mt-6 flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center font-black text-xs text-pink-400 shadow-md">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-white font-black text-xs">{user.name}</h4>
                      <p className="text-[10px] text-slate-500 font-extrabold uppercase">{user.role} @ <span className="text-slate-300">{user.company}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ SECTION (Theme: Indigo + Purple Glass Cards) */}
      <section className="py-24 relative overflow-hidden bg-gradient-to-b from-[#070913] via-indigo-950/20 to-[#070913] border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center space-y-3">
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Support Portal</span>
            <h2 className="text-4xl font-black text-white tracking-tight uppercase">FAQ Center</h2>
            <p className="text-slate-400 text-xs font-semibold">Everything you need to know about SwipeX operations</p>
          </div>

          <div className="space-y-4">
            {[
              { q: "How does Swipe matching work?", a: "When you swipe right (like) on a job, it registers as an application. If the recruiter likes your profile back, a Match is immediately declared, unlocking chat messaging and video call rounds." },
              { q: "Is a resume file mandatory?", a: "Yes, you must upload at least one PDF resume in your Profile section before you can swipe right to apply for roles." },
              { q: "How is the Match score computed?", a: "Our AI match engine compares skills list keywords in your resume against job profile metadata, assigning a percentage score." }
            ].map((faq, i) => (
              <div key={i} className="p-[1.2px] rounded-2xl bg-gradient-to-tr from-white/5 to-transparent">
                <div className="bg-[#0b0f1a]/95 rounded-[15px] p-5">
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
      </section>

      {/* 9. PREMIUM MULTI-COLOR FOOTER */}
      <footer className="py-20 relative overflow-hidden bg-gradient-to-t from-violet-950/20 via-[#070913] to-[#070913]">
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid md:grid-cols-4 gap-12 border-t border-white/10 pt-16">
          <div className="space-y-4">
            <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-1.5">
              <Sparkles size={16} className="text-violet-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400">SwipeX Inc.</span>
            </h3>
            <p className="text-slate-450 text-xxs leading-relaxed font-semibold">Bypass intermediary forms. Elevate technical matches directly to recruiting channels.</p>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Seeker Channels</h4>
            <div className="flex flex-col space-y-2 text-xxs font-extrabold text-slate-350">
              <Link to="/swipe" className="hover:text-white transition-colors">Swipe Deck</Link>
              <Link to="/jobs" className="hover:text-white transition-colors">Search Jobs</Link>
              <Link to="/applications" className="hover:text-white transition-colors">Kanban Pipeline</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Connect</h4>
            <div className="flex flex-col space-y-2 text-xxs font-extrabold text-slate-350">
              <Link to="/profile" className="hover:text-white transition-colors">Candidate Profile</Link>
              <Link to="/messages" className="hover:text-white transition-colors">Match Channels</Link>
              <Link to="/calendar" className="hover:text-white transition-colors">Interview Calendar</Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Newsletter</h4>
            <p className="text-slate-450 text-xxs font-semibold">Stay updated with our latest AI recommendations.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address..."
                className="w-full bg-[#070913] border border-white/10 rounded-xl px-3 py-2 text-xxs text-white focus:border-violet-500/50 outline-none font-semibold"
              />
              <button 
                onClick={() => showToast('Subscribed successfully!', 'success')}
                className="px-4 py-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-black text-xxs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/5 text-center text-slate-600 text-xxs font-bold">
          &copy; {new Date().getFullYear()} SwipeX Corporation. All rights reserved. Bypassing ATS blocks globally.
        </div>
      </footer>

    </div>
  );
}
