// এই ফাইলটি environment/configuration value expose ও manage করে।
const config = {
  baseUrl: import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL,
};

export default config;
