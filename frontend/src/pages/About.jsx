import React from 'react';
import PageTransition from '../components/PageTransition';
import { Sparkles, Shield, Zap, Users } from 'lucide-react';

export default function About() {
  return (
    <PageTransition className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto text-left">
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-black uppercase tracking-wider text-violet-400">
            <Sparkles size={12} className="animate-pulse" />
            <span>Our Story</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight tracking-tight">
            Redefining Career Discovery <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-405">
              Through AI-Driven Matching
            </span>
          </h1>
          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-3xl font-medium">
            SwipeX was created to break the traditional, slow cycle of job hunting. We believe you should spend less time filling out long application forms and more time direct-messaging teams that match your experience profile.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          {[
            { icon: Zap, title: "Speed", desc: "Instantly match with recruiters at top-tier organizations based on actual skills and experience fit." },
            { icon: Shield, title: "Privacy First", desc: "Your details are completely protected. Reveal contact info only when a mutual match is formed." },
            { icon: Users, title: "Direct Contact", desc: "No middle-men. Chat directly with technical recruiters and engineering managers." }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="p-6 rounded-[24px] bg-slate-900/50 border border-white/5 shadow-xl hover:border-violet-500/20 transition-all">
                <div className="p-3 w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-5">
                  <Icon size={20} />
                </div>
                <h3 className="text-lg font-black text-white">{item.title}</h3>
                <p className="text-slate-400 text-xs mt-2.5 leading-relaxed font-semibold">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
