export const getApiUrl = (): string => {
  // In development, use the VITE_API_BASE_URL from .env
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  }
  // In production, use the relative path
  return '/api/v1';
};
