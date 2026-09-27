import axios from 'axios';
import type { AxiosProgressEvent } from 'axios';
import type { ResumeData } from '../types/resume';

/**
 * Isolated Axios instance for the resume API.
 * Swap baseURL via env var once the Express backend exists —
 * no changes needed in any component that consumes this service.
 */
const resumeApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api',
});

resumeApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface UploadResumeResponse {
  resume: ResumeData;
}

interface GetMyResumeResponse {
  resume: ResumeData;
}

/**
 * POST /api/resume/upload
 * Uploads a single PDF resume as multipart/form-data and reports
 * progress back to the caller for a progress bar UI.
 */
export const uploadResume = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<ResumeData> => {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await resumeApi.post<UploadResumeResponse>('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (onProgress && event.total) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });

  return response.data.resume;
};

/**
 * GET /api/resume/me
 * Fetches the current user's resume, if one has been uploaded.
 * Returns null (rather than throwing) when none exists yet.
 */
export const getMyResume = async (): Promise<ResumeData | null> => {
  try {
    const response = await resumeApi.get<GetMyResumeResponse>('/resume/me');
    return response.data.resume;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Normalizes Axios/network errors into a user-facing message.
 */
export const getResumeErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
    if (serverMessage) return serverMessage;
    if (error.code === 'ERR_NETWORK') return "Couldn't reach the server. Check your connection and try again.";
    if (error.response?.status === 413) return 'File is too large for the server to accept.';
    return 'Upload failed. Please try again.';
  }
  return 'Something went wrong. Please try again.';
};

export default { uploadResume, getMyResume, getResumeErrorMessage };