import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  PhoneOff, Edit3, Trash2, ShieldAlert, Users, 
  Maximize2, Share2, Palette, Sparkles, Loader2, Play
} from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

export default function VideoInterview() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useSelector(state => state.auth);

  // Stream States
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Call Session status
  const [callStatus, setCallStatus] = useState('connecting'); // connecting, ringing, active, ended, failed
  const [opponentName, setOpponentName] = useState('Interviewer/Candidate');

  // Interactive Whiteboard states
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [brushColor, setBrushColor] = useState('#8b5cf6'); // Violet primary
  const [brushSize, setBrushSize] = useState(4);
  const [drawingToolsOpen, setDrawingToolsOpen] = useState(false);

  // Refs for WebRTC & Canvas
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(null);
  const screenTrackRef = useRef(null);
  
  // Whiteboard Canvas refs
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const isDrawingRef = useRef(false);

  // Standard public STUN servers
  const iceConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    // Attempt query parameters for opponent metadata if passed from navigation
    const queryParams = new URLSearchParams(location.search);
    const opp = queryParams.get('opponent');
    if (opp) setOpponentName(opp);

    initializeCall();

    return () => {
      cleanupCall();
    };
  }, [roomId]);

  // Set up local camera media stream
  const initializeCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setCallStatus('waiting');
      connectSignaling(stream);
    } catch (err) {
      console.error("Failed to capture local media stream:", err);
      setCallStatus('failed');
    }
  };

  // Connect to Django Channels CallConsumer signaling channel
  const connectSignaling = (stream) => {
    let socketUrl;
    const wsBase = import.meta.env.VITE_WS_BASE_URL;
    if (wsBase) {
      socketUrl = `${wsBase}/ws/call/${roomId}/?token=${token}`;
    } else {
      const apiBase = import.meta.env.VITE_API_BASE_URL;
      if (apiBase && apiBase.startsWith('http')) {
        const urlObj = new URL(apiBase);
        const wsScheme = urlObj.protocol === 'https:' ? 'wss' : 'ws';
        socketUrl = `${wsScheme}://${urlObj.host}/ws/call/${roomId}/?token=${token}`;
      } else {
        const wsScheme = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const wsHost = window.location.host.includes('localhost') || window.location.host.includes('127.0.0.1')
          ? window.location.host.replace('5173', '8000')
          : window.location.host;
        socketUrl = `${wsScheme}://${wsHost}/ws/call/${roomId}/?token=${token}`;
      }
    }
    
    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Signaling WebSocket connected to call room", roomId);
      // Auto-trigger Call Initiation SDP creation if recruiter
      if (user.role === 'recruiter') {
        initiateWebRTCPeerConnection(stream);
      }
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.sender_email === user.email) return; // Ignore own echoes

      const { payload } = data;
      const type = payload.type;

      if (type === 'sdp_offer') {
        if (!peerConnectionRef.current) {
          initiateWebRTCPeerConnection(stream);
        }
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        socketRef.current.send(JSON.stringify({
          type: 'sdp_answer',
          sdp: answer
        }));
        setCallStatus('active');
      } else if (type === 'sdp_answer') {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.sdp));
          setCallStatus('active');
        }
      } else if (type === 'ice_candidate') {
        if (peerConnectionRef.current && payload.candidate) {
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
          } catch (e) {
            console.error("Error adding Ice Candidate:", e);
          }
        }
      } else if (type === 'draw') {
        renderRemoteDrawing(payload);
      } else if (type === 'clear_board') {
        clearCanvasLocalOnly();
      } else if (type === 'end_call') {
        setCallStatus('ended');
        cleanupCallLocalOnly();
      }
    };

    socket.onclose = () => {
      console.log("Signaling socket closed");
    };
  };

  // Setup WebRTC connection and attach media tracks
  const initiateWebRTCPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(iceConfiguration);
    peerConnectionRef.current = pc;

    // Add local tracks to WebRTC
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle remote track events
    pc.ontrack = (event) => {
      console.log("Attached remote stream track");
      const remote = event.streams[0];
      setRemoteStream(remote);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remote;
      }
    };

    // Handle ICE Candidate generation events
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          candidate: event.candidate
        }));
      }
    };

    // If candidate initiator, create SDP offer
    if (user.role === 'recruiter') {
      pc.onnegotiationneeded = async () => {
        try {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketRef.current.send(JSON.stringify({
            type: 'sdp_offer',
            sdp: offer
          }));
        } catch (e) {
          console.error("Error creating SDP Offer:", e);
        }
      };
    }
  };

  // Toggle Audio Mute Track
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // Toggle Video Camera Track
  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  // Toggle Screen Sharing Track
  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        
        // Replace video track in peer connection sender
        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        // Swap local video display object
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Handle stream stop by browser native toolbar
        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Screen share access denied:", err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
    }
    
    // Restore default camera track
    if (localStream && peerConnectionRef.current) {
      const cameraTrack = localStream.getVideoTracks()[0];
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find(s => s.track.kind === 'video');
      if (videoSender && cameraTrack) {
        videoSender.replaceTrack(cameraTrack);
      }
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
    
    setIsScreenSharing(false);
  };

  // Gracefully clear current call sessions
  const handleEndCall = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'end_call' }));
    }
    setCallStatus('ended');
    cleanupCall();
    navigate('/messages');
  };

  const cleanupCall = () => {
    cleanupCallLocalOnly();
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  const cleanupCallLocalOnly = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    setLocalStream(null);
    setRemoteStream(null);
  };

  // Canvas Whiteboard Drawing Handlers
  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      initializeWhiteboardCanvas();
    }
  }, [showWhiteboard]);

  const initializeWhiteboardCanvas = () => {
    const canvas = canvasRef.current;
    
    // Scale for high resolution display pixel ratios
    canvas.width = canvas.parentElement.offsetWidth * 2;
    canvas.height = canvas.parentElement.offsetHeight * 2;
    canvas.style.width = `${canvas.parentElement.offsetWidth}px`;
    canvas.style.height = `${canvas.parentElement.offsetHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;
  };

  // Update canvas brush properties dynamically
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    isDrawingRef.current = true;

    emitDrawEvent(offsetX, offsetY, 'start');
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = getCanvasCoordinates(e);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    emitDrawEvent(offsetX, offsetY, 'drag');
    e.preventDefault();
  };

  const stopDrawing = () => {
    if (!isDrawingRef.current) return;
    contextRef.current.closePath();
    isDrawingRef.current = false;

    emitDrawEvent(0, 0, 'stop');
  };

  const getCanvasCoordinates = (e) => {
    if (e.touches && e.touches.length > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.offsetX,
      offsetY: e.offsetY
    };
  };

  const emitDrawEvent = (x, y, action) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        type: 'draw',
        x,
        y,
        action,
        color: brushColor,
        size: brushSize
      }));
    }
  };

  const renderRemoteDrawing = (payload) => {
    if (!contextRef.current) return;
    const { x, y, action, color, size } = payload;
    
    // Save current brush details
    const tempColor = contextRef.current.strokeStyle;
    const tempSize = contextRef.current.lineWidth;

    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = size;

    if (action === 'start') {
      contextRef.current.beginPath();
      contextRef.current.moveTo(x, y);
    } else if (action === 'drag') {
      contextRef.current.lineTo(x, y);
      contextRef.current.stroke();
    } else if (action === 'stop') {
      contextRef.current.closePath();
    }

    // Restore brush details
    contextRef.current.strokeStyle = tempColor;
    contextRef.current.lineWidth = tempSize;
  };

  const clearCanvas = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'clear_board' }));
    }
    clearCanvasLocalOnly();
  };

  const clearCanvasLocalOnly = () => {
    if (canvasRef.current && contextRef.current) {
      contextRef.current.clearRect(
        0, 0, 
        canvasRef.current.width, 
        canvasRef.current.height
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 h-[85vh] flex flex-col space-y-4">
      
      {/* Upper Status Notifications */}
      <div className="bg-slate-900/40 border border-white/5 px-5 py-3 rounded-2xl flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-[10px] font-bold text-white tracking-widest uppercase">
            {callStatus === 'waiting' && 'Waiting for candidate to join...'}
            {callStatus === 'active' && 'Meeting active • live session'}
            {callStatus === 'connecting' && 'Starting camera feed...'}
            {callStatus === 'ended' && 'Call disconnected'}
            {callStatus === 'failed' && 'Media Device Access Error'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
          <Users size={12} />
          <span>Room: {roomId.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main split display: Whiteboard & Videos */}
      <div className="flex-grow grid lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Collaborative Whiteboard */}
        <AnimatePresence>
          {showWhiteboard && (
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="lg:col-span-6 bg-slate-950/80 border border-white/5 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-905/30">
                <div className="flex items-center space-x-2">
                  <Edit3 size={15} className="text-violet-400" />
                  <span className="text-xs font-bold text-white">Whiteboard Sandbox</span>
                </div>
                <div className="flex items-center space-x-3">
                  
                  {/* Palette picker */}
                  <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-white/5">
                    {['#8b5cf6', '#ef4444', '#10b981', '#ffffff'].map(c => (
                      <button
                        key={c}
                        onClick={() => setBrushColor(c)}
                        className={`w-3.5 h-3.5 rounded-full border transition-all cursor-pointer ${
                          brushColor === c ? 'scale-125 border-white' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>

                  <button 
                    onClick={clearCanvas}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                    title="Clear Board"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Drawing Canvas */}
              <div className="flex-grow bg-slate-950 relative min-h-0 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="absolute inset-0 w-full h-full bg-slate-950"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video feed column */}
        <div className={`h-full flex flex-col justify-between gap-6 ${showWhiteboard ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 gap-6 min-h-0">
            {/* Remote camera viewport */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 space-y-3 z-10">
                  <div className="w-10 h-10 rounded-full bg-violet-650/10 border border-violet-500/25 flex items-center justify-center text-violet-400">
                    <Loader2 size={16} className="animate-spin" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Awaiting opponent media feed...</span>
                </div>
              )}
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-slate-950/70 border border-white/5 rounded-lg text-xxs font-bold text-white uppercase tracking-wider backdrop-blur-sm z-20">
                {opponentName} (Remote)
              </span>
            </div>

            {/* Local camera viewport */}
            <div className="bg-slate-900/60 border border-white/5 rounded-3xl overflow-hidden relative shadow-md flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isCameraOff && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 z-10">
                  <VideoOff size={24} className="text-slate-600" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-2">Camera stream off</span>
                </div>
              )}
              <span className="absolute bottom-4 left-4 px-3 py-1 bg-slate-950/70 border border-white/5 rounded-lg text-xxs font-bold text-white uppercase tracking-wider backdrop-blur-sm z-20">
                {user.email} (You)
              </span>
            </div>
          </div>

          {/* Controls Bar Row */}
          <div className="p-4 bg-slate-900/40 border border-white/5 rounded-3xl flex items-center justify-between backdrop-blur-md shadow-lg">
            <button
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                showWhiteboard 
                  ? 'bg-violet-600 border-violet-500 text-white' 
                  : 'border-white/5 bg-slate-950/40 text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 size={14} />
              <span>{showWhiteboard ? 'Close Board' : 'Open Whiteboard'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isMuted 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white'
                }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>

              <button
                onClick={toggleCamera}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isCameraOff 
                    ? 'bg-red-500/10 border-red-500/20 text-red-400' 
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white'
                }`}
                title={isCameraOff ? 'Turn camera on' : 'Turn camera off'}
              >
                {isCameraOff ? <VideoOff size={16} /> : <Video size={16} />}
              </button>

              <button
                onClick={toggleScreenShare}
                disabled={callStatus !== 'active'}
                className={`p-3 rounded-xl border transition-all cursor-pointer ${
                  isScreenSharing 
                    ? 'bg-violet-600 border-violet-500 text-white' 
                    : 'bg-slate-950/40 border-white/5 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'
                }`}
                title="Screen Share"
              >
                <ScreenShare size={16} />
              </button>
            </div>

            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-550 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <PhoneOff size={14} />
              <span>Leave Room</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
