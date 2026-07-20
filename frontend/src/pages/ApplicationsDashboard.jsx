import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, MapPin, DollarSign, Clock, 
  FileText, Star, ShieldAlert, Award, XCircle, 
  CheckCircle, ChevronRight, X, ArrowRight, Loader2, Sparkles, Inbox 
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';

// Safe image load helper component with fallback initial avatar
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

export default function ApplicationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);
  
  // Selected Application for detailed view modal
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/jobs/my-applications/');
      setApplications(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch your applications list.');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/jobs/seeker-dashboard/');
      setStats(response.data);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError('');
    await Promise.all([fetchApplications(), fetchStats()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Classify applications into status categories
  const classified = {
    applied: applications.filter(app => app.status === 'applied'),
    under_review: applications.filter(app => app.status === 'under_review'),
    shortlisted: applications.filter(app => app.status === 'shortlisted'),
    interviewing: applications.filter(app => app.status === 'interviewing'),
    offered: applications.filter(app => app.status === 'offered' || app.status === 'accepted'),
    rejected: applications.filter(app => app.status === 'rejected')
  };

  // Filter application list based on selected Tab
  const getFilteredApps = () => {
    if (activeTab === 'all') return applications;
    if (activeTab === 'applied') return classified.applied;
    if (activeTab === 'under_review') return classified.under_review;
    if (activeTab === 'shortlisted') return classified.shortlisted;
    if (activeTab === 'interviewing') return classified.interviewing;
    if (activeTab === 'offered') return classified.offered;
    if (activeTab === 'rejected') return classified.rejected;
    return applications;
  };

  const getStatusBadgeClass = (status) => {
    const base = "px-2.5 py-0.5 rounded-full text-xxs font-extrabold uppercase tracking-wider ";
    switch (status) {
      case 'accepted':
      case 'offered':
        return base + "bg-emerald-950/50 border border-emerald-800 text-emerald-400";
      case 'rejected':
        return base + "bg-red-950/50 border border-red-850 text-red-400";
      case 'shortlisted':
        return base + "bg-indigo-950/50 border border-indigo-850 text-indigo-400";
      case 'interviewing':
        return base + "bg-violet-950/50 border border-violet-850 text-violet-400";
      case 'under_review':
        return base + "bg-amber-950/50 border border-amber-850 text-amber-400";
      default:
        return base + "bg-slate-900 border border-slate-750 text-slate-400";
    }
  };

  const formatStatus = (status) => {
    if (status === 'under_review') return 'Under Review';
    if (status === 'interviewing') return 'Interview Scheduled';
    return status;
  };

  if (loading) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="space-y-3 mb-10">
          <div className="h-8 rounded-lg w-64 animate-shimmer" />
          <div className="h-4 rounded-md w-96 animate-shimmer" />
        </div>

        {/* Shimmer Stats Metrics Loader */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl space-y-3">
              <div className="h-3 rounded w-3/4 animate-shimmer" />
              <div className="h-8 rounded w-1/2 animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl animate-shimmer" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 rounded w-1/3 animate-shimmer" />
                    <div className="h-6 rounded w-3/4 animate-shimmer" />
                  </div>
                  <div className="w-10 h-10 rounded-lg animate-shimmer" />
                </div>
                <div className="h-4 rounded w-full animate-shimmer mt-4" />
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    );
  }

  const filteredApps = getFilteredApps();

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">Seeker Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Review application stages, metrics, and profiles optimization parameters</p>
        </div>
      </div>

      {/* Seeker Dashboard Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">Total Applied</span>
            <span className="text-2xl font-black text-white">{stats.total_applications}</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <Briefcase size={32} />
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">Saved Jobs</span>
            <span className="text-2xl font-black text-white">{stats.saved_jobs}</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <Star size={32} />
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">Profile Complete</span>
            <span className="text-2xl font-black text-white">{stats.profile_completion}%</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <CheckCircle size={32} />
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">ATS Match Score</span>
            <span className="text-2xl font-black text-white">{stats.ats_score > 0 ? `${stats.ats_score}/100` : 'N/A'}</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">Recommendations</span>
            <span className="text-2xl font-black text-white">{stats.recommendation_count}</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <Award size={32} />
            </div>
          </div>
          <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl backdrop-blur-md relative overflow-hidden group hover:border-violet-500/30 transition-colors shadow-md">
            <span className="text-xxs font-bold text-slate-500 uppercase tracking-widest block mb-1">Interviews</span>
            <span className="text-2xl font-black text-white">{stats.upcoming_interviews}</span>
            <div className="absolute right-4 bottom-4 text-violet-500/10 group-hover:scale-110 transition-transform">
              <Calendar size={32} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        
        {/* Left Side: Columns Toggles and Summary metrics */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick tab filters */}
          <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl space-y-1.5 backdrop-blur-md">
            {[
              { id: 'all', label: 'All Applications', count: applications.length, icon: Briefcase },
              { id: 'applied', label: 'Applied', count: classified.applied.length, icon: Clock, color: 'text-slate-400' },
              { id: 'under_review', label: 'Under Review', count: classified.under_review.length, icon: FileText, color: 'text-amber-400' },
              { id: 'shortlisted', label: 'Shortlisted', count: classified.shortlisted.length, icon: Award, color: 'text-indigo-400' },
              { id: 'interviewing', label: 'Interview Scheduled', count: classified.interviewing.length, icon: Calendar, color: 'text-violet-400' },
              { id: 'offered', label: 'Offered / Accepted', count: classified.offered.length, icon: CheckCircle, color: 'text-emerald-400' },
              { id: 'rejected', label: 'Archived / Rejected', count: classified.rejected.length, icon: XCircle, color: 'text-red-400' }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-xs font-semibold focus-visible:ring-2 focus-visible:ring-violet-500 ${
                    activeTab === tab.id 
                      ? 'bg-slate-800 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/50'
                  }`}
                >
                  <span className="flex items-center space-x-2.5">
                    <Icon size={16} className={tab.color} />
                    <span>{tab.label}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-850 text-xxs font-bold text-slate-300">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Timeline History Feed */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 backdrop-blur-md">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Activity</h3>
            {applications.length === 0 ? (
              <p className="text-slate-500 text-xs">No historical timeline events registered.</p>
            ) : (
              <div className="relative border-l border-slate-800 pl-4 space-y-4 text-xxs">
                {applications.slice(0, 4).map((app, i) => (
                  <div key={i} className="relative">
                    <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-violet-500 border-2 border-slate-900" />
                    <p className="font-semibold text-slate-300">
                      Applied to <span className="text-violet-400">{app.job_details.company.name}</span>
                    </p>
                    <p className="text-slate-500 mt-0.5">{new Date(app.applied_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Tab panel results */}
        <div className="lg:col-span-3">
          {filteredApps.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/20 border border-slate-850 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-500 shadow-inner">
                <Inbox size={32} className="animate-pulse" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">No Applications in this Category</p>
                <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto leading-relaxed">
                  You haven't swiped right or received status updates matching the "{activeTab.replace('_', ' ')}" filter yet.
                </p>
              </div>
              <Link 
                to="/swipe"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <span>Discover New Roles</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredApps.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className="bg-slate-900/40 border border-slate-850 hover:border-violet-500/30 p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-all cursor-pointer shadow-md group animate-fade-in focus-visible:ring-2 focus-visible:ring-violet-500"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedApp(app); }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <span className={getStatusBadgeClass(app.status)}>
                          {formatStatus(app.status)}
                        </span>
                        <h3 className="text-lg font-black text-white group-hover:text-violet-400 transition-colors mt-2.5 leading-snug truncate">
                          {app.job_details.title}
                        </h3>
                        <p className="text-slate-400 text-xs font-semibold mt-0.5 truncate">{app.job_details.company.name}</p>
                      </div>
                      <CompanyLogo company={app.job_details.company} className="w-10 h-10 shrink-0" />
                    </div>

                    <div className="space-y-2 mt-5 pt-4 border-t border-slate-850/60">
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <MapPin size={13} className="text-slate-500" />
                        <span>{app.job_details.location}</span>
                      </div>
                      {app.resume_details && (
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <FileText size={13} className="text-slate-500" />
                          <span>Submitted CV (v{app.resume_details.version})</span>
                        </div>
                      )}
                      {app.cover_letter && (
                        <div className="flex items-center space-x-2 text-xs text-violet-400 font-semibold">
                          <Clock size={13} className="text-violet-500" />
                          <span className="truncate">Cover Letter added</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center text-slate-500 text-xxs border-t border-slate-850/40 pt-4">
                    <span>Applied on {new Date(app.applied_at).toLocaleDateString()}</span>
                    <span className="text-violet-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                      Details <ArrowRight size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details view modal */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 flex justify-end items-end animate-fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedApp(null)} />
          
          <div className="relative w-full max-w-lg bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className={getStatusBadgeClass(selectedApp.status)}>
                  {formatStatus(selectedApp.status)}
                </span>
                <h3 className="text-2xl font-black text-white leading-tight mt-2.5">{selectedApp.job_details.title}</h3>
                <p className="text-slate-300 font-bold text-base mt-1">{selectedApp.job_details.company.name}</p>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-wrap gap-4 text-xs text-slate-400 border-y border-slate-800 py-4">
              <div className="flex items-center space-x-1.5">
                <MapPin size={15} />
                <span>{selectedApp.job_details.location}</span>
              </div>
              <div className="flex items-center space-x-1.5 text-white font-bold">
                <DollarSign size={15} />
                <span>
                  {selectedApp.job_details.salary_min ? `$${selectedApp.job_details.salary_min.toLocaleString()}` : 'Negotiable'}
                  {selectedApp.job_details.salary_max ? ` - $${selectedApp.job_details.salary_max.toLocaleString()}` : ''}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 capitalize">
                <Briefcase size={15} />
                <span>{selectedApp.job_details.employment_type.replace('_', ' ')} ({selectedApp.job_details.job_type})</span>
              </div>
            </div>

            {/* Resume used */}
            {selectedApp.resume_details && (
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Resume Version Submitted</h4>
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-violet-400" />
                    <span className="font-semibold text-slate-300">Resume version {selectedApp.resume_details.version}</span>
                  </div>
                  <a
                    href={selectedApp.resume_details.file}
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-400 hover:underline font-bold focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    Download CV
                  </a>
                </div>
              </div>
            )}

            {/* Cover letter used */}
            {selectedApp.cover_letter && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Your Cover Letter</h4>
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                  {selectedApp.cover_letter}
                </div>
              </div>
            )}

            {/* Upcoming Interviews inside this app */}
            {selectedApp.interviews && selectedApp.interviews.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Interview Schedules</h4>
                <div className="space-y-2">
                  {selectedApp.interviews.map((int) => (
                    <div key={int.id} className="p-4 rounded-xl bg-slate-950/60 border border-slate-850 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-white">{int.title}</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">
                          {new Date(int.start_time).toLocaleString()} - {new Date(int.end_time).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                        int.status === 'accepted' ? 'bg-emerald-950/30 text-emerald-400' :
                        int.status === 'declined' ? 'bg-red-950/30 text-red-400' : 'bg-slate-900 text-slate-400'
                      }`}>
                        {int.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-6 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
