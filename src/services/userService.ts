import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, handleApiError } from '../utils/api';
import { User, ApiResponse, DashboardStats, PaginatedResponse } from '../types';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const getStoredRole = (): string => {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { role?: string };
    return String(parsed?.role || '').toLowerCase();
  } catch {
    return '';
  }
};

const getPrimaryProfileEndpoint = (): '/admin/profile' | '/users/profile' => {
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

  if (currentPath.startsWith('/admin')) {
    return '/admin/profile';
  }

  return getStoredRole() === 'admin' ? '/admin/profile' : '/users/profile';
};

const extractProfile = (payload: unknown): User | undefined => {
  const response = payload as
    | ApiResponse<User>
    | {
        data?: User | { user?: User };
        user?: User;
      };

  if (response && typeof response === 'object') {
    if ('data' in response && response.data && typeof response.data === 'object') {
      if (
        'user' in response.data &&
        response.data.user &&
        typeof response.data.user === 'object'
      ) {
        return response.data.user as User;
      }

      return response.data as User;
    }

    if ('user' in response && response.user && typeof response.user === 'object') {
      return response.user;
    }
  }

  return undefined;
};

const extractDashboardStats = (payload: unknown): DashboardStats => {
  const response = payload as
    | ApiResponse<DashboardStats>
    | {
        data?:
          | DashboardStats
          | {
              stats?: DashboardStats;
              users?: {
                totalUsers?: number;
                totalCandidates?: number;
                totalRecruiters?: number;
                totalAdmins?: number;
                suspendedUsers?: number;
              };
              jobs?: {
                availableJobs?: number;
                totalJobs?: number;
                pendingJobs?: number;
                approvedJobs?: number;
                rejectedJobs?: number;
                closedJobs?: number;
              };
              applications?: {
                totalApplications?: number;
                byStatus?: Array<{ _id?: string; count?: number }>;
              };
              notifications?: {
                totalNotifications?: number;
                unreadNotifications?: number;
              };
            };
        stats?: DashboardStats;
      };

  if (response && typeof response === 'object') {
    if ('data' in response && response.data && typeof response.data === 'object') {
      if ('stats' in response.data && response.data.stats) {
        return response.data.stats;
      }

      if (
        'users' in response.data ||
        'jobs' in response.data ||
        'applications' in response.data ||
        'notifications' in response.data
      ) {
        const users = ('users' in response.data ? response.data.users : undefined) || {};
        const jobs = ('jobs' in response.data ? response.data.jobs : undefined) || {};
        const applications =
          ('applications' in response.data ? response.data.applications : undefined) || {};
        const notifications =
          ('notifications' in response.data ? response.data.notifications : undefined) || {};

        const byStatus = Array.isArray(applications.byStatus) ? applications.byStatus : [];
        const getStatusCount = (name: string) =>
          byStatus.find((item) => String(item?._id || '').toLowerCase() === name)?.count || 0;

        return {
          availableJobs: jobs.availableJobs || jobs.totalJobs || 0,
          totalUsers: users.totalUsers || 0,
          totalCandidates: users.totalCandidates || 0,
          totalRecruiters: users.totalRecruiters || 0,
          totalAdmins: users.totalAdmins || 0,
          suspendedUsers: users.suspendedUsers || 0,
          totalJobs: jobs.totalJobs || jobs.availableJobs || 0,
          activeJobs: jobs.approvedJobs || jobs.availableJobs || 0,
          pendingJobs: jobs.pendingJobs || 0,
          approvedJobs: jobs.approvedJobs || 0,
          rejectedJobs: jobs.rejectedJobs || 0,
          closedJobs: jobs.closedJobs || 0,
          totalApplications: applications.totalApplications || 0,
          pendingApplications: getStatusCount('pending'),
          shortlistedCount: getStatusCount('shortlisted'),
          hiredCount: getStatusCount('hired'),
          withdrawnCount: getStatusCount('withdrawn'),
          totalNotifications: notifications.totalNotifications || 0,
          unreadNotifications: notifications.unreadNotifications || 0,
        };
      }

      return response.data as DashboardStats;
    }

    if ('stats' in response && response.stats) {
      return response.stats;
    }
  }

  return {} as DashboardStats;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const primaryEndpoint = getPrimaryProfileEndpoint();
      const secondaryEndpoint = primaryEndpoint === '/admin/profile' ? '/users/profile' : '/admin/profile';

      try {
        const response = await api.get(primaryEndpoint);
        const profile = extractProfile(response.data);
        if (!profile) {
          throw new Error('Profile data missing from response');
        }
        return profile;
      } catch {
        const fallbackResponse = await api.get(secondaryEndpoint);
        const profile = extractProfile(fallbackResponse.data);
        if (!profile) {
          throw new Error('Profile data missing from response');
        }
        return profile;
      }
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { updateUser } = useAuth();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAdminContext = currentPath.startsWith('/admin') || getStoredRole() === 'admin';

      if (isAdminContext) {
        const response = await api.put('/admin/profile', data);
        const profile = extractProfile(response.data);
        if (!profile) {
          throw new Error('Updated profile missing from response');
        }
        return profile;
      }

      const primaryEndpoint = getPrimaryProfileEndpoint();
      const secondaryEndpoint = primaryEndpoint === '/admin/profile' ? '/users/profile' : '/admin/profile';

      try {
        const response = await api.put(primaryEndpoint, data);
        const profile = extractProfile(response.data);
        if (!profile) {
          throw new Error('Updated profile missing from response');
        }
        return profile;
      } catch {
        const fallbackResponse = await api.put(secondaryEndpoint, data);
        const profile = extractProfile(fallbackResponse.data);
        if (!profile) {
          throw new Error('Updated profile missing from response');
        }
        return profile;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (data) {
        updateUser(data);
      }
      toast.success('Profile updated successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAdminContext = currentPath.startsWith('/admin') || getStoredRole() === 'admin';
      const isCandidateContext = currentPath.startsWith('/candidate') || getStoredRole() === 'candidate';
      const isRecruiterContext = currentPath.startsWith('/recruiter') || getStoredRole() === 'recruiter';

      const endpoints = [
        '/admin/dashboard/stats',
        '/recruiter/dashboard/stats',
        '/candidate/dashboard/stats',
        '/users/dashboard/stats',
        '/admin/stats',
        '/dashboard/stats',
      ];

      const orderedEndpoints = isAdminContext
        ? endpoints
        : isRecruiterContext
        ? ['/recruiter/dashboard/stats', '/users/dashboard/stats', '/dashboard/stats', '/admin/dashboard/stats']
        : isCandidateContext
        ? ['/candidate/dashboard/stats', '/users/dashboard/stats', '/admin/dashboard/stats', '/dashboard/stats']
        : ['/users/dashboard/stats', '/admin/dashboard/stats', '/dashboard/stats'];

      for (const endpoint of orderedEndpoints) {
        try {
          const response = await api.get(endpoint);
          return extractDashboardStats(response.data);
        } catch {
          // try next endpoint
        }
      }

      throw new Error('Failed to fetch dashboard statistics');
    },
  });
};

