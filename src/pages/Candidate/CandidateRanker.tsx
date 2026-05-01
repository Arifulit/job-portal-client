import React, { useEffect, useMemo, useState } from 'react';
import { Award, Briefcase, FileText, Loader2, Mail, RefreshCw, Search, Sparkles, Target } from 'lucide-react';
import { useRecruiterAllApplications } from '../../services/applicationService';
import { useRankCandidates, type RankedCandidate } from '../../services/candidateRankingService';

type CandidateOption = {
  applicationId: string;
  candidateId?: string;
  name: string;
  email?: string;
  resumeUrl?: string;
  summary?: string;
  skills: string[];
  experience?: number;
};

type JobOption = {
  jobId: string;
  title: string;
  description: string;
  requirements: string[];
  skills: string[];
  applicationCount: number;
};

const parseExperience = (value: unknown) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, value);
  }

  const text = String(value || '');
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:\+\s*)?(?:years?|yrs?)/i);

  if (match) {
    return Math.max(0, Number.parseFloat(match[1]) || 0);
  }

  const numeric = Number.parseFloat(text);
  return Number.isFinite(numeric) ? Math.max(0, numeric) : 0;
};

const normalizeSkills = (skills: unknown) =>
  Array.from(
    new Set(
      (Array.isArray(skills) ? skills : [])
        .map((skill) => String(skill || '').trim())
        .filter(Boolean)
        .map((skill) => skill.toLowerCase())
    )
  );

const buildJobDescription = (job?: JobOption) => {
  if (!job) {
    return '';
  }

  return [
    job.title,
    job.description,
    job.requirements.length ? `Requirements: ${job.requirements.join(', ')}` : '',
    job.skills.length ? `Skills: ${job.skills.join(', ')}` : '',
  ]
    .filter(Boolean)
    .join('\n');
};

