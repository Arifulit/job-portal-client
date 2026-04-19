// এই ফাইলটি candidate dashboard এর একটি page UI ও interaction flow পরিচালনা করে।
import { useDashboardStats } from '../../services/userService';
import { useMyApplications } from '../../services/applicationService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Briefcase,
  Eye,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  MessageCircle,
  Stars,
  MapPin,
  BadgeDollarSign,
  Trophy,
  XCircle,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';
import { useCandidateRecommendations } from '../../services/candidateService';

const statusClassMap: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700 border border-blue-200',
  reviewed: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  shortlisted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  interview: 'bg-amber-100 text-amber-700 border border-amber-200',
  hired: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const normalizeMatchPercentage = (score?: number) => {
  if (typeof score !== 'number' || Number.isNaN(score)) return 0;
  if (score <= 1) return Math.round(score * 100);
  return Math.max(0, Math.min(100, Math.round(score)));
};

const getDateValue = (dateLike?: string) => {
  if (!dateLike) return 0;
  const parsed = new Date(dateLike).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
};

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const getCompanyDisplayName = (company: unknown) => {
  if (typeof company === 'string') return company;
  if (company && typeof company === 'object' && 'name' in company) {
    const name = (company as { name?: unknown }).name;
    if (typeof name === 'string' && name.trim()) return name;
  }
  return 'Company not available';
};

