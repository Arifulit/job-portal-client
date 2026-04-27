import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ApiResponse, CompanyProfileData, CompanyReview, Job } from '../types';
import { api, handleApiError } from '../utils/api';

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
      item.user && typeof item.user === 'object'
        ? {
            _id: String((item.user as AnyRecord)._id || ''),
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

      const response = await api.get(
        `/company/${companyId}/profile?page=${page}&limit=${limit}&reviewsLimit=${reviewsLimit}`
      );
      return normalizeCompanyProfile(response.data);
    },
    enabled: !!companyId,
  });
};

export const useCreateCompanyReview = (companyId: string | undefined) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { rating: number; review: string }) => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const response = await api.post<ApiResponse<CompanyReview>>(
        `/company/${companyId}/reviews`,
        payload
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

  return useMutation({
    mutationFn: async (payload: { rating: number; review: string }) => {
      if (!companyId) {
        throw new Error('Company ID is required');
      }

      const response = await api.put<ApiResponse<CompanyReview>>(
        `/company/${companyId}/reviews`,
        payload
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
