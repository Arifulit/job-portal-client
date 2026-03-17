export type UserRole = 'seeker' | 'recruiter' | 'admin';

export type JobStatus = 'active' | 'expired' | 'draft' | 'pending';

export type ApplicationStatus =
  | 'applied'
  | 'shortlisted'
  | 'interview'
  | 'offered'
  | 'hired'
  | 'rejected';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  profileImage?: string;
  companyName?: string;
  companyLogo?: string;
  bio?: string;
  skills?: string[];
  experience?: string;
  education?: string;
  portfolio?: string;
  resume?: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  _id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  salary?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  experience?: string;
  experienceLevel?: 'internship' | 'entry' | 'mid' | 'senior' | 'lead';
  deadline?: string;
  vacancies?: number;
  skills?: string[];
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
  company?: any;
  status?: string;
  isApproved?: boolean;
  statusHistory?: any[];
  createdAt: string;
  updatedAt: string;
  __v?: number;
  approvedAt?: string;
  approvedBy?: string;
}

export interface RecommendedJob {
  _id: string;
  title: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  experienceLevel?: 'internship' | 'entry' | 'mid' | 'senior' | 'lead' | 'mid-level';
  skills?: string[];
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  deadline?: string;
  relevanceScore?: number;
  company?:
    | {
        _id?: string;
        name?: string;
        industry?: string;
        logo?: string;
      }
    | string
    | null;
}

export interface Application {
  _id: string;
  jobId: string;
  job?: Job;
  seekerId: string;
  seeker?: User;
  candidate?: User;
  recruiterId: string;
  status: ApplicationStatus;
  resume: string;
  coverLetter?: string;
  appliedAt: string;
  createdAt?: string;
  statusHistory: {
    status: ApplicationStatus;
    date: string;
    note?: string;
  }[];
  updatedAt: string;
}

export interface SavedJob {
  _id: string;
  userId: string;
  jobId: string;
  job?: Job;
  savedAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: User;
  token: string;
  refreshToken?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface JobFilters {
  keyword?: string;
  category?: string;
  location?: string;
  jobType?: string;
  experienceLevel?: string;
  minSalary?: number;
  maxSalary?: number;
  page?: number;
  limit?: number;
}

export interface DashboardStats {
  totalJobs?: number;
  totalApplications?: number;
  totalUsers?: number;
  activeJobs?: number;
  pendingApplications?: number;
  shortlistedCount?: number;
  hiredCount?: number;
  views?: number;
  applicantsCount?: number;
}
