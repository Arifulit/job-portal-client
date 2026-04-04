import { api } from '@/utils/api';
import axios from 'axios';

export interface RecruiterProfileUpdatePayload {
  name?: string;
  phone?: string;
  designation?: string;
  bio?: string;
}

export interface RecruiterAgencyPayload {
  name: string;
  website?: string;
  description?: string;
}

type ProfilePayload = {
  success?: boolean;
  data?: unknown;
  user?: unknown;
};

const parseProfileData = (payload: ProfilePayload): unknown => {
  if (payload?.data && typeof payload.data === 'object') {
    return payload.data;
  }

  if (payload?.user && typeof payload.user === 'object') {
    return payload.user;
  }

  return payload?.data ?? payload?.user ?? null;
};

const profileGetEndpoints = ['/recruiter/profile', '/users/profile', '/auth/me'];
const profileUpdateEndpoints = ['/recruiter/profile', '/users/profile'];

const recruiterService = {
  getRecruiterProfile: async () => {
    let lastError: unknown;

    for (const endpoint of profileGetEndpoints) {
      try {
        const response = await api.get(endpoint);
        const payload = response.data as ProfilePayload;

        return {
          success: payload?.success ?? true,
          data: parseProfileData(payload),
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    console.error('Error fetching recruiter profile:', lastError);
    throw lastError;
  },

  updateRecruiterProfile: async (payload: RecruiterProfileUpdatePayload) => {
    let lastError: unknown;

    for (const endpoint of profileUpdateEndpoints) {
      try {
        const response = await api.put(endpoint, payload);
        const responsePayload = response.data as ProfilePayload;

        return {
          success: responsePayload?.success ?? true,
          data: parseProfileData(responsePayload),
        };
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          lastError = error;
          continue;
        }

        throw error;
      }
    }

    console.error('Error updating recruiter profile:', lastError);
    throw lastError;
  },

  createRecruiterAgency: async (payload: RecruiterAgencyPayload) => {
    try {
      const response = await api.post('/recruiter/agency', payload);
      return response.data;
    } catch (error) {
      console.error('Error creating recruiter agency:', error);
      throw error;
    }
  },

  getRecruiterAgencyById: async (agencyId: string) => {
    try {
      const response = await api.get(`/recruiter/agency/${agencyId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter agency:', error);
      throw error;
    }
  },
};

export default recruiterService;
