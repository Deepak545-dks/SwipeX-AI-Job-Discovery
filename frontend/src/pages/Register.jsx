import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setLoading, setError, setCredentials } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, ShieldCheck, Eye, EyeOff, Sparkles, UserCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('job_seeker');
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
    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long');
      return false;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await api.post('/auth/register/', { email, password, role });
      dispatch(setCredentials(response.data));
      
      if (role === 'recruiter') {
        navigate('/recruiter');
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/swipe');
      }
    } catch (err) {
      const fieldErrors = err.response?.data;
      let errorMsg = 'Registration failed. Please check inputs.';
      if (fieldErrors && typeof fieldErrors === 'object') {
        errorMsg = Object.values(fieldErrors).flat().join(' ');
      }
      dispatch(setError(errorMsg));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-[85vh] relative flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Glow Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-fuchsia-600/10 rounded-full blur-[100px] -z-10 animate-pulse" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-slate-900/45 border border-white/5 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative"
      >
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 shadow-md shadow-violet-500/20 mb-4">
            <UserCheck size={20} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-xs">Join SwipeX and start exploring careers today</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/30 border border-red-900/40 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {validationError && (
          <div className="mb-5 p-3.5 rounded-xl bg-amber-950/30 border border-amber-900/40 text-amber-400 text-xs font-medium">
            {validationError}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-2">Registering As</label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950/50 rounded-xl border border-white/5">
              {[
                { id: 'job_seeker', label: 'Seeker' },
                { id: 'recruiter', label: 'Recruiter' },
                { id: 'admin', label: 'Admin' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRole(tab.id)}
                  className={`py-2 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                    role === tab.id
                      ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

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
            <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (validationError) setValidationError(''); }}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 pl-10 pr-10 text-white text-xs outline-none transition-all placeholder-slate-650"
                placeholder="Min. 8 characters"
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

          <div>
            <label className="block text-slate-350 text-[10px] font-bold uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 pointer-events-none">
                <Lock size={16} />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); if (validationError) setValidationError(''); }}
                className="w-full bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/70 focus:ring-4 focus:ring-violet-500/10 rounded-xl py-3 pl-10 pr-10 text-white text-xs outline-none transition-all placeholder-slate-650"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-350 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-violet-500/10 hover:scale-[1.01] active:scale-95 cursor-pointer pt-4"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin mr-2" />
                Creating account...
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-bold">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
