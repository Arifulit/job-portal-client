// এই ফাইলটি candidate dashboard এর একটি page UI ও interaction flow পরিচালনা করে।
import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { Loader2, ExternalLink } from 'lucide-react';
import { useMyApplications } from '../../services/applicationService';
import { ApplicationStatus } from '../../types';

const statusBadgeClassMap: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-700 border border-blue-200',
  reviewed: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
  shortlisted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  interview: 'bg-amber-100 text-amber-700 border border-amber-200',
  hired: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const MyApplications: React.FC = () => {
  const { data, isLoading, isError, refetch } = useMyApplications();
  const applications = data?.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading your applications...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-gray-200 text-center">
          <p className="text-red-600 text-xl font-bold mb-4">Failed to load applications</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Applications</h1>
          <p className="text-gray-600 mt-1">
            Total applications: <span className="font-semibold text-blue-600">{applications.length}</span>
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications yet</h2>
            <p className="text-gray-600 mb-6">Start applying to jobs and track your status here.</p>
            <Link
              to="/candidate/jobs"
              className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Resume</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Applied At</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const jobData = application.job;
                    const jobTitle = jobData?.title || 'Untitled Job';
                    const resumeLink = application.downloadUrl || application.resume;
                    const appliedDate =
                      application.createdAt ||
                      application.appliedAt ||
                      application.updatedAt;
                    const jobId = application.jobId || jobData?._id;
                    return (
                      <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{jobTitle}</div>
                          {jobId ? (
                            <Link
                              to={`/jobs/${jobId}`}
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
                            >
                              View Job <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          ) : null}
                        </td>
                        <td className="px-6 py-4">
                          {resumeLink ? (
                            <a
                              href={resumeLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(event) => {
                                event.preventDefault();
                                window.open(resumeLink, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-blue-600 hover:underline"
                            >
                              View Resume
                            </a>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-700">
                          {appliedDate ? format(new Date(appliedDate), 'MMM d, yyyy h:mm a') : 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClassMap[application.status] || statusBadgeClassMap.applied}`}
                          >
                            {toTitleCase(application.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default MyApplications;
