import React from 'react';

export default function AdminPlaceholder() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-3xl font-extrabold text-white mb-2">Admin Dashboard</h1>
      <p className="text-slate-400 text-sm max-w-sm">
        Platform user statistics, recruiter management, and system status configuration.
      </p>
    </div>
  );
}
