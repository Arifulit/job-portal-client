import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export interface HomeFeaturedJob {
  _id: string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  deadline?: string;
  vacancies?: number;
  createdAt?: string;
  company?: {
    _id?: string;
    name?: string;
    logo?: string;
    industry?: string;
  } | string | null;
}

export interface HomeCategory {
  key: string;
  label: string;
  count: number;
  description: string;
}

export interface HomeCompany {
  _id: string;
  name: string;
  logo?: string;
  industry?: string;
  location?: string;
  roleCount: number;
}

export interface HomeResource {
  _id: string;
  title: string;
  description: string;
  tag: string;
}

export interface HomePageData {
  stats: {
    totalJobs: number;
    totalVacancies: number;
    totalCompanies: number;
    recentJobs: number;
  };
  featuredJobs: HomeFeaturedJob[];
  categories: HomeCategory[];
  topCompanies: HomeCompany[];
  careerResources: HomeResource[];
}

export const useHomePageData = () => {
  return useQuery({
    queryKey: ['home-page-data'],
    queryFn: async () => {
      const response = await api.get('/home');
      const payload = response.data as {
        success?: boolean;
        message?: string;
        data?: HomePageData;
      };

      if (payload.success === false) {
        throw new Error(payload.message || 'Failed to fetch home page data');
      }

      return payload.data || {
        stats: { totalJobs: 0, totalVacancies: 0, totalCompanies: 0, recentJobs: 0 },
        featuredJobs: [],
        categories: [],
        topCompanies: [],
        careerResources: [],
      };
    },
  });
};