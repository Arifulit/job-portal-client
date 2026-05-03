import { api } from '@/utils/api';
import { useQuery, useMutation } from '@tanstack/react-query';

export interface ResumeAnalysisResponse {
  success: boolean;
  score: number;
  scoreBreakdown: {
    formatting: number;
    skills: number;
    experience: number;
    education: number;
    completeness: number;
  };
  extractedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  suggestions: string[];
  summary: string;
  error?: string;
}

export const analyzeResume = async (file: File): Promise<ResumeAnalysisResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await api.post('/resume/analyze', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('Resume analysis error:', error);
    throw error;
  }
};

export const useResumeAnalyzer = () => {
  return useMutation({
    mutationFn: analyzeResume,
  });
};

export const useResumeAnalysis = (file?: File) => {
  return useQuery({
    queryKey: ['resumeAnalysis', file?.name],
    queryFn: () => (file ? analyzeResume(file) : Promise.resolve(null)),
    enabled: !!file,
  });
};
