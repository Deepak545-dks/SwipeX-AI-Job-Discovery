import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, Briefcase, GraduationCap, Code, FileText, Folder,
  Plus, Trash2, Globe, Phone, Pencil, X, Sparkles, AlertCircle,
  Mail, Calendar, MapPin, Loader2, Save, Upload, CheckCircle 
} from 'lucide-react';
import api from '../utils/api';
import { updateUser } from '../store/slices/authSlice';
import { useToast } from '../context/ToastContext';
import PageTransition from '../components/PageTransition';

export default function ProfileDashboard() {
  const [activeTab, setActiveTab] = useState('personal');
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
    } catch (err) {
      setError('Failed to fetch profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSavePersonal = async (e) => {
    e.preventDefault();
    if (phone && !/^\+?[0-9\s-]{7,15}$/.test(phone)) {
      showToast('Please enter a valid phone number (7-15 digits)', 'warning');
      return;
    }
    if (portfolioUrl && !validateUrl(portfolioUrl)) {
      showToast('Portfolio link must be a valid URL (starting with http/https)', 'warning');
      return;
    }
    if (githubUrl && !validateUrl(githubUrl)) {
      showToast('GitHub link must be a valid URL (starting with http/https)', 'warning');
      return;
    }
    if (linkedinUrl && !validateUrl(linkedinUrl)) {
      showToast('LinkedIn link must be a valid URL (starting with http/https)', 'warning');
      return;
    }

    setSaving(true);
    setError('');
    setMessage('');
    try {
      const response = await api.put('/profiles/me/', {
        full_name: fullName,
        phone,
        bio,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl
      });
      setProfile(response.data);
      showToast('Profile updated successfully.', 'success');
      dispatch(updateUser({ full_name: fullName }));
    } catch (err) {
      showToast('Failed to update profile details.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingAvatar(true);
    setError('');
    setMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/profiles/me/avatar/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setProfile(response.data);
      showToast('Avatar updated successfully.', 'success');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to upload avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    const newSkill = skillInput.trim();
    if (!newSkill || skills.includes(newSkill)) return;

    const updatedSkills = [...skills, newSkill];
    try {
      const response = await api.put('/profiles/me/', { skills: updatedSkills });
      setSkills(response.data.skills);
      setProfile(response.data);
      setSkillInput('');
    } catch (err) {
      setError('Failed to update skills.');
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    const updatedSkills = skills.filter(s => s !== skillToRemove);
    try {
      const response = await api.put('/profiles/me/', { skills: updatedSkills });
      setSkills(response.data.skills);
      setProfile(response.data);
    } catch (err) {
      setError('Failed to remove skill.');
    }
  };

  // Experience handlers
  const handleSaveExperience = async (e) => {
    e.preventDefault();
    if (!expCompany || !expTitle || !expStartDate) return;

    if (!expIsCurrent && expEndDate && new Date(expStartDate) > new Date(expEndDate)) {
      showToast('Start Date must be before End Date', 'warning');
      return;
    }

    const payload = {
      company: expCompany,
      title: expTitle,
      location: expLocation,
      start_date: expStartDate,
      end_date: expIsCurrent ? null : expEndDate,
      is_current: expIsCurrent,
      description: expDescription
    };

    try {
      if (editingExpId) {
        await api.put(`/profiles/me/experience/${editingExpId}/`, payload);
        showToast('Experience entry updated successfully.', 'success');
      } else {
        await api.post('/profiles/me/experience/', payload);
        showToast('Experience entry added successfully.', 'success');
      }
      resetExperienceForm();
      fetchProfile();
    } catch (err) {
      showToast('Failed to save experience entry.', 'error');
    }
  };

  const startEditExperience = (exp) => {
    setEditingExpId(exp.id);
    setExpCompany(exp.company || '');
    setExpTitle(exp.title || '');
    setExpLocation(exp.location || '');
    setExpStartDate(exp.start_date || '');
    setExpEndDate(exp.end_date || '');
    setExpIsCurrent(exp.is_current || false);
    setExpDescription(exp.description || '');
  };

  const resetExperienceForm = () => {
    setEditingExpId(null);
    setExpCompany('');
    setExpTitle('');
    setExpLocation('');
    setExpStartDate('');
    setExpEndDate('');
    setExpIsCurrent(false);
    setExpDescription('');
  };

  const handleDeleteExperience = async (id) => {
    try {
      await api.delete(`/profiles/me/experience/${id}/`);
      fetchProfile();
    } catch (err) {
      setError('Failed to delete experience.');
    }
  };

  // Education handlers
  const handleSaveEducation = async (e) => {
    e.preventDefault();
    if (!eduInstitution || !eduDegree || !eduStartDate) return;

    if (!eduIsCurrent && eduEndDate && new Date(eduStartDate) > new Date(eduEndDate)) {
      showToast('Start Date must be before End Date', 'warning');
      return;
    }

    const payload = {
      institution: eduInstitution,
      degree: eduDegree,
      field_of_study: eduField,
      start_date: eduStartDate,
      end_date: eduIsCurrent ? null : eduEndDate,
      is_current: eduIsCurrent,
      description: eduDescription
    };

    try {
      if (editingEduId) {
        await api.put(`/profiles/me/education/${editingEduId}/`, payload);
        showToast('Education entry updated successfully.', 'success');
      } else {
        await api.post('/profiles/me/education/', payload);
        showToast('Education entry added successfully.', 'success');
      }
      resetEducationForm();
      fetchProfile();
    } catch (err) {
      showToast('Failed to save education entry.', 'error');
    }
  };

  const startEditEducation = (edu) => {
    setEditingEduId(edu.id);
    setEduInstitution(edu.institution || '');
    setEduDegree(edu.degree || '');
    setEduField(edu.field_of_study || '');
    setEduStartDate(edu.start_date || '');
    setEduEndDate(edu.end_date || '');
    setEduIsCurrent(edu.is_current || false);
    setEduDescription(edu.description || '');
  };

  const resetEducationForm = () => {
    setEditingEduId(null);
    setEduInstitution('');
    setEduDegree('');
    setEduField('');
    setEduStartDate('');
    setEduEndDate('');
    setEduIsCurrent(false);
    setEduDescription('');
  };

  const handleDeleteEducation = async (id) => {
    try {
      await api.delete(`/profiles/me/education/${id}/`);
      fetchProfile();
    } catch (err) {
      setError('Failed to delete education.');
    }
  };

  // Project handlers
  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!projName || !projStartDate) return;

    if (!projIsCurrent && projEndDate && new Date(projStartDate) > new Date(projEndDate)) {
      showToast('Start Date must be before End Date', 'warning');
      return;
    }
    if (projUrl && !validateUrl(projUrl)) {
      showToast('Project link must be a valid URL (starting with http/https)', 'warning');
      return;
    }

    const payload = {
      name: projName,
      description: projDescription,
      start_date: projStartDate,
      end_date: projIsCurrent ? null : projEndDate,
      is_current: projIsCurrent,
      project_url: projUrl
    };

    try {
      if (editingProjId) {
        await api.put(`/profiles/me/project/${editingProjId}/`, payload);
        showToast('Project entry updated successfully.', 'success');
      } else {
        await api.post('/profiles/me/project/', payload);
        showToast('Project entry added successfully.', 'success');
      }
      resetProjectForm();
      fetchProfile();
    } catch (err) {
      showToast('Failed to save project entry.', 'error');
    }
  };

  const startEditProject = (proj) => {
    setEditingProjId(proj.id);
    setProjName(proj.name || '');
    setProjDescription(proj.description || '');
    setProjStartDate(proj.start_date || '');
    setProjEndDate(proj.end_date || '');
    setProjIsCurrent(proj.is_current || false);
    setProjUrl(proj.project_url || '');
  };

  const resetProjectForm = () => {
    setEditingProjId(null);
    setProjName('');
    setProjDescription('');
    setProjStartDate('');
    setProjEndDate('');
    setProjIsCurrent(false);
    setProjUrl('');
  };

  const handleDeleteProject = async (id) => {
    try {
      await api.delete(`/profiles/me/project/${id}/`);
      fetchProfile();
    } catch (err) {
      setError('Failed to delete project.');
    }
  };

  // Resume handlers
  const handleResumeUpload = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    if (resumeFile.size > 5 * 1024 * 1024) {
      showToast('File size exceeds the 5MB limit. Please upload a smaller document.', 'error');
      return;
    }

    setUploadingResume(true);
    setError('');
    const formData = new FormData();
    formData.append('file', resumeFile);

    try {
      await api.post('/profiles/me/resume/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeFile(null);
      document.getElementById('resume-file-input').value = null;
      showToast('Resume uploaded successfully.', 'success');
      fetchProfile();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAnalyzeResume = async () => {
    setAnalyzingResume(true);
    try {
      const response = await api.post('/profiles/ai/analyze-resume/');
      setAiAnalysis(response.data);
      showToast('AI Resume Analysis completed successfully.', 'success');
    } catch (err) {
      showToast('Failed to analyze resume.', 'error');
    } finally {
      setAnalyzingResume(false);
    }
  };

  if (loading) {
    return (
      <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full animate-shimmer" />
            <div className="h-6 rounded w-3/4 animate-shimmer" />
            <div className="h-4 rounded w-1/2 animate-shimmer" />
          </div>
          <div className="bg-slate-900/40 border border-slate-850 p-3 rounded-2xl space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded-xl animate-shimmer" />
            ))}
          </div>
        </div>
        <div className="lg:col-span-3 bg-slate-900/40 border border-slate-850 p-8 rounded-2xl space-y-6">
          <div className="h-7 rounded w-1/3 animate-shimmer" />
          <div className="space-y-4">
            <div className="h-10 rounded-xl animate-shimmer" />
            <div className="h-10 rounded-xl animate-shimmer" />
            <div className="h-24 rounded-xl animate-shimmer" />
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-4 gap-8">
      {/* Side Profile Card & Tab Selectors */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl text-center relative group">
          
          {/* Circular avatar with click upload trigger */}
          <div className="relative w-24 h-24 mx-auto group">
            {profile.profile_picture ? (
              <img 
                src={profile.profile_picture} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover mx-auto border border-slate-700/60 shadow-lg shadow-violet-500/5" 
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-3xl font-black text-white mx-auto shadow-lg shadow-violet-500/20">
                {fullName ? fullName.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
            )}
            
            <label className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity">
              {uploadingAvatar ? (
                <Loader2 size={18} className="animate-spin text-white" />
              ) : (
                <>
                  <Upload size={18} className="text-white" />
                  <span className="text-[9px] text-slate-300 font-bold uppercase mt-1">Upload</span>
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

          <h2 className="text-xl font-bold text-white mt-4">{fullName || 'Add your name'}</h2>
          <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">{profile.role.replace('_', ' ')}</p>
          <p className="text-slate-500 text-xs mt-2 break-all">{profile.email}</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 backdrop-blur-xl shadow-xl flex flex-col space-y-2">
          {[
            { id: 'personal', label: 'Personal Info', icon: User },
            { id: 'skills', label: 'Skills', icon: Code },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'projects', label: 'Projects', icon: Folder },
            { id: 'resume', label: 'Resumes', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setMessage(''); }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="lg:col-span-3">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-xl bg-green-950/40 border border-green-900/40 text-green-400 text-sm flex items-center space-x-2">
            <CheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 backdrop-blur-md shadow-xl min-h-[50vh]">
          {/* TAB 1: Personal Info */}
          {activeTab === 'personal' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Personal Details</h3>
              <form onSubmit={handleSavePersonal} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                      placeholder="+1 (234) 567-890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Professional Summary</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors resize-none"
                    placeholder="Brief bio describing your field of expertise..."
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Portfolio URL</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                      placeholder="https://myportfolio.com"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">GitHub profile</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                      placeholder="https://github.com/myusername"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">LinkedIn profile</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setlinkedinUrl(e.target.value)}
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                      placeholder="https://linkedin.com/in/myusername"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold text-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/10"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Saving changes...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Details
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: Skills */}
          {activeTab === 'skills' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Skills Set</h3>
              
              <form onSubmit={handleAddSkill} className="flex gap-4 mb-8">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  className="flex-grow bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none transition-colors"
                  placeholder="e.g. Kubernetes, React, Python..."
                />
                <button
                  type="submit"
                  className="flex items-center justify-center px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-semibold text-sm transition-all"
                >
                  <Plus size={16} className="mr-1" />
                  Add
                </button>
              </form>

              {skills.length === 0 ? (
                <p className="text-slate-500 text-sm">No skills added yet. Type a skill above to begin building your stack.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      <span>{skill}</span>
                      <button
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Experience */}
          {activeTab === 'experience' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  {editingExpId ? 'Edit Experience' : 'Add Experience'}
                </h3>
                <form onSubmit={handleSaveExperience} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Job Title"
                      required
                      value={expTitle}
                      onChange={(e) => setExpTitle(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Company"
                      required
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Location (e.g. San Francisco, CA)"
                      value={expLocation}
                      onChange={(e) => setExpLocation(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={expStartDate}
                        onChange={(e) => setExpStartDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">End Date</label>
                      <input
                        type="date"
                        value={expEndDate}
                        disabled={expIsCurrent}
                        onChange={(e) => setExpEndDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="expCurrent"
                      checked={expIsCurrent}
                      onChange={(e) => setExpIsCurrent(e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <label htmlFor="expCurrent" className="text-slate-300 text-sm cursor-pointer">I currently work here</label>
                  </div>

                  <textarea
                    placeholder="Describe your achievements and key tasks..."
                    value={expDescription}
                    onChange={(e) => setExpDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  />

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-semibold text-sm transition-all"
                    >
                      {editingExpId ? 'Update Entry' : 'Add Experience'}
                    </button>
                    {editingExpId && (
                      <button
                        type="button"
                        onClick={resetExperienceForm}
                        className="px-6 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Work History Timeline</h3>
                {profile.experiences.length === 0 ? (
                  <p className="text-slate-500 text-sm">No work experience entries recorded yet.</p>
                ) : (
                  <div className="relative border-l border-slate-800 ml-4 space-y-8">
                    {profile.experiences.map((exp) => (
                      <div key={exp.id} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-violet-600 border border-slate-950" />
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white">{exp.title}</h4>
                            <p className="text-slate-300 text-sm font-semibold">{exp.company} {exp.location && <span className="text-slate-500 font-normal">| {exp.location}</span>}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {exp.start_date} &ndash; {exp.is_current ? 'Present' : exp.end_date}
                            </p>
                            {exp.description && <p className="text-slate-400 text-xs mt-2 leading-relaxed whitespace-pre-line">{exp.description}</p>}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditExperience(exp)}
                              className="text-slate-500 hover:text-violet-400 p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-all"
                              title="Edit Entry"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteExperience(exp.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-all"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: Education */}
          {activeTab === 'education' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  {editingEduId ? 'Edit Education' : 'Add Education'}
                </h3>
                <form onSubmit={handleSaveEducation} className="space-y-4">
                  <div className="grid sm:grid-cols-3 gap-4">
                    <input
                      type="text"
                      placeholder="Degree (e.g. Bachelor of Science)"
                      required
                      value={eduDegree}
                      onChange={(e) => setEduDegree(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study (e.g. Physics)"
                      required
                      value={eduField}
                      onChange={(e) => setEduField(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Institution"
                      required
                      value={eduInstitution}
                      onChange={(e) => setEduInstitution(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={eduStartDate}
                        onChange={(e) => setEduStartDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">End Date</label>
                      <input
                        type="date"
                        value={eduEndDate}
                        disabled={eduIsCurrent}
                        onChange={(e) => setEduEndDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="eduCurrent"
                      checked={eduIsCurrent}
                      onChange={(e) => setEduIsCurrent(e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <label htmlFor="eduCurrent" className="text-slate-300 text-sm cursor-pointer">I am currently studying here</label>
                  </div>

                  <textarea
                    placeholder="Additional context or honors details..."
                    value={eduDescription}
                    onChange={(e) => setEduDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  />

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-semibold text-sm transition-all"
                    >
                      {editingEduId ? 'Update Entry' : 'Add Education'}
                    </button>
                    {editingEduId && (
                      <button
                        type="button"
                        onClick={resetEducationForm}
                        className="px-6 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Education Timeline</h3>
                {profile.education.length === 0 ? (
                  <p className="text-slate-500 text-sm">No education entries recorded yet.</p>
                ) : (
                  <div className="relative border-l border-slate-800 ml-4 space-y-8">
                    {profile.education.map((edu) => (
                      <div key={edu.id} className="relative pl-6">
                        <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-fuchsia-600 border border-slate-950" />
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-base font-bold text-white">{edu.degree} &ndash; {edu.field_of_study}</h4>
                            <p className="text-slate-300 text-sm font-semibold">{edu.institution}</p>
                            <p className="text-slate-500 text-xs mt-1">
                              {edu.start_date} &ndash; {edu.is_current ? 'Present' : edu.end_date}
                            </p>
                            {edu.description && <p className="text-slate-400 text-xs mt-2 leading-relaxed whitespace-pre-line">{edu.description}</p>}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => startEditEducation(edu)}
                              className="text-slate-500 hover:text-violet-400 p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-all"
                              title="Edit Entry"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEducation(edu.id)}
                              className="text-slate-500 hover:text-red-400 p-1.5 rounded-lg border border-transparent hover:border-slate-800 transition-all"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: Projects */}
          {activeTab === 'projects' && (
            <div className="space-y-10">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">
                  {editingProjId ? 'Edit Project' : 'Add Project'}
                </h3>
                <form onSubmit={handleSaveProject} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Project Name"
                      required
                      value={projName}
                      onChange={(e) => setProjName(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                    <input
                      type="url"
                      placeholder="Project Link (e.g. GitHub Repository)"
                      value={projUrl}
                      onChange={(e) => setProjUrl(e.target.value)}
                      className="bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">Start Date</label>
                      <input
                        type="date"
                        required
                        value={projStartDate}
                        onChange={(e) => setProjStartDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 text-xxs uppercase font-semibold mb-1">End Date</label>
                      <input
                        type="date"
                        value={projEndDate}
                        disabled={projIsCurrent}
                        onChange={(e) => setProjEndDate(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none disabled:opacity-30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="projCurrent"
                      checked={projIsCurrent}
                      onChange={(e) => setProjIsCurrent(e.target.checked)}
                      className="accent-violet-600 rounded"
                    />
                    <label htmlFor="projCurrent" className="text-slate-300 text-sm cursor-pointer">I am currently working on this</label>
                  </div>

                  <textarea
                    placeholder="Describe project context, tech stack, and achievements..."
                    value={projDescription}
                    onChange={(e) => setProjDescription(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 px-4 text-white text-sm outline-none resize-none"
                  />

                  <div className="flex items-center space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-violet-600 hover:bg-violet-500 rounded-lg text-white font-semibold text-sm transition-all"
                    >
                      {editingProjId ? 'Update Project' : 'Add Project'}
                    </button>
                    {editingProjId && (
                      <button
                        type="button"
                        onClick={resetProjectForm}
                        className="px-6 py-2.5 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 text-sm font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Projects Showcase</h3>
                {profile.projects && profile.projects.length === 0 ? (
                  <p className="text-slate-500 text-sm">No project entries listed yet.</p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {profile.projects && profile.projects.map((proj) => (
                      <div key={proj.id} className="p-5 rounded-xl border border-slate-800 bg-slate-950/30 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white">{proj.name}</h4>
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => startEditProject(proj)}
                                className="text-slate-500 hover:text-violet-400 p-1 rounded transition-colors"
                              >
                                <Pencil size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteProject(proj.id)}
                                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-slate-500 text-[10px]">
                            {proj.start_date} &ndash; {proj.is_current ? 'Active' : proj.end_date}
                          </p>
                          {proj.description && (
                            <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-line line-clamp-3">
                              {proj.description}
                            </p>
                          )}
                        </div>

                        {proj.project_url && (
                          <a
                            href={proj.project_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center space-x-1.5 text-xxs font-bold text-violet-400 hover:text-violet-300 transition-colors pt-2 border-t border-slate-850/50"
                          >
                            <Globe size={10} />
                            <span>View Repository</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: Resume versioning */}
          {activeTab === 'resume' && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-6">Resume Versioning</h3>
              
              <form onSubmit={handleResumeUpload} className="p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/20 text-center mb-8 space-y-4">
                <FileText className="mx-auto text-slate-500" size={36} />
                <div>
                  <p className="text-sm font-semibold text-white">Upload new CV version</p>
                  <p className="text-xxs text-slate-500 mt-1">Supported formats: PDF, DOC, DOCX up to 5MB.</p>
                </div>
                
                <input
                  type="file"
                  id="resume-file-input"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                />
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <button
                    type="button"
                    onClick={() => document.getElementById('resume-file-input').click()}
                    className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-lg text-slate-300 text-xs font-semibold"
                  >
                    Select File
                  </button>
                  
                  {resumeFile && (
                    <span className="text-xs text-violet-400 font-semibold max-w-xs truncate">
                      {resumeFile.name}
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={!resumeFile || uploadingResume}
                    className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold text-xs disabled:opacity-30 disabled:cursor-not-allowed shadow-md shadow-violet-500/10"
                  >
                    {uploadingResume ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Upload size={14} className="mr-1.5" />
                        <span>Upload Version</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              <h4 className="text-lg font-bold text-white mb-4">Version History</h4>
              {profile.resumes.length === 0 ? (
                <p className="text-slate-500 text-sm">No resume files uploaded yet.</p>
              ) : (
                <div className="divide-y divide-slate-800/60">
                  {profile.resumes.map((res) => (
                    <div key={res.id} className="py-4 flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-center text-slate-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">Version {res.version}</p>
                          <p className="text-xxs text-slate-500 mt-0.5">Uploaded at {new Date(res.uploaded_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <a
                        href={res.file}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-semibold"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Resume Analyzer Section */}
              <div className="mt-8 pt-8 border-t border-slate-850/80 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-black text-white flex items-center gap-2">
                      <Sparkles size={20} className="text-violet-400" />
                      <span>AI Resume & Profile Analyzer</span>
                    </h4>
                    <p className="text-slate-400 text-xs mt-1">Get instant AI feedback on strengths, missing technical skills, and ATS optimization advice</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAnalyzeResume}
                    disabled={analyzingResume}
                    className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-violet-500/10 active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500 disabled:opacity-50 shrink-0 flex items-center justify-center space-x-2"
                  >
                    {analyzingResume ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Analyzing with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        <span>{aiAnalysis ? 'Re-Analyze Resume' : 'Analyze Resume with AI'}</span>
                      </>
                    )}
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="p-6 rounded-2xl bg-slate-950/70 border border-violet-500/20 space-y-6 backdrop-blur-xl shadow-xl animate-fade-in">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Overall ATS Score</span>
                      <span className="px-3 py-1 rounded-full bg-violet-600 text-white font-black text-sm shadow-md">
                        {aiAnalysis.overall_score} / 100
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Strengths */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle size={14} /> Strengths
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {aiAnalysis.strengths.map((item, i) => (
                            <li key={i} className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Weaknesses */}
                      <div className="space-y-3">
                        <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertCircle size={14} /> Areas for Improvement
                        </h5>
                        <ul className="space-y-2 text-xs text-slate-300">
                          {aiAnalysis.weaknesses.map((item, i) => (
                            <li key={i} className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-900/30 leading-relaxed">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Missing technical skills */}
                    {aiAnalysis.missing_skills && aiAnalysis.missing_skills.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recommended Technical Skills to Add</h5>
                        <div className="flex flex-wrap gap-2">
                          {aiAnalysis.missing_skills.map((skill) => (
                            <span key={skill} className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-violet-300 text-xs font-semibold">
                              + {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {aiAnalysis.improvements && aiAnalysis.improvements.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-850/60">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actionable Improvement Suggestions</h5>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                          {aiAnalysis.improvements.map((item, i) => (
                            <li key={i} className="leading-relaxed">{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
