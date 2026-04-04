import { api } from '@/utils/api';
import axios from 'axios';

export interface RecruiterProfileUpdatePayload {
  name: string;
  phone: string;
  designation: string;
  location?: string;
  biodata?: string;
  bio?: string;
}

export interface RecruiterAgencyPayload {
  name: string;
  website?: string;
  description?: string;
}

type ProfilePayload = {
  success?: boolean;
  data?: {
    user?: unknown;
    profile?: unknown;
  } | unknown;
  user?: unknown;
};

const parseProfileData = (payload: ProfilePayload): unknown => {
  if (payload?.data && typeof payload.data === 'object') {
    const data = payload.data as Record<string, unknown>;

    // If response already contains recruiter profile fields, return full data object.
    if (
      '_id' in data ||
      'designation' in data ||
      'phone' in data ||
      'agency' in data ||
      'company' in data ||
      'biodata' in data
    ) {
      return payload.data;
    }

    if ('profile' in data && data.profile && typeof data.profile === 'object') {
      return data.profile;
    }

    if (
      'user' in data &&
      data.user &&
      typeof data.user === 'object' &&
      Object.keys(data).length === 1
    ) {
      return data.user;
    }

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
