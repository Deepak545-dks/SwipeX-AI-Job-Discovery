import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Send, Loader2, User, Briefcase, MapPin, 
  Clock, Check, CheckCheck, Smile, Phone, Video, 
  Info, AlertCircle, MessageSquare, ArrowLeft, Sparkles, AlertTriangle
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
        // Send initial read receipt signal
        socket.send(JSON.stringify({ type: "read_receipt" }));
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat_message') {
          // Add message to thread
          setMessages(prev => {
            // Prevent duplicate message renders
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
          
          // Send automatic read receipt if message is from the other user
          if (data.sender_id !== user.id) {
            socket.send(JSON.stringify({ type: "read_receipt" }));
          }
        } else if (data.type === 'typing_status') {
          if (data.sender_email !== user.email) {
            setIsOpponentTyping(data.is_typing);
          }
        } else if (data.type === 'read_receipt') {
          if (data.reader_email !== user.email) {
            // Mark all messages sent by me as read
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

  // Cleanup WebSockets on component unmount
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

    // Send payload via socket
    socketRef.current.send(JSON.stringify({
      type: "chat_message",
      content: newMessage.trim()
    }));

    setNewMessage('');
    
    // Clear typing indicator immediately
    socketRef.current.send(JSON.stringify({
      type: "typing_status",
      is_typing: false
    }));
  };

  // Handle typing status notification with throttle
  const handleTypingKeydown = () => {
    if (!socketRef.current) return;

    // Emit typing status: True
    socketRef.current.send(JSON.stringify({
      type: "typing_status",
      is_typing: true
    }));

    // Reset timeout to emit: False
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
    <PageTransition className="max-w-7xl mx-auto px-4 sm:px-6 py-8 h-[82vh] flex flex-col">
      <div className="flex-grow grid lg:grid-cols-4 gap-6 bg-slate-900/40 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Sidebar chats list */}
        <div className={`lg:col-span-1 border-r border-white/5 flex-col h-full bg-slate-950/20 ${selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-white/5">
            <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <MessageSquare size={16} className="text-violet-400" />
              <span>Inbox Chat</span>
            </h2>
            <p className="text-slate-500 text-[9px] mt-0.5 uppercase tracking-wider font-bold">Conversations</p>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-1.5">
            {loadingRooms ? (
              <div className="flex justify-center py-10">
                <Loader2 size={20} className="animate-spin text-violet-500" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-slate-500 text-xxs text-center py-10">No active chat sessions found.</p>
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
                        ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md' 
                        : 'hover:bg-white/5 text-slate-350 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-extrabold text-xs relative ${
                        isSelected ? 'bg-white/20' : 'bg-slate-950 border border-white/5'
                      }`}>
                        {opponent.name.charAt(0).toUpperCase()}
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div className="truncate">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-white'}`}>{opponent.name}</p>
                        <p className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>{opponent.sub}</p>
                      </div>
                    </div>
                    {room.unread_count > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black shrink-0 ml-2 ${
                        isSelected ? 'bg-white text-violet-650' : 'bg-violet-650 text-white'
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
        <div className={`lg:col-span-3 flex-col h-full bg-slate-950/10 ${selectedRoom ? 'flex' : 'hidden lg:flex'}`}>
          {selectedRoom ? (
            <>
              {/* Header details bar */}
              <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between bg-slate-900/10">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg border border-white/5 transition-colors cursor-pointer"
                    title="Back to inbox"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-slate-950 border border-white/5 flex items-center justify-center text-violet-400 font-extrabold text-xs relative shrink-0">
                    {getOpponentDetails(selectedRoom).name.charAt(0).toUpperCase()}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white flex items-center gap-1.5">
                      <span>{getOpponentDetails(selectedRoom).name}</span>
                    </h3>
                    <p className="text-slate-500 text-[10px] tracking-wide mt-0.5">{getOpponentDetails(selectedRoom).sub}</p>
                  </div>
                </div>

                {/* Communication Room Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => navigate('/calendar')}
                    className="p-2 border border-white/5 bg-slate-950/40 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Schedule Interview"
                  >
                    <Clock size={16} />
                  </button>
                  <button
                    onClick={() => navigate(`/call/room-${selectedRoom.id}`)}
                    className="p-2 border border-white/5 bg-slate-950/40 hover:bg-white/5 text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
                    title="Join Video Room"
                  >
                    <Video size={16} />
                  </button>
                </div>
              </div>

              {/* Chat Thread Messages Area */}
              <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4">
                {wsError && (
                  <div className="p-3 bg-red-955/20 border border-red-900/30 text-red-400 text-xxs rounded-xl text-center flex items-center justify-center space-x-2">
                    <AlertTriangle size={14} />
                    <span>{wsError}</span>
                  </div>
                )}

                {loadingMessages ? (
                  <div className="flex justify-center py-10">
                    <Loader2 size={20} className="animate-spin text-violet-500" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <MessageSquare size={24} className="mx-auto text-slate-800" />
                    <p className="text-slate-500 text-[10px]">No messages yet. Send a note to kickstart the conversation!</p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.sender === user.id;
                    return (
                      <div 
                        key={m.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        <div className={`max-w-[70%] space-y-1`}>
                          <div className={`px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                            isMe 
                              ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-tr-none' 
                              : 'bg-slate-900 border border-white/5 text-slate-200 rounded-tl-none'
                          }`}>
                            <p>{m.content}</p>
                          </div>
                          <div className={`flex items-center space-x-1.5 text-[9px] text-slate-550 ${
                            isMe ? 'justify-end' : 'justify-start'
                          }`}>
                            <span>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              m.is_read ? <CheckCheck size={12} className="text-violet-400" /> : <Check size={12} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {isOpponentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-white/5 px-4 py-3 rounded-2xl rounded-tl-none flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>

              {/* Compose Message Box Form */}
              <form onSubmit={handleSendMessage} className="p-4 border-t border-white/5 bg-slate-900/10 flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => { setNewMessage(e.target.value); handleTypingKeydown(); }}
                  placeholder="Type your message here..."
                  className="flex-grow bg-slate-950/50 border border-white/5 focus:border-violet-500/50 focus:bg-slate-950/75 focus:ring-4 focus:ring-violet-500/5 rounded-2xl py-3 px-4 text-xs text-white outline-none transition-all placeholder-slate-600"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-2xl transition-all shadow-md active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shrink-0 cursor-pointer"
                  title="Send Message"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-white/5 flex items-center justify-center text-slate-600">
                <MessageSquare size={30} />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Select a Conversation</p>
                <p className="text-slate-500 text-xs mt-1">Open a chat room from the directory to trace real-time matching, cover notes, and plan calls.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
