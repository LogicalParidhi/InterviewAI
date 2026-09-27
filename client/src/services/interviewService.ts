// services/interviewService.ts

import type {
  ApiResponse,
  InterviewSession,
  InterviewResult,
  InterviewAnswer,
} from '../types/interview';

// Backend base URL — .env se aayega ideally (VITE_API_BASE_URL / REACT_APP_API_BASE_URL)
const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const INTERVIEWS_URL = `${API_BASE_URL}/interviews`;

// ==========================================
// Internal helper: fetch wrapper with error handling
// ==========================================
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'Something went wrong. Please try again.');
  }

  return json.data as T;
}

// ==========================================
// 1. Create Interview  (Resume Upload -> Interview Setup)
// ==========================================
export interface CreateInterviewPayload {
  candidateName: string;
  candidateEmail?: string;
  resumeUrl?: string;
  resumeFileName?: string;
  jobRole?: string;
  difficulty?: string;
  interviewType?: string;
  duration?: number;
}

export async function createInterview(
  payload: CreateInterviewPayload
): Promise<InterviewSession> {
  return request<InterviewSession>(INTERVIEWS_URL, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ==========================================
// 2. Get single interview by id
// ==========================================
export async function getInterview(interviewId: string): Promise<InterviewSession> {
  return request<InterviewSession>(`${INTERVIEWS_URL}/${interviewId}`);
}

// ==========================================
// 3. List interviews (admin/dashboard)
// ==========================================
export interface ListInterviewsResult {
  items: InterviewSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function listInterviews(
  page = 1,
  limit = 20
): Promise<ListInterviewsResult> {
  return request<ListInterviewsResult>(
    `${INTERVIEWS_URL}?page=${page}&limit=${limit}`
  );
}

// ==========================================
// 4. Start interview (Interview Setup -> Live Interview)
// ==========================================
export async function startInterview(interviewId: string): Promise<InterviewSession> {
  return request<InterviewSession>(`${INTERVIEWS_URL}/${interviewId}/start`, {
    method: 'PATCH',
  });
}

// ==========================================
// 5. Submit answer for current question
// ==========================================
export type SubmitAnswerPayload = Omit<InterviewAnswer, 'durationSeconds'>;

export async function submitAnswer(
  interviewId: string,
  payload: SubmitAnswerPayload
): Promise<InterviewSession> {
  return request<InterviewSession>(`${INTERVIEWS_URL}/${interviewId}/answers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// ==========================================
// 6. End interview early
// ==========================================
export async function endInterview(interviewId: string): Promise<InterviewSession> {
  return request<InterviewSession>(`${INTERVIEWS_URL}/${interviewId}/end`, {
    method: 'PATCH',
  });
}

// ==========================================
// 7. Get interview result/summary
// ==========================================
export async function getInterviewResult(
  interviewId: string
): Promise<InterviewResult> {
  return request<InterviewResult>(`${INTERVIEWS_URL}/${interviewId}/result`);
}

// ==========================================
// Grouped export (agar `interviewService.xyz()` style pasand ho)
// ==========================================
const interviewService = {
  createInterview,
  getInterview,
  listInterviews,
  startInterview,
  submitAnswer,
  endInterview,
  getInterviewResult,
};

export default interviewService;