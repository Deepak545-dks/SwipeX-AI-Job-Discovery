import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles, AlertCircle, Sparkle, Heart } from 'lucide-react';
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
    <div className="min-h-screen grid lg:grid-cols-12 overflow-hidden relative">
      {/* LEFT SPLIT PANEL: Visual Pitch */}
      <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-violet-50/50 via-indigo-50/30 to-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-200">
        {/* Glow spotlight */}
        <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/20 to-fuchsia-600/20 rounded-full blur-[110px] -z-10 animate-pulse duration-[7000ms]" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-gradient-to-tr from-cyan-600/10 to-indigo-650/15 rounded-full blur-[100px] -z-10" />

        <Link to="/" className="flex items-center space-x-2.5 z-10">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg">
            <Sparkles size={18} className="text-slate-800" />
          </div>
          <span className="text-lg font-black tracking-tight text-slate-800">SwipeX</span>
        </Link>

        <div className="space-y-6 z-10 max-w-sm">
          <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight">
            Connecting tech stacks{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400">
              instantaneously.
            </span>
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed font-semibold">
            Bypass recruiter screens and tedious application forms. Let your profiles match you directly.
          </p>

          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="p-1 rounded-lg bg-violet-50 border border-violet-500/20 text-violet-600">
                <Sparkle size={14} className="animate-spin" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">ATS Score gap analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-slate-800">
              <div className="p-1 rounded-lg bg-fuchsia-50 border border-fuchsia-500/20 text-fuchsia-605">
                <Heart size={14} className="fill-fuchsia-450" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">WebSocket direct messenger</span>
            </div>
          </div>
        </div>

        <div className="text-xxs text-slate-500 font-extrabold uppercase tracking-widest z-10">
          &copy; {new Date().getFullYear()} SwipeX Technology Inc.
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Form Card */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 min-h-screen bg-[#f8fafc]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/10 to-cyan-600/10 rounded-full blur-[120px] -z-20 lg:hidden" />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500/25 via-fuchsia-500/25 to-cyan-500/30 shadow-2xl"
        >
          <div className="w-full bg-white/95 rounded-[23px] p-8 sm:p-10 border border-slate-200/50 shadow-lg text-slate-800 flex flex-col justify-between">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Sign In</h2>
                <p className="text-slate-600 mt-2 text-xs font-semibold">Enter your SwipeX account credentials</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-500/20 text-rose-605 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {validationError && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-500/20 text-amber-605 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-slate-450 text-[10px] font-extrabold uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-600 transition-colors">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (validationError) setValidationError(''); }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-4 text-slate-900 text-xs outline-none transition-all placeholder-slate-400 font-semibold"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-450 text-[10px] font-extrabold uppercase tracking-widest">Password</label>
                    <Link to="/forgot-password" className="text-violet-600 hover:text-violet-300 text-[10px] font-extrabold tracking-wide transition-colors">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-600 transition-colors">
                      <Lock size={16} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (validationError) setValidationError(''); }}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-12 text-slate-900 text-xs outline-none transition-all placeholder-slate-400 font-semibold"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-slate-650 transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-cyan-500 text-slate-800 font-extrabold text-xs rounded-2xl transition-all shadow-lg shadow-violet-650/20 active:scale-[0.98] uppercase tracking-widest cursor-pointer mt-4"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Logging in...</span>
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-extrabold uppercase tracking-widest">
                  <span className="bg-slate-50 px-4 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOAuthMock('google')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-white/20 text-slate-650 hover:text-slate-800 transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
                >
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleOAuthMock('github')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-white/20 text-slate-650 hover:text-slate-800 transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
                >
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-600 font-medium">
              New to SwipeX?{' '}
              <Link to="/register" className="text-violet-600 hover:text-violet-300 font-extrabold hover:underline transition-colors">
                Register Free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
