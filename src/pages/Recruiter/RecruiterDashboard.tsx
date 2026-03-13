import { useDashboardStats } from '../../services/userService';
import { userecruiterJobs } from '../../services/jobService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  Eye,
  Flame,
  LineChart,
  PlusCircle,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '../../utils/helpers';

export const RecruiterDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: jobsData, isLoading: jobsLoading } = userecruiterJobs();

  if (statsLoading || jobsLoading) return <Loader />;

  const jobs = jobsData?.data || [];
  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#15543f] via-[#1a6a4f] to-[#2e8668] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">Recruiter Workspace</p>
              <h1 className="mt-1 text-3xl font-extrabold">Manage Hiring Efficiently</h1>
              <p className="mt-2 text-emerald-100">Track job performance, applicants, and hiring outcomes from one dashboard.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/recruiter/jobs/create"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#15543f]"
              >
                Post New Job
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/recruiter/profile"
                className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Company Profile
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Active Jobs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.activeJobs || 0}
                </p>
              </div>
              <span className="rounded-lg bg-blue-100 p-3 text-blue-700">
                <Briefcase className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applicants</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.applicantsCount || 0}
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                <Users className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Views</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.views || 0}
                </p>
              </div>
              <span className="rounded-lg bg-violet-100 p-3 text-violet-700">
                <Eye className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Hired</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.hiredCount || 0}
                </p>
              </div>
              <span className="rounded-lg bg-amber-100 p-3 text-amber-700">
                <TrendingUp className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 p-6">
              <h2 className="flex items-center text-xl font-bold text-slate-900">
                <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
                Recent Job Posts
              </h2>
              <Link to="/recruiter/jobs" className="text-sm font-semibold text-emerald-700 hover:text-emerald-900">
                View all
              </Link>
            </div>

            <div className="divide-y divide-slate-200">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="p-6 transition hover:bg-slate-50">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{job.title}</h3>
                        <p className="text-slate-600">{job.location}</p>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusColor(job.status)}`}>
                        {job.status || 'draft'}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center">
                        <Users className="mr-1 h-4 w-4" />
                        {job.applicantsCount} applicants
                      </span>
                      <span className="flex items-center">
                        <Eye className="mr-1 h-4 w-4" />
                        {job.views} views
                      </span>
                      <span className="flex items-center">
                        <CalendarDays className="mr-1 h-4 w-4" />
                        {formatRelativeTime(job.createdAt)}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link
                        to="/recruiter/jobs"
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
                      >
                        View Applicants
                      </Link>
                      <Link
                        to="/recruiter/jobs"
                        className="text-sm font-semibold text-emerald-700 hover:text-emerald-900"
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
                  <Link
                    to="/recruiter/jobs/create"
                    className="mt-4 inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                  >
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
                <PlusCircle className="mr-2 h-5 w-5 text-emerald-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/recruiter/jobs/create"
                  className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Post New Job
                </Link>
                <Link
                  to="/recruiter/jobs"
                  className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Manage Jobs
                </Link>
                <Link
                  to="/recruiter/profile"
                  className="inline-flex w-full items-center justify-center rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Company Profile
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 p-6 text-white shadow-md">
              <h3 className="mb-2 flex items-center text-lg font-semibold">
                <Flame className="mr-2 h-5 w-5" />
                Upgrade to Premium
              </h3>
              <p className="mb-4 text-sm text-emerald-100">
                Get more visibility and attract top talent with premium job postings
              </p>
              <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
                Learn More
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
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
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
