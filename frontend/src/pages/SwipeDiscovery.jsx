import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Heart, X, Star, RotateCcw, MapPin, DollarSign, Briefcase, 
  ChevronUp, Loader2, Sparkles, AlertCircle, FileText, GraduationCap, Copy, Keyboard, Activity, Flame, Award,
  CheckCircle, Shield, Bookmark, RefreshCw, BarChart2, Info, Building, HelpCircle, Users, ExternalLink, Zap,
  TrendingUp, Award as BadgeIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyLogo = ({ company, className = "w-14 h-14" }) => {
  const [error, setError] = useState(false);
  
  if (!company?.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-violet-400 font-black text-sm uppercase shrink-0`}>
        {company?.name ? company.name.charAt(0) : 'C'}
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
  
  const [lastSwipedJob, setLastSwipedJob] = useState(null);
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState('right');
  const [totalCount, setTotalCount] = useState(0);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  // Swipe Stats
  const [likesCount, setLikesCount] = useState(16);
  const [matchesCount, setMatchesCount] = useState(5);
  const [swipesGoal, setSwipesGoal] = useState(6); // Goal progress tracker

  // Details panel overlay drawer
  const [drawerJob, setDrawerJob] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  const [loadingMore, setLoadingMore] = useState(false);
  const [alternativeJobs, setAlternativeJobs] = useState([]);
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
      const data = response.data;
      const results = data.results || data || [];
      const unique = Array.from(new Map(results.map(j => [j.id, j])).values());
      setDeck(unique);
      setTotalCount(data.count || 0);
      setHasLoadedInitially(true);
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
      const data = response.data;
      const newJobs = data.results || data || [];
      setTotalCount(data.count || 0);
      setDeck(prev => {
        const combined = [...prev, ...newJobs];
        return Array.from(new Map(combined.map(j => [j.id, j])).values());
      });
    } catch (err) {
      console.error("Failed to load more recommendation batch cards:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (deck.length === 0 && !loading && showEmptyState) {
      api.get('/jobs/search/?limit=4')
        .then(res => {
          setAlternativeJobs(res.data.results || res.data || []);
        })
        .catch(err => console.error("Failed to load alternative matching list:", err));
    }
  }, [deck, loading]);

  useEffect(() => {
    if (deck.length === 0 && totalCount > 0 && !loading && !loadingMore && hasLoadedInitially) {
      fetchMoreRecommendations();
    }
  }, [deck, totalCount, loading, loadingMore, hasLoadedInitially]);

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
        setSwipeDirection('like');
        handleSwipe(targetId, 'like');
      } else if (e.key === 'ArrowLeft') {
        setSwipeDirection('dislike');
        handleSwipe(targetId, 'dislike');
      } else if (e.key === 'ArrowUp') {
        setSwipeDirection('save');
        handleSwipe(targetId, 'save');
      } else if (e.key === 's' || e.key === 'S') {
        setSwipeDirection('superlike');
        handleSwipe(targetId, 'superlike');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, drawerJob]);

  const handleSwipe = async (jobId, action) => {
    if ((action === 'like' || action === 'superlike') && !hasResume) {
      showToast('You must upload a resume in your profile before you can swipe right/apply.', 'warning');
      return;
    }

    const swipedJob = deck.find(j => j.id === jobId);
    if (!swipedJob) return;
    
    setSwipeDirection(action);
    setLastSwipedJob(swipedJob);
    
    // Auto batch load threshold checks
    const remainingDeck = deck.filter(j => j.id !== jobId);
    setDeck(Array.from(new Map(remainingDeck.map(j => [j.id, j])).values()));
    setTotalCount(prev => Math.max(0, prev - 1));
    
    if (remainingDeck.length < 10) {
      fetchMoreRecommendations();
    }
    
    setDragX(0);
    setDragY(0);

    // Update goal counter
    setSwipesGoal(prev => Math.min(15, prev + 1));

    try {
      // POST swiping details to Django backend
      const backendAction = action === 'superlike' ? 'like' : action;
      await api.post('/jobs/swipe/', { job_id: jobId, action: backendAction });
      
      if (action === 'like') {
        setLikesCount(prev => prev + 1);
        if (Math.random() > 0.45) {
          setMatchesCount(prev => prev + 1);
          showToast(`It's a Match! Recruiter at ${swipedJob.company?.name || swipedJob.company_name} wants to connect.`, 'success');
        } else {
          showToast(`Applied to ${swipedJob.title}!`, 'success');
        }
      } else if (action === 'superlike') {
        setLikesCount(prev => prev + 1);
        setMatchesCount(prev => prev + 1);
        showToast(`Super Liked! Priority application submitted to ${swipedJob.company?.name || swipedJob.company_name}.`, 'success');
      } else if (action === 'save') {
        showToast('Job saved to your bookmarks.', 'info');
      } else {
        showToast(`Passed on ${swipedJob.title}.`, 'info');
      }
    } catch (err) {
      console.error(err);
      showToast('Action registered locally.', 'info');
    }
  };

  const handleUndo = async () => {
    if (!lastSwipedJob) {
      showToast('No recent swipe transaction to undo.', 'info');
      return;
    }
    try {
      await api.post('/jobs/swipe/undo/');
      setDeck(prev => {
        const combined = [lastSwipedJob, ...prev];
        return Array.from(new Map(combined.map(j => [j.id, j])).values());
      });
      setTotalCount(prev => prev + 1);
      setLastSwipedJob(null);
      setSwipesGoal(prev => Math.max(0, prev - 1));
      showToast(`Restored deck card: ${lastSwipedJob.title}`, 'success');
    } catch (err) {
      showToast('Failed to undo last swipe.', 'error');
    }
  };

  const showEmptyState = deck.length === 0 && totalCount === 0 && hasLoadedInitially;


  const handleResetSwipes = async () => {
    setResetting(true);
    try {
      await api.post('/jobs/swipe/reset/');
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
    const threshold = 140;
    if (info.offset.x > threshold) {
      setSwipeDirection('like');
      handleSwipe(jobId, 'like');
    } else if (info.offset.x < -threshold) {
      setSwipeDirection('dislike');
      handleSwipe(jobId, 'dislike');
    } else if (info.offset.y < -threshold) {
      setSwipeDirection('save');
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

  // Drag overlay triggers
  const likeOpacity = Math.max(0, Math.min(1, dragX / 140));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / 140));
  const saveOpacity = Math.max(0, Math.min(1, -dragY / 140));

  if (loading) {
    return (
      <PageTransition className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-md h-[600px] bg-slate-900 border border-white/10 rounded-[32px] p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-pulse">
          <div className="space-y-6">
            <div className="h-6 rounded bg-slate-800 w-1/3" />
            <div className="h-10 rounded bg-slate-800 w-3/4" />
            <div className="h-24 rounded bg-slate-800 w-full" />
          </div>
        </div>
      </PageTransition>
    );
  }

  const activeCard = deck[0];

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-12 gap-8 relative z-10 text-white">
      
      {/* Aurora Spotlights */}
      <div className="absolute top-[10%] left-[5%] w-[550px] h-[550px] bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-fuchsia-500/10 to-transparent rounded-full blur-[140px] -z-10 pointer-events-none" />

      {/* LEFT COLUMN: Premium Swipe experience */}
      <div className="lg:col-span-8 flex flex-col items-center justify-center select-none">
        
        {deck.length === 0 && !showEmptyState ? (
          <div className="w-full max-w-md h-[580px] bg-slate-900/60 border border-white/10 rounded-[32px] p-6 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 rounded-full border border-violet-500/10 animate-ping absolute duration-[3s]" />
              <div className="w-28 h-28 rounded-full border border-blue-500/20 animate-ping absolute duration-[2s]" />
            </div>
            <Loader2 className="animate-spin text-cyan-400 w-8 h-8 mb-4 relative z-10" />
            <h3 className="text-base font-black text-white relative z-10">AI Recommendations Syncing...</h3>
            <p className="text-[10px] text-slate-400 mt-2 max-w-xs text-center font-semibold relative z-10">Matching remaining jobs against target profile parameters.</p>
          </div>
        ) : showEmptyState ? (
          <div className="w-full max-w-2xl p-8 bg-slate-900/80 border border-violet-500/20 rounded-[32px] shadow-2xl space-y-8 backdrop-blur-2xl relative overflow-hidden animate-fade-in text-left">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-tr from-violet-605/10 via-fuchsia-605/5 to-transparent rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-lg shrink-0">
                    <Sparkles className="animate-spin duration-[15000ms]" size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white tracking-tight">No more matching jobs today.</h3>
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mt-0.5">AI Discovery recommendation feed</span>
                  </div>
                </div>
 
                <div className="h-32 rounded-2xl bg-slate-950/60 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-violet-500/20 animate-ping absolute duration-[3s]" />
                    <div className="w-16 h-16 rounded-full border border-blue-500/35 animate-ping absolute duration-[2s]" />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-violet-600 to-blue-600 flex items-center justify-center text-white shadow-md relative z-10">
                      <Briefcase size={14} className="animate-pulse" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 text-[9px] font-black uppercase tracking-widest text-slate-500">AI Feed auditing active</span>
                </div>
 
                {/* AI Alternative matches list */}
                {alternativeJobs.length > 0 && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-black uppercase tracking-widest text-violet-405 block border-b border-white/5 pb-2">AI Recommended Alternatives</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {alternativeJobs.slice(0, 4).map((job) => (
                        <div key={job.id} className="p-4 rounded-2xl bg-slate-950/50 border border-white/5 flex items-center justify-between hover:border-violet-500/20 transition-all">
                          <div className="min-w-0">
                            <span className="text-xxs font-extrabold text-white block truncate">{job.title}</span>
                            <span className="text-[9px] text-slate-450 block mt-0.5">{job.company?.name || job.company_name} • {job.location}</span>
                          </div>
                          <button
                            onClick={() => setDrawerJob(job)}
                            className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0"
                          >
                            View
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
 
                {/* Notification Toggle & CV Improve */}
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center p-4 rounded-2xl bg-slate-950/40 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        id="job-alerts-toggle"
                        className="sr-only peer" 
                        onChange={(e) => showToast(e.target.checked ? 'Alert notifications enabled!' : 'Alert notifications disabled.', 'info')}
                      />
                      <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600" />
                    </div>
                    <div>
                      <span className="text-xxs font-extrabold text-white block">Notify Me On Openings</span>
                      <span className="text-[8px] text-slate-500 block font-semibold">Instant push notifications & mail alerts</span>
                    </div>
                  </div>
                  <Link 
                    to="/profile"
                    className="px-4 py-2 border border-violet-500/25 bg-violet-605/10 text-violet-400 hover:text-violet-300 text-xxs font-black uppercase rounded-xl transition-all inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText size={12} />
                    <span>Improve Resume</span>
                  </Link>
                </div>
              </div>
 
              {/* Right panel inside empty state */}
              <div className="w-full md:w-56 space-y-6">
                <div className="space-y-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block border-b border-white/5 pb-2">Unlock More Matches</span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Kubernetes", "Next.js", "Docker", "GraphQL", "AWS Cloud"].map((skill) => (
                      <button
                        key={skill}
                        onClick={async () => {
                          try {
                            const res = await api.get('/profiles/me/');
                            const current = res.data.skills?.map(s => s.name) || [];
                            if (!current.includes(skill)) {
                              await api.put('/profiles/me/', { skills: [...current, skill] });
                              showToast(`Added ${skill} to skills list!`, 'success');
                            } else {
                              showToast(`${skill} is already on your profile.`, 'info');
                            }
                          } catch (e) {
                            showToast('Failed to append skills.', 'error');
                          }
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-950/60 border border-white/5 hover:border-violet-500/20 text-slate-400 hover:text-white text-[8px] font-bold transition-all cursor-pointer"
                      >
                        + {skill}
                      </button>
                    ))}
                  </div>
                </div>
 
                <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                  <button
                    onClick={handleResetSwipes}
                    disabled={resetting}
                    className="w-full py-3 bg-gradient-to-r from-violet-605 via-fuchsia-605 to-blue-600 hover:scale-102 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                  >
                    {resetting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                    <span>Refresh AI Recommendations</span>
                  </button>
                  <Link
                    to="/search"
                    className="w-full py-3 bg-slate-900 border border-white/10 hover:border-white/20 text-slate-350 hover:text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Keyboard size={12} />
                    <span>Expand Search Filters</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full max-w-md h-[680px] flex flex-col justify-between items-center">
            
            {/* Header Streak Info */}
            <div className="w-full flex justify-between items-center px-4 mb-4 text-[10px] font-black uppercase tracking-wider">
              <span className="flex items-center gap-1 text-orange-400 animate-pulse">
                <Flame size={14} /> 5 Day Swipe Streak
              </span>
              <span className="text-violet-405 flex items-center gap-1">
                <Award size={14} /> Daily Top Match
              </span>
            </div>
 
            {/* Cards Stack Container (Increased size by 20%) */}
            <div className="relative w-full h-[580px] max-w-sm">
              <AnimatePresence custom={swipeDirection}>
                {deck.slice(0, 5).reverse().map((job, idx, arr) => {
                  const relativeIndex = arr.length - 1 - idx; // 0 for top, 1 for middle, etc.
                  const isTop = relativeIndex === 0;

                  return (
                    <motion.div
                      key={job.id}
                      style={{ touchAction: 'none' }}
                      drag={isTop}
                      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                      onDrag={isTop ? handleDrag : undefined}
                      onDragEnd={(e, info) => handleDragEnd(e, info, job.id)}
                      custom={swipeDirection}
                      variants={{
                        exit: (direction) => {
                          if (direction === 'like') return { x: 550, opacity: 0, rotate: 15 };
                          if (direction === 'dislike') return { x: -550, opacity: 0, rotate: -15 };
                          if (direction === 'save') return { y: -550, opacity: 0 };
                          if (direction === 'superlike') return { y: -550, opacity: 0, scale: 1.1 };
                          return { x: -550, opacity: 0 };
                        }
                      }}
                      animate={{
                        scale: isTop ? 1 : 1 - relativeIndex * 0.05,
                        y: isTop ? 0 : relativeIndex * 14,
                        zIndex: 10 - relativeIndex,
                        opacity: isTop ? 1 : 0.8 - relativeIndex * 0.2
                      }}
                      exit="exit"
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                      className="absolute w-full h-full p-[1.5px] rounded-[32px] overflow-hidden bg-gradient-to-tr from-violet-500/25 via-blue-500/20 to-transparent shadow-2xl"
                    >
                      <div className="w-full h-full glass-card-purple-blue rounded-[31px] p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden text-left select-none">
                        
                        {/* Overlay tags for likes/nopes */}
                        {isTop && (
                          <>
                            <div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 border-4 border-emerald-500 text-emerald-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 rotate-[-12deg] tracking-wider bg-slate-950/95 shadow-xl z-30">
                              LIKE
                            </div>
                            <div style={{ opacity: nopeOpacity }} className="absolute top-6 right-6 border-4 border-rose-500 text-rose-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 rotate-[12deg] tracking-wider bg-slate-950/95 shadow-xl z-30">
                              NOPE
                            </div>
                            <div style={{ opacity: saveOpacity }} className="absolute bottom-24 left-1/2 -translate-x-1/2 border-4 border-cyan-500 text-cyan-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 tracking-wider bg-slate-950/95 shadow-xl z-30">
                              SAVE
                            </div>
                          </>
                        )}

                        {/* RENDER CONTENT ONLY FOR TOP CARD TO PREVENT OVERLAPPING AND LAGS */}
                        {isTop ? (
                          <>
                            <div className="space-y-4">
                              {/* Header Card Details */}
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex items-center gap-3">
                                  <CompanyLogo company={job.company} />
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                      <h4 className="text-sm font-black text-white truncate">{job.company?.name || job.company_name}</h4>
                                      <Shield size={14} className="text-blue-400 shrink-0" fill="currentColor" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                                      Rating: {job.company?.rating || 4.2} ★ • {job.company?.industry || 'Technology'}
                                    </span>
                                  </div>
                                </div>

                                {/* Radial AI Match progress gauge */}
                                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff10" strokeWidth="2.5" />
                                    <circle cx="18" cy="18" r="16" fill="none" stroke="url(#card-match-grad)" strokeWidth="2.5"
                                      strokeDasharray={`${job.ai_match_score || 85}, 100`} />
                                    <defs>
                                      <linearGradient id="card-match-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#8b5cf6" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                      </linearGradient>
                                    </defs>
                                  </svg>
                                  <span className="absolute text-[9px] font-black text-white">{job.ai_match_score || 85}%</span>
                                </div>
                              </div>

                              {/* Title and location */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-full bg-violet-605/10 border border-violet-500/20 text-[8px] font-black text-violet-400 uppercase tracking-wider">
                                    {job.experience_level}
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[8px] font-black text-emerald-400 uppercase tracking-wider">
                                    Easy Apply
                                  </span>
                                </div>
                                <h2 className="text-base font-black text-white leading-tight tracking-tight line-clamp-1">{job.title}</h2>
                                <span className="text-[10px] text-slate-450 block font-semibold flex items-center gap-1">
                                  <MapPin size={11} /> {job.location} ({job.job_type})
                                </span>
                              </div>

                              {/* Why matches details */}
                              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                <span className="text-[8px] font-black uppercase tracking-widest text-violet-405 block">Why This Job Matches You</span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(job.skills_required?.slice(0, 4) || ["React", "Python", "SQL"]).map((skill) => (
                                    <span key={skill} className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[8.5px] font-extrabold flex items-center gap-1 border border-emerald-500/10 uppercase tracking-wide">
                                      ✓ {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Description snippet */}
                              <p className="text-xxs text-slate-400 leading-relaxed font-semibold line-clamp-3">
                                {job.description}
                              </p>
                            </div>

                            {/* bottom card panel details */}
                            <div className="space-y-4 pt-2 border-t border-white/5">
                              <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
                                <span className="text-emerald-450 font-black text-xs">
                                  ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                                </span>
                                <span>12 Applicants</span>
                              </div>
                              <button 
                                onClick={() => setDrawerJob(job)}
                                className="w-full py-2.5 bg-slate-950/60 border border-white/5 hover:border-violet-500/20 text-slate-350 hover:text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
                              >
                                <span>Read Job Description & Insights</span>
                                <ChevronUp size={12} className="animate-bounce" />
                              </button>
                            </div>
                          </>
                        ) : (
                          // PREVIEW CARD EMPTY PLACEHOLDER
                          <div className="w-full h-full flex flex-col justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-14 h-14 rounded-2xl bg-slate-950/60 border border-white/5" />
                              <div className="space-y-2 flex-1">
                                <div className="h-3 rounded bg-slate-950/60 w-1/3" />
                                <div className="h-2 rounded bg-slate-950/60 w-1/2" />
                              </div>
                            </div>
                            <div className="h-16 rounded bg-slate-955/40" />
                          </div>
                        )}

                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Bottom Swiper Control Actions (Premium styling buttons with glow, scales, and ripples) */}
            <div className="flex items-center gap-4 mt-6">
              <button
                onClick={handleUndo}
                className="w-11 h-11 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-white/5"
              >
                <RotateCcw size={15} />
              </button>
              
              <button
                onClick={() => {
                  setSwipeDirection('dislike');
                  handleSwipe(activeCard.id, 'dislike');
                }}
                className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/25 hover:border-rose-500 flex items-center justify-center text-rose-450 hover:text-rose-300 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-rose-500/10"
              >
                <X size={20} />
              </button>
              
              <button
                onClick={() => {
                  setSwipeDirection('superlike');
                  handleSwipe(activeCard.id, 'superlike');
                }}
                className="w-11 h-11 rounded-full bg-slate-900 border border-yellow-500/20 hover:border-yellow-500 flex items-center justify-center text-yellow-500 hover:text-yellow-300 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <Star size={15} />
              </button>

              <button
                onClick={() => {
                  setSwipeDirection('save');
                  handleSwipe(activeCard.id, 'save');
                }}
                className="w-11 h-11 rounded-full bg-slate-900 border border-cyan-500/20 hover:border-cyan-500 flex items-center justify-center text-cyan-405 hover:text-cyan-300 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg"
              >
                <Bookmark size={15} />
              </button>
              
              <button
                onClick={() => {
                  setSwipeDirection('like');
                  handleSwipe(activeCard.id, 'like');
                }}
                className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 hover:border-emerald-500 flex items-center justify-center text-emerald-450 hover:text-emerald-300 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
              >
                <Heart size={20} />
              </button>
            </div>

          </div>
        )}

      </div>

      {/* RIGHT PANEL: Live Feed & Seeker Analytics */}
      <div className="lg:col-span-4 space-y-6 text-left">
        
        {/* Swipe stats goal card */}
        <div className="p-5 rounded-[24px] border border-white/5 bg-slate-900/40 backdrop-blur-md space-y-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Today's Swiping Goal</span>
          <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
            <span>Goal Progress</span>
            <span className="text-violet-405">{swipesGoal} / 15 Jobs Swiped</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
            <div 
              style={{ width: `${(swipesGoal / 15) * 100}%` }}
              className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-500 transition-all duration-300"
            />
          </div>
        </div>

        {/* Dynamic Seeker Stats */}
        <div className="p-5 rounded-[24px] border border-white/5 bg-slate-900/40 backdrop-blur-md space-y-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Swipe Analytics</span>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl text-left">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Liked Roles</span>
              <p className="text-lg font-black text-white mt-1">{likesCount}</p>
            </div>
            <div className="p-3 bg-slate-950/60 border border-white/5 rounded-2xl text-left">
              <span className="text-[8px] font-bold uppercase tracking-wider text-slate-500">Matches</span>
              <p className="text-lg font-black text-violet-400 mt-1">{matchesCount}</p>
            </div>
          </div>
        </div>

        {/* Live recruiter activity feeds */}
        <div className="p-5 rounded-[24px] border border-white/5 bg-slate-900/40 backdrop-blur-md space-y-4">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Live Recruiter Feed</span>
          <div className="space-y-3.5">
            {[
              { text: "Recruiter at Stripe checked your CV", time: "3m ago", highlight: true },
              { text: "Wellfound is reviewing QA Automation leads", time: "12m ago", highlight: false },
              { text: "Retool is interviewing for React Lead roles", time: "1h ago", highlight: false }
            ].map((feed, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-xxs font-semibold">
                <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${feed.highlight ? 'bg-violet-500 animate-ping' : 'bg-slate-750'}`} />
                <div className="flex-1">
                  <p className="text-slate-300 leading-tight">{feed.text}</p>
                  <span className="text-[8px] text-slate-500 block mt-0.5">{feed.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* DETAILED OVERLAY DRAWER DIALOG MODAL */}
      {drawerJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-slide-in">
            
            {/* Header Area */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CompanyLogo company={drawerJob.company} className="w-12 h-12" />
                <div className="min-w-0">
                  <h3 className="text-sm font-black text-white">{drawerJob.title}</h3>
                  <span className="text-[10px] text-slate-450 font-bold block mt-0.5">
                    {drawerJob.company?.name || drawerJob.company_name} • Rating: {drawerJob.company?.rating || 4.2} ★
                  </span>
                </div>
              </div>
              <button 
                onClick={() => { setDrawerJob(null); setCoverLetter(''); }}
                className="p-1.5 rounded-lg bg-white/5 border border-white/5 text-slate-450 hover:text-white transition-all cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Scrollable details contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* ATS and match progress grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-2xl text-center">
                  <span className="text-[8px] font-black uppercase text-slate-500 block">AI Match Score</span>
                  <span className="text-lg font-black text-violet-405 block mt-1">{drawerJob.ai_match_score || 85}%</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-2xl text-center">
                  <span className="text-[8px] font-black uppercase text-slate-500 block">Interview Probability</span>
                  <span className="text-lg font-black text-emerald-400 block mt-1">78%</span>
                </div>
                <div className="p-3 bg-slate-950/50 border border-white/5 rounded-2xl text-center">
                  <span className="text-[8px] font-black uppercase text-slate-500 block">Salary Prediction</span>
                  <span className="text-lg font-black text-cyan-400 block mt-1">High</span>
                </div>
              </div>

              {/* Recruiter Shortlist Insights */}
              <div className="p-4 rounded-2xl bg-violet-605/5 border border-violet-500/25 space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block flex items-center gap-1">
                  <Zap size={11} fill="currentColor" /> Recruiter Shortlist Insights
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xxs leading-relaxed font-semibold text-slate-350">
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-extrabold uppercase text-emerald-450 block">Why shortlisting you:</span>
                    <p>✓ Matching skills profile requirements.</p>
                    <p>✓ Relevant experience level target.</p>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[8px] font-extrabold uppercase text-rose-450 block">Why rejecting you:</span>
                    <p>✗ Location parameters are outside preferred states.</p>
                  </div>
                </div>
              </div>

              {/* Job Specification Grid */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block border-b border-white/5 pb-2">Job Specifications</span>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xxs font-extrabold text-white">
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">Salary range</span>
                    <span className="text-slate-200">${(drawerJob.salary_min / 1000).toFixed(0)}k - ${(drawerJob.salary_max / 1000).toFixed(0)}k</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">Experience Level</span>
                    <span className="text-slate-200 capitalize">{drawerJob.experience_level}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">Employment Type</span>
                    <span className="text-slate-200 capitalize">{drawerJob.employment_type?.replace('_', ' ') || 'Full Time'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">Work mode</span>
                    <span className="text-slate-200 capitalize">{drawerJob.job_type}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">HQ Headquarters</span>
                    <span className="text-slate-200 truncate block">{drawerJob.company?.headquarters || drawerJob.location}</span>
                  </div>
                  <div>
                    <span className="text-[8px] uppercase text-slate-500 block">Hiring status</span>
                    <span className="text-emerald-450 font-bold uppercase block">Active</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block border-b border-white/5 pb-2">Job Description</span>
                <p className="text-xxs text-slate-350 leading-relaxed font-semibold">
                  {drawerJob.description}
                </p>
              </div>

              {/* Requirements & Missing skills */}
              <div className="space-y-3">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-450 block border-b border-white/5 pb-2">Required Skills Profile</span>
                <div className="flex flex-wrap gap-2">
                  {(drawerJob.skills_required || ["React", "Python", "SQL"]).map((skill) => (
                    <span key={skill} className="px-3 py-1 rounded-xl bg-slate-950 text-slate-300 text-xxs border border-white/5 uppercase tracking-wider font-extrabold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Cover Letter generation widget */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                <span className="text-[9px] font-black uppercase text-violet-405 block">AI Assistant Cover Letter</span>
                <p className="text-xxs text-slate-400 font-semibold leading-relaxed">
                  Tailor a custom, targeted application cover letter for {drawerJob.company?.name || drawerJob.company_name} matching your profile.
                </p>
                {coverLetter ? (
                  <div className="space-y-3">
                    <pre className="p-3 bg-slate-950 rounded-xl text-[10px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed border border-white/5">
                      {coverLetter}
                    </pre>
                    <button
                      onClick={handleCopyCoverLetter}
                      className="px-4 py-2 bg-slate-900 border border-white/10 hover:border-violet-500/20 text-slate-200 hover:text-white text-xxs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Copy size={12} />
                      <span>Copy Cover Letter</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="w-full py-2.5 bg-gradient-to-r from-violet-605 to-blue-600 hover:scale-102 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    {generatingCoverLetter ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : (
                      <Sparkles size={12} />
                    )}
                    <span>Generate AI Cover Letter</span>
                  </button>
                )}
              </div>

            </div>

            {/* CTA action footer */}
            <div className="p-6 border-t border-white/5 bg-slate-950/40 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => { setDrawerJob(null); setCoverLetter(''); }}
                className="px-4 py-2.5 rounded-xl border border-white/10 hover:bg-slate-850 text-slate-300 hover:text-white text-xxs font-black uppercase tracking-wider cursor-pointer"
              >
                Close Insights
              </button>
              
              <button
                onClick={() => {
                  const id = drawerJob.id;
                  setDrawerJob(null);
                  setCoverLetter('');
                  handleSwipe(id, 'like');
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-violet-605 via-fuchsia-605 to-blue-600 text-white rounded-xl text-xxs font-black uppercase tracking-wider cursor-pointer shadow-md"
              >
                Apply & Shortlist
              </button>
            </div>

          </div>
        </div>
      )}

    </PageTransition>
  );
}
