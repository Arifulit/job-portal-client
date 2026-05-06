// এই ফাইলটি job application form submit flow ও validation পরিচালনা করে।
import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '../../services/jobService';
import { useCandidateProfile } from '../../services/candidateService';
import { useApplyJob, useMyApplications } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/ui/button';
import { ArrowLeft, FileText, Briefcase, MapPin, DollarSign, Mail, Phone, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const allowedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const normalizeSkill = (skill: unknown) => {
  if (typeof skill === 'string') {
    return skill.trim();
  }

  if (!skill || typeof skill !== 'object') {
    return '';
  }

  const candidate = skill as { name?: unknown; title?: unknown; value?: unknown; label?: unknown };
  const rawValue = candidate.name ?? candidate.title ?? candidate.value ?? candidate.label;

  return typeof rawValue === 'string' ? rawValue.trim() : '';
};

const splitSkillEntry = (skillEntry: string) => {
  const raw = skillEntry.trim();
  if (!raw) return [] as string[];

  if (raw.startsWith('[') && raw.endsWith(']')) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter(Boolean);
      }
    } catch {
      // Fall back to comma splitting for malformed serialized arrays.
    }
  }

  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [raw.replace(/^['"]|['"]$/g, '')].filter(Boolean);
};

const prettifySkill = (skill: string) =>
  {
    const cleanedSkill = skill.trim().replace(/[\s_-]+/g, ' ');
    const normalized = cleanedSkill.toLowerCase();

    const professionalLabels: Record<string, string> = {
      java: 'Java',
      c: 'C',
      cpp: 'C++',
      'c++': 'C++',
      python: 'Python',
      pythono: 'Python',
      javascript: 'JavaScript',
      js: 'JavaScript',
      go: 'Go',
      golang: 'Go',
      'c#': 'C#',
      csharp: 'C#',
      wordpress: 'WordPress',
      woocommerce: 'WooCommerce',
      jquery: 'jQuery',
      html5: 'HTML5',
      css3: 'CSS3',
      php: 'PHP',
      bootstrap: 'Bootstrap',
    };

    if (professionalLabels[normalized]) {
      return professionalLabels[normalized];
    }

    return cleanedSkill;
  };

const ApplyPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: jobData, isLoading: jobLoading } = useJob(jobId);
  const { data: profileData, isLoading: profileLoading, error: profileError } = useCandidateProfile();
  const { mutate: applyForJob, isPending: isSubmitting } = useApplyJob();

  const job = jobData;
  const profile = profileData?.data;
  const profileUnavailable = !!profileError && !profile;
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canApply = ['candidate', 'seeker', 'job_seeker'].includes(normalizedRole);
  const { data: myApplicationsData, isLoading: applicationsLoading } = useMyApplications(canApply);
  const currentUserId = String(user?._id || '');
  const displayName = profile?.name || user?.name || 'Candidate';
  const displayEmail = profile?.user?.email || profile?.email || user?.email || '';
  const displayPhone = profile?.phone || user?.phone || '';
  const displayLocation = profile?.location || profile?.address || '';
  const displaySkills = Array.from(
    new Set(
      [...(profile?.skills || []), ...(user?.skills || [])]
        .map(normalizeSkill)
        .filter(Boolean)
        .flatMap(splitSkillEntry)
        .map(prettifySkill)
    )
  );
  const displayHeadline = profile?.headline || 'Ready to apply for the right role';

  // Form state
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const companyName =
    typeof job?.company === 'string'
      ? job.company
      : job?.company?.name || 'Confidential Company';
  const hasAlreadyApplied =
    !!jobId &&
    (myApplicationsData?.data || []).some((application) => {
      const applicationCandidateId = String(application.candidateId || application.candidate?._id || '');
      if (!applicationCandidateId || applicationCandidateId !== currentUserId) return false;

      const appliedJobId = application.jobId || application.job?._id;
      return String(appliedJobId || '') === String(jobId);
    });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      setResumeFile(null);
      setFileError('');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setResumeFile(null);
      setFileError('Only PDF, DOC, or DOCX files are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setResumeFile(null);
      setFileError('File size must be less than 5MB');
      return;
    }

    setResumeFile(file);
    setFileError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!jobId) {
      toast.error('Invalid job ID');
      return;
    }

    if (hasAlreadyApplied) {
      toast.error('You have already applied to this job');
      navigate('/candidate/applications', { replace: true });
      return;
    }

    if (!resumeFile && !profile?.resume) {
      setFileError('Please upload your resume file or complete your candidate profile resume');
      return;
    }

    setFileError('');

    applyForJob(
      {
        jobId,
        coverLetter: coverLetter.trim() || undefined,
        resumeFile: resumeFile || undefined,
        resumeUrl: resumeFile ? undefined : profile?.resume || undefined,
        expectedSalary: expectedSalary.trim() ? Number(expectedSalary) : undefined,
      },
      {
        onSuccess: () => {
          navigate('/candidate/applications', { replace: true });
        },
      }
    );
  };

  if (jobLoading || profileLoading || applicationsLoading) {
    return <Loader />;
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load</h2>
          <p className="text-gray-600 mb-6">Job information could not be loaded.</p>
          <Link to="/jobs" className="text-blue-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !canApply) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">Only candidates can apply for jobs.</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (hasAlreadyApplied) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Already Applied</h2>
          <p className="text-gray-600 mb-6">You have already applied for this job.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" asChild>
              <Link to="/candidate/applications">My Applications</Link>
            </Button>
            <Button asChild>
              <Link to={`/jobs/${jobId}`}>Back to Job</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.08),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(14,165,233,0.08),_transparent_28%),linear-gradient(to_bottom,_rgba(248,250,252,1),_rgba(241,245,249,1))] px-4 py-8 text-slate-900 dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.05),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(79,70,229,0.16),_transparent_28%),linear-gradient(to_bottom,_rgba(15,23,42,1),_rgba(2,6,23,1))] dark:text-slate-100">
      <div className="mx-auto max-w-5xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Job
        </button>

        <div className="mb-6 rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Application details</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Apply for this role
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600 dark:text-slate-300">
            Review the role, confirm your profile details, and submit a cleaner application package with your resume and notes.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Job Summary
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">{job.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{companyName}</p>
                </div>

                {job.location && (
                  <div className="flex items-start gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                    <div>
                      <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Location</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{job.location}</p>
                    </div>
                  </div>
                )}

                {job.jobType && (
                  <div className="flex items-start gap-3">
                    <Briefcase className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />
                    <div>
                      <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Job Type</p>
                      <p className="font-medium capitalize text-slate-900 dark:text-slate-100">{job.jobType.replace('-', ' ')}</p>
                    </div>
                  </div>
                )}

                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-300" />
                    <div>
                      <p className="text-xs uppercase text-slate-500 dark:text-slate-400">Salary Range</p>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {job.currency || 'BDT'} {job.salaryMin?.toLocaleString() || 0}
                        {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Your Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-bold text-slate-950 dark:text-white">{displayName}</p>
                  {displayHeadline && <p className="text-sm text-slate-600 dark:text-slate-300">{displayHeadline}</p>}
                </div>

                <div className="flex items-start gap-3 border-t border-slate-200 pt-3 dark:border-slate-800">
                  <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Email</p>
                    <p className="text-sm text-slate-900 dark:text-slate-100">{displayEmail}</p>
                  </div>
                </div>

                {displayPhone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Phone</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{displayPhone}</p>
                    </div>
                  </div>
                )}

                {displayLocation && (
                  <div className="flex items-start gap-3">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Location</p>
                      <p className="text-sm text-slate-900 dark:text-slate-100">{displayLocation}</p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Skills</p>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {displaySkills.length} listed
                    </span>
                  </div>

                  {displaySkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {displaySkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center rounded-full border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">No skills added yet.</p>
                  )}
                </div>

                {profileUnavailable && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
                    Your saved candidate profile is not available right now. You can still apply using your account details.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">Application form</h2>
              <p className="mb-8 text-slate-600 dark:text-slate-300">Complete your application by filling in the details below.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Expected Salary */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Your Expected Salary (Monthly)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      value={expectedSalary}
                      onChange={(e) => setExpectedSalary(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-20 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-700 dark:focus:ring-indigo-950/40"
                      disabled={isSubmitting}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                      {job.currency || 'BDT'}
                    </div>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Job offers: {job.currency || 'BDT'} {job.salaryMin?.toLocaleString() || 0}
                    {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                  </p>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Resume / CV
                  </label>
                  <div className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center transition hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-indigo-700 dark:hover:bg-slate-900">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      disabled={isSubmitting}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer block">
                      <FileText className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                        {resumeFile ? (
                          <span className="text-green-600">✓ {resumeFile.name}</span>
                        ) : (
                          <>
                            Click to upload a resume file
                            <br />
                            <span className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                          </>
                        )}
                      </p>
                    </label>
                  </div>
                  {profile?.resume && !resumeFile && (
                    <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">
                      Existing resume found in your profile. Uploading a new file is optional.
                    </p>
                  )}
                  {fileError && (
                    <p className="mt-2 flex items-center gap-1 text-xs text-red-600 dark:text-red-300">
                      <AlertCircle className="h-3 w-3" />
                      {fileError}
                    </p>
                  )}
                </div>

                {/* Cover Letter */}
                <div>
                  <label htmlFor="coverLetter" className="mb-2 block text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Cover Letter or Notes (Optional)
                  </label>
                  <textarea
                    id="coverLetter"
                    rows={5}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you're interested in this role..."
                    className="w-full resize-none rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-700 dark:focus:ring-indigo-950/40"
                    disabled={isSubmitting}
                  />
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{coverLetter.length} / 2000 characters</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(-1)}
                    disabled={isSubmitting}
                    className="flex-1 rounded-2xl border-slate-300 bg-transparent text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || (!resumeFile && !profile?.resume)}
                    className="flex-1 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-700 font-semibold text-white shadow-lg transition-all hover:shadow-xl dark:from-white dark:via-slate-100 dark:to-slate-200 dark:text-slate-950"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Application'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyPage;
