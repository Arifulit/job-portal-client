import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { CandidateProfileResponse } from '../types/candidate';

export interface UpdateCandidateProfileData {
  name?: string;
  phone?: string;
  headline?: string;
  location?: string;
  address?: string;
  biodata?: string;
  bio?: string;
  experienceLevel?: string;
  summary?: string;
  skills?: string[];
}

export interface RecommendedJob {
  _id: string;
  title: string;
  location: string;
  jobType: string;
  experienceLevel: string;
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  deadline?: string;
  company?: string | null;
  relevanceScore?: number;
}

interface CandidateRecommendationsResponse {
  success: boolean;
  message: string;
  count: number;
  data: RecommendedJob[];
}

export const useCandidateProfile = () => {
  return useQuery<CandidateProfileResponse, Error>({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      try {
        const response = await api.get<CandidateProfileResponse>('/candidate/profile');
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  });
};

export const useUpdateCandidateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation<CandidateProfileResponse, Error, UpdateCandidateProfileData>({
    mutationFn: async (data) => {
      try {
        const response = await api.put<CandidateProfileResponse>('/candidate/profile', data);
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['candidate-profile'] });
    },
  });
};

export const useCandidateRecommendations = (limit = 10, enabled = true) => {
  return useQuery<RecommendedJob[], Error>({
    queryKey: ['candidate-recommendations', limit],
    enabled,
    queryFn: async () => {
      try {
        const response = await api.get<CandidateRecommendationsResponse>(
          `/candidate/profile/recommendations?limit=${limit}`
        );

        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to fetch recommendations');
        }

        return response.data.data || [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  });
};
