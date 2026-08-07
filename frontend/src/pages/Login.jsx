import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, Eye, EyeOff, Sparkles, AlertCircle, Sparkle, Heart, ArrowRight } from 'lucide-react';
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
        navigate('/discover');
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
      navigate('/discover');
    } catch (err) {
      dispatch(setError('Social authentication failed.'));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-12 overflow-hidden relative bg-[#090e1a] text-white">
      
      {/* Background spotlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-violet-600/15 via-blue-500/10 to-transparent rounded-full blur-[130px]" />
        <div className="absolute bottom-[20%] right-[-10%] w-[450px] h-[450px] bg-gradient-to-br from-cyan-600/15 via-violet-650/10 to-transparent rounded-full blur-[130px]" />
      </div>

      {/* LEFT SPLIT PANEL: Visual Pitch (Dark Glass) */}
      <div className="hidden lg:flex lg:col-span-5 bg-slate-950/40 backdrop-blur-3xl p-12 flex-col justify-between relative overflow-hidden border-r border-white/10 text-left">
        <div className="absolute -top-20 -left-20 w-[450px] h-[450px] bg-gradient-to-tr from-violet-600/15 to-fuchsia-600/15 rounded-full blur-[110px] -z-10 animate-pulse duration-[7000ms]" />

        <Link to="/" className="flex items-center space-x-2.5 z-10 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-lg group-hover:scale-105 transition-transform duration-300">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">SwipeX</span>
        </Link>

        <div className="space-y-6 z-10 max-w-sm">
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
            Connecting tech stacks{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 drop-shadow-[0_0_20px_rgba(139,92,246,0.15)]">
              instantaneously.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed font-semibold">
            Bypass recruiter screens and tedious application forms. Let your profiles match you directly.
          </p>

          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center space-x-3 text-white">
              <div className="p-1 rounded-lg bg-violet-600/20 border border-violet-500/30 text-violet-400">
                <Sparkle size={14} className="animate-spin" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider">ATS Score gap analytics</span>
            </div>
            <div className="flex items-center space-x-3 text-white">
              <div className="p-1 rounded-lg bg-fuchsia-600/20 border border-fuchsia-500/30 text-fuchsia-400">
                <Heart size={14} className="fill-fuchsia-400 text-fuchsia-400" />
              </div>
              <span className="text-xs font-black uppercase tracking-wider">WebSocket direct messenger</span>
            </div>
          </div>
        </div>

        <div className="text-xxs text-slate-500 font-extrabold uppercase tracking-widest z-10">
          &copy; {new Date().getFullYear()} SwipeX Technology Inc.
        </div>
      </div>

      {/* RIGHT SPLIT PANEL: Form Card (Frosted glass-card-purple-blue) */}
      <div className="lg:col-span-7 flex items-center justify-center p-8 sm:p-12 min-h-screen">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md relative p-[1px] rounded-3xl overflow-hidden bg-gradient-to-tr from-violet-500/35 via-fuchsia-500/30 to-cyan-500/35 shadow-2xl"
        >
          <div className="w-full bg-[#0d1325]/90 rounded-[28px] p-8 sm:p-10 border border-white/5 shadow-lg text-white flex flex-col justify-between">
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">Sign In</h2>
                <p className="text-slate-400 mt-2 text-xs font-semibold">Enter your SwipeX account credentials</p>
              </div>

              {error && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-455 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {validationError && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold flex items-center space-x-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="text-left">
                  <label className="block text-slate-500 text-[10px] font-extrabold uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 pointer-events-none group-focus-within:text-violet-400 transition-colors">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (validationError) setValidationError(''); }}
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-4 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="jane@company.com"
                    />
                  </div>
                </div>

                <div className="text-left">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-slate-500 text-[10px] font-extrabold uppercase tracking-widest">Password</label>
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
                      className="w-full bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-950 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 pl-11 pr-12 text-white text-xs outline-none transition-all placeholder-slate-550 font-semibold"
                      placeholder="••••••••"
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg active:scale-95 uppercase tracking-widest cursor-pointer mt-4 border border-violet-550"
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
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-extrabold uppercase tracking-widest">
                  <span className="bg-[#0d1325] px-4 text-slate-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleOAuthMock('google')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl border border-white/10 bg-slate-900 hover:bg-slate-950 text-slate-350 hover:text-white transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
                >
                  <span>Google</span>
                </button>
                <button
                  onClick={() => handleOAuthMock('github')}
                  disabled={loading}
                  className="flex items-center justify-center space-x-2 py-3 rounded-2xl border border-white/10 bg-slate-900 hover:bg-slate-950 text-slate-355 hover:text-white transition-all text-xs font-bold active:scale-[0.97] cursor-pointer"
                >
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-slate-500 font-medium">
              New to SwipeX?{' '}
              <Link to="/register" className="text-violet-405 hover:text-violet-300 font-extrabold hover:underline transition-colors">
                Register Free
              </Link>
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
