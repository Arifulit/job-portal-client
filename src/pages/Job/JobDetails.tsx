// src/pages/Job/JobDetails.tsx
import { useParams, Link } from 'react-router-dom';
import { useJob } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import Badge from '../../components/ui/badge';
import { useState } from 'react';
import { useApplyJob } from '../../services/applicationService';
import ApplicationForm from '../../components/ApplicationForm';
import { MapPin, Briefcase, DollarSign, Clock, Building, Calendar } from 'lucide-react';

const JobDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, error } = useJob(id);
  const { user } = useAuth();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const { mutate: applyForJob, isPending: isSubmitting } = useApplyJob();

  const roleValue = String(user?.role || '').toLowerCase();
  const canApply = roleValue === 'candidate' || roleValue === 'seeker' || roleValue === 'job_seeker';
  const companyName =
    typeof job?.company === 'string'
      ? job.company
      : job?.company?.name || 'Company not specified';

  const handleApply = (values: { resumeFile: File; coverLetter?: string }) => {
    if (!id) {
      return;
    }

    applyForJob({
      jobId: id,
      coverLetter: values.coverLetter,
      resumeFile: values.resumeFile,
    }, {
      onSuccess: () => {
        setHasApplied(true);
        setShowApplicationModal(false);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <Skeleton className="h-8 w-3/4 mb-4" />
            <Skeleton className="h-6 w-1/2 mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>

            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-8" />

            <Skeleton className="h-6 w-32 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6 mb-8" />

            <Skeleton className="h-12 w-40" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error loading job details</h2>
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
          <Link to="/jobs" className="mt-4 inline-block text-blue-600 hover:underline">
            ← Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Job not found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          {/* Job Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col md:flex-row md:items-start justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{job.title}</h1>
                <div className="flex items-center text-gray-600 dark:text-gray-300 mb-4">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{companyName}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="flex items-center">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {job.location || 'Location not specified'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    <Briefcase className="h-3.5 w-3.5 mr-1" />
                    {job.jobType?.replace('-', ' ') || 'Not specified'}
                  </Badge>
                  {job.salary && (
                    <Badge variant="outline" className="flex items-center">
                      <DollarSign className="h-3.5 w-3.5 mr-1" />
                      {job.salary.min} - {job.salary.max} {job.salary.currency}
                    </Badge>
                  )}
                  <Badge variant="outline" className="flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date(job.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {canApply && (
                  <Button
                    onClick={() => setShowApplicationModal(true)}
                    disabled={hasApplied}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {hasApplied ? 'Applied' : 'Apply Now'}
                  </Button>
                )}
                {!user && (
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Link to="/login">Login to Apply</Link>
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <Link to="/jobs">Back to Jobs</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Job Content */}
          <div className="p-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-xl font-semibold mb-4">Job Description</h2>
              <div
                className="mb-8"
                dangerouslySetInnerHTML={{ __html: job.description || 'No description available' }}
              />

              {job.requirements && job.requirements.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.responsibilities && job.responsibilities.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-2">Responsibilities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {job.responsibilities.map((responsibility, index) => (
                      <li key={index}>{responsibility}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Job Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Posted Date</p>
                      <p className="font-medium">
                        {new Date(job.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Job Type</p>
                      <p className="font-medium capitalize">{job.jobType?.replace('-', ' ')}</p>
                    </div>
                  </div>
                  {job.salary && (
                    <div className="flex items-start">
                      <DollarSign className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Salary</p>
                        <p className="font-medium">
                          {job.salary.min} - {job.salary.max} {job.salary.currency}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium">{job.location || 'Not specified'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Apply for {job.title}</h2>

            <ApplicationForm
              onSubmit={handleApply}
              onCancel={() => setShowApplicationModal(false)}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
