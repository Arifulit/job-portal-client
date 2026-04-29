import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export type AnalyticsSummary = {
  activeCandidates: number;
  successfulPlacements: number;
  employerSatisfaction: number;
  activeEmployers: number;
  openJobs: number;
  totalApplications: number;
};

export type AnalyticsSummaryDisplay = {
  activeCandidates: string;
  successfulPlacements: string;
  employerSatisfaction: string;
  activeEmployers: string;
  openJobs: string;
  totalApplications: string;
};

export const useAnalyticsSummary = () => {
  return useQuery<{ data: AnalyticsSummary; display: AnalyticsSummaryDisplay }>({
    queryKey: ['analytics-summary'],
    queryFn: async () => {
      const response = await api.get('/analytics/summary');
      if (response.data && response.data.success) {
        return {
          data: response.data.data,
          display: response.data.display,
        };
      }
      throw new Error('Failed to fetch analytics summary');
    },
  });
};