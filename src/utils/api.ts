// এই ফাইলটি project wide helper, route utility অথবা shared function প্রদান করে।
import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import Cookies from 'js-cookie';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

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

    const token = Cookies.get('accessToken') || localStorage.getItem('token');
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
      const hadToken = !!(Cookies.get('accessToken') || localStorage.getItem('token'));
      const currentPath = window.location.pathname;
      const isProtectedRoute =
        currentPath.startsWith('/admin') ||
        currentPath.startsWith('/recruiter') ||
        currentPath.startsWith('/candidate') ||
        currentPath.startsWith('/user');

      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');

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

export const uploadToCloudinary = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'career-code';

  if (!cloudName) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME in your .env file.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    // Create a separate axios instance and ensure no Authorization header is sent
    // (some code paths set axios.defaults.headers.common.Authorization). We must
    // explicitly clear it on the instance to avoid CORS preflight failures.
    const cloudinaryAxios = axios.create();
    // remove any preconfigured common auth header on the new instance
    try {
      if (cloudinaryAxios.defaults && cloudinaryAxios.defaults.headers && cloudinaryAxios.defaults.headers.common) {
        delete cloudinaryAxios.defaults.headers.common.Authorization;
      }
    } catch {
      /* ignore */
    }

    const response = await cloudinaryAxios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      formData,
      {
        headers: {
          // Explicitly not setting Authorization header for Cloudinary
          'X-Requested-With': 'XMLHttpRequest',
          // ensure request-level override
          Authorization: undefined,
        },
        onUploadProgress: (event) => {
          if (!event.total) return;
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress?.(Math.min(100, Math.max(0, progress)));
        },
      }
    );
    return response.data.secure_url;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to upload file to Cloudinary';
    throw new Error(message);
  }
};

type ResumeUploadResponse = {
  success?: boolean;
  message?: string;
  data?: {
    downloadUrl?: string;
    fileUrl?: string;
    sourceUrl?: string;
    resumeUrl?: string;
    url?: string;
  };
};

export const uploadResumeToBackend = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('resume', file);

  try {
    const response = await api.post<ResumeUploadResponse>('/candidate/resume', formData, {
      onUploadProgress: (event) => {
        if (!event.total) return;
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress?.(Math.min(100, Math.max(0, progress)));
      },
    });
    const payload = response.data;

    if (payload.success === false) {
      throw new Error(payload.message || 'Failed to upload resume');
    }

    const resumeUrl =
      payload.data?.downloadUrl ||
      payload.data?.fileUrl ||
      payload.data?.sourceUrl ||
      payload.data?.resumeUrl ||
      payload.data?.url;

    if (!resumeUrl) {
      throw new Error(payload.message || 'Resume upload response did not include a file URL');
    }

    return resumeUrl;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload resume');
    }

    throw error instanceof Error ? error : new Error('Failed to upload resume');
  }
};

export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await api(config);
  return response.data;
};
