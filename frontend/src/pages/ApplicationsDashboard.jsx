import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, Calendar, MapPin, DollarSign, Clock, 
  FileText, Star, ShieldAlert, Award, XCircle, 
  CheckCircle, ChevronRight, X, ArrowRight, Loader2, Sparkles, Inbox, Filter, Cpu, Target, Check, RefreshCw, GraduationCap, Flame, AlertTriangle
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

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
  const { showToast } = useToast();

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
        title: 'Archived',
        color: 'border-rose-500/30 text-rose-400 bg-rose-950/10',
        badge: 'bg-rose-600/20 text-rose-400',
        glassStyle: 'glass-card-pink-purple',
        items: applications.filter(app => app.status === 'rejected')
      }
    };
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'offered':
      case 'accepted':
        return 'inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-600/20 text-emerald-400 border border-emerald-555';
      case 'rejected':
        return 'inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-rose-600/20 text-rose-400 border border-rose-555';
      case 'interviewing':
        return 'inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-pink-600/20 text-pink-400 border border-pink-555';
      case 'shortlisted':
        return 'inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-indigo-650/20 text-indigo-400 border border-indigo-555';
      default:
        return 'inline-flex px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-violet-600/20 text-violet-400 border border-violet-555';
    }
  };

  const formatStatus = (status) => {
    return (status || '').replace('_', ' ');
  };

  const handleSetReminder = () => {
    showToast('Follow-up reminder calendar alarm configured for tomorrow morning!', 'success');
  };

  if (loading) {
    return (
      <PageTransition className="max-w-6xl mx-auto px-6 py-12 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-slate-900" />
          <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-l-emerald-505 animate-spin" />
        </div>
        <span className="text-slate-450 text-xs font-bold uppercase tracking-wider animate-pulse">Loading Pipeline...</span>
      </PageTransition>
    );
  }

  const columns = getColumns();

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10 text-white text-left">
      
      {/* Background spotlights: Emerald + Blue Theme for Applications */}
      <div className="absolute top-[10%] left-1/4 w-[480px] h-[480px] bg-gradient-to-tr from-emerald-600/15 via-blue-500/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-1/4 w-[420px] h-[420px] bg-gradient-to-br from-blue-600/15 via-emerald-500/10 to-transparent rounded-full blur-[120px] -z-10 pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Target className="text-emerald-450 animate-pulse" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400">Applications Pipeline</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Track application review progress, calendar alarms, and response metrics.</p>
        </div>

        <button 
          onClick={loadData}
          className="flex items-center space-x-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white text-xs font-extrabold transition-all active:scale-95 cursor-pointer uppercase tracking-wider"
        >
          <RefreshCw size={13} />
          <span>Reload</span>
        </button>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Submissions', val: applications.length, color: 'text-emerald-450' },
          { label: 'Under Review', val: applications.filter(a => a.status === 'applied' || a.status === 'under_review').length, color: 'text-violet-400' },
          { label: 'Active Interviews', val: applications.filter(a => a.status === 'interviewing').length, color: 'text-pink-400' },
          { label: 'Offers Made', val: applications.filter(a => a.status === 'offered').length, color: 'text-emerald-405' }
        ].map((stat, i) => (
          <div key={i} className="p-[1.5px] rounded-3xl bg-gradient-to-tr from-white/10 to-transparent shadow-md">
            <div className="bg-slate-950/80 backdrop-blur-2xl p-5 rounded-[23px] border border-white/5 space-y-1.5">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">{stat.label}</span>
              <span className={`text-3xl font-black block ${stat.color}`}>{stat.val}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Pipeline Columns */}
      <div className="grid lg:grid-cols-5 gap-6">
        {Object.entries(columns).map(([key, col]) => (
          <div key={key} className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-slate-350">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{col.title}</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-400 text-xxs font-black">
                {col.items.length}
              </span>
            </div>

            <div className="p-[1px] rounded-[24px] bg-gradient-to-b from-white/5 to-transparent min-h-[460px]">
              <div className="bg-slate-955/80 backdrop-blur-2xl p-3.5 rounded-[23px] border border-white/5 h-full space-y-3">
                {col.items.length === 0 ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-center p-4">
                    <span className="text-xxs text-slate-650 font-black uppercase tracking-widest">Empty Stage</span>
                  </div>
                ) : (
                  col.items.map((app) => (
                    <motion.div 
                      key={app.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedApp(app)}
                      className="p-[1px] rounded-2xl transition-all cursor-pointer text-left shadow hover:scale-[1.02]"
                    >
                      <div className={`${col.glassStyle} p-4 rounded-[15px] space-y-3 relative group`}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-white group-hover:text-emerald-400 transition-colors leading-tight truncate">
                              {app.job_details.title}
                            </h4>
                            <p className="text-emerald-450 text-[10px] font-bold truncate mt-0.5">{app.job_details.company.name}</p>
                          </div>
                          <CompanyLogo company={app.job_details.company} className="w-8 h-8 shrink-0 animate-pulse" />
                        </div>

                        <div className="space-y-1.5 pt-3 border-t border-white/5 text-[10px] text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <MapPin size={11} className="text-slate-500" />
                            <span className="truncate">{app.job_details.location}</span>
                          </div>
                        </div>

                        <div className="pt-2.5 border-t border-white/5 flex items-center justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>{new Date(app.applied_at).toLocaleDateString()}</span>
                          <span className="text-emerald-405 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 font-black">
                            Track &rarr;
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

              {/* Interactive Pipeline Timeline - Redesign item */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500">Pipeline Timeline Progress</h4>
                <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 space-y-4 font-bold text-xxs">
                  {[
                    { label: "1. Resume Applied", date: new Date(selectedApp.applied_at).toLocaleDateString(), done: true },
                    { label: "2. Recruiter Under Review", date: "Verified Match", done: selectedApp.status !== 'applied' },
                    { label: "3. Assessment / Shortlist", date: "Pending Invite", done: ['shortlisted', 'interviewing', 'offered'].includes(selectedApp.status) },
                    { label: "4. Interview Round Schedule", date: "Video Call Call Setup", done: ['interviewing', 'offered'].includes(selectedApp.status) },
                    { label: "5. Official Offer Decision", date: "Awaiting approval", done: ['offered'].includes(selectedApp.status) }
                  ].map((step, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-[8px] font-black ${
                          step.done ? "bg-emerald-600/35 border-emerald-500 text-emerald-300" : "bg-slate-950 border-white/10 text-slate-500"
                        }`}>
                          {step.done ? "✓" : i+1}
                        </div>
                        <span className={step.done ? "text-slate-200" : "text-slate-500"}>{step.label}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-extrabold">{step.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Rejection Insights / suggestions widget */}
              {selectedApp.status === 'rejected' && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-455 flex items-center gap-1">
                    <AlertTriangle size={13} /> AI Rejection Insights
                  </h4>
                  <p className="text-xxs text-rose-350 leading-relaxed font-semibold">
                    Our AI model indicates that adding CUDA optimization or Kubernetes credentials could lift matching indices for similar roles at Netflix and NVIDIA by 18%.
                  </p>
                </div>
              )}

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
              </div>

              {/* Action buttons */}
              <div className="pt-6 border-t border-white/5 flex justify-between items-center gap-3">
                <button
                  onClick={handleSetReminder}
                  className="px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Calendar size={13} className="text-emerald-450" />
                  <span>Set Follow-up</span>
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedApp(null)}
                    className="px-5 py-3 border border-white/10 hover:bg-white/5 text-slate-400 hover:text-white font-extrabold text-xs rounded-xl transition-all active:scale-95 cursor-pointer"
                  >
                    Close
                  </button>
                  <Link
                    to="/messages"
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-extrabold text-xs rounded-xl transition-all shadow-lg active:scale-95 text-center flex items-center justify-center border border-emerald-550 uppercase tracking-wider"
                  >
                    Chat Recruiter
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </PageTransition>
  );
}
