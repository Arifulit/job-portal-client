import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { Application, ApplicationStatus, ApiResponse, PaginatedResponse } from '../types';
import { toast } from 'sonner';

const allowedStatuses: ApplicationStatus[] = [
  'applied',
  'shortlisted',
  'interview',
  'offered',
  'hired',
  'rejected',
];

const normalizeApplicationStatus = (status: unknown): ApplicationStatus => {
  const value = String(status || '').toLowerCase() as ApplicationStatus;
  return allowedStatuses.includes(value) ? value : 'applied';
};

const normalizeApplication = (application: Partial<Application> & Record<string, any>): Application => {
  return {
    ...application,
    status: normalizeApplicationStatus(application.status),
    jobId: application.jobId || application.job?._id || '',
    seekerId: application.seekerId || application.candidate?._id || application.candidate || '',
    recruiterId: application.recruiterId || application.job?.createdBy || '',
    resume: application.resume || '',
    appliedAt:
      application.appliedAt ||
      application.createdAt ||
      application.updatedAt ||
      new Date().toISOString(),
  } as Application;
};

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
      return (response.data.data || []).map(normalizeApplication);
    },
    enabled: !!jobId,
  });
};

export const useRecruiterAllApplications = () => {
  return useQuery({
    queryKey: ['recruiter-all-applications'],
    queryFn: async () => {
      const response = await api.get<ApiResponse<Application[]>>(
        '/applications/recruiter/all-applications'
      );

      return (response.data.data || []).map(normalizeApplication);
    },
  });
};

export const useApplyJob = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      jobId: string;
      coverLetter?: string;
      resumeUrl?: string;
      resumeFile?: File;
    }) => {
      let response;

      if (data.resumeFile) {
        const formData = new FormData();
        // Some backends expect `job` while others expect `jobId`; send both for compatibility.
        formData.append('job', data.jobId);
        formData.append('jobId', data.jobId);
        formData.append('resume', data.resumeFile);

        if (data.coverLetter) {
          formData.append('coverLetter', data.coverLetter);
        }

        // Let Axios/browser set multipart boundary automatically.
        response = await api.post<ApiResponse<Application>>('/applications', formData);
      } else {
        response = await api.post<ApiResponse<Application>>('/applications', {
          jobId: data.jobId,
          coverLetter: data.coverLetter,
          resumeUrl: data.resumeUrl,
        });
      }

      if (!response.data.data) {
        throw new Error(response.data.message || 'Application submission failed');
      }
      return normalizeApplication(response.data.data as Application);
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
    }: {
      id: string;
      status: ApplicationStatus;
    }) => {
      const response = await api.put<ApiResponse<Application>>(
        `/applications/${id}`,
        { status }
      );
      if (!response.data.data) {
        throw new Error(response.data.message || 'Failed to update application status');
      }
      return normalizeApplication(response.data.data as Application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-all-applications'] });
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
      const response = await api.get<ApiResponse<Application[]>>(
        '/applications/me'
      );

      return {
        ...response.data,
        data: (response.data.data || []).map(normalizeApplication),
      };
    },
  });
};
