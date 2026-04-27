// এই ফাইলটি API call এবং server data operation এর service layer হিসেবে কাজ করে।
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { Application, ApplicationStatus, ApiResponse, PaginatedResponse } from '../types';
import { toast } from 'sonner';

const allowedStatuses: ApplicationStatus[] = [
  'applied',
  'reviewed',
  'shortlisted',
  'interview',
  'accepted',
  'hired',
  'rejected',
];

const normalizeApplicationStatus = (status: unknown): ApplicationStatus => {
  const parsed = String(status || '').toLowerCase();
  const value = parsed === 'accepted' ? 'accepted' : (parsed as ApplicationStatus);
  return allowedStatuses.includes(value) ? value : 'applied';
};

const toStatusPayload = (status: ApplicationStatus): string => {
  const normalized = String(status || '').toLowerCase();
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const normalizeApplication = (application: Partial<Application> & Record<string, any>): Application => {
  const normalizedJobId =
    application.jobId ||
    (typeof application.job === 'string' ? application.job : application.job?._id) ||
    '';

  const normalizedRecruiterId =
    application.recruiterId ||
    (typeof application.job === 'object' ? application.job?.createdBy?._id || application.job?.createdBy : '') ||
    '';

  return {
    ...application,
    status: normalizeApplicationStatus(application.status),
    jobId: normalizedJobId,
    candidateId: application.candidateId || application.candidate?._id || application.candidate || '',
    recruiterId: normalizedRecruiterId,
    resume:
      application.resume ||
      application.downloadUrl ||
      application.resumeUrl ||
      application.resumeURL ||
      application.resume_file ||
      '',
    downloadUrl:
      application.downloadUrl ||
      application.resume ||
      application.resumeUrl ||
      application.resumeURL ||
      application.resume_file ||
      '',
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
      return {
        ...response.data,
        data: (response.data.data || []).map(normalizeApplication),
      };
    },
  });
};

export const useJobApplications = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['job-applications', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');
      const response = await api.get<ApiResponse<Application[]>>(
        `/applications/recruiter/jobs/${jobId}/applications`
      );
      return (response.data.data || []).map(normalizeApplication);
    },
    enabled: !!jobId,
  });
};

export const useAdminJobApplications = (jobId: string | undefined) => {
  return useQuery({
    queryKey: ['admin-job-applications', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('Job ID is required');

      const response = await api.get<
        ApiResponse<Application[]> |
        { success?: boolean; data?: { applications?: Application[]; allApplications?: Application[] } }
      >(`/jobs/${jobId}/applications`);

      const payload = response.data;

      if (payload && typeof payload === 'object') {
        if ('success' in payload && payload.success === false) {
          throw new Error((payload as ApiResponse<Application[]>).message || 'Failed to fetch job applications');
        }

        if ('data' in payload) {
          if (Array.isArray(payload.data)) {
            return payload.data.map(normalizeApplication);
          }

          if (payload.data && typeof payload.data === 'object') {
            const nested = payload.data as { applications?: Application[]; allApplications?: Application[] };
            if (Array.isArray(nested.applications)) {
              return nested.applications.map(normalizeApplication);
            }

            if (Array.isArray(nested.allApplications)) {
              return nested.allApplications.map(normalizeApplication);
            }
          }
        }
      }

      return [] as Application[];
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
      expectedSalary?: number;
    }) => {
      let response;

      if (data.resumeFile) {
        const formData = new FormData();
        formData.append('jobId', data.jobId);
        formData.append('resume', data.resumeFile);

        if (data.coverLetter) {
          formData.append('coverLetter', data.coverLetter);
        }

        if (typeof data.expectedSalary === 'number' && Number.isFinite(data.expectedSalary)) {
          formData.append('expectedSalary', String(data.expectedSalary));
        }

        response = await api.post<ApiResponse<Application>>('/applications', formData);
      } else {
        if (!data.resumeUrl) {
          throw new Error('Resume is required');
        }

        const payload: Record<string, unknown> = {
          jobId: data.jobId,
          resumeUrl: data.resumeUrl,
        };

        if (data.coverLetter) {
          payload.coverLetter = data.coverLetter;
        }

        if (typeof data.expectedSalary === 'number' && Number.isFinite(data.expectedSalary)) {
          payload.expectedSalary = data.expectedSalary;
        }

        response = await api.post<ApiResponse<Application>>('/applications', payload);
      }

      if (!response.data.data) {
        throw new Error(response.data.message || 'Application submission failed');
      }
      return normalizeApplication(response.data.data as Application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
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
        { status: toStatusPayload(status) }
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
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('Application status updated!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useMyApplications = (enabled = true) => {
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
    enabled,
  });
};
