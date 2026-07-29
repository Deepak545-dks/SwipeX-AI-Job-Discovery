import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, User, Check, X, AlertCircle, 
  Sparkles, CalendarPlus, CheckCircle, Video, 
  MapPin, Loader2, ArrowRight, HelpCircle, Cpu
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function CalendarDashboard() {
  const { user } = useSelector(state => state.auth);
  const navigate = useNavigate();

  // Core stats
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Recruiter specific states
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form scheduling inputs
  const [selectedAppId, setSelectedAppId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60'); // Minutes
  const [syncCalendar, setSyncCalendar] = useState(true);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const response = await api.get('/jobs/my-interviews/');
      setInterviews(response.data.results || response.data);
    } catch (err) {
      setError('Failed to load scheduled interviews.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterApplications = async () => {
    if (user.role !== 'recruiter') return;
    setLoadingApps(true);
    try {
      const response = await api.get('/jobs/recruiter-jobs/');
      const jobsList = response.data.results || response.data;
      
      let allApps = [];
      for (let job of jobsList) {
        const appResp = await api.get(`/jobs/${job.id}/applicants/`);
        const apps = appResp.data.results || appResp.data;
        const filtered = apps.filter(a => ['shortlisted', 'applied', 'interviewing'].includes(a.status));
        allApps = [...allApps, ...filtered.map(a => ({ ...a, job_title: job.title }))];
      }
      setApplications(allApps);
      if (allApps.length > 0) {
        setSelectedAppId(allApps[0].id);
      }
    } catch (err) {
      console.error("Failed to load recruiter applications list:", err);
    } finally {
      setLoadingApps(false);
    }
  };

  useEffect(() => {
    fetchInterviews();
    fetchRecruiterApplications();
  }, []);

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !title || !startDate || !startTime) return;

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(duration) * 60 * 1000);

      await api.post('/jobs/interviews/', {
        application: selectedAppId,
        title,
        description,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        sync_calendar: syncCalendar
      });

      // Reset Form fields
      setTitle('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      
      // Reload lists
      fetchInterviews();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to schedule interview slot.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResponse = async (interviewId, respondStatus) => {
    try {
      await api.post(`/jobs/interviews/${interviewId}/respond/`, {
        status: respondStatus
      });
      fetchInterviews();
    } catch (err) {
      setError('Failed to update slot status.');
    }
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10 text-white">
      
      {/* Background spotlights: Orange + Purple Theme for Calendar Page */}
      <div className="absolute top-[10%] left-[20%] w-[420px] h-[420px] bg-gradient-to-tr from-orange-500/15 via-violet-650/10 to-transparent rounded-full blur-[125px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[380px] h-[380px] bg-gradient-to-tr from-violet-600/15 via-orange-500/10 to-transparent rounded-full blur-[125px] -z-10 pointer-events-none" />

      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8 text-left">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-orange-400" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-violet-400">Interviews & Schedules</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 font-semibold">Track pending calls, access WebRTC video panels, and deploy calendar slots.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-200/20 text-rose-400 text-xs font-semibold rounded-2xl flex items-center space-x-3 text-left">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of scheduled interviews */}
        <div className="lg:col-span-2 p-[1.5px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl">
          <div className="bg-slate-950/80 backdrop-blur-2xl p-6 rounded-[23px] space-y-6 text-left border border-white/5">
            <h2 className="text-base font-black text-white tracking-tight border-b border-white/5 pb-4">Meeting Agenda Feed</h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-orange-400" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-slate-900/40 border border-white/5 border-dashed rounded-2xl">
                <CalendarIcon size={32} className="text-slate-650 mx-auto" />
                <p className="text-slate-500 text-xs font-bold">No interviews scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {interviews.map((meeting) => {
                  const isPending = meeting.status === 'pending';
                  const isAccepted = meeting.status === 'accepted';
                  const isDeclined = meeting.status === 'declined';
                  
                  const start = new Date(meeting.start_time);
                  const end = new Date(meeting.end_time);
                  const formattedDate = start.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
                  const formattedTime = `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

                  const targetName = user.role === 'job_seeker' ? meeting.recruiter_name : meeting.seeker_name;
                  const companyDetails = user.role === 'job_seeker' ? `${meeting.company_name} • ${meeting.job_title}` : `For position: ${meeting.job_title}`;

                  return (
                    <div 
                      key={meeting.id}
                      className={`p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 border ${
                        isAccepted 
                          ? 'glass-card-orange-gold text-white border-orange-500/30 shadow-md animate-pulse' 
                          : isDeclined 
                            ? 'bg-rose-955/10 border-rose-900/30 opacity-60 text-slate-400' 
                            : 'bg-slate-900/40 border-white/5 border-dashed'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            isAccepted 
                              ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400' 
                              : isDeclined 
                                ? 'bg-rose-600/20 border-rose-500/30 text-rose-400' 
                                : 'bg-amber-600/20 border-amber-500/30 text-amber-400'
                          }`}>
                            {meeting.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-white">{meeting.title}</h4>
                          <p className="text-xxs text-slate-400 font-semibold">{companyDetails}</p>
                        </div>

                        <div className="space-y-1 text-xxs text-slate-400 font-semibold">
                          <div className="flex items-center space-x-1.5">
                            <CalendarIcon size={12} className="text-slate-500" />
                            <span>{formattedDate}</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <Clock size={12} className="text-slate-500" />
                            <span>{formattedTime}</span>
                          </div>
                        </div>

                        {meeting.description && (
                          <p className="text-[10px] text-slate-405 leading-relaxed bg-slate-950/40 p-2.5 rounded-lg border border-white/5 font-semibold">
                            {meeting.description}
                          </p>
                        )}
                      </div>

                      <div className="flex sm:flex-col gap-2 shrink-0 justify-end">
                        {isPending && user.role === 'job_seeker' && (
                          <>
                            <button
                              onClick={() => handleResponse(meeting.id, 'accepted')}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xxs font-black uppercase tracking-wider cursor-pointer"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleResponse(meeting.id, 'declined')}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xxs font-black uppercase tracking-wider cursor-pointer"
                            >
                              Decline
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => navigate(`/call/${meeting.id}`)}
                            className="px-4.5 py-2.5 bg-gradient-to-r from-orange-600 to-violet-650 hover:from-orange-500 hover:to-violet-550 text-white rounded-xl text-xxs font-black uppercase tracking-widest flex items-center space-x-1.5 shadow border border-orange-500"
                          >
                            <Video size={12} />
                            <span>Launch Room</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Right Column: Schedule / Radar info */}
        <div>
          {user.role === 'recruiter' ? (
            <div className="p-[1px] rounded-3xl bg-gradient-to-b from-white/10 to-transparent shadow-xl">
              <div className="bg-slate-955 backdrop-blur-2xl p-6 rounded-[23px] space-y-6 text-left border border-white/5">
                
                <h3 className="text-base font-black text-white tracking-tight border-b border-white/5 pb-4 flex items-center gap-2">
                  <CalendarPlus className="text-orange-400" />
                  <span>Propose Call Slot</span>
                </h3>

                {loadingApps ? (
                  <div className="flex justify-center py-6">
                    <Loader2 size={16} className="animate-spin text-orange-400" />
                  </div>
                ) : applications.length === 0 ? (
                  <p className="text-slate-500 text-xxs font-bold">No active candidates eligible for interviews.</p>
                ) : (
                  <form onSubmit={handleScheduleInterview} className="space-y-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Select Candidate</label>
                      <select
                        value={selectedAppId}
                        onChange={(e) => setSelectedAppId(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none cursor-pointer font-semibold"
                      >
                        {applications.map((app) => (
                          <option key={app.id} value={app.id}>
                            {app.seeker_name} - {app.job_title}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Interview Title</label>
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Technical Round 1"
                        className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Meeting notes or links..."
                        rows={3}
                        className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none resize-none transition-all placeholder-slate-550 font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Date</label>
                        <input
                          type="date"
                          required
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer font-semibold"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Time</label>
                        <input
                          type="time"
                          required
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Duration</label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-orange-500 rounded-xl py-3 px-4 text-white text-xs outline-none cursor-pointer font-semibold"
                      >
                        <option value="30">30 Minutes</option>
                        <option value="45">45 Minutes</option>
                        <option value="60">1 Hour</option>
                        <option value="90">1.5 Hours</option>
                      </select>
                    </div>

                    <label className="flex items-center space-x-3 cursor-pointer py-1 text-slate-300 text-xxs font-extrabold select-none">
                      <input
                        type="checkbox"
                        checked={syncCalendar}
                        onChange={(e) => setSyncCalendar(e.target.checked)}
                        className="rounded border-white/10 bg-slate-900 text-orange-505 focus:ring-orange-500/5 w-4 h-4 cursor-pointer"
                      />
                      <span className="uppercase tracking-wider">Sync Google Calendar</span>
                    </label>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-3.5 bg-gradient-to-r from-orange-600 via-amber-600 to-violet-650 hover:from-orange-500 hover:to-violet-550 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-md cursor-pointer border border-orange-550"
                    >
                      {submitting ? (
                        <Loader2 size={14} className="animate-spin mx-auto" />
                      ) : (
                        <>
                          <CalendarPlus size={14} className="inline mr-1.5" />
                          <span>Schedule Slot</span>
                        </>
                      )}
                    </button>

                  </form>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-slate-950/80 backdrop-blur-2xl p-6 rounded-[23px] space-y-4 text-left border border-white/5 shadow-xl">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-white font-black text-xs tracking-tight uppercase tracking-wider">Schedules Radar</h3>
                <p className="text-slate-400 text-xxs mt-2.5 leading-relaxed font-semibold">
                  Scheduled interview slots proposed by recruiters will automatically sync here. Accept invites to lock schedules and enable WebRTC communication rooms.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
