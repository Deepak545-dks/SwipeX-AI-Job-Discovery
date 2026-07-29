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
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 overflow-hidden bg-[#090e1a] text-white">
      
      {/* Background spotlights: Purple + Pink Theme for Auth */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-605/15 via-pink-500/10 to-transparent rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-gradient-to-br from-pink-500/15 via-violet-650/10 to-transparent rounded-full blur-[130px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500/35 via-fuchsia-500/30 to-cyan-500/35 shadow-2xl"
      >
        <div className="w-full bg-[#0d1325]/90 rounded-[28px] p-8 sm:p-10 border border-white/5 shadow-lg text-white flex flex-col justify-between text-left">
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg mb-4">
              <Key size={20} className="text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Reset Password</h2>
            <p className="text-slate-400 mt-2 text-xs font-semibold">Enter your email to receive a password reset link</p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-bold flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="mb-5 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-pulse">
              <CheckCircle size={16} className="shrink-0" />
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest cursor-pointer mt-4 border border-violet-555"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Sending Link...</span>
                </span>
              ) : 'Send Reset Link'}
            </button>
          </form>

          {devToken && (
            <div className="mt-6 p-4 bg-slate-900 border border-violet-900/20 rounded-2xl text-left">
              <p className="text-[10px] text-violet-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> Dev Token Link:
              </p>
              <Link
                to={`/reset-password?token=${devToken}`}
                className="text-xxs text-fuchsia-400 hover:text-fuchsia-350 hover:underline break-all block font-semibold"
              >
                Click here to reset instantly (Dev Link) &rarr;
              </Link>
            </div>
          )}

          <div className="mt-8 text-center text-xs">
            <Link to="/login" className="text-violet-405 hover:text-violet-300 font-extrabold transition-colors hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
