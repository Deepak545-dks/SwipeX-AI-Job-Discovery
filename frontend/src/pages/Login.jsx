import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials, setLoading, setError } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to find your dream job or ideal candidate</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {validationError && (
          <div className="mb-4 p-3 rounded-lg bg-yellow-950/50 border border-yellow-800 text-yellow-400 text-sm">
            {validationError}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Mail size={18} />
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-slate-300 text-xs font-semibold uppercase tracking-wider">Password</label>
              <Link to="/forgot-password" className="text-violet-400 hover:text-violet-300 text-xs font-semibold">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/10"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Signing in...
              </>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900 px-3 text-slate-500 font-semibold">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleOAuthMock('google')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all text-sm"
          >
            <span>Google</span>
          </button>
          <button
            onClick={() => handleOAuthMock('github')}
            disabled={loading}
            className="flex items-center justify-center space-x-2 py-2.5 rounded-lg border border-slate-800 hover:bg-slate-800/50 text-slate-300 hover:text-white transition-all text-sm"
          >
            <span>GitHub</span>
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-slate-400">
          New to SwipeX?{' '}
          <Link to="/register" className="text-violet-400 hover:text-violet-300 font-semibold">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
