import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Plus, Trash2, Edit, Check, Star, Loader2, DollarSign, 
  MapPin, Calendar, Clock, Users, Briefcase, CheckCircle, 
  ArrowRight, MessageSquare, AlertCircle, Building, Globe, Shield 
} from 'lucide-react';

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
        setMessage('Job posted successfully!');
      }

      resetJobForm();
      await loadAll();
      
      setTimeout(() => {
        setActiveTab('jobs');
        setMessage('');
      }, 2000);
    } catch (err) {
      setError('Failed to save job posting. Please check options.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetJobForm = () => {
    setEditingJobId(null);
    setTitle('');
    setCompanyName('');
    setCompanyType('mnc');
    setDescription('');
    setRequirements('');
    setSalaryMin('');
    setSalaryMax('');
    setLocation('');
    setSkillsRequired([]);
    setJobStatus('published');
  };

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setSavingCompany(true);
    setError('');
    setMessage('');
    try {
      await api.put(`/jobs/companies/${companyId}/`, {
        name: companyName,
        website: companyWebsite,
        description: companyDescription,
        logo_url: companyLogoUrl,
        company_type: companyType,
        industry: companyIndustry,
        employee_count: companyEmployeeCount ? parseInt(companyEmployeeCount) : null,
        headquarters: companyHeadquarters,
        founded_year: companyFoundedYear ? parseInt(companyFoundedYear) : null
      });
      setMessage('Company profile updated successfully.');
      await loadAll();
    } catch (err) {
      setError('Failed to update company details.');
    } finally {
      setSavingCompany(false);
    }
  };

  // Local status filtering
  const filteredJobs = jobs.filter(job => {
    if (statusFilter === 'all') return true;
    return job.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 size={48} className="animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 pb-6 border-b border-slate-850">
        <div>
          <h1 className="text-3xl font-black text-white">Recruiter Control Hub</h1>
          <p className="text-slate-400 text-sm mt-1">Manage listings, review candidates, and monitor corporate profiles</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { resetJobForm(); setActiveTab('create-job'); setError(''); setMessage(''); }}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-violet-500/20"
          >
            <Plus size={16} />
            <span>Post New Job</span>
          </button>
          <button
            onClick={() => { setActiveTab('jobs'); setError(''); setMessage(''); }}
            className={`px-5 py-3 border font-semibold text-sm rounded-xl transition-all ${
              activeTab === 'jobs' ? 'bg-slate-900 border-slate-700 text-white' : 'border-slate-800 hover:bg-slate-900 text-slate-300'
            }`}
          >
            View Listings
          </button>
          {companyId && (
            <button
              onClick={() => { setActiveTab('company-profile'); setError(''); setMessage(''); }}
              className={`px-5 py-3 border font-semibold text-sm rounded-xl transition-all ${
                activeTab === 'company-profile' ? 'bg-slate-900 border-slate-700 text-white' : 'border-slate-800 hover:bg-slate-900 text-slate-300'
              }`}
            >
              Company Profile
            </button>
          )}
        </div>
      </div>

      {/* Analytics widgets */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Listings', value: stats.total_jobs, icon: Briefcase, color: 'text-violet-400' },
          { label: 'Active Listings', value: stats.active_jobs, icon: Clock, color: 'text-emerald-400' },
          { label: 'Total Applicants', value: stats.total_applicants, icon: Users, color: 'text-fuchsia-400' },
          { label: 'Hire Rate', value: `${stats.hire_rate}%`, icon: CheckCircle, color: 'text-sky-400' }
        ].map((widget, i) => {
          const Icon = widget.icon;
          return (
            <div key={i} className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl flex items-center justify-between shadow-xl">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{widget.label}</p>
                <p className="text-3xl font-bold text-white mt-2">{widget.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-center ${widget.color}`}>
                <Icon size={22} />
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-sm flex items-center space-x-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 text-sm flex items-center space-x-2">
          <CheckCircle size={18} />
          <span>{message}</span>
        </div>
      )}

      {/* Main Tab Panels */}
      <div className="bg-slate-900/40 border border-slate-800/85 rounded-2xl p-8 backdrop-blur-md min-h-[40vh] shadow-xl">
        
        {/* PANEL 1: Job listings */}
        {activeTab === 'jobs' && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h3 className="text-xl font-bold text-white">Posted Jobs Directory</h3>
              
              {/* Filter controls */}
              <div className="flex gap-2">
                {['all', 'published', 'draft', 'expired'].map(statusKey => (
                  <button
                    key={statusKey}
                    onClick={() => setStatusFilter(statusKey)}
                    className={`px-3 py-1.5 rounded-lg text-xxs font-bold uppercase tracking-wider transition-all border ${
                      statusFilter === statusKey
                        ? 'bg-violet-600 border-violet-500 text-white'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {statusKey}
                  </button>
                ))}
              </div>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-sm">No job posts match this filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-4">Title</th>
                      <th className="py-4 px-4">Company</th>
                      <th className="py-4 px-4">Location</th>
                      <th className="py-4 px-4">Salary</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredJobs.map((job) => {
                      const isDraft = job.status === 'draft';
                      const isExpired = job.status === 'expired';
                      const isPub = job.status === 'published';

                      return (
                        <tr key={job.id} className="hover:bg-slate-850/20 transition-colors">
                          <td className="py-4 px-4 font-bold text-white cursor-pointer hover:text-violet-400" onClick={() => handleSelectJob(job)}>
                            {job.title}
                          </td>
                          <td className="py-4 px-4">{job.company.name}</td>
                          <td className="py-4 px-4">
                            <span className="flex items-center gap-1.5">
                              <MapPin size={12} className="text-slate-500" />
                              <span>{job.location}</span>
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs">
                            {job.salary_min ? `$${job.salary_min.toLocaleString()}` : 'N/A'}
                            {job.salary_max ? ` - $${job.salary_max.toLocaleString()}` : ''}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xxs font-black uppercase tracking-wider ${
                              isPub 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : isDraft 
                                  ? 'bg-slate-800/50 text-slate-400 border border-slate-700' 
                                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                              {job.status || (job.is_active ? 'published' : 'closed')}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end items-center space-x-3">
                              <button
                                onClick={() => handleSelectJob(job)}
                                className="text-violet-400 hover:text-violet-300 text-xs font-semibold"
                              >
                                Applicants
                              </button>
                              <button
                                onClick={() => handleEditJob(job)}
                                className="text-slate-500 hover:text-violet-400 p-1"
                                title="Edit Job Details"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className="text-slate-500 hover:text-red-400 p-1"
                                title="Delete Listing"
                              >
                                <Trash2 size={14} />
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

        {/* PANEL 2: Applicants list pipeline */}
        {activeTab === 'applicants' && selectedJob && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">Candidates for {selectedJob.title}</h3>
                <p className="text-slate-500 text-xs mt-1">Review right-swiped matches and application timeline logs</p>
              </div>
              <button
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-400 text-xs font-semibold"
              >
                Back to Listings
              </button>
            </div>

            {loadingApplicants ? (
              <div className="flex justify-center py-10">
                <Loader2 size={32} className="animate-spin text-violet-500" />
              </div>
            ) : applicants.length === 0 ? (
              <p className="text-slate-500 text-sm">No seekers have applied or matched this posting yet.</p>
            ) : (
              <div className="space-y-4">
                {applicants.map((app) => (
                  <div key={app.id} className="p-6 bg-slate-950/40 border border-slate-850 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-bold text-white">
                          {app.applicant_profile?.full_name || app.applicant?.email}
                        </h4>
                        <span className={`px-2.5 py-0.5 rounded-full text-xxs font-black uppercase tracking-wider ${
                          app.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          app.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          app.status === 'shortlisted' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xxs">{app.applicant?.email} {app.applicant_profile?.phone && `• ${app.applicant_profile.phone}`}</p>
                      {app.applicant_profile?.bio && (
                        <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">{app.applicant_profile.bio}</p>
                      )}
                      
                      {app.cover_letter && (
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl text-xxs text-slate-400 max-w-2xl">
                          <span className="font-bold text-white block mb-1">Cover Note:</span>
                          {app.cover_letter}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {app.resume && (
                        <a
                          href={app.resume_details?.file}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 text-xs font-semibold flex items-center space-x-1"
                        >
                          <FileText size={14} />
                          <span>CV v{app.resume_details?.version}</span>
                        </a>
                      )}
                      
                      <div className="flex items-center space-x-2 border-l border-slate-800 pl-3">
                        {app.status !== 'rejected' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                            className="p-2 bg-red-650 hover:bg-red-550 text-white rounded-lg transition-colors"
                            title="Reject Candidate"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                        {app.status !== 'shortlisted' && app.status !== 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'shortlisted')}
                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
                          >
                            Shortlist
                          </button>
                        )}
                        {app.status !== 'accepted' && (
                          <button
                            onClick={() => handleUpdateStatus(app.id, 'accepted')}
                            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors"
                            title="Accept Application"
                          >
                            <Check size={14} />
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
          <div>
            <h3 className="text-xl font-bold text-white mb-2">Company Details</h3>
            <p className="text-slate-400 text-xs mb-6">Manage corporate data and directory information</p>

            <form onSubmit={handleSaveCompany} className="space-y-6 max-w-4xl">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Website URL</label>
                  <input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="https://mycompany.com"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Industry</label>
                  <input
                    type="text"
                    value={companyIndustry}
                    onChange={(e) => setCompanyIndustry(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. Fintech, Healthcare"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Headquarters</label>
                  <input
                    type="text"
                    value={companyHeadquarters}
                    onChange={(e) => setCompanyHeadquarters(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. London, UK"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Company Type</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="startup">Startup</option>
                    <option value="mnc">MNC</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Employees Count</label>
                  <input
                    type="number"
                    value={companyEmployeeCount}
                    onChange={(e) => setCompanyEmployeeCount(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. 250"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Founded Year</label>
                  <input
                    type="number"
                    value={companyFoundedYear}
                    onChange={(e) => setCompanyFoundedYear(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. 2018"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Logo Image URL</label>
                  <input
                    type="url"
                    value={companyLogoUrl}
                    onChange={(e) => setCompanyLogoUrl(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="https://logo.url/logo.png"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">About Description</label>
                <textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  placeholder="Describe your organization's vision..."
                />
              </div>

              <button
                type="submit"
                disabled={savingCompany}
                className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-lg disabled:opacity-30 shadow-lg shadow-violet-500/10"
              >
                {savingCompany ? 'Saving...' : 'Save Corporate Profile'}
              </button>
            </form>
          </div>
        )}

        {/* PANEL 4: Create/Edit Job wizard */}
        {activeTab === 'create-job' && (
          <div>
            <h3 className="text-xl font-bold text-white mb-6">
              {editingJobId ? 'Edit Job Posting' : 'Post New Job'}
            </h3>
            <form onSubmit={handleCreateJob} className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. Acme Corp"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Company Category</label>
                  <select
                    value={companyType}
                    onChange={(e) => setCompanyType(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="startup">Startup</option>
                    <option value="mnc">MNC</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Employment Type</label>
                  <select
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="full_time">Full-time</option>
                    <option value="part_time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Experience level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="fresher">Fresher</option>
                    <option value="junior">Junior</option>
                    <option value="mid">Mid</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Posting status</label>
                  <select
                    value={jobStatus}
                    onChange={(e) => setJobStatus(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. San Francisco, CA / Remote"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Min Salary ($)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. 90000"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Max Salary ($)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. 140000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Job Description *</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  placeholder="Outline responsibilities and role context..."
                />
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Requirements / Duties Summary</label>
                <textarea
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  placeholder="bulleted requirements or responsibilities list..."
                />
              </div>

              {/* Required Skills list tag input */}
              <div>
                <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Required Skills Stack</label>
                <div className="flex gap-4 mb-4">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-grow bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    placeholder="e.g. Python, Docker, React"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkillTag}
                    className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-750 text-white font-semibold text-sm rounded-lg"
                  >
                    Add Tag
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skillsRequired.map((tag) => (
                    <span key={tag} className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs text-slate-300">
                      <span>{tag}</span>
                      <button type="button" onClick={() => handleRemoveSkillTag(tag)} className="text-slate-500 hover:text-red-400">
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-semibold text-sm rounded-lg disabled:opacity-30 shadow-lg shadow-violet-500/10"
                >
                  {submitting ? 'Saving...' : editingJobId ? 'Save Changes' : 'Post Listing'}
                </button>
                <button
                  type="button"
                  onClick={() => { resetJobForm(); setActiveTab('jobs'); }}
                  className="px-6 py-3 border border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg text-sm font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
