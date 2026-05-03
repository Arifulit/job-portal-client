const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const reviewStore = new Map();
const candidateProfileStore = new Map();

app.use(cors());
app.use(express.json());

async function uploadResumeToCloudinary(file) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured');
  }

  if (!uploadPreset) {
    throw new Error('Cloudinary upload preset is not configured');
  }

  const formData = new FormData();
  const blob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });
  formData.append('file', blob, file.originalname || 'resume.pdf');
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', 'resumes');

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, {
    method: 'POST',
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Failed to upload resume to Cloudinary');
  }

  const fileUrl = payload.secure_url || payload.url;
  const downloadUrl = fileUrl ? fileUrl.replace('/upload/', '/upload/fl_attachment/') : undefined;

  return {
    fileUrl,
    sourceUrl: fileUrl,
    downloadUrl,
    fileName: file.originalname,
  };
}


const SKILL_KEYWORDS = [
  'javascript', 'typescript', 'react', 'node.js', 'node', 'express', 'express.js', 'python', 'java', 'c#', 'c++',
  'sql', 'nosql', 'mongodb', 'postgres', 'mysql', 'html', 'css', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
  'rest', 'api', 'redux', 'next.js', 'nextjs', 'tailwind', 'mongoose', 'prisma', 'graphql'
];

const NORMALIZE_ALIASES = {
  'node': 'node.js',
  'express.js': 'express',
  'nextjs': 'next.js',
};

function fetchJsonIfPossible(url, authHeader) {
  if (!url || typeof fetch !== 'function') {
    return Promise.resolve(null);
  }

  return fetch(url, {
    headers: authHeader ? { Authorization: authHeader } : undefined,
  })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null);
}

function extractSkillsFromText(text) {
  const lc = normalizeText(text);
  return Array.from(
    new Set(
      SKILL_KEYWORDS.filter((skill) => lc.includes(skill)).map((skill) => NORMALIZE_ALIASES[skill] || skill)
    )
  );
}

function analyzeText(text) {
  const extractedSkills = extractSkillsFromText(text);
  const missingSkills = SKILL_KEYWORDS.filter((skill) => !extractedSkills.includes(NORMALIZE_ALIASES[skill] || skill)).slice(0, 8);

  // simple experience estimation
  const lc = text.toLowerCase();
  const yearMatch = lc.match(/(\d{1,2})\s+years?/);
  const experienceYears = yearMatch ? parseInt(yearMatch[1], 10) : 0;

  // education detection
  const educationKeywords = ['bachelor', 'master', 'b.sc', 'm.sc', 'bs', 'ms', 'mba', 'phd', 'diploma'];
  const foundEducation = educationKeywords.filter((k) => lc.includes(k));

  // Improved score calculation - more realistic and generous
  const baseScore = 30; // Start with 30 for effort
  
  // Skills scoring (max 25)
  const skillsScore = Math.min(25, Math.max(5, extractedSkills.length * 3));
  
  // Experience scoring (max 20)
  const expScore = experienceYears > 0 
    ? Math.min(20, 5 + (experienceYears * 2)) 
    : 5; // Give 5 points even without exp years
  
  // Education scoring (max 15) - be more lenient
  const eduScore = foundEducation.length > 0 
    ? Math.min(15, 8 + (foundEducation.length * 3))
    : 5; // Give 5 points for any education content
  
  // Formatting and completeness scoring (max 15)
  const contentLength = text.trim().length;
  const formattingScore = contentLength > 500 ? 15 
    : contentLength > 300 ? 12 
    : contentLength > 150 ? 8 
    : 3;

  const totalScore = Math.min(100, baseScore + skillsScore + expScore + eduScore + formattingScore);

  const scoreBreakdown = {
    formatting: formattingScore,
    skills: skillsScore,
    experience: expScore,
    education: eduScore,
    completeness: Math.round((extractedSkills.length / Math.max(1, SKILL_KEYWORDS.length)) * 100),
  };

  const strengths = [];
  if (extractedSkills.length) strengths.push(`Detected ${extractedSkills.length} relevant technical skills`);
  if (experienceYears >= 2) strengths.push(`Shows ${experienceYears}+ years of practical experience`);
  if (experienceYears > 0 && experienceYears < 2) strengths.push('Shows early-career development');
  if (foundEducation.length) strengths.push(`Contains ${foundEducation.length} education qualification(s)`);
  if (contentLength > 300) strengths.push('Well-detailed resume content');

  const suggestions = [];
  if (extractedSkills.length === 0) suggestions.push('Add technical skills like JavaScript, React, Node.js, Python, etc. to boost your score.');
  else if (extractedSkills.length < 5) suggestions.push(`Consider adding more skills. You currently have ${extractedSkills.length}. Add 2-3 more relevant technologies.`);
  
  if (foundEducation.length === 0) suggestions.push('Include your education (degree, field of study, university).');
  
  if (experienceYears === 0) suggestions.push('Mention your years of experience (e.g., "2 years of experience in Web Development").');
  else if (experienceYears > 0 && experienceYears < 2) suggestions.push('As a fresher, highlight internships, projects, and certifications.');
  
  if (contentLength < 300) suggestions.push('Expand your resume content with more details about projects, achievements, and responsibilities.');

  return {
    score: totalScore,
    scoreBreakdown,
    extractedSkills,
    missingSkills,
    strengths,
    suggestions,
    summary: `Parsed ${extractedSkills.length} skills, ${experienceYears} years experience detected, education keywords: ${foundEducation.join(', ')}`
  };
}

