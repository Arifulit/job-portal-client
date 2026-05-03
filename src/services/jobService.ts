// এই ফাইলটি API call এবং server data operation এর service layer হিসেবে কাজ করে।
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { Job, JobFilters, PaginatedResponse, ApiResponse, RecommendedJob, SavedJob } from '../types';
import { toast } from 'sonner';
import axios from 'axios';

const extractJob = (payload: unknown): Job | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const response = payload as {
    success?: boolean;
    data?: Job | { job?: Job };
    job?: Job;
  };

  if (response.data && typeof response.data === 'object') {
    if ('job' in response.data && response.data.job) {
      return response.data.job;
    }

    return response.data as Job;
  }

  if (response.job && typeof response.job === 'object') {
    return response.job;
  }

  return undefined;
};

const normalizePaginatedJobs = (payload: unknown): PaginatedResponse<Job> => {
  const defaultPayload: PaginatedResponse<Job> = {
    success: true,
    data: [],
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 1,
    },
  };

  if (!payload || typeof payload !== 'object') {
    return defaultPayload;
  }

  const response = payload as {
    success?: boolean;
    message?: string;
    data?: Job[] | { jobs?: Job[]; data?: Job[]; pagination?: PaginatedResponse<Job>['pagination'] };
    jobs?: Job[];
    pagination?: PaginatedResponse<Job>['pagination'];
  };

  if (response.success === false) {
    throw new Error(response.message || 'Failed to fetch jobs');
  }

  if (Array.isArray(response.data) && response.pagination) {
    return {
      success: true,
      data: response.data,
      pagination: {
        total: response.pagination.total ?? response.data.length,
        page: response.pagination.page ?? 1,
        limit: response.pagination.limit ?? 10,
        pages: response.pagination.pages ?? 1,
      },
    };
  }

  if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
    const nestedData = response.data as {
      jobs?: Job[];
      data?: Job[];
      pagination?: PaginatedResponse<Job>['pagination'];
    };
    const nestedJobs = Array.isArray(nestedData.jobs)
      ? nestedData.jobs
      : Array.isArray(nestedData.data)
      ? nestedData.data
      : [];
    const nestedPagination = nestedData.pagination || response.pagination;

    if (nestedPagination) {
      return {
        success: true,
        data: nestedJobs,
        pagination: {
          total: nestedPagination.total ?? nestedJobs.length,
          page: nestedPagination.page ?? 1,
          limit: nestedPagination.limit ?? 10,
          pages: nestedPagination.pages ?? 1,
        },
      };
    }
  }

  if (Array.isArray(response.jobs) && response.pagination) {
    return {
      success: true,
      data: response.jobs,
      pagination: {
        total: response.pagination.total ?? response.jobs.length,
        page: response.pagination.page ?? 1,
        limit: response.pagination.limit ?? 10,
        pages: response.pagination.pages ?? 1,
      },
    };
  }

  return defaultPayload;
};


export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            // Map keyword to search parameter for backend compatibility
            if (key === 'keyword') {
              params.append('search', String(value));
            } else if (key === 'jobType') {
              params.append('jobType', String(value));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }

      const query = params.toString();
      const endpoints = query ? [`/jobs?${query}`, `/jobs/search?${query}`] : ['/jobs', '/jobs/search'];
      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          return normalizePaginatedJobs(response.data);
        } catch (error) {
          if (axios.isAxiosError(error) && [404, 405].includes(error.response?.status || 0)) {
            lastError = error;
            continue;
          }

          throw error;
        }
      }

      throw lastError || new Error('Failed to fetch jobs');
    },
  });
};

export const useAllJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['all-jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }

      const response = await api.get<PaginatedResponse<Job> | ApiResponse<Job[]>>(`/jobs?${params}`);
      const payload = response.data;

      if ('pagination' in payload) {
        return payload.data;
      }

      if (!payload.success) {
        throw new Error(payload.message || 'Failed to fetch jobs');
      }

      return payload.data || [];
    },
  });
};

