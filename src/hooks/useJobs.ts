/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with interceptor
const api = axios.create({
  baseURL: API_URL,
});

// Example: Fetch all jobs
export function useJobs(filters?: any) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const { data } = await api.get('/jobs', {
        params: filters,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    enabled: !!token,
  });
}

// Example: Fetch single job
export function useJob(jobId: string) {
  const { token } = useAuth();

  return useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const { data } = await api.get(`/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    enabled: !!jobId && !!token,
  });
}

// Example: Create job mutation
export function useCreateJob() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobData: any) => {
      const { data } = await api.post('/jobs', jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch jobs
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Example: Update job mutation
export function useUpdateJob() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, jobData }: { jobId: string; jobData: any }) => {
      const { data } = await api.put(`/jobs/${jobId}`, jobData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: (_, variables) => {
      // Invalidate specific job and jobs list
      queryClient.invalidateQueries({ queryKey: ['job', variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Example: Delete job mutation
export function useDeleteJob() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      const { data } = await api.delete(`/jobs/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
}

// Example: Apply to job
export function useApplyJob() {
  const { token } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ jobId, applicationData }: { jobId: string; applicationData: any }) => {
      const { data } = await api.post(`/jobs/${jobId}/apply`, applicationData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    },
  });
}

// Example: Fetch user's applications
export function useMyApplications() {
  const auth = useAuth();
  const token = (auth as any)?.token ?? (auth as any)?.accessToken ?? (auth as any)?.user?.token ?? null;

  return useQuery({
    queryKey: ['my-applications'],
    queryFn: async () => {
      const { data } = await api.get('/applications/my', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      return data;
    },
    enabled: !!token,
  });
}