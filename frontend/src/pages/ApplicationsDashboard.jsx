import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, MapPin, DollarSign, Clock, 
  FileText, Star, ShieldAlert, Award, XCircle, 
  CheckCircle, ChevronRight, X, ArrowRight, Loader2, Sparkles, Inbox, Filter
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

// Safe image load helper component with fallback initial avatar
const CompanyLogo = ({ company, className = "w-10 h-10" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-xl bg-slate-950 border border-white/5 flex items-center justify-center text-violet-400 font-extrabold text-xs uppercase shrink-0 shadow-inner`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-xl object-contain bg-white/5 p-1 border border-white/5 shrink-0`}
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
    const base = "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ";
    switch (status) {
      case 'accepted':
      case 'offered':
        return base + "bg-emerald-950/40 border-emerald-900/50 text-emerald-400";
      case 'rejected':
        return base + "bg-red-950/40 border-red-900/50 text-red-400";
      case 'shortlisted':
        return base + "bg-indigo-950/40 border-indigo-900/50 text-indigo-400";
      case 'interviewing':
        return base + "bg-violet-950/40 border-violet-900/50 text-violet-400";
      case 'under_review':
        return base + "bg-amber-950/40 border-amber-900/50 text-amber-400";
      default:
        return base + "bg-slate-900 border-white/5 text-slate-400";
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
            <div key={i} className="bg-slate-900/40 border border-white/5 p-5 rounded-2xl space-y-3">
              <div className="h-3 rounded w-3/4 animate-shimmer" />
              <div className="h-8 rounded w-1/2 animate-shimmer" />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900/40 border border-white/5 p-4 rounded-2xl space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 rounded-xl animate-shimmer" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-3 grid md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-900/40 border border-white/5 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 w-2/3">
                    <div className="h-4 rounded w-1/3 animate-shimmer" />
                    <div className="h-6 rounded w-3/4 animate-shimmer" />
                    <div className="h-4 rounded w-1/2 animate-shimmer" />
                  </div>
                  <div className="w-10 h-10 rounded-xl animate-shimmer" />
                </div>
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
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Briefcase className="text-violet-400" />
            <span>Applications Tracker</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1">Trace all matching listings, scheduled meetings, offers and history.</p>
        </div>
        <Link 
          to="/swipe"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95 self-start md:self-auto cursor-pointer"
        >
          <span>Discover New Jobs</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {[
            { label: 'Total Swipes', val: stats.total_applications || 0, color: 'text-violet-400 bg-violet-500/5 border-violet-500/10' },
            { label: 'Shortlisted', val: stats.shortlisted || 0, color: 'text-indigo-400 bg-indigo-500/5 border-indigo-500/10' },
            { label: 'Interviews', val: stats.interviews || 0, color: 'text-violet-400 bg-violet-500/5 border-violet-500/10' },
            { label: 'Offers', val: stats.offered || 0, color: 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10' },
            { label: 'Pending', val: stats.pending || 0, color: 'text-amber-400 bg-amber-500/5 border-amber-500/10' },
            { label: 'Rejected', val: stats.rejected || 0, color: 'text-red-400 bg-red-500/5 border-red-500/10' }
          ].map((st, i) => (
            <div key={i} className={`p-5 rounded-2xl border ${st.color} backdrop-blur-md relative overflow-hidden group`}>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">{st.label}</span>
              <span className="text-2xl font-black text-white">{st.val}</span>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Status filtering sidebar */}
        <div className="lg:col-span-1 bg-slate-900/40 border border-white/5 p-4 rounded-2xl backdrop-blur-md space-y-1.5">
          <div className="px-3 py-2 flex items-center justify-between text-slate-400 border-b border-white/5 mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Filter size={12} /> Filter Pipeline
            </span>
          </div>

          {[
            { id: 'all', label: 'All Swipes', count: applications.length },
            { id: 'applied', label: 'Applied / Matches', count: classified.applied.length },
            { id: 'under_review', label: 'Under Review', count: classified.under_review.length },
            { id: 'shortlisted', label: 'Shortlisted', count: classified.shortlisted.length },
            { id: 'interviewing', label: 'Interviews', count: classified.interviewing.length },
            { id: 'offered', label: 'Offers', count: classified.offered.length },
            { id: 'rejected', label: 'Rejected', count: classified.rejected.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                  : 'text-slate-455 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-950/60 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Applications List Grid */}
        <div className="lg:col-span-3">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/20 border border-white/5 rounded-3xl backdrop-blur-md space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-center text-slate-600">
                <Inbox size={26} />
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <h4 className="text-white text-sm font-bold">No Applications Found</h4>
                <p className="text-slate-500 text-xs leading-relaxed">
                  You haven't swiped right or received status updates matching the "{activeTab.replace('_', ' ')}" filter yet.
                </p>
              </div>
              <Link 
                to="/swipe"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white text-xs font-bold rounded-xl transition-all shadow-md active:scale-95"
              >
                <span>Discover New Roles</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredApps.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className="bg-slate-900/40 border border-white/5 hover:border-violet-500/30 p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-900/60 transition-all cursor-pointer shadow-md group animate-fade-in focus-visible:ring-2 focus-visible:ring-violet-500"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter') setSelectedApp(app); }}
                >
                  <div>
                    <div className="flex justify-between items-start gap-4">
                      <div className="min-w-0">
                        <span className={getStatusBadgeClass(app.status)}>
                          {formatStatus(app.status)}
                        </span>
                        <h3 className="text-base font-black text-white group-hover:text-violet-400 transition-colors mt-3 leading-snug truncate">
                          {app.job_details.title}
                        </h3>
                        <p className="text-slate-400 text-xxs font-semibold mt-0.5 truncate">{app.job_details.company.name}</p>
                      </div>
                      <CompanyLogo company={app.job_details.company} className="w-10 h-10 shrink-0" />
                    </div>

                    <div className="space-y-2 mt-5 pt-4 border-t border-white/5">
                      <div className="flex items-center space-x-2 text-xxs text-slate-400">
                        <MapPin size={12} className="text-slate-500" />
                        <span>{app.job_details.location}</span>
                      </div>
                      {app.resume_details && (
                        <div className="flex items-center space-x-2 text-xxs text-slate-400">
                          <FileText size={12} className="text-slate-500" />
                          <span>Submitted CV (v{app.resume_details.version})</span>
                        </div>
                      )}
                      {app.cover_letter && (
                        <div className="flex items-center space-x-2 text-xxs text-violet-400 font-semibold">
                          <FileText size={12} className="text-violet-500" />
                          <span className="truncate">Cover Letter added</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between items-center text-slate-500 text-xxs border-t border-white/5 pt-4">
                    <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
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
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 flex justify-end items-end animate-fade-in">
            <div className="absolute inset-0" onClick={() => setSelectedApp(null)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-900 border-t border-white/5 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={getStatusBadgeClass(selectedApp.status)}>
                    {formatStatus(selectedApp.status)}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight mt-3">{selectedApp.job_details.title}</h3>
                  <p className="text-slate-350 font-bold text-sm mt-1">{selectedApp.job_details.company.name}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-y border-white/5 py-4">
                <div className="flex items-center space-x-1.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{selectedApp.job_details.location}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-white font-bold">
                  <DollarSign size={14} className="text-slate-500" />
                  <span>
                    {selectedApp.job_details.salary_min ? `$${selectedApp.job_details.salary_min.toLocaleString()}` : 'Negotiable'}
                    {selectedApp.job_details.salary_max ? ` - $${selectedApp.job_details.salary_max.toLocaleString()}` : ''}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 capitalize">
                  <Briefcase size={14} className="text-slate-500" />
                  <span>{selectedApp.job_details.employment_type.replace('_', ' ')} ({selectedApp.job_details.job_type})</span>
                </div>
              </div>

              {/* Resume used */}
              {selectedApp.resume_details && (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Resume Version Submitted</h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center space-x-2">
                      <FileText size={15} className="text-violet-400" />
                      <span className="font-semibold text-slate-300">Resume version {selectedApp.resume_details.version}</span>
                    </div>
                    <a
                      href={selectedApp.resume_details.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-400 hover:underline font-bold"
                    >
                      Download CV
                    </a>
                  </div>
                </div>
              )}

              {/* Cover letter used */}
              {selectedApp.cover_letter && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Cover Letter</h4>
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 text-slate-300 text-xs leading-relaxed whitespace-pre-line">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* Upcoming Interviews inside this app */}
              {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Interview Schedules</h4>
                  <div className="space-y-2">
                    {selectedApp.interviews.map((int) => (
                      <div key={int.id} className="p-4 rounded-xl bg-slate-950/60 border border-white/5 flex justify-between items-center text-xs">
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
              
              <div className="pt-6 border-t border-white/5 flex justify-end">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 border border-white/5 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