function normalizeText(value) {
  return String(value || '').toLowerCase();
}

function normalizeSkillList(list) {
  return Array.from(
    new Set(
      (Array.isArray(list) ? list : [])
        .map((item) => normalizeText(item).trim())
        .filter(Boolean)
        .map((item) => NORMALIZE_ALIASES[item] || item)
    )
  );
}

function parseExperienceYears(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  const text = normalizeText(value);
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:\+\s*)?(?:years?|yrs?)/i);

  if (match) {
    return Math.max(0, Number.parseFloat(match[1]) || 0);
  }

  const fallback = Number.parseFloat(text);
  return Number.isFinite(fallback) ? Math.max(0, fallback) : 0;
}

function getCompanyReviewList(companyId) {
  if (!reviewStore.has(companyId)) {
    reviewStore.set(companyId, []);
  }

  return reviewStore.get(companyId);
}

function buildReviewPayload(companyId, body, existingReview) {
  const rating = Math.max(1, Math.min(5, Number(body?.rating || existingReview?.rating || 1)));
  const reviewText = String(body?.review || existingReview?.review || '').trim();
  const userId = String(body?.userId || existingReview?.user || '').trim();

  if (!userId) {
    return { error: 'userId is required' };
  }

  if (!reviewText) {
    return { error: 'review is required' };
  }

  return {
    company: companyId,
    user: userId,
    rating,
    review: reviewText,
    isVisible: true,
  };
}

function rankCandidates(jobDescription, candidates) {
  const jobText = normalizeText(jobDescription);
  const skillKeywords = extractSkillsFromText(jobText);

  return (Array.isArray(candidates) ? candidates : []).map((candidate) => {
    const applicationId = String(candidate?.applicationId || '').trim();
    const candidateId = String(candidate?.candidateId || '').trim();
    const candidateName = candidate?.name || 'Candidate';
    const candidateEmail = String(candidate?.email || '').trim();
    const resumeUrl = String(candidate?.resumeUrl || '').trim();
    const summary = String(candidate?.summary || '').trim();
    const candidateSkills = normalizeSkillList(candidate?.skills);
    const candidateExperience = parseExperienceYears(candidate?.experience);
    const candidateSkillText = candidateSkills.join(' ');
    const candidateText = normalizeText(`${candidateName} ${candidateSkillText} ${summary}`);

    let skillMatches = 0;
    const matchedSkills = [];

    for (const keyword of skillKeywords) {
      if (keyword && candidateText.includes(keyword)) {
        skillMatches += 1;
        matchedSkills.push(keyword);
      }
    }

    const uniqueSkills = Array.from(new Set(candidateSkills));
    const overlapBonus = uniqueSkills.filter((skill) => jobText.includes(skill)).length * 10;
    const resumeSignalBonus = extractSkillsFromText(candidateText)
      .filter((skill) => skillKeywords.includes(skill))
      .length * 8;
    const experienceBonus = Math.min(30, candidateExperience * 6);
    const keywordBonus = Math.min(70, skillMatches * 12 + overlapBonus + resumeSignalBonus);

    const score = Math.max(0, Math.min(100, Math.round(keywordBonus + experienceBonus)));

    return {
      applicationId: applicationId || undefined,
      candidateId: candidateId || undefined,
      name: candidateName,
      email: candidateEmail || undefined,
      resumeUrl: resumeUrl || undefined,
      summary: summary || undefined,
      score,
      matchedSkills: Array.from(new Set(matchedSkills)),
      experience: candidateExperience,
    };
  }).sort((a, b) => b.score - a.score);
}

