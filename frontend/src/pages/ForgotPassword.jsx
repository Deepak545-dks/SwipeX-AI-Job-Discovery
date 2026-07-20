import React, { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import api from '../utils/api';
import { Link } from 'react-router-dom';

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
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Reset Password</h2>
          <p className="text-slate-400 mt-2 text-sm">Enter your email and we'll send you a password reset link</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800 text-red-400 text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-lg bg-green-950/50 border border-green-800 text-green-400 text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-500/10"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                Sending link...
              </>
            ) : 'Send Reset Link'}
          </button>
        </form>

        {devToken && (
          <div className="mt-6 p-4 bg-slate-950/80 border border-violet-900/30 rounded-lg text-left">
            <p className="text-xs text-violet-400 font-bold mb-2">DEVELOPER LOG / QUICK RESET LINK:</p>
            <Link
              to={`/reset-password?token=${devToken}`}
              className="text-xs text-fuchsia-400 hover:underline break-all"
            >
              Click here to reset password instantly (Dev Mode)
            </Link>
          </div>
        )}

        <div className="mt-8 text-center text-sm text-slate-400">
          <Link to="/login" className="text-violet-400 hover:text-violet-300 font-semibold">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
