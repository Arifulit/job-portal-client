// এই ফাইলটি recruiter dashboard এর একটি page UI ও কাজের flow পরিচালনা করে।
import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Loader2, Search } from 'lucide-react';
import { useRecruiterAllApplications, useUpdateApplicationStatus } from '../../services/applicationService';
import { ApplicationStatus } from '../../types';

const statusOptions: ApplicationStatus[] = [
  'applied',
  'reviewed',
  'shortlisted',
  'interview',
  'hired',
  'rejected',
];

const statusBadgeClassMap: Record<ApplicationStatus, string> = {
  applied: 'bg-blue-100 text-blue-700 border border-blue-200',
  reviewed: 'bg-cyan-100 text-cyan-700 border border-cyan-200',
  shortlisted: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  interview: 'bg-amber-100 text-amber-700 border border-amber-200',
  hired: 'bg-green-100 text-green-700 border border-green-200',
  rejected: 'bg-rose-100 text-rose-700 border border-rose-200',
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const RecruiterApplications: React.FC = () => {
  const {
    data: applications = [],
    isLoading,
    isError,
    refetch,
  } = useRecruiterAllApplications();

  const { mutate: updateStatus, isPending } = useUpdateApplicationStatus();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ApplicationStatus>('all');
  const [selectedJob, setSelectedJob] = useState<'all' | string>('all');

  const jobOptions = useMemo(() => {
    const titleSet = new Set<string>();

    applications.forEach((application) => {
      const title = application.job?.title;
      if (title) {
        titleSet.add(title);
      }
    });

    return Array.from(titleSet).sort((a, b) => a.localeCompare(b));
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return applications.filter((application) => {
      const candidateData = application.candidate;
      const candidateName = String(candidateData?.name || '').toLowerCase();
      const candidateEmail = String(candidateData?.email || '').toLowerCase();
      const jobTitle = String(application.job?.title || '').toLowerCase();
      const status = String(application.status || '').toLowerCase();

      const matchesSearch =
        !query ||
        candidateName.includes(query) ||
        candidateEmail.includes(query) ||
        jobTitle.includes(query) ||
        status.includes(query);

      const matchesStatus = selectedStatus === 'all' || status === selectedStatus;
      const matchesJob = selectedJob === 'all' || String(application.job?.title || '') === selectedJob;

      return matchesSearch && matchesStatus && matchesJob;
    });
  }, [applications, searchTerm, selectedStatus, selectedJob]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-700">Loading applications...</p>
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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">All Applications</h1>
          <p className="text-gray-600 mt-1">
            Showing <span className="font-semibold text-blue-600">{filteredApplications.length}</span> of{' '}
            <span className="font-semibold text-blue-600">{applications.length}</span> applications
          </p>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="relative">
              <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search candidate, email, job..."
                className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as 'all' | ApplicationStatus)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
            >
              <option value="all">All Status</option>
              {statusOptions.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {toTitleCase(status)}
                </option>
              ))}
            </select>

            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value as 'all' | string)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Jobs</option>
              {jobOptions.map((jobTitle) => (
                <option key={jobTitle} value={jobTitle}>
                  {jobTitle}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredApplications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 text-center py-14">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No applications matched</h2>
            <p className="text-gray-600">Try changing search text or filter values.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Job</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Resume</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Applied At</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => {
                    const candidateData = application.candidate;
                    const candidateName = candidateData?.name || 'Candidate';
                    const candidateEmail = candidateData?.email || 'N/A';
                    const jobData = application.job;
                    const jobTitle = jobData?.title || application.jobId || 'N/A';
                    const appliedDate =
                      application.createdAt ||
                      application.appliedAt ||
                      application.updatedAt;

                    return (
                      <tr key={application._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{candidateName}</div>
                          <div className="text-sm text-gray-500">{candidateEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-gray-700">{jobTitle}</td>
                        <td className="px-6 py-4">
                          {application.resume ? (
                            <a
                              href={application.resume}
                              target="_blank"
                              rel="noreferrer"
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
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadgeClassMap[application.status] || statusBadgeClassMap.applied}`}
                            >
                              {toTitleCase(application.status)}
                            </span>
                            <select
                              value={application.status}
                              onChange={(e) =>
                                updateStatus({
                                  id: application._id,
                                  status: e.target.value as ApplicationStatus,
                                })
                              }
                              disabled={isPending}
                              className="border border-gray-300 rounded-lg px-3 py-2 text-sm capitalize"
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status} className="capitalize">
                                  {toTitleCase(status)}
                                </option>
                              ))}
                            </select>
                          </div>
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
  );
};

export default RecruiterApplications;