export const useAllUsers = (role?: string) => {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const normalizedRole = String(role || '').toLowerCase();
      const endpoint =
        normalizedRole === 'candidate'
          ? '/admin/users/candidates'
          : normalizedRole === 'recruiter'
          ? '/admin/users/recruiters'
          : '/admin/users';

      const response = await api.get(endpoint);

      const normalizeUser = (input: Partial<User> & { isSuspended?: boolean }): User => ({
        _id: input._id || '',
        name: input.name || 'User',
        email: input.email || '',
        role: (input.role as User['role']) || 'candidate',
        status: input.status,
        approvalStatus: input.approvalStatus,
        recruiterApprovalStatus: input.recruiterApprovalStatus,
        isApproved: input.isApproved,
        isActive: typeof input.isActive === 'boolean' ? input.isActive : !input.isSuspended,
        createdAt: input.createdAt || new Date().toISOString(),
        updatedAt: input.updatedAt || new Date().toISOString(),
        phone: input.phone,
        avatar: input.avatar,
        profileImage: input.profileImage,
        companyName: input.companyName,
        companyLogo: input.companyLogo,
        bio: input.bio,
        biodata: input.biodata || input.bio,
        skills: input.skills,
        experience: input.experience,
        education: input.education,
        portfolio: input.portfolio,
        resume: input.resume,
        location: input.location,
      });

      const payload = response.data as
        | PaginatedResponse<User>
        | ApiResponse<User[]>
        | { success?: boolean; users?: User[]; pagination?: PaginatedResponse<User>['pagination'] }
        | {
            success?: boolean;
            data?: {
              users?: User[];
              allUsers?: Array<Partial<User> & { isSuspended?: boolean }>;
              candidates?: Array<Partial<User> & { isSuspended?: boolean }>;
              recruiters?: Array<Partial<User> & { isSuspended?: boolean }>;
              pagination?: PaginatedResponse<User>['pagination'];
            };
          };

      if (payload && 'data' in payload && Array.isArray(payload.data)) {
        return payload as PaginatedResponse<User>;
      }

      if (payload && 'users' in payload && Array.isArray(payload.users)) {
        const users = payload.users.map((user) => normalizeUser(user));
        return {
          success: payload.success ?? true,
          data: users,
          pagination: payload.pagination || {
            total: users.length,
            page: 1,
            limit: users.length,
            pages: 1,
          },
        } as PaginatedResponse<User>;
      }

      if (
        payload &&
        'data' in payload &&
        payload.data &&
        typeof payload.data === 'object' &&
        (
          ('users' in payload.data && Array.isArray(payload.data.users)) ||
          ('allUsers' in payload.data && Array.isArray(payload.data.allUsers)) ||
          ('candidates' in payload.data && Array.isArray(payload.data.candidates)) ||
          ('recruiters' in payload.data && Array.isArray(payload.data.recruiters))
        )
      ) {
        const roleKey = role?.toLowerCase();
        const selectedRawUsers =
          roleKey === 'candidate'
            ? payload.data.candidates || payload.data.allUsers || payload.data.users || []
            : roleKey === 'recruiter'
            ? payload.data.recruiters || payload.data.allUsers || payload.data.users || []
            : payload.data.allUsers || payload.data.users || [];

        const users = selectedRawUsers.map((user) => normalizeUser(user));

        return {
          success: ('success' in payload ? payload.success : true) ?? true,
          data: users,
          pagination: payload.data.pagination || {
            total: users.length,
            page: 1,
            limit: users.length,
            pages: 1,
          },
        } as PaginatedResponse<User>;
      }

      return {
        success: true,
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 0,
          pages: 1,
        },
      } as PaginatedResponse<User>;
    },
  });
};

