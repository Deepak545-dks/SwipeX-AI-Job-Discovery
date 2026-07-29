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
    <PageTransition className="max-w-7xl mx-auto px-6 py-12 space-y-10 relative z-10 text-slate-800">
      
      {/* Upper header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-8 text-left">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            <Cpu className="text-violet-600" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500">Interviews & Schedules</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1.5 font-semibold">Track pending calls, access WebRTC video panels, and deploy calendar slots.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-805 text-xs font-semibold rounded-2xl flex items-center space-x-3 text-left">
          <AlertCircle size={16} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of scheduled interviews */}
        <div className="lg:col-span-2 p-[1px] rounded-3xl bg-gradient-to-b from-slate-200 to-transparent shadow-lg">
          <div className="bg-white rounded-[23px] p-6 space-y-6 text-left border border-white">
            <h2 className="text-base font-black text-slate-850 tracking-tight border-b border-slate-100 pb-4">Meeting Agenda Feed</h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-violet-605" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-slate-50 border border-slate-200 border-dashed rounded-2xl">
                <CalendarIcon size={32} className="text-slate-400 mx-auto" />
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
                      className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                        isAccepted 
                          ? 'bg-slate-50/50 border-slate-200 hover:border-violet-500/40 shadow-sm' 
                          : isDeclined 
                            ? 'bg-rose-50/30 border-rose-200 opacity-60 text-slate-500' 
                            : 'bg-white border-slate-200 border-dashed border-2'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2.5">
                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${
                            isAccepted 
                              ? 'bg-emerald-50 border-emerald-250 text-emerald-650' 
                              : isDeclined 
                                ? 'bg-rose-50 border-rose-250 text-rose-650' 
                                : 'bg-amber-50 border-amber-250 text-amber-650'
                          }`}>
                            {meeting.status}
                          </span>
                          {meeting.google_calendar_event_id && (
                            <span className="text-[8px] font-black text-violet-650 bg-violet-50 border border-violet-200 px-2 py-0.5 rounded uppercase tracking-wider">Google Synced</span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-slate-850 tracking-tight">{meeting.title}</h4>
                          <p className="text-slate-500 text-xxs mt-0.5 font-semibold">{targetName} • {companyDetails}</p>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-500 text-xxs font-semibold">
                          <span className="flex items-center space-x-1.5">
                            <CalendarIcon size={12} className="text-slate-400" />
                            <span>{formattedDate}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Clock size={12} className="text-slate-400" />
                            <span>{formattedTime}</span>
                          </span>
                        </div>
                        {meeting.description && (
                          <p className="text-slate-600 text-xxs bg-white border border-slate-200 px-3 py-2 rounded-xl max-w-lg font-semibold shadow-sm">
                            {meeting.description}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                        {user.role === 'job_seeker' && isPending && (
                          <>
                            <button
                              onClick={() => handleResponse(meeting.id, 'accepted')}
                              className="px-4 py-2 bg-emerald-605 hover:bg-emerald-500 text-white rounded-xl text-xxs font-black transition-all flex items-center space-x-1 cursor-pointer uppercase tracking-wider border border-emerald-550"
                            >
                              <Check size={12} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleResponse(meeting.id, 'declined')}
                              className="px-4 py-2 bg-rose-600 hover:bg-rose-550 text-white rounded-xl text-xxs font-black transition-all flex items-center space-x-1 cursor-pointer uppercase tracking-wider border border-rose-550"
                            >
                              <X size={12} />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => navigate(`/call/${meeting.id}?opponent=${targetName}`)}
                            className="px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xxs font-extrabold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer uppercase tracking-wider border border-violet-550"
                          >
                            <Video size={13} />
                            <span>Join Video Call</span>
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

        {/* Right Column: Recruiter scheduling wizard form */}
        <div className="lg:col-span-1 p-[1px] rounded-3xl bg-gradient-to-b from-slate-200 to-transparent shadow-lg">
          {user.role === 'recruiter' ? (
            <div className="bg-white p-6 rounded-[23px] space-y-6 text-left border border-white">
              <div>
                <h3 className="text-sm font-bold text-slate-800 tracking-tight">Schedule Interview</h3>
                <p className="text-slate-500 text-xxs mt-0.5 font-semibold">Invite shortlisted seekers to virtual calls</p>
              </div>

              {loadingApps ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={16} className="animate-spin text-violet-600" />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-slate-500 text-xxs leading-relaxed font-semibold">No candidates are currently shortlisted or awaiting schedules.</p>
              ) : (
                <form onSubmit={handleScheduleInterview} className="space-y-4">
                  
                  {/* Select application */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Candidate / Job</label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none transition-all cursor-pointer font-semibold"
                    >
                      {applications.map((app) => (
                        <option key={app.id} value={app.id}>
                          {app.applicant_profile?.full_name || app.applicant?.email} - {app.job_title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Interview Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Technical Round 1"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none transition-all placeholder-slate-400 font-semibold"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Meeting notes or links..."
                      rows={3}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none resize-none transition-all placeholder-slate-400 font-semibold"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none transition-all cursor-pointer font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Time</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none transition-all cursor-pointer font-semibold"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-550 focus:bg-white rounded-xl py-3 px-4 text-slate-900 text-xs outline-none transition-all cursor-pointer font-semibold"
                    >
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1.5 Hours</option>
                    </select>
                  </div>

                  {/* Google Calendar Sync */}
                  <label className="flex items-center space-x-3 cursor-pointer py-1 text-slate-600 text-xxs font-extrabold select-none">
                    <input
                      type="checkbox"
                      checked={syncCalendar}
                      onChange={(e) => setSyncCalendar(e.target.checked)}
                      className="rounded border-slate-350 bg-white text-violet-600 focus:ring-violet-500/5 w-4 h-4 cursor-pointer"
                    />
                    <span className="uppercase tracking-wider">Sync Google Calendar</span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 shadow-md cursor-pointer border border-violet-550"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
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
          ) : (
            <div className="bg-white p-6 rounded-[23px] space-y-4 text-left border border-white shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-605">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-slate-805 font-black text-xs tracking-tight uppercase tracking-wider">Schedules Radar</h3>
                <p className="text-slate-500 text-xxs mt-2.5 leading-relaxed font-semibold">
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