export const useAdminJobsSummary = () => {
  return useQuery({
    queryKey: ['admin-jobs-summary'],
    queryFn: async () => {
      const response = await api.get('/jobs');
      const payload = response.data as
        | PaginatedResponse<Job>
        | ApiResponse<Job[]>
        | { success?: boolean; data?: Job[]; pagination?: { total?: number } };

      if (payload && typeof payload === 'object') {
        if ('pagination' in payload && Array.isArray(payload.data)) {
          const jobs = payload.data;
          const total = payload.pagination?.total ?? jobs.length;
          return { totalJobs: total };
        }

        if ('success' in payload && payload.success === false) {
          throw new Error((payload as ApiResponse<Job[]>).message || 'Failed to fetch jobs summary');
        }

        if ('data' in payload && Array.isArray(payload.data)) {
          return { totalJobs: payload.data.length };
        }
      }

      return { totalJobs: 0 };
    },
  });
};

export const useAdminAllJobs = () => {
  return useQuery({
    queryKey: ['admin-all-jobs'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Job> | ApiResponse<Job[]> | { success?: boolean; data?: { jobs?: Job[]; allJobs?: Job[] } }>('/jobs/all');
      const payload = response.data;

      if (payload && typeof payload === 'object') {
        if ('pagination' in payload && Array.isArray(payload.data)) {
          return payload.data;
        }

        if ('success' in payload && payload.success === false) {
          throw new Error((payload as ApiResponse<Job[]>).message || 'Failed to fetch admin jobs');
        }

        if ('data' in payload) {
          if (Array.isArray(payload.data)) {
            return payload.data;
          }

          if (payload.data && typeof payload.data === 'object') {
            const nested = payload.data as { jobs?: Job[]; allJobs?: Job[] };
            if (Array.isArray(nested.jobs)) {
              return nested.jobs;
            }

            if (Array.isArray(nested.allJobs)) {
              return nested.allJobs;
            }
          }
        }
      }

      return [] as Job[];
    },
  });
};

export const useJob = (id: string | undefined) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: async () => {
      if (!id) throw new Error('Job ID is required');
      const endpoints = [`/jobs/${id}`, `/jobs/job/${id}`];
      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const job = extractJob(response.data);

          if (!job) {
            throw new Error('Job data missing from response');
          }

          return job;
        } catch (error) {
          // If the request was forbidden for the currently authenticated user
          // try fetching the same endpoint without Authorization header. Some
          // jobs are publicly viewable but the presence of an auth token can
          // cause the backend to apply stricter permission checks and return
          // 403. In that case retry as a guest using a plain axios instance.
          if (axios.isAxiosError(error) && error.response?.status === 403) {
            try {
              const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
              const guest = axios.create({ baseURL: API_URL });
              const guestResp = await guest.get(endpoint);
              const guestJob = extractJob(guestResp.data);
              if (!guestJob) {
                lastError = error;
                continue;
              }
              return guestJob;
            } catch (guestErr) {
              lastError = guestErr;
              continue;
            }
          }

          if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)) {
            lastError = error;
            continue;
          }

          throw error;
        }
      }

      throw lastError || new Error('Failed to fetch job');
    },
    enabled: !!id,
  });
};



export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, Partial<Job>>({
    mutationFn: async (jobData) => {
      try {
        const response = await api.post('/jobs/create', jobData);
        const payload = response.data as { success?: boolean; message?: string };
        const job = extractJob(response.data);
        
        if (payload?.success === false) {
          throw new Error(payload.message || 'Failed to create job');
        }
        
        if (!job) {
          throw new Error('No job data returned from server');
        }
        
        return job;
      } catch (error: unknown) {
        console.error('Error creating job:', error);
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job created successfully');
    },
    onError: (error) => {
      console.error('Job creation error:', error);
      toast.error(error.message || 'Failed to create job');
    }
  });
};
export const useUpdateJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const requests = [
        () => api.put(`/jobs/${id}`, data),
        () => api.patch(`/jobs/${id}`, data),
        () => api.put(`/jobs/update/${id}`, data),
      ];

      let lastError: unknown;

      for (const sendRequest of requests) {
        try {
          const response = await sendRequest();
          const payload = response.data as { success?: boolean; message?: string };
          const job = extractJob(response.data);

          if (payload?.success === false) {
            throw new Error(payload.message || 'Failed to update job');
          }

          if (!job) {
            throw new Error('Updated job missing from response');
          }

          return job;
        } catch (error) {
          if (axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.status === 405)) {
            lastError = error;
            continue;
          }

          throw error;
        }
      }

      throw lastError || new Error('Failed to update job');
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      toast.success('Job updated successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<void>>(`/jobs/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast.success('Job deleted successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useRecruiterJobs = () => {
  return useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const endpoints = ['/recruiter/jobs', '/jobs'];
      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get<PaginatedResponse<Job> | ApiResponse<Job[]>>(endpoint);
          const payload = response.data;

          if ('pagination' in payload) {
            return payload;
          }

          if (!payload.success) {
            throw new Error(payload.message || 'Failed to fetch recruiter jobs');
          }

          return {
            success: true,
            data: payload.data || [],
            pagination: {
              total: payload.data?.length || 0,
              page: 1,
              limit: payload.data?.length || 0,
              pages: 1,
            },
          } as PaginatedResponse<Job>;
        } catch (error) {
          if (axios.isAxiosError(error) && [404, 405].includes(error.response?.status || 0)) {
            lastError = error;
            continue;
          }

          throw error;
        }
      }

      throw lastError || new Error('Failed to fetch recruiter jobs');
    },
  });
};

export const useSavedJobs = () => {
  return useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const response = await api.get('/jobs/saved/me');
      const payload = response.data as
        | ApiResponse<Job[] | SavedJob[]>
        | {
            success?: boolean;
            data?: Job[] | SavedJob[] | { savedJobs?: Job[] | SavedJob[]; jobs?: Job[] | SavedJob[] };
            savedJobs?: Job[] | SavedJob[];
            jobs?: Job[] | SavedJob[];
            message?: string;
          };

      if ('success' in payload && payload.success === false) {
        throw new Error(payload.message || 'Failed to fetch saved jobs');
      }

      const data =
        (payload && typeof payload === 'object' && 'data' in payload ? payload.data : undefined) ||
        (payload && typeof payload === 'object' && 'savedJobs' in payload ? payload.savedJobs : undefined) ||
        (payload && typeof payload === 'object' && 'jobs' in payload ? payload.jobs : undefined);

      const list = Array.isArray(data)
        ? data
        : data && typeof data === 'object' && 'savedJobs' in data && Array.isArray(data.savedJobs)
        ? data.savedJobs
        : data && typeof data === 'object' && 'jobs' in data && Array.isArray(data.jobs)
        ? data.jobs
        : [];

      return list
        .map((item) => {
          if (!item || typeof item !== 'object') {
            return undefined;
          }

          const candidate = item as SavedJob & Job;
          if (candidate.job && typeof candidate.job === 'object') {
            return candidate.job;
          }

          if ('title' in candidate) {
            return candidate as Job;
          }

          return undefined;
        })
        .filter((job): job is Job => !!job && !!job._id);
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post<ApiResponse<void>>(`/jobs/${jobId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job saved successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useJobRecommendations = (limit: number = 10) => {
  return useQuery({
    queryKey: ['job-recommendations', limit],
    queryFn: async () => {
      const response = await api.get<ApiResponse<RecommendedJob[]>>(`/candidate/profile/recommendations?limit=${limit}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch job recommendations');
      }
      return response.data.data || [];
    },
  });
};

export const useUnsaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/jobs/${jobId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job removed from saved list');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
