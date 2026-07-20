import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Send, Loader2, User, Briefcase, MapPin, 
  Clock, Check, CheckCheck, Smile, Phone, Video, 
  Info, AlertCircle, MessageSquare, ArrowLeft 
} from 'lucide-react';
import api from '../utils/api';
import PageTransition from '../components/PageTransition';

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
      // Standardize WS scheme based on current window location
      const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const wsHost = window.location.host; // Usually localhost:8000 in dev
      const socketUrl = `${wsScheme}://${wsHost}/ws/chat/${room.id}/?token=${token}`;

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
      <div className="flex-grow grid lg:grid-cols-4 gap-6 bg-slate-900/40 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
        
        {/* Sidebar chats list */}
        <div className={`lg:col-span-1 border-r border-slate-850 flex-col h-full bg-slate-950/20 ${selectedRoom ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-5 border-b border-slate-850">
            <h2 className="text-lg font-black text-white tracking-tight">Messages</h2>
            <p className="text-slate-500 text-xxs mt-0.5 uppercase tracking-wider">Inbox Conversations</p>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-2">
            {loadingRooms ? (
              <div className="flex justify-center py-10">
                <Loader2 size={24} className="animate-spin text-violet-500" />
              </div>
            ) : rooms.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-10">No active chat sessions started.</p>
            ) : (
              rooms.map((room) => {
                const opponent = getOpponentDetails(room);
                const isSelected = selectedRoom?.id === room.id;
                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all text-left ${
                      isSelected 
                        ? 'bg-slate-800 border border-slate-700/50 shadow-md' 
                        : 'hover:bg-slate-850/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 relative">
                        <User size={16} />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold text-white truncate">{opponent.name}</p>
                        <p className="text-slate-400 text-xxs truncate mt-0.5">{opponent.sub}</p>
                      </div>
                    </div>
                    {room.unread_count > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-violet-600 text-xxs font-black text-white">
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
              <div className="p-4 sm:p-5 border-b border-slate-850 flex items-center justify-between bg-slate-900/30">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedRoom(null)}
                    className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg border border-slate-800 transition-colors"
                    title="Back to inbox"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 relative shrink-0">
                    <User size={18} />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{getOpponentDetails(selectedRoom).name}</span>
                    </h3>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Active Now</span>
                      <span className="text-slate-600">&bull;</span>
                      <p className="text-slate-400 text-[10px]">{getOpponentDetails(selectedRoom).sub}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-slate-400">
                  <button className="hover:text-white transition-colors"><Phone size={18} /></button>
                  <button onClick={() => navigate(`/call/${selectedRoom.id}?opponent=${getOpponentDetails(selectedRoom).name}`)} className="hover:text-violet-400 transition-colors" title="Start Video Interview"><Video size={18} /></button>
                  <button className="hover:text-white transition-colors"><Info size={18} /></button>
                </div>
              </div>

              {wsError && (
                <div className="bg-amber-950/40 border-b border-amber-900/40 px-5 py-2.5 text-xs text-amber-400 flex items-center justify-between">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span>{wsError}</span>
                  </span>
                  <button 
                    type="button" 
                    onClick={() => selectRoom(selectedRoom)} 
                    className="underline text-white font-bold hover:text-slate-200 text-xxs uppercase tracking-wider"
                  >
                    Reconnect
                  </button>
                </div>
              )}

              {/* Chat timeline feed */}
              <div className="flex-grow overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex justify-center py-20">
                    <Loader2 size={32} className="animate-spin text-violet-500" />
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMe = msg.sender === user.id;
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed shadow-lg ${
                          isMe 
                            ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white rounded-br-none' 
                            : 'bg-slate-900 border border-slate-850 text-slate-200 rounded-bl-none'
                        }`}>
                          <p>{msg.content}</p>
                          <div className={`flex items-center justify-end space-x-1.5 mt-2.5 text-xxs ${
                            isMe ? 'text-violet-200' : 'text-slate-505'
                          }`}>
                            <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isMe && (
                              msg.is_read ? <CheckCheck size={14} className="text-emerald-400" /> : <Check size={14} />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                
                {isOpponentTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-900 border border-slate-850 text-slate-450 p-3.5 rounded-2xl rounded-bl-none text-xs flex items-center space-x-3 shadow-md">
                      <span className="italic">{getOpponentDetails(selectedRoom).name} is typing</span>
                      <span className="flex space-x-1 items-center h-2">
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} />
              </div>

              {/* Bottom message composition bar */}
              <form onSubmit={handleSendMessage} className="p-5 border-t border-slate-850 bg-slate-900/30 flex gap-4 items-center">
                <button type="button" className="text-slate-400 hover:text-white transition-colors">
                  <Smile size={20} />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleTypingKeydown}
                  placeholder="Type a message..."
                  className="flex-grow bg-slate-950/50 border border-slate-800 focus:border-violet-500 rounded-xl py-3 px-4 text-white text-xs outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl transition-all shadow-lg shadow-violet-500/10"
                >
                  <Send size={16} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-8 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-inner">
                <MessageSquare size={32} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">Select a Conversation</h3>
                <p className="text-slate-400 text-xs mt-1 max-w-xs leading-relaxed">
                  Pick a contact from the inbox list to start messaging in real-time
                </p>
              </div>
            </div>
          )}
        </div>

      </div>
    </PageTransition>
  );
}
