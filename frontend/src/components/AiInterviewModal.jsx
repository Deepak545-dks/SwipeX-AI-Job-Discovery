import React, { useEffect, useState } from 'react';
import { Sparkles, HelpCircle, X, ChevronDown, ChevronUp, Lightbulb, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function AiInterviewModal({ jobId, jobTitle, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/jobs/ai/generate-interview-questions/', { job_id: jobId });
      setQuestions(response.data.questions || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate AI interview questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [jobId]);

  const toggleTip = (id) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 z-50 max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl">
        <div className="flex justify-between items-start gap-4 pb-4 border-b border-slate-850">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">AI Interview Questions Prep</h3>
              <p className="text-slate-400 text-xs mt-0.5">Customized technical & behavioral questions for <span className="text-violet-400 font-semibold">{jobTitle}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white shrink-0 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <Loader2 size={36} className="mx-auto animate-spin text-violet-500" />
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Generating Tailored Questions...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/40 text-red-400 text-xs text-center space-y-2">
            <p>{error}</p>
            <button onClick={fetchQuestions} className="underline font-bold">Try Again</button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} className="p-5 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3 transition-colors hover:border-slate-800">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-violet-950/50 border border-violet-850 text-violet-400 text-xxs font-extrabold uppercase tracking-wider">
                      {q.category}
                    </span>
                    <span className="text-slate-600 text-xxs font-bold">Q{q.id}</span>
                  </div>

                  <p className="text-white text-sm font-semibold leading-relaxed">
                    {q.question}
                  </p>

                  <button
                    onClick={() => toggleTip(q.id)}
                    className="flex items-center space-x-1.5 text-xs text-violet-400 hover:text-violet-300 font-bold focus-visible:ring-2 focus-visible:ring-violet-500 rounded"
                  >
                    <Lightbulb size={14} />
                    <span>{isExpanded ? 'Hide AI Tips' : 'View AI Answer Tips'}</span>
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  {isExpanded && (
                    <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 text-xs leading-relaxed space-y-1 animate-fade-in">
                      <span className="text-xxs font-bold uppercase tracking-wider text-slate-400 block">Suggested Strategy</span>
                      <p>{q.suggested_answer_tips}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="pt-4 border-t border-slate-850 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-850 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all active:scale-95 focus-visible:ring-2 focus-visible:ring-violet-500"
          >
            Close Interview Practice
          </button>
        </div>
      </div>
    </div>
  );
}
