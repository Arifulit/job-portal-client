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
import { formatRelativeTime } from '../utils/helpers';
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

    if (!user || user.role !== 'candidate') return;

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

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Negotiable';
    const currencySymbol = currency === 'BDT' ? '৳' : currency || '$';
    if (min && max) {
      return `${currencySymbol}${min.toLocaleString()} - ${currencySymbol}${max.toLocaleString()}`;
    }
    if (min) {
      return `${currencySymbol}${min.toLocaleString()}+`;
    }
    return 'Negotiable';
  };

  const companyName =
    typeof job.company === 'string'
      ? job.company
      : job.company?.name || 'Confidential Company';

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="block bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 p-6"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-start space-x-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 hover:text-blue-600 mb-1">
              {job.title}
            </h3>
            <p className="text-gray-600 font-medium">
              {companyName}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {job.status && (
            <span className={`badge ${
              job.status === 'approved' ? 'badge-success' : 
              job.status === 'pending' ? 'badge-warning' : 
              'badge-neutral'
            }`}>{job.status}</span>
          )}
          {user?.role === 'candidate' && (
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
          {job.jobType?.replace('-', ' ') || 'Full Time'}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <DollarSign className="w-4 h-4 mr-1" />
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-1" />
          {formatRelativeTime(job.createdAt)}
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description ? job.description.substring(0, 150) + '...' : 'No description available'}
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {job.experienceLevel && (
          <span className="badge badge-outline capitalize">{job.experienceLevel}</span>
        )}
        {job.skills && job.skills.length > 0 && (
          job.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="badge badge-outline">{skill}</span>
          ))
        )}
      </div>
    </Link>
  );
};
