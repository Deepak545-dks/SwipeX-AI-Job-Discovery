import React, { useState } from 'react';
import PageTransition from '../components/PageTransition';
import { useToast } from '../context/ToastContext';
import { Sparkles, Mail, Phone, Globe } from 'lucide-react';

export default function Contact() {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !message) {
      showToast('Please fill in all contact details.', 'warning');
      return;
    }
    showToast('Message received! Our team will get back to you shortly.', 'success');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <PageTransition className="min-h-screen pt-32 pb-20 px-6 max-w-5xl mx-auto text-left">
      <div className="grid md:grid-cols-12 gap-12">
        {/* Contact details */}
        <div className="md:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-xs font-black uppercase tracking-wider text-fuchsia-400">
            <Sparkles size={12} className="animate-pulse" />
            <span>Get in Touch</span>
          </div>
          <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
            Let's Start a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">
              Conversation
            </span>
          </h1>
          <p className="text-slate-400 text-xs leading-relaxed font-semibold">
            Have questions about pricing, platform integration, enterprise deals, or need help recovering your credentials? Our support agents are ready to assist you.
          </p>

          <div className="space-y-4 pt-4 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-violet-400" />
              <span>support@swipex.co</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone size={16} className="text-fuchsia-400" />
              <span>+1 (555) 231-9087</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe size={16} className="text-cyan-400" />
              <span>hq.swipex.co</span>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-7 p-6 rounded-[28px] bg-slate-900/50 border border-white/5 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Morgan"
                className="w-full bg-slate-955/80 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 outline-none transition-all font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@company.com"
                className="w-full bg-slate-955/80 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 outline-none transition-all font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Message Description</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question details..."
                className="w-full bg-slate-955/80 border border-white/5 focus:border-violet-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-655 outline-none transition-all font-semibold h-24 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-violet-605 via-fuchsia-600 to-indigo-650 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl hover:scale-102 transition-all cursor-pointer shadow-md"
            >
              Submit Ticket
            </button>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}
