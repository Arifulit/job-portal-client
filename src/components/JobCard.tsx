// এই ফাইলটি নির্দিষ্ট feature/component UI ও interaction logic বাস্তবায়ন করে।
import { Link } from 'react-router-dom';
import { Job } from '../types';
import {
  MapPin,
  Briefcase,
  Calendar,
  Bookmark,
  BookmarkCheck,
} from 'lucide-react';
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
  const jobId = job._id || (job as Job & { id?: string }).id;

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || user.role !== 'candidate') return;

    if (!jobId) return;

    if (saved) {
      unsaveJobMutation.mutate(jobId, {
        onSuccess: () => setSaved(false),
      });
    } else {
      saveJobMutation.mutate(jobId, {
        onSuccess: () => setSaved(true),
      });
    }
  };

  const companyName =
    typeof job.company === 'string'
      ? job.company
      : job.company?.name || 'Confidential Company';
  const deadlineText = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Open';
  const experienceText = job.experience || (job.experienceLevel ? `${job.experienceLevel} level` : 'Experience not specified');

  const normalizedStatus = String(job.status || '').toLowerCase();
  const statusStyles =
    normalizedStatus === 'approved'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : normalizedStatus === 'pending'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-slate-100 text-slate-600 border-slate-200';

  return (
    <Link
      to={jobId ? `/jobs/${jobId}` : '/jobs'}
      className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 pr-2">
          <h3 className="mb-1 line-clamp-2 text-xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-slate-700">
            {job.title}
          </h3>
          <p className="line-clamp-1 text-sm font-semibold text-slate-600">{companyName}</p>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm font-medium text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="h-4 w-4" />
          {job.location || 'Location not specified'}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
        <span className="inline-flex items-center gap-1.5 font-medium">
          <Briefcase className="h-4 w-4" />
          {experienceText}
        </span>
        <span className="inline-flex items-center gap-1.5 font-medium sm:justify-end">
          <Calendar className="h-4 w-4" />
          {deadlineText}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
        <span className="text-sm font-semibold text-slate-800">View Details</span>

        <div className="flex items-center gap-2">
          {job.status && (
            <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold capitalize ${statusStyles}`}>
              {job.status}
            </span>
          )}
          {user?.role === 'candidate' && (
            <button
              onClick={handleSaveToggle}
              className="rounded-full border border-slate-300 bg-white p-1.5 text-slate-500 transition hover:border-slate-400 hover:bg-slate-100 hover:text-slate-700"
              disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4 text-slate-800" />
              ) : (
                <Bookmark className="h-4 w-4 text-gray-500" />
              )}
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};
