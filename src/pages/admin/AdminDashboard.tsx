// import { useDashboardStats } from '../services/userService';
// import { Loader } from '../components/Loader';
import { Link } from 'react-router-dom';
import {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Platform overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Users</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalUsers || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalJobs || 0}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalApplications || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.activeJobs || 0}
                </p>
              </div>
              <Activity className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending Reviews</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.pendingApplications || 0}
                </p>
              </div>
              <Shield className="w-12 h-12 text-red-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Success Rate</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.hiredCount || 0}%
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-teal-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              User Management
            </h2>
            <p className="text-gray-600 mb-6">
              Manage user accounts, roles, and permissions
            </p>
            <div className="space-y-3">
              <Link to="/admin/users" className="btn btn-primary w-full">
                View All Users
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/users?role=seeker" className="btn btn-outline btn-sm">
                  Candidates
                </Link>
                <Link to="/admin/users?role=recruiter" className="btn btn-outline btn-sm">
                  recruiters
                </Link>
                <Link to="/admin/users?role=admin" className="btn btn-outline btn-sm">
                  Admins
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Briefcase className="w-6 h-6 mr-2 text-green-600" />
              Job Moderation
            </h2>
            <p className="text-gray-600 mb-6">
              Review, approve, or remove job postings
            </p>
            <div className="space-y-3">
              <Link to="/admin/jobs" className="btn btn-primary w-full">
                View All Jobs
              </Link>
              <div className="grid grid-cols-3 gap-3">
                <Link to="/admin/jobs?status=active" className="btn btn-outline btn-sm">
                  Active
                </Link>
                <Link to="/admin/jobs?status=draft" className="btn btn-outline btn-sm">
                  Pending
                </Link>
                <Link to="/admin/jobs?status=expired" className="btn btn-outline btn-sm">
                  Expired
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-purple-600" />
              Application Overview
            </h2>
            <p className="text-gray-600 mb-6">
              Monitor application activity and resolve issues
            </p>
            <Link to="/admin/applications" className="btn btn-primary w-full">
              View Applications
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-yellow-600" />
              Analytics & Reports
            </h2>
            <p className="text-gray-600 mb-6">
              Generate insights and export platform data
            </p>
            <button className="btn btn-primary w-full">
              Generate Reports
            </button>
          </div>
        </div>

        <div className="mt-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg shadow-lg p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold mb-2">Platform Health</h3>
              <p className="opacity-90">All systems operational</p>
            </div>
            <Activity className="w-16 h-16 opacity-80" />
          </div>
          <div className="mt-6 grid grid-cols-4 gap-4 text-center">
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
