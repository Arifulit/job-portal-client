import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;

    if (isFormData) {
      // Let browser/axios set multipart boundary automatically.
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    } else {
      config.headers = config.headers || {};
      if (!config.headers['Content-Type']) {
        config.headers['Content-Type'] = 'application/json';
      }
    }

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

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      const hadToken = !!localStorage.getItem('token');
      const currentPath = window.location.pathname;
      const isProtectedRoute =
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/recruiter') ||
        currentPath.startsWith('/candidate') ||
        currentPath.startsWith('/user');

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect only when an existing session becomes invalid.
      // Public pages can receive 401 for guest requests and should not force-login.
      if (hadToken && isProtectedRoute) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || 'An error occurred';
  }

  if (error instanceof Error) {
    return error.message || 'An error occurred';
  }

  return 'An unexpected error occurred';
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'career-code';

  if (!cloudName) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME in your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData
    );
    return response.data.secure_url;
  } catch {
    throw new Error('Failed to upload file');
  }
};

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api(config);
  return response.data;
};
