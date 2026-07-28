import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Send, Loader2, User, Briefcase, MapPin, 
  Clock, Check, CheckCheck, Smile, Phone, Video, 
  Info, AlertCircle, MessageSquare, ArrowLeft, Sparkles, AlertTriangle, Cpu
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPanel() {
  const navigate = useNavigate();
  const { user, token } = useSelector(state => state.auth);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');
  
  // Real-time states
  const [isOpponentTyping, setIsOpponentTyping] = useState(false);
  const [wsError, setWsError] = useState('');
  
  const socketRef = useRef(null);
  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Load chat rooms list
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const response = await api.get('/chat/rooms/');
      setRooms(response.data.results || response.data);
    } catch (err) {
      setError('Failed to fetch inbox chat rooms.');
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Scroll to bottom of message thread
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpponentTyping]);

  // Load message history and open WebSocket connection on room change
  const selectRoom = async (room) => {
    setSelectedRoom(room);
    setMessages([]);
    setIsOpponentTyping(false);
    setWsError('');
    setLoadingMessages(true);
    
    // Close existing WebSocket if open
    if (socketRef.current) {
      socketRef.current.close();
    }

    try {
      const response = await api.get(`/chat/rooms/${room.id}/messages/`);
      setMessages(response.data.results || response.data);
      
      // Trigger read receipt call to clear unread counts on backend
      await api.post(`/chat/rooms/${room.id}/read/`);
      // Update local rooms unread counts to 0
      setRooms(prev => prev.map(r => r.id === room.id ? { ...r, unread_count: 0 } : r));

      // Setup WebSocket connection
      let socketUrl;
      const wsBase = import.meta.env.VITE_WS_BASE_URL;
      if (wsBase) {
        socketUrl = `${wsBase}/ws/chat/${room.id}/?token=${token}`;
      } else {
        const apiBase = import.meta.env.VITE_API_BASE_URL;
        if (apiBase && apiBase.startsWith('http')) {
          const urlObj = new URL(apiBase);
          const wsScheme = urlObj.protocol === 'https:' ? 'wss' : 'ws';
          socketUrl = `${wsScheme}://${urlObj.host}/ws/chat/${room.id}/?token=${token}`;
        } else {
          const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
          const wsHost = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1')
            ? window.location.host.replace('5173', '8000')
            : window.location.host;
          socketUrl = `${wsScheme}://${wsHost}/ws/chat/${room.id}/?token=${token}`;
        }
      }

      const socket = new WebSocket(socketUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log("WebSocket connected to room", room.id);
        setWsError('');
        socket.send(JSON.stringify({ type: "read_receipt" }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message') {
          setMessages(prev => {
            if (prev.some(m => m.id === data.id)) return prev;
            return [...prev, {
              id: data.id,
              sender: data.sender_id,
              sender_email: data.sender_email,
              content: data.content,
              is_read: data.is_read,
              created_at: data.created_at
            }];
          });
          
          if (data.sender_id !== user.id) {
            socket.send(JSON.stringify({ type: "read_receipt" }));
          }
        } else if (data.type === 'typing_status') {
          if (data.sender_email !== user.email) {
            setIsOpponentTyping(data.is_typing);
          }
        } else if (data.type === 'read_receipt') {
          if (data.reader_email !== user.email) {
            setMessages(prev => prev.map(m => m.sender === user.id ? { ...m, is_read: true } : m));
          }
        }
      };

      socket.onclose = () => {
        console.log("WebSocket connection closed for room", room.id);
        setWsError('Real-time connection closed. Retry to reconnect.');
      };

      socket.onerror = (err) => {
        console.error("WebSocket error:", err);
        setWsError('Real-time connection error. Click to reconnect.');
      };

    } catch (err) {
      setError('Failed to open chat room or load history.');
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.send(JSON.stringify({
      type: "chat_message",
      content: newMessage.trim()
    }));

    setNewMessage('');
    
    socketRef.current.send(JSON.stringify({
      type: "typing_status",
      is_typing: false
    }));
  };

  const handleTypingKeydown = () => {
    if (!socketRef.current) return;

    socketRef.current.send(JSON.stringify({
      type: "typing_status",
      is_typing: true
    }));

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: "typing_status",
          is_typing: false
        }));
      }
    }, 2000);
  };

  const getOpponentDetails = (room) => {
    if (user.role === 'job_seeker') {
      return {
        name: room.recruiter_details.full_name || 'Recruiter',
        email: room.recruiter_details.email,
        sub: room.job_details?.company?.name || 'Direct Contact'
      };
    } else {
      return {
        name: room.seeker_details.full_name || 'Job Seeker',
        email: room.seeker_details.email,
        sub: room.job_details?.title || 'Applied Seeker'
      };
    }
  };

  return (
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-[82vh] flex flex-col relative z-10">
      <div className="flex-grow grid lg:grid-cols-4 gap-6 bg-slate-950/80 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl">
        
        {/* Sidebar chats list */}
        <div className={`lg:col-span-1 border-r border-white/10 flex flex-col h-full bg-slate-950/30 ${selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-white/10 text-left">
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <Cpu className="text-violet-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-fuchsia-400">Match channels</span>
            </h2>
            <p className="text-slate-500 text-[8px] mt-0.5 uppercase tracking-widest font-black">Conversations</p>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-1.5 scrollbar-none">
            {loadingRooms ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-violet-500" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-slate-500 text-xxs text-center py-10 font-bold">No active chat sessions found.</p>
            ) : (
              rooms.map((room) => {
                const opponent = getOpponentDetails(room);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left cursor-pointer ${
                      isSelected 
                        ? 'bg-gradient-to-r from-violet-650 via-fuchsia-650 to-indigo-650 text-white shadow-md' 
                        : 'hover:bg-white/5 text-slate-350 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-black text-xs relative ${
                        isSelected ? 'bg-white/20' : 'bg-slate-900 border border-white/10'
                      }`}>
                        {opponent.name.charAt(0).toUpperCase()}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_#10b981]" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-black truncate text-white">{opponent.name}</p>
                        <p className={`text-[9px] font-bold truncate mt-0.5 uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{opponent.sub}</p>
                      </div>
                    </div>
                    {room.unread_count > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black shrink-0 ml-2 ${
                        isSelected ? 'bg-white text-violet-650' : 'bg-violet-655 text-white'
                      }`}>
                        {room.unread_count}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Messaging window */}
        <div className={`lg:col-span-3 flex flex-col h-full bg-slate-950/10 ${selectedRoom ? 'flex' : 'hidden lg:flex'}`}>
          {selectedRoom ? (
            <>
              {/* Header details bar */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-slate-900/10 text-left">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg border border-white/10 transition-colors cursor-pointer"
                    title="Back to inbox"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-slate-900 border border-white/10 flex items-center justify-center text-violet-400 font-black text-xs relative shrink-0">
                    {getOpponentDetails(selectedRoom).name.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900 shadow-[0_0_8px_#10b981]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5 leading-none">
                      <span>{getOpponentDetails(selectedRoom).name}</span>
                    </h3>
                    <p className="text-slate-500 text-[9px] font-bold uppercase tracking-widest mt-1 leading-none">{getOpponentDetails(selectedRoom).sub}</p>
                  </div>
                </div>

                {/* Communication Room Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/calendar')}
                    className="p-2.5 border border-white/10 bg-slate-900/60 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Schedule Interview"
                  >
                    <Clock size={15} />
                  </button>
                  <button
                    onClick={() => navigate(`/call/room-${selectedRoom.id}`)}
                    className="p-2.5 border border-white/10 bg-slate-900/60 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Join Video Room"
                  >
                    <Video size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-none">
                {wsError && (
                  <div className="p-3.5 bg-rose-955/20 border border-rose-500/20 text-rose-455 text-xxs rounded-xl text-center flex items-center justify-center space-x-2">
                    <AlertTriangle size={14} />
                    <span>{wsError}</span>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={20} className="animate-spin text-violet-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <MessageSquare size={24} className="mx-auto text-slate-700" />
                    <p className="text-slate-500 text-xxs font-bold">No messages yet. Send a note to kickstart the conversation!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === user.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div className="max-w-[70%] space-y-1 text-left">
                          <div className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm ${
                            isMe 
                              ? 'bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 text-white rounded-tr-none' 
                              : 'bg-slate-900 border border-white/10 text-slate-200 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                          <div className={`flex items-center space-x-1.5 text-[9px] text-slate-550 font-bold uppercase tracking-wider ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              m.is_read ? <CheckCheck size={12} className="text-violet-405" /> : <Check size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isOpponentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-white/10 px-4.5 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-550 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Compose Message Box Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10 bg-slate-900/10 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTypingKeydown(); }}
                  placeholder="Type your message here..."
                  className="flex-grow bg-slate-900 border border-white/10 focus:border-violet-500 focus:bg-slate-900/95 focus:ring-4 focus:ring-violet-500/10 rounded-2xl py-3.5 px-4 text-xs text-white outline-none transition-all placeholder-slate-550 font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3.5 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-650 hover:from-violet-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-white font-black text-sm">Select a Conversation</p>
                <p className="text-slate-500 text-xs mt-1.5 font-semibold">Open a match channel from the directory list to start messaging.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
