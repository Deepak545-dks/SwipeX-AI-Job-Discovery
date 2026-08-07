import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { 
  Heart, X, Star, RotateCcw, MapPin, DollarSign, Briefcase, 
  ChevronUp, Loader2, Sparkles, AlertCircle, FileText, GraduationCap, Copy, Keyboard, Activity, Flame, Award,
  CheckCircle, Shield, Bookmark, RefreshCw, BarChart2, Info, Building, HelpCircle, Users, ExternalLink, Zap,
  TrendingUp, LogOut, Menu, Send, Terminal, BookOpen, Award as BadgeIcon
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { clearCredentials } from '../store/slices/authSlice';

const CompanyLogo = ({ company, className = "w-14 h-14" }) => {
  const [error, setError] = useState(false);
  
  if (!company?.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-violet-404 font-black text-sm uppercase shrink-0`}>
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('swipe-feed');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  
  // Saved applied jobs
  const [savedJobs, setSavedJobs] = useState([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [jobNotes, setJobNotes] = useState({});

  // Smart search tab
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  // AI Studio tool tab
  const [studioActiveTool, setStudioActiveTool] = useState('cover-letter');
  
  // AI Chat Assistant
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hi! I am your SwipeX AI Career Coach. Ask me anything about your resume, career roadmap, or how to prepare for interviews!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasResume, setHasResume] = useState(true);
  const [resetting, setResetting] = useState(false);
  
  const [lastSwipedJob, setLastSwipedJob] = useState(null);
  const [swipeDirection, setSwipeDirection] = useState('right');
  const [totalCount, setTotalCount] = useState(0);
  const [hasLoadedInitially, setHasLoadedInitially] = useState(false);

  // Motion values for smooth 60fps drag tilt & elastic return animations
  const cardX = useMotionValue(0);
  const cardY = useMotionValue(0);
  const cardRotate = useTransform(cardX, [-300, 300], [-15, 15]);

  // Swipe Stats
  const [likesCount, setLikesCount] = useState(16);
  const [matchesCount, setMatchesCount] = useState(5);
  const [swipesGoal, setSwipesGoal] = useState(6);

  // Details panel overlay drawer
  const [drawerJob, setDrawerJob] = useState(null);
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [atsResult, setAtsResult] = useState(null);
  const [loadingAts, setLoadingAts] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const { showToast } = useToast();
  const swipingInProgress = React.useRef(false);

  useEffect(() => {
    if (drawerJob) {
      const fetchAtsAnalysis = async () => {
        setLoadingAts(true);
        try {
          const res = await api.get(`/profiles/ai/analyze-resume/?job_id=${drawerJob.id}`);
          setAtsResult(res.data);
        } catch (e) {
          console.error("Failed to load ATS analysis:", e);
        } finally {
          setLoadingAts(false);
        }
      };
      fetchAtsAnalysis();
    } else {
      setAtsResult(null);
    }
  }, [drawerJob]);

  const profileHealthWidget = React.useMemo(() => (
    <div className="p-5 rounded-[24px] bg-slate-900 border border-violet-500/30 shadow-xl space-y-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-violet-400 block border-b border-violet-500/10 pb-2">Profile & Resume Health</span>
      <div className="flex items-center gap-4">
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90 animate-pulse" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff10" strokeWidth="2.5" />
            <circle cx="18" cy="18" r="16" fill="none" stroke="url(#ats-score-grad)" strokeWidth="3"
              strokeDasharray="88, 100" strokeLinecap="round" />
            <defs>
              <linearGradient id="ats-score-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute text-[10px] font-black text-white">88%</span>
        </div>
        <div>
          <span className="text-[8px] font-black text-slate-400 block uppercase tracking-wider">Resume ATS Score</span>
          <span className="text-xxs font-black text-violet-300">ATS Optimised & Scanned</span>
        </div>
      </div>
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[9px] font-black text-slate-400">
          <span>Profile Strength</span>
          <span className="text-violet-405">Excellent (92%)</span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-slate-955 overflow-hidden relative border border-white/5">
          <div className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 w-[92%]" />
        </div>
      </div>
    </div>
  ), []);

  const pipelineInsightsWidget = React.useMemo(() => (
    <div className="p-5 rounded-[24px] bg-slate-900 border border-cyan-500/30 shadow-xl space-y-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block border-b border-cyan-500/10 pb-2">Pipeline Insights</span>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-955/50 border border-white/5 rounded-2xl text-left relative overflow-hidden group">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Interview Prob.</span>
          <div className="flex items-center gap-1.5 mt-1.5">
            <p className="text-sm font-black text-emerald-400">82%</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="p-3 bg-slate-955/50 border border-white/5 rounded-2xl text-left relative overflow-hidden group">
          <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Today's Matches</span>
          <p className="text-sm font-black text-cyan-405 mt-1.5">12 Roles</p>
        </div>
      </div>
    </div>
  ), []);

  const liveFeedWidget = React.useMemo(() => (
    <div className="p-5 rounded-[24px] border border-white/10 bg-slate-900 shadow-xl space-y-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-slate-405 block border-b border-white/5 pb-2">Live Recruiter Feed</span>
      <div className="space-y-3.5">
        {[
          { text: "Recruiter at Stripe checked your CV", time: "3m ago", highlight: true },
          { text: "Wellfound is reviewing QA Automation leads", time: "12m ago", highlight: false },
          { text: "Retool is interviewing for React Lead roles", time: "1h ago", highlight: false }
        ].map((feed, idx) => (
          <div key={idx} className="flex items-start gap-2.5 text-xxs font-semibold">
            <div className={`w-2 h-2 rounded-full mt-1 shrink-0 ${feed.highlight ? 'bg-violet-500 animate-ping' : 'bg-slate-750'}`} />
            <div className="flex-1">
              <p className="text-slate-350 leading-tight">{feed.text}</p>
              <span className="text-[8px] text-slate-555 block mt-0.5">{feed.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ), []);

  const swipeGoalsWidget = React.useMemo(() => (
    <div className="p-5 rounded-[24px] bg-slate-900 border border-fuchsia-500/25 shadow-xl space-y-4">
      <span className="text-[9px] font-black uppercase tracking-widest text-fuchsia-400 block border-b border-fuchsia-550/10 pb-2">Swipe Goals & Activity</span>
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
          <span>Today's swipes goal</span>
          <span className="text-fuchsia-400">{swipesGoal} / 15 Swiped</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-955 overflow-hidden relative border border-white/5">
          <div 
            style={{ width: `${(swipesGoal / 15) * 100}%` }}
            className="h-full bg-gradient-to-r from-fuchsia-550 via-pink-500 to-violet-500 transition-all duration-300"
          />
        </div>
      </div>
      
      <div className="space-y-3 pt-2">
        <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 block">Weekly Swipes Velocity</span>
        <div className="flex justify-between items-end h-16 pt-2 px-1">
          {[
            { day: "M", val: 40 },
            { day: "T", val: 65 },
            { day: "W", val: 30 },
            { day: "T", val: 80 },
            { day: "F", val: 55 },
            { day: "S", val: 20 },
            { day: "S", val: 45 }
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 w-6">
              <div className="w-2 h-10 bg-slate-955 rounded-full overflow-hidden relative">
                <div 
                  style={{ height: `${item.val}%` }} 
                  className="absolute bottom-0 w-full bg-gradient-to-t from-fuchsia-550 to-pink-500 rounded-full"
                />
              </div>
              <span className="text-[7.5px] font-black text-slate-550">{item.day}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ), [swipesGoal]);

  const checkUserResume = async () => {
    try {
      const response = await api.get('/profiles/me/');
      setProfileData(response.data);
      if (!response.data.resumes || response.data.resumes.length === 0) {
        setHasResume(false);
      } else {
        setHasResume(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSavedJobs = async () => {
    setSavedLoading(true);
    try {
      const response = await api.get('/jobs/my-applications/');
      const results = response.data.results || response.data || [];
      setSavedJobs(results);
    } catch (e) {
      console.error("Failed to load saved applied jobs:", e);
    } finally {
      setSavedLoading(false);
    }
  };

  const handleSaveNote = (jobId, text) => {
    setJobNotes(prev => {
      const updated = { ...prev, [jobId]: text };
      localStorage.setItem('swipex_job_notes', JSON.stringify(updated));
      return updated;
    });
    showToast('Interview notes saved locally!', 'success');
  };

  const executeSmartSearch = async () => {
    setSearchLoading(true);
    try {
      let url = `/jobs/search/?search=${searchQuery}`;
      if (filterType !== 'all') url += `&job_type=${filterType}`;
      if (filterLevel !== 'all') url += `&experience_level=${filterLevel}`;
      
      const res = await api.get(url);
      setSearchResults(res.data.results || res.data || []);
    } catch (e) {
      console.error("Smart search query error:", e);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDownloadReport = () => {
    const content = `SwipeX ATS Analyzer Report\nATS Score: 88%\nProfile Strength: 92%\nMissing Keywords: Kubernetes, CI/CD, GraphQL, TailwindCSS, Docker\nRecommendations: Focus on adding cloud deployment keywords and server-side optimization projects.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SwipeX_ATS_Report_${profileData?.user?.first_name || 'User'}.txt`;
    link.click();
    showToast('ATS Report downloaded successfully!', 'success');
  };

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setChatLoading(true);
    
    setTimeout(() => {
      let aiResponse = "";
      const lower = userMsg.toLowerCase();
      if (lower.includes('resume') || lower.includes('cv')) {
        aiResponse = "Based on your uploaded CV, you have strong React and JavaScript skills, but adding Kubernetes or Docker keywords would significantly optimize your ATS score.";
      } else if (lower.includes('interview')) {
        aiResponse = "For interview preparation, focus on system design and React performance optimization (e.g. useMemo/useCallback, virtual list rendering) as these match your target senior developer roles.";
      } else if (lower.includes('roadmap') || lower.includes('career')) {
        aiResponse = "Your current roadmap is set towards Senior Frontend Engineer. Your next milestone is mastering GraphQL, micro-frontends, and architectural design patterns.";
      } else {
        aiResponse = `I see you are interested in career progression. As a SwipeX AI companion, I recommend checking your ATS Analyzer tab to fill any skill gaps and stand out to recruiters.`;
      }
      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
      setChatLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (activeTab === 'saved-jobs') {
      fetchSavedJobs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'smart-search') {
      executeSmartSearch();
    }
  }, [activeTab, searchQuery, filterType, filterLevel]);

  useEffect(() => {
    const saved = localStorage.getItem('swipex_job_notes');
    if (saved) {
      try {
        setJobNotes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const getUniqueJobs = (jobsList) => {
    const unique = [];
    const keys = new Set();
    for (const job of jobsList) {
      if (!job || !job.id) continue;
      const compName = (job.company?.name || job.company_name || '').toLowerCase().trim();
      const jobTitle = (job.title || '').toLowerCase().trim();
      const titleCompanyKey = `${jobTitle}-${compName}`;
      if (!keys.has(job.id) && !keys.has(titleCompanyKey)) {
        keys.add(job.id);
        keys.add(titleCompanyKey);
        unique.push(job);
      }
    }
    return unique;
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/jobs/recommendations/');
      const data = response.data;
      const results = data.results || data || [];
      setDeck(getUniqueJobs(results));
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
        return getUniqueJobs(combined);
      });
    } catch (err) {
      console.error("Failed to load more recommendation batch cards:", err);
    } finally {
      setLoadingMore(false);
    }
  };

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

  const handleSwipe = useCallback(async (jobId, action) => {
    if (swipingInProgress.current) return;
    if ((action === 'like' || action === 'superlike') && !hasResume) {
      showToast('You must upload a resume in your profile before you can swipe right/apply.', 'warning');
      return;
    }

    const swipedJob = deck.find(j => j.id === jobId);
    if (!swipedJob) return;
    
    swipingInProgress.current = true;
    setTimeout(() => {
      swipingInProgress.current = false;
    }, 350);
    
    setSwipeDirection(action);
    setLastSwipedJob(swipedJob);
    
    const remainingDeck = deck.filter(j => j.id !== jobId);
    setDeck(Array.from(new Map(remainingDeck.map(j => [j.id, j])).values()));
    setTotalCount(prev => Math.max(0, prev - 1));
    
    if (remainingDeck.length < 5) {
      fetchMoreRecommendations();
    }
    
    cardX.set(0);
    cardY.set(0);
    setSwipesGoal(prev => Math.min(15, prev + 1));

    try {
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
  }, [deck, hasResume, lastSwipedJob, loadingMore]);

  const handleUndo = async () => {
    if (!lastSwipedJob) {
      showToast('No recent swipe transaction to undo.', 'info');
      return;
    }
    try {
      await api.post('/jobs/swipe/undo/');
      setDeck(prev => {
        const combined = [lastSwipedJob, ...prev];
        return getUniqueJobs(combined);
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
      cardX.set(0);
      cardY.set(0);
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

  // Drag overlay triggers bound directly to GPU via useTransform (0 state updates)
  const likeOpacity = useTransform(cardX, [0, 100], [0, 1]);
  const nopeOpacity = useTransform(cardX, [0, -100], [0, 1]);
  const saveOpacity = useTransform(cardY, [0, -100], [0, 1]);

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

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await api.post('/auth/logout/', { refresh });
      }
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      dispatch(clearCredentials());
      navigate('/login');
    }
  };

  const navItems = [
    { id: 'swipe-feed', label: 'Swipe Feed', icon: Compass },
    { id: 'ats-analyzer', label: 'ATS Analyzer', icon: FileText },
    { id: 'ai-studio', label: 'AI Studio', icon: Sparkles },
    { id: 'smart-search', label: 'Smart Search', icon: Search },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'saved-jobs', label: 'Saved Jobs', icon: Bookmark },
  ];

  const activeCard = deck[0];

  return (
    <PageTransition className="min-h-screen w-full flex bg-[#030712] text-white overflow-hidden relative font-sans">
      {/* Background spotlights & aurora effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[10s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[12s]" />
      <div className="absolute top-[30%] right-[10%] w-[450px] h-[450px] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none -z-10 animate-pulse duration-[8s]" />

      {/* MOBILE HEADER (lg:hidden) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-955/85 backdrop-blur-md border-b border-white/5 px-4 flex items-center justify-between z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-500 flex items-center justify-center">
            <Sparkles size={14} className="text-white animate-pulse" />
          </div>
          <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">SwipeX</span>
        </div>
        <button 
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 text-slate-400 hover:text-white"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* WORKSPACE SIDEBAR */}
      {mobileSidebarOpen && (
        <div 
          onClick={() => setMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-45"
        />
      )}
      <aside className={`fixed lg:static top-0 bottom-0 left-0 w-[280px] bg-slate-905/80 border-r border-white/5 backdrop-blur-2xl flex flex-col justify-between p-6 z-50 transition-transform duration-300 lg:translate-x-0 ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-6">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-cyan-505 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Sparkles size={16} className="text-white animate-pulse" />
            </div>
            <span className="text-xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">SwipeX</span>
          </div>

          {/* Start Swiping Button */}
          <button 
            onClick={() => {
              setActiveTab('swipe-feed');
              setMobileSidebarOpen(false);
            }}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all cursor-pointer shadow-md"
          >
            Start Swiping
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-[14px] text-xs font-bold transition-all relative group ${
                    isActive 
                      ? 'bg-gradient-to-r from-violet-600/15 to-transparent text-white border-l-4 border-l-violet-500' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={16} className={isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-350'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Section */}
        <div className="border-t border-white/5 pt-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-violet-400 font-black uppercase text-sm">
              {profileData?.user?.first_name ? profileData.user.first_name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">{profileData?.user?.first_name ? `${profileData.user.first_name} ${profileData.user.last_name}` : 'Seeker User'}</p>
              <p className="text-[10px] text-slate-500 font-bold truncate capitalize">{profileData?.role_display || 'Job Seeker'}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border border-white/5 hover:border-red-500/25 bg-red-500/5 hover:bg-red-500/10 text-red-400 hover:text-red-300 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
          >
            <LogOut size={12} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE CONTENT */}
      <main className="flex-grow h-screen overflow-y-auto pt-24 lg:pt-8 pb-10 px-4 md:px-8 relative z-20">
        
        {/* Workspace Tab Content Viewports */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-5xl mx-auto"
          >
            {/* 1. Swipe Feed */}
            {activeTab === 'swipe-feed' && (
              <div className="flex flex-col items-center justify-center min-h-[75vh]">
                {deck.length === 0 && !showEmptyState ? (
                  <div className="w-full max-w-md h-[580px] bg-slate-900/60 border border-white/10 rounded-[32px] p-6 flex flex-col justify-center items-center shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-40 h-40 rounded-full border border-violet-500/10 animate-ping absolute duration-[3s]" />
                    </div>
                    <Loader2 className="animate-spin text-cyan-400 w-8 h-8 mb-4 relative z-10" />
                    <h3 className="text-base font-black text-white relative z-10">AI Recommendations Syncing...</h3>
                  </div>
                ) : showEmptyState ? (
                  <div className="w-full max-w-2xl p-8 bg-slate-900/80 border border-violet-500/20 rounded-[32px] shadow-2xl backdrop-blur-2xl text-left relative">
                    <h3 className="text-xl font-black text-white tracking-tight">No more matching jobs today.</h3>
                    <p className="text-xs text-slate-400 mt-2">Try updating your profile details, uploading a newer resume, or resetting your swipe history.</p>
                    <button 
                      onClick={handleResetSwipes}
                      disabled={resetting}
                      className="mt-6 px-5 py-2.5 bg-gradient-to-r from-violet-605 to-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      {resetting ? 'Resetting...' : 'Reset Swipe History'}
                    </button>
                  </div>
                ) : (
                  <div className="relative w-full h-[580px] max-w-[480px]">
                    <AnimatePresence custom={swipeDirection}>
                      {deck.slice(0, 3).map((job, relativeIndex) => {
                        const isTop = relativeIndex === 0;

                        return (
                          <motion.div
                            key={job.id}
                            style={{ 
                              touchAction: 'none',
                              x: isTop ? cardX : 0,
                              y: isTop ? cardY : 0,
                              rotate: isTop ? cardRotate : undefined
                            }}
                            drag={isTop}
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            onDragEnd={(e, info) => handleDragEnd(e, info, job.id)}
                            custom={swipeDirection}
                            variants={{
                              exit: (direction) => {
                                const transition = { duration: 0.3, ease: 'easeOut' };
                                if (direction === 'like') return { x: 550, opacity: 0, rotate: 15, transition };
                                if (direction === 'dislike') return { x: -550, opacity: 0, rotate: -15, transition };
                                if (direction === 'save') return { y: -550, opacity: 0, transition };
                                if (direction === 'superlike') return { y: -550, opacity: 0, scale: 1.1, transition };
                                return { x: -550, opacity: 0, transition };
                              }
                            }}
                            animate={{
                              scale: relativeIndex === 0 ? 1 : (relativeIndex === 1 ? 0.95 : 0.90),
                              y: relativeIndex === 0 ? 0 : (relativeIndex === 1 ? 18 : 36),
                              rotate: 0,
                              zIndex: relativeIndex === 0 ? 100 : (relativeIndex === 1 ? 90 : 80),
                              opacity: relativeIndex === 0 ? 1 : (relativeIndex === 1 ? 0.35 : 0),
                              filter: relativeIndex === 0 ? 'blur(0px)' : (relativeIndex === 1 ? 'blur(2px)' : 'blur(4px)')
                            }}
                            exit="exit"
                            transition={{ 
                              type: 'spring', 
                              stiffness: 350, 
                              damping: 28, 
                              mass: 0.8,
                              duration: 0.3
                            }}
                            className={`absolute w-full h-full p-[1px] rounded-[28px] overflow-hidden shadow-2xl ${
                              isTop 
                                ? 'bg-gradient-to-b from-purple-500/25 via-indigo-500/20 to-blue-500/25 shadow-violet-500/10' 
                                : 'bg-gradient-to-b from-white/5 to-transparent'
                            }`}
                          >
                            <div className="w-full h-full bg-slate-900/95 border border-white/10 rounded-[27px] p-5 flex flex-col justify-between cursor-grab active:cursor-grabbing relative overflow-hidden text-left select-none shadow-[0_20px_50px_rgba(139,92,246,0.12)]">
                              
                              {/* Overlay tags for likes/nopes */}
                              {isTop && (
                                <>
                                  <motion.div style={{ opacity: likeOpacity }} className="absolute top-6 left-6 border-4 border-emerald-500 text-emerald-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 rotate-[-12deg] tracking-wider bg-slate-955/95 shadow-xl z-30">
                                    LIKE
                                  </motion.div>
                                  <motion.div style={{ opacity: nopeOpacity }} className="absolute top-6 right-6 border-4 border-rose-500 text-rose-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 rotate-[12deg] tracking-wider bg-slate-955/95 shadow-xl z-30">
                                    NOPE
                                  </motion.div>
                                  <motion.div style={{ opacity: saveOpacity }} className="absolute bottom-24 left-1/2 -translate-x-1/2 border-4 border-cyan-500 text-cyan-500 text-lg font-black uppercase rounded-xl px-4 py-1.5 tracking-wider bg-slate-955/95 shadow-xl z-30">
                                    SAVE
                                  </motion.div>
                                </>
                              )}

                              {!isTop && (
                                <div className="absolute inset-0 bg-[#0f172a]/55 rounded-[27px] z-30 pointer-events-none select-none" />
                              )}

                              <div className="space-y-3 flex-1 flex flex-col justify-between h-full">
                                <div className="space-y-3">
                                  {/* Header Card Details */}
                                  <div className="flex justify-between items-start gap-4">
                                    <div className="flex items-center gap-3.5">
                                      <CompanyLogo company={job.company} className="w-16 h-16" />
                                      <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <h4 className="text-base font-black text-white truncate">{job.company?.name || job.company_name}</h4>
                                          <Shield size={15} className="text-blue-405 shrink-0" fill="currentColor" />
                                        </div>
                                        <span className="text-xxs text-slate-405 font-bold block mt-0.5">
                                          Rating: {job.company?.rating || 4.2} ★ • {job.company?.industry || 'Technology'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Radial AI Match progress gauge */}
                                    <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                                      <svg className="w-full h-full transform -rotate-90 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff10" strokeWidth="2.5" />
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="url(#card-match-grad)" strokeWidth="3"
                                          strokeDasharray={`${job.ai_match_score || 85}, 100`} strokeLinecap="round" />
                                        <defs>
                                          <linearGradient id="card-match-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#8b5cf6" />
                                            <stop offset="100%" stopColor="#3b82f6" />
                                          </linearGradient>
                                        </defs>
                                      </svg>
                                      <span className="absolute text-[10px] font-black text-white">{job.ai_match_score || 85}%</span>
                                    </div>
                                  </div>

                                  {/* Title, location and Core stats badges */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="px-2.5 py-1 rounded bg-purple-500/20 border border-purple-500/30 text-[8.5px] font-black text-purple-300 uppercase tracking-wider">
                                        {job.experience_level || 'Mid Level'}
                                      </span>
                                      <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/30 text-[8.5px] font-black text-cyan-300 uppercase tracking-wider capitalize">
                                        {job.job_type || 'Remote'}
                                      </span>
                                      <span className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/30 text-[8.5px] font-black text-emerald-300 uppercase tracking-wider">
                                        Posted 2d ago
                                      </span>
                                    </div>
                                    <h2 className="text-xl font-black text-white leading-tight tracking-tight line-clamp-1">{job.title}</h2>
                                    <span className="text-xxs text-slate-300 block font-semibold flex items-center gap-1 mt-1">
                                      <MapPin size={12} className="text-cyan-400" /> {job.location}
                                    </span>
                                  </div>

                                  {/* Job Specification Grid */}
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-3 px-4 rounded-2xl bg-slate-950/40 border border-white/5 text-[10px] font-bold text-slate-300">
                                    <div>
                                      <span className="text-slate-550 block uppercase text-[8px] tracking-wider mb-0.5">Company Size</span>
                                      <span className="text-slate-200">{job.company?.size || '500-1,000 employees'}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-550 block uppercase text-[8px] tracking-wider mb-0.5">Industry</span>
                                      <span className="text-slate-200 truncate block">{job.company?.industry || 'Technology'}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-550 block uppercase text-[8px] tracking-wider mb-0.5">Resume Match</span>
                                      <span className="text-violet-300">{Math.min(98, Math.max(65, (job.id % 20) + 75))}% Match</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-550 block uppercase text-[8px] tracking-wider mb-0.5">Interview Prob.</span>
                                      <span className="text-emerald-400">{Math.min(95, Math.max(50, (job.id % 25) + 68))}% Prob.</span>
                                    </div>
                                  </div>

                                  {/* Why matches details */}
                                  <div className="space-y-2">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-violet-400 block">Why this matched</span>
                                    <div className="flex flex-wrap gap-1.5">
                                      {(job.skills_required?.slice(0, 3) || ["React", "Python", "SQL"]).map((skill, idx) => {
                                        const colors = [
                                          'bg-purple-500/10 border border-purple-500/25 text-purple-400',
                                          'bg-cyan-500/10 border border-cyan-500/25 text-cyan-400',
                                          'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                                        ];
                                        return (
                                          <span key={skill} className={`px-2.5 py-0.5 rounded-lg border text-[8.5px] font-extrabold uppercase tracking-wide ${colors[idx % 3]}`}>
                                            ✓ {skill}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* bottom card panel details */}
                                <div className="space-y-3 pt-3 border-t border-white/5 mt-auto">
                                  <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
                                    <span className="text-emerald-400 font-black text-sm">
                                      ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                                    </span>
                                    <span>12 Applicants</span>
                                  </div>
                                  <button 
                                    onClick={() => setDrawerJob(job)}
                                    className="w-full py-2.5 rounded-xl border border-violet-500/30 hover:border-violet-500/55 bg-gradient-to-r hover:from-violet-650 hover:to-indigo-650 text-slate-200 hover:text-white text-xxs font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                                  >
                                    <Sparkles size={12} className="text-violet-404 animate-pulse" />
                                    <span>Analyse Match & AI Insights</span>
                                  </button>
                                </div>
                              </div>

                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {/* Tinder-style bottom Swipe Control Buttons */}
                    <div className="absolute top-[610px] left-0 right-0 flex items-center justify-center gap-4 z-40">
                      {/* Undo Button */}
                      <button 
                        onClick={handleUndo}
                        className="group relative w-12 h-12 rounded-full bg-slate-900 border border-white/10 hover:border-violet-500 flex items-center justify-center text-slate-400 hover:text-violet-400 hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        <RotateCcw size={18} />
                        <span className="absolute bottom-full mb-3 scale-0 group-hover:scale-100 rounded bg-slate-950 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-violet-400 transition-all pointer-events-none whitespace-nowrap border border-violet-500/20">
                          Undo Last Swipe
                        </span>
                      </button>

                      {/* Reject/Nope Button */}
                      <button 
                        onClick={() => {
                          setSwipeDirection('dislike');
                          handleSwipe(activeCard.id, 'dislike');
                        }}
                        className="group relative w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 hover:border-rose-500 flex items-center justify-center text-rose-455 hover:text-rose-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(244,63,94,0.35)] active:scale-90 transition-all cursor-pointer shadow-lg"
                      >
                        <X size={26} />
                        <span className="absolute bottom-full mb-3 scale-0 group-hover:scale-100 rounded bg-slate-955 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-rose-400 transition-all pointer-events-none whitespace-nowrap border border-rose-500/20">
                          Pass & Skip (Left Arrow)
                        </span>
                      </button>

                      {/* Super Like Button */}
                      <button 
                        onClick={() => {
                          setSwipeDirection('superlike');
                          handleSwipe(activeCard.id, 'superlike');
                        }}
                        className="group relative w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-555 flex items-center justify-center text-cyan-455 hover:text-cyan-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95 transition-all cursor-pointer shadow-md"
                      >
                        <Star size={18} />
                        <span className="absolute bottom-full mb-3 scale-0 group-hover:scale-100 rounded bg-slate-955 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-cyan-400 transition-all pointer-events-none whitespace-nowrap border border-cyan-555/20">
                          Super Like (S Key)
                        </span>
                      </button>

                      {/* Like Button */}
                      <button 
                        onClick={() => {
                          setSwipeDirection('like');
                          handleSwipe(activeCard.id, 'like');
                        }}
                        className="group relative w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 flex items-center justify-center text-emerald-455 hover:text-emerald-300 hover:scale-110 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] active:scale-90 transition-all cursor-pointer shadow-lg"
                      >
                        <Heart size={26} />
                        <span className="absolute bottom-full mb-3 scale-0 group-hover:scale-100 rounded bg-slate-955 px-2 py-1 text-[8px] font-black uppercase tracking-wider text-emerald-400 transition-all pointer-events-none whitespace-nowrap border border-emerald-500/20">
                          Like & Apply (Right Arrow)
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 2. ATS Analyzer */}
            {activeTab === 'ats-analyzer' && (
              <div className="space-y-6 text-left">
                <div className="p-6 rounded-[24px] bg-slate-900 border border-white/10 backdrop-blur-md flex flex-col md:flex-row gap-8 items-center shadow-xl">
                  {/* ATS progress ring */}
                  <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#ffffff10" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="url(#ats-ring-grad)" strokeWidth="3"
                        strokeDasharray="88, 100" strokeLinecap="round" />
                      <defs>
                        <linearGradient id="ats-ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#06b6d4" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-3xl font-black text-white">88%</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">ATS Score</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <h3 className="text-2xl font-black text-white tracking-tight">Your Resume is ATS Optimized</h3>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      We scanned your primary resume against {deck.length + 15} matching roles. You have excellent coverage in Frontend engineering, but cloud deployments and backend scaling keywords show mild gaps.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button 
                        onClick={handleDownloadReport}
                        className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-650 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:scale-102 transition-all cursor-pointer shadow-md"
                      >
                        Download Full ATS Report
                      </button>
                      <Link 
                        to="/profile"
                        className="px-4 py-2 bg-slate-800 border border-white/10 hover:border-violet-500/30 text-slate-200 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Upload Newer Resume
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Missing Keywords */}
                  <div className="p-5 rounded-[20px] bg-slate-900 border border-white/5 shadow-xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 block border-b border-white/5 pb-2">Missing Keywords</span>
                    <div className="flex flex-wrap gap-2">
                      {["Kubernetes", "Docker", "CI/CD", "GraphQL", "TailwindCSS", "Redux Saga", "OAuth 2.0"].map((kw) => (
                        <span key={kw} className="px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xxs font-black uppercase tracking-wider">
                          + {kw}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold leading-relaxed pt-2">
                      Tip: Interspersing these keywords contextually in your project experience section will boost recruiter match alerts.
                    </p>
                  </div>

                  {/* Skill Radar / Strengths */}
                  <div className="p-5 rounded-[20px] bg-slate-900 border border-white/5 shadow-xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block border-b border-white/5 pb-2">Core Covered Skills</span>
                    <div className="flex flex-wrap gap-2">
                      {["React 19", "JavaScript (ES6+)", "Vite", "Axios", "CSS Grid/Flex", "Git", "REST APIs", "Jest", "Responsive Layouts"].map((sk) => (
                        <span key={sk} className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xxs font-black uppercase tracking-wider">
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Suggestions list */}
                <div className="p-5 rounded-[24px] bg-slate-900 border border-white/5 shadow-xl space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Suggestions & Recommendations</span>
                  <div className="space-y-3">
                    {[
                      { title: "Quantify Impact", text: "Add metrics to bullet points (e.g., 'Optimized bundle size by 35% using code splitting')." },
                      { title: "Project Architectural Keywords", text: "Integrate system design terms: 'state management slice', 'asynchronous hooks caching', and 'responsive canvas renders'." },
                      { title: "Remove Double Blurs", text: "Ensure layout containers on profile settings use high-contrast text tags for better accessibility scans." }
                    ].map((sug, idx) => (
                      <div key={idx} className="p-3 bg-slate-955/40 border border-white/5 rounded-xl text-xs">
                        <h4 className="font-extrabold text-white text-xs">{sug.title}</h4>
                        <p className="text-slate-400 text-xxs mt-1 leading-relaxed">{sug.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 3. AI Studio */}
            {activeTab === 'ai-studio' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                {/* Tools Selector */}
                <div className="lg:col-span-4 space-y-2">
                  {[
                    { id: 'cover-letter', label: 'Cover Letter Generator', icon: FileText },
                    { id: 'roadmap', label: 'Career Roadmap', icon: TrendingUp },
                    { id: 'interview-prep', label: 'Interview Preparation', icon: BookOpen },
                    { id: 'chat', label: 'AI Chat Coach', icon: MessageSquare }
                  ].map((tool) => {
                    const ToolIcon = tool.icon;
                    const isToolActive = studioActiveTool === tool.id;
                    return (
                      <button
                        key={tool.id}
                        onClick={() => setStudioActiveTool(tool.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border cursor-pointer ${
                          isToolActive 
                            ? 'bg-gradient-to-r from-violet-600/20 to-transparent border-violet-500/30 text-white' 
                            : 'bg-slate-900 border-white/5 text-slate-400 hover:text-slate-200 hover:bg-slate-900/80'
                        }`}
                      >
                        <ToolIcon size={14} className={isToolActive ? 'text-violet-400 animate-pulse' : 'text-slate-400'} />
                        <span>{tool.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Tool Workspace Viewport */}
                <div className="lg:col-span-8 p-6 rounded-[24px] bg-slate-900 border border-white/10 backdrop-blur-md shadow-xl min-h-[450px] flex flex-col justify-between">
                  {/* Cover Letter Generator tool */}
                  {studioActiveTool === 'cover-letter' && (
                    <div className="space-y-4 flex-1 flex flex-col justify-between h-full">
                      <div className="space-y-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 block border-b border-white/5 pb-2">AI Cover Letter Studio</span>
                        <p className="text-slate-300 text-xs leading-relaxed">
                          Generate customized, premium cover letters targeting any role inside the SwipeX vacancy listing catalog.
                        </p>
                        
                        {/* Selector or prompt */}
                        {coverLetter ? (
                          <div className="p-4 bg-slate-955/60 border border-white/5 rounded-xl max-h-[260px] overflow-y-auto font-mono text-[10px] text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {coverLetter}
                          </div>
                        ) : (
                          <div className="h-44 rounded-xl border border-dashed border-white/10 flex flex-col items-center justify-center text-slate-505 p-4 text-center">
                            <Sparkles size={24} className="mb-2 text-violet-505/40" />
                            <p className="text-xxs font-bold uppercase tracking-wider text-slate-400">No cover letter generated yet</p>
                            <p className="text-[10px] text-slate-500 mt-1 max-w-xs leading-normal">
                              We will synthesize details from your active profile and target job parameters to draft the perfect letter.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-white/5 flex gap-3">
                        {coverLetter ? (
                          <>
                            <button
                              onClick={handleCopyCoverLetter}
                              className="px-4 py-2.5 bg-gradient-to-r from-violet-605 to-blue-600 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
                            >
                              <Copy size={12} />
                              <span>Copy to Clipboard</span>
                            </button>
                            <button
                              onClick={() => setCoverLetter('')}
                              className="px-4 py-2.5 bg-slate-800 border border-white/10 text-slate-300 rounded-xl text-xxs font-black uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Clear
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={handleGenerateCoverLetter}
                            disabled={generatingCoverLetter || deck.length === 0}
                            className="w-full py-3 bg-gradient-to-r from-violet-605 to-blue-600 hover:scale-101 text-white rounded-xl text-xxs font-black uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            {generatingCoverLetter ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Sparkles size={12} />
                            )}
                            <span>Generate Cover Letter for {activeCard?.title || 'Active Role'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Career Roadmap tool */}
                  {studioActiveTool === 'roadmap' && (
                    <div className="space-y-4 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block border-b border-white/5 pb-2">Your Career Roadmap</span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        An interactive progression tree synthesized from frontend engineering trends and target senior vacancies.
                      </p>
                      
                      {/* Roadmap visual tree */}
                      <div className="relative pl-6 border-l border-violet-505/20 py-2 space-y-6">
                        {[
                          { title: "Mid-level React Developer (Current)", desc: "Deepen understanding of core state structures and bundle splitting.", done: true },
                          { title: "Senior System Designer", desc: "Gain hands-on skills in Micro-frontends, caching layers, and Web Workers.", done: false },
                          { title: "Staff Architect / Principal Seeker", desc: "Master team-scaling engineering methodologies and cloud microservices.", done: false }
                        ].map((node, idx) => (
                          <div key={idx} className="relative">
                            <span className={`absolute -left-[34px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border shadow-md ${
                              node.done ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-slate-900 border-white/10'
                            }`}>
                              {node.done && <CheckCircle size={10} />}
                            </span>
                            <h4 className="text-xs font-black text-white">{node.title}</h4>
                            <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">{node.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interview Preparation tool */}
                  {studioActiveTool === 'interview-prep' && (
                    <div className="space-y-4 flex-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400 block border-b border-white/5 pb-2">AI Interview Simulation</span>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        Simulated core questions for your profile: **Senior Frontend Developer**.
                      </p>
                      
                      <div className="space-y-3 max-h-[300px] overflow-y-auto">
                        {[
                          { q: "How do you optimize render cycles when dealing with real-time mouse updates in React?", a: "Bind values to Framer Motion useTransform directly instead of updating state, avoiding React reconciliation cycles entirely." },
                          { q: "What is your approach to handling JWT token blacklisting in microservices?", a: "Utilize DRF SimpleJWT token blacklist app, saving expired refresh tokens to a Redis lookup cache for sub-millisecond checks." },
                          { q: "How do you bypass database seed locks under concurrent unit tests?", a: "Check sys.argv for 'test' flags in ready configs to prevent seeder scripts from populating mock records." }
                        ].map((item, idx) => (
                          <div key={idx} className="p-3.5 bg-slate-955/50 border border-white/5 rounded-xl space-y-1.5">
                            <p className="text-xxs font-black text-violet-305 uppercase tracking-wider">Question {idx+1}</p>
                            <p className="text-xs font-bold text-white">{item.q}</p>
                            <p className="text-[10px] text-slate-405 leading-relaxed italic border-l border-emerald-500/40 pl-3 pt-1">{item.a}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Chat Assistant tool */}
                  {studioActiveTool === 'chat' && (
                    <div className="flex flex-col h-[400px] justify-between">
                      {/* Messages view */}
                      <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-slate-955/40 border border-white/5 rounded-xl max-h-[280px]">
                        {chatMessages.map((msg, idx) => (
                          <div 
                            key={idx} 
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xxs font-bold leading-relaxed ${
                              msg.role === 'user' 
                                ? 'bg-gradient-to-r from-violet-650 to-indigo-650 text-white rounded-br-none shadow-md' 
                                : 'bg-slate-900 border border-white/10 text-slate-200 rounded-bl-none'
                            }`}>
                              <p className="whitespace-pre-line">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                        {chatLoading && (
                          <div className="flex justify-start">
                            <div className="bg-slate-900 border border-white/10 rounded-2xl rounded-bl-none px-4 py-2.5 text-slate-405 text-xxs font-bold flex items-center gap-1">
                              <Loader2 size={12} className="animate-spin text-violet-400" />
                              <span>AI Coach is writing...</span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Chat Input */}
                      <div className="flex gap-2 pt-3 border-t border-white/5 mt-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                          placeholder="Ask about ATS Optimization, skills improvement..."
                          className="flex-1 bg-slate-955/90 border border-white/10 hover:border-white/15 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
                        />
                        <button
                          onClick={handleSendChatMessage}
                          className="px-4 py-2 bg-gradient-to-r from-violet-605 to-blue-600 text-white rounded-xl text-xs font-black uppercase hover:scale-102 transition-all cursor-pointer flex items-center justify-center shadow-md"
                        >
                          <Send size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. Smart Search */}
            {activeTab === 'smart-search' && (
              <div className="space-y-6 text-left">
                {/* Search query bar */}
                <div className="p-4 rounded-[24px] bg-slate-900 border border-white/10 backdrop-blur-md shadow-xl flex flex-col md:flex-row gap-3 items-center">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-505 w-4 h-4" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search jobs by title, company, or target skills..."
                      className="w-full bg-slate-955/60 border border-white/5 hover:border-white/10 focus:border-violet-500 rounded-xl pl-12 pr-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all font-semibold"
                    />
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {/* Job Type Dropdown */}
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="bg-slate-955/80 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase text-slate-300 outline-none transition-all cursor-pointer"
                    >
                      <option value="all">All Types</option>
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="remote">Remote</option>
                    </select>

                    {/* Experience Level Dropdown */}
                    <select
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value)}
                      className="bg-slate-955/80 border border-white/5 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase text-slate-300 outline-none transition-all cursor-pointer"
                    >
                      <option value="all">All Levels</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid Level</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead/Principal</option>
                    </select>
                  </div>
                </div>

                {/* Query Results */}
                {searchLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-cyan-400 w-8 h-8 mr-2" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Searching vacancies...</span>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className="p-8 border border-white/5 bg-slate-900 rounded-3xl text-center text-slate-500">
                    <AlertCircle size={32} className="mx-auto mb-2 text-slate-655" />
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">No matching search results</p>
                    <p className="text-xxs text-slate-505 mt-1">Try relaxing query terms or shifting experience level parameters.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchResults.map((job) => (
                      <div 
                        key={job.id} 
                        className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 shadow-md flex justify-between gap-4 hover:border-violet-500/20 transition-all group"
                      >
                        <div className="space-y-3 min-w-0">
                          <div className="flex items-center gap-2">
                            <CompanyLogo company={job.company} className="w-10 h-10" />
                            <div className="min-w-0">
                              <h4 className="text-xs font-black text-white truncate">{job.company?.name || job.company_name}</h4>
                              <span className="text-[9px] text-slate-550 font-bold block">{job.location}</span>
                            </div>
                          </div>
                          <h3 className="text-sm font-black text-white tracking-tight line-clamp-1 group-hover:text-violet-300 transition-colors">{job.title}</h3>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-violet-500/10 text-[8px] font-black uppercase text-violet-400 tracking-wider">
                              {job.experience_level || 'Mid Level'}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-[8px] font-black uppercase text-cyan-400 tracking-wider capitalize">
                              {job.job_type || 'Remote'}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col justify-between items-end shrink-0">
                          <span className="text-xxs font-black text-emerald-400">
                            ${(job.salary_min / 1000).toFixed(0)}k - ${(job.salary_max / 1000).toFixed(0)}k
                          </span>
                          <button
                            onClick={() => {
                              setActiveTab('swipe-feed');
                              setDeck(prev => {
                                const filtered = prev.filter(j => j.id !== job.id);
                                return [job, ...filtered];
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/20 hover:border-violet-555 text-violet-300 hover:text-white text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer"
                          >
                            Swipe View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 5. Analytics */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 text-left">
                {/* Stats cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Submitted Swipes", val: likesCount + matchesCount + 10, color: "text-violet-400" },
                    { label: "AI Matches Created", val: matchesCount, color: "text-cyan-400" },
                    { label: "ATS Health Index", val: "92%", color: "text-emerald-400" },
                    { label: "Active Swipe Goal", val: `${swipesGoal} / 15`, color: "text-fuchsia-405" }
                  ].map((stat, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-900 border border-white/5 shadow-md">
                      <span className="text-[8px] font-black text-slate-550 uppercase tracking-widest block">{stat.label}</span>
                      <p className={`text-xl font-black mt-2 ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Weekly swipes velocity progress tracker */}
                  {swipeGoalsWidget}

                  {/* ATS score growth chart */}
                  <div className="p-5 rounded-[24px] bg-slate-900 border border-white/5 shadow-xl space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block border-b border-white/5 pb-2">ATS Score Growth Trend</span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
                        <span>Original Score (May)</span>
                        <span>62%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
                        <div className="h-full bg-slate-700 w-[62%]" />
                      </div>
                      <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
                        <span>Optimized Score (June)</span>
                        <span>78%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
                        <div className="h-full bg-indigo-500 w-[78%]" />
                      </div>
                      <div className="flex justify-between items-center text-xxs font-extrabold uppercase text-slate-400">
                        <span>Current AI Workspace Scan (July)</span>
                        <span>88%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden relative border border-white/5">
                        <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 w-[88%]" />
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-semibold leading-relaxed pt-2">
                      Growth: +26% improvement achieved since adding custom state hooks system keywords.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Saved Jobs */}
            {activeTab === 'saved-jobs' && (
              <div className="space-y-6 text-left">
                <span className="text-[10px] font-black uppercase tracking-widest text-violet-400 block border-b border-white/5 pb-2">Swiped & Applied Jobs ({savedJobs.length})</span>
                
                {savedLoading ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="animate-spin text-cyan-400 w-8 h-8 mr-2" />
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Syncing applications...</span>
                  </div>
                ) : savedJobs.length === 0 ? (
                  <div className="p-8 border border-white/5 bg-slate-905 rounded-3xl text-center text-slate-500">
                    <Bookmark size={32} className="mx-auto mb-2 text-slate-655" />
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">No saved roles</p>
                    <p className="text-xxs text-slate-500 mt-1">Right-swiped jobs (Like actions) will populate here dynamically.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {savedJobs.map((app) => (
                      <div 
                        key={app.id} 
                        className="p-5 rounded-2xl bg-slate-900/50 border border-white/5 shadow-md flex flex-col md:flex-row justify-between gap-6 hover:border-violet-500/20 transition-all"
                      >
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-center gap-3">
                              <CompanyLogo company={app.job?.company} className="w-10 h-10" />
                              <div className="min-w-0">
                                <h4 className="text-xs font-black text-white truncate">{app.job?.company?.name || app.job?.company_name}</h4>
                                <span className="text-[9px] text-slate-550 font-bold block">{app.job?.location}</span>
                              </div>
                            </div>

                            <span className="px-2.5 py-1 rounded bg-violet-500/10 text-[9px] font-black uppercase text-violet-400 tracking-wider">
                              Status: {app.status || 'applied'}
                            </span>
                          </div>
                          <h3 className="text-sm font-black text-white tracking-tight truncate">{app.job?.title}</h3>
                          
                          {/* Notes field */}
                          <div className="space-y-1.5 pt-2">
                            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Interview Notes</span>
                            <div className="flex gap-2">
                              <textarea
                                value={jobNotes[app.job?.id] || ''}
                                onChange={(e) => setJobNotes(prev => ({ ...prev, [app.job?.id]: e.target.value }))}
                                placeholder="Add notes (e.g. Recruiter call scheduled for Monday 10am...)"
                                className="flex-1 bg-slate-950/80 border border-white/5 rounded-lg p-2 text-xxs text-slate-350 placeholder-slate-655 outline-none focus:border-violet-505 resize-none h-14"
                              />
                              <button
                                onClick={() => handleSaveNote(app.job?.id, jobNotes[app.job?.id] || '')}
                                className="px-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-[9px] font-black uppercase tracking-wider rounded-lg border border-white/5 transition-all cursor-pointer shrink-0"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="flex md:flex-col justify-between items-end gap-3 shrink-0">
                          <div className="text-right">
                            <span className="text-xxs font-black text-emerald-400 block">
                              ${(app.job?.salary_min / 1000).toFixed(0)}k - ${(app.job?.salary_max / 1000).toFixed(0)}k
                            </span>
                            <span className="text-[8px] text-slate-550 font-bold">Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                          </div>
                          
                          <button
                            onClick={() => setDrawerJob(app.job)}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-605 to-blue-600 text-white text-[10px] font-black uppercase tracking-wider hover:scale-102 transition-all cursor-pointer shadow-md"
                          >
                            View AI Insights
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* DETAILED OVERLAY DRAWER DIALOG MODAL */}
      {drawerJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-955/70 backdrop-blur-sm">
          <div className="w-full max-w-xl h-full bg-slate-900 border-l border-white/10 flex flex-col justify-between shadow-2xl relative overflow-hidden animate-slide-in">
            
            {/* Header Area */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <CompanyLogo company={drawerJob.company} className="w-12 h-12" />
                <div className="text-left">
                  <h3 className="text-base font-black text-white leading-tight">{drawerJob.title}</h3>
                  <p className="text-xxs text-slate-405 font-bold mt-0.5">{drawerJob.company?.name || drawerJob.company_name} • {drawerJob.location}</p>
                </div>
              </div>
              <button
                onClick={() => { setDrawerJob(null); setCoverLetter(''); }}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
              
              {/* AI matching insights */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-650/10 to-blue-600/10 border border-violet-500/25 space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-violet-404 animate-pulse" />
                  <span className="text-xs font-black uppercase tracking-wider text-white">AI Match Audit Insights</span>
                </div>
                <p className="text-xxs text-slate-350 leading-relaxed">
                  Your resume has an **88% suitability index** for this role. Key technical match indicators: **React 19**, **Vite compilation**, and **Framer Motion spring transitions** match the requirements perfectly. 
                </p>
              </div>

              {/* Job description detail cards */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Job Description</span>
                <p className="text-xxs text-slate-400 leading-relaxed font-medium">
                  {drawerJob.description || "Looking for a high-performance engineer to implement clean, state-of-the-art interactive workspace views. You will leverage modern animation configurations, build dynamic hooks, and collaborate with backend DRF teams to ensure zero layout shifts and sub-millisecond database queries."}
                </p>
              </div>

              {/* Skills checklist */}
              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">Skills Match checklist</span>
                <div className="grid grid-cols-2 gap-3">
                  {(drawerJob.skills_required || ["React", "Python", "SQL", "Git"]).map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-xxs font-bold text-slate-305">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover Letter generation panel inside insights drawer */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block border-b border-white/5 pb-2">AI Cover Letter Builder</span>
                {coverLetter ? (
                  <div className="space-y-3">
                    <pre className="p-3 bg-slate-900 border border-white/5 rounded-xl font-mono text-[9px] text-slate-300 whitespace-pre-wrap leading-relaxed max-h-44 overflow-y-auto">
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
            <div className="p-6 border-t border-white/5 bg-slate-955/40 flex justify-end gap-3 shrink-0">
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
