import { useDashboardStats } from '../../services/userService';
import { userecruiterJobs } from '../../services/jobService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  PlusCircle,
  Settings,
} from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '../../utils/helpers';

export const RecruiterDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: jobsData, isLoading: jobsLoading } = userecruiterJobs();

  if (statsLoading || jobsLoading) return <Loader />;

  const jobs = jobsData?.data || [];
  const recentJobs = jobs.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">recruiter Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your job postings and applicants</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Jobs</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.activeJobs || 0}
                </p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applicants</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.applicantsCount || 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Views</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.views || 0}
                </p>
              </div>
              <Eye className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Hired</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.hiredCount || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                Recent Job Posts
              </h2>
            </div>

            <div className="divide-y">
              {recentJobs.length > 0 ? (
                recentJobs.map((job) => (
                  <div key={job._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{job.title}</h3>
                        <p className="text-gray-600">{job.location}</p>
                      </div>
                      <span className={`badge ${getStatusColor(job.status)}`}>
                        {job.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {job.applicantsCount} applicants
                      </span>
                      <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {job.views} views
                      </span>
                      <span>{formatRelativeTime(job.createdAt)}</span>
                    </div>
                    <div className="mt-3 flex space-x-2">
                      <Link
                        to={`/jobs/${job._id}/applicants`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        View Applicants
                      </Link>
                      <Link
                        to={`/jobs/${job._id}/edit`}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Edit
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No jobs posted yet</p>
                  <Link to="/jobs/create" className="btn btn-primary mt-4">
                    Post Your First Job
                  </Link>
                </div>
              )}
            </div>

            {recentJobs.length > 0 && (
              <div className="p-4 border-t text-center">
                <Link to="/jobs/manage" className="text-blue-600 hover:underline font-medium">
                  View All Jobs
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <PlusCircle className="w-6 h-6 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link to="/jobs/create" className="btn btn-primary w-full">
                  Post New Job
                </Link>
                <Link to="/jobs/manage" className="btn btn-outline w-full">
                  Manage Jobs
                </Link>
                <Link to="/profile" className="btn btn-outline w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Company Profile
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Upgrade to Premium</h3>
              <p className="text-sm opacity-90 mb-4">
                Get more visibility and attract top talent with premium job postings
              </p>
              <button className="btn btn-sm bg-white text-green-600 hover:bg-gray-100">
                Learn More
              </button>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-3">Hiring Tips</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Write clear and detailed job descriptions</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Respond to applicants within 48 hours</span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
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