async function resolveCandidateGapInputs(reqBody, authHeader) {
  const jobId = String(reqBody?.jobId || '').trim();
  const userId = String(reqBody?.userId || '').trim();

  const candidateSkillsFromBody = normalizeSkillList(reqBody?.candidateSkills);
  const jobSkillsFromBody = normalizeSkillList(reqBody?.jobSkills);

  let candidateSkills = candidateSkillsFromBody;
  let jobSkills = jobSkillsFromBody;

  const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

  if (!candidateSkills.length && upstreamBase && userId) {
    const candidatePayload = await fetchJsonIfPossible(
      `${upstreamBase}/candidate/profile/${userId}`,
      authHeader
    ) || await fetchJsonIfPossible(`${upstreamBase}/candidate/profile`, authHeader);

    const profile = candidatePayload?.data || candidatePayload?.candidate || candidatePayload;
    candidateSkills = normalizeSkillList(profile?.skills);
  }

  if (!jobSkills.length && upstreamBase && jobId) {
    const jobPayload = await fetchJsonIfPossible(`${upstreamBase}/jobs/${jobId}`, authHeader);
    const job = jobPayload?.data || jobPayload?.job || jobPayload;
    jobSkills = normalizeSkillList(job?.skills);

    if (!jobSkills.length) {
      jobSkills = extractSkillsFromText(job?.description || job?.jobDescription || job?.title || '');
    }
  }

  if (!jobSkills.length && reqBody?.jobDescription) {
    jobSkills = extractSkillsFromText(reqBody.jobDescription);
  }

  return { jobId, userId, candidateSkills, jobSkills };
}

async function resolveRequesterRole(authHeader) {
  const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

  if (!upstreamBase || !authHeader) {
    return '';
  }

  const authPayload = await fetchJsonIfPossible(`${upstreamBase}/auth/me`, authHeader);
  const user = authPayload?.data?.user || authPayload?.user || authPayload?.data || authPayload;

  return String(user?.role || '').toLowerCase();
}

async function authorizeRecruiter(req, res) {
  try {
    const authHeader = req.headers.authorization || '';
    const role = await resolveRequesterRole(authHeader);

    if (role !== 'recruiter') {
      res.status(403).json({
        success: false,
        message: 'Only recruiters can access candidate ranking endpoints',
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Recruiter authorization error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to authorize recruiter request',
    });
    return false;
  }
}

function extractCandidateList(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.candidates)) {
    return payload.candidates;
  }

  if (Array.isArray(payload?.data?.candidates)) {
    return payload.data.candidates;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

const analyzeResumeHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const dataBuffer = req.file.buffer;

    let text = '';
    try {
      const data = await pdf(dataBuffer);
      text = data.text || '';
    } catch (err) {
      // Not a readable PDF or parse failed
      return res.json({
        success: false,
        score: 0,
        scoreBreakdown: { formatting: 0, skills: 0, experience: 0, education: 0, completeness: 0 },
        extractedSkills: [],
        missingSkills: [],
        strengths: [],
        suggestions: ['The provided file could not be parsed as a readable PDF. Please upload a text-based PDF or a plain text resume.'],
        summary: 'Could not extract text from the uploaded file.'
      });
    }

    if (!text || text.trim().length < 20) {
      return res.json({
        success: false,
        score: 0,
        scoreBreakdown: { formatting: 0, skills: 0, experience: 0, education: 0, completeness: 0 },
        extractedSkills: [],
        missingSkills: [],
        strengths: [],
        suggestions: ['The provided PDF appears to be binary or image-based. Provide a text-searchable PDF or paste resume text.'],
        summary: 'The resume content could not be extracted or analyzed from the provided input.'
      });
    }

    const analysis = analyzeText(text);

    return res.json({ success: true, ...analysis });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

app.post('/resume/analyze', upload.single('file'), analyzeResumeHandler);
app.post('/candidate/resume/analyze', upload.single('file'), analyzeResumeHandler);
app.post('/candidate/resume/analyze', upload.single('file'), analyzeResumeHandler);

const rankCandidatesHandler = (req, res) => {
  const jobDescription = req.body?.jobDescription || '';
  const candidates = req.body?.candidates || [];

  if (!jobDescription || !Array.isArray(candidates)) {
    return res.status(400).json({
      success: false,
      message: 'jobDescription and candidates are required',
      rankedCandidates: [],
    });
  }

  const rankedCandidates = rankCandidates(jobDescription, candidates);

  return res.json({
    success: true,
    rankedCandidates,
  });
};

const protectedRankCandidatesHandler = async (req, res) => {
  try {
    const authorized = await authorizeRecruiter(req, res);
    if (!authorized) {
      return;
    }

    return rankCandidatesHandler(req, res);
  } catch (error) {
    console.error('Rank authorization error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to authorize candidate ranking request',
      rankedCandidates: [],
    });
  }
};

