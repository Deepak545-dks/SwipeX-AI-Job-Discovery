import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Loader2, KeyRound, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../utils/api';
import { motion } from 'framer-motion';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid or missing token.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    try {
      await api.post('/auth/reset-password/', { token, password });
      setMessage('Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
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
              <KeyRound size={20} className="text-white animate-pulse" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Create New Password</h2>
            <p className="text-slate-400 mt-2 text-xs font-semibold">Enter your new secure password credential</p>
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

          {!token ? (
            <div className="text-center py-4 space-y-4">
              <p className="text-rose-400 text-xs leading-relaxed font-semibold">No token provided in the URL. Please click the link from your email.</p>
              <Link to="/login" className="mt-4 inline-block text-violet-400 hover:text-violet-300 text-xs font-extrabold hover:underline transition-colors">
                Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-2">New Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                    placeholder="Min. 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-2">Confirm New Password</label>
                <div className="relative group">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                    placeholder="Confirm password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
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
                    <span>Resetting password...</span>
                  </span>
                ) : 'Reset Password'}
              </button>
            </form>
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
