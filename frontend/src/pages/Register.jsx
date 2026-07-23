import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setLoading, setError, setCredentials } from '../store/slices/authSlice';
import api from '../utils/api';
import { Loader2, Mail, Lock } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Create Account</h2>
          <p className="text-slate-400 mt-2 text-sm">Join SwipeX and start exploring careers today</p>
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

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Registering As</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'job_seeker', label: 'Job Seeker' },
                { id: 'recruiter', label: 'Recruiter' },
                { id: 'admin', label: 'Admin' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setRole(tab.id)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    role === tab.id
                      ? 'border-violet-500 bg-violet-950/30 text-violet-400 shadow-md shadow-violet-500/5'
                      : 'border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

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
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-colors"
                placeholder="Min. 8 characters"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <Lock size={18} />
              </span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-lg py-2.5 pl-10 pr-4 text-white text-sm outline-none transition-colors"
                placeholder="Confirm your password"
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
                Creating account...
              </>
            ) : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
