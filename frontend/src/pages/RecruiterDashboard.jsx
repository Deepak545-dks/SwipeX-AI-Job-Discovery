import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Plus, Trash2, Edit, Check, Star, Loader2, DollarSign, 
  MapPin, Calendar, Clock, Users, Briefcase, CheckCircle, 
  ArrowRight, MessageSquare, AlertCircle, Building, Globe, Shield, Sparkles, Inbox, RefreshCw, Target, Cpu, Trash
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState('jobs');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Analytics stats
  const [stats, setStats] = useState({
    total_jobs: 0,
    active_jobs: 0,
    total_applicants: 0,
    hire_rate: 0
  });

  // Applicants pipeline
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Job creation/edit states
  const [editingJobId, setEditingJobId] = useState(null);
  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyType, setCompanyType] = useState('mnc');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('onsite');
  const [employmentType, setEmploymentType] = useState('full_time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [skillsRequired, setSkillsRequired] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [jobStatus, setJobStatus] = useState('published');

  // Company profile states
  const [companyId, setCompanyId] = useState(null);
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyEmployeeCount, setCompanyEmployeeCount] = useState('');
  const [companyHeadquarters, setCompanyHeadquarters] = useState('');
  const [companyFoundedYear, setCompanyFoundedYear] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);

  // Status Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/jobs/recruiter-analytics/');
      setStats(response.data);
    } catch (err) {
      console.error('Failed to load recruiter analytics', err);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await api.get('/jobs/recruiter-jobs/');
      const list = response.data.results || response.data;
      setJobs(list);

      // Auto-extract first available company profile details for editing
      if (list.length > 0 && list[0].company) {
        const comp = list[0].company;
        setCompanyId(comp.id);
        setCompanyName(comp.name);
        setCompanyWebsite(comp.website || '');
        setCompanyDescription(comp.description || '');
        setCompanyLogoUrl(comp.logo_url || '');
        setCompanyType(comp.company_type || 'mnc');
        setCompanyIndustry(comp.industry || '');
        setCompanyEmployeeCount(comp.employee_count || '');
        setCompanyHeadquarters(comp.headquarters || '');
        setCompanyFoundedYear(comp.founded_year || '');
      }
    } catch (err) {
      setError('Failed to fetch posted jobs.');
    } finally {
      setLoading(false);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([fetchAnalytics(), fetchJobs()]);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSelectJob = async (job) => {
    setSelectedJob(job);
    setLoadingApplicants(true);
    setError('');
    try {
      const response = await api.get(`/jobs/${job.id}/applicants/`);
      setApplicants(response.data.results || response.data);
      setActiveTab('applicants');
    } catch (err) {
      setError('Failed to load applicants for this job.');
    } finally {
      setLoadingApplicants(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.patch(`/jobs/applications/${appId}/status/`, { status: newStatus });
      setApplicants(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      fetchAnalytics();
    } catch (err) {
      setError('Failed to update applicant status.');
    }
  };

  const handleEditJob = (job) => {
    setEditingJobId(job.id);
    setTitle(job.title);
    setCompanyName(job.company.name);
    setCompanyType(job.company.company_type);
    setDescription(job.description);
    setRequirements(job.requirements || '');
    setSalaryMin(job.salary_min || '');
    setSalaryMax(job.salary_max || '');
    setLocation(job.location);
    setJobType(job.job_type);
    setEmploymentType(job.employment_type);
    setExperienceLevel(job.experience_level);
    setSkillsRequired(job.skills_required || []);
    setJobStatus(job.status || 'published');
    
    setError('');
    setMessage('');
    setActiveTab('create-job');
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.delete(`/jobs/${jobId}/`);
      setJobs(prev => prev.filter(j => j.id !== jobId));
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
        setApplicants([]);
      }
      fetchAnalytics();
    } catch (err) {
      setError('Failed to delete job posting.');
    }
  };

  const handleAddSkillTag = (e) => {
    e.preventDefault();
    const tag = skillInput.trim();
    if (tag && !skillsRequired.includes(tag)) {
      setSkillsRequired([...skillsRequired, tag]);
      setSkillInput('');
    }
  };

  const handleRemoveSkillTag = (tag) => {
    setSkillsRequired(skillsRequired.filter(t => t !== tag));
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!title || !companyName || !description || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    const payload = {
      title,
      company_name: companyName,
      company_type: companyType,
      description,
      requirements,
      salary_min: salaryMin ? parseInt(salaryMin) : null,
      salary_max: salaryMax ? parseInt(salaryMax) : null,
      location,
      job_type: jobType,
      employment_type: employmentType,
      experience_level: experienceLevel,
      skills_required: skillsRequired,
      status: jobStatus
    };

    try {
      if (editingJobId) {
        await api.put(`/jobs/${editingJobId}/`, payload);
        setMessage('Job posting updated successfully!');
      } else {
        await api.post('/jobs/', payload);
        setMessage('New job posting published successfully!');
      }
      resetJobForm();
      fetchJobs();
      fetchAnalytics();
      setTimeout(() => {
        setActiveTab('jobs');
        setMessage('');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save job listing.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setSavingCompany(true);
    setError('');
    setMessage('');

    const payload = {
      name: companyName,
      website: companyWebsite,
      description: companyDescription,
      logo_url: companyLogoUrl,
      company_type: companyType,
      industry: companyIndustry,
      employee_count: companyEmployeeCount ? parseInt(companyEmployeeCount) : null,
      headquarters: companyHeadquarters,
      founded_year: companyFoundedYear ? parseInt(companyFoundedYear) : null
    };

    try {
      await api.put(`/jobs/companies/${companyId}/`, payload);
      setMessage('Company details updated successfully!');
      fetchJobs();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError('Failed to update company credentials.');
    } finally {
      setSavingCompany(false);
    }
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setTitle('');
    setDescription('');
    setRequirements('');
    setSalaryMin('');
    setSalaryMax('');
    setLocation('');
    setJobType('onsite');
    setEmploymentType('full_time');
    setExperienceLevel('mid');
    setSkillsRequired([]);
    setJobStatus('published');
  };

  // Filter jobs based on status selection
  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  if (loading) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm h-72 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl">
          <Loader2 className="animate-spin text-violet-400" size={32} />
          <span className="text-slate-550 text-xxs font-extrabold uppercase tracking-widest mt-4">Syncing Console...</span>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-10 relative z-10">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-violet-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Recruiter Operations Hub</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Publish roles, verify candidate swipe matches, and configure company details.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { resetJobForm(); setActiveTab('create-job'); }}
            className="flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-550 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg shadow-violet-650/20 active:scale-95 cursor-pointer uppercase tracking-wider"
          >
            <Plus size={14} />
            <span>Post New Job</span>
          </button>
        </div>
      </div>

      {/* Analytics stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Postings', val: stats.total_jobs || 0, icon: Briefcase, color: 'text-violet-400 bg-violet-500/10 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.05)]' },
          { label: 'Active Openings', val: stats.active_jobs || 0, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]' },
          { label: 'Swipe Matches', val: stats.total_applicants || 0, icon: Users, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.05)]' },
          { label: 'Interview Match Rate', val: `${stats.hire_rate || 0}%`, icon: Clock, color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.05)]' }
        ].map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="p-[1px] rounded-2xl bg-gradient-to-tr from-white/5 to-transparent">
              <div className="p-6 rounded-2xl bg-slate-950/80 backdrop-blur-2xl text-left relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">{st.label}</span>
                  <div className={`p-2 rounded-lg border ${st.color}`}>
                    <Icon size={14} />
                  </div>
                </div>
                <span className="text-3xl font-black text-white">{st.val}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Primary tabs buttons navigation */}
      <div className="flex border-b border-white/10 overflow-x-auto whitespace-nowrap scrollbar-none">
        {[
          { id: 'jobs', label: 'Active Listings' },
          { id: 'applicants', label: 'Candidate Pipeline', disabled: !selectedJob },
          { id: 'create-job', label: editingJobId ? 'Edit Job' : 'Post New Job' },
          { id: 'company-profile', label: 'Company Credentials' }
        ].map(tab => (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => { setActiveTab(tab.id); setError(''); setMessage(''); }}
            className={`py-4 px-6 text-xs font-extrabold border-b-2 transition-all cursor-pointer uppercase tracking-widest ${
              tab.disabled ? 'opacity-25 cursor-not-allowed' : ''
            } ${
              activeTab === tab.id
                ? 'border-violet-500 text-violet-400 font-black'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-455 text-xs font-bold text-left">
          {error}
        </div>
      )}

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-455 text-xs font-bold text-left flex items-center space-x-2 animate-pulse">
          <CheckCircle size={14} />
          <span>{message}</span>
        </div>
      )}

      {/* Main Tab Panels */}
      <div className="p-[1.5px] rounded-3xl bg-gradient-to-tr from-violet-500/20 via-fuchsia-500/20 to-cyan-500/25 shadow-2xl">
        <div className="bg-slate-955/90 rounded-[23px] p-6 sm:p-8 backdrop-blur-2xl shadow-xl min-h-[40vh]">
          
          {/* PANEL 1: Job listings */}
          {activeTab === 'jobs' && (
            <div className="animate-fade-in text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <h3 className="text-base font-black text-white tracking-tight">Postings Directory</h3>
                
                {/* Filter controls */}
                <div className="flex gap-1.5 p-1 bg-slate-950 border border-white/10 rounded-xl self-start sm:self-auto">
                  {['all', 'published', 'draft', 'expired'].map(statusKey => (
                    <button
                      key={statusKey}
                      onClick={() => setStatusFilter(statusKey)}
                      className={`px-3.5 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                        statusFilter === statusKey
                          ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-black shadow-md'
                          : 'text-slate-450 hover:text-white'
                      }`}
                    >
                      {statusKey}
                    </button>
                  ))}
                </div>
              </div>

              {filteredJobs.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/20 rounded-2xl border border-white/10">
                  <p className="text-slate-500 text-xs">No jobs published match this state.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-350">
                    <thead className="text-[10px] uppercase tracking-widest text-slate-500 border-b border-white/10">
                      <tr>
                        <th className="py-4 px-4 font-extrabold">Job Title</th>
                        <th className="py-4 px-4 font-extrabold">Company</th>
                        <th className="py-4 px-4 font-extrabold">Location</th>
                        <th className="py-4 px-4 font-extrabold">Salary Range</th>
                        <th className="py-4 px-4 font-extrabold">Status</th>
                        <th className="py-4 px-4 text-right font-extrabold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-semibold">
                      {filteredJobs.map((job) => {
                        const isDraft = job.status === 'draft';
                        const isExpired = job.status === 'expired';
                        const isPub = job.status === 'published';

                        return (
                          <tr key={job.id} className="hover:bg-white/5 transition-colors">
                            <td className="py-4 px-4 font-black text-white cursor-pointer hover:text-violet-400" onClick={() => handleSelectJob(job)}>
                              {job.title}
                            </td>
                            <td className="py-4 px-4 text-slate-400">{job.company.name}</td>
                            <td className="py-4 px-4">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={12} className="text-slate-550" />
                                <span>{job.location}</span>
                              </span>
                            </td>
                            <td className="py-4 px-4 font-bold text-slate-300">
                              {job.salary_min ? `$${(job.salary_min/1000)}k` : 'N/A'}
                              {job.salary_max ? ` - $${(job.salary_max/1000)}k` : ''}
                            </td>
                            <td className="py-4 px-4">
                              <span className={`inline-flex px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                                isPub 
                                  ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-450' 
                                  : isDraft 
                                    ? 'bg-slate-900 border-white/5 text-slate-400' 
                                    : 'bg-red-950/40 border-red-900/50 text-red-400'
                              }`}>
                                {job.status || 'published'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex justify-end items-center space-x-4">
                                <button
                                  onClick={() => handleSelectJob(job)}
                                  className="text-violet-400 hover:text-violet-300 text-xs font-black cursor-pointer uppercase tracking-wider"
                                >
                                  Pipeline
                                </button>
                                <button
                                  onClick={() => handleEditJob(job)}
                                  className="text-slate-500 hover:text-violet-400 p-1 cursor-pointer transition-colors"
                                  title="Edit Posting"
                                >
                                  <Edit size={13} />
                                </button>
                                <button
                                  onClick={() => handleDeleteJob(job.id)}
                                  className="text-slate-500 hover:text-red-450 p-1 cursor-pointer transition-colors"
                                  title="Delete Posting"
                                >
                                  <Trash size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* PANEL 2: Applicants pipeline */}
          {activeTab === 'applicants' && selectedJob && (
            <div className="animate-fade-in text-left">
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight">Candidates for {selectedJob.title}</h3>
                  <p className="text-slate-400 text-xs mt-1">Review candidates who right-swiped this listing.</p>
                </div>
                <button
                  onClick={() => setActiveTab('jobs')}
                  className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-slate-400 hover:text-white text-xs font-bold cursor-pointer transition-colors"
                >
                  Back Directory
                </button>
              </div>

              {loadingApplicants ? (
                <div className="flex justify-center py-12">
                  <Loader2 size={24} className="animate-spin text-violet-500" />
                </div>
              ) : applicants.length === 0 ? (
                <div className="text-center py-16 bg-slate-950/20 border border-white/10 rounded-2xl">
                  <p className="text-slate-500 text-xs">No candidates have matching right swipes yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicants.map((app) => (
                    <div key={app.id} className="p-6 bg-slate-950/40 border border-white/10 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-sm font-bold text-white">
                            {app.applicant_profile?.full_name || app.applicant?.email}
                          </h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            app.status === 'accepted' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-450' :
                            app.status === 'rejected' ? 'bg-red-950/30 border-red-900/50 text-red-400' :
                            app.status === 'shortlisted' ? 'bg-indigo-950/30 border-indigo-900/50 text-indigo-400' :
                            'bg-amber-955/30 border-amber-900/50 text-amber-400'
                          }`}>
                            {app.status}
                          </span>
                        </div>
                        <p className="text-slate-500 text-xxs font-semibold">{app.applicant?.email} {app.applicant_profile?.phone && `• ${app.applicant_profile.phone}`}</p>
                        {app.applicant_profile?.bio && (
                          <p className="text-slate-400 text-xs mt-1.5 leading-relaxed max-w-2xl bg-slate-950 border border-white/5 p-4 rounded-xl font-semibold">{app.applicant_profile.bio}</p>
                        )}
                        
                        {app.cover_letter && (
                          <div className="p-4 bg-slate-950 border border-white/5 rounded-xl text-xxs text-slate-400 max-w-2xl font-semibold">
                            <span className="font-bold text-white block mb-1">Applicant cover note:</span>
                            {app.cover_letter}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
                        {app.resume && (
                          <a
                            href={app.resume_details?.file}
                            target="_blank"
                            rel="noreferrer"
                            className="px-4 py-2 border border-white/10 hover:bg-white/5 rounded-xl text-slate-300 hover:text-white text-xs font-bold flex items-center space-x-1.5 transition-colors"
                          >
                            <FileText size={13} />
                            <span>CV v{app.resume_details?.version}</span>
                          </a>
                        )}
                        
                        <div className="flex items-center space-x-2 border-l border-white/10 pl-3">
                          {app.status !== 'rejected' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'rejected')}
                              className="p-2 border border-white/10 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-xl transition-colors cursor-pointer"
                              title="Reject Candidate"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                          {app.status !== 'shortlisted' && app.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                              className="px-3.5 py-2.5 bg-slate-950 hover:bg-white/5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-xs font-extrabold cursor-pointer transition-colors"
                            >
                              Shortlist
                            </button>
                          )}
                          {app.status !== 'accepted' && (
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'accepted')}
                              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors cursor-pointer"
                              title="Accept Match"
                            >
                              <Check size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PANEL 3: Company Profile editor */}
          {activeTab === 'company-profile' && companyId && (
            <div className="animate-fade-in text-left">
              <h3 className="text-base font-black text-white tracking-tight mb-1">Company Credentials</h3>
              <p className="text-slate-400 text-xs mb-6">Manage corporate identity details</p>

              <form onSubmit={handleSaveCompany} className="space-y-5 max-w-4xl">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-widest mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Website URL</label>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="https://mycompany.com"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Industry</label>
                    <input
                      type="text"
                      value={companyIndustry}
                      onChange={(e) => setCompanyIndustry(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. Artificial Intelligence"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Headquarters</label>
                    <input
                      type="text"
                      value={companyHeadquarters}
                      onChange={(e) => setCompanyHeadquarters(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Company Type</label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="startup">Startup</option>
                      <option value="mnc">MNC</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Employees Count</label>
                    <input
                      type="number"
                      value={companyEmployeeCount}
                      onChange={(e) => setCompanyEmployeeCount(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Founded Year</label>
                    <input
                      type="number"
                      value={companyFoundedYear}
                      onChange={(e) => setCompanyFoundedYear(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. 2024"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Logo Image URL</label>
                    <input
                      type="url"
                      value={companyLogoUrl}
                      onChange={(e) => setCompanyLogoUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="https://logo.url/logo.png"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">About Description</label>
                  <textarea
                    value={companyDescription}
                    onChange={(e) => setCompanyDescription(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none resize-none transition-all placeholder-slate-555 font-semibold"
                    placeholder="Describe your organization's vision..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingCompany}
                  className="px-6 py-3.5 bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                >
                  {savingCompany ? 'Saving...' : 'Save Corporate Profile'}
                </button>
              </form>
            </div>
          )}

          {/* PANEL 4: Create/Edit Job wizard */}
          {activeTab === 'create-job' && (
            <div className="animate-fade-in text-left">
              <h3 className="text-base font-black text-white tracking-tight mb-5">
                {editingJobId ? 'Edit Job Posting' : 'Post New Job'}
              </h3>
              <form onSubmit={handleCreateJob} className="space-y-5">
                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-widest mb-2">Job Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. Core AI Engineer"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Company Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. NVIDIA"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Company Category</label>
                    <select
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="startup">Startup</option>
                      <option value="mnc">MNC</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Job Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => setJobType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="onsite">Onsite</option>
                      <option value="hybrid">Hybrid</option>
                      <option value="remote">Remote</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Employment Type</label>
                    <select
                      value={employmentType}
                      onChange={(e) => setEmploymentType(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="full_time">Full-time</option>
                      <option value="part_time">Part-time</option>
                      <option value="internship">Internship</option>
                      <option value="contract">Contract</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Experience level</label>
                    <select
                      value={experienceLevel}
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="fresher">Fresher</option>
                      <option value="junior">Junior</option>
                      <option value="mid">Mid</option>
                      <option value="senior">Senior</option>
                      <option value="lead">Lead</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Posting status</label>
                    <select
                      value={jobStatus}
                      onChange={(e) => setJobStatus(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all font-semibold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                      <option value="expired">Expired</option>
                    </select>
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-widest mb-2">Location *</label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. Santa Clara, CA"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Min Salary ($)</label>
                    <input
                      type="number"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. 120000"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Max Salary ($)</label>
                    <input
                      type="number"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="e.g. 180000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Technical Skills Required</label>
                  <div className="flex gap-3 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-grow bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-555 font-semibold"
                      placeholder="e.g. PyTorch, CUDA, Docker"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkillTag}
                      className="px-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-2xl text-xs font-extrabold hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                    >
                      Add tag
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {skillsRequired.map(skill => (
                      <span key={skill} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xxs font-extrabold">
                        <span>{skill}</span>
                        <button type="button" onClick={() => handleRemoveSkillTag(skill)} className="text-slate-550 hover:text-white">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Job Description *</label>
                  <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none resize-none transition-all placeholder-slate-555 font-semibold"
                    placeholder="Describe role directives..."
                  />
                </div>

                <div>
                  <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Key Requirements</label>
                  <textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none resize-none transition-all placeholder-slate-555 font-semibold"
                    placeholder="Describe minimum education, experience years, system tools familiarity..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3.5 bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {submitting ? 'Publishing...' : editingJobId ? 'Save Changes' : 'Publish Job Listing'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { resetJobForm(); setActiveTab('jobs'); }}
                    className="px-5 py-3.5 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white text-xs font-extrabold rounded-2xl transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
