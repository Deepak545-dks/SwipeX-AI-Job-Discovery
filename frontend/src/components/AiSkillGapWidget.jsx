import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle, AlertTriangle, Lightbulb, Loader2, RefreshCw } from 'lucide-react';
import api from '../utils/api';

export default function AiSkillGapWidget({ jobId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  const fetchSkillGap = async () => {
    if (!jobId) return;
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/jobs/ai/skill-gap-analysis/', { job_id: jobId });
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze skill gap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGap();
  }, [jobId]);

  if (loading) {
    return (
      <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3 backdrop-blur-md">
        <div className="flex items-center space-x-2">
          <Sparkles size={16} className="text-violet-400 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Analyzing Skill Fit...</span>
        </div>
        <div className="h-3 rounded-full bg-slate-850 w-full animate-shimmer" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-20 rounded-lg animate-shimmer" />
          <div className="h-6 w-24 rounded-lg animate-shimmer" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-850 flex items-center justify-between text-xs text-slate-400">
        <span>AI skill gap analysis unavailable.</span>
        <button onClick={fetchSkillGap} className="text-violet-400 hover:underline flex items-center gap-1 font-bold">
          <RefreshCw size={12} /> Retry
        </button>
      </div>
    );
  }

  const getMatchBadgeColor = (pct) => {
    if (pct >= 75) return 'text-emerald-400 bg-emerald-950/50 border-emerald-800';
    if (pct >= 50) return 'text-amber-400 bg-amber-950/50 border-amber-850';
    return 'text-violet-400 bg-violet-950/50 border-violet-850';
  };

  const getProgressBarColor = (pct) => {
    if (pct >= 75) return 'bg-emerald-500';
    if (pct >= 50) return 'bg-amber-500';
    return 'bg-violet-500';
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-950/70 border border-violet-500/20 space-y-4 backdrop-blur-xl shadow-xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Sparkles size={18} className="text-violet-400" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-white">AI Skill Gap Analysis</h4>
        </div>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${getMatchBadgeColor(data.match_percentage)}`}>
          {data.match_percentage}% Match Rate
        </span>
      </div>

      {/* Match Percentage Bar */}
      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
        <div 
          className={`h-full rounded-full transition-all duration-700 ${getProgressBarColor(data.match_percentage)}`}
          style={{ width: `${data.match_percentage}%` }}
        />
      </div>

      {/* Skills breakdown */}
      <div className="space-y-3 pt-1">
        {data.matching_skills && data.matching_skills.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Matching Required Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {data.matching_skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-medium flex items-center space-x-1">
                  <CheckCircle size={12} className="text-emerald-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {data.missing_skills && data.missing_skills.length > 0 && (
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">Key Missing Tech Skills</span>
            <div className="flex flex-wrap gap-1.5">
              {data.missing_skills.map((skill) => (
                <span key={skill} className="px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-900/60 text-amber-300 text-xs font-medium flex items-center space-x-1">
                  <AlertTriangle size={12} className="text-amber-400" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {data.suggestions && data.suggestions.length > 0 && (
          <div className="pt-2 border-t border-slate-850/60 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Lightbulb size={12} className="text-amber-400" /> Actionable AI Suggestion
            </span>
            <p className="text-slate-300 text-xs leading-relaxed italic">
              "{data.suggestions[0]}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
