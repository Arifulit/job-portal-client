import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCandidateProfile } from '../../services/candidateService';
import { getCandidateSkillGap, type CandidateGapResponse } from '../../services/candidateGapService';

export const CandidateSkillGap = () => {
  const { user } = useAuth();
  const { data } = useCandidateProfile();
  const profile = data?.data;

  const [jobId, setJobId] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<CandidateGapResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const skills = useMemo(() => profile?.skills || user?.skills || [], [profile?.skills, user?.skills]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await getCandidateSkillGap({
        jobId: jobId.trim() || undefined,
        userId: user?._id || profile?.user?._id || undefined,
        jobDescription: jobDescription.trim() || undefined,
        candidateSkills: skills,
      });
      setResult(response);
    } catch (error) {
      setResult({ success: false, missingSkills: [], message: error instanceof Error ? error.message : 'Failed to load skill gap' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40 py-8">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">Candidate Skill Gap</p>
          <h1 className="mt-2 text-3xl font-black text-slate-900">See what skills you need for a job</h1>
          <p className="mt-2 text-sm text-slate-600">
            The tool compares the current candidate profile against a job description or job record and returns the missing skills.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Job ID</label>
              <input
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                placeholder="Optional if job description is provided"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Candidate Skills</label>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                {skills.length ? skills.join(', ') : 'No skills found in profile'}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={5}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              placeholder="Paste the job description here if the backend cannot fetch job data directly"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-[#0E5EA8] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Checking...' : 'Check Skill Gap'}
          </button>
        </form>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">Missing Skills</h2>
          {result?.missingSkills?.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {result.missingSkills.map((skill) => (
                <span key={skill} className="rounded-full bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">{result?.summary || 'Run the check to see what you are missing.'}</p>
          )}

          {result?.matchedSkills?.length ? (
            <>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">Matched Skills</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.matchedSkills.map((skill) => (
                  <span key={skill} className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {skill}
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default CandidateSkillGap;
