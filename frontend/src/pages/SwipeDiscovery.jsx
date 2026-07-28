import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Star, Heart, RotateCcw, Loader2, MapPin, DollarSign, 
  Briefcase, GraduationCap, FileText, ChevronUp, AlertCircle, CheckCircle, Sparkles, Info, Building, Check, RefreshCw, Copy, Keyboard, ArrowRight
} from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import AiSkillGapWidget from '../components/AiSkillGapWidget';
import AiInterviewModal from '../components/AiInterviewModal';

// Reusable Company Logo fallback initials component
const CompanyLogo = ({ company, className = "w-12 h-12" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-violet-400 font-extrabold text-sm uppercase shrink-0 shadow-inner`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={`${company.name} logo`}
      onError={() => setError(true)}
      className={`${className} rounded-2xl object-cover bg-slate-950 border border-white/10 shrink-0 shadow-md`}
    />
  );
};

export default function SwipeDiscovery() {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [hasResume, setHasResume] = useState(false);
  const [drawerJob, setDrawerJob] = useState(null);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  
  // AI Tools states
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  // Swipe animations track
  const [dragX, setDragX] = useState(0);
  const [dragY, setDragY] = useState(0);

  const { showToast } = useToast();

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Fetch deck
      const deckResp = await api.get('/jobs/deck/');
      setDeck(deckResp.data.results || deckResp.data);

      // 2. Fetch seeker profile status to check resume existence
      const profileResp = await api.get('/profiles/me/');
      const resumes = profileResp.data.resumes || [];
      setHasResume(resumes.length > 0);
    } catch (err) {
      console.error(err);
      showToast('Failed to load job discovery deck.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSwipe = useCallback(async (jobId, action) => {
    if (action === 'like' && !hasResume) {
      showToast('Please upload a resume in your Profile before applying!', 'warning');
      return;
    }

    // Pessimistically trigger deck shift animation
    setDeck(prev => prev.filter(j => j.id !== jobId));
    if (drawerJob && drawerJob.id === jobId) {
      setDrawerJob(null);
    }

    try {
      const response = await api.post('/jobs/swipe/', {
        job_id: jobId,
        action: action
      });

      if (action === 'like') {
        if (response.data.applied) {
          showToast(`Successfully matched and applied! Chat unlocked!`, 'success');
        } else {
          showToast('Job listing liked successfully!', 'success');
        }
      } else if (action === 'save') {
        showToast('Saved listing to favorites.', 'success');
      } else if (action === 'dislike') {
        showToast('Passed job listing.', 'info');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to process swipe.', 'error');
    }
  }, [hasResume, drawerJob, showToast]);

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

  const handleUndo = async () => {
    try {
      const response = await api.post('/jobs/swipe/undo/');
      if (response.data.job) {
        const undoneJob = response.data.job;
        setDeck(prev => {
          if (prev.some(j => j.id === undoneJob.id)) return prev;
          return [undoneJob, ...prev];
        });
        showToast('Last swipe successfully undone.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'No recent swipes found to undo.', 'error');
    }
  };

  const handleResetSwipes = async () => {
    setResetting(true);
    try {
      const response = await api.post('/jobs/swipe/reset/');
      showToast(response.data.message || 'Swiping deck reset successfully!', 'success');
      await loadData();
    } catch (err) {
      showToast('Failed to reset swipes history.', 'error');
    } finally {
      setResetting(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (deck.length === 0 || drawerJob) return;
      const topJob = deck[0];
      if (e.key === 'ArrowLeft') {
        handleSwipe(topJob.id, 'dislike');
      } else if (e.key === 'ArrowRight') {
        handleSwipe(topJob.id, 'like');
      } else if (e.key === 'ArrowUp') {
        handleSwipe(topJob.id, 'save');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deck, drawerJob, handleSwipe]);

  const handleDrag = (event, info) => {
    setDragX(info.offset.x);
    setDragY(info.offset.y);
  };

  const handleDragEnd = (event, info, jobId) => {
    const swipeThreshold = 145;
    const swipeYThreshold = -125;

    setDragX(0);
    setDragY(0);

    if (info.offset.x > swipeThreshold) {
      handleSwipe(jobId, 'like');
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe(jobId, 'dislike');
    } else if (info.offset.y < swipeYThreshold) {
      handleSwipe(jobId, 'save');
    }
  };

  const likeOpacity = Math.max(0, Math.min(1, dragX / 145));
  const nopeOpacity = Math.max(0, Math.min(1, -dragX / 145));
  const saveOpacity = Math.max(0, Math.min(1, -dragY / 125));

  if (loading) {
    return (
      <PageTransition className="min-h-[85vh] flex flex-col items-center justify-center py-10 px-4">
        <div className="w-full max-w-sm h-[540px] bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="space-y-6">
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-3 flex-grow">
                <div className="h-4 rounded-md w-1/3 animate-shimmer" />
                <div className="h-7 rounded-md w-3/4 animate-shimmer" />
                <div className="h-4 rounded-md w-1/2 animate-shimmer" />
              </div>
              <div className="w-12 h-12 rounded-2xl shrink-0 animate-shimmer" />
            </div>
            <div className="space-y-3 pt-6 border-t border-white/5">
              <div className="h-3.5 rounded w-5/6 animate-shimmer" />
              <div className="h-3.5 rounded w-full animate-shimmer" />
              <div className="h-3.5 rounded w-2/3 animate-shimmer" />
            </div>
            <div className="pt-4 space-y-2">
              <div className="h-3 rounded w-1/4 animate-shimmer" />
              <div className="flex gap-2">
                <div className="h-6 w-16 rounded animate-shimmer" />
                <div className="h-6 w-20 rounded animate-shimmer" />
                <div className="h-6 w-14 rounded animate-shimmer" />
              </div>
            </div>
          </div>
          <div className="h-10 rounded-xl w-full animate-shimmer mt-6" />
        </div>
      </PageTransition>
    );
  }

  const activeCard = deck[0];

  return (
    <PageTransition className="min-h-[85vh] relative flex flex-col items-center justify-center py-12 px-4 overflow-hidden">
      {/* Background spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-[450px] h-[450px] bg-cyan-600/10 rounded-full blur-[120px] -z-10 animate-pulse" />

      {deck.length === 0 ? (
        <div className="text-center p-8 sm:p-10 bg-slate-950/80 border border-violet-500/20 rounded-3xl max-w-sm w-full backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 flex items-center justify-center text-white">
            <Sparkles className="animate-spin duration-[10000ms]" size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Deck Completed</h3>
            <p className="text-slate-400 text-xs mt-2 leading-relaxed font-semibold">
              You've swiped through all matching roles. Refreshes will poll the seeding catalog.
            </p>
          </div>
          
          {!hasResume && (
            <div className="p-4 bg-amber-950/20 border border-amber-500/20 rounded-2xl text-xxs text-amber-400 text-left flex items-start space-x-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Missing Resume: </span>
                Upload your CV to apply by swiping right.
                <Link to="/profile" className="text-white underline font-extrabold block mt-2 hover:text-slate-200">
                  Upload Resume &rarr;
                </Link>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleResetSwipes}
              disabled={resetting}
              className="flex items-center justify-center space-x-2 py-3.5 px-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl text-xs font-extrabold transition-all shadow-lg shadow-violet-500/10 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
            >
              {resetting ? <Loader2 size={14} className="animate-spin" /> : <span>Reset Deck & Reswipe</span>}
            </button>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/profile"
                className="flex items-center justify-center py-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-2xl text-xs font-bold transition-all border border-white/10 active:scale-95 text-center uppercase tracking-wider"
              >
                Profile
              </Link>
              <button
                onClick={handleUndo}
                className="flex items-center justify-center space-x-1.5 py-3 border border-white/10 bg-white/5 hover:bg-white/10 text-slate-350 hover:text-white rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
              >
                <RotateCcw size={12} />
                <span>Undo</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full max-w-sm h-[640px] flex flex-col justify-between items-center">
          
          {/* Keyboard Shortcuts Notice */}
          <div className="hidden sm:flex items-center space-x-2 text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mb-4">
            <Keyboard size={12} />
            <span>Use Left/Right/Up Arrows to gesture swipe</span>
          </div>

          {/* Cards Stack */}
          <div className="relative w-full h-[500px]">
            <AnimatePresence>
              {deck.slice(0, 3).reverse().map((job, idx, arr) => {
                const isTop = idx === arr.length - 1;
                return (
                  <motion.div
                    key={job.id}
                    style={{
                      touchAction: 'none'
                    }}
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
                    className="absolute w-full h-full p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500/25 via-fuchsia-500/25 to-cyan-500/25 shadow-2xl"
                  >
                    {/* Inner Content Glass Box */}
                    <div className="w-full h-full bg-slate-950/95 backdrop-blur-2xl rounded-[23px] p-6 flex flex-col justify-between cursor-grab active:cursor-grabbing select-none relative overflow-hidden">
                      {/* Floating Gradient Spill */}
                      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-violet-600/10 to-transparent -z-10" />

                      {isTop && (
                        <>
                          <div 
                            style={{ opacity: likeOpacity }}
                            className="absolute top-8 left-8 border-4 border-emerald-500 text-emerald-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[-12deg] pointer-events-none z-30 tracking-wider shadow-lg bg-slate-950/90"
                          >
                            LIKE
                          </div>
                          <div 
                            style={{ opacity: nopeOpacity }}
                            className="absolute top-8 right-8 border-4 border-rose-500 text-rose-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 rotate-[12deg] pointer-events-none z-30 tracking-wider shadow-lg bg-slate-950/90"
                          >
                            NOPE
                          </div>
                          <div 
                            style={{ opacity: saveOpacity }}
                            className="absolute bottom-20 left-1/2 -translate-x-1/2 border-4 border-cyan-500 text-cyan-500 text-xl font-black uppercase rounded-xl px-4 py-1.5 pointer-events-none z-30 tracking-wider shadow-lg bg-slate-950/90"
                          >
                            SAVE
                          </div>
                        </>
                      )}

                      <div>
                        {/* Upper card row */}
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap gap-1.5">
                              <span className="inline-flex px-2 py-0.5 bg-violet-550/15 border border-violet-500/30 rounded-md text-[9px] font-black uppercase text-violet-400 tracking-wider">
                                {job.job_type}
                              </span>
                              <span className="inline-flex px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase text-emerald-400 tracking-wider">
                                99% Match
                              </span>
                            </div>
                            <h2 className="text-xl font-black text-white tracking-tight mt-3 leading-snug truncate">{job.title}</h2>
                            <p className="text-violet-400 text-xs font-bold mt-0.5 truncate">{job.company.name}</p>
                          </div>
                          <CompanyLogo company={job.company} className="w-12 h-12 shrink-0 shadow-lg" />
                        </div>

                        {/* Mid Meta details list */}
                        <div className="space-y-2 mt-6 border-t border-white/10 pt-4">
                          <div className="flex items-center space-x-2 text-xxs text-slate-400 font-semibold">
                            <MapPin size={13} className="text-slate-500" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-xxs text-slate-400 font-semibold">
                            <DollarSign size={13} className="text-slate-500" />
                            <span className="text-white font-extrabold">
                              {job.salary_min ? `$${job.salary_min.toLocaleString()}` : 'Negotiable'}
                              {job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xxs text-slate-400 font-semibold">
                            <Briefcase size={13} className="text-slate-500" />
                            <span className="capitalize">{job.employment_type.replace('_', ' ')}</span>
                          </div>
                        </div>

                        {/* Required Skills tags stack */}
                        <div className="mt-6 pt-3 border-t border-white/10">
                          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500">Required Skills</p>
                          <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-[85px] overflow-hidden">
                            {job.skills_required.slice(0, 4).map((skill) => (
                              <span key={skill} className="px-2.5 py-1 rounded bg-white/5 border border-white/5 text-slate-300 text-xxs font-bold">
                                {skill}
                              </span>
                            ))}
                            {job.skills_required.length > 4 && (
                              <span className="px-2 py-1 text-slate-500 text-xxs font-black">
                                +{job.skills_required.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Details expand clicker */}
                      <button
                        onClick={() => setDrawerJob(job)}
                        className="w-full flex flex-col items-center py-2 text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-violet-500 rounded-lg cursor-pointer"
                      >
                        <ChevronUp size={16} className="animate-bounce" />
                        <span className="text-[9px] font-extrabold uppercase tracking-widest mt-1">Swipe Up to details</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Swipe Buttons Row */}
          <div className="flex items-center space-x-5 z-10 pt-4">
            <button
              onClick={handleUndo}
              className="w-12 h-12 rounded-full bg-slate-900 border border-white/10 hover:border-white/20 hover:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-300 transition-all shadow-lg active:scale-90 cursor-pointer"
              title="Undo Last Swipe"
              aria-label="Undo Last Swipe"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => handleSwipe(activeCard.id, 'dislike')}
              className="w-15 h-15 rounded-full bg-slate-900 border border-rose-500/20 hover:border-rose-500/60 hover:bg-rose-950/20 flex items-center justify-center text-rose-500 shadow-xl hover:scale-105 active:scale-90 transition-all cursor-pointer"
              title="Pass (Left Arrow)"
              aria-label="Pass Job"
            >
              <X size={24} />
            </button>
            
            <button
              onClick={() => handleSwipe(activeCard.id, 'save')}
              className="w-13 h-13 rounded-full bg-slate-900 border border-cyan-500/25 hover:border-cyan-500/60 hover:bg-cyan-950/20 flex items-center justify-center text-cyan-400 shadow-lg hover:scale-105 active:scale-90 transition-all cursor-pointer"
              title="Favorite / Save (Up Arrow)"
              aria-label="Save Job"
            >
              <Star size={20} />
            </button>

            <button
              onClick={() => handleSwipe(activeCard.id, 'like')}
              className="w-15 h-15 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 flex items-center justify-center text-white shadow-xl shadow-indigo-650/30 hover:scale-105 active:scale-90 transition-all cursor-pointer"
              title="Apply Now (Right Arrow)"
              aria-label="Apply to Job"
            >
              <Heart size={24} className="fill-white" />
            </button>
          </div>

        </div>
      )}

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
              className="relative w-full max-w-lg bg-slate-950 border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white leading-tight truncate">{drawerJob.title}</h3>
                  <p className="text-violet-400 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
                </div>
                <button
                  onClick={() => setDrawerJob(null)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
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
                    <span key={skill} className="px-3 py-1 rounded-xl bg-white/5 border border-white/5 text-slate-350 text-xxs font-extrabold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* AI Skill Gap Widget */}
              <AiSkillGapWidget jobId={drawerJob.id} />

              {/* AI Tools Bar */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/10 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-white/10 text-violet-400 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
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
                    className="w-full sm:w-auto px-5 py-3 bg-slate-950 hover:bg-slate-900 border border-white/10 text-violet-400 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles size={12} />
                    <span>Practice Interview</span>
                  </button>
                </div>

                {coverLetter && (
                  <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in">
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
                      className="w-full p-4 rounded-xl bg-slate-950/70 border border-white/10 text-slate-300 text-xs leading-relaxed outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons inside drawer */}
              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => {
                    handleSwipe(drawerJob.id, 'dislike');
                    setDrawerJob(null);
                  }}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Pass
                </button>
                <button
                  onClick={() => {
                    handleSwipe(drawerJob.id, 'like');
                    setDrawerJob(null);
                  }}
                  className="px-7 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-550 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  <Heart size={14} className="fill-white" />
                  <span>Apply Now</span>
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
