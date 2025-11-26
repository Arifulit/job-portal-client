import { useQuery } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { CandidateProfileResponse } from '../types/candidate';

export const useCandidateProfile = () => {
  return useQuery<CandidateProfileResponse, Error>({
    queryKey: ['candidate-profile'],
    queryFn: async () => {
      try {
        const response = await api.get<CandidateProfileResponse>('/candidate/profile');
        return response.data;
      } catch (error) {
        throw handleApiError(error);
      }
    },
  });
};
