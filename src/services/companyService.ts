import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse, CompanyProfileData, CompanyReview, Job } from '../types';
import { useAuth } from '../context/AuthContext';
import { api, handleApiError } from '../utils/api';

export interface CompanyListItem {
  _id: string;
  name: string;
  logo?: string;
  industry?: string;
  website?: string;
  location?: string;
  description?: string;
}

type AnyRecord = Record<string, unknown>;

const toNumber = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeJob = (raw: unknown): Job | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const item = raw as AnyRecord;
  const id = String(item._id || item.id || '');

  if (!id) {
    return undefined;
  }

  return {
    _id: id,
    title: String(item.title || 'Untitled Job'),
    description: String(item.description || ''),
    requirements: Array.isArray(item.requirements) ? (item.requirements as string[]) : [],
    location: String(item.location || 'Not specified'),
    jobType: (String(item.jobType || 'full-time') as Job['jobType']),
    company: (item.company as Job['company']) || null,
    status: item.status ? String(item.status) : undefined,
    createdAt: String(item.createdAt || new Date().toISOString()),
    updatedAt: String(item.updatedAt || new Date().toISOString()),
    salaryMin: typeof item.salaryMin === 'number' ? item.salaryMin : undefined,
    salaryMax: typeof item.salaryMax === 'number' ? item.salaryMax : undefined,
    currency: typeof item.currency === 'string' ? item.currency : undefined,
    deadline: typeof item.deadline === 'string' ? item.deadline : undefined,
    experience: typeof item.experience === 'string' ? item.experience : undefined,
    vacancies: typeof item.vacancies === 'number' ? item.vacancies : undefined,
    skills: Array.isArray(item.skills) ? (item.skills as string[]) : undefined,
  };
};

const normalizeReview = (raw: unknown): CompanyReview | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const item = raw as AnyRecord;
  const id = String(item._id || item.id || '');

  if (!id) {
    return undefined;
  }

  return {
    _id: id,
    user:
      typeof item.user === 'string'
        ? { _id: item.user }
        : item.user && typeof item.user === 'object'
        ? {
            _id: String((item.user as AnyRecord)._id || (item.user as AnyRecord).id || ''),
            name: String((item.user as AnyRecord).name || ''),
            email: String((item.user as AnyRecord).email || ''),
            avatar: String((item.user as AnyRecord).avatar || ''),
            profileImage: String((item.user as AnyRecord).profileImage || ''),
          }
        : undefined,
    rating: Math.min(5, Math.max(1, toNumber(item.rating, 1))),
    review: String(item.review || ''),
    createdAt: item.createdAt ? String(item.createdAt) : undefined,
    updatedAt: item.updatedAt ? String(item.updatedAt) : undefined,
  };
};

const normalizeCompanyListItem = (raw: unknown): CompanyListItem | undefined => {
  if (!raw || typeof raw !== 'object') {
    return undefined;
  }

  const item = raw as AnyRecord;
  const id = String(item._id || item.id || '');

  if (!id) {
    return undefined;
  }

  return {
    _id: id,
    name: String(item.name || 'Unnamed Company'),
    logo: typeof item.logo === 'string' ? item.logo : undefined,
    industry: typeof item.industry === 'string' ? item.industry : undefined,
    website: typeof item.website === 'string' ? item.website : undefined,
    location: typeof item.location === 'string' ? item.location : undefined,
    description: typeof item.description === 'string' ? item.description : undefined,
  };
};