app.post('/api/v1/candidate/candidates/rank', protectedRankCandidatesHandler);
app.post('/candidate/candidates/rank', protectedRankCandidatesHandler);

const recruiterCandidatesListHandler = async (req, res) => {
  const authorized = await authorizeRecruiter(req, res);
  if (!authorized) {
    return;
  }

  const authHeader = req.headers.authorization || '';
  const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

  if (!upstreamBase) {
    return res.status(503).json({
      success: false,
      message: 'Upstream API URL is not configured',
      candidates: [],
    });
  }

  const payload = await fetchJsonIfPossible(`${upstreamBase}/candidate/candidates${query}`, authHeader);
  const candidates = extractCandidateList(payload);

  return res.json({
    success: payload?.success ?? true,
    message: payload?.message,
    candidates,
    count: typeof payload?.count === 'number' ? payload.count : candidates.length,
  });
};

const recruiterCandidatesRankedHandler = async (req, res) => {
  const authorized = await authorizeRecruiter(req, res);
  if (!authorized) {
    return;
  }

  const authHeader = req.headers.authorization || '';
  const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');
  const query = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

  if (!upstreamBase) {
    return res.status(503).json({
      success: false,
      message: 'Upstream API URL is not configured',
      rankedCandidates: [],
    });
  }

  const payload = await fetchJsonIfPossible(`${upstreamBase}/candidate/candidates/ranked${query}`, authHeader);
  const rankedCandidates = Array.isArray(payload?.rankedCandidates)
    ? payload.rankedCandidates
    : extractCandidateList(payload);

  return res.json({
    success: payload?.success ?? true,
    message: payload?.message,
    rankedCandidates,
    count: typeof payload?.count === 'number' ? payload.count : rankedCandidates.length,
  });
};

app.get('/api/v1/candidate/candidates', recruiterCandidatesListHandler);
app.get('/candidate/candidates', recruiterCandidatesListHandler);
app.get('/api/v1/candidate/candidates/ranked', recruiterCandidatesRankedHandler);
app.get('/candidate/candidates/ranked', recruiterCandidatesRankedHandler);

const candidateGapHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const { candidateSkills, jobSkills, jobId, userId } = await resolveCandidateGapInputs(req.body, authHeader);

    if (!candidateSkills.length && !jobSkills.length) {
      return res.status(400).json({
        success: false,
        message: 'Unable to resolve candidate or job skills. Provide jobDescription, candidateSkills, or connect upstream profile/job APIs.',
        missingSkills: [],
      });
    }

    const missingSkills = jobSkills.filter((skill) => !candidateSkills.includes(skill));
    const matchedSkills = jobSkills.filter((skill) => candidateSkills.includes(skill));

    return res.json({
      success: true,
      jobId,
      userId,
      candidateSkills,
      jobSkills,
      matchedSkills,
      missingSkills,
      summary: missingSkills.length
        ? `Candidate is missing ${missingSkills.length} required skill${missingSkills.length === 1 ? '' : 's'}.`
        : 'Candidate matches the requested skill set.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Failed to calculate skill gap', missingSkills: [] });
  }
};

