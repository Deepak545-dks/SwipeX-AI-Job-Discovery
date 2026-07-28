import React, { useEffect, useState } from 'react';
import { 
  Search, MapPin, DollarSign, Briefcase, Clock, 
  GraduationCap, Loader2, Sparkles, Filter, ChevronDown, 
  X, Check, AlertCircle, FileText, Copy, Inbox, Calendar, ArrowRight, Target, Cpu, Landmark
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
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  
  // Search parameters
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [salaryMin, setSalaryMin] = useState(searchParams.get('salary_min') || '');
  
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
    setError('');
    try {
      await api.post('/jobs/swipe/', {
        job_id: jobId,
        action: 'like'
      });
      showToast('Application submitted successfully!', 'success');
      setAppliedJobIds(prev => [...prev, jobId]);
      if (drawerJob?.id === jobId) {
        setDrawerJob(null);
      }
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to submit application.', 'error');
    } finally {
      setApplyingId(null);
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
    setSalaryMin('');
    setSelectedJobTypes([]);
    setSelectedEmpTypes([]);
    setSelectedExpLevels([]);
    setCompanyType('');
    setRecentlyPosted(false);
    setLowCompetition(false);
    setSearchParams({});
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-violet-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Search console</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Filter database roles, scan competitive rates, and deploy applications instantly.</p>
        </div>
        {!hasResume && (
          <div className="p-4 rounded-2xl bg-amber-955/20 border border-amber-500/20 text-amber-400 text-xxs flex items-center space-x-2.5 animate-pulse">
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

      {/* Main Search Panel Form */}
      <form onSubmit={handleSearchSubmit} className="p-[1px] rounded-3xl bg-gradient-to-r from-white/10 to-transparent shadow-xl">
        <div className="bg-slate-950/80 backdrop-blur-2xl p-4 sm:p-5 rounded-[23px] flex flex-col md:flex-row gap-4 items-center">
          <div className="w-full md:flex-grow relative group">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Keywords, skills, company name..."
              className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
            />
          </div>
          <div className="w-full md:w-64 relative group">
            <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location, country, remote..."
              className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
            />
          </div>
          <button
            type="submit"
            className="w-full md:w-auto px-7 py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-400 text-white font-extrabold text-xs uppercase tracking-widest rounded-2xl transition-all shadow-md active:scale-95 shrink-0 flex items-center justify-center space-x-2 cursor-pointer"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <span>Search</span>}
          </button>
        </div>
      </form>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 p-[1.5px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl">
          <div className="bg-slate-950/80 backdrop-blur-2xl p-6 rounded-[23px] space-y-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={12} /> Filter Console
              </span>
              <button 
                type="button" 
                onClick={clearFilters}
                className="text-[10px] text-violet-400 hover:underline font-extrabold uppercase tracking-wide cursor-pointer animate-pulse"
              >
                Reset
              </button>
            </div>

            {/* Job type (remote/hybrid/onsite) */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Placement Mode</h4>
              <div className="space-y-2">
                {[['remote', 'Remote'], ['hybrid', 'Hybrid'], ['onsite', 'On-site']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-xs text-slate-350 cursor-pointer hover:text-white transition-colors font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(val)}
                      onChange={() => handleToggleJobType(val)}
                      className="rounded border-white/10 bg-slate-900 text-violet-650 focus:ring-violet-500/40 w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment type */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Employment Nature</h4>
              <div className="space-y-2">
                {[['full_time', 'Full-time'], ['part_time', 'Part-time'], ['internship', 'Internship'], ['contract', 'Contract']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-xs text-slate-350 cursor-pointer hover:text-white transition-colors font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedEmpTypes.includes(val)}
                      onChange={() => handleToggleEmpType(val)}
                      className="rounded border-white/10 bg-slate-900 text-violet-655 focus:ring-violet-500/40 w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience level */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Seniority Level</h4>
              <div className="space-y-2">
                {[['fresher', 'Fresher'], ['junior', 'Junior'], ['mid', 'Mid'], ['senior', 'Senior'], ['lead', 'Lead']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-xs text-slate-355 cursor-pointer hover:text-white transition-colors font-semibold">
                    <input
                      type="checkbox"
                      checked={selectedExpLevels.includes(val)}
                      onChange={() => handleToggleExpLevel(val)}
                      className="rounded border-white/10 bg-slate-900 text-violet-655 focus:ring-violet-500/40 w-4 h-4 cursor-pointer"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Company type */}
            <div className="space-y-3">
              <h4 className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Company Scale</h4>
              <div className="flex gap-2 p-1 bg-slate-900/60 border border-white/5 rounded-xl">
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
                        ? 'bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white font-black shadow-md' 
                        : 'text-slate-400 hover:text-white'
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

        {/* Search Results list */}
        <div className="lg:col-span-3 text-left">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
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
            <div className="text-center py-20 bg-slate-950/80 border border-violet-500/20 rounded-3xl flex flex-col items-center justify-center p-8 space-y-6 backdrop-blur-2xl shadow-xl">
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
                return (
                  <div 
                    key={job.id} 
                    className="p-[1px] rounded-3xl bg-gradient-to-br from-white/5 hover:from-violet-500/20 to-transparent shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <div 
                      className="bg-slate-950/80 backdrop-blur-3xl p-6 rounded-[23px] h-full flex flex-col justify-between cursor-pointer relative group"
                      onClick={() => setDrawerJob(job)}
                    >
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="inline-flex px-2.5 py-0.5 bg-violet-600/10 border border-violet-500/20 rounded-md text-[9px] font-black uppercase text-violet-405 tracking-wider">
                                {job.job_type}
                              </span>
                              <span className="inline-flex px-2.5 py-0.5 bg-cyan-600/10 border border-cyan-500/20 rounded-md text-[9px] font-black uppercase text-cyan-400">
                                98% Match
                              </span>
                            </div>
                            <h3 className="text-base font-black text-white group-hover:text-violet-400 transition-colors mt-3 leading-snug truncate">
                              {job.title}
                            </h3>
                            <p className="text-slate-400 text-xxs font-semibold mt-0.5 truncate">{job.company.name}</p>
                          </div>
                          <CompanyLogo company={job.company} className="w-11 h-11 shrink-0 shadow-lg" />
                        </div>

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
                      </div>

                      <div className="mt-6 flex justify-between items-center text-slate-550 text-[9px] border-t border-white/5 pt-4 font-black uppercase tracking-widest">
                        {isAlreadyApplied ? (
                          <span className="text-emerald-450 flex items-center gap-0.5">
                            <Check size={10} /> Match Applied
                          </span>
                        ) : (
                          <span className="text-slate-400 group-hover:text-white transition-colors">Apply</span>
                        )}
                        <span className="text-violet-405 group-hover:translate-x-1.5 transition-transform flex items-center gap-1">
                          Open Details <ArrowRight size={10} />
                        </span>
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
              className="relative w-full max-w-lg bg-slate-950 border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="min-w-0">
                  <h3 className="text-2xl font-black text-white leading-tight truncate">{drawerJob.title}</h3>
                  <p className="text-violet-400 font-extrabold text-sm mt-1 truncate">{drawerJob.company.name}</p>
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
                      className="w-full p-4 rounded-xl bg-slate-955/70 border border-white/10 text-slate-350 text-xs leading-relaxed outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/5 transition-all font-semibold"
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
