import React, { useState } from 'react';
import { Mail, Loader2, Sparkles, Key } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const response = await api.post('/auth/forgot-password/', { email });
      setMessage(response.data.message || 'Password reset link sent to your email.');
      if (response.data.reset_token_dev) {
        setDevToken(response.data.reset_token_dev);
      }
    } catch (err) {
      setError(err.response?.data?.email?.[0] || err.response?.data?.error || 'Failed to send password reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] relative flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Glow Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[90px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-slate-900/45 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/20 mb-4">
            <Key size={20} className="text-white animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Reset Password</h2>
          <p className="text-slate-400 mt-2 text-xs">Enter your email and we'll send you a password reset link</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-5 p-3.5 rounded-xl bg-green-950/30 border border-green-900/40 text-green-400 text-xs font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder-slate-650"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/10 hover:scale-[1.01] active:scale-95 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Sending link...
              </>
            ) : 'Send Reset Link'}
          </button>
        </form>

        {devToken && (
          <div className="mt-6 p-4 bg-slate-950/80 border border-violet-900/20 rounded-2xl text-left">
            <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles size={12} /> Developer Log / Quick Reset:
            </p>
            <Link
              to={`/reset-password?token=${devToken}`}
              className="text-xxs text-fuchsia-400 hover:text-fuchsia-350 hover:underline break-all block"
            >
              Click here to reset password instantly (Dev Mode)
            </Link>
          </div>
        )}

        <div className="mt-8 text-center text-xs">
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold transition-colors">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
