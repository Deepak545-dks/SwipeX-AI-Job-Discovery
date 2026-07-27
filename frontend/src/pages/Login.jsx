import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
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
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Glow Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-slate-900/45 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/20 mb-4">
            <Sparkles size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-xs">Sign in to find your dream job or ideal candidate</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-medium animate-shake">
            {error}
          </div>
        )}

        {validationError && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-400 text-xs font-medium animate-shake">
            {validationError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (validationError) setValidationError(''); }}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 pl-10 pr-4 text-white text-xs outline-none transition-all placeholder-slate-650"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-350 text-[10px] font-bold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 text-[10px] font-bold tracking-wide">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (validationError) setValidationError(''); }}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 pl-10 pr-10 text-white text-xs outline-none transition-all placeholder-slate-650"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
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
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-wider">
            <span className="bg-slate-900/65 px-3 text-slate-500">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleOAuthMock('google')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-350 hover:text-white transition-all text-xs font-bold active:scale-95 cursor-pointer"
          >
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthMock('github')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 py-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 text-slate-350 hover:text-white transition-all text-xs font-bold active:scale-95 cursor-pointer"
          >
            <span>GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          New to SwipeX?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-bold">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
