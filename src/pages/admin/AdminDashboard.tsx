// import { useDashboardStats } from '../services/userService';
// import { Loader } from '../components/Loader';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Clock3,
  Users,
  Briefcase,
  FileText,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import { useDashboardStats } from '../../services/userService';
import { Loader } from '../../components/Loader';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#4b2d8f] via-[#5b38a6] to-[#7a4ec9] p-6 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-100">Admin Control Center</p>
              <h1 className="mt-1 text-3xl font-extrabold">Platform Overview & Governance</h1>
              <p className="mt-2 text-violet-100">Monitor growth, moderate content, and keep platform health at peak performance.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#4b2d8f]"
              >
                Manage Users
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/jobs"
                className="inline-flex items-center gap-2 rounded-lg border border-white/60 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
              >
                Moderate Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Users</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <span className="rounded-lg bg-blue-100 p-3 text-blue-700">
                <Users className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Jobs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.totalJobs || 0}
                </p>
              </div>
              <span className="rounded-lg bg-emerald-100 p-3 text-emerald-700">
                <Briefcase className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.totalApplications || 0}
                </p>
              </div>
              <span className="rounded-lg bg-violet-100 p-3 text-violet-700">
                <FileText className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Active Jobs</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.activeJobs || 0}
                </p>
              </div>
              <span className="rounded-lg bg-amber-100 p-3 text-amber-700">
                <Activity className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Reviews</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.pendingApplications || 0}
                </p>
              </div>
              <span className="rounded-lg bg-red-100 p-3 text-red-700">
                <Clock3 className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Success Rate</p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {stats?.hiredCount || 0}%
                </p>
              </div>
              <span className="rounded-lg bg-teal-100 p-3 text-teal-700">
                <CheckCircle2 className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <Users className="mr-2 h-5 w-5 text-blue-600" />
              User Management
            </h2>
            <p className="mb-6 text-slate-600">
              Manage user accounts, roles, and permissions
            </p>
            <div className="space-y-3">
              <Link
                to="/admin/users"
                className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                View All Users
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/users?role=seeker" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Candidates
                </Link>
                <Link to="/admin/users?role=recruiter" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Recruiters
                </Link>
                <Link to="/admin/users?role=admin" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Admins
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <Briefcase className="mr-2 h-5 w-5 text-emerald-600" />
              Job Moderation
            </h2>
            <p className="mb-6 text-slate-600">
              Review, approve, or remove job postings
            </p>
            <div className="space-y-3">
              <Link
                to="/admin/jobs"
                className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                View All Jobs
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/jobs?status=active" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Active
                </Link>
                <Link to="/admin/jobs?status=draft" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Pending
                </Link>
                <Link to="/admin/jobs?status=expired" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  Expired
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <FileText className="mr-2 h-5 w-5 text-violet-600" />
              Application Overview
            </h2>
            <p className="mb-6 text-slate-600">
              Monitor application activity and resolve issues
            </p>
            <Link
              to="/admin/users"
              className="inline-flex w-full items-center justify-center rounded-md bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
            >
              View Applications
            </Link>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <BarChart3 className="mr-2 h-5 w-5 text-amber-600" />
              Analytics & Reports
            </h2>
            <p className="mb-6 text-slate-600">
              Generate insights and export platform data
            </p>
            <button className="inline-flex w-full items-center justify-center rounded-md bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700">
              Generate Reports
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Platform Health</h3>
              <p className="opacity-90">All systems operational</p>
            </div>
            <Activity className="w-16 h-16 opacity-80" />
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
            <div>
              <p className="text-3xl font-bold">99.9%</p>
              <p className="text-sm opacity-80">Uptime</p>
            </div>
            <div>
              <p className="text-3xl font-bold">1.2s</p>
              <p className="text-sm opacity-80">Avg Response</p>
            </div>
            <div>
              <p className="text-3xl font-bold">2.5K</p>
              <p className="text-sm opacity-80">Daily Active</p>
            </div>
            <div>
              <p className="text-3xl font-bold">98%</p>
              <p className="text-sm opacity-80">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
