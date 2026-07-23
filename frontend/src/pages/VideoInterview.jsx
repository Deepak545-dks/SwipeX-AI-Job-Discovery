import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Mic, MicOff, Video, VideoOff, ScreenShare, 
  PhoneOff, Edit3, Trash2, ShieldAlert, Users, 
  Maximize2, Share2, Palette, Sparkles, Loader2 
} from 'lucide-react';

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
      } else if (type === 'hangup') {
        setCallStatus('ended');
        setTimeout(() => navigate('/messages'), 1500);
      }
    };

    socket.onclose = () => {
      console.log("Signaling WebSocket closed.");
    };
  };

  // Configure Peer Connection and add local media tracks
  const initiateWebRTCPeerConnection = (stream) => {
    const pc = new RTCPeerConnection(iceConfiguration);
    peerConnectionRef.current = pc;

    // Add local tracks to WebRTC
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
    });

    // Handle incoming remote media stream tracks
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
      setCallStatus('active');
    };

    // Emit ICE candidates via signaling WS
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({
          type: 'ice_candidate',
          candidate: event.candidate
        }));
      }
    };

    // If recruiter, create and send SDP offer
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
          console.error("Error generating offer:", e);
        }
      };
    }
  };

  // Call Control modifiers
  const toggleMute = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCamera = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOff(!videoTrack.enabled);
      }
    }
  };

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;

        if (peerConnectionRef.current) {
          const senders = peerConnectionRef.current.getSenders();
          const videoSender = senders.find(s => s.track.kind === 'video');
          if (videoSender) {
            videoSender.replaceTrack(screenTrack);
          }
        }

        // Binds stop callback
        screenTrack.onended = () => {
          stopScreenSharing();
        };

        setIsScreenSharing(true);
      } catch (err) {
        console.error("Failed to share screen:", err);
      }
    } else {
      stopScreenSharing();
    }
  };

  const stopScreenSharing = () => {
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }

    if (localStream && peerConnectionRef.current) {
      const videoTrack = localStream.getVideoTracks()[0];
      const senders = peerConnectionRef.current.getSenders();
      const videoSender = senders.find(s => s.track.kind === 'video');
      if (videoSender && videoTrack) {
        videoSender.replaceTrack(videoTrack);
      }
    }

    setIsScreenSharing(false);
  };

  const handleHangup = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'hangup' }));
    }
    setCallStatus('ended');
    setTimeout(() => navigate('/messages'), 1000);
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
    }
    if (socketRef.current) {
      socketRef.current.close();
    }
  };

  // Interactive Whiteboard drawing stream handlers
  useEffect(() => {
    if (showWhiteboard && canvasRef.current) {
      initCanvas();
    }
  }, [showWhiteboard]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    canvas.width = canvas.parentElement.clientWidth * 2;
    canvas.height = canvas.parentElement.clientHeight * 2;
    canvas.style.width = `${canvas.parentElement.clientWidth}px`;
    canvas.style.height = `${canvas.parentElement.clientHeight}px`;

    const context = canvas.getContext("2d");
    context.scale(2, 2);
    context.lineCap = "round";
    context.strokeStyle = brushColor;
    context.lineWidth = brushSize;
    contextRef.current = context;
  };

  // Update brush values
  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = brushColor;
      contextRef.current.lineWidth = brushSize;
    }
  }, [brushColor, brushSize]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = getCanvasCoordinates(nativeEvent);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    isDrawingRef.current = true;

    emitDrawEvent(offsetX, offsetY, 'start');
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawingRef.current) return;
    const { offsetX, offsetY } = getCanvasCoordinates(nativeEvent);
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();

    emitDrawEvent(offsetX, offsetY, 'drag');
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
      <div className="bg-slate-900/60 border border-slate-850 px-5 py-3 rounded-2xl flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <p className="text-xs font-black text-white tracking-wider uppercase">
            {callStatus === 'waiting' && 'Waiting for opponent to connect...'}
            {callStatus === 'active' && 'Call connected • Live Interview'}
            {callStatus === 'connecting' && 'Opening camera streams...'}
            {callStatus === 'ended' && 'Meeting Ended'}
            {callStatus === 'failed' && 'Media Device Permissions Failed'}
          </p>
        </div>
        <div className="flex items-center space-x-2 text-slate-400 text-xxs font-bold">
          <Users size={14} />
          <span>Room: {roomId.slice(0, 8)}</span>
        </div>
      </div>

      {/* Main split display: Whiteboard & Videos */}
      <div className="flex-grow grid lg:grid-cols-12 gap-6 min-h-0">
        
        {/* Collaborative Whiteboard */}
        {showWhiteboard && (
          <div className="lg:col-span-6 bg-slate-950/80 border border-slate-850 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/40">
              <div className="flex items-center space-x-2">
                <Edit3 size={16} className="text-violet-400" />
                <span className="text-xs font-bold text-white">Interactive Whiteboard</span>
              </div>
              <div className="flex items-center space-x-3">
                
                {/* Palette picker */}
                <div className="flex items-center space-x-1.5 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
                  {['#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ffffff'].map(c => (
                    <button
                      key={c}
                      onClick={() => setBrushColor(c)}
                      className={`w-4.5 h-4.5 rounded-full border transition-all ${
                        brushColor === c ? 'scale-125 border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>

                <button 
                  onClick={clearCanvas}
                  className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  title="Clear Whiteboard"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Drawing Canvas */}
            <div className="flex-grow bg-white/95 relative min-h-0 cursor-crosshair">
              <canvas
                ref={canvasRef}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        )}

        {/* Video Streams panel */}
        <div className={`flex flex-col min-h-0 bg-slate-900/30 border border-slate-850 rounded-3xl overflow-hidden shadow-2xl ${
          showWhiteboard ? 'lg:col-span-6' : 'lg:col-span-12'
        }`}>
          
          <div className="flex-grow grid grid-rows-2 sm:grid-rows-1 sm:grid-cols-2 gap-4 p-4 min-h-0 relative">
            
            {/* Remote Opponent Stream */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden relative flex items-center justify-center">
              {remoteStream ? (
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center mx-auto text-slate-500 border border-slate-800 animate-pulse">
                    <Loader2 size={24} className="animate-spin text-violet-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">{opponentName}</h4>
                    <p className="text-slate-500 text-xxs mt-0.5">Awaiting WebRTC signaling link...</p>
                  </div>
                </div>
              )}
              <span className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-850 text-xxs font-bold text-slate-300">
                {opponentName}
              </span>
            </div>

            {/* Local Video Stream */}
            <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden relative flex items-center justify-center">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {isCameraOff && (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center text-slate-500">
                  <VideoOff size={32} />
                </div>
              )}
              <span className="absolute bottom-4 left-4 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-850 text-xxs font-bold text-slate-300">
                You {isMuted && '• Muted'}
              </span>
            </div>

          </div>

          {/* Bottom Meeting Control Panel */}
          <div className="p-5 border-t border-slate-850 bg-slate-950/50 flex flex-wrap items-center justify-center gap-4">
            
            <button
              onClick={toggleMute}
              className={`p-3.5 rounded-xl border transition-all ${
                isMuted 
                  ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            <button
              onClick={toggleCamera}
              className={`p-3.5 rounded-xl border transition-all ${
                isCameraOff 
                  ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={isCameraOff ? "Turn Video On" : "Turn Video Off"}
            >
              {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
            </button>

            <button
              onClick={toggleScreenShare}
              className={`p-3.5 rounded-xl border transition-all ${
                isScreenSharing 
                  ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Share Screen"
            >
              <ScreenShare size={20} />
            </button>

            <button
              onClick={() => setShowWhiteboard(!showWhiteboard)}
              className={`p-3.5 rounded-xl border transition-all ${
                showWhiteboard 
                  ? 'bg-violet-600 border-violet-500 text-white hover:bg-violet-500' 
                  : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title="Toggle Whiteboard"
            >
              <Edit3 size={20} />
            </button>

            <div className="w-px h-8 bg-slate-800 mx-2" />

            <button
              onClick={handleHangup}
              className="p-3.5 bg-red-650 hover:bg-red-550 border border-red-600/30 text-white rounded-xl transition-all shadow-lg shadow-red-500/10"
              title="Hang Up"
            >
              <PhoneOff size={20} />
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}
