import axios from 'axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    email: string;
    token: string;
  };
}

export interface ProfileResponse {
  success: boolean;
  data: User;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Set up Axios instance with base URL and authorization interceptor
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
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

export const authService = {
  register: async (registerData: any): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', registerData);
    return response.data;
  },

  login: async (loginData: any): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', loginData);
    return response.data;
  },

  googleLogin: async (credential: string): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/google', { credential });
    return response.data;
  },

  getMe: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get<ProfileResponse>('/auth/me');
    return response.data;
  },
  requestPasswordReset: async (identifier: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post('/auth/password-reset/request', { identifier });
    return response.data;
  },
  resetPassword: async (payload: { identifier: string; code: string; password: string }): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>('/auth/password-reset/confirm', payload);
    return response.data;
  },
};

export default authService;
