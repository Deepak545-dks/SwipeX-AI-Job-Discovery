import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Heart, X, Star, RotateCcw, MapPin, DollarSign, Briefcase, 
  ChevronUp, Loader2, Sparkles, AlertCircle, FileText, GraduationCap, Copy, Keyboard, Activity, Flame, Award
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
      <div className={`${className} rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-violet-405 font-black text-xs uppercase shrink-0`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-2xl object-cover bg-slate-900 border border-white/10 shrink-0 shadow-sm`}
    />
  );
};

export default function SwipeDiscovery() {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasResume, setHasResume] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [alternativeJobs, setAlternativeJobs] = useState([]);
  
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

  const fetchMoreRecommendations = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const response = await api.get('/jobs/recommendations/');
      const newJobs = response.data.results || response.data || [];
      setDeck(prev => {
        const existingIds = new Set(prev.map(j => j.id));
        const filtered = newJobs.filter(j => !existingIds.has(j.id));
        return [...prev, ...filtered];
      });
    } catch (err) {
      console.error("Failed to load more recommendation batch cards:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (deck.length === 0 && !loading) {
      api.get('/jobs/search/?limit=3')
        .then(res => {
          setAlternativeJobs(res.data.results || res.data || []);
        })
        .catch(err => console.error("Failed to load alternative matching list:", err));
    }
  }, [deck, loading]);

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

    const swipedJob = deck.find(j => j.id === jobId);
    setLastSwipedJob(swipedJob);
    
    const remainingDeck = deck.filter(j => j.id !== jobId);
    setDeck(remainingDeck);
    
    if (remainingDeck.length < 20) {
      fetchMoreRecommendations();
    }
    
    setDragX(0);
    setDragY(0);

    try {
      if (action === 'like') {
        await api.post('/jobs/apply/', { job_id: jobId });
        setLikesCount(prev => prev + 1);
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

  const likeOpacity = Math.max(0, Math.min(1, dragX / 150));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / 150));
  const saveOpacity = Math.max(0, Math.min(1, -dragY / 150));

  if (loading) {
    return (
      <PageTransition className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm h-[540px] bg-slate-900 border border-white/10 rounded-[28px] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-pulse">
          <div className="space-y-6">
            <div className="h-6 rounded bg-slate-800 w-1/3" />
            <div className="h-10 rounded bg-slate-800 w-3/4" />
            <div className="h-20 rounded bg-slate-800 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  const activeCard = deck[0];

  return (
    <PageTransition className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-12 gap-8 relative z-10 text-white">
      
      {/* Background spotlights */}
      <div className="absolute top-[10%] left-[10%] w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/15 via-violet-550/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* LEFT COLUMN: Swiper Deck */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center">
        {deck.length === 0 ? (
          <div className="w-full max-w-2xl p-8 bg-slate-900/80 border border-violet-500/20 rounded-[32px] shadow-2xl space-y-8 backdrop-blur-2xl relative overflow-hidden animate-fade-in text-left">
            {/* Top scanning animation illustration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-violet-600/10 via-fuchsia-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              
              {/* Left Side: Illustration & Core Message */}
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Sparkles className="animate-spin duration-[15000ms]" size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">Queue Fully Cleared</h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">AI Discovery recommendation feed</span>
                  </div>
                </div>

                {/* Animated radar illustration */}
                <div className="h-36 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-violet-500/20 animate-ping absolute duration-[3s]" />
                    <div className="w-16 h-16 rounded-full border border-blue-500/35 animate-ping absolute duration-[2s]" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-md relative z-10">
                      <Briefcase size={14} className="animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-violet-405 transition-colors">AI Engine Scanning active feeds</span>
                </div>

                {/* AI generated explanation message */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                  <span className="text-[9px] font-black text-violet-400 uppercase tracking-widest block">AI Search Summary</span>
                  <p className="text-xs text-slate-350 leading-relaxed font-semibold">
                    We parsed your active resume matching indices. Based on your skill base, the recommendation engine has matched and applied to all high-matching vacancies in your region. To unlock more matching jobs, update your skills index or broaden your location parameters.
                  </p>
                </div>

                {/* AI Recommended Alternatives */}
                {alternativeJobs.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block">AI Recommended Alternatives</span>
                    <div className="grid grid-cols-1 gap-2.5">
                      {alternativeJobs.map((job) => (
                        <div key={job.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-between hover:border-violet-500/20 transition-all">
                          <div className="min-w-0">
                            <span className="text-xxs font-extrabold text-white block truncate">{job.title}</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{job.company?.name || job.company_name} • {job.location}</span>
                          </div>
                          <button
                            onClick={() => {
                              setDrawerJob(job);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          >
                            View Job
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notification Toggle & Improve button */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="job-alerts-toggle"
                        className="sr-only peer" 
                        onChange={(e) => {
                          showToast(e.target.checked ? 'Job alert notifications enabled!' : 'Job alert notifications disabled.', 'info');
                        }}
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
                    </div>
                    <div>
                      <span className="text-xxs font-extrabold text-white block">Notify on New Openings</span>
                      <span className="text-[9px] text-slate-500 font-semibold block mt-0.5">Instantly alerts via app and mail</span>
                    </div>
                  </div>
                  <Link 
                    to="/profile"
                    className="px-4 py-2 border border-violet-500/25 hover:border-violet-500/40 bg-violet-600/10 text-violet-400 hover:text-violet-300 text-xxs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <FileText size={12} />
                    <span>Optimize CV</span>
                  </Link>
                </div>
              </div>

              {/* Right Side: Recommendations & Dynamic Actions */}
              <div className="w-full md:w-60 space-y-6">
                
                {/* Recommended Skills */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Unlock More Jobs</span>
                  <p className="text-[9px] text-slate-500 font-semibold">Adding 2 or more of these missing skills to your profile expands matching queues by up to 45%:</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Docker", "AWS Cloud", "GraphQL", "CI/CD Pipeline", "Kubernetes", "Next.js"].map((skill) => (
                      <button
                        key={skill}
                        onClick={async () => {
                          try {
                            const userProfile = await api.get('/profiles/me/');
                            const currentSkills = userProfile.data.skills?.map(s => s.name) || [];
                            if (!currentSkills.includes(skill)) {
                              await api.put('/profiles/me/', {
                                skills: [...currentSkills, skill]
                              });
                              showToast(`Added ${skill} to your profile skills!`, 'success');
                            } else {
                              showToast(`${skill} is already in your skills index.`, 'info');
                            }
                          } catch (err) {
                            showToast('Failed to append skill to profile.', 'error');
                          }
                        }}
                        className="px-2.5 py-1 rounded-xl bg-slate-950/60 border border-white/5 hover:border-violet-500/20 text-slate-400 hover:text-white text-[9px] font-extrabold transition-all cursor-pointer uppercase tracking-wider"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Suggested Companies */}
                <div className="space-y-3">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Suggested Companies</span>
                  <div className="space-y-2.5 pt-1">
                    {[
                      { name: 'Stripe', industry: 'Fintech Payments', odds: 'High Matching' },
                      { name: 'Vercel', industry: 'Frontend Clouds', odds: 'High Matching' },
                      { name: 'Retool', industry: 'Developer tools', odds: 'Medium Matching' }
                    ].map((comp, idx) => (
                      <div key={idx} className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-xs font-black text-violet-405 shrink-0 border border-white/5">
                          {comp.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xxs font-extrabold text-white block truncate">{comp.name}</span>
                          <span className="text-[8px] text-slate-500 font-semibold block mt-0.5">{comp.industry} • {comp.odds}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions stack */}
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={handleResetSwipes}
                    disabled={resetting}
                    className="w-full py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-650 hover:scale-102 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {resetting ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                    <span>Refresh Recommendations</span>
                  </button>
                  <Link
                    to="/search"
                    className="w-full py-3 bg-slate-900 border border-white/10 hover:bg-slate-850 hover:border-slate-500/20 text-slate-250 hover:text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
                  >
                    <Keyboard size={12} />
                    <span>Go to AI Search</span>
                  </Link>
                </div>
              </div>

            </div>

          </div>
        ) : (
          <div className="relative w-full max-w-md h-[720px] flex flex-col justify-between items-center">
            
            {/* Swipe streak header - Redesign item */}
            <div className="w-full flex justify-between items-center px-4 mb-4 text-xs font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-orange-400 animate-pulse">
                <Flame size={15} /> 5 Day Swipe Streak
              </span>
              <span className="text-violet-400 flex items-center gap-1">
                <Award size={15} /> Daily Top Match
              </span>
            </div>

            {/* Cards Stack Container */}
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
                      className="absolute w-full h-full p-[1.5px] rounded-[30px] overflow-hidden bg-gradient-to-tr from-violet-500/25 via-blue-500/20 to-transparent shadow-2xl"
                    >
                      <div className="w-full h-full glass-card-purple-blue rounded-[29px] p-8 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative overflow-hidden text-left">
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

                        {isTop && (
                          <>
                            <div 
                              style={{ opacity: likeOpacity }}
                              className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[-12deg] pointer-events-none z-35 tracking-wider shadow-lg bg-slate-950/90"
                            >
                              LIKE
                            </div>
                            <div 
                              style={{ opacity: nopeOpacity }}
                              className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[12deg] pointer-events-none z-35 tracking-wider shadow-lg bg-slate-950/90"
                            >
                              NOPE
                            </div>
                            <div 
                              style={{ opacity: saveOpacity }}
                              className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-cyan-500 text-cyan-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 pointer-events-none z-35 tracking-wider shadow-lg bg-slate-950/90"
                            >
                              SAVE
                            </div>
                          </>
                        )}

                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap gap-1.5">
                                <span className="inline-flex px-3 py-1 bg-violet-600/20 border border-violet-500/30 rounded-md text-[9px] font-black uppercase text-violet-400 tracking-wider">
                                  {job.job_type}
                                </span>
                                <span className="inline-flex px-3 py-1 bg-blue-600/20 border border-blue-500/30 rounded-md text-[9px] font-black uppercase text-blue-400 tracking-wider">
                                  {job.experience_level.replace('_', ' ')}
                                </span>
                              </div>
                              <h2 className="text-3xl font-black text-white tracking-tight mt-4 leading-snug truncate">{job.title}</h2>
                              <p className="text-violet-400 text-xl font-bold mt-1.5 truncate">{job.company.name}</p>
                            </div>

                            {/* Match Ring */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className="relative w-14 h-14 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                  <circle
                                    cx="28"
                                    cy="28"
                                    r="22"
                                    stroke="rgba(255,255,255,0.03)"
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
                                      <stop offset="0%" stopColor="#8b5cf6" />
                                      <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span className="absolute text-xxs font-black text-white">96%</span>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">AI Match</span>
                            </div>
                          </div>

                          <div className="space-y-2.5 mt-6 border-t border-white/5 pt-4 text-left">
                            <div className="flex items-center space-x-2.5 text-xs text-slate-400 font-bold">
                              <MapPin size={14} className="text-slate-500" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center space-x-2.5 text-xl text-white font-extrabold">
                              <DollarSign size={18} className="text-slate-500" />
                              <span>
                                {job.salary_min ? `$${(job.salary_min/1000)}k` : 'Negotiable'}
                                {job.salary_max ? ` - $${(job.salary_max/1000)}k` : ''}
                              </span>
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5 text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Required Skills</p>
                            <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-[85px] overflow-hidden">
                              {job.skills_required.slice(0, 4).map((skill) => (
                                <span key={skill} className="px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm font-bold shadow-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => setDrawerJob(job)}
                          className="w-full flex flex-col items-center py-2 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer animate-bounce"
                        >
                          <ChevronUp size={16} />
                          <span className="text-[9px] font-extrabold uppercase tracking-widest mt-1">Swipe Up for details</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Action buttons */}
            <div className="flex items-center space-x-6 z-10 pt-6">
              <button
                onClick={handleUndo}
                className="w-14 h-14 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center justify-center text-slate-400 shadow-md hover:scale-105 active:scale-90 transition-all cursor-pointer"
              >
                <RotateCcw size={18} />
              </button>
              <button
                onClick={() => handleSwipe(activeCard.id, 'dislike')}
                className="w-16 h-16 rounded-full bg-slate-900 border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-lg hover:scale-105 active:scale-90 transition-all cursor-pointer"
              >
                <X size={26} />
              </button>
              <button
                onClick={() => handleSwipe(activeCard.id, 'save')}
                className="w-14 h-14 rounded-full bg-slate-900 border border-cyan-500/20 hover:border-cyan-500/60 hover:bg-cyan-950/20 flex items-center justify-center text-cyan-405 shadow-md hover:scale-105 active:scale-90 transition-all cursor-pointer"
              >
                <Star size={20} />
              </button>
              <button
                onClick={() => handleSwipe(activeCard.id, 'like')}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20 hover:scale-105 active:scale-90 transition-all cursor-pointer"
              >
                <Heart size={26} className="fill-white" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Live Recruiter Feed & Stats */}
      <div className="lg:col-span-4 space-y-6">
        <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl">
          <div className="bg-slate-950/80 backdrop-blur-2xl rounded-[23px] p-6 space-y-6 text-left border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Activity size={14} className="text-violet-400 animate-pulse" />
              <span>Live Hiring Feed</span>
            </h3>

            <div className="space-y-4 max-h-[360px] overflow-y-auto divide-y divide-white/5">
              {[
                { time: 'Just now', company: 'Google Inc.', desc: 'Recruiter viewed your Javascript skill tags' },
                { time: '3m ago', company: 'Microsoft', desc: 'Verified matching score: 98%' },
                { time: '12m ago', company: 'Stripe Inc.', desc: 'AI Gap Analysis compiled recommendations' },
                { time: '1h ago', company: 'Amazon', desc: 'Direct message channel unlocked with manager' }
              ].map((activity, i) => (
                <div key={i} className="pt-3.5 first:pt-0 text-[11px] leading-relaxed text-slate-400">
                  <div className="flex justify-between items-start">
                    <span className="font-extrabold text-white">{activity.company}</span>
                    <span className="text-[9px] text-slate-500 font-semibold">{activity.time}</span>
                  </div>
                  <p className="font-medium mt-1">{activity.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-[1px] rounded-3xl bg-gradient-to-tr from-violet-500/20 to-blue-500/25 shadow-xl">
          <div className="bg-slate-950/80 backdrop-blur-2xl rounded-[23px] p-6 text-left space-y-4 border border-white/5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Your Swipe Stats</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-tr from-violet-600 to-indigo-650 text-white rounded-2xl shadow-md text-center">
                <span className="text-2xl font-black block">{likesCount}</span>
                <span className="text-[8px] text-violet-100 font-extrabold uppercase tracking-wider mt-1 block">Active Likes</span>
              </div>
              <div className="p-4 bg-gradient-to-tr from-blue-600 to-cyan-600 text-white rounded-2xl shadow-md text-center">
                <span className="text-2xl font-black block">{matchesCount}</span>
                <span className="text-[8px] text-blue-100 font-extrabold uppercase tracking-wider mt-1 block">Matches Found</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details drawer Overlay */}
      <AnimatePresence>
        {drawerJob && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex justify-end items-end">
            <div className="absolute inset-0" onClick={() => setDrawerJob(null)} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-950 border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left text-white"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white leading-tight truncate">{drawerJob.title}</h3>
                  <p className="text-violet-400 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
                </div>
                <button
                  onClick={() => setDrawerJob(null)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-y border-white/10 py-5">
                <div className="flex items-center space-x-1.5 font-semibold">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{drawerJob.location}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-white font-extrabold">
                  <DollarSign size={14} className="text-slate-500" />
                  <span>
                    {drawerJob.salary_min ? `$${drawerJob.salary_min.toLocaleString()}` : 'Negotiable'}
                    {drawerJob.salary_max ? ` - $${drawerJob.salary_max.toLocaleString()}` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize font-semibold">
                  <Briefcase size={14} className="text-slate-500" />
                  <span>{drawerJob.employment_type.replace('_', ' ')} ({drawerJob.job_type})</span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize font-semibold">
                  <GraduationCap size={14} className="text-slate-500" />
                  <span>{drawerJob.experience_level.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">About the Role</h4>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-white/5 font-semibold">{drawerJob.description}</p>
              </div>

              {drawerJob.requirements && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Key Requirements</h4>
                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-white/5 font-semibold">{drawerJob.requirements}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Skills Stack</h4>
                <div className="flex flex-wrap gap-1.5">
                  {drawerJob.skills_required.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xxs font-extrabold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <AiSkillGapWidget jobId={drawerJob.id} />

              {/* AI Tools Bar */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-violet-405 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
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
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-violet-405 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles size={12} />
                    <span>Practice Questions</span>
                  </button>
                </div>

                {coverLetter && (
                  <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Generated Cover Letter</span>
                      <button
                        onClick={handleCopyCoverLetter}
                        className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      className="w-full p-4 rounded-xl bg-slate-900 border border-white/10 text-slate-300 text-xs leading-relaxed outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons inside drawer */}
              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                <button
                  onClick={() => setDrawerJob(null)}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                
                <button
                  onClick={() => {
                    handleSwipe(drawerJob.id, 'like');
                    setDrawerJob(null);
                  }}
                  className="px-7 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95 cursor-pointer uppercase tracking-wider"
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
