// এই ফাইলটি job listing/details related page rendering ও data flow পরিচালনা করে।
// src/pages/Job/JobDetails.tsx
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJob } from '../../services/jobService';
import { useMyApplications } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import {
  MapPin,
  Briefcase,
  Clock,
  Building,
  Calendar,
  Award,
  Users,
  ShieldCheck,
  Sparkles,
  Layers3,
  BadgeCheck,
  ArrowRight,
} from 'lucide-react';

const formatSalary = (
  salary?: number | { min?: number; max?: number; currency?: string },
  salaryMin?: number,
  salaryMax?: number,
  currency?: string
) => {
  if (typeof salary === 'object' && salary !== null) {
    if (typeof salary.min === 'number' || typeof salary.max === 'number') {
      const c = salary.currency || currency || 'BDT';
      if (typeof salary.min === 'number' && typeof salary.max === 'number') {
        return `${c} ${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
      }
      if (typeof salary.min === 'number') {
        return `${c} ${salary.min.toLocaleString()}+`;
      }
      if (typeof salary.max === 'number') {
        return `${c} up to ${salary.max.toLocaleString()}`;
      }
    }
  }

  if (typeof salaryMin === 'number' || typeof salaryMax === 'number') {
    const c = currency || 'BDT';
    if (typeof salaryMin === 'number' && typeof salaryMax === 'number') {
      return `${c} ${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()}`;
    }
    if (typeof salaryMin === 'number') {
      return `${c} ${salaryMin.toLocaleString()}+`;
    }
    if (typeof salaryMax === 'number') {
      return `${c} up to ${salaryMax.toLocaleString()}`;
    }
  }

  if (typeof salary === 'number') {
    const c = currency || 'BDT';
    return `${c} ${salary.toLocaleString()}`;
  }

  return 'Negotiable';
};

const toSafeDate = (value?: string) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
};

const stripHtml = (value?: string) => {
  if (!value) return 'No description available';
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const toList = (value?: string[] | string) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const formatDate = (value?: string) => {
  const date = toSafeDate(value);
  if (!date) return 'Not specified';

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const SectionCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
    <div className="mb-4 flex items-center gap-3">
      {Icon ? <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" /> : null}
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
    </div>
    {children}
  </section>
);

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) => (
  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/50">
    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
    <div className="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100">{value}</div>
  </div>
);

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);
  const { user } = useAuth();
  const navigate = useNavigate();

  const roleValue = String(user?.role || '').toLowerCase();
  const canApply = roleValue === 'candidate' || roleValue === 'seeker' || roleValue === 'job_seeker';
  const { data: myApplicationsData, isLoading: myApplicationsLoading } = useMyApplications(canApply);
  const currentUserId = String(user?._id || '');
  const hasApplied =
    canApply &&
    !!id &&
    (myApplicationsData?.data || []).some((application) => {
      const applicationCandidateId = String(application.candidateId || application.candidate?._id || '');
      if (!applicationCandidateId || applicationCandidateId !== currentUserId) return false;

      const appliedJobId = application.jobId || application.job?._id;
      return String(appliedJobId || '') === String(id);
    });
  const companyName =
    typeof job?.company === 'string'
      ? job.company
      : job?.company?.name || 'Company not specified';
  const salaryText = formatSalary(job?.salary as number | { min?: number; max?: number; currency?: string }, job?.salaryMin, job?.salaryMax, job?.currency);
  const requirementsList = toList(job?.requirements);
  const responsibilitiesList = toList((job as { responsibilities?: string[] | string })?.responsibilities);
  const skillsList = toList(job?.skills);
  const educationList = toList(job?.education);
  const additionalRequirementsList = toList(job?.additionalRequirements);
  const businessAreasList = toList(job?.businessAreas);
  const jobContext = job?.jobContext?.trim() || '';
  const genderPreference = job?.genderPreference?.trim() || 'Not specified';
  const preferredIndustryExperience = job?.preferredIndustryExperience?.trim() || '';
  const preferredExperienceYears = typeof job?.preferredExperienceYears === 'number' ? job.preferredExperienceYears : null;
  const ageRange =
    typeof job?.ageMin === 'number' || typeof job?.ageMax === 'number'
      ? `${typeof job?.ageMin === 'number' ? job.ageMin : '?'} to ${typeof job?.ageMax === 'number' ? job.ageMax : '?'} years`
      : 'Not specified';
  const summaryItems = [
    { label: 'Vacancy', value: typeof job?.vacancies === 'number' ? job.vacancies : 'Not specified' },
    { label: 'Salary', value: salaryText },
    { label: 'Location', value: job?.location || 'Not specified' },
    { label: 'Experience', value: job?.experience || 'Not specified' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Skeleton className="mb-4 h-8 w-3/4" />
            <Skeleton className="mb-6 h-5 w-1/2" />
            <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="mb-3 h-5 w-40" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-11/12" />
            <Skeleton className="mb-8 h-4 w-9/12" />
            <Skeleton className="mb-4 h-10 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-300 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Error loading job details</h2>
          <p className="text-slate-600 dark:text-slate-300">{error.message}</p>
          <Link to="/jobs" className="mt-4 inline-block text-sm font-semibold text-slate-700 hover:underline dark:text-slate-300">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">Job not found</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-slate-800 dark:bg-slate-900">
          <div className="bg-white px-6 py-8 text-slate-900 dark:bg-slate-900 dark:text-white sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 dark:border-white/20 dark:bg-white/5 dark:text-slate-200">
                  <Sparkles className="h-3.5 w-3.5" />
                  Featured Opportunity
                </div>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">{job.title}</h1>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 dark:border-white/20 dark:bg-white/5">
                    <Building className="h-4 w-4" />
                    {companyName}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 dark:border-white/20 dark:bg-white/5">
                    <MapPin className="h-4 w-4" />
                    {job.location || 'Location not specified'}
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2 capitalize dark:border-white/20 dark:bg-white/5">
                    <Briefcase className="h-4 w-4" />
                    {job.jobType?.replace('-', ' ') || 'Not specified'}
                  </span>
                </div>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-700 dark:text-slate-200 sm:text-base">
                  {stripHtml(job.description)}
                </p>
              </div>

              <div className="grid min-w-0 gap-3 sm:min-w-[280px]">
                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 dark:border-white/20 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Application Deadline</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{formatDate(job.deadline)}</p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 dark:border-white/20 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Salary Range</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{salaryText}</p>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-slate-100 p-4 dark:border-white/20 dark:bg-white/5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 dark:text-slate-300">Vacancies</p>
                  <p className="mt-2 text-xl font-bold text-slate-900 dark:text-white">{typeof job.vacancies === 'number' ? job.vacancies : 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950/40 sm:px-8">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              {summaryItems.map((item) => (
                <InfoRow key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <SectionCard title="Job Context" icon={Layers3}>
              {jobContext ? (
                <p className="leading-8 text-slate-700 dark:text-slate-300">{jobContext}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No additional company context provided.</p>
              )}
            </SectionCard>

            <SectionCard title="Requirements" icon={ShieldCheck}>
              <div className="space-y-6">
                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Core Requirements</h3>
                  {requirementsList.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                      {requirementsList.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Not specified</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Education</h3>
                  {educationList.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                      {educationList.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Not specified</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Experience</h3>
                  <div className="space-y-2 text-slate-700 dark:text-slate-300">
                    <p>{job.experience || 'Not specified'}</p>
                    {preferredExperienceYears ? <p>Preferred experience: {preferredExperienceYears}+ years</p> : null}
                    {preferredIndustryExperience ? <p>Preferred industry background: {preferredIndustryExperience}</p> : null}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Additional Requirements</h3>
                  {additionalRequirementsList.length > 0 ? (
                    <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                      {additionalRequirementsList.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}
                    </ul>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Not specified</p>
                  )}
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Business Areas</h3>
                  {businessAreasList.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {businessAreasList.map((item, index) => (
                        <Badge key={`${item}-${index}`} variant="outline" className="rounded-full text-sm">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400">Not specified</p>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoRow label="Age Range" value={ageRange} />
                  <InfoRow label="Gender Preference" value={genderPreference} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Responsibilities" icon={BadgeCheck}>
              {responsibilitiesList.length > 0 ? (
                <ul className="list-disc space-y-2 pl-5 text-slate-700 dark:text-slate-300">
                  {responsibilitiesList.map((responsibility, index) => <li key={`${responsibility}-${index}`}>{responsibility}</li>)}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No responsibilities provided.</p>
              )}
            </SectionCard>

            <SectionCard title="Skills & Expertise" icon={Award}>
              {skillsList.length > 0 ? (
                <div className="flex flex-wrap gap-2.5">
                  {skillsList.map((skill, index) => (
                    <Badge key={`${skill}-${index}`} variant="outline" className="rounded-full px-4 py-2 text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 dark:text-slate-400">No skills listed.</p>
              )}
            </SectionCard>

            <SectionCard title="Compensation & Timeline" icon={Clock}>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <InfoRow label="Posted Date" value={formatDate(job.createdAt)} />
                <InfoRow label="Last Updated" value={formatDate(job.updatedAt)} />
                <InfoRow label="Application Deadline" value={formatDate(job.deadline)} />
                <InfoRow label="Status" value={<span className="capitalize">{job.status || 'Not specified'}</span>} />
              </div>
            </SectionCard>

            {job.statusHistory && job.statusHistory.length > 0 && (
              <SectionCard title="Status Timeline" icon={Calendar}>
                <div className="space-y-3">
                  {job.statusHistory.map((entry, index) => (
                    <div key={`${entry.status || 'status'}-${index}`} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold capitalize text-slate-900 dark:text-slate-100">{entry.status || 'Updated'}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{entry.date ? new Date(entry.date).toLocaleString() : 'Date unavailable'}</p>
                      </div>
                      {entry.note && <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-300">{entry.note}</p>}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:h-fit">
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Ready to apply?</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Submit your profile and resume in a few steps.</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {canApply && !hasApplied && !myApplicationsLoading && (
                  <Button onClick={() => navigate(`/jobs/${id}/apply`)} className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    Apply Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
                {canApply && hasApplied && (
                  <p className="rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
                    You already applied to this job.
                  </p>
                )}
                {!user && (
                  <Button asChild className="w-full bg-slate-900 text-white hover:bg-slate-800">
                    <Link to="/login">Login to Apply</Link>
                  </Button>
                )}
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/jobs">Back to Jobs</Link>
                </Button>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Snapshot</h3>
              <div className="grid gap-3">
                <InfoRow label="Job Type" value={<span className="capitalize">{job.jobType?.replace('-', ' ') || 'Not specified'}</span>} />
                <InfoRow label="Experience Level" value={<span className="capitalize">{job.experienceLevel || 'Not specified'}</span>} />
                <InfoRow label="Company" value={companyName} />
                <InfoRow label="Location" value={job.location || 'Not specified'} />
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;
