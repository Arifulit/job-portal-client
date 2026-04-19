// এই ফাইলটি TypeScript type/interface declaration সংরক্ষণ করে।
export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified?: boolean;
  isSuspended?: boolean;
  resume?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  _id: string;
  user: User;
  name: string;
  phone?: string;
  skills: string[];
  location?: string;
  address?: string;
  biodata?: string;
  bio?: string;
  headline?: string;
  experienceLevel?: string;
  summary?: string;
  email?: string;
  resume?: string;
  applications?: Array<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CandidateProfileResponse {
  success: boolean;
  message: string;
  data: CandidateProfile;
}
