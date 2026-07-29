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
      console.error(err);
      setWsError('Failed to establish socket pipeline.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    // Send via WebSocket
    socketRef.current.send(JSON.stringify({
      type: "chat_message",
      message: newMessage
    }));

    setNewMessage('');
    // Clear local typing trigger
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: "typing_status",
          is_typing: false
        }));
      }
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const getOpponentDetails = (room) => {
    if (user.role === 'job_seeker') {
      return {
        name: room.recruiter_name || room.recruiter_email || 'Recruiter Partner',
        sub: room.company_name || 'Hiring Enterprise'
      };
    }
    return {
      name: room.seeker_name || room.seeker_email || 'Candidate Partner',
      sub: 'Job Seeker Match'
    };
  };

  return (
    <PageTransition className="max-w-6xl mx-auto px-4 sm:px-6 py-12 text-slate-800">
      
      {/* Messages layout frame */}
      <div className="rounded-[28px] border border-slate-200 bg-white/80 backdrop-blur-2xl grid lg:grid-cols-4 min-h-[75vh] max-h-[80vh] overflow-hidden shadow-xl">
        
        {/* Sidebar Directory */}
        <div className={`lg:col-span-1 border-r border-slate-200 flex flex-col h-full bg-slate-50/50 ${selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 sm:p-5 border-b border-slate-200 text-left">
            <h2 className="text-lg font-black text-slate-850 flex items-center gap-2">
              <Cpu size={18} className="text-violet-600" /> Matches Inbox
            </h2>
            <p className="text-slate-450 text-[10px] uppercase font-black tracking-widest mt-1">Direct Match Lines</p>
          </div>

          <div className="flex-grow overflow-y-auto p-3 space-y-2">
            {loadingRooms ? (
              <div className="flex flex-col items-center py-10 space-y-2">
                <Loader2 size={24} className="animate-spin text-violet-600" />
                <span className="text-[10px] text-slate-450 font-extrabold uppercase">Scanning channels...</span>
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-slate-400 text-xxs py-10 text-center font-bold">No active conversations yet.</p>
            ) : (
              rooms.map((room) => {
                const opponent = getOpponentDetails(room);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all text-left cursor-pointer border ${
                      isSelected 
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white shadow-md border-violet-550' 
                        : 'hover:bg-slate-100/50 text-slate-650 hover:text-slate-800 border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-black text-xs relative ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 border border-slate-200 text-violet-600'
                      }`}>
                        {opponent.name.charAt(0).toUpperCase()}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-black truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{opponent.name}</p>
                        <p className={`text-[9px] font-bold truncate mt-0.5 uppercase tracking-wider ${isSelected ? 'text-white/80' : 'text-slate-450'}`}>{opponent.sub}</p>
                      </div>
                    </div>
                    {room.unread_count > 0 && (
                      <span className={`px-2 py-0.5 rounded-md text-[8px] font-black shrink-0 ml-2 ${
                        isSelected ? 'bg-white text-violet-650' : 'bg-violet-600 text-white'
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
        <div className={`lg:col-span-3 flex flex-col h-full bg-slate-50/20 ${selectedRoom ? 'flex' : 'hidden lg:flex'}`}>
          {selectedRoom ? (
            <>
              {/* Header details bar */}
              <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white text-left">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="lg:hidden text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    title="Back to inbox"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-violet-650 font-black text-xs relative shrink-0">
                    {getOpponentDetails(selectedRoom).name.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5 leading-none">
                      <span>{getOpponentDetails(selectedRoom).name}</span>
                    </h3>
                    <p className="text-slate-450 text-[9px] font-bold uppercase tracking-widest mt-1.5 leading-none">{getOpponentDetails(selectedRoom).sub}</p>
                  </div>
                </div>

                {/* Communication Room Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/calendar')}
                    className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-xl transition-all cursor-pointer"
                    title="Schedule Interview"
                  >
                    <Clock size={15} />
                  </button>
                  <button
                    onClick={() => navigate(`/call/room-${selectedRoom.id}`)}
                    className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-850 rounded-xl transition-all cursor-pointer"
                    title="Join Video Room"
                  >
                    <Video size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-5">
                {wsError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xxs rounded-xl text-center flex items-center justify-center space-x-2">
                    <AlertTriangle size={14} />
                    <span>{wsError}</span>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={20} className="animate-spin text-violet-650" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <MessageSquare size={24} className="mx-auto text-slate-400" />
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
                          <div className={`px-4.5 py-3 rounded-2xl text-xs leading-relaxed font-semibold shadow-sm border ${
                            isMe 
                              ? 'bg-gradient-to-r from-violet-600 to-indigo-650 text-white border-violet-550 rounded-tr-none' 
                              : 'bg-white border-slate-200 text-slate-800 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                          <div className={`flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-wider ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              m.is_read ? <CheckCheck size={12} className="text-violet-605" /> : <Check size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isOpponentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 px-4.5 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Compose Message Box Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 bg-slate-50 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTypingKeydown(); }}
                  placeholder="Type your message here..."
                  className="flex-grow bg-white border border-slate-200 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3.5 px-4 text-xs text-slate-900 outline-none transition-all placeholder-slate-400 font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3.5 bg-gradient-to-r from-violet-600 to-indigo-650 hover:from-violet-500 hover:to-indigo-500 text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  <Send size={15} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4 bg-white/20">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 shadow-inner">
                <MessageSquare size={24} />
              </div>
              <div>
                <p className="text-slate-800 font-black text-sm">Select a Conversation</p>
                <p className="text-slate-500 text-xs mt-1.5 font-semibold">Open a match channel from the directory list to start messaging.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