app.post('/api/v1/candidate/candidates/gap', candidateGapHandler);

app.post('/candidate/candidates/gap', candidateGapHandler);

const createCompanyReviewHandler = (req, res) => {
  const companyId = String(req.params.companyId || '').trim();
  if (!companyId) {
    return res.status(400).json({ success: false, message: 'companyId is required' });
  }

  const nextReview = buildReviewPayload(companyId, req.body);
  if (nextReview.error) {
    return res.status(400).json({ success: false, message: nextReview.error });
  }

  const reviews = getCompanyReviewList(companyId);
  const existingIndex = reviews.findIndex((item) => item.user === nextReview.user);
  const timestamp = new Date().toISOString();
  const reviewRecord = {
    _id: existingIndex >= 0 ? reviews[existingIndex]._id : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt: existingIndex >= 0 ? reviews[existingIndex].createdAt : timestamp,
    updatedAt: timestamp,
    ...nextReview,
  };

  if (existingIndex >= 0) {
    reviews[existingIndex] = reviewRecord;
  } else {
    reviews.unshift(reviewRecord);
  }

  return res.status(existingIndex >= 0 ? 200 : 201).json({ success: true, data: reviewRecord });
};

const updateCompanyReviewHandler = (req, res) => {
  const companyId = String(req.params.companyId || '').trim();
  const userId = String(req.body?.userId || '').trim();

  if (!companyId) {
    return res.status(400).json({ success: false, message: 'companyId is required' });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const reviews = getCompanyReviewList(companyId);
  const existingIndex = reviews.findIndex((item) => item.user === userId);

  if (existingIndex < 0) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const existingReview = reviews[existingIndex];
  const nextReview = buildReviewPayload(companyId, req.body, existingReview);

  if (nextReview.error) {
    return res.status(400).json({ success: false, message: nextReview.error });
  }

  const updatedReview = {
    ...existingReview,
    ...nextReview,
    updatedAt: new Date().toISOString(),
  };

  reviews[existingIndex] = updatedReview;

  return res.json({ success: true, data: updatedReview });
};

const deleteCompanyReviewHandler = (req, res) => {
  const companyId = String(req.params.companyId || '').trim();
  const userId = String(req.body?.userId || req.query?.userId || '').trim();

  if (!companyId) {
    return res.status(400).json({ success: false, message: 'companyId is required' });
  }

  if (!userId) {
    return res.status(400).json({ success: false, message: 'userId is required' });
  }

  const reviews = getCompanyReviewList(companyId);
  const existingIndex = reviews.findIndex((item) => item.user === userId);

  if (existingIndex < 0) {
    return res.status(404).json({ success: false, message: 'Review not found' });
  }

  const removedReview = reviews.splice(existingIndex, 1)[0];

  return res.json({ success: true, data: removedReview });
};

app.post('/api/v1/company/:companyId/reviews', createCompanyReviewHandler);
app.put('/api/v1/company/:companyId/reviews', updateCompanyReviewHandler);
app.delete('/api/v1/company/:companyId/reviews', deleteCompanyReviewHandler);
app.post('/company/:companyId/reviews', createCompanyReviewHandler);
app.put('/company/:companyId/reviews', updateCompanyReviewHandler);
app.delete('/company/:companyId/reviews', deleteCompanyReviewHandler);

/*
  Proxy /api/v1/company/:companyId/profile to upstream API if configured.
  Falls back to a few common upstream paths and returns a 503 if no upstream is configured.
*/
const getCompanyProfileHandler = async (req, res) => {
  try {
    const companyId = String(req.params.companyId || '').trim();
    if (!companyId) {
      return res.status(400).json({ success: false, message: 'companyId is required' });
    }

    const authHeader = req.headers.authorization || '';
    const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

    if (!upstreamBase) {
      return res.status(503).json({ success: false, message: 'Upstream API URL is not configured' });
    }

    // try a few common upstream paths for company profile
    const candidates = [
      `${upstreamBase}/company/${companyId}/profile`,
      `${upstreamBase}/company/${companyId}`,
      `${upstreamBase}/companies/${companyId}`,
    ];

    let payload = null;
    for (const url of candidates) {
      payload = await fetchJsonIfPossible(url, authHeader);
      if (payload) break;
    }

    if (!payload) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }

    return res.json({ success: true, data: payload.data ?? payload });
  } catch (err) {
    console.error('Get company profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch company profile' });
  }
};