export const CandidateDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: applicationsData, isLoading: appsLoading } = useMyApplications();
  const {
    data: recommendedJobs = [],
    isLoading: recommendationsLoading,
    isError: recommendationsError,
  } = useCandidateRecommendations(10);

  if (statsLoading || appsLoading) return <Loader />;

  const applications = applicationsData?.data || [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const recentApplications = [...applications]
    .sort(
      (a, b) =>
        getDateValue(b.appliedAt || b.createdAt || b.updatedAt) -
        getDateValue(a.appliedAt || a.createdAt || a.updatedAt)
    )
    .slice(0, 5);

  const appliedCount = applications.length;
  const interviewPipelineCount = applications.filter((item) =>
    ['reviewed', 'shortlisted', 'interview', 'hired'].includes(String(item.status || '').toLowerCase())
  ).length;
  const rejectedCount = applications.filter(
    (item) => String(item.status || '').toLowerCase() === 'rejected'
  ).length;
  const weeklyApplications = applications.filter(
    (item) => getDateValue(item.appliedAt || item.createdAt || item.updatedAt) >= sevenDaysAgo
  ).length;
  const pendingCount =
    stats?.pendingApplications ??
    applications.filter((item) => ['applied', 'reviewed'].includes(String(item.status || '').toLowerCase())).length;
  const totalApplications = stats?.totalApplications ?? appliedCount;
  const availableJobs = stats?.availableJobs ?? stats?.totalJobs ?? 0;
  const totalNotifications = stats?.totalNotifications ?? 0;
  const unreadNotifications = stats?.unreadNotifications ?? 0;
  const profileViews = stats?.views ?? 0;
  const responseRate = totalApplications > 0 ? Math.round((interviewPipelineCount / totalApplications) * 100) : 0;
  const weeklyTarget = 5;
  const weeklyProgress = Math.min(100, Math.round((weeklyApplications / weeklyTarget) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100/70 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-blue-200 bg-gradient-to-r from-[#0f4f90] via-[#1d67b2] to-[#3e83c9] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-20 h-44 w-44 rounded-full bg-cyan-300/20 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-100">
                <Sparkles className="h-3.5 w-3.5" />
                Candidate Workspace
              </p>
              <p className="mt-3 text-sm font-semibold text-blue-100">{getGreeting()}</p>
              <h1 className="mt-3 text-2xl font-black leading-tight sm:text-3xl">
                Track Progress, Improve Profile, Land Interviews
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                Keep everything in one place: recent applications, hiring pipeline progress, and profile performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/candidate/jobs"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#124f8d] shadow-sm"
              >
                Browse Jobs
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/candidate/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalApplications}</p>
                <p className="mt-1 text-xs text-slate-500">All submitted applications</p>
              </div>
              <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <FileText className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm font-semibold text-slate-500">Available Jobs</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{availableJobs}</p>
            <p className="mt-1 text-xs text-slate-500">Open jobs available to apply</p>
              </div>
              <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
            <Briefcase className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm font-semibold text-slate-500">Unread Notifications</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{unreadNotifications}</p>
            <p className="mt-1 text-xs text-slate-500">{totalNotifications} total notifications</p>
              </div>
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
            <MessageCircle className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
            <p className="text-sm font-semibold text-slate-500">Pending Review</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{pendingCount}</p>
            <p className="mt-1 text-xs text-slate-500">Waiting for recruiter action</p>
              </div>
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
            <Clock className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">Interview Pipeline</p>
            <p className="mt-2 text-2xl font-black text-slate-900">{interviewPipelineCount}</p>
            <p className="mt-1 text-xs text-slate-500">Shortlisted, interview and hired stages</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Hired</p>
                <p className="mt-2 text-2xl font-black text-slate-900">
                  {applications.filter((item) => String(item.status || '').toLowerCase() === 'hired').length}
                </p>
                <p className="mt-1 text-xs text-slate-500">Strong opportunity indicators</p>
              </div>
              <Trophy className="h-6 w-6 text-emerald-600" />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Rejected</p>
                <p className="mt-2 text-2xl font-black text-slate-900">{rejectedCount}</p>
                <p className="mt-1 text-xs text-slate-500">Use insights to refine next applications</p>
              </div>
              <XCircle className="h-6 w-6 text-rose-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-5 sm:p-6">
              <h2 className="flex items-center text-xl font-bold text-slate-900">
                <FileText className="mr-2 h-5 w-5 text-blue-600" />
                Recent Applications
              </h2>
              <Link to="/candidate/applications" className="text-sm font-semibold text-blue-700">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application._id} className="p-5 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.job?.title || 'Untitled Position'}
                        </h3>
                        <p className="text-sm text-slate-600">{getCompanyDisplayName(application.job?.company)}</p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusClassMap[String(application.status || '').toLowerCase()] ||
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {toTitleCase(String(application.status || 'applied'))}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                          Applied {formatRelativeTime(application.appliedAt || application.createdAt || application.updatedAt || new Date().toISOString())}
                      </span>
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="font-semibold text-blue-700"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FileText className="mx-auto mb-4 h-16 w-16 text-slate-300" />
                  <p className="text-slate-700">No applications yet</p>
                  <p className="mt-1 text-sm text-slate-500">Start applying to jobs and track your progress from here.</p>
                  <Link
                    to="/candidate/jobs"
                    className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center text-xl font-bold text-slate-900">
                  <Stars className="mr-2 h-5 w-5 text-amber-500" />
                  AI Recommended Jobs
                </h2>
                <Link to="/candidate/jobs" className="text-sm font-semibold text-blue-700">
                  See all
                </Link>
              </div>

              {recommendationsLoading ? (
                <p className="text-sm text-slate-500">Loading recommendations...</p>
              ) : recommendationsError ? (
                <p className="text-sm text-rose-600">Could not load recommendations right now.</p>
              ) : recommendedJobs.length === 0 ? (
                <p className="text-sm text-slate-500">No recommendations found yet. Update your profile skills to improve matches.</p>
              ) : (
                <div className="space-y-3">
                  {recommendedJobs.slice(0, 5).map((job) => (
                    <Link
                      key={job._id}
                      to={`/jobs/${job._id}`}
                      className="block rounded-xl border border-slate-200 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{job.title}</p>
                          <p className="text-xs text-slate-500">
                            {getCompanyDisplayName(job.company)}
                          </p>
                        </div>
                        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          {normalizeMatchPercentage(job.relevanceScore)}% match
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {job.location || 'Location not specified'}
                        </span>
                        <span className="inline-flex items-center gap-1 capitalize">
                          <Briefcase className="h-3.5 w-3.5" />
                          {(job.jobType || 'full-time').replace('-', ' ')}
                        </span>
                        {(job.salaryMin || job.salaryMax) && (
                          <span className="inline-flex items-center gap-1">
                            <BadgeDollarSign className="h-3.5 w-3.5" />
                            {job.currency || 'BDT'} {job.salaryMin?.toLocaleString() || 0}
                            {job.salaryMax ? ` - ${job.salaryMax.toLocaleString()}` : '+'}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/candidate/jobs"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/candidate/profile"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Update Profile
                </Link>
                <Link
                  to="/candidate/applications"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                >
                  Track Applications
                </Link>
              </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-md">
              <h3 className="mb-2 flex items-center text-lg font-semibold">
                <Target className="mr-2 h-5 w-5" />
                Weekly Target
              </h3>
              <p className="mb-4 text-sm text-blue-100">Aim for at least 5 quality applications per week to keep your profile active in recruiter searches.</p>

              <div className="mb-4">
                <div className="mb-1 flex items-center justify-between text-xs text-blue-100">
                  <span>{weeklyApplications}/{weeklyTarget} this week</span>
                  <span>{weeklyProgress}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/20">
                  <div className="h-2 rounded-full bg-white transition-all" style={{ width: `${weeklyProgress}%` }} />
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-white/10 p-3 text-sm">
                <p className="flex items-center justify-between">
                  <span>Applications submitted</span>
                  <span className="font-bold">{appliedCount}</span>
                </p>
                <p className="mt-2 flex items-center justify-between">
                  <span>Profile views</span>
                  <span className="font-bold">{profileViews}</span>
                </p>
              </div>

              <Link
                to="/candidate/profile"
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700"
              >
                Update Now
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center text-base font-bold text-slate-900">
                <TrendingUp className="mr-2 h-5 w-5 text-violet-600" />
                Performance Insight
              </h3>
              <p className="text-sm text-slate-600">
                Your current response rate is <span className="font-semibold text-slate-900">{responseRate}%</span>. Improve this by tailoring CV keywords and customizing cover letters by role.
              </p>
              <div className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-700">
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Interview pipeline count: <span className="font-bold">{interviewPipelineCount}</span>
                </p>
              </div>

              <div className="mt-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-700">
                <p className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Profile views: <span className="font-bold">{profileViews}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
