import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import api from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError('Verification token is missing in the URL.');
        setLoading(false);
        return;
      }
      try {
        await api.post('/auth/verify-email/', { token });
        setSuccess(true);
      } catch (err) {
        setError(err.response?.data?.error || 'Email verification failed. The link may have expired or is invalid.');
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900/60 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl shadow-2xl text-center">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 size={48} className="animate-spin text-violet-500 mb-4" />
            <h3 className="text-xl font-bold text-white">Verifying your email...</h3>
            <p className="text-slate-400 mt-2 text-sm">Please hold on while we process your request</p>
          </div>
        ) : success ? (
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle size={56} className="text-green-500 mb-4" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Email Verified!</h2>
            <p className="text-slate-400 mt-2 text-sm leading-relaxed">
              Congratulations! Your email has been verified successfully. You can now log in and explore SwipeX.
            </p>
            <Link
              to="/login"
              className="mt-8 w-full py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-lg text-white font-semibold text-sm transition-all"
            >
              Sign In
            </Link>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-4">
            <XCircle size={56} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Verification Failed</h2>
            <p className="text-red-400 mt-2 text-sm">
              {error}
            </p>
            <Link
              to="/register"
              className="mt-8 w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-semibold text-sm transition-all"
            >
              Try Registering Again
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
