import { useMutation } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';

export interface CandidateRankInput {
  jobDescription: string;
  candidates: Array<{
    applicationId?: string;
    candidateId?: string;
    name: string;
    email?: string;
    resumeUrl?: string;
    summary?: string;
    skills: string[];
    experience?: number;
  }>;
}

export interface RankedCandidate {
  applicationId?: string;
  candidateId?: string;
  name: string;
  email?: string;
  resumeUrl?: string;
  summary?: string;
  score: number;
  matchedSkills?: string[];
  experience?: number;
}

export interface CandidateRankResponse {
  success: boolean;
  rankedCandidates: RankedCandidate[];
}

export const rankCandidates = async (input: CandidateRankInput): Promise<CandidateRankResponse> => {
  try {
    const response = await api.post<CandidateRankResponse>('/candidate/candidates/rank', input);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const useRankCandidates = () => {
  return useMutation({ mutationFn: rankCandidates });
};
