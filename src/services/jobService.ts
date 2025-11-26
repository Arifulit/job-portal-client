import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api, handleApiError } from '../utils/api';
import { Job, JobFilters, PaginatedResponse, ApiResponse } from '../types';
import { toast } from 'sonner';

export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      const response = await api.get<PaginatedResponse<Job>>(`/jobs?${params}`);
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
      const response = await api.get<ApiResponse<Job[]>>(`/jobs/all?${params}`);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }
      return response.data.data;
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
  const navigate = useNavigate();

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
      } catch (error: any) {
        console.error('Error creating job:', error);
        throw new Error(handleApiError(error));
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job created successfully');
      navigate(`/recruiter/jobs/${data._id}`);
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
      toast.success('Job deleted successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const userecruiterJobs = () => {
  return useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Job>>('/jobs/recruiter/my-jobs');
      return response.data;
    },
  });
};

export const useSavedJobs = () => {
  return useQuery({
    queryKey: ['saved-jobs'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Job[]>>('/jobs/saved');
      return response.data.data;
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
      toast.success('Job saved successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
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
      toast.success('Job removed from saved list');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