const normalizeCompanyProfile = (payload: unknown): CompanyProfileData => {
  const response = (payload || {}) as {
    success?: boolean;
    message?: string;
    data?: unknown;
    company?: unknown;
    openPositions?: unknown;
    reviews?: unknown;
  };

  if (response.success === false) {
    throw new Error(response.message || 'Failed to fetch company profile');
  }

  const data = (response.data || {}) as AnyRecord;
  const companyRaw =
    (data.overview as AnyRecord | undefined) ||
    (data.company as AnyRecord | undefined) ||
    ((response.company as AnyRecord | undefined) || data);

  const openPositionsRaw =
    (data.openPositions as AnyRecord | undefined) ||
    ((response.openPositions as AnyRecord | undefined) || {});

  const jobsRaw =
    (Array.isArray(openPositionsRaw.jobs) ? openPositionsRaw.jobs : undefined) ||
    (Array.isArray(data.jobs) ? data.jobs : undefined) ||
    [];

  const reviewsRaw =
    (Array.isArray(data.reviews) ? data.reviews : undefined) ||
    (Array.isArray(response.reviews) ? response.reviews : undefined) ||
    [];

  return {
    _id: String(companyRaw._id || companyRaw.id || ''),
    name: companyRaw.name ? String(companyRaw.name) : undefined,
    logo: companyRaw.logo ? String(companyRaw.logo) : undefined,
    industry: companyRaw.industry ? String(companyRaw.industry) : undefined,
    website: companyRaw.website ? String(companyRaw.website) : undefined,
    location: companyRaw.location ? String(companyRaw.location) : undefined,
    description: companyRaw.description ? String(companyRaw.description) : undefined,
    openPositions: {
      total: toNumber(openPositionsRaw.total, Array.isArray(jobsRaw) ? jobsRaw.length : 0),
      page: toNumber(openPositionsRaw.page, 1),
      limit: toNumber(openPositionsRaw.limit, 10),
      totalPages: toNumber(openPositionsRaw.totalPages, 1),
      jobs: (Array.isArray(jobsRaw) ? jobsRaw : []).map(normalizeJob).filter((job): job is Job => !!job),
    },
    reviews: reviewsRaw.map(normalizeReview).filter((review): review is CompanyReview => !!review),
  };
};

export const useCompanyProfile = (
  companyId: string | undefined,
  page = 1,
  limit = 10,
  reviewsLimit = 10
) => {
  return useQuery({
    queryKey: ['company-profile', companyId, page, limit, reviewsLimit],
    queryFn: async () => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      // Try multiple endpoints with fallback strategy
      const endpoints = [
        `/company/${companyId}/profile?page=${page}&limit=${limit}&reviewsLimit=${reviewsLimit}`,
        `/company/${companyId}?page=${page}&limit=${limit}&reviewsLimit=${reviewsLimit}`,
        `/company/${companyId}`,
      ];

      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          return normalizeCompanyProfile(response.data);
        } catch (error) {
          lastError = error;
          // Continue to next endpoint on error
          continue;
        }
      }

      // If all endpoints fail, throw the last error
      throw lastError || new Error('Failed to fetch company profile');
    },
    enabled: !!companyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 5,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useCompanies = () => {
  return useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await api.get('/company');
      const payload = response.data as {
        success?: boolean;
        message?: string;
        data?: unknown;
      };

      if (payload.success === false) {
        throw new Error(payload.message || 'Failed to fetch companies');
      }

      const list = Array.isArray(payload.data) ? payload.data : [];
      return list
        .map(normalizeCompanyListItem)
        .filter((company): company is CompanyListItem => !!company);
    },
  });
};

export const useCreateCompanyReview = (companyId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: { rating: number; review: string }) => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      if (!user?._id) {
        throw new Error('Login required to submit a review');
      }

      const response = await api.post<ApiResponse<CompanyReview>>(
        `/company/${companyId}/reviews`,
        { ...payload, userId: user._id }
      );

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to create review');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      toast.success('Review submitted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateCompanyReview = (companyId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: { rating: number; review: string }) => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      if (!user?._id) {
        throw new Error('Login required to update a review');
      }

      const response = await api.put<ApiResponse<CompanyReview>>(
        `/company/${companyId}/reviews`,
        { ...payload, userId: user._id }
      );

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to update review');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      toast.success('Review updated successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteCompanyReview = (companyId: string | undefined) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      if (!user?._id) {
        throw new Error('Login required to delete a review');
      }

      const response = await api.delete<ApiResponse<CompanyReview>>(`/company/${companyId}/reviews`, {
        data: { userId: user._id },
      });

      if (response.data.success === false) {
        throw new Error(response.data.message || 'Failed to delete review');
      }

      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-profile', companyId] });
      toast.success('Review deleted successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
