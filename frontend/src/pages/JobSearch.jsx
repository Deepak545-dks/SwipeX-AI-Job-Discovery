import React, { useEffect, useState } from 'react';
import { 
  Search, MapPin, DollarSign, Briefcase, Clock, 
  GraduationCap, Loader2, Sparkles, Filter, ChevronDown, 
  X, Check, AlertCircle, FileText, Copy, Inbox, Calendar, ArrowRight, Target, Cpu, Mic, Heart, Award
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
      <div className={`${className} rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-cyan-405 font-black text-xs uppercase shrink-0`}>
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
  const [experienceMax, setExperienceMax] = useState('8'); // Seniority scale
  
  // Filter checkboxes
  const [selectedJobTypes, setSelectedJobTypes] = useState(
    searchParams.get('job_type') ? searchParams.get('job_type').split(',') : []
  );
  const [selectedEmpTypes, setSelectedEmpTypes] = useState(
    searchParams.get('employment_type') ? searchParams.get('employment_type').split(',') : []
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

  // Animated suggestions list
  const suggestions = ["NVIDIA CUDA Engineer", "Lead React Architect", "Figma Product Designer", "Stripe Tech Lead"];

  const checkUserResume = async () => {
    try {
      const response = await api.get('/profiles/me/');
      if (!response.data.resumes || response.data.resumes.length === 0) {
        setHasResume(false);
      } else {
        setHasResume(true);
      }

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
      const fetched = response.data.results || response.data || [];
      const unique = [];
      const keys = new Set();
      for (const j of fetched) {
        if (j && j.id && !keys.has(j.id)) {
          keys.add(j.id);
          unique.push(j);
        }
      }
      setJobs(unique);
    } catch (err) {
      console.error("Search API Error:", err);
      setError(err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to query job listings.');
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
    const ct = getVal('companyType', companyType);
    const rp = getVal('recentlyPosted', recentlyPosted);
    const lc = getVal('lowCompetition', lowCompetition);

    if (q) params.q = q;
    if (loc) params.location = loc;
    if (sal) params.salary_min = sal;
    if (jt.length > 0) params.job_type = jt.join(',');
    if (et.length > 0) params.employment_type = et.join(',');
    if (ct) params.company_type = ct;
    if (rp) params.recently_posted = 'true';
    if (lc) params.low_competition = 'true';

    setSearchParams(params);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    syncParamsToUrl();
  };

  const handleSuggestionClick = (sug) => {
    setQuery(sug);
    syncParamsToUrl({ query: sug });
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
    setCompanyType('');
    setRecentlyPosted(false);
    setLowCompetition(false);
    setSearchParams({});
  };

  const getCompanyColorTheme = (name) => {
    const norm = (name || '').toLowerCase();
    if (norm.includes('google') || norm.includes('alphabet')) {
      return {
        bg: "from-blue-500/10 via-cyan-500/10 to-[#0c1224]/95",
        border: "border-blue-500/20 hover:border-cyan-500/40",
        text: "text-cyan-405",
        scoreRing: ["#3b82f6", "#06b6d4"]
      };
    }
    if (norm.includes('microsoft')) {
      return {
        bg: "from-violet-500/10 via-blue-500/10 to-[#0c1224]/95",
        border: "border-violet-500/20 hover:border-blue-500/40",
        text: "text-violet-400",
        scoreRing: ["#8b5cf6", "#3b82f6"]
      };
    }
    if (norm.includes('amazon') || norm.includes('aws')) {
      return {
        bg: "from-orange-500/10 via-amber-500/10 to-[#0c1224]/95",
        border: "border-orange-500/20 hover:border-amber-500/40",
        text: "text-orange-400",
        scoreRing: ["#f97316", "#fbbf24"]
      };
    }
    if (norm.includes('netflix')) {
      return {
        bg: "from-red-500/10 via-pink-500/10 to-[#0c1224]/95",
        border: "border-red-500/20 hover:border-pink-500/40",
        text: "text-rose-400",
        scoreRing: ["#ef4444", "#ec4899"]
      };
    }
    if (norm.includes('spotify')) {
      return {
        bg: "from-emerald-500/10 via-teal-500/10 to-[#0c1224]/95",
        border: "border-emerald-500/20 hover:border-teal-500/40",
        text: "text-emerald-405",
        scoreRing: ["#10b981", "#14b8a6"]
      };
    }
    return {
      bg: "from-slate-500/10 via-blue-550/10 to-[#0c1224]/95",
      border: "border-slate-500/20 hover:border-blue-500/40",
      text: "text-blue-400",
      scoreRing: ["#64748b", "#3b82f6"]
    };
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10 text-white">
      
      {/* Background spotlights */}
      <div className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-blue-600/15 via-cyan-500/10 to-transparent rounded-full blur-[130px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-1/4 w-[450px] h-[450px] bg-gradient-to-br from-cyan-600/15 via-blue-500/10 to-transparent rounded-full blur-[130px] -z-10 pointer-events-none" />

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-cyan-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-violet-400">Search console</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Filter database roles, scan competitive rates, and deploy applications instantly.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200/20 text-rose-400 text-xs font-bold text-left">
          <span>{error}</span>
        </div>
      )}

      {/* Main Search Panel Form */}
      <form onSubmit={handleSearchSubmit} className="p-[1.5px] rounded-[32px] bg-gradient-to-r from-blue-500/30 via-cyan-500/30 to-transparent shadow-2xl relative">
        <div className="bg-slate-950/90 backdrop-blur-2xl p-4 sm:p-5 rounded-[30px] flex flex-col md:flex-row gap-4 items-center border border-white/5">
          <div className="w-full md:flex-grow relative group text-left">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keywords, skills, company name..."
              className="w-full bg-[#090d1a]/60 border border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/90 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl py-4 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-500 font-semibold"
            />
            <button
              type="button"
              onClick={() => showToast('Voice search activates device microphone...', 'info')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer border border-white/5"
            >
              <Mic size={13} />
            </button>
          </div>
          <div className="w-full md:w-64 relative group text-left">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-cyan-400 transition-colors" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location, country, remote..."
              className="w-full bg-[#090d1a]/60 border border-white/10 focus:border-cyan-500/50 focus:bg-slate-900/90 focus:ring-4 focus:ring-cyan-500/10 rounded-2xl py-4 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-8 py-4.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Search</span>}
          </button>
        </div>
      </form>

      {/* Animated suggestions row */}
      <div className="flex flex-wrap gap-2 items-center text-xs text-slate-400 text-left font-bold px-2">
        <span className="text-[10px] text-slate-500 uppercase tracking-wider flex items-center gap-1"><Sparkles size={12} className="text-cyan-400" /> Suggestions:</span>
        {suggestions.map((sug, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSuggestionClick(sug)}
            className="px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-white/5 hover:border-cyan-500/30 text-slate-350 hover:text-white transition-all cursor-pointer text-xxs font-extrabold uppercase tracking-wide"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Main Grid Content */}
      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 p-[1.5px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl self-start">
          <div className="bg-slate-955 backdrop-blur-2xl p-6 rounded-[23px] space-y-6 text-left border border-white/5">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={12} className="text-cyan-400" /> Filter Console
              </span>
              <button 
                type="button" 
                onClick={clearFilters}
                className="text-[10px] text-cyan-405 hover:underline font-extrabold uppercase tracking-wide cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Placement Mode */}
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
                          ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                          : 'bg-slate-900 border-white/5 hover:border-white/15 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Employment nature */}
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
                          ? 'bg-cyan-600/20 border-cyan-500/50 text-cyan-400' 
                          : 'bg-slate-900 border-white/5 hover:border-white/15 text-slate-400'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Salary slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500">
                <span>Minimum Salary</span>
                <span className="text-white font-black">${(parseInt(salaryMin)/1000)}k+</span>
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
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Experience Seniority Slider - Redesign item */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-500">
                <span>Experience Limit</span>
                <span className="text-white font-black">{experienceMax} years</span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                step="1"
                value={experienceMax}
                onChange={(e) => setExperienceMax(e.target.value)}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Parameters */}
            <div className="space-y-3 border-t border-white/10 pt-4">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Parameters</h4>
              <div className="space-y-3 font-semibold text-xs text-slate-400">
                <label className="flex items-center space-x-3 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={recentlyPosted}
                    onChange={(e) => {
                      setRecentlyPosted(e.target.checked);
                      syncParamsToUrl({ recentlyPosted: e.target.checked });
                    }}
                    className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 w-4 h-4 cursor-pointer"
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
                    className="rounded border-white/10 bg-slate-900 text-cyan-500 focus:ring-cyan-500/40 w-4 h-4 cursor-pointer"
                  />
                  <span>Low Competition (&lt;5 apps)</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Search Results list */}
        <div className="lg:col-span-3 text-left">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/60 border border-white/10 p-6 rounded-3xl space-y-4 animate-pulse">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-3/4">
                      <div className="h-4 rounded bg-slate-800 w-1/3" />
                      <div className="h-6 rounded bg-slate-800 w-3/4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 border border-white/10 rounded-[28px] flex flex-col items-center justify-center p-8 space-y-6 shadow-xl backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-500 shadow-inner">
                <Search size={28} className="animate-pulse text-cyan-400" />
              </div>
              <div className="space-y-2">
                <p className="text-white font-black text-sm">No Matches found</p>
                <p className="text-slate-405 text-xs max-w-xs leading-relaxed font-semibold">
                  We couldn't find any job listings matching your current filter parameters. Try expanding search query.
                </p>
              </div>
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
                    className="p-[1px] rounded-[28px] bg-gradient-to-br from-white/10 to-transparent hover:from-white/20 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div 
                      className={`bg-gradient-to-b ${theme.bg} backdrop-blur-2xl p-6 rounded-[27px] h-full flex flex-col justify-between cursor-pointer relative group border border-white/5`}
                      onClick={() => setDrawerJob(job)}
                    >
                      
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                {job.job_type}
                              </span>
                              <span className="inline-flex px-2.5 py-0.5 bg-white/5 border border-white/10 rounded-md text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                {job.experience_level.replace('_', ' ')}
                              </span>
                            </div>
                            <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors mt-3.5 leading-snug truncate">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 text-xxs font-bold mt-0.5 truncate">{job.company.name}</p>
                          </div>
                          
                          <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="24"
                                cy="24"
                                r="19"
                                stroke="rgba(255,255,255,0.03)"
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

                        <div className="grid grid-cols-2 gap-3 mt-6 border-t border-white/5 pt-4 text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5 text-xxs">
                            <MapPin size={12} className="text-slate-500" />
                            <span className="truncate">{job.location}</span>
                          </div>
                          <div className="flex items-center space-x-1.5 text-xxs">
                            <DollarSign size={12} className="text-slate-500" />
                            <span className="truncate text-white font-black">
                              {job.salary_min ? `$${(job.salary_min/1000)}k` : 'Neg'}
                              {job.salary_max ? `-$${(job.salary_max/1000)}k` : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-4">
                          {job.skills_required.slice(0, 3).map(skill => (
                            <span key={skill} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-305">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between items-center text-slate-400 text-[9px] border-t border-white/5 pt-4 font-black uppercase tracking-widest">
                        {isAlreadyApplied ? (
                          <span className="text-emerald-500 flex items-center gap-0.5">
                            <Check size={10} /> Match Applied
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApplyJob(job.id);
                            }}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-black text-[9px] uppercase tracking-wider rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md cursor-pointer border border-cyan-550"
                          >
                            Apply Now
                          </button>
                        )}

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => handleToggleSaveJob(e, job.id)}
                            className="p-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                          >
                            <Heart size={12} className={isSaved ? "fill-rose-500 text-rose-500" : ""} />
                          </button>
                          <span className="text-cyan-405 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-black">
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
                  <p className="text-cyan-400 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
                </div>
                <button
                  onClick={() => setDrawerJob(null)}
                  className="p-2 rounded-xl border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white shrink-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-y border-white/10 py-5 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{drawerJob.location}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-white font-black">
                  <DollarSign size={14} className="text-slate-500" />
                  <span>
                    {drawerJob.salary_min ? `$${drawerJob.salary_min.toLocaleString()}` : 'Negotiable'}
                    {drawerJob.salary_max ? ` - $${drawerJob.salary_max.toLocaleString()}` : ''}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">About the Role</h4>
                <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-line bg-slate-900/40 p-4 rounded-2xl border border-white/5 font-semibold">{drawerJob.description}</p>
              </div>

              {/* Similar jobs matches preview panel - Redesign item */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <Sparkles size={12} className="text-cyan-450" /> Similar Jobs Matching
                </h4>
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-2.5 font-bold text-xxs text-slate-400">
                  <div className="flex justify-between items-center hover:text-white transition-colors cursor-pointer">
                    <span>Senior AI Architect @ Anthropic</span>
                    <span className="text-cyan-405 font-black uppercase">View &rarr;</span>
                  </div>
                  <div className="flex justify-between items-center hover:text-white transition-colors cursor-pointer">
                    <span>LLM Backend Optimizer @ OpenAI</span>
                    <span className="text-cyan-405 font-black uppercase">View &rarr;</span>
                  </div>
                </div>
              </div>

              <AiSkillGapWidget jobId={drawerJob.id} />

              {/* AI Tools Bar */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                  <button
                    onClick={handleGenerateCoverLetter}
                    disabled={generatingCoverLetter}
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-cyan-400 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
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
                    className="w-full sm:w-auto px-5 py-3 bg-white/5 border border-white/10 text-cyan-400 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 cursor-pointer uppercase tracking-wider"
                  >
                    <Sparkles size={12} />
                    <span>Practice Questions</span>
                  </button>
                </div>
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
