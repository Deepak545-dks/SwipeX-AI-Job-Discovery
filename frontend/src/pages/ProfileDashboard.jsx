import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Briefcase, GraduationCap, Code, FileText, Folder, BarChart2,
  Plus, Trash2, Globe, Phone, Pencil, X, Sparkles, AlertCircle,
  Mail, Calendar, MapPin, Loader2, Save, Upload, CheckCircle, ExternalLink, Link as LinkIcon, Cpu, Target, Award, ShieldAlert
} from 'lucide-react';
import api from '../utils/api';
import { updateUser } from '../store/slices/authSlice';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Personal Info Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Skills input state
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');

  // Experience form state (Add & Edit)
  const [editingExpId, setEditingExpId] = useState(null);
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expLocation, setExpLocation] = useState('');
  const [expStartDate, setExpStartDate] = useState('');
  const [expEndDate, setExpEndDate] = useState('');
  const [expIsCurrent, setExpIsCurrent] = useState(false);
  const [expDescription, setExpDescription] = useState('');

  // Education form state (Add & Edit)
  const [editingEduId, setEditingEduId] = useState(null);
  const [eduInstitution, setEduInstitution] = useState('');
  const [eduDegree, setEduDegree] = useState('');
  const [eduField, setEduField] = useState('');
  const [eduStartDate, setEduStartDate] = useState('');
  const [eduEndDate, setEduEndDate] = useState('');
  const [eduIsCurrent, setEduIsCurrent] = useState(false);
  const [eduDescription, setEduDescription] = useState('');

  // Projects form state (Add & Edit)
  const [editingProjId, setEditingProjId] = useState(null);
  const [projName, setProjName] = useState('');
  const [projDescription, setProjDescription] = useState('');
  const [projStartDate, setProjStartDate] = useState('');
  const [projEndDate, setProjEndDate] = useState('');
  const [projIsCurrent, setProjIsCurrent] = useState(false);
  const [projUrl, setProjUrl] = useState('');

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // AI Resume Analysis state
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [analyzingResume, setAnalyzingResume] = useState(false);

  const { showToast } = useToast();

  const validateUrl = (url) => {
    if (!url) return true;
    try {
      if (!url.startsWith('http://') && !url.startsWith('https://')) return false;
      new URL(url);
      return true;
    } catch (_) {
      return false;
    }
  };

  const dispatch = useDispatch();

  const fetchProfile = async () => {
    try {
      const response = await api.get('/profiles/me/');
      const data = response.data;
      setProfile(data);
      setFullName(data.full_name || '');
      setPhone(data.phone || '');
      setBio(data.bio || '');
      setPortfolioUrl(data.portfolio_url || '');
      setGithubUrl(data.github_url || '');
      setLinkedinUrl(data.linkedin_url || '');
      setSkills(data.skills || []);

      // If there is a resume analysis cache
      if (data.resumes && data.resumes.length > 0) {
        try {
          const analysisResp = await api.get(`/jobs/ai/resume-analysis-history/`);
          setAiAnalysis(analysisResp.data.analysis || analysisResp.data);
        } catch (e) {
          console.log("No previous resume analysis found.");
        }
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch profile settings data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (portfolioUrl && !validateUrl(portfolioUrl)) {
      showToast('Portfolio URL must start with http:// or https://', 'error');
      return;
    }
    if (githubUrl && !validateUrl(githubUrl)) {
      showToast('GitHub URL must start with http:// or https://', 'error');
      return;
    }
    if (linkedinUrl && !validateUrl(linkedinUrl)) {
      showToast('LinkedIn URL must start with http:// or https://', 'error');
      return;
    }

    setSaving(true);
    try {
      const response = await api.put('/profiles/update/', {
        full_name: fullName,
        phone: phone,
        bio: bio,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl
      });
      setProfile(response.data);
      dispatch(updateUser({ full_name: response.data.full_name }));
      showToast('Profile updated successfully.', 'success');
      setMessage('Profile settings saved successfully.');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update personal details.');
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profile_picture', file);

    setUploadingAvatar(true);
    try {
      const response = await api.put('/profiles/update/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(response.data);
      showToast('Avatar updated successfully.', 'success');
    } catch (err) {
      showToast('Failed to upload avatar picture.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSkillAdd = async (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (!clean) return;
    if (skills.includes(clean)) {
      setSkillInput('');
      return;
    }

    const updated = [...skills, clean];
    try {
      const response = await api.put('/profiles/update/', { skills: updated });
      setSkills(response.data.skills);
      setProfile(response.data);
      setSkillInput('');
      showToast(`Added ${clean} to skills.`, 'success');
    } catch (err) {
      showToast('Failed to append technical skill.', 'error');
    }
  };

  const handleSkillRemove = async (skillToRemove) => {
    const updated = skills.filter(s => s !== skillToRemove);
    try {
      const response = await api.put('/profiles/update/', { skills: updated });
      setSkills(response.data.skills);
      setProfile(response.data);
      showToast(`Removed ${skillToRemove} from skills.`, 'info');
    } catch (err) {
      showToast('Failed to delete skill.', 'error');
    }
  };

  const handleAddExperience = async (e) => {
    e.preventDefault();
    if (!expCompany || !expTitle || !expStartDate) {
      showToast('Please fill in Company, Job Title and Start Date fields.', 'warning');
      return;
    }

    const payload = {
      company_name: expCompany,
      job_title: expTitle,
      location: expLocation,
      start_date: expStartDate,
      end_date: expIsCurrent ? null : expEndDate,
      is_current: expIsCurrent,
      description: expDescription
    };

    setSaving(true);
    try {
      await api.post('/profiles/experience/', payload);
      showToast('Work history added successfully.', 'success');
      setExpCompany('');
      setExpTitle('');
      setExpLocation('');
      setExpStartDate('');
      setExpEndDate('');
      setExpIsCurrent(false);
      setExpDescription('');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to append experience record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExperience = async (id) => {
    try {
      await api.delete(`/profiles/experience/${id}/`);
      showToast('Experience log deleted.', 'info');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to delete experience log.', 'error');
    }
  };

  const handleAddEducation = async (e) => {
    e.preventDefault();
    if (!eduInstitution || !eduDegree || !eduStartDate) {
      showToast('Please enter Institution, Degree and Start Date.', 'warning');
      return;
    }

    const payload = {
      institution_name: eduInstitution,
      degree: eduDegree,
      field_of_study: eduField,
      start_date: eduStartDate,
      end_date: eduIsCurrent ? null : eduEndDate,
      is_current: eduIsCurrent,
      description: eduDescription
    };

    setSaving(true);
    try {
      await api.post('/profiles/education/', payload);
      showToast('Education record added successfully.', 'success');
      setEduInstitution('');
      setEduDegree('');
      setEduField('');
      setEduStartDate('');
      setEduEndDate('');
      setEduIsCurrent(false);
      setEduDescription('');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to append education details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/profiles/education/${id}/`);
      showToast('Education record deleted.', 'info');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to delete education log.', 'error');
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!projName || !projStartDate) {
      showToast('Project Name and Start Date are required.', 'warning');
      return;
    }

    if (projUrl && !validateUrl(projUrl)) {
      showToast('Project URL must start with http:// or https://', 'error');
      return;
    }

    const payload = {
      project_name: projName,
      description: projDescription,
      start_date: projStartDate,
      end_date: projIsCurrent ? null : projEndDate,
      is_current: projIsCurrent,
      project_url: projUrl
    };

    setSaving(true);
    try {
      await api.post('/profiles/projects/', payload);
      showToast('Project details added successfully.', 'success');
      setProjName('');
      setProjDescription('');
      setProjStartDate('');
      setProjEndDate('');
      setProjIsCurrent(false);
      setProjUrl('');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to append project record.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/profiles/projects/${id}/`);
      showToast('Project showcase record deleted.', 'info');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to delete project.', 'error');
    }
  };

  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) {
      showToast('Please select a PDF file to upload.', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('file', resumeFile);

    setUploadingResume(true);
    try {
      const response = await api.post('/profiles/resumes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResumeFile(null);
      showToast('Resume uploaded successfully.', 'success');
      await fetchProfile();
    } catch (err) {
      showToast('Failed to upload resume file.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleDeleteResume = async (id) => {
    try {
      await api.delete(`/profiles/resumes/${id}/`);
      showToast('Resume deleted successfully.', 'info');
      setAiAnalysis(null);
      await fetchProfile();
    } catch (err) {
      showToast('Failed to delete resume.', 'error');
    }
  };

  const handleGenerateAiAnalysis = async (resumeId) => {
    setAnalyzingResume(true);
    try {
      const response = await api.post('/jobs/ai/analyze-resume/', { resume_id: resumeId });
      setAiAnalysis(response.data.analysis || response.data);
      showToast('AI Resume Analysis completed successfully.', 'success');
    } catch (err) {
      showToast('Failed to analyze resume.', 'error');
    } finally {
      setAnalyzingResume(false);
    }
  };

  if (loading) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-6 py-12 flex items-center justify-center">
        <div className="w-full max-w-sm h-72 bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl">
          <Loader2 className="animate-spin text-violet-400" size={32} />
          <span className="text-slate-500 text-xxs font-extrabold uppercase tracking-widest mt-4">Syncing Hub...</span>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-4 gap-8 relative z-10 text-left">
      
      {/* Ambient background spotlights for Profile page (Purple + Gold Theme) */}
      <div className="absolute top-[10%] left-[10%] w-[380px] h-[380px] bg-gradient-to-tr from-violet-650/10 via-amber-500/10 to-transparent rounded-full blur-[110px] -z-10 pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-gradient-to-tr from-amber-600/10 via-violet-550/10 to-transparent rounded-full blur-[110px] -z-10 pointer-events-none" />

      {/* LEFT COLUMN: Circular Avatar Cover and Tab lists (1 col span) */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Avatar Cover Card */}
        <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-violet-500/30 via-amber-500/30 to-yellow-500/10 shadow-2xl">
          <div className="bg-slate-955/90 rounded-[23px] p-6 backdrop-blur-2xl text-center relative group">
            
            {/* Click avatar uploader */}
            <div className="relative w-20 h-20 mx-auto group">
              {profile.profile_picture ? (
                <img 
                  src={profile.profile_picture} 
                  alt="Avatar" 
                  className="w-20 h-20 rounded-full object-cover mx-auto border-2 border-violet-500/25 shadow-lg group-hover:border-violet-455 transition-colors" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-2xl font-black text-white mx-auto shadow-md">
                  {fullName ? fullName.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
                </div>
              )}
              
              <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
                {uploadingAvatar ? (
                  <Loader2 size={16} className="animate-spin text-white" />
                ) : (
                  <>
                    <Upload size={16} className="text-white animate-bounce" />
                    <span className="text-[8px] text-slate-300 font-bold uppercase mt-1">Upload</span>
                  </>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleAvatarUpload} 
                  className="hidden" 
                />
              </label>
            </div>

            <h2 className="text-base font-black text-white mt-4">{fullName || 'Add your name'}</h2>
            <p className="text-slate-400 text-[10px] mt-1 uppercase tracking-wider font-extrabold">{profile.role.replace('_', ' ')}</p>
            <p className="text-slate-500 text-xxs mt-2 break-all">{profile.email}</p>
          </div>
        </div>

        {/* Tab Selectors Panel */}
        <div className="p-[1.5px] rounded-3xl bg-gradient-to-b from-violet-500/10 via-amber-500/10 to-yellow-500/10 shadow-xl">
          <div className="bg-slate-955/90 rounded-[23px] p-3 backdrop-blur-2xl flex flex-col space-y-1">
            {[
              { id: 'overview', label: 'Overview Hub', icon: BarChart2 },
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'skills', label: 'Technical Skills', icon: Code },
              { id: 'experience', label: 'Experience Logs', icon: Briefcase },
              { id: 'education', label: 'Education Hub', icon: GraduationCap },
              { id: 'projects', label: 'Projects Showcase', icon: Folder },
              { id: 'resume', label: 'Resumes & AI', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError(''); setMessage(''); }}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Tab Panel content consoles (3 col span) */}
      <div className="lg:col-span-3 space-y-6 text-left">
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-450 text-xs font-bold">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/20 text-emerald-450 text-xs font-bold flex items-center space-x-2">
            <CheckCircle size={14} />
            <span>{message}</span>
          </div>
        )}

        <div className="p-[1.5px] rounded-3xl bg-gradient-to-tr from-violet-500/20 via-amber-500/20 to-yellow-500/25 shadow-2xl">
          <div className="bg-slate-955/90 rounded-[23px] p-6 sm:p-8 backdrop-blur-2xl shadow-xl min-h-[50vh]">
            
            {/* TAB 0: Overview Hub */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Covers banner details: Frosted Glass Profile Card */}
                <div className="p-6 rounded-3xl bg-white/5 backdrop-blur-2xl border border-white/10 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 shadow-xl">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400" />
                  <div>
                    <h4 className="text-2xl font-black text-white tracking-tight">{fullName || 'User Profile'}</h4>
                    <p className="text-xs text-violet-400 font-black mt-1 uppercase tracking-wider">{profile?.role?.replace('_', ' ')}</p>
                    <p className="text-slate-350 text-xs mt-3.5 leading-relaxed max-w-xl font-semibold">{bio || 'No professional summary set. Update personal details tab to describe your stack focus.'}</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('personal')}
                    className="px-5 py-3 border border-white/10 hover:border-violet-500/30 hover:bg-white/5 text-slate-300 hover:text-white rounded-2xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 uppercase tracking-wider"
                  >
                    <Pencil size={12} />
                    <span>Edit Profile</span>
                  </button>
                </div>

                <div className="grid md:grid-cols-12 gap-6">
                  {/* Left stats/handles (5 cols) */}
                  <div className="md:col-span-5 space-y-6">
                    {/* Handles */}
                    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-5">
                      <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5 pb-2">Connect Links</h5>
                      <div className="space-y-3.5 text-xs text-slate-350 font-bold">
                        {profile?.phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone size={13} className="text-slate-550" />
                            <span>{profile.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2.5">
                          <Mail size={13} className="text-slate-550" />
                          <span className="truncate">{profile?.email}</span>
                        </div>
                        {portfolioUrl && (
                          <a href={portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-violet-400 hover:underline">
                            <Globe size={13} className="text-violet-550" />
                            <span className="truncate">Portfolio Link</span>
                          </a>
                        )}
                        {githubUrl && (
                          <a href={githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2.5 text-violet-400 hover:underline">
                            <ExternalLink size={13} className="text-violet-550" />
                            <span className="truncate">GitHub Profile</span>
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Skills Summary with simulated proficiency bars */}
                    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Technical Skills</h5>
                        <button onClick={() => setActiveTab('skills')} className="text-violet-405 hover:underline text-[9px] font-black uppercase tracking-wider cursor-pointer">Edit</button>
                      </div>
                      <div className="space-y-4">
                        {skills.length === 0 ? (
                          <p className="text-slate-550 text-xxs font-semibold">No skills added yet.</p>
                        ) : (
                          skills.slice(0, 4).map((skill, index) => {
                            // Map proficiency levels: 90%, 80%, 75% etc for display
                            const val = [92, 85, 78, 70][index % 4];
                            return (
                              <div key={skill} className="space-y-1.5">
                                <div className="flex justify-between text-xxs font-bold text-slate-300">
                                  <span>{skill}</span>
                                  <span className="text-violet-400">{val}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                                  <div 
                                    className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full" 
                                    style={{ width: `${val}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                        {skills.length > 4 && (
                          <p className="text-slate-500 text-[10px] font-bold text-center pt-2">
                            +{skills.length - 4} more skills listed
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right timelines/AI (7 cols) */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Work history timeline */}
                    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Work History</h5>
                        <button onClick={() => setActiveTab('experience')} className="text-violet-405 hover:underline text-[9px] font-black uppercase tracking-wider cursor-pointer">Manage</button>
                      </div>
                      <div className="space-y-5 relative border-l border-white/10 pl-4 ml-1">
                        {profile?.experience && profile.experience.length > 0 ? (
                          profile.experience.map(exp => (
                            <div key={exp.id} className="relative space-y-1">
                              <span className="absolute -left-[21.5px] top-1.5 w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-slate-950" />
                              <div className="flex justify-between items-start text-xs font-black">
                                <h6 className="text-white">{exp.job_title}</h6>
                                <span className="text-[9px] text-slate-500 font-extrabold uppercase">{new Date(exp.start_date).getFullYear()} - {exp.is_current ? 'Present' : exp.end_date ? new Date(exp.end_date).getFullYear() : ''}</span>
                              </div>
                              <p className="text-violet-450 text-[10px] font-extrabold mt-0.5">{exp.company_name}</p>
                              <p className="text-slate-400 text-xxs leading-relaxed font-semibold line-clamp-2 mt-1">{exp.description}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-550 text-xxs font-semibold pl-2">No experience logs found.</p>
                        )}
                      </div>
                    </div>

                    {/* AI Resume Overview with Score Ring */}
                    <div className="p-6 rounded-3xl bg-slate-900/40 border border-white/10 space-y-5">
                      <div className="flex justify-between items-center border-b border-white/5 pb-2">
                        <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles size={12} className="text-violet-405" />
                          <span>AI Score Analysis</span>
                        </h5>
                        <button onClick={() => setActiveTab('resume')} className="text-violet-405 hover:underline text-[9px] font-black uppercase tracking-wider cursor-pointer">Analyze</button>
                      </div>
                      {aiAnalysis ? (
                        <div className="flex items-center gap-6">
                          {/* Circular Match Score SVG */}
                          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                stroke="rgba(255,255,255,0.05)"
                                strokeWidth="4.5"
                                fill="transparent"
                              />
                              <circle
                                cx="32"
                                cy="32"
                                r="26"
                                stroke="url(#scoreRingGlow)"
                                strokeWidth="5.5"
                                fill="transparent"
                                strokeDasharray={163}
                                strokeDashoffset={163 - (163 * (aiAnalysis.score || 85)) / 100}
                                strokeLinecap="round"
                              />
                              <defs>
                                <linearGradient id="scoreRingGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <span className="absolute text-xs font-black text-white">{aiAnalysis.score || 85}%</span>
                          </div>
                          <div>
                            <span className="text-xs font-black text-white block">ATS Target Checklist</span>
                            <span className="text-slate-400 text-xxs font-semibold mt-1 block">Your resume keyword matching status is optimized for AI discovery queues.</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-slate-550 text-xxs font-semibold">Upload your CV in the Resumes tab to request an automated ATS score audit here.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* TAB 1: Personal Info Details */}
            {activeTab === 'personal' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <User size={16} className="text-violet-400" />
                  <span>Personal Details Console</span>
                </h3>
                <form onSubmit={handleSavePersonal} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-widest mb-2">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                        placeholder="Jane Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                        placeholder="+1 (234) 567-890"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Professional Summary</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={4}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none resize-none transition-all placeholder-slate-555 font-semibold"
                      placeholder="Brief bio describing your field of expertise..."
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">Portfolio URL</label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-555 font-semibold"
                        placeholder="https://myportfolio.com"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">GitHub profile</label>
                      <input
                        type="url"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-555 font-semibold"
                        placeholder="https://github.com/myusername"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[10px] font-extrabold uppercase tracking-widest mb-2">LinkedIn profile</label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-555 font-semibold"
                        placeholder="https://linkedin.com/in/myusername"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3.5 bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white rounded-2xl text-xs font-extrabold transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                  >
                    {saving ? 'Saving changes...' : 'Save Settings'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: Technical Skills */}
            {activeTab === 'skills' && (
              <div className="space-y-6 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <Code size={16} className="text-violet-400" />
                  <span>Technical Skills Editor</span>
                </h3>

                <form onSubmit={handleSkillAdd} className="flex gap-3">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    className="flex-grow bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3 px-4 text-white text-xs outline-none transition-all placeholder-slate-555 font-semibold"
                    placeholder="E.g., PyTorch, GraphQL, CUDA"
                  />
                  <button
                    type="submit"
                    className="px-5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-2xl text-xs font-extrabold hover:scale-105 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Add
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-4">
                  {skills.length === 0 ? (
                    <p className="text-slate-500 text-xs">No technical skills added yet. Define your skill tag list above.</p>
                  ) : (
                    skills.map((skill) => (
                      <span 
                        key={skill} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-xxs font-extrabold"
                      >
                        <span>{skill}</span>
                        <button 
                          onClick={() => handleSkillRemove(skill)}
                          className="p-0.5 hover:bg-white/15 rounded-md text-slate-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: Experience Logs */}
            {activeTab === 'experience' && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <Briefcase size={16} className="text-violet-400" />
                  <span>Work History Console</span>
                </h3>

                <form onSubmit={handleAddExperience} className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Experience Record</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-450 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Job Title</label>
                      <input
                        type="text"
                        value={expTitle}
                        onChange={(e) => setExpTitle(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                        placeholder="Systems Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Company Name</label>
                      <input
                        type="text"
                        value={expCompany}
                        onChange={(e) => setExpCompany(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                        placeholder="Google Inc."
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={expEndDate}
                        disabled={expIsCurrent}
                        onChange={(e) => setExpEndDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-5">
                      <input
                        type="checkbox"
                        checked={expIsCurrent}
                        onChange={(e) => setExpIsCurrent(e.target.checked)}
                        className="rounded border-white/10 bg-slate-955 focus:ring-violet-500 cursor-pointer"
                        id="expCurrent"
                      />
                      <label htmlFor="expCurrent" className="text-xxs font-bold text-slate-400 uppercase tracking-wider cursor-pointer">Current Role</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Location</label>
                    <input
                      type="text"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                      placeholder="Mountain View, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Role Description</label>
                    <textarea
                      value={expDescription}
                      onChange={(e) => setExpDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none resize-none placeholder-slate-555 font-semibold"
                      placeholder="Detail technical actions, pipeline metrics, teams led..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-xl text-xs font-extrabold hover:scale-102 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Add Experience
                  </button>
                </form>

                <div className="space-y-4">
                  {profile.experience?.map((exp) => (
                    <div key={exp.id} className="flex justify-between items-start p-5 rounded-2xl bg-slate-900/60 border border-white/10">
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{exp.job_title}</h4>
                        <span className="text-violet-405 text-xxs font-bold">{exp.company_name}</span>
                        <p className="text-slate-500 text-xxs mt-1 font-semibold">{exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}</p>
                        <p className="text-slate-400 text-xxs mt-3 leading-relaxed font-semibold">{exp.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteExperience(exp.id)}
                        className="p-2 hover:bg-rose-955/20 border border-white/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: Education Hub */}
            {activeTab === 'education' && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <GraduationCap size={16} className="text-violet-400" />
                  <span>Education Hub Console</span>
                </h3>

                <form onSubmit={handleAddEducation} className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Academic Record</h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Institution Name</label>
                      <input
                        type="text"
                        value={eduInstitution}
                        onChange={(e) => setEduInstitution(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                        placeholder="Stanford University"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Degree</label>
                      <input
                        type="text"
                        value={eduDegree}
                        onChange={(e) => setEduDegree(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                        placeholder="Master of Science (M.S.)"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={eduStartDate}
                        onChange={(e) => setEduStartDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={eduEndDate}
                        disabled={eduIsCurrent}
                        onChange={(e) => setEduEndDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-5">
                      <input
                        type="checkbox"
                        checked={eduIsCurrent}
                        onChange={(e) => setEduIsCurrent(e.target.checked)}
                        className="rounded border-white/10 bg-slate-955 focus:ring-violet-500 cursor-pointer"
                        id="eduCurrent"
                      />
                      <label htmlFor="eduCurrent" className="text-xxs font-bold text-slate-400 uppercase tracking-wider cursor-pointer">Enrolled</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Field of Study</label>
                    <input
                      type="text"
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                      placeholder="Computer Science & ML"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-xl text-xs font-extrabold hover:scale-102 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Add Education
                  </button>
                </form>

                <div className="space-y-4">
                  {profile.education?.map((edu) => (
                    <div key={edu.id} className="flex justify-between items-start p-5 rounded-2xl bg-slate-900/60 border border-white/10">
                      <div>
                        <h4 className="text-sm font-extrabold text-white">{edu.degree} in {edu.field_of_study}</h4>
                        <span className="text-violet-405 text-xxs font-bold">{edu.institution_name}</span>
                        <p className="text-slate-500 text-xxs mt-1 font-semibold">{edu.start_date} - {edu.is_current ? 'Present' : edu.end_date}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteEducation(edu.id)}
                        className="p-2 hover:bg-rose-955/20 border border-white/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: Projects Showcase */}
            {activeTab === 'projects' && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <Folder size={16} className="text-violet-400" />
                  <span>Projects Showcase Console</span>
                </h3>

                <form onSubmit={handleAddProject} className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Add Project Record</h4>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Project Name</label>
                      <input
                        type="text"
                        value={projName}
                        onChange={(e) => setProjName(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-550 font-semibold"
                        placeholder="Decentralized Database Sync"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Project URL</label>
                      <input
                        type="url"
                        value={projUrl}
                        onChange={(e) => setProjUrl(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none placeholder-slate-555 font-semibold"
                        placeholder="https://github.com/myusername/project"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={projStartDate}
                        onChange={(e) => setProjStartDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={projEndDate}
                        disabled={projIsCurrent}
                        onChange={(e) => setProjEndDate(e.target.value)}
                        className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none font-semibold text-slate-400 disabled:opacity-50"
                      />
                    </div>
                    <div className="flex items-center space-x-2 pt-5">
                      <input
                        type="checkbox"
                        checked={projIsCurrent}
                        onChange={(e) => setProjIsCurrent(e.target.checked)}
                        className="rounded border-white/10 bg-slate-955 focus:ring-violet-500 cursor-pointer"
                        id="projCurrent"
                      />
                      <label htmlFor="projCurrent" className="text-xxs font-bold text-slate-400 uppercase tracking-wider cursor-pointer">In Development</label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-455 text-[9px] font-extrabold uppercase tracking-widest mb-1.5">Description</label>
                    <textarea
                      value={projDescription}
                      onChange={(e) => setProjDescription(e.target.value)}
                      rows={3}
                      className="w-full bg-slate-955 border border-white/5 rounded-xl py-2.5 px-3 text-white text-xs outline-none resize-none placeholder-slate-555 font-semibold"
                      placeholder="Build stack details, challenges met, throughput..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-xl text-xs font-extrabold hover:scale-102 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Add Project
                  </button>
                </form>

                <div className="space-y-4">
                  {profile.projects?.map((proj) => (
                    <div key={proj.id} className="flex justify-between items-start p-5 rounded-2xl bg-slate-900/60 border border-white/10">
                      <div>
                        <h4 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                          <span>{proj.project_name}</span>
                          {proj.project_url && (
                            <a href={proj.project_url} target="_blank" rel="noreferrer" className="text-slate-500 hover:text-white transition-colors">
                              <LinkIcon size={12} />
                            </a>
                          )}
                        </h4>
                        <p className="text-slate-500 text-xxs mt-1 font-semibold">{proj.start_date} - {proj.is_current ? 'Present' : proj.end_date}</p>
                        <p className="text-slate-400 text-xxs mt-3 leading-relaxed font-semibold">{proj.description}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-2 hover:bg-rose-955/20 border border-white/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: Resumes & AI Optimization */}
            {activeTab === 'resume' && (
              <div className="space-y-8 animate-fade-in">
                <h3 className="text-base font-black text-white tracking-tight mb-6 flex items-center gap-1.5">
                  <FileText size={16} className="text-violet-400" />
                  <span>Resume & AI Optimization Console</span>
                </h3>

                <form onSubmit={handleResumeUpload} className="p-6 rounded-2xl border border-dashed border-white/10 bg-slate-900/40 text-center space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto">
                    <Upload size={22} className="animate-bounce" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Upload CV (PDF format only)</span>
                    <span className="text-[10px] text-slate-550 block mt-1 font-semibold">Max file limit: 5MB</span>
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setResumeFile(e.target.files[0])}
                    className="mx-auto block text-xxs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xxs file:font-extrabold file:bg-white/5 file:text-slate-300 file:hover:bg-white/10 file:cursor-pointer"
                  />
                  {resumeFile && (
                    <button
                      type="submit"
                      disabled={uploadingResume}
                      className="px-6 py-2.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-xl text-xs font-extrabold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 cursor-pointer uppercase tracking-wider"
                    >
                      {uploadingResume ? 'Uploading...' : 'Confirm Upload'}
                    </button>
                  )}
                </form>

                <div className="space-y-5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-550 border-b border-white/5 pb-2">Active Resumes</h4>
                  
                  {profile.resumes?.length === 0 ? (
                    <p className="text-slate-500 text-xs py-4">No CV files uploaded yet.</p>
                  ) : (
                    profile.resumes?.map((res) => (
                      <div key={res.id} className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-white/10">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shrink-0">
                              <FileText size={18} />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-extrabold text-white truncate block max-w-[200px]">{res.filename}</span>
                              <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">Uploaded {new Date(res.uploaded_at).toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => handleGenerateAiAnalysis(res.id)}
                              disabled={analyzingResume}
                              className="px-4 py-2 border border-violet-500/20 hover:border-violet-500/40 bg-violet-600/10 hover:bg-violet-600/25 text-violet-400 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                            >
                              {analyzingResume ? 'Analyzing...' : 'AI Review'}
                            </button>
                            <button
                              onClick={() => handleDeleteResume(res.id)}
                              className="p-2 hover:bg-rose-955/20 border border-white/10 hover:border-rose-500/30 text-slate-550 hover:text-rose-500 rounded-xl transition-all cursor-pointer"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* AI resume Analysis report cache */}
                        {aiAnalysis && (
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 space-y-4 text-left animate-fade-in font-semibold">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-650 to-fuchsia-650 flex items-center justify-center font-black text-white text-xs shadow-md">
                                {aiAnalysis.score}%
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white">AI Optimization Index</span>
                                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">ATS score evaluation</span>
                              </div>
                            </div>

                            {/* Improvements */}
                            {aiAnalysis.improvements && aiAnalysis.improvements.length > 0 && (
                              <div className="space-y-2 pt-2 border-t border-white/5">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ATS Checklist suggestions</h5>
                                <ul className="space-y-1.5 text-xxs text-slate-350 list-disc list-inside leading-relaxed">
                                  {aiAnalysis.improvements.map((item, i) => (
                                    <li key={i} className="leading-relaxed">{item}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </PageTransition>
  );
}
