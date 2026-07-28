import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, MapPin, DollarSign, Clock, 
  FileText, Star, ShieldAlert, Award, XCircle, 
  CheckCircle, ChevronRight, X, ArrowRight, Loader2, Sparkles, Inbox, Filter, Cpu, Target, Check
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyLogo = ({ company, className = "w-11 h-11" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-violet-400 font-extrabold text-xs uppercase shrink-0 shadow-inner`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-2xl object-cover bg-slate-950 border border-white/10 p-1 shrink-0 shadow-md`}
    />
  );
};

export default function ApplicationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [stats, setStats] = useState(null);
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

  const classified = {
    applied: applications.filter(app => app.status === 'applied'),
    under_review: applications.filter(app => app.status === 'under_review'),
    shortlisted: applications.filter(app => app.status === 'shortlisted'),
    interviewing: applications.filter(app => app.status === 'interviewing'),
    offered: applications.filter(app => app.status === 'offered' || app.status === 'accepted'),
    rejected: applications.filter(app => app.status === 'rejected')
  };

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
    const base = "px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ";
    switch (status) {
      case 'accepted':
      case 'offered':
        return base + "bg-emerald-500/10 border-emerald-500/20 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case 'rejected':
        return base + "bg-rose-500/10 border-rose-500/20 text-rose-450";
      case 'shortlisted':
        return base + "bg-indigo-550/15 border-indigo-500/20 text-indigo-400";
      case 'interviewing':
        return base + "bg-violet-550/15 border-violet-500/20 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)]";
      case 'under_review':
        return base + "bg-amber-550/10 border-amber-500/20 text-amber-400";
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
      <PageTransition className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm h-72 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl">
          <Loader2 className="animate-spin text-violet-400" size={32} />
          <span className="text-slate-500 text-xxs font-extrabold uppercase tracking-widest mt-4">Syncing Console...</span>
        </div>
      </PageTransition>
    );
  }

  const filteredApps = getFilteredApps();

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
            <Cpu className="text-violet-400 animate-pulse" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">Applications Pipeline</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Monitor matchmaking status updates, direct interview sessions, and job offers.</p>
        </div>
        <Link 
          to="/swipe"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg shadow-violet-650/20 active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <span>Explore Deck</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-450 text-xs font-bold text-left">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Swipes', val: stats.total_applications || 0, gradient: 'from-violet-500/10 to-indigo-500/5', text: 'text-violet-400' },
            { label: 'Shortlisted', val: stats.shortlisted || 0, gradient: 'from-indigo-500/10 to-blue-500/5', text: 'text-indigo-400' },
            { label: 'Interviews', val: stats.interviews || 0, gradient: 'from-fuchsia-500/10 to-pink-500/5', text: 'text-fuchsia-400' },
            { label: 'Offers', val: stats.offered || 0, gradient: 'from-emerald-500/10 to-cyan-500/5', text: 'text-emerald-450' },
            { label: 'Pending', val: stats.pending || 0, gradient: 'from-amber-500/10 to-orange-500/5', text: 'text-amber-400' },
            { label: 'Rejected', val: stats.rejected || 0, gradient: 'from-rose-500/10 to-red-500/5', text: 'text-rose-450' }
          ].map((st, i) => (
            <div key={i} className="p-1 rounded-2xl bg-gradient-to-tr from-white/5 to-transparent">
              <div className="p-5 rounded-2xl bg-slate-950/80 backdrop-blur-2xl text-left relative overflow-hidden group">
                <div className={`absolute inset-0 bg-gradient-to-tr ${st.gradient} opacity-20`} />
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-1.5 relative z-10">{st.label}</span>
                <span className={`text-3xl font-black ${st.text} relative z-10`}>{st.val}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-4 gap-8 items-start">
        {/* Status filtering sidebar */}
        <div className="lg:col-span-1 p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl">
          <div className="bg-slate-950/80 backdrop-blur-2xl p-4 rounded-[23px] space-y-1.5 text-left">
            <div className="px-3 py-2 flex items-center justify-between text-slate-500 border-b border-white/5 mb-3">
              <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <Filter size={12} /> Pipeline Stages
              </span>
            </div>

            {[
              { id: 'all', label: 'All Records', count: applications.length },
              { id: 'applied', label: 'Applied Matches', count: classified.applied.length },
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
                    ? 'bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white shadow-md font-black'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${
                  activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-900 border border-white/5 text-slate-500'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List Grid */}
        <div className="lg:col-span-3 text-left">
          {filteredApps.length === 0 ? (
            <div className="text-center py-16 bg-slate-950/80 border border-violet-500/20 rounded-3xl backdrop-blur-2xl space-y-6">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                <Inbox size={26} />
              </div>
              <div className="max-w-xs mx-auto space-y-2">
                <h4 className="text-white text-sm font-black">No Matches found</h4>
                <p className="text-slate-550 text-xs leading-relaxed font-semibold">
                  You haven't swiped right or received matching approvals under the "{activeTab.replace('_', ' ')}" stage yet.
                </p>
              </div>
              <Link 
                to="/swipe"
                className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95"
              >
                <span>Discover Jobs</span>
                <ChevronRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {filteredApps.map((app) => (
                <div 
                  key={app.id} 
                  onClick={() => setSelectedApp(app)}
                  className="p-[1px] rounded-3xl bg-gradient-to-br from-white/5 hover:from-violet-500/20 to-transparent shadow-md hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-slate-950/80 backdrop-blur-3xl p-6 rounded-[23px] h-full flex flex-col justify-between cursor-pointer relative group">
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div className="min-w-0">
                          <span className={getStatusBadgeClass(app.status)}>
                            {formatStatus(app.status)}
                          </span>
                          <h3 className="text-base font-black text-white group-hover:text-violet-400 transition-colors mt-3.5 leading-snug truncate">
                            {app.job_details.title}
                          </h3>
                          <p className="text-violet-450 text-xxs font-bold mt-0.5 truncate">{app.job_details.company.name}</p>
                        </div>
                        <CompanyLogo company={app.job_details.company} className="w-11 h-11 shrink-0" />
                      </div>

                      <div className="space-y-2 mt-5 pt-4 border-t border-white/5 text-slate-400 font-semibold">
                        <div className="flex items-center space-x-2 text-xxs">
                          <MapPin size={12} className="text-slate-500" />
                          <span>{app.job_details.location}</span>
                        </div>
                        {app.resume_details && (
                          <div className="flex items-center space-x-2 text-xxs">
                            <FileText size={12} className="text-slate-500" />
                            <span>Submitted CV (v{app.resume_details.version})</span>
                          </div>
                        )}
                        {app.cover_letter && (
                          <div className="flex items-center space-x-2 text-xxs text-violet-400 font-bold">
                            <Target size={12} />
                            <span>AI Cover Letter Attached</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-between items-center text-slate-500 text-xxs border-t border-white/5 pt-4 font-semibold uppercase tracking-wider">
                      <span>Applied {new Date(app.applied_at).toLocaleDateString()}</span>
                      <span className="text-violet-400 group-hover:translate-x-1.5 transition-transform flex items-center gap-1 font-extrabold">
                        Open console <ArrowRight size={10} />
                      </span>
                    </div>
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
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex justify-end items-end animate-fade-in">
            <div className="absolute inset-0" onClick={() => setSelectedApp(null)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-950 border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={getStatusBadgeClass(selectedApp.status)}>
                    {formatStatus(selectedApp.status)}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight mt-3">{selectedApp.job_details.title}</h3>
                  <p className="text-violet-400 font-extrabold text-sm mt-1">{selectedApp.job_details.company.name}</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs text-slate-400 border-y border-white/10 py-5 font-semibold">
                <div className="flex items-center space-x-1.5">
                  <MapPin size={14} className="text-slate-500" />
                  <span>{selectedApp.job_details.location}</span>
                </div>
                <div className="flex items-center space-x-1.5 text-white font-extrabold">
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
                <div className="p-4 rounded-xl bg-slate-900 border border-white/5 space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500">Resume Submitted</h4>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center space-x-2">
                      <FileText size={15} className="text-violet-400" />
                      <span className="font-bold text-slate-355">Resume version {selectedApp.resume_details.version}</span>
                    </div>
                    <a
                      href={selectedApp.resume_details.file}
                      target="_blank"
                      rel="noreferrer"
                      className="text-violet-400 hover:underline font-extrabold flex items-center gap-1"
                    >
                      <span>Download</span>
                      <ChevronRight size={12} />
                    </a>
                  </div>
                </div>
              )}

              {/* Cover letter used */}
              {selectedApp.cover_letter && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Your Cover Letter</h4>
                  <div className="p-4 rounded-xl bg-slate-900 border border-white/5 text-slate-300 text-xs leading-relaxed whitespace-pre-line font-semibold">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {/* Upcoming Interviews inside this app */}
              {selectedApp.interviews && selectedApp.interviews.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Interview Schedules</h4>
                  <div className="space-y-2">
                    {selectedApp.interviews.map((int) => (
                      <div key={int.id} className="p-4 rounded-xl bg-slate-900 border border-white/5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white">{int.title}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">
                            {new Date(int.start_time).toLocaleString()} - {new Date(int.end_time).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider capitalize ${
                          int.status === 'accepted' ? 'bg-emerald-950/30 text-emerald-450 border border-emerald-500/20' :
                          int.status === 'declined' ? 'bg-red-950/30 text-red-400' : 'bg-slate-900 text-slate-450'
                        }`}>
                          {int.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-850 border border-white/10 text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
