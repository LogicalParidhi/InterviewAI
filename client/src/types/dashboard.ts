// types/dashboard.ts

// ==========================================
// Dashboard Stats (top cards)
// ==========================================
export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;   // 0-100
  bestScore: number;      // 0-100
  totalPracticeMinutes: number;
}

// ==========================================
// Recent Interview (dashboard card)
// ==========================================
export interface RecentInterview {
  _id: string;
  jobRole: string;
  interviewType: string;
  difficulty: string;
  date: string;           // ISO date
  score: number;          // 0-100
  status: string;
  questionsCount: number;
}

// ==========================================
// Sub-category scores (report breakdown)
// ==========================================
export interface SubScores {
  technical: number | null;
  communication: number | null;
  grammar: number | null;
  confidence: number | null;
  problemSolving: number | null;
}

// ==========================================
// Per-question report detail
// ==========================================
export interface QuestionReport {
  id: string;
  text: string;
  category: string;
  order: number;
  answer: {
    answerText: string;
    score: number | null;
    justification: string;
    improvementTips: string[];
    durationSeconds: number;
  } | null;
}

// ==========================================
// Full Interview Report
// ==========================================
export interface InterviewReport {
  _id: string;
  jobRole: string;
  interviewType: string;
  difficulty: string;
  date: string;
  durationMinutes: number;
  status: string;
  overallScore: number;   // 0-100
  subScores: SubScores;
  questions: QuestionReport[];
  candidateName: string;
}
