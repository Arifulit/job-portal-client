export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateProfile {
  _id: string;
  user: User;
  name: string;
  phone: string;
  skills: string[];
  location?: string;
  headline?: string;
  experienceLevel?: string;
  summary?: string;
  applications?: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CandidateProfileResponse {
  success: boolean;
  message: string;
  data: CandidateProfile;
}
