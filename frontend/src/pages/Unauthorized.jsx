import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12 text-center">
      <ShieldAlert size={64} className="text-red-500 mb-6" />
      <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">Access Denied</h1>
      <p className="text-slate-400 text-sm max-w-md leading-relaxed mb-8">
        You do not have the required permissions to access this page. If you believe this is an error, please contact support or login with another account.
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all"
        >
          Go Home
        </Link>
        <Link
          to="/login"
          className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white transition-all shadow-lg shadow-violet-500/10"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
