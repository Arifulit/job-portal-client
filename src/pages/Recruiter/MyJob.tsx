
import React from 'react';
import { useAllJobs } from '../../services/jobService';
import { format } from 'date-fns';
import { Button } from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { Loader2, Plus, Eye, Edit2, Users, Calendar, Briefcase } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyJob: React.FC = () => {
  const { data: jobs, isLoading, error, refetch } = useAllJobs();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your jobs...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 text-center">
          <p className="text-red-600 text-xl font-bold mb-4">Failed to load jobs</p>
          <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Posted Jobs</h1>
              <p className="text-gray-600 mt-1">
                You have posted <span className="font-bold text-blue-600">{jobs?.length || 0}</span> job(s)
              </p>
            </div>
            <Link to="/recruiter/job-post">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Post New Job
              </Button>
            </Link>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b-2 border-gray-300">
              <tr>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job Title</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Applications</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Posted Date</th>
                <th className="px-8 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {jobs?.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="text-lg font-semibold text-gray-900">{job.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{job.company?.name || 'Company'}</div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge 
                      className={
                        job.status === 'active' ? 'bg-green-100 text-green-800 border border-green-300' :
                        job.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                        job.status === 'draft' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                        job.status === 'expired' ? 'bg-red-100 text-red-800 border border-red-300' :
                        'bg-gray-100 text-gray-700 border border-gray-300'
                      }
                    >
                      {job.status?.charAt(0).toUpperCase() + job.status?.slice(1) || 'Pending'}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 text-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{job.applications?.length || 0}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {job.createdAt ? format(new Date(job.createdAt), 'MMM d, yyyy') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex gap-3">
                      <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-500 hover:text-blue-600">
                        <Eye className="w-4 h-4 mr-1" /> View
                      </Button>
                      <Button variant="outline" size="sm" className="border-gray-300 hover:border-blue-500 hover:text-blue-600">
                        <Edit2 className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden grid gap-5">
          {jobs?.map((job) => (
            <div key={job._id} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{job.company?.name || 'Company'}</p>
                </div>
                <Badge 
                  className={
                    job.status === 'active' ? 'bg-green-100 text-green-800' :
                    job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-700'
                  }
                >
                  {job.status?.charAt(0).toUpperCase() + job.status?.slice(1)}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-5">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  {job.applications?.length || 0} applications
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(job.createdAt), 'MMM d, yyyy')}
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="flex-1">View</Button>
                <Button variant="outline" size="sm" className="flex-1">Edit</Button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {jobs?.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="bg-gray-100 w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Briefcase className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No jobs posted yet</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              Start building your team by posting your first job opening today!
            </p>
            <Link to="/recruiter/job-post">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-6 rounded-xl">
                <Plus className="w-5 h-5 mr-2" />
                Post Your First Job
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyJob;