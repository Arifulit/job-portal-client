import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { Job, JobFilters, PaginatedResponse, ApiResponse, RecommendedJob } from '../types';
import { toast } from 'sonner';


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
              // params.append('type', String(value));  // Uncomment if needed
              // params.append('employment_type', String(value));  // Uncomment if needed
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      
      console.log('API Request:', `/jobs/search?${params}`); // Debug log
      
      const response = await api.get<PaginatedResponse<Job>>(`/jobs/search?${params}`);
      console.log('API Response:', response.data); // Debug log
      return response.data;
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
      const response = await api.get<ApiResponse<Job>>(`/jobs/${id}`);
      return response.data.data;
    },
    enabled: !!id,
  });
};



export const useCreateJob = () => {
  const queryClient = useQueryClient();

  return useMutation<Job, Error, Partial<Job>>({
    mutationFn: async (jobData) => {
      try {
        const response = await api.post<ApiResponse<Job>>('/jobs/create', jobData);
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'Failed to create job');
        }
        
        if (!response.data.data) {
          throw new Error('No job data returned from server');
        }
        
        return response.data.data;
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
      const response = await api.put<ApiResponse<Job>>(`/jobs/${id}`, data);
      return response.data.data;
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
      const response = await api.get<PaginatedResponse<Job> | ApiResponse<Job[]>>('/jobs');
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
    },
  });
};

export const useSavedJobs = () => {
  return useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Job[]>>('/v1/jobs/saved');
      return response.data.data;
    },
  });
};

export const useSaveJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.post<ApiResponse<void>>(`/v1/jobs/${jobId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
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
      const response = await api.delete<ApiResponse<void>>(`/v1/jobs/${jobId}/save`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      toast.success('Job removed from saved list');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