app.get('/api/v1/company/:companyId/profile', getCompanyProfileHandler);
app.get('/company/:companyId/profile', getCompanyProfileHandler);

/*
  List companies (proxied to upstream). Supports querystring passthrough.
*/
const listCompaniesHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

    if (!upstreamBase) {
      return res.status(503).json({ success: false, message: 'Upstream API URL is not configured' });
    }

    const qs = req.url.includes('?') ? req.url.slice(req.url.indexOf('?')) : '';

    const candidates = [
      `${upstreamBase}/company${qs}`,
      `${upstreamBase}/companies${qs}`,
      `${upstreamBase}/api/v1/company${qs}`,
      `${upstreamBase}/api/v1/companies${qs}`,
    ];

    let payload = null;
    for (const url of candidates) {
      payload = await fetchJsonIfPossible(url, authHeader);
      if (payload) break;
    }

    if (!payload) {
      return res.status(404).json({ success: false, message: 'No companies found' });
    }

    return res.json({ success: payload?.success ?? true, data: payload.data ?? payload });
  } catch (err) {
    console.error('List companies error:', err);
    return res.status(500).json({ success: false, message: 'Failed to list companies' });
  }
};

app.get('/api/v1/company', listCompaniesHandler);
app.get('/company', listCompaniesHandler);

/*
  Fetch basic company info by id (proxied to upstream).
*/
const getCompanyBasicHandler = async (req, res) => {
  try {
    const companyId = String(req.params.companyId || '').trim();
    if (!companyId) return res.status(400).json({ success: false, message: 'companyId is required' });

    const authHeader = req.headers.authorization || '';
    const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');

    if (!upstreamBase) {
      return res.status(503).json({ success: false, message: 'Upstream API URL is not configured' });
    }

    const candidates = [
      `${upstreamBase}/company/${companyId}`,
      `${upstreamBase}/companies/${companyId}`,
      `${upstreamBase}/api/v1/company/${companyId}`,
      `${upstreamBase}/api/v1/companies/${companyId}`,
    ];

    let payload = null;
    for (const url of candidates) {
      payload = await fetchJsonIfPossible(url, authHeader);
      if (payload) break;
    }

    if (!payload) return res.status(404).json({ success: false, message: 'Company not found' });

    return res.json({ success: payload?.success ?? true, data: payload.data ?? payload });
  } catch (err) {
    console.error('Get company basic error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch company' });
  }
};

app.get('/api/v1/company/:companyId', getCompanyBasicHandler);
app.get('/company/:companyId', getCompanyBasicHandler);

app.post('/api/v1/candidate/resume', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadResumeToCloudinary(req.file);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to upload resume' });
  }
});

app.post('/candidate/resume', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const result = await uploadResumeToCloudinary(req.file);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    console.error('Resume upload error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to upload resume' });
  }
});

