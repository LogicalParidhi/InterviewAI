// services/dashboardService.ts

import type { DashboardStats, RecentInterview, InterviewReport } from '../types/dashboard';
import type { ApiResponse } from '../types/interview';

const API_BASE_URL =
  (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api';

const DASHBOARD_URL = `${API_BASE_URL}/dashboard`;

// ==========================================
// Internal helper: fetch wrapper with error handling
// ==========================================
async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });

  const json: ApiResponse<T> = await res.json();

  if (!res.ok || !json.success) {
    throw new Error(json.error || json.message || 'Something went wrong.');
  }

  return json.data as T;
}

// ==========================================
// 1. Get Dashboard Stats
// ==========================================
export async function getStats(): Promise<DashboardStats> {
  return request<DashboardStats>(`${DASHBOARD_URL}/stats`);
}

// ==========================================
// 2. Get Recent Interviews
// ==========================================
export async function getRecentInterviews(limit = 5): Promise<RecentInterview[]> {
  return request<RecentInterview[]>(`${DASHBOARD_URL}/recent?limit=${limit}`);
}

// ==========================================
// 3. Get Full Interview Report
// ==========================================
export async function getInterviewReport(id: string): Promise<InterviewReport> {
  return request<InterviewReport>(`${DASHBOARD_URL}/report/${id}`);
}

// ==========================================
// Grouped export
// ==========================================
const dashboardService = {
  getStats,
  getRecentInterviews,
  getInterviewReport,
};

export default dashboardService;
