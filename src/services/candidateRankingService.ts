import { useMutation } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';

export interface CandidateRankInput {
  jobId?: string;
  jobDescription: string;
  ai?: boolean;
  candidates: Array<{
    applicationId?: string;
    candidateId?: string;
    name: string;
    email?: string;
    resumeUrl?: string;
    summary?: string;
    skills: string[];
    experience?: number | Array<{ yearsOfExperience?: number; title?: string; company?: string }>;
    education?: Array<{ degree?: string; institution?: string; year?: string | number }>;
    bio?: string;
  }>;
}

export interface CandidateSummary {
  applicationId?: string;
  candidateId?: string;
  name: string;
  email?: string;
  resumeUrl?: string;
  summary?: string;
  score?: number;
  matchedSkills?: string[];
  experience?: number | Array<{ yearsOfExperience?: number; title?: string; company?: string }>;
  skills?: string[];
  bio?: string;
  education?: Array<{ degree?: string; institution?: string; year?: string | number }>;
}

export interface RankedCandidate extends CandidateSummary {
  score: number;
  status?: string;
}

export interface CandidateListResponse {
  success: boolean;
  candidates: CandidateSummary[];
  count?: number;
  message?: string;
}

export interface CandidateRankedListResponse {
  success: boolean;
  rankedCandidates: RankedCandidate[];
  count?: number;
  message?: string;
}

export interface CandidateRankResponse {
  success: boolean;
  rankedCandidates: RankedCandidate[];
  count?: number;
  message?: string;
}

export const getCandidates = async (): Promise<CandidateListResponse> => {
  try {
    const response = await api.get<CandidateListResponse>('/candidate/candidates');
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

export const getRankedCandidates = async (jobId?: string): Promise<CandidateRankedListResponse> => {
  try {
    const params = new URLSearchParams();
    if (jobId) {
      params.set('jobId', jobId);
    }

    const query = params.toString();
    const response = await api.get<CandidateRankedListResponse>(
      query ? `/candidate/candidates/ranked?${query}` : '/candidate/candidates/ranked',
    );
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};

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
