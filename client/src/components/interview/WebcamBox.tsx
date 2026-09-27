// components/interview/WebcamBox.tsx

import React, { useEffect, useRef, useState } from 'react';

interface WebcamBoxProps {
  isCameraOn: boolean;    // parent (ControlButtons) se control hoga
  isMicOn: boolean;       // sirf mic indicator dikhane ke liye, actual audio control hook me hai
  candidateName?: string; // niche corner me naam label ke liye
}

type StreamStatus = 'idle' | 'loading' | 'ready' | 'denied' | 'error';

const WebcamBox: React.FC<WebcamBoxProps> = ({ isCameraOn, isMicOn, candidateName }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<StreamStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const stopStream = () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const startStream = async () => {
      setStatus('loading');
      setErrorMessage(null);
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false, // audio yahan se nahi lena, useMicrophone hook alag se handle karega
        });

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err: any) {
        if (cancelled) return;
        if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
          setStatus('denied');
          setErrorMessage('Camera access denied. Please allow camera permission in your browser.');
        } else {
          setStatus('error');
          setErrorMessage('Unable to access camera. Please check your device and try again.');
        }
      }
    };

    if (isCameraOn) {
      startStream();
    } else {
      stopStream();
      setStatus('idle');
    }

    return () => {
      cancelled = true;
      stopStream();
    };
  }, [isCameraOn]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-sm">
      {/* Video feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover ${status === 'ready' ? 'block' : 'hidden'}`}
      />

      {/* Camera off state */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M9.75 9.75a3 3 0 104.5 4.5M15 10.5V7.5A2.5 2.5 0 0012.5 5h-6A2.5 2.5 0 004 7.5v9A2.5 2.5 0 006.5 19h4" />
          </svg>
          <span className="text-sm">Camera is off</span>
        </div>
      )}

      {/* Loading state */}
      {isCameraOn && status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-300">
          <div className="w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Starting camera...</span>
        </div>
      )}

      {/* Error / denied state */}
      {isCameraOn && (status === 'denied' || status === 'error') && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-red-300">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm">{errorMessage}</span>
        </div>
      )}

      {/* Mic status badge */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
        <span className={`w-2 h-2 rounded-full ${isMicOn ? 'bg-emerald-400' : 'bg-red-400'}`} />
        <span className="text-xs text-white">{isMicOn ? 'Mic on' : 'Mic muted'}</span>
      </div>

      {/* Candidate name label */}
      {candidateName && (
        <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
          <span className="text-xs text-white font-medium">{candidateName}</span>
        </div>
      )}
    </div>
  );
};

export default WebcamBox;