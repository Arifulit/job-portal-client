import { useDashboardStats } from '../../services/userService';
import { useRecruiterJobs } from '../../services/jobService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Eye,
  Sparkles,
  LineChart,
  PlusCircle,
  Settings,
  TrendingUp,
  Users,
  ClipboardCheck,
  FileClock,
} from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '../../utils/helpers';

const getDateValue = (dateLike?: string) => {
  if (!dateLike) return 0;
  const parsed = new Date(dateLike).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getApplicantCount = (job: {
  applicantsCount?: number;
  applications?: unknown;
}) => {
  if (typeof job.applicantsCount === 'number') return job.applicantsCount;
  if (Array.isArray(job.applications)) return job.applications.length;
  return 0;
};

export const RecruiterDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: jobsData, isLoading: jobsLoading } = useRecruiterJobs();

  if (statsLoading || jobsLoading) return <Loader />;

  const jobs = jobsData?.data || [];
  const recentJobs = [...jobs]
    .sort((a, b) => getDateValue(b.createdAt) - getDateValue(a.createdAt))
    .slice(0, 5);

  const activeJobs =
    stats?.activeJobs ?? jobs.filter((job) => String(job.status || '').toLowerCase() === 'active').length;
  const totalJobs = stats?.totalJobs ?? jobs.length;
  const pendingJobs = stats?.pendingJobs ?? 0;
  const approvedJobs = stats?.approvedJobs ?? activeJobs;
  const rejectedJobs = stats?.rejectedJobs ?? 0;
  const closedJobs = stats?.closedJobs ?? 0;
  const totalApplications = stats?.totalApplications ?? 0;
  const draftJobs = jobs.filter((job) => String(job.status || '').toLowerCase() === 'draft').length;
  const expiredJobs = jobs.filter((job) => String(job.status || '').toLowerCase() === 'expired').length;
  const applicantsCount =
    stats?.applicantsCount ?? jobs.reduce((sum, job) => sum + getApplicantCount(job), 0);
  const totalViews =
    stats?.views ?? jobs.reduce((sum, job) => sum + (typeof job.views === 'number' ? job.views : 0), 0);
  const hiredCount = stats?.hiredCount ?? 0;
  const averageApplicants = activeJobs > 0 ? Math.round(applicantsCount / activeJobs) : 0;
  const weeklyPosts = jobs.filter((job) => {
    const createdAt = getDateValue(job.createdAt);
    if (!createdAt) return false;
    return createdAt >= Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  const viewPerJob = jobs.length > 0 ? Math.round(totalViews / jobs.length) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-r from-[#14543f] via-[#1a6a4f] to-[#2e8668] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-28 h-44 w-44 rounded-full bg-emerald-300/20 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter Workspace
              </p>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">Hire Faster With Better Pipeline Visibility</h1>
              <p className="mt-2 max-w-2xl text-sm text-emerald-100 sm:text-base">
                Manage jobs, monitor candidate flow, and optimize hiring outcomes from one dashboard.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/recruiter/jobs/create"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#15543f] shadow-sm"
              >
                Post New Job
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/recruiter/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Company Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Jobs</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalJobs}</p>
                <p className="mt-1 text-xs text-slate-500">All recruiter posted jobs</p>
              </div>
              <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Briefcase className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalApplications}</p>
                <p className="mt-1 text-xs text-slate-500">Received across recruiter jobs</p>
              </div>
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <Users className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Approved Jobs</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{approvedJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Approved and visible jobs</p>
              </div>
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <Eye className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Jobs</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{pendingJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Waiting for approval</p>
              </div>
              <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <TrendingUp className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Rejected Jobs</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{rejectedJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Jobs rejected by moderators</p>
              </div>
              <FileClock className="h-6 w-6 text-amber-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Closed Jobs</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{closedJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Closed or archived jobs</p>
              </div>
              <ClipboardCheck className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Weekly New Posts</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{weeklyPosts}</p>
                <p className="mt-1 text-xs text-slate-500">Jobs posted in last 7 days</p>
              </div>
              <LineChart className="h-6 w-6 text-violet-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">
              <h2 className="flex items-center text-xl font-bold text-slate-900">
                <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                Recent Job Posts
              </h2>
              <Link to="/recruiter/jobs" className="text-sm font-semibold text-emerald-700">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="p-5 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-sm text-slate-600">{job.location}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status || 'draft'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {getApplicantCount(job)} applicants
                      </span>
                      <span className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        {typeof job.views === 'number' ? job.views : 0} views
                      </span>
                      <span className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {formatRelativeTime(job.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        to="/recruiter/applications"
                        className="text-sm font-semibold text-emerald-700"
                      >
                        View Applicants
                      </Link>
                      <Link
                        to="/recruiter/jobs"
                        className="text-sm font-semibold text-emerald-700"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Briefcase className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                  <p className="text-slate-600">No jobs posted yet</p>
                  <p className="mt-1 text-sm text-slate-500">Create your first posting to start receiving applicants.</p>
                  <Link
                    to="/recruiter/jobs/create"
                    className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
                <PlusCircle className="mr-2 h-5 w-5 text-emerald-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/recruiter/jobs/create"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Post New Job
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/recruiter/profile"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Company Profile
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-md">
              <h3 className="mb-2 flex items-center text-lg font-semibold">
                <BarChart3 className="mr-2 h-5 w-5" />
                Hiring Snapshot
              </h3>
              <p className="mb-4 text-sm text-emerald-100">Average applicants per active job gives a quick view of listing quality and reach.</p>

              <div className="rounded-lg bg-white/10 p-3 text-sm">
                <p className="flex items-center justify-between">
                  <span>Average applicants / job</span>
                  <span className="font-bold">{averageApplicants}</span>
                </p>
                <p className="mt-2 flex items-center justify-between">
                  <span>Active jobs</span>
                  <span className="font-bold">{activeJobs}</span>
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center font-bold text-slate-900">
                <LineChart className="mr-2 h-5 w-5 text-violet-600" />
                Hiring Tips
              </h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-600">•</span>
                  <span>Write clear and detailed job descriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-600">•</span>
                  <span>Respond to applicants within 48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-emerald-600">•</span>
                  <span>Keep your company profile updated</span>
                </li>
                {expiredJobs > 0 && (
                  <li className="flex items-start">
                    <span className="mr-2 text-emerald-600">•</span>
                    <span>Renew expired jobs to restore applicant flow quickly</span>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
