import { useDashboardStats } from '../../services/userService';
import { useMyApplications } from '../../services/applicationService';
import { Loader } from '../../components/Loader';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  Bookmark,
} from 'lucide-react';
import { formatRelativeTime, getStatusColor } from '../../utils/helpers';

export const CandidateDashboard = () => {
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: applicationsData, isLoading: appsLoading } = useMyApplications();

  if (statsLoading || appsLoading) return <Loader />;

  const applications = applicationsData?.data || [];
  const recentApplications = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Candidate Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your job search progress</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Applications</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.totalApplications || 0}
                </p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.pendingApplications || 0}
                </p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Shortlisted</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.shortlistedCount || 0}
                </p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-80" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Profile Views</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {stats?.views || 0}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-lg shadow">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center">
                <FileText className="w-6 h-6 mr-2 text-blue-600" />
                Recent Applications
              </h2>
            </div>

            <div className="divide-y">
              {recentApplications.length > 0 ? (
                recentApplications.map((application) => (
                  <div key={application._id} className="p-6 hover:bg-gray-50 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">
                          {application.job?.title}
                        </h3>
                        <p className="text-gray-600">{application.job?.company}</p>
                      </div>
                      <span className={`badge ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatRelativeTime(application.appliedAt)}
                      </span>
                      <Link
                        to={`/jobs/${application.jobId}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Job
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                  <Link to="/jobs" className="btn btn-primary mt-4">
                    Browse Jobs
                  </Link>
                </div>
              )}
            </div>

            {recentApplications.length > 0 && (
              <div className="p-4 border-t text-center">
                <Link to="/applications" className="text-blue-600 hover:underline font-medium">
                  View All Applications
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link to="/jobs" className="btn btn-primary w-full">
                  Browse Jobs
                </Link>
                <Link to="/profile" className="btn btn-outline w-full">
                  Update Profile
                </Link>
                <Link to="/saved-jobs" className="btn btn-outline w-full">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved Jobs
                </Link>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow p-6 text-white">
              <h3 className="text-lg font-semibold mb-2">Complete Your Profile</h3>
              <p className="text-sm opacity-90 mb-4">
                Increase your chances of getting hired by completing your profile
              </p>
              <Link to="/profile" className="btn btn-sm bg-white text-blue-600 hover:bg-gray-100">
                Update Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
