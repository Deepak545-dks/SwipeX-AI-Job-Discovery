import React, { useEffect, useState } from 'react';
import { 
  Search, MapPin, DollarSign, Briefcase, Clock, 
  GraduationCap, Loader2, Sparkles, Filter, ChevronDown, 
  X, Check, AlertCircle, FileText, Copy 
} from 'lucide-react';
import api from '../utils/api';
import { Link, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import AiSkillGapWidget from '../components/AiSkillGapWidget';
import AiInterviewModal from '../components/AiInterviewModal';

// Fallback Company Logo component
const CompanyLogo = ({ company, className = "w-10 h-10" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-violet-400 font-extrabold text-xs uppercase shrink-0 shadow-inner`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-lg object-contain bg-white/5 p-1 border border-slate-800 shrink-0`}
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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Advanced Job Search</h1>
          <p className="text-slate-400 text-sm mt-1">Explore matching roles, filter by competition rate, and apply instantly</p>
        </div>
        {!hasResume && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-850 text-amber-300 text-xs flex items-center space-x-2 animate-pulse">
            <AlertCircle size={16} />
            <span>Missing resume? <Link to="/profile" className="underline font-bold text-white focus-visible:ring-2 focus-visible:ring-violet-500 rounded">Upload here</Link></span>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 font-bold focus-visible:ring-2 focus-visible:ring-red-500 rounded">&times;</button>
        </div>
      )}

      {/* Main Search Panel Form */}
      <form onSubmit={handleSearchSubmit} className="bg-slate-900/60 border border-slate-800 p-4 sm:p-6 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 items-center backdrop-blur-md">
        <div className="w-full md:flex-grow relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keywords, job titles, or companies..."
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500"
          />
        </div>
        <div className="w-full md:w-64 relative">
          <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location / Remote..."
            className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-xl py-3 pl-12 pr-4 text-white text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-violet-500"
          />
        </div>
        <button
          type="submit"
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-violet-500/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500 shrink-0 flex items-center justify-center space-x-2"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <span>Find Jobs</span>}
        </button>
      </form>

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-4 border-b border-slate-850">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Filter size={16} /> Filters
              </span>
              <button 
                type="button" 
                onClick={clearFilters}
                className="text-xs text-violet-400 hover:underline font-bold focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
              >
                Reset
              </button>
            </div>

            {/* Job type (remote/hybrid/onsite) */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Placement</h4>
              <div className="space-y-2">
                {[['remote', 'Remote'], ['hybrid', 'Hybrid'], ['onsite', 'On-site']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedJobTypes.includes(val)}
                      onChange={() => handleToggleJobType(val)}
                      className="rounded border-slate-800 bg-slate-950/65 text-violet-600 focus:ring-violet-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment type */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Nature</h4>
              <div className="space-y-2">
                {[['full_time', 'Full-time'], ['part_time', 'Part-time'], ['internship', 'Internship'], ['contract', 'Contract']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedEmpTypes.includes(val)}
                      onChange={() => handleToggleEmpType(val)}
                      className="rounded border-slate-800 bg-slate-950/65 text-violet-600 focus:ring-violet-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Experience level */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Seniority</h4>
              <div className="space-y-2">
                {[['fresher', 'Fresher'], ['junior', 'Junior'], ['mid', 'Mid'], ['senior', 'Senior'], ['lead', 'Lead']].map(([val, label]) => (
                  <label key={val} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={selectedExpLevels.includes(val)}
                      onChange={() => handleToggleExpLevel(val)}
                      className="rounded border-slate-800 bg-slate-950/65 text-violet-600 focus:ring-violet-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Company type */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Company Structure</h4>
              <div className="flex gap-2">
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
                    className={`flex-grow py-1.5 px-3 rounded-lg text-xxs font-bold uppercase transition-all focus-visible:ring-2 focus-visible:ring-violet-500 ${
                      companyType === val 
                        ? 'bg-violet-600 text-white shadow-sm' 
                        : 'bg-slate-950/60 border border-slate-855 text-slate-400 hover:text-white'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Special filters toggles */}
            <div className="space-y-3 border-t border-slate-850 pt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advanced Options</h4>
              <div className="space-y-3">
                <label className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={recentlyPosted}
                    onChange={(e) => {
                      setRecentlyPosted(e.target.checked);
                      syncParamsToUrl({ recentlyPosted: e.target.checked });
                    }}
                    className="rounded border-slate-800 bg-slate-950/65 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Recently Posted (7d)</span>
                </label>

                <label className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={lowCompetition}
                    onChange={(e) => {
                      setLowCompetition(e.target.checked);
                      syncParamsToUrl({ lowCompetition: e.target.checked });
                    }}
                    className="rounded border-slate-800 bg-slate-950/65 text-violet-600 focus:ring-violet-500"
                  />
                  <span>Low Competition (&lt;5 apps)</span>
                </label>
              </div>
            </div>

          </div>
        </div>

        {/* Search Results list */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 w-3/4">
                      <div className="h-4 rounded w-1/3 animate-shimmer" />
                      <div className="h-6 rounded w-3/4 animate-shimmer" />
                      <div className="h-4 rounded w-1/2 animate-shimmer" />
                    </div>
                    <div className="w-10 h-10 rounded-lg animate-shimmer" />
                  </div>
                  <div className="h-4 rounded w-full animate-shimmer mt-4" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-850 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                <Search size={32} className="animate-pulse" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">No Matching Roles Found</p>
                <p className="text-slate-500 text-xs mt-1 max-w-sm leading-relaxed">
                  We couldn't find any job listings matching your current criteria. Try tweaking search keywords or resetting filters.
                </p>
              </div>
              <button 
                onClick={clearFilters}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs font-semibold rounded-xl border border-slate-800 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <div 
                  key={job.id} 
                  className="bg-slate-900/40 border border-slate-850 hover:border-violet-500/30 p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-all shadow-md group relative cursor-pointer focus-visible:ring-2 focus-visible:ring-violet-500"
                  onClick={() => setDrawerJob(job)}
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setDrawerJob(job); }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="inline-flex px-2 py-0.5 bg-violet-600/10 border border-violet-500/20 rounded-md text-xxs font-extrabold uppercase text-violet-400 tracking-wider">
                            {job.job_type}
                          </span>
                          {job.company.company_type === 'startup' && (
                            <span className="inline-flex px-2 py-0.5 bg-fuchsia-600/10 border border-fuchsia-500/20 rounded-md text-xxs font-bold text-fuchsia-400">
                              Startup
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-black text-white group-hover:text-violet-400 transition-colors mt-2.5 leading-snug truncate">
                          {job.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5 truncate">{job.company.name}</p>
                      </div>
                      <CompanyLogo company={job.company} className="w-10 h-10 shrink-0" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-5 border-t border-slate-850/60 pt-4">
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                        <MapPin size={13} className="text-slate-500" />
                        <span className="truncate">{job.location}</span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                        <DollarSign size={13} className="text-slate-500" />
                        <span className="truncate text-white font-semibold">
                          {job.salary_min ? `$${(job.salary_min/1000)}k` : 'Neg'}
                          {job.job_type === 'remote' ? ' / yr' : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {job.skills_required.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-0.5 rounded bg-slate-950/60 border border-slate-850 text-slate-400 text-xxs">
                          {skill}
                        </span>
                      ))}
                      {job.skills_required.length > 3 && (
                        <span className="px-2 py-0.5 text-slate-500 text-xxs font-semibold">
                          +{job.skills_required.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-850/60 mt-6 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => setDrawerJob(job)}
                      className="text-xs text-slate-400 hover:text-white font-semibold focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                    >
                      Read Details
                    </button>

                    {appliedJobIds.includes(job.id) ? (
                      <span className="flex items-center space-x-1 text-emerald-400 text-xs font-semibold">
                        <Check size={14} />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleApplyJob(job.id)}
                        disabled={applyingId === job.id}
                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-30 flex items-center space-x-1.5"
                      >
                        {applyingId === job.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" />
                            <span>Applying...</span>
                          </>
                        ) : (
                          <span>Apply Now</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details Slide-out side drawer */}
      {drawerJob && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 flex justify-end items-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setDrawerJob(null)} />
          
          <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start gap-4">
              <div className="min-w-0">
                <h3 className="text-2xl font-black text-white leading-tight truncate">{drawerJob.title}</h3>
                <p className="text-slate-300 font-bold text-base mt-1 truncate">{drawerJob.company.name}</p>
              </div>
              <button
                onClick={() => setDrawerJob(null)}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-y border-slate-800 py-4">
              <div className="flex items-center space-x-1.5">
                <MapPin size={15} />
                <span>{drawerJob.location}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-white font-bold">
                <DollarSign size={15} />
                <span>
                  {drawerJob.salary_min ? `$${drawerJob.salary_min.toLocaleString()}` : 'Negotiable'}
                  {drawerJob.salary_max ? ` - $${drawerJob.salary_max.toLocaleString()}` : ''}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 capitalize">
                <Briefcase size={15} />
                <span>{drawerJob.employment_type.replace('_', ' ')} ({drawerJob.job_type})</span>
              </div>
              <div className="flex items-center space-x-1.5 capitalize">
                <GraduationCap size={15} />
                <span>{drawerJob.experience_level.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">About the Role</h4>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{drawerJob.description}</p>
            </div>

            {drawerJob.requirements && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Key Requirements</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{drawerJob.requirements}</p>
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Full Skills Stack</h4>
              <div className="flex flex-wrap gap-2">
                {drawerJob.skills_required.map((skill) => (
                  <span key={skill} className="px-3 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-300 text-xs font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Skill Gap Analysis Widget */}
            <AiSkillGapWidget jobId={drawerJob.id} />

            {/* AI Tools Bar (Cover Letter & Interview Questions) */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-850 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <button
                  onClick={handleGenerateCoverLetter}
                  disabled={generatingCoverLetter}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-violet-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50"
                >
                  {generatingCoverLetter ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Writing Cover Letter...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={14} />
                      <span>{coverLetter ? 'Regenerate AI Cover Letter' : 'Generate AI Cover Letter'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowInterviewModal(true)}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-violet-400 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
                >
                  <Sparkles size={14} />
                  <span>Practice Interview Questions</span>
                </button>
              </div>

              {coverLetter && (
                <div className="space-y-2 pt-2 border-t border-slate-850/60 animate-fade-in">
                  <div className="flex justify-between items-center">
                    <span className="text-xxs font-bold uppercase tracking-wider text-slate-400">Generated Cover Letter</span>
                    <button
                      onClick={handleCopyCoverLetter}
                      className="text-xs text-violet-400 hover:underline flex items-center gap-1 font-bold focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                    >
                      <Copy size={12} />
                      <span>Copy</span>
                    </button>
                  </div>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={6}
                    className="w-full p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs leading-relaxed outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-slate-800 flex justify-end">
              {appliedJobIds.includes(drawerJob.id) ? (
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold text-sm">
                  <Check size={16} />
                  <span>Applied Successfully</span>
                </span>
              ) : (
                <button
                  onClick={() => handleApplyJob(drawerJob.id)}
                  disabled={applyingId === drawerJob.id}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-violet-500/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-30 flex items-center space-x-2"
                >
                  {applyingId === drawerJob.id ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Apply Instantly</span>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
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
