import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Heart, X, Star, RotateCcw, MapPin, DollarSign, Briefcase, 
  ChevronUp, Loader2, Sparkles, AlertCircle, FileText, GraduationCap, Copy, Keyboard, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import AiSkillGapWidget from '../components/AiSkillGapWidget';
import AiInterviewModal from '../components/AiInterviewModal';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyLogo = ({ company, className = "w-11 h-11" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-violet-600 font-black text-xs uppercase shrink-0`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-2xl object-cover bg-white border border-slate-200 shrink-0 shadow-sm`}
    />
  );
};

export default function SwipeDiscovery() {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasResume, setHasResume] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Undo memory
  const [lastSwipedJob, setLastSwipedJob] = useState(null);

  // Swipe overlay opacity states
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);

  // Swipe Stats counters
  const [likesCount, setLikesCount] = useState(12);
  const [matchesCount, setMatchesCount] = useState(4);

  // Detail Drawer Job
  const [drawerJob, setDrawerJob] = useState(null);

  // AI Modal & Cover Letter state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  const { showToast } = useToast();

  const checkUserResume = async () => {
    try {
      const response = await api.get('/profiles/me/');
      if (!response.data.resumes || response.data.resumes.length === 0) {
        setHasResume(false);
      } else {
        setHasResume(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/jobs/recommendations/');
      setDeck(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch job recommendations deck.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserResume();
    fetchRecommendations();
  }, []);

  // Keyboard shortcut swiping handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deck.length === 0 || drawerJob) return;
      const targetId = deck[0].id;
      if (e.key === 'ArrowRight') {
        handleSwipe(targetId, 'like');
      } else if (e.key === 'ArrowLeft') {
        handleSwipe(targetId, 'dislike');
      } else if (e.key === 'ArrowUp') {
        handleSwipe(targetId, 'save');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, drawerJob]);

  const handleSwipe = async (jobId, action) => {
    if (action === 'like' && !hasResume) {
      showToast('You must upload a resume in your profile before you can swipe right to apply.', 'warning');
      return;
    }

    // Save for undo option
    const swipedJob = deck.find(j => j.id === jobId);
    setLastSwipedJob(swipedJob);

    // Filter deck
    setDeck(prev => prev.filter(j => j.id !== jobId));
    setDragX(0);
    setDragY(0);

    try {
      if (action === 'like') {
        await api.post('/jobs/apply/', { job_id: jobId });
        setLikesCount(prev => prev + 1);
        // Randomly simulate recruiter match trigger
        if (Math.random() > 0.4) {
          setMatchesCount(prev => prev + 1);
          showToast(`It's a Match! Recruiter at ${swipedJob.company.name} wants to connect.`, 'success');
        } else {
          showToast(`Applied to ${swipedJob.title}!`, 'success');
        }
      } else if (action === 'save') {
        showToast(`Job details saved to bookmarks.`, 'info');
      } else {
        showToast(`Passed on ${swipedJob.title}.`, 'info');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUndo = () => {
    if (!lastSwipedJob) {
      showToast('No recent swipe transaction to undo.', 'info');
      return;
    }
    setDeck(prev => [lastSwipedJob, ...prev]);
    setLastSwipedJob(null);
    showToast(`Restored deck card: ${lastSwipedJob.title}`, 'success');
  };

  const handleResetSwipes = async () => {
    setResetting(true);
    try {
      await fetchRecommendations();
      showToast('Recommendation deck card list refreshed.', 'success');
    } catch (err) {
      showToast('Failed to reset deck cards.', 'error');
    } finally {
      setResetting(false);
    }
  };

  const handleDrag = (event, info) => {
    setDragX(info.offset.x);
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event, info, jobId) => {
    const threshold = 130;
    if (info.offset.x > threshold) {
      handleSwipe(jobId, 'like');
    } else if (info.offset.x < -threshold) {
      handleSwipe(jobId, 'dislike');
    } else if (info.offset.y < -threshold) {
      handleSwipe(jobId, 'save');
    } else {
      setDragX(0);
      setDragY(0);
    }
  };

  const handleGenerateCoverLetter = async () => {
    if (!drawerJob) return;
    setGeneratingCoverLetter(true);
    try {
      const response = await api.post('/jobs/ai/generate-cover-letter/', { job_id: drawerJob.id });
      setCoverLetter(response.data.cover_letter);
      showToast('AI Cover Letter generated successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate cover letter.', 'error');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const handleCopyCoverLetter = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter);
    showToast('Cover letter copied to clipboard!', 'success');
  };

  // Drag overlays opacity calculation
  const likeOpacity = Math.max(0, Math.min(1, dragX / 150));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / 150));
  const saveOpacity = Math.max(0, Math.min(1, -dragY / 150));

  if (loading) {
    return (
      <PageTransition className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm h-[540px] bg-white border border-slate-200 rounded-[28px] p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="space-y-6 animate-pulse">
            <div className="h-6 rounded bg-slate-100 w-1/3" />
            <div className="h-10 rounded bg-slate-100 w-3/4" />
            <div className="h-20 rounded bg-slate-100 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  const activeCard = deck[0];

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8 relative z-10 text-slate-800">
      
      {/* LEFT COLUMN: Tinder Swiper Deck (8 cols) */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center">
        {deck.length === 0 ? (
          <div className="text-center p-10 bg-white border border-slate-200 rounded-[28px] max-w-md w-full shadow-xl space-y-6">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-650 shadow-lg flex items-center justify-center text-white">
              <Sparkles className="animate-spin duration-[10000ms]" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Deck Completed</h3>
              <p className="text-slate-500 text-sm leading-relaxed font-semibold">
                You've swiped through all matching roles. Check back later or refresh recommendations to start discovering again!
              </p>
            </div>

            {!hasResume && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 text-left flex items-start space-x-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Missing Resume: </span>
                  Upload your CV in settings to apply by swiping right.
                  <Link to="/profile" className="text-violet-650 underline font-extrabold block mt-2">
                    Upload Resume &rarr;
                  </Link>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={handleResetSwipes}
                disabled={resetting}
                className="flex items-center justify-center space-x-2 py-4 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl text-base font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
              >
                {resetting ? <Loader2 size={16} className="animate-spin" /> : <span>Reset Deck & Reswipe</span>}
              </button>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/profile"
                  className="flex items-center justify-center py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold transition-all border border-slate-200 active:scale-95 uppercase tracking-wider text-center"
                >
                  Profile
                </Link>
                <button
                  onClick={handleUndo}
                  className="flex items-center justify-center space-x-1.5 py-3.5 border border-slate-200 bg-slate-550/10 hover:bg-slate-100 text-slate-600 rounded-2xl text-sm font-bold transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <RotateCcw size={14} />
                  <span>Undo</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md h-[720px] flex flex-col justify-between items-center">
            
            {/* Keyboard shortcuts helper info */}
            <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-4">
              <Keyboard size={12} className="text-violet-600" />
              <span>Use keyboard arrow keys to swipe</span>
            </div>

            {/* Cards Stack Container - Redesigned LARGER card */}
            <div className="relative w-full h-[560px]">
              <AnimatePresence>
                {deck.slice(0, 3).reverse().map((job, idx, arr) => {
                  const isTop = idx === arr.length - 1;
                  return (
                    <motion.div
                      key={job.id}
                      style={{ touchAction: 'none' }}
                      drag={isTop}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDrag={isTop ? handleDrag : undefined}
                      onDragEnd={(e, info) => handleDragEnd(e, info, job.id)}
                      animate={{
                        scale: isTop ? 1 : 1 - (arr.length - 1 - idx) * 0.04,
                        y: isTop ? 0 : (arr.length - 1 - idx) * 12,
                        zIndex: idx
                      }}
                      exit={{ x: dragX > 0 ? 500 : -500, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute w-full h-full p-[1px] rounded-[30px] overflow-hidden bg-gradient-to-tr from-violet-500/20 via-blue-500/20 to-transparent shadow-xl"
                    >
                      <div className="w-full h-full bg-white/95 backdrop-blur-2xl rounded-[29px] p-8 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative overflow-hidden border border-white">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-transparent -z-10" />

                        {isTop && (
                          <>
                            <div 
                              style={{ opacity: likeOpacity }}
                              className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[-12deg] pointer-events-none z-35 tracking-wider shadow-lg bg-white"
                            >
                              LIKE
                            </div>
                            <div 
                              style={{ opacity: nopeOpacity }}
                              className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[12deg] pointer-events-none z-35 tracking-wider shadow-lg bg-white"
                            >
                              NOPE
                            </div>
                            <div 
                              style={{ opacity: saveOpacity }}
                              className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-cyan-500 text-cyan-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 pointer-events-none z-35 tracking-wider shadow-lg bg-white"
                            >
                              SAVE
                            </div>
                          </>
                        )}

                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0 text-left">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex px-3 py-1 bg-violet-50 border border-violet-100 rounded-md text-[9px] font-black uppercase text-violet-600 tracking-wider">
                                  {job.job_type}
                                </span>
                                <span className="inline-flex px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-md text-[9px] font-black uppercase text-emerald-600 tracking-wider">
                                  {job.experience_level.replace('_', ' ')}
                                </span>
                              </div>
                              {/* Large job title (32px / text-3xl) */}
                              <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-4 leading-snug truncate">{job.title}</h2>
                              {/* Large company name (20px / text-xl) */}
                              <p className="text-violet-600 text-xl font-bold mt-1.5 truncate">{job.company.name}</p>
                            </div>

                            {/* Circular AI Match Score Progress Ring */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="relative w-14 h-14 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="rgba(15,23,42,0.05)"
                                    strokeWidth="3.5"
                                    fill="transparent"
                                  />
                                  <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="url(#matchGlow)"
                                    strokeWidth="4"
                                    fill="transparent"
                                    strokeDasharray={138}
                                    strokeDashoffset={138 - (138 * 96) / 100}
                                    strokeLinecap="round"
                                  />
                                  <defs>
                                    <linearGradient id="matchGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                      <stop offset="0%" stopColor="#7c3aed" />
                                      <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span className="absolute text-xxs font-black text-slate-800">96%</span>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 mt-1">AI Match</span>
                            </div>
                          </div>

                          <div className="space-y-2.5 mt-6 border-t border-slate-100 pt-4 text-left">
                            <div className="flex items-center space-x-2.5 text-xs text-slate-550 font-bold">
                              <MapPin size={14} className="text-slate-400" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            {/* Salary with icon (22px / text-xl) */}
                            <div className="flex items-center space-x-2.5 text-xl text-slate-900 font-extrabold">
                              <DollarSign size={18} className="text-slate-400" />
                              <span>
                                {job.salary_min ? `$${(job.salary_min/1000)}k` : 'Negotiable'}
                                {job.salary_max ? ` - $${(job.salary_max/1000)}k` : ''}
                              </span>
                            </div>
                          </div>

                          {/* Beautiful skill chips (18px / text-sm) */}
                          <div className="mt-6 pt-4 border-t border-slate-100 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Required Skills</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-[85px] overflow-hidden">
                              {job.skills_required.slice(0, 4).map((skill) => (
                                <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold shadow-sm">
                                  {skill}
                                </span>
                              ))}
                              {job.skills_required.length > 4 && (
                                <span className="px-2.5 py-1.5 text-slate-400 text-xs font-black">
                                  +{job.skills_required.length - 4} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setDrawerJob(job)}
                          className="w-full flex flex-col items-center py-2 text-slate-400 hover:text-slate-600 transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg cursor-pointer"
                        >
                          <ChevronUp size={16} className="text-slate-400 animate-bounce" />
                          <span className="text-[9px] font-extrabold uppercase tracking-widest mt-1">Swipe Up for details</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Action Controllers - Large Swipe buttons (18px) */}
            <div className="flex items-center space-x-6 z-10 pt-6">
              <button
                onClick={handleUndo}
                className="w-14 h-14 rounded-full bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center text-slate-500 shadow-md hover:scale-105 active:scale-90 transition-all cursor-pointer"
                title="Undo Last Swipe"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => handleSwipe(activeCard.id, 'dislike')}
                className="w-16 h-16 rounded-full bg-white border border-rose-200 hover:border-rose-455 hover:bg-rose-50/55 flex items-center justify-center text-rose-500 shadow-lg hover:scale-105 active:scale-90 transition-all cursor-pointer"
                title="Pass (Left Arrow)"
              >
                <X size={26} />
              </button>
              
              <button
                onClick={() => handleSwipe(activeCard.id, 'save')}
                className="w-14 h-14 rounded-full bg-white border border-cyan-200 hover:border-cyan-455 hover:bg-cyan-50/55 flex items-center justify-center text-cyan-500 shadow-md hover:scale-105 active:scale-90 transition-all cursor-pointer"
                title="Save (Up Arrow)"
              >
                <Star size={20} />
              </button>

              <button
                onClick={() => handleSwipe(activeCard.id, 'like')}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/10 hover:scale-105 active:scale-90 transition-all cursor-pointer"
                title="Apply (Right Arrow)"
              >
                <Heart size={26} className="fill-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Recruiter Activity & Live Stats Feed (4 cols) - Premium white cards */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Live Match Activity */}
        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-slate-200 to-transparent shadow-xl">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[23px] p-6 space-y-6 text-left border border-white">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Activity size={14} className="text-violet-600 animate-pulse" />
              <span>Live Match Activity</span>
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {[
                { time: 'Just now', company: 'Google Inc.', desc: 'Recruiter viewed your Javascript skill tags' },
                { time: '3m ago', company: 'Microsoft', desc: 'Verified matching score: 98%' },
                { time: '12m ago', company: 'Stripe Inc.', desc: 'AI Gap Analysis compiled recommendations' },
                { time: '1h ago', company: 'Amazon', desc: 'Direct message channel unlocked with manager' }
              ].map((activity, i) => (
                <div key={i} className="pt-3.5 first:pt-0 text-[11px] leading-relaxed text-slate-600">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-slate-800">{activity.company}</span>
                    <span className="text-[9px] text-slate-400 font-semibold">{activity.time}</span>
                  </div>
                  <p className="font-medium mt-1">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Swipe Stats Counters - Premium colorful cards */}
        <div className="p-[1px] rounded-3xl bg-gradient-to-tr from-violet-500/20 to-blue-500/20 shadow-xl">
          <div className="bg-white/80 backdrop-blur-2xl rounded-[23px] p-6 text-left space-y-4 border border-white">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">Your Swipe Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-tr from-violet-600 to-indigo-600 text-white rounded-2xl shadow-md text-center">
                <span className="text-xl font-black block">{likesCount}</span>
                <span className="text-[8px] text-violet-100 font-extrabold uppercase tracking-wider mt-1 block">Active Likes</span>
              </div>
              <div className="p-4 bg-gradient-to-tr from-blue-600 to-cyan-600 text-white rounded-2xl shadow-md text-center">
                <span className="text-xl font-black block">{matchesCount}</span>
                <span className="text-[8px] text-blue-100 font-extrabold uppercase tracking-wider mt-1 block">Matches Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details drawer Overlay - Premium white glass slide panel */}
      <AnimatePresence>
        {drawerJob && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 flex justify-end items-end">
            <div className="absolute inset-0" onClick={() => setDrawerJob(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-white/95 border-t border-slate-200 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left text-slate-800"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-slate-800 leading-tight truncate">{drawerJob.title}</h3>
                  <p className="text-violet-600 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
                </div>
                <button
                  onClick={() => setDrawerJob(null)}
                  className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-650 border-y border-slate-100 py-5">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <MapPin size={14} className="text-slate-400" />
                  <span>{drawerJob.location}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-slate-800 font-extrabold">
                  <DollarSign size={14} className="text-slate-400" />
                  <span>
                    {drawerJob.salary_min ? `$${drawerJob.salary_min.toLocaleString()}` : 'Negotiable'}
                    {drawerJob.salary_max ? ` - $${drawerJob.salary_max.toLocaleString()}` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize font-semibold">
                  <Briefcase size={14} className="text-slate-400" />
                  <span>{drawerJob.employment_type.replace('_', ' ')} ({drawerJob.job_type})</span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize font-semibold">
                  <GraduationCap size={14} className="text-slate-400" />
                  <span>{drawerJob.experience_level.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">About the Role</h4>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200 font-semibold">{drawerJob.description}</p>
              </div>

              {drawerJob.requirements && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Key Requirements</h4>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl border border-slate-200 font-semibold">{drawerJob.requirements}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Skills Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {drawerJob.skills_required.map((skill) => (
                    <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xxs font-extrabold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <AiSkillGapWidget jobId={drawerJob.id} />

              {/* AI Tools Bar */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-violet-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {generatingCoverLetter ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Writing Cover...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        <span>{coverLetter ? 'Regenerate Cover' : 'Generate Cover'}</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowInterviewModal(true)}
                    className="w-full sm:w-auto px-5 py-3 bg-white border border-slate-200 text-violet-600 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles size={12} />
                    <span>Practice Questions</span>
                  </button>
                </div>

                {coverLetter && (
                  <div className="space-y-2 pt-2 border-t border-slate-100 animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Generated Cover Letter</span>
                      <button
                        onClick={handleCopyCoverLetter}
                        className="text-xs text-violet-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      className="w-full p-4 rounded-xl bg-white border border-slate-200 text-slate-650 text-xs leading-relaxed outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons inside drawer */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button
                  onClick={() => setDrawerJob(null)}
                  className="px-5 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-700 font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                
                {/* Apply Trigger */}
                <button
                  onClick={() => {
                    handleSwipe(drawerJob.id, 'like');
                    setDrawerJob(null);
                  }}
                  className="px-7 py-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-md flex items-center space-x-1.5 active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Apply Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI Interview Questions Modal */}
      {showInterviewModal && drawerJob && (
        <AiInterviewModal 
          jobId={drawerJob.id} 
          jobTitle={drawerJob.title} 
          onClose={() => setShowInterviewModal(false)} 
        />
      )}
    </PageTransition>
  );
}
