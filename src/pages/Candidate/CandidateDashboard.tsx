import { useDashboardStats } from '../../services/userService';
import { useMyApplications } from '../../services/applicationService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Briefcase,
  Eye,
  CheckCircle,
  Clock,
  FileText,
  Flame,
  TrendingUp,
  User,
} from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '../../utils/helpers';

export const CandidateDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: applicationsData, isLoading: appsLoading } = useMyApplications();

  if (statsLoading || appsLoading) return <Loader />;

  const applications = applicationsData?.data || [];
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#194f90] via-[#2a67b0] to-[#4a84ca] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Candidate Workspace</p>
              <h1 className="mt-1 text-3xl font-extrabold">Track Your Job Search Progress</h1>
              <p className="mt-2 text-blue-100">Manage applications, shortlist updates, and profile growth in one place.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/candidate/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#194f90]"
              >
                Browse Jobs
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/candidate/profile"
                className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Update Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.totalApplications || 0}
                </p>
              </div>
              <span className="rounded-lg bg-blue-100 p-3 text-blue-700">
                <FileText className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Review</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.pendingApplications || 0}
                </p>
              </div>
              <span className="rounded-lg bg-amber-100 p-3 text-amber-700">
                <Clock className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Shortlisted</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.shortlistedCount || 0}
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                <CheckCircle className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Profile Views</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.views || 0}
                </p>
              </div>
              <span className="rounded-lg bg-violet-100 p-3 text-violet-700">
                <Eye className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
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
                  <div key={application._id} className="p-6 transition hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {application.job?.title}
                        </h3>
                        <p className="text-slate-600">{application.job?.company}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(application.status)}`}>
                        {application.status || 'pending'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {formatRelativeTime(application.appliedAt)}
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
                  <p className="text-slate-600">No applications yet</p>
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
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
                <Briefcase className="mr-2 h-5 w-5 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/candidate/jobs"
                  className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Browse Jobs
                </Link>
                <Link
                  to="/candidate/profile"
                  className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Update Profile
                </Link>
                <Link
                  to="/candidate/applications"
                  className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Track Applications
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 p-6 text-white shadow-md">
              <h3 className="mb-2 flex items-center text-lg font-semibold">
                <Flame className="mr-2 h-5 w-5" />
                Complete Your Profile
              </h3>
              <p className="mb-4 text-sm text-blue-100">
                Increase your chances of getting hired by completing your profile
              </p>
              <Link
                to="/candidate/profile"
                className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50"
              >
                Update Now
              </Link>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="mb-3 flex items-center text-base font-bold text-slate-900">
                <TrendingUp className="mr-2 h-5 w-5 text-violet-600" />
                This Week Insight
              </h3>
              <p className="text-sm text-slate-600">
                Keep applying consistently. Candidates with 5+ targeted applications per week typically receive more interview calls.
              </p>
              <div className="mt-4 rounded-lg bg-violet-50 p-3 text-sm text-violet-700">
                <p className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile views this week: <span className="font-bold">{stats?.views || 0}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
