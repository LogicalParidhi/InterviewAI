// components/interview/ControlButtons.tsx

import React from 'react';
import type { InterviewControlAction } from '../../types/interview';

interface ControlButtonsProps {
  isCameraOn: boolean;
  isMicOn: boolean;
  isLastQuestion: boolean;
  onAction: (action: InterviewControlAction) => void;
}

const ControlButtons: React.FC<ControlButtonsProps> = ({
  isCameraOn,
  isMicOn,
  isLastQuestion,
  onAction,
}) => {
  return (
    <div className="w-full max-w-2xl flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl shadow-sm px-4 py-3 sm:px-6">
      {/* Left: device toggles */}
      <div className="flex items-center gap-2">
        {/* Camera toggle */}
        <button
          type="button"
          onClick={() => onAction('toggle_camera')}
          aria-pressed={isCameraOn}
          aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
          className={`flex items-center justify-center w-11 h-11 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${
            isCameraOn
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          {isCameraOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5V7.5A2.5 2.5 0 0012.5 5h-6A2.5 2.5 0 004 7.5v9A2.5 2.5 0 006.5 19h6a2.5 2.5 0 002.5-2.5v-3m0 0l4.5 3.5v-11L15 10.5z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M15 10.5V7.5A2.5 2.5 0 0012.5 5h-6c-.47 0-.91.12-1.29.33M4 7.5v9A2.5 2.5 0 006.5 19h6c.47 0 .91-.12 1.29-.33M19.5 15.5v-7L15 10.5" />
            </svg>
          )}
        </button>

        {/* Mic toggle */}
        <button
          type="button"
          onClick={() => onAction('toggle_microphone')}
          aria-pressed={isMicOn}
          aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
          className={`flex items-center justify-center w-11 h-11 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 ${
            isMicOn
              ? 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              : 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100'
          }`}
        >
          {isMicOn ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a4 4 0 004-4V6a4 4 0 10-8 0v8.75a4 4 0 004 4zm0 0V21m-4-6.25a4 4 0 004 4" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 11v1.75a5.5 5.5 0 0011 0V11" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M12 18.75a4 4 0 004-4v-2M8 6a4 4 0 018 0v3m-.5 5.5V6" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 11v1.75c0 .8.16 1.55.44 2.25M12 21v-2.25" />
            </svg>
          )}
        </button>
      </div>

      {/* Right: flow actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onAction('skip_question')}
          className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
        >
          Skip
        </button>

        <button
          type="button"
          onClick={() => onAction(isLastQuestion ? 'end_interview' : 'next_question')}
          className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900"
        >
          {isLastQuestion ? 'Finish Interview' : 'Next Question'}
        </button>

        <button
          type="button"
          onClick={() => onAction('end_interview')}
          className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          End
        </button>
      </div>
    </div>
  );
};

export default ControlButtons;
