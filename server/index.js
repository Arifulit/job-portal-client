const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const reviewStore = new Map();

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

  // score calculation (very simple)
  const skillsScore = Math.min(30, extractedSkills.length * 5);
  const expScore = Math.min(30, experienceYears * 3);
  const eduScore = foundEducation.length ? 20 : 0;
  const formattingScore = text.trim().length > 200 ? 20 : 5;

  const totalScore = Math.min(100, skillsScore + expScore + eduScore + formattingScore);

  const scoreBreakdown = {
    formatting: formattingScore,
    skills: skillsScore,
    experience: expScore,
    education: eduScore,
    completeness: Math.round((extractedSkills.length / Math.max(1, SKILL_KEYWORDS.length)) * 100),
  };

  const strengths = [];
  if (extractedSkills.length) strengths.push('Detected relevant technical skills');
  if (experienceYears >= 2) strengths.push('Shows practical experience');
  if (foundEducation.length) strengths.push('Contains education details');

  const suggestions = [];
  if (!extractedSkills.length) suggestions.push('No recognizable technical skills found. Add keywords like JavaScript, React, Node.js.');
  if (!foundEducation.length) suggestions.push('Add degree information (e.g., Bachelor of Science in Computer Science).');
  if (experienceYears === 0) suggestions.push('Describe years of experience, e.g., "3 years".');

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

app.post('/api/resume/analyze', upload.single('file'), async (req, res) => {
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
});

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
    const authHeader = req.headers.authorization || '';
    const role = await resolveRequesterRole(authHeader);

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can rank candidates',
        rankedCandidates: [],
      });
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
const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Resume analysis server listening on ${port}`));