export const useAdminUsersSummary = () => {
  return useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: async () => {
      const response = await api.get('/admin/users');
      const payload = response.data as {
        success?: boolean;
        data?: {
          totalUsers?: number;
          candidate?: number;
          recruiter?: number;
          allUsers?: Array<{ role?: string }>;
          candidates?: Array<unknown>;
          recruiters?: Array<unknown>;
        };
      };

      const allUsers = payload?.data?.allUsers || [];
      const countedCandidates = allUsers.filter((user) => String(user.role || '').toLowerCase() === 'candidate').length;
      const countedRecruiters = allUsers.filter((user) => String(user.role || '').toLowerCase() === 'recruiter').length;

      return {
        totalUsers: payload?.data?.totalUsers ?? allUsers.length,
        totalCandidates: payload?.data?.candidate ?? payload?.data?.candidates?.length ?? countedCandidates,
        totalRecruiters: payload?.data?.recruiter ?? payload?.data?.recruiters?.length ?? countedRecruiters,
      };
    },
  });
};

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, suspend }: { userId: string; suspend: boolean }) => {
      const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/suspend`, {
        suspend,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/role`, {
        role,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User role updated successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useApproveRecruiter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const response = await api.put<ApiResponse<User>>(
        `/admin/users/${userId}/recruiter-approval`,
        { status }
      );
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Recruiter approval status updated successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};

export const useRejectRecruiter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await api.put<ApiResponse<User>>(`/admin/users/${userId}/reject`, {});
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('Recruiter rejected successfully!');
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
