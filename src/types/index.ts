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
  company: string;
  companyLogo?: string;
  location: string;
  jobType: 'full-time' | 'part-time' | 'contract' | 'internship' | 'remote';
  category: string;
  salary: {
    min: number;
    max: number;
    currency: string;
  };
  description: string;
  requirements: string[];
  responsibilities: string[];
  benefits?: string[];
  experienceLevel: 'internship' | 'entry' | 'mid' | 'senior' | 'lead';
  status: JobStatus;
  postedBy: string;
  applicationDeadline: string;
  applicantsCount: number;
  views: number;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Application {
  _id: string;
  jobId: string;
  job?: Job;
  seekerId: string;
  seeker?: User;
  recruiterId: string;
  status: ApplicationStatus;
  resume: string;
  coverLetter?: string;
  appliedAt: string;
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
  search?: string;
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
