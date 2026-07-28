import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const validateForm = () => {
    if (!email) {
      setValidationError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    if (!password) {
      setValidationError('Password is required');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/login/', { email, password });
      dispatch(setCredentials(response.data));
      
      const role = response.data.user.role;
      if (role === 'recruiter') {
        navigate('/recruiter');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/swipe');
      }
    } catch (err) {
      dispatch(setError(err.response?.data?.detail || 'Invalid email or password'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleOAuthMock = async (provider) => {
    dispatch(setLoading(true));
    try {
      const response = await api.post('/auth/oauth/', {
        provider,
        token: 'mock-oauth-token-123456',
        email: `${provider}-user@example.com`,
        role: 'job_seeker'
      });
      dispatch(setCredentials(response.data));
      navigate('/swipe');
    } catch (err) {
      dispatch(setError('Social authentication failed.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-20 overflow-hidden">
      {/* Background Blur Spotlights */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-600/15 to-indigo-600/15 rounded-full blur-[100px] -z-10" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-cyan-500 shadow-2xl shadow-violet-950/20"
      >
        {/* Inner Content Glass Pane */}
        <div className="w-full bg-slate-950/90 backdrop-blur-2xl rounded-[23px] p-8 sm:p-10 flex flex-col">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg shadow-violet-500/25 mb-4 hover:rotate-12 transition-transform duration-300">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">Welcome Back</h2>
            <p className="text-slate-400 mt-2 text-xs font-semibold">Ready to find your match? Log in below.</p>
          </div>

          {/* Feedback banners */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {validationError && (
            <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center space-x-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-slate-400 text-[10px] font-extrabold uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (validationError) setValidationError(''); }}
                  className="w-full bg-slate-900/60 border border-white/15 focus:border-violet-500 focus:bg-slate-900/90 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-500 font-semibold"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 text-[10px] font-extrabold tracking-wide transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (validationError) setValidationError(''); }}
                  className="w-full bg-slate-900/60 border border-white/15 focus:border-violet-500 focus:bg-slate-900/90 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-500 font-semibold"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 rounded-2xl text-white font-extrabold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-600/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-extrabold uppercase tracking-widest">
              <span className="bg-slate-950 px-4 text-slate-500">Or credentials with</span>
            </div>
          </div>

          {/* Social Sign-In buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleOAuthMock('google')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
            >
              <span>Google</span>
            </button>
            <button
              onClick={() => handleOAuthMock('github')}
              disabled={loading}
              className="flex items-center justify-center space-x-2 py-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-slate-300 hover:text-white transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
            >
              <span>GitHub</span>
            </button>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400 font-medium">
            New to SwipeX?{' '}
            <Link to="/register" className="text-violet-400 hover:text-violet-300 font-extrabold hover:underline transition-all">
              Create an account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
