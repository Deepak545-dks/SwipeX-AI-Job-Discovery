import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar as CalendarIcon, Clock, User, Check, X, AlertCircle, 
  Sparkles, CalendarPlus, CheckCircle, Video, 
  MapPin, Loader2, ArrowRight, HelpCircle 
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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-8">
      {/* Upper header */}
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          <CalendarIcon className="text-violet-400" />
          <span>Calendar & Meetings</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Manage scheduled interview rounds and video conferences</p>
      </div>

      {error && (
        <div className="p-4 bg-red-955/20 border border-red-900/30 text-red-400 text-xs font-semibold rounded-2xl flex items-center space-x-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column: List of scheduled interviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md">
            <h2 className="text-base font-black text-white mb-6 tracking-tight">Your Scheduled Meetings</h2>
            
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-violet-500" />
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-16 space-y-3 bg-slate-950/20 rounded-2xl border border-white/5 border-dashed">
                <CalendarIcon size={32} className="text-slate-700 mx-auto" />
                <p className="text-slate-500 text-xs">No interviews scheduled yet.</p>
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
                          ? 'bg-slate-905/30 border-slate-800' 
                          : isDeclined 
                            ? 'bg-red-955/10 border-red-950/20 opacity-60' 
                            : 'bg-slate-955/20 border-white/5 border-dashed'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${
                            isAccepted 
                              ? 'bg-emerald-950/40 border-emerald-900/50 text-emerald-400' 
                              : isDeclined 
                                ? 'bg-red-955/20 border-red-900/30 text-red-400' 
                                : 'bg-amber-955/20 border-amber-900/30 text-amber-400'
                          }`}>
                            {meeting.status}
                          </span>
                          {meeting.google_calendar_event_id && (
                            <span className="text-[9px] font-bold text-violet-400 bg-violet-500/10 border border-violet-500/15 px-2 py-0.5 rounded">Google Calendar Synced</span>
                          )}
                        </div>

                        <div>
                          <h4 className="text-sm font-bold text-white tracking-tight">{meeting.title}</h4>
                          <p className="text-slate-400 text-xxs mt-0.5">{targetName} • {companyDetails}</p>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-slate-500 text-xxs">
                          <span className="flex items-center space-x-1.5">
                            <CalendarIcon size={12} />
                            <span>{formattedDate}</span>
                          </span>
                          <span className="flex items-center space-x-1.5">
                            <Clock size={12} />
                            <span>{formattedTime}</span>
                          </span>
                        </div>
                        {meeting.description && (
                          <p className="text-slate-400 text-xxs bg-slate-950/40 px-3 py-2 rounded-xl border border-white/5 max-w-lg">
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
                              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xxs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <Check size={12} />
                              <span>Accept</span>
                            </button>
                            <button
                              onClick={() => handleResponse(meeting.id, 'declined')}
                              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-550 text-white rounded-xl text-xxs font-bold transition-all flex items-center space-x-1 cursor-pointer"
                            >
                              <X size={12} />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {isAccepted && (
                          <button
                            onClick={() => navigate(`/call/${meeting.id}?opponent=${targetName}`)}
                            className="px-4 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xxs font-bold transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
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
        <div className="lg:col-span-1">
          {user.role === 'recruiter' ? (
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Schedule Interview</h3>
                <p className="text-slate-400 text-xxs mt-0.5">Invite shortlisted seekers to virtual calls</p>
              </div>

              {loadingApps ? (
                <div className="flex justify-center py-6">
                  <Loader2 size={16} className="animate-spin text-violet-500" />
                </div>
              ) : applications.length === 0 ? (
                <p className="text-slate-500 text-xxs leading-relaxed">No candidates are currently shortlisted or awaiting schedules.</p>
              ) : (
                <form onSubmit={handleScheduleInterview} className="space-y-4">
                  
                  {/* Select application */}
                  <div className="space-y-1.5">
                    <label className="text-slate-350 text-[10px] font-bold uppercase tracking-wider">Candidate / Job</label>
                    <select
                      value={selectedAppId}
                      onChange={(e) => setSelectedAppId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer"
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
                    <label className="text-slate-350 text-[10px] font-bold uppercase tracking-wider">Interview Title</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Technical Round 1"
                      className="w-full bg-slate-950 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-slate-350 text-[10px] font-bold uppercase tracking-wider">Description</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Meeting notes or links..."
                      rows={3}
                      className="w-full bg-slate-955/50 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none resize-none transition-all"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-slate-355 text-[10px] font-bold uppercase tracking-wider">Date</label>
                      <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-slate-355 text-[10px] font-bold uppercase tracking-wider">Time</label>
                      <input
                        type="time"
                        required
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="text-slate-350 text-[10px] font-bold uppercase tracking-wider">Duration</label>
                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full bg-slate-955/50 border border-white/5 focus:border-violet-500/50 rounded-xl py-3 px-4 text-white text-xs outline-none transition-all cursor-pointer"
                    >
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1.5 Hours</option>
                    </select>
                  </div>

                  {/* Google Calendar Sync */}
                  <label className="flex items-center space-x-3 cursor-pointer py-1">
                    <input
                      type="checkbox"
                      checked={syncCalendar}
                      onChange={(e) => setSyncCalendar(e.target.checked)}
                      className="rounded border-white/10 bg-slate-955 text-violet-650 focus:ring-violet-500/5 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xxs font-bold select-none">Sync to Google Calendar</span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-30 shadow-md shadow-violet-500/10 cursor-pointer"
                  >
                    {submitting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <CalendarPlus size={14} className="mr-1.5" />
                        <span>Schedule Slot</span>
                      </>
                    )}
                  </button>

                </form>
              )}

            </div>
          ) : (
            <div className="bg-slate-900/40 border border-white/5 p-6 rounded-3xl backdrop-blur-md space-y-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-xs tracking-tight">Calendar Notifications</h3>
                <p className="text-slate-405 text-xxs mt-1.5 leading-relaxed">
                  Invitations scheduled by recruiters will reflect on this dashboard in real-time. Accept slot invitations to auto-progress your application status and unlock WebRTC call conference channels.
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
