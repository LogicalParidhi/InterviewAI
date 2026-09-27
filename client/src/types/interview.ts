// types/interview.ts

// ==========================================
// 1. INTERVIEW STATUS / FLOW STATES
// ==========================================
export type InterviewStatus =
  | 'idle'            // Interview shuru nahi hui
  | 'setup'           // Interview Setup screen (camera/mic check)
  | 'in_progress'     // Live Interview chal rahi hai
  | 'paused'          // User ne pause kiya (agar future me allow karein)
  | 'completed'       // Sab questions ho gaye
  | 'ended_early';    // User ne beech me end kar diya

// ==========================================
// 2. RESUME UPLOAD (Step before Interview Setup)
// ==========================================
export interface ResumeUploadData {
  fileName: string;
  fileUrl?: string;       // backend se aayega upload ke baad
  uploadedAt?: string;    // ISO date string
  candidateName?: string;
  candidateEmail?: string;
}

// ==========================================
// 3. HARDCODED QUESTIONS
// ==========================================
export type QuestionCategory =
  | 'introduction'
  | 'technical'
  | 'behavioral'
  | 'situational'
  | 'closing';

export interface Question {
  id: string;                 // unique id, e.g. "q1"
  text: string;                // actual question text
  category: QuestionCategory;
  timeLimitSeconds: number;    // is question ke liye kitna time allowed hai
  order: number;                // question ka sequence number
}

// ==========================================
// 4. INTERVIEW SETUP (camera/mic permission state before going live)
// ==========================================
export interface DeviceCheckStatus {
  cameraAllowed: boolean;
  microphoneAllowed: boolean;
  cameraError?: string | null;
  microphoneError?: string | null;
}

export interface InterviewSetupState {
  resume: ResumeUploadData | null;
  deviceCheck: DeviceCheckStatus;
  isReadyToStart: boolean;
}

// ==========================================
// 5. LIVE INTERVIEW SESSION
// ==========================================
export interface InterviewAnswer {
  questionId: string;
  answerText?: string;         // agar transcription store karni ho
  videoChunkUrl?: string;      // recorded answer ka url (future use)
  startedAt: string;           // ISO timestamp
  endedAt?: string;            // ISO timestamp
  durationSeconds?: number;
  score?: number;
  justification?: string;
  improvementTips?: string[];
}

export interface InterviewSession {
  id: string;                       // interview session id (backend se)
  candidateName?: string;
  candidateEmail?: string;
  jobRole?: string;
  difficulty?: string;
  interviewType?: string;
  duration?: number;
  status: InterviewStatus;
  questions: Question[];
  currentQuestionIndex: number;     // kaunsa question chal raha hai
  answers: InterviewAnswer[];
  startedAt?: string;
  endedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// 6. TIMER (per question + overall)
// ==========================================
export interface TimerState {
  remainingSeconds: number;
  totalSeconds: number;
  isRunning: boolean;
}

// ==========================================
// 7. CONTROL ACTIONS (buttons ke liye)
// ==========================================
export type InterviewControlAction =
  | 'next_question'
  | 'skip_question'
  | 'end_interview'
  | 'toggle_camera'
  | 'toggle_microphone';

// ==========================================
// 8. END INTERVIEW / RESULT SUMMARY
// ==========================================
export interface InterviewResult {
  sessionId: string;
  candidateName?: string;
  totalQuestions: number;
  answeredQuestions: number;
  skippedQuestions: number;
  totalDurationSeconds: number;
  completedAt: string;
}

// ==========================================
// 9. API RESPONSE WRAPPER (services ke liye common type)
// ==========================================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
