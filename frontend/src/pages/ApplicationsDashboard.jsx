import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, MapPin, DollarSign, Clock, 
  FileText, Star, ShieldAlert, Award, XCircle, 
  CheckCircle, ChevronRight, X, ArrowRight, Loader2, Sparkles, Inbox, Filter, Cpu, Target, Check, RefreshCw, GraduationCap
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

const CompanyLogo = ({ company, className = "w-10 h-10" }) => {
  const [error, setError] = useState(false);
  
  if (!company.logo_url || error) {
    return (
      <div className={`${className} rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-450 font-black text-xs uppercase shrink-0`}>
        {company.name ? company.name.charAt(0) : 'C'}
      </div>
    );
  }
  
  return (
    <img
      src={company.logo_url}
      alt={company.name}
      onError={() => setError(true)}
      className={`${className} rounded-xl object-cover bg-slate-900 border border-white/10 shrink-0 shadow-sm`}
    />
  );
};

export default function ApplicationsDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applications, setApplications] = useState([]);
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

  // Map backend statuses to Kanban columns
  const getColumns = () => {
    return {
      applied: {
        title: 'Applied',
        color: 'border-violet-500/30 text-violet-400 bg-violet-950/10',
        badge: 'bg-violet-600/20 text-violet-400',
        glassStyle: 'glass-card-purple-blue',
        items: applications.filter(app => app.status === 'applied' || app.status === 'under_review')
      },
      assessment: {
        title: 'Assessment',
        color: 'border-indigo-500/30 text-indigo-400 bg-indigo-950/10',
        badge: 'bg-indigo-650/20 text-indigo-400',
        glassStyle: 'glass-card-indigo-violet',
        items: applications.filter(app => app.status === 'shortlisted')
      },
      interview: {
        title: 'Interview',
        color: 'border-pink-500/30 text-pink-400 bg-pink-950/10',
        badge: 'bg-pink-600/20 text-pink-400',
        glassStyle: 'glass-card-pink-purple',
        items: applications.filter(app => app.status === 'interviewing')
      },
      offer: {
        title: 'Offer',
        color: 'border-emerald-500/30 text-emerald-450 bg-emerald-950/10',
        badge: 'bg-emerald-600/20 text-emerald-400',
        glassStyle: 'glass-card-emerald-teal',
        items: applications.filter(app => app.status === 'offered' || app.status === 'accepted')
      },
      rejected: {
        title: 'Rejected',
        color: 'border-rose-500/20 text-rose-450 bg-rose-950/10',
        badge: 'bg-rose-600/20 text-rose-400',
        glassStyle: 'glass-card-orange-gold',
        items: applications.filter(app => app.status === 'rejected')
      }
    };
  };

  const columns = getColumns();

  const getStatusBadgeClass = (status) => {
    const base = "px-2.5 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ";
    switch (status) {
      case 'accepted':
      case 'offered':
        return base + "bg-emerald-500/10 border-emerald-500/20 text-emerald-450 shadow-[0_0_15px_rgba(16,185,129,0.1)]";
      case 'rejected':
        return base + "bg-rose-500/10 border-rose-500/20 text-rose-455";
      case 'shortlisted':
        return base + "bg-indigo-500/10 border-indigo-500/20 text-indigo-400";
      case 'interviewing':
        return base + "bg-pink-500/10 border-pink-500/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.1)]";
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
      <PageTransition className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center animate-pulse">
        <div className="w-full max-w-sm h-72 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl">
          <Loader2 className="animate-spin text-emerald-400" size={32} />
          <span className="text-slate-500 text-xxs font-extrabold uppercase tracking-widest mt-4">Loading Pipeline...</span>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-[95%] mx-auto px-4 py-12 space-y-8 relative z-10 text-white">
      
      {/* Background spotlights: Emerald + Blue Theme for Applications Page */}
      <div className="absolute top-[10%] left-[20%] w-[420px] h-[420px] bg-gradient-to-tr from-emerald-600/15 via-blue-500/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[380px] h-[380px] bg-gradient-to-tr from-blue-600/15 via-emerald-500/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 text-left">
        <div>
          <h2 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-emerald-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">Kanban Match Board</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Track matching statuses in dynamic pipeline columns. Recruiters update statuses as reviews proceed.</p>
        </div>
        <Link 
          to="/swipe"
          className="inline-flex items-center space-x-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg active:scale-95 cursor-pointer uppercase tracking-wider self-start md:self-auto border border-emerald-550"
        >
          <span>Explore Deck</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-200/20 text-rose-400 text-xs font-bold text-left">
          {error}
        </div>
      )}

      {/* Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-start overflow-x-auto pb-4">
        {Object.entries(columns).map(([colId, col]) => (
          <div 
            key={colId} 
            className="p-[1.5px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shrink-0 w-full min-w-[240px] shadow-xl"
          >
            <div className="bg-slate-950 rounded-[23px] p-4 min-h-[60vh] flex flex-col space-y-4 border border-white/5">
              
              {/* Column Header */}
              <div className={`p-3 rounded-2xl border ${col.color} flex justify-between items-center text-left`}>
                <span className="text-xxs font-black uppercase tracking-widest">{col.title}</span>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${col.badge}`}>
                  {col.items.length}
                </span>
              </div>

              {/* Column Items */}
              <div className="space-y-4 flex-grow overflow-y-auto max-h-[70vh]">
                {col.items.length === 0 ? (
                  <div className="py-12 text-center text-slate-600 text-xxs font-bold">
                    Empty column
                  </div>
                ) : (
                  col.items.map((app) => (
                    <motion.div 
                      key={app.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedApp(app)}
                      className="p-[1px] rounded-2xl transition-all cursor-pointer text-left shadow"
                    >
                      {/* Using the custom colorful glass style from columns definition */}
                      <div className={`${col.glassStyle} p-4 rounded-[15px] space-y-3 relative group`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors leading-tight truncate">
                              {app.job_details.title}
                            </h4>
                            <p className="text-emerald-450 text-[10px] font-bold truncate mt-0.5">{app.job_details.company.name}</p>
                          </div>
                          <CompanyLogo company={app.job_details.company} className="w-8 h-8 shrink-0" />
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-white/5 text-[10px] text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <MapPin size={11} className="text-slate-500" />
                            <span className="truncate">{app.job_details.location}</span>
                          </div>
                          {app.resume_details && (
                            <div className="flex items-center space-x-1.5">
                              <FileText size={11} className="text-slate-550" />
                              <span>CV v{app.resume_details.version}</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                          <span className="text-emerald-405 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                            View <ArrowRight size={8} />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Details view modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 flex justify-end items-end">
            <div className="absolute inset-0" onClick={() => setSelectedApp(null)} />
            
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-lg bg-slate-950 border-t border-white/10 rounded-t-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl text-left text-white"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className={getStatusBadgeClass(selectedApp.status)}>
                    {formatStatus(selectedApp.status)}
                  </span>
                  <h3 className="text-xl font-black text-white leading-tight mt-3">{selectedApp.job_details.title}</h3>
                  <p className="text-emerald-400 font-extrabold text-sm mt-1">{selectedApp.job_details.company.name}</p>
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
                      <FileText size={15} className="text-emerald-400" />
                      <span className="font-bold text-slate-350">Resume version {selectedApp.resume_details.version}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-6 border-t border-white/5 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                >
                  Close Pipeline
                </button>
                <Link
                  to="/messages"
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg active:scale-95 text-center flex items-center justify-center border border-emerald-550 uppercase tracking-wider"
                >
                  Contact Recruiter
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
