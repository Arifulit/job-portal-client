import { useDashboardStats } from '../../services/userService';
import { useMyApplications } from '../../services/applicationService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  ArrowUpRight,
  CalendarDays,
  Briefcase,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  MessageCircle,
} from 'lucide-react';
import { formatRelativeTime } from '../../utils/helpers';

const statusClassMap: Record<string, string> = {
  applied: 'bg-blue-100 text-blue-700 border border-blue-200',
  shortlisted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  interview: 'bg-amber-100 text-amber-700 border border-amber-200',
  offered: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  hired: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const CandidateDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: applicationsData, isLoading: appsLoading } = useMyApplications();

  if (statsLoading || appsLoading) return <Loader />;

  const applications = applicationsData?.data || [];
  const recentApplications = [...applications]
    .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
    .slice(0, 5);

  const appliedCount = applications.length;
  const interviewPipelineCount = applications.filter((item) =>
    ['shortlisted', 'interview', 'offered', 'hired'].includes(String(item.status || '').toLowerCase())
  ).length;
  const shortlistedCount =
    stats?.shortlistedCount ??
    applications.filter((item) => String(item.status || '').toLowerCase() === 'shortlisted').length;
  const pendingCount =
    stats?.pendingApplications ??
    applications.filter((item) => String(item.status || '').toLowerCase() === 'applied').length;
  const totalApplications = stats?.totalApplications ?? appliedCount;
  const profileViews = stats?.views ?? 0;
  const responseRate = totalApplications > 0 ? Math.round((interviewPipelineCount / totalApplications) * 100) : 0;

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
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#124f8d] shadow-sm transition hover:bg-blue-50"
              >
                Browse Jobs
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/candidate/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
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

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Review</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{pendingCount}</p>
                <p className="mt-1 text-xs text-slate-500">Waiting for recruiter action</p>
              </div>
              <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <Clock className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Shortlisted</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{shortlistedCount}</p>
                <p className="mt-1 text-xs text-slate-500">Moved to next hiring stage</p>
              </div>
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Response Rate</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{responseRate}%</p>
                <p className="mt-1 text-xs text-slate-500">Interview pipeline conversion</p>
              </div>
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <BarChart3 className="h-6 w-6" />
              </span>
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
              <Link to="/candidate/applications" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application._id} className="p-5 transition hover:bg-slate-50 sm:p-6">
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.job?.title || 'Untitled Position'}
                        </h3>
                        <p className="text-sm text-slate-600">{application.job?.company || 'Company not available'}</p>
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
                        Applied {formatRelativeTime(application.appliedAt)}
                      </span>
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="font-semibold text-blue-700 hover:text-blue-900"
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
                    className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/candidate/jobs"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/candidate/profile"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Update Profile
                </Link>
                <Link
                  to="/candidate/applications"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
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
                className="inline-flex items-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
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
