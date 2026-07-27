import React from 'react';
import { Shield, Users, Building, Activity, ShieldCheck } from 'lucide-react';
import PageTransition from '../components/PageTransition';

export default function AdminPlaceholder() {
  return (
    <PageTransition className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto py-12 space-y-8">
      <div className="space-y-3">
        <div className="w-16 h-16 mx-auto rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
          <ShieldCheck size={32} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight">Admin System Console</h1>
        <p className="text-slate-400 text-xs max-w-md mx-auto">
          Audit database models, monitor user accounts, and coordinate recruiter verification workflows.
        </p>
      </div>

      {/* Grid of placeholder metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
        {[
          { label: 'Total Accounts', val: '12,482', change: '+12%', icon: Users },
          { label: 'Verified Partners', val: '842', change: '+5%', icon: Building },
          { label: 'API Queries', val: '184.2k', change: '99.98% up', icon: Activity },
          { label: 'Security Status', val: 'Optimal', change: 'Encrypted', icon: Shield }
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">{m.label}</span>
                <Icon size={14} className="text-violet-400" />
              </div>
              <p className="text-xl font-black text-white">{m.val}</p>
              <p className="text-xxs text-emerald-400 font-bold mt-1">{m.change}</p>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
}
