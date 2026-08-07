import React from 'react';
import PageTransition from '../components/PageTransition';
import { Sparkles, Check } from 'lucide-react';

export default function Pricing() {
  return (
    <PageTransition className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto text-left">
      <div className="space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-xs font-black uppercase tracking-wider text-cyan-400">
            <Sparkles size={12} className="animate-pulse" />
            <span>Pricing Plans</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Flexible Plans Built for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-cyan-400">
              Talent & Recruiters
            </span>
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-2xl font-semibold">
            SwipeX is always 100% free for job seekers. Recruiters can upgrade to premium seats for advanced filters, bulk invites, and AI integrations.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          {/* Seeker Tier */}
          <div className="p-8 rounded-[32px] bg-slate-900/40 border border-white/5 shadow-2xl relative flex flex-col justify-between hover:border-violet-500/20 transition-all">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Talent Tier</h3>
                <p className="text-xxs text-slate-500 font-extrabold uppercase mt-1">For Seeker Professionals</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$0</span>
                <span className="text-slate-500 text-xs font-extrabold uppercase">Free forever</span>
              </div>
              <ul className="space-y-3.5 pt-4">
                {[
                  "Unlimited Tinder-style job card swiping",
                  "AI resume ATS analysis scanner",
                  "Direct chat room messaging with matched recruiters",
                  "Custom interview preparation roadmaps"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-300">
                    <Check size={14} className="text-emerald-450 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-white/5">
              Get Started Free
            </button>
          </div>

          {/* Recruiter Tier */}
          <div className="p-8 rounded-[32px] bg-slate-900/60 border border-violet-500/30 shadow-2xl relative flex flex-col justify-between hover:border-violet-500/50 transition-all">
            <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-605 to-fuchsia-600 text-[9px] font-black uppercase tracking-wider text-white shadow-md">
              Most Popular
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-black text-white">Recruiter Enterprise</h3>
                <p className="text-xxs text-violet-400 font-extrabold uppercase mt-1">For Teams & Agencies</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">$149</span>
                <span className="text-slate-500 text-xs font-extrabold uppercase">/ Month</span>
              </div>
              <ul className="space-y-3.5 pt-4">
                {[
                  "Advanced talent database searches",
                  "AI matchmaking ranking score",
                  "Unlimited open candidate pipeline creation",
                  "Priority candidate outreach & bulk integrations"
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs font-semibold text-slate-300">
                    <Check size={14} className="text-violet-400 mt-0.5 shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button className="w-full mt-8 py-3 rounded-xl bg-gradient-to-r from-violet-605 via-indigo-650 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider hover:scale-102 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)] transition-all cursor-pointer shadow-md">
              Start Enterprise Trial
            </button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
