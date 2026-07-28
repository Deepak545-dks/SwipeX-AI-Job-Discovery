import React, { useEffect, useState } from 'react';
import { 
  Search, MapPin, DollarSign, Briefcase, Clock, 
  GraduationCap, Loader2, Sparkles, Filter, ChevronDown, 
  X, Check, AlertCircle, FileText, Copy, Inbox, Calendar, ArrowRight, Target, Cpu, Mic, Heart
} from 'lucide-react';
import api from '../utils/api';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import AiSkillGapWidget from '../components/AiSkillGapWidget';
import AiInterviewModal from '../components/AiInterviewModal';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyLogo = ({ company, className = "w-11 h-11" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-violet-400 font-black text-xs uppercase shrink-0`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-2xl object-cover bg-slate-950 border border-white/10 shrink-0 shadow-md`}
    />
  );
};

export default function JobSearch() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasResume, setHasResume] = useState(true);
  const [applyingId, setApplyingId] = useState(null);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search parameters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salary_min') || '80000');
  
  // Filter checkboxes
  const [selectedJobTypes, setSelectedJobTypes] = useState(
    searchParams.get('job_type') ? searchParams.get('job_type').split(',') : []
  );
  const [selectedEmpTypes, setSelectedEmpTypes] = useState(
    searchParams.get('employment_type') ? searchParams.get('employment_type').split(',') : []
  );
  const [selectedExpLevels, setSelectedExpLevels] = useState(
    searchParams.get('experience_level') ? searchParams.get('experience_level').split(',') : []
  );
  
  const [companyType, setCompanyType] = useState(searchParams.get('company_type') || '');
  const [recentlyPosted, setRecentlyPosted] = useState(searchParams.get('recently_posted') === 'true');
  const [lowCompetition, setLowCompetition] = useState(searchParams.get('low_competition') === 'true');

  // Detail Drawer Job
  const [drawerJob, setDrawerJob] = useState(null);

  // AI Modal & Cover Letter state
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  // Applied jobs tracking
  const [appliedJobIds, setAppliedJobIds] = useState([]);

  // Mouse Parallax coordinates tracker
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMove = (e) => {
      setMousePos({
        x: (e.clientX - window.innerWidth / 2) / 40,
        y: (e.clientY - window.innerHeight / 2) / 40
      });
    };
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  const checkUserResume = async () => {
    try {
      const response = await api.get('/profiles/me/');
      if (!response.data.resumes || response.data.resumes.length === 0) {
        setHasResume(false);
      } else {
        setHasResume(true);
      }

      // Grab already applied jobs
      const appResp = await api.get('/jobs/my-applications/');
      const applied = (appResp.data.results || appResp.data).map(app => app.job);
      setAppliedJobIds(applied);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJobs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/jobs/search/?${searchParams.toString()}`);
      setJobs(response.data.results || response.data);
    } catch (err) {
      setError('Failed to query job listings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkUserResume();
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchParams]);

  const syncParamsToUrl = (newFilters = {}) => {
    const params = {};
    const getVal = (name, currentVal) => newFilters.hasOwnProperty(name) ? newFilters[name] : currentVal;

    const q = getVal('query', query);
    const loc = getVal('location', location);
    const sal = getVal('salaryMin', salaryMin);
    const jt = getVal('selectedJobTypes', selectedJobTypes);
    const et = getVal('selectedEmpTypes', selectedEmpTypes);
    const el = getVal('selectedExpLevels', selectedExpLevels);
    const ct = getVal('companyType', companyType);
    const rp = getVal('recentlyPosted', recentlyPosted);
    const lc = getVal('lowCompetition', lowCompetition);

    if (q) params.q = q;
    if (loc) params.location = loc;
    if (sal) params.salary_min = sal;
    if (jt.length > 0) params.job_type = jt.join(',');
    if (et.length > 0) params.employment_type = et.join(',');
    if (el.length > 0) params.experience_level = el.join(',');
    if (ct) params.company_type = ct;
    if (rp) params.recently_posted = 'true';
    if (lc) params.low_competition = 'true';

    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    syncParamsToUrl();
  };

  const handleToggleJobType = (type) => {
    const next = selectedJobTypes.includes(type) 
      ? selectedJobTypes.filter(t => t !== type) 
      : [...selectedJobTypes, type];
    setSelectedJobTypes(next);
    syncParamsToUrl({ selectedJobTypes: next });
  };

  const handleToggleEmpType = (type) => {
    const next = selectedEmpTypes.includes(type) 
      ? selectedEmpTypes.filter(t => t !== type) 
      : [...selectedEmpTypes, type];
    setSelectedEmpTypes(next);
    syncParamsToUrl({ selectedEmpTypes: next });
  };

  const handleToggleExpLevel = (level) => {
    const next = selectedExpLevels.includes(level) 
      ? selectedExpLevels.filter(l => l !== level) 
      : [...selectedExpLevels, level];
    setSelectedExpLevels(next);
    syncParamsToUrl({ selectedExpLevels: next });
  };

  const handleApplyJob = async (jobId) => {
    if (!hasResume) {
      showToast('You must upload a resume in your profile before you can apply to jobs.', 'warning');
      return;
    }

    if (appliedJobIds.includes(jobId)) {
      showToast('You have already applied for this job.', 'info');
      return;
    }

    setApplyingId(jobId);
    try {
      await api.post('/jobs/apply/', { job_id: jobId });
      showToast('Application submitted successfully!', 'success');
      setAppliedJobIds([...appliedJobIds, jobId]);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit application.', 'error');
    } finally {
      setApplyingId(null);
    }
  };

  const handleToggleSaveJob = (e, jobId) => {
    e.stopPropagation();
    if (savedJobIds.includes(jobId)) {
      setSavedJobIds(savedJobIds.filter(id => id !== jobId));
      showToast('Job removed from saved list.', 'info');
    } else {
      setSavedJobIds([...savedJobIds, jobId]);
      showToast('Job saved successfully!', 'success');
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

  const clearFilters = () => {
    setQuery('');
    setLocation('');
    setSalaryMin('80000');
    setSelectedJobTypes([]);
    setSelectedEmpTypes([]);
    setSelectedExpLevels([]);
    setCompanyType('');
    setRecentlyPosted(false);
    setLowCompetition(false);
    setSearchParams({});
  };

  // Helper to map company name to premium soft colorful gradients
  const getCompanyColorTheme = (name) => {
    const norm = (name || '').toLowerCase();
    if (norm.includes('google') || norm.includes('alphabet')) {
      return {
        bg: "from-blue-500/10 via-cyan-500/10 to-[#0d152c]/90",
        border: "border-blue-500/20 hover:border-cyan-500/40",
        text: "text-cyan-400",
        scoreRing: ["#3b82f6", "#06b6d4"]
      };
    }
    if (norm.includes('microsoft')) {
      return {
        bg: "from-violet-500/10 via-blue-500/10 to-[#0d152c]/90",
        border: "border-violet-500/20 hover:border-blue-500/40",
        text: "text-violet-400",
        scoreRing: ["#8b5cf6", "#3b82f6"]
      };
    }
    if (norm.includes('amazon') || norm.includes('aws')) {
      return {
        bg: "from-orange-500/10 via-amber-500/10 to-[#0d152c]/90",
        border: "border-orange-500/20 hover:border-amber-500/40",
        text: "text-orange-400",
        scoreRing: ["#f97316", "#fbbf24"]
      };
    }
    if (norm.includes('netflix')) {
      return {
        bg: "from-red-500/10 via-pink-500/10 to-[#0d152c]/90",
        border: "border-red-500/20 hover:border-pink-500/40",
        text: "text-rose-400",
        scoreRing: ["#ef4444", "#ec4899"]
      };
    }
    if (norm.includes('spotify')) {
      return {
        bg: "from-emerald-500/10 via-teal-500/10 to-[#0d152c]/90",
        border: "border-emerald-500/20 hover:border-teal-500/40",
        text: "text-emerald-405",
        scoreRing: ["#10b981", "#14b8a6"]
      };
    }
    // Apple / Default
    return {
      bg: "from-slate-500/10 via-blue-550/10 to-[#0d152c]/90",
      border: "border-slate-500/20 hover:border-blue-500/40",
      text: "text-blue-400",
      scoreRing: ["#64748b", "#3b82f6"]
    };
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
      
      {/* Immersive Parallax Spotlights (Theme: Deep Navy, Indigo, Soft Blue, Purple, Cyan, Pink) */}
      <motion.div 
        animate={{ 
          x: mousePos.x * -1.2, 
          y: mousePos.y * -1.2 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-indigo-850/20 via-purple-650/15 to-transparent rounded-full blur-[130px] -z-10 pointer-events-none animate-pulse duration-[8000ms]"
      />
      <motion.div 
        animate={{ 
          x: mousePos.x * 1.4, 
          y: mousePos.y * 1.4 
        }}
        transition={{ type: 'tween', ease: 'easeOut', duration: 0.5 }}
        className="absolute bottom-[20%] right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-cyan-650/20 via-pink-650/15 to-transparent rounded-full blur-[130px] -z-10 pointer-events-none"
      />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-cyan-405" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-violet-400 to-pink-400">Search console</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Filter database roles, scan competitive rates, and deploy applications instantly.</p>
        </div>
        {!hasResume && (
          <div className="p-4 rounded-2xl bg-amber-955/20 border border-amber-500/20 text-amber-405 text-xxs flex items-center space-x-2.5 animate-pulse">
            <AlertCircle size={16} className="shrink-0" />
            <span>Missing resume? <Link to="/profile" className="underline font-black text-white">Upload CV &rarr;</Link></span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-955/35 border border-rose-500/20 text-rose-455 text-xs font-bold text-left">
          <span>{error}</span>
        </div>
      )}

      {/* Main Search Panel Form - Beautiful AI Search Bar */}
      <form onSubmit={handleSearchSubmit} className="p-[1.5px] rounded-[32px] bg-gradient-to-r from-blue-500/30 via-violet-500/30 to-pink-500/10 shadow-2xl relative">
        <div className="bg-[#0b0f1a]/95 backdrop-blur-2xl p-4 sm:p-5 rounded-[30px] flex flex-col md:flex-row gap-4 items-center border border-white/5">
          <div className="w-full md:flex-grow relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keywords, skills, company name..."
              className="w-full bg-[#070913]/60 border border-white/10 focus:border-violet-500/50 focus:bg-slate-900/90 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-4 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
            />
            {/* Voice Search Button indicator */}
            <button
              type="button"
              onClick={() => showToast('Voice search activates device microphone...', 'info')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <Mic size={13} />
            </button>
          </div>
          <div className="w-full md:w-64 relative group">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-violet-405 transition-colors" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location, country, remote..."
              className="w-full bg-[#070913]/60 border border-white/10 focus:border-violet-500/50 focus:bg-slate-900/90 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-4 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-4.5 bg-gradient-to-r from-blue-600 via-violet-605 to-pink-550 hover:from-blue-500 hover:to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-[0_0_25px_rgba(139,92,246,0.2)] active:scale-95 shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Search</span>}
          </button>
        </div>
      </form>

      {/* Main Grid Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 p-[1.5px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl self-start">
          <div className="bg-[#0b0f1a]/95 backdrop-blur-2xl p-6 rounded-[23px] space-y-6 text-left border border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={12} className="text-violet-400" /> Filter Console
              </span>
              <button 
                type="button" 
                onClick={clearFilters}
                className="text-[10px] text-violet-405 hover:underline font-extrabold uppercase tracking-wide cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Placement Mode Toggles (Chips) */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Placement Mode</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  ['remote', 'Remote'],
                  ['hybrid', 'Hybrid'],
                  ['onsite', 'On-site']
                ].map(([val, label]) => {
                  const isActive = selectedJobTypes.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleToggleJobType(val)}
                      className={`px-3.5 py-2 rounded-xl text-xxs font-extrabold uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive 
                          ? 'bg-blue-600/15 border-blue-500/50 text-blue-400 shadow-md' 
                          : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-405'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employment nature (Chips) */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Employment Nature</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  ['full_time', 'Full-time'],
                  ['part_time', 'Part-time'],
                  ['internship', 'Internship'],
                  ['contract', 'Contract']
                ].map(([val, label]) => {
                  const isActive = selectedEmpTypes.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleToggleEmpType(val)}
                      className={`px-3.5 py-2 rounded-xl text-xxs font-extrabold uppercase tracking-wider transition-all border cursor-pointer ${
                        isActive 
                          ? 'bg-pink-600/15 border-pink-500/50 text-pink-400 shadow-md' 
                          : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-405'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Experience level (Seniority chips) */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Seniority Level</h4>
              <div className="flex flex-wrap gap-2">
                {[
                  ['fresher', 'Fresher'],
                  ['junior', 'Junior'],
                  ['mid', 'Mid'],
                  ['senior', 'Senior'],
                  ['lead', 'Lead']
                ].map(([val, label]) => {
                  const isActive = selectedExpLevels.includes(val);
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleToggleExpLevel(val)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all border cursor-pointer ${
                        isActive 
                          ? 'bg-violet-600/15 border-violet-500/50 text-violet-400 shadow-md' 
                          : 'bg-white/5 border-white/5 hover:border-white/15 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary slider widget */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500">
                <span>Minimum Salary</span>
                <span className="text-white font-extrabold">${(parseInt(salaryMin)/1000)}k+</span>
              </div>
              <input
                type="range"
                min="50000"
                max="250000"
                step="10000"
                value={salaryMin}
                onChange={(e) => {
                  setSalaryMin(e.target.value);
                  syncParamsToUrl({ salaryMin: e.target.value });
                }}
                className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-violet-500"
              />
            </div>

            {/* Company type */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Company Scale</h4>
              <div className="flex gap-2 p-1 bg-[#070913] border border-white/5 rounded-xl">
                {[
                  ['', 'All'],
                  ['startup', 'Startup'],
                  ['mnc', 'MNC']
                ].map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setCompanyType(val);
                      syncParamsToUrl({ companyType: val });
                    }}
                    className={`flex-grow py-2 px-3 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                      companyType === val 
                        ? 'bg-gradient-to-r from-blue-600 via-violet-600 to-pink-500 text-white font-black shadow-md' 
                        : 'text-slate-450 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special filters toggles */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Parameters</h4>
              <div className="space-y-3 font-semibold text-xs text-slate-350">
                <label className="flex items-center space-x-3 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={recentlyPosted}
                    onChange={(e) => {
                      setRecentlyPosted(e.target.checked);
                      syncParamsToUrl({ recentlyPosted: e.target.checked });
                    }}
                    className="rounded border-white/10 bg-slate-900 text-violet-655 focus:ring-violet-500/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Recent Postings (7d)</span>
                </label>

                <label className="flex items-center space-x-3 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCompetition}
                    onChange={(e) => {
                      setLowCompetition(e.target.checked);
                      syncParamsToUrl({ lowCompetition: e.target.checked });
                    }}
                    className="rounded border-white/10 bg-slate-900 text-violet-655 focus:ring-violet-500/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Low Competition (&lt;5 apps)</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Search Results list - Premium soft colorful gradients job cards */}
        <div className="lg:col-span-3 text-left">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl space-y-4">
                  <div className="flex justify-between items-start animate-pulse">
                    <div className="space-y-2 w-3/4">
                      <div className="h-4 rounded bg-white/5 w-1/3" />
                      <div className="h-6 rounded bg-white/5 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-[#0b0f1a]/85 border border-violet-500/20 rounded-3xl flex flex-col items-center justify-center p-8 space-y-6 backdrop-blur-2xl shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner">
                <Search size={28} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-sm">No Matches found</p>
                <p className="text-slate-500 text-xs max-w-xs leading-relaxed font-semibold">
                  We couldn't find any job listings matching your current filter parameters. Try expanding search query.
                </p>
              </div>
              <button 
                onClick={clearFilters}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-extrabold rounded-xl border border-white/10 cursor-pointer uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
              {jobs.map((job) => {
                const isAlreadyApplied = appliedJobIds.includes(job.id);
                const isSaved = savedJobIds.includes(job.id);
                const theme = getCompanyColorTheme(job.company.name);

                return (
                  <div 
                    key={job.id} 
                    className={`p-[1.2px] rounded-3xl bg-gradient-to-br from-white/10 hover:from-white/20 to-transparent shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                  >
                    <div 
                      className={`bg-gradient-to-b ${theme.bg} backdrop-blur-2xl p-6 rounded-[23px] h-full flex flex-col justify-between cursor-pointer relative group border border-white/5`}
                      onClick={() => setDrawerJob(job)}
                    >
                      
                      {/* Top Header Card row */}
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase text-slate-300 tracking-wider">
                                {job.job_type}
                              </span>
                              <span className="inline-flex px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase text-slate-300 tracking-wider">
                                {job.experience_level.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-base font-black text-white group-hover:text-violet-300 transition-colors mt-3 leading-snug truncate">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 text-xxs font-bold mt-0.5 truncate">{job.company.name}</p>
                          </div>
                          
                          {/* Circular AI Match Score Badge */}
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="19"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="3"
                                fill="transparent"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="19"
                                stroke={theme.scoreRing[0]}
                                strokeWidth="3.5"
                                fill="transparent"
                                strokeDasharray={120}
                                strokeDashoffset={120 - (120 * 96) / 100}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute text-[8px] font-black text-white">96%</span>
                          </div>
                        </div>

                        {/* Salary and Location details */}
                        <div className="grid grid-cols-2 gap-3 mt-6 border-t border-white/5 pt-4 text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5 text-xxs">
                            <MapPin size={12} className="text-slate-550" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-xxs">
                            <DollarSign size={12} className="text-slate-555" />
                            <span className="truncate text-white font-extrabold">
                              {job.salary_min ? `$${(job.salary_min/1000)}k` : 'Neg'}
                              {job.salary_max ? `-$${(job.salary_max/1000)}k` : ''}
                            </span>
                          </div>
                        </div>

                        {/* Skills chips */}
                        <div className="flex flex-wrap gap-1 mt-4">
                          {job.skills_required.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-bold text-slate-350">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Apply Now and Save Job Action Row */}
                      <div className="mt-6 flex justify-between items-center text-slate-550 text-[9px] border-t border-white/5 pt-4 font-black uppercase tracking-widest">
                        {isAlreadyApplied ? (
                          <span className="text-emerald-450 flex items-center gap-0.5">
                            <Check size={10} /> Match Applied
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyJob(job.id);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer"
                          >
                            Apply Now
                          </button>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleToggleSaveJob(e, job.id)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Heart size={12} className={isSaved ? "fill-rose-500 text-rose-500" : ""} />
                          </button>
                          <span className="text-violet-405 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-black">
                            Details <ArrowRight size={9} />
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Details drawer Overlay */}
      <AnimatePresence>
        {drawerJob && (
          <div className="fixed inset-0 bg-slate-955/70 backdrop-blur-sm z-40 flex justify-end items-end">
            <div className="absolute inset-0" onClick={() => setDrawerJob(null)} />
            
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-[#0b0f1a] border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white leading-tight truncate">{drawerJob.title}</h3>
                  <p className="text-violet-405 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
                </div>
                <button
                  onClick={() => setDrawerJob(null)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-y border-white/10 py-5 font-semibold">
                <div className="flex items-center space-x-1.5">
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
                <div className="flex items-center space-x-1.5 capitalize">
                  <Briefcase size={14} className="text-slate-500" />
                  <span>{drawerJob.employment_type.replace('_', ' ')} ({drawerJob.job_type})</span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize">
                  <GraduationCap size={14} className="text-slate-500" />
                  <span>{drawerJob.experience_level.replace('_', ' ')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">About the Role</h4>
                <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-white/5 font-semibold">{drawerJob.description}</p>
              </div>

              {drawerJob.requirements && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Key Requirements</h4>
                  <p className="text-slate-350 text-xs leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-white/5 font-semibold">{drawerJob.requirements}</p>
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
                    <span>Practice Questions</span>
                  </button>
                </div>

                {coverLetter && (
                  <div className="space-y-2 pt-2 border-t border-white/5 animate-fade-in text-left">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Generated Cover Letter</span>
                      <button
                        onClick={handleCopyCoverLetter}
                        className="text-xs text-violet-405 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                      >
                        <Copy size={12} />
                        <span>Copy</span>
                      </button>
                    </div>
                    <textarea
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={6}
                      className="w-full p-4 rounded-xl bg-slate-955/70 border border-white/10 text-slate-350 text-xs leading-relaxed outline-none focus:border-violet-500/55 focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
                    />
                  </div>
                )}
              </div>

              {/* Action buttons inside drawer */}
              <div className="pt-6 border-t border-white/10 flex justify-end gap-3">
                <button
                  onClick={() => setDrawerJob(null)}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Cancel
                </button>
                
                {appliedJobIds.includes(drawerJob.id) ? (
                  <button
                    disabled
                    className="px-7 py-3 bg-slate-900 border border-white/10 text-slate-500 font-extrabold text-xs rounded-xl flex items-center space-x-1.5 cursor-not-allowed"
                  >
                    <Check size={14} />
                    <span>Applied</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleApplyJob(drawerJob.id)}
                    disabled={applyingId === drawerJob.id}
                    className="px-7 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg flex items-center space-x-1.5 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    {applyingId === drawerJob.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <span>Apply Now</span>
                    )}
                  </button>
                )}
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