const scoreTone = (score: number) => {
  if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (score >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-slate-700 bg-slate-100 border-slate-200';
};

const CandidateRanker: React.FC = () => {
  const { data: applications = [], isLoading, isError, refetch } = useRecruiterAllApplications();
  const { mutateAsync: rankCandidates, isPending, reset } = useRankCandidates();

  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const jobOptions = useMemo<JobOption[]>(() => {
    const jobMap = new Map<string, JobOption>();

    applications.forEach((application) => {
      const job = application.job;
      const jobId = application.jobId || job?._id;

      if (!jobId) {
        return;
      }

      const existing = jobMap.get(jobId);

      const requirements = Array.from(
        new Set(
          [
            ...(existing?.requirements || []),
            ...(Array.isArray(job?.requirements) ? job.requirements : []),
            ...(Array.isArray(job?.additionalRequirements) ? job.additionalRequirements : []),
          ]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
        )
      );

      const skills = Array.from(
        new Set(
          [...(existing?.skills || []), ...(Array.isArray(job?.skills) ? job.skills : [])]
            .map((value) => String(value || '').trim())
            .filter(Boolean)
        )
      );

      jobMap.set(jobId, {
        jobId,
        title: job?.title || existing?.title || 'Untitled Job',
        description: job?.description || existing?.description || '',
        requirements,
        skills,
        applicationCount: (existing?.applicationCount || 0) + 1,
      });
    });

    return Array.from(jobMap.values()).sort((a, b) => a.title.localeCompare(b.title));
  }, [applications]);

  const selectedJob = useMemo(
    () => jobOptions.find((job) => job.jobId === selectedJobId) || jobOptions[0],
    [jobOptions, selectedJobId]
  );

  const selectedApplications = useMemo(
    () => applications.filter((application) => (application.jobId || application.job?._id) === selectedJob?.jobId),
    [applications, selectedJob?.jobId]
  );

  const candidateOptions = useMemo<CandidateOption[]>(() => {
    return selectedApplications
      .map((application) => {
        const candidate = application.candidate;
        const resumeUrl = application.resume || application.downloadUrl || candidate?.resume || undefined;
        const summary = [application.coverLetter, candidate?.bio, candidate?.biodata]
          .filter(Boolean)
          .map((value) => String(value || '').trim())
          .join(' ')
          .trim();

        return {
          applicationId: application._id,
          candidateId: application.candidateId || candidate?._id,
          name: candidate?.name || 'Candidate',
          email: candidate?.email || undefined,
          resumeUrl,
          summary: summary || undefined,
          skills: normalizeSkills(candidate?.skills),
          experience: parseExperience(candidate?.experience),
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedApplications]);

  useEffect(() => {
    if (!jobOptions.length) {
      return;
    }

    if (!selectedJobId || !jobOptions.some((job) => job.jobId === selectedJobId)) {
      setSelectedJobId(jobOptions[0].jobId);
    }
  }, [jobOptions, selectedJobId]);

  useEffect(() => {
    if (!selectedJob) {
      return;
    }

    setJobDescription(buildJobDescription(selectedJob));
    setRankedCandidates([]);
    setErrorMessage('');
    reset();
  }, [reset, selectedJob]);

  const visibleRankedCandidates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return rankedCandidates;
    }

    return rankedCandidates.filter((candidate) => {
      const haystack = [candidate.name, candidate.email, candidate.summary, candidate.matchedSkills?.join(' ')]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [rankedCandidates, searchTerm]);

  const topScore = rankedCandidates[0]?.score || 0;
  const averageScore = rankedCandidates.length
    ? Math.round(rankedCandidates.reduce((sum, candidate) => sum + candidate.score, 0) / rankedCandidates.length)
    : 0;

  const handleRank = async () => {
    if (!selectedJob) {
      setErrorMessage('Select a job first.');
      return;
    }

    if (!candidateOptions.length) {
      setErrorMessage('No applicants are available for this job yet.');
      return;
    }

    try {
      setErrorMessage('');
      const response = await rankCandidates({
        jobDescription,
        candidates: candidateOptions.map((candidate) => ({
          applicationId: candidate.applicationId,
          candidateId: candidate.candidateId,
          name: candidate.name,
          email: candidate.email,
          resumeUrl: candidate.resumeUrl,
          summary: candidate.summary,
          skills: candidate.skills,
          experience: candidate.experience,
        })),
      });

      setRankedCandidates(response.rankedCandidates);
    } catch (error) {
      setRankedCandidates([]);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to rank candidates.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_42%),linear-gradient(180deg,_#f8fafc_0%,_#eef6fb_100%)]">
        <div className="rounded-3xl border border-white/70 bg-white/80 px-8 py-10 shadow-2xl backdrop-blur">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-sky-600" />
          <p className="text-lg font-semibold text-slate-800">Loading recruiter applications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-lg rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-xl">
          <p className="text-2xl font-bold text-rose-700">Failed to load applications</p>
          <p className="mt-3 text-slate-600">The ranking view needs recruiter applications to build its candidate list.</p>
          <button
            onClick={() => refetch()}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)]">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/85 shadow-[0_24px_80px_rgba(15,23,42,0.10)] backdrop-blur">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="relative p-8 sm:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
                <Sparkles className="h-4 w-4" />
                Smart Candidate Ranking
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
                Rank applicants automatically by job fit.
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Compare a job description against every applicant for the selected job, score skills and experience,
                then sort candidates from strongest to weakest match.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Applicants</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{candidateOptions.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top score</p>
                  <p className="mt-2 text-3xl font-black text-emerald-600">{topScore}%</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Average</p>
                  <p className="mt-2 text-3xl font-black text-sky-600">{averageScore}%</p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-950 p-8 text-white lg:border-l lg:border-t-0">
              <div className="flex items-center gap-3 text-sky-300">
                <Target className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-[0.2em]">Ranking setup</span>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Select job</label>
                  <select
                    value={selectedJob?.jobId || ''}
                    onChange={(event) => setSelectedJobId(event.target.value)}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-400/40"
                  >
                    {jobOptions.map((job) => (
                      <option key={job.jobId} value={job.jobId} className="text-slate-900">
                        {job.title} ({job.applicationCount})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-200">Job description</label>
                  <textarea
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows={9}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-400 focus:border-sky-300 focus:ring-2 focus:ring-sky-400/40"
                    placeholder="Job description, requirements, and key skills..."
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRank}
                  disabled={isPending || !selectedJob || !candidateOptions.length}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-900/20 transition hover:from-sky-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Briefcase className="h-4 w-4" />}
                  Rank Candidates
                </button>

                {selectedJob && (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{selectedJob.title}</p>
                        <p className="mt-1 text-slate-300">
                          {selectedJob.applicationCount} application{selectedJob.applicationCount === 1 ? '' : 's'} loaded
                        </p>
                      </div>
                      <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200">
                        Skills: {selectedJob.skills.length}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/50 backdrop-blur sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Ranked candidates</h2>
              <p className="mt-1 text-slate-600">
                {rankedCandidates.length
                  ? 'Sorted by score using skills match and experience.'
                  : 'Run ranking to sort applicants for the selected job.'}
              </p>
            </div>

            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search ranked candidates..."
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              />
            </div>
          </div>

          {errorMessage ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {!rankedCandidates.length ? (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <FileText className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-4 text-xl font-bold text-slate-900">No ranked list yet</h3>
              <p className="mt-2 text-slate-600">Select a job and click Rank Candidates to score the applicant pool.</p>
            </div>
          ) : visibleRankedCandidates.length === 0 ? (
            <div className="mt-8 rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
              <p className="text-lg font-semibold text-slate-900">No candidates match your search</p>
              <p className="mt-2 text-slate-600">Try a different name, email, or skill keyword.</p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {visibleRankedCandidates.map((candidate, index) => (
                <article
                  key={`${candidate.applicationId || candidate.name}-${index}`}
                  className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                        #{index + 1}
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-bold text-slate-900">{candidate.name}</h3>
                          <span
                            className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${scoreTone(
                              candidate.score
                            )}`}
                          >
                            {candidate.score}% match
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
                          {candidate.email ? (
                            <span className="inline-flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {candidate.email}
                            </span>
                          ) : null}
                          <span className="inline-flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            {candidate.experience || 0} years experience
                          </span>
                          {candidate.summary ? (
                            <span className="inline-flex items-center gap-2">
                              <FileText className="h-4 w-4" />
                              {candidate.summary}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[340px] lg:max-w-md lg:grid-cols-1">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Matched skills</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {candidate.matchedSkills?.length ? (
                            candidate.matchedSkills.map((skill) => (
                              <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-slate-500">No direct skill matches detected</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resume</p>
                          <p className="mt-1 text-sm text-slate-700">Open the applicant resume to review supporting details.</p>
                        </div>
                        {candidate.resumeUrl ? (
                          <a
                            href={candidate.resumeUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-sm font-medium text-slate-500">Unavailable</span>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CandidateRanker;