import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { Application, ApplicationStatus, ApiResponse, PaginatedResponse } from '../types';
import { toast } from 'sonner';

export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>('/applications');
      return response.data;
    },
  });
};

export const useJobApplications = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await api.get<ApiResponse<Application[]>>(
        `/applications/job/${jobId}`
      );
      return response.data.data;
    },
    enabled: !!jobId,
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { jobId: string; resume: string; coverLetter?: string }) => {
      const response = await api.post<ApiResponse<Application>>('/applications', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Application submitted successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: ApplicationStatus;
      note?: string;
    }) => {
      const response = await api.patch<ApiResponse<Application>>(
        `/applications/${id}/status`,
        { status, note }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      toast.success('Application status updated!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete<ApiResponse<void>>(`/applications/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application withdrawn successfully');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useMyApplications = () => {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<Application>>(
        '/applications/my-applications'
      );
      return response.data;
    },
  });
};
