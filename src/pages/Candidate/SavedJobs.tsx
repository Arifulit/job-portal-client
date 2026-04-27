import React from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, Briefcase } from 'lucide-react';
import { JobCard } from '../../components/JobCard';
import { Loader } from '../../components/Loader';
import { useSavedJobs } from '../../services/jobService';

const SavedJobs: React.FC = () => {
  const { data: savedJobs = [], isLoading, isError, refetch } = useSavedJobs();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-bold text-red-700">Failed to load saved jobs</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Saved Jobs</h1>
              <p className="mt-1 text-sm text-slate-600">
                You saved <span className="font-semibold text-blue-700">{savedJobs.length}</span> jobs for later.
              </p>
            </div>
            <Bookmark className="h-7 w-7 text-blue-600" />
          </div>
        </div>

        {savedJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white py-14 text-center shadow-sm">
            <Briefcase className="mx-auto h-12 w-12 text-slate-300" />
            <h2 className="mt-4 text-2xl font-bold text-slate-900">No saved jobs yet</h2>
            <p className="mt-2 text-sm text-slate-600">Save jobs while browsing and they will appear here.</p>
            <Link
              to="/candidate/jobs"
              className="mt-6 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {savedJobs.map((job) => (
              <JobCard key={job._id} job={job} isSaved />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
