// এই ফাইলটি shared utility/helper বা low level integration function রাখে।
export const getApiUrl = (): string => {
  // In development, use the API URL from environment variables.
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  }
  // In production, use the relative path
  return '/api/v1';
};
