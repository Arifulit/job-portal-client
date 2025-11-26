import axios from 'axios';
import { getApiUrl } from '@/lib/api';

const API_URL = getApiUrl();

const recruiterService = {
  getRecruiterProfile: async () => {
    try {
      const response = await axios.get(`${API_URL}/recruiter/profile`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter profile:', error);
      throw error;
    }
  },
};

export default recruiterService;