/*
  Accept profile updates (PUT or POST). Supports:
  - multipart/form-data with a file field named 'resume' (File upload)
  - form or json body with 'resume' as a URL string
  Returns a simple profile-like object under `data` for client-side consumption.
*/
const upsertCandidateProfileHandler = async (req, res) => {
  try {
    const authHeader = req.headers.authorization || '';
    const upstreamBase = String(process.env.UPSTREAM_API_URL || process.env.API_BASE_URL || process.env.VITE_API_URL || '').replace(/\/$/, '');
    const file = req.file;
    const body = req.body || {};

    const parseSkills = () => {
      try {
        if (!body.skills) {
          return undefined;
        }

        return Array.isArray(body.skills) ? body.skills : JSON.parse(body.skills);
      } catch (error) {
        return undefined;
      }
    };

    const buildLocalProfile = (resumeUrl) => {
      const profile = {
        _id: body?._id || body?.userId || body?.user?._id || undefined,
        name: body?.name || body?.fullName || undefined,
        phone: body?.phone || undefined,
        headline: body?.headline || undefined,
        location: body?.location || body?.address || undefined,
        biodata: body?.biodata || body?.bio || body?.summary || undefined,
        skills: parseSkills(),
        resume: resumeUrl || body?.resume || undefined,
        avatar: body?.avatar || undefined,
        updatedAt: new Date().toISOString(),
      };

      const storeKey = String(profile._id || body?.userId || req.headers['x-user-id'] || 'default');
      const existing = candidateProfileStore.get(storeKey) || {};
      const merged = { ...existing, ...profile };

      candidateProfileStore.set(storeKey, merged);
      return merged;
    };

    let resumeUrl = typeof body.resume === 'string' ? String(body.resume).trim() : '';

    if (file) {
      try {
        const uploadResult = await uploadResumeToCloudinary(file);
        resumeUrl = uploadResult.fileUrl || uploadResult.sourceUrl || uploadResult.downloadUrl || resumeUrl;
      } catch (uploadError) {
        console.error('Resume upload during profile save failed:', uploadError);
      }
    }

    const localProfile = buildLocalProfile(resumeUrl);

    if (!upstreamBase) {
      return res.json({ success: true, message: 'Profile updated', data: localProfile });
    }

    // When upstream is configured, forward the request to upstream profile endpoints as a best effort.
    const endpoints = [
      `${upstreamBase}/candidate/profile`,
      `${upstreamBase}/api/v1/candidate/profile`,
      `${upstreamBase}/users/profile`,
      `${upstreamBase}/api/v1/users/profile`,
    ];

    let upstreamResponse = null;

    for (const url of endpoints) {
      try {
        if (file) {
          const forwardForm = new FormData();
          // copy fields
          for (const key of Object.keys(body)) {
            if (typeof body[key] !== 'undefined') {
              forwardForm.append(key, body[key]);
            }
          }
          // attach file as 'resume' to match client expectations
          try {
            const blob = new Blob([file.buffer], { type: file.mimetype || 'application/octet-stream' });
            forwardForm.append('resume', blob, file.originalname || 'resume');
          } catch (e) {
            // fallback: if Blob isn't available, upload the file to Cloudinary first and send URL
            const up = await uploadResumeToCloudinary(file);
            forwardForm.append('resume', up.fileUrl || up.sourceUrl || up.downloadUrl || '');
          }

          upstreamResponse = await fetch(url, { method: 'PUT', headers: { Authorization: authHeader }, body: forwardForm });
        } else {
          // JSON body
          upstreamResponse = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: authHeader },
            body: JSON.stringify(body),
          });
        }

        if (!upstreamResponse) continue;
        if (upstreamResponse.status >= 200 && upstreamResponse.status < 300) {
          const payload = await upstreamResponse.json().catch(() => null);
          return res.json({ success: true, data: payload?.data ?? payload ?? localProfile });
        }
      } catch (err) {
        // continue to next candidate endpoint
        continue;
      }
    }

    return res.json({
      success: true,
      message: 'Profile updated locally',
      data: localProfile,
    });
  } catch (err) {
    console.error('Profile upsert error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to update profile' });
  }
};

app.put('/api/v1/candidate/profile', upload.single('resume'), upsertCandidateProfileHandler);
app.post('/api/v1/candidate/profile', upload.single('resume'), upsertCandidateProfileHandler);
app.put('/candidate/profile', upload.single('resume'), upsertCandidateProfileHandler);
app.post('/candidate/profile', upload.single('resume'), upsertCandidateProfileHandler);

/*
  Retrieve candidate profile. Accepts optional query `userId` or header `x-user-id` to select stored profile.
*/
const getCandidateProfileHandler = async (req, res) => {
  try {
    const userId = String(req.query.userId || req.headers['x-user-id'] || 'default');
    const profile = candidateProfileStore.get(userId) || candidateProfileStore.get('default') || null;

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    return res.json({ success: true, data: profile });
  } catch (err) {
    console.error('Get candidate profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile' });
  }
};

app.get('/api/v1/candidate/profile', getCandidateProfileHandler);
app.get('/candidate/profile', getCandidateProfileHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Resume analysis server listening on ${port}`));
