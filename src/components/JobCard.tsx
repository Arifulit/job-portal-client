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

  const normalizedStatus = String(job.status || '').toLowerCase();
  const statusStyles =
    normalizedStatus === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : normalizedStatus === 'pending'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="group block rounded-2xl border border-slate-200/90 bg-white p-6 shadow-[0_8px_28px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_16px_34px_rgba(30,64,175,0.16)]"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="mb-1 line-clamp-1 text-xl font-semibold tracking-tight text-slate-900 transition-colors group-hover:text-blue-700">
              {job.title}
          </h3>
          <p className="line-clamp-1 text-sm font-medium text-slate-600">{companyName}</p>
        </div>

        <div className="flex items-center gap-2">
          {job.status && (
            <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles}`}>
              {job.status}
            </span>
          )}
          {user?.role === 'candidate' && (
            <button
              onClick={handleSaveToggle}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
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

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">{job.location || 'Location not specified'}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Briefcase className="h-4 w-4" />
          <span className="capitalize">{job.jobType?.replace('-', ' ') || 'Full Time'}</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <DollarSign className="h-4 w-4" />
          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          {formatRelativeTime(job.createdAt)}
        </div>
      </div>

      <p className="mb-5 line-clamp-2 text-sm leading-6 text-slate-600">
        {job.description ? job.description.substring(0, 150) + '...' : 'No description available'}
      </p>

      <div className="mb-3 flex flex-wrap gap-2">
        {job.experienceLevel && (
          <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold capitalize text-blue-700">{job.experienceLevel}</span>
        )}
        {job.skills && job.skills.length > 0 && (
          job.skills.slice(0, 3).map((skill, index) => (
            <span key={index} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600">{skill}</span>
          ))
        )}
      </div>

      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition-colors group-hover:text-blue-800">
        View Job Details
      </div>
    </Link>
  );
};
