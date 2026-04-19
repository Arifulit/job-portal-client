// এই ফাইলটি admin panel এর একটি page UI ও business flow পরিচালনা করে।
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Clock3,
  Users,
  Briefcase,
  FileText,
  Sparkles,
  Activity,
  UserCheck,
  UserRound,
  Shield,
} from 'lucide-react';
import { useDashboardStats } from '../../services/userService';
import { Loader } from '../../components/Loader';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) return <Loader />;

  const totalUsers = stats?.totalUsers ?? 0;
  const totalCandidates = stats?.totalCandidates ?? 0;
  const totalRecruiters = stats?.totalRecruiters ?? 0;
  const totalAdmins = stats?.totalAdmins ?? 0;
  const suspendedUsers = stats?.suspendedUsers ?? 0;
  const totalJobs = stats?.totalJobs ?? 0;
  const pendingJobs = stats?.pendingJobs ?? 0;
  const approvedJobs = stats?.approvedJobs ?? 0;
  const rejectedJobs = stats?.rejectedJobs ?? 0;
  const closedJobs = stats?.closedJobs ?? 0;
  const totalApplications = stats?.totalApplications ?? 0;
  const activeJobs = stats?.activeJobs ?? approvedJobs;
  const pendingReviews = stats?.pendingApplications ?? 0;
  const hired = stats?.hiredCount ?? 0;
  const shortlisted = stats?.shortlistedCount ?? 0;
  const totalNotifications = stats?.totalNotifications ?? 0;
  const unreadNotifications = stats?.unreadNotifications ?? 0;

  const approvalRate = totalApplications > 0 ? Math.round((hired / totalApplications) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-violet-50/40 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-violet-200 bg-gradient-to-r from-[#4b2d8f] via-[#5b38a6] to-[#7a4ec9] p-6 text-white shadow-xl sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-14 left-28 h-40 w-40 rounded-full bg-fuchsia-300/20 blur-2xl" />

          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-100">
                <Sparkles className="h-3.5 w-3.5" />
                Admin Control Center
              </p>
              <h1 className="mt-3 text-2xl font-black sm:text-3xl">Platform Governance With Real-Time Oversight</h1>
              <p className="mt-2 max-w-2xl text-sm text-violet-100 sm:text-base">
                Monitor platform growth, moderate critical resources, and keep operational quality consistently high.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/users"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-[#4b2d8f] shadow-sm"
              >
                Manage Users
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/admin/jobs"
                className="inline-flex items-center gap-2 rounded-xl border border-white/60 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Moderate Jobs
              </Link>
            </div>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Users</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalUsers}</p>
                <p className="mt-1 text-xs text-slate-500">Registered platform accounts</p>
              </div>
              <span className="rounded-xl bg-blue-100 p-3 text-blue-700">
                <Users className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Jobs</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Published and draft roles</p>
              </div>
              <span className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <Briefcase className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Candidates</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalCandidates}</p>
                <p className="mt-1 text-xs text-slate-500">Candidate accounts</p>
              </div>
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <UserRound className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Recruiters</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalRecruiters}</p>
                <p className="mt-1 text-xs text-slate-500">Recruiter accounts</p>
              </div>
              <span className="rounded-xl bg-cyan-100 p-3 text-cyan-700">
                <UserCheck className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Admins</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalAdmins}</p>
                <p className="mt-1 text-xs text-slate-500">Admin accounts</p>
              </div>
              <span className="rounded-xl bg-indigo-100 p-3 text-indigo-700">
                <Shield className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Total Applications</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{totalApplications}</p>
                <p className="mt-1 text-xs text-slate-500">All candidate submissions</p>
              </div>
              <span className="rounded-xl bg-violet-100 p-3 text-violet-700">
                <FileText className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Active Jobs</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{activeJobs}</p>
                <p className="mt-1 text-xs text-slate-500">Currently visible to candidates</p>
              </div>
              <span className="rounded-xl bg-amber-100 p-3 text-amber-700">
                <Activity className="h-6 w-6" />
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Pending Applications</p>
                <p className="mt-2 text-3xl font-black text-slate-900">{pendingReviews}</p>
                <p className="mt-1 text-xs text-slate-500">From application status</p>
              </div>
              <span className="rounded-xl bg-red-100 p-3 text-red-700">
                <Clock3 className="h-6 w-6" />
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
              <span className="rounded-xl bg-sky-100 p-3 text-sky-700">
                <Bell className="h-6 w-6" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                View All Users
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/users?role=candidate" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Candidates
                </Link>
                <Link to="/admin/users?role=recruiter" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Recruiters
                </Link>
                <Link to="/admin/users?role=admin" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Admins
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
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
                className="inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white"
              >
                View All Jobs
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/jobs?status=active" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Active
                </Link>
                <Link to="/admin/jobs?status=draft" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Pending
                </Link>
                <Link to="/admin/jobs?status=expired" className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700">
                  Expired
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <FileText className="mr-2 h-5 w-5 text-violet-600" />
              Application Overview
            </h2>
            <p className="mb-6 text-slate-600">
              Monitor application activity and resolve issues
            </p>
            <Link
              to="/admin/jobs"
              className="inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              View Applications
            </Link>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 flex items-center text-xl font-bold text-slate-900">
              <BarChart3 className="mr-2 h-5 w-5 text-amber-600" />
              Analytics & Reports
            </h2>
            <div className="space-y-3 text-sm text-slate-700">
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Jobs: Pending</span>
                <span className="font-semibold">{pendingJobs}</span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Jobs: Approved</span>
                <span className="font-semibold">{approvedJobs}</span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Jobs: Rejected</span>
                <span className="font-semibold">{rejectedJobs}</span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Jobs: Closed</span>
                <span className="font-semibold">{closedJobs}</span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Applications: Shortlisted</span>
                <span className="font-semibold">{shortlisted}</span>
              </p>
              <p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                <span>Suspended Users</span>
                <span className="font-semibold">{suspendedUsers}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 p-8 text-white shadow-lg">
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
              <p className="text-3xl font-bold">{approvalRate}%</p>
              <p className="text-sm opacity-80">Hire Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
