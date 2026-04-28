import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

// Resume Analyzer: POST /api/analytics/analyze-resume
export const analyzeResume = async (resumeFile: File) => {
  const formData = new FormData();
  formData.append('resume', resumeFile);
  const res = await axios.post(`${API_BASE}/api/analytics/analyze-resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

// Candidate Ranking: GET /api/analytics/rank-candidates?jobId=...
export const rankCandidates = async (jobId: string) => {
  const res = await axios.get(`${API_BASE}/api/analytics/rank-candidates?jobId=${jobId}`);
  return res.data;
};

// Skill Gap: GET /api/analytics/skill-gap?userId=...&jobId=...
export const getSkillGap = async (userId: string, jobId: string) => {
  const res = await axios.get(`${API_BASE}/api/analytics/skill-gap?userId=${userId}&jobId=${jobId}`);
  return res.data;
};

// Resume Builder: GET /api/analytics/generate-resume?userId=...
export const generateResume = async (userId: string) => {
  const res = await axios.get(`${API_BASE}/api/analytics/generate-resume?userId=${userId}`);
  return res.data;
};

// Salary Prediction: GET /api/analytics/predict-salary?userId=...&jobId=...
export const predictSalary = async (userId: string, jobId?: string) => {
  let url = `${API_BASE}/api/analytics/predict-salary?userId=${userId}`;
  if (jobId) url += `&jobId=${jobId}`;
  const res = await axios.get(url);
  return res.data;
};