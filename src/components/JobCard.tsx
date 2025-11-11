import { Link } from 'react-router-dom';
import { Job } from '../types';
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
import { formatRelativeTime, formatSalary, getStatusColor } from '../utils/helpers';
import { useSaveJob, useUnsaveJob } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
}

export const JobCard = ({ job, isSaved = false }: JobCardProps) => {
  const { user } = useAuth();
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();
  const [saved, setSaved] = useState(isSaved);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== 'seeker') return;

    if (saved) {
      unsaveJobMutation.mutate(job._id, {
        onSuccess: () => setSaved(false),
      });
    } else {
      saveJobMutation.mutate(job._id, {
        onSuccess: () => setSaved(true),
      });
    }
  };

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          {job.companyLogo && (
            <img
              src={job.companyLogo}
              alt={job.company}
              className="w-16 h-16 rounded-lg object-cover"
            />
          )}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">{job.company}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`badge ${getStatusColor(job.status)}`}>{job.status}</span>
          {user?.role === 'seeker' && (
            <button
              onClick={handleSaveToggle}
              className="btn btn-ghost btn-sm btn-circle"
              disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
            >
              {saved ? (
                <BookmarkCheck className="w-5 h-5 text-blue-600" />
              ) : (
                <Bookmark className="w-5 h-5 text-gray-400" />
              )}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-1" />
          {job.location}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Briefcase className="w-4 h-4 mr-1" />
          {job.jobType}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          {formatRelativeTime(job.createdAt)}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{job.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className="badge badge-outline">{job.category}</span>
        <span className="badge badge-outline capitalize">{job.experienceLevel}</span>
        {job.isPremium && <span className="badge badge-warning">Premium</span>}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{job.applicantsCount} applicants</span>
        <span>{job.views} views</span>
      </div>
    </Link>
  );
};
