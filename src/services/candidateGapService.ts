import { api, handleApiError } from '../utils/api';

export interface CandidateGapInput {
  jobId?: string;
  userId?: string;
  jobDescription?: string;
  candidateSkills?: string[];
  jobSkills?: string[];
}

export interface CandidateGapResponse {
  success: boolean;
  jobId?: string;
  userId?: string;
  candidateSkills?: string[];
  jobSkills?: string[];
  matchedSkills?: string[];
  missingSkills: string[];
  summary?: string;
  message?: string;
}

export const getCandidateSkillGap = async (input: CandidateGapInput): Promise<CandidateGapResponse> => {
  try {
    const response = await api.post<CandidateGapResponse>('/candidate/candidates/gap', input);
    return response.data;
  } catch (error) {
    throw new Error(handleApiError(error));
  }
};
