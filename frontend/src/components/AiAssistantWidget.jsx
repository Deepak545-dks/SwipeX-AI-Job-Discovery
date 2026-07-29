import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, MessageSquare, X, Send, Cpu, Award, Zap, Terminal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'assistant', text: "Hello! I am your SwipeX AI Career Companion. Ask me about ATS matching tips, salary insights, or skill recommendations!" }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setTyping(true);

    // Simulate AI response response
    setTimeout(() => {
      let reply = "I am processing your query. For full ATS analytics or personalized suggestions, please verify your resume is uploaded in your Profile tab.";
      const query = userMsg.toLowerCase();
      if (query.includes('ats') || query.includes('score')) {
        reply = "Tip: High-impact verbs like 'orchestrated', 'streamlined', and 'profiled' paired with concrete numbers (e.g. 'boosted throughput by 22%') can raise your matching index by up to 14%.";
      } else if (query.includes('salary') || query.includes('insight')) {
        reply = "Salary Insights: AI Platform roles currently command $180k - $250k on average. Frontend architects using React + Framer Motion average $140k - $190k.";
      } else if (query.includes('skill') || query.includes('gap')) {
        reply = "Skill Gaps: Many tech roles are looking for Docker, Kubernetes, or CUDA qualifications. You can run our AI Skill Gap audit on any job's detail card!";
      }

      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
      setTyping(false);
    }, 1500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat Box Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className="w-80 sm:w-96 p-[1.5px] rounded-3xl bg-gradient-to-tr from-violet-600/30 via-pink-500/20 to-transparent shadow-2xl mb-4 relative"
          >
            <div className="bg-[#0b0f19]/95 backdrop-blur-2xl rounded-[23px] border border-white/5 overflow-hidden flex flex-col text-left h-[460px]">
              
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-blue-600 text-white flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center animate-pulse">
                    <Sparkles size={14} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider">AI Assistant</h4>
                    <p className="text-[9px] text-violet-100 font-semibold leading-none">Global Career Companion</p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Message Streams */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((m, i) => {
                  const isMe = m.sender === 'user';
                  return (
                    <div key={i} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-xxs leading-relaxed font-semibold max-w-[80%] ${
                        isMe 
                          ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-tr-none' 
                          : 'bg-white/5 border border-white/10 text-slate-205 rounded-tl-none'
                      }`}>
                        <p>{m.text}</p>
                      </div>
                    </div>
                  );
                })}

                {typing && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl rounded-tl-none flex items-center space-x-1.5 animate-pulse">
                      <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input panel Form */}
              <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-slate-900/30 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for resume metrics, salary benchmarks..."
                  className="flex-grow bg-slate-950 border border-white/10 focus:border-violet-500 rounded-xl py-2 px-3 text-xxs text-white outline-none font-semibold transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className="p-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl active:scale-95 disabled:opacity-30 cursor-pointer transition-all"
                >
                  <Send size={12} />
                </button>
              </form>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Sparkles Bubble Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(!open)}
        className="w-14 h-14 rounded-full bg-gradient-to-tr from-violet-600 via-fuchsia-600 to-blue-600 flex items-center justify-center text-white shadow-xl shadow-violet-500/20 transition-all cursor-pointer border border-violet-555"
        title="Open AI Career Companion"
      >
        <Sparkles size={20} className="animate-pulse" />
      </motion.button>

    </div>
  );
}
