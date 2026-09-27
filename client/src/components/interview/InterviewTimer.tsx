// components/interview/InterviewTimer.tsx

import React, { useEffect, useRef, useState } from 'react';

interface InterviewTimerProps {
  totalSeconds: number;       // question ka time limit
  isRunning: boolean;         // parent control karega ki timer chale ya ruke
  onTimeUp: () => void;       // jab time khatam ho jaye tab call hoga
  resetKey?: string | number; // question change hone par timer reset karne ke liye (e.g. question.id)
}

const InterviewTimer: React.FC<InterviewTimerProps> = ({
  totalSeconds,
  isRunning,
  onTimeUp,
  resetKey,
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(totalSeconds);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // hamesha latest callback use ho, stale closure na ho
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // jab question badle (resetKey change ho) ya totalSeconds badle, timer reset karo
  useEffect(() => {
    setRemainingSeconds(totalSeconds);
  }, [resetKey, totalSeconds]);

  // countdown logic
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, resetKey]);

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const percentLeft = totalSeconds > 0 ? (remainingSeconds / totalSeconds) * 100 : 0;

  const isLow = percentLeft <= 20;
  const isMid = percentLeft > 20 && percentLeft <= 50;

  const ringColor = isLow ? 'text-red-500' : isMid ? 'text-amber-500' : 'text-emerald-500';
  const textColor = isLow ? 'text-red-600' : 'text-slate-900';

  return (
    <div className="flex items-center gap-3">
      {/* circular progress ring */}
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-slate-100"
          />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 24}
            strokeDashoffset={2 * Math.PI * 24 * (1 - percentLeft / 100)}
            className={`${ringColor} transition-all duration-1000 ease-linear`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-semibold ${textColor}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="flex flex-col">
        <span className={`text-sm font-medium ${isLow ? 'text-red-600' : 'text-slate-500'}`}>
          {isLow ? 'Time almost up' : 'Time remaining'}
        </span>
        <span className="text-xs text-slate-400">
          {minutes}m {seconds.toString().padStart(2, '0')}s left
        </span>
      </div>
    </div>
  );
};

export default InterviewTimer;
