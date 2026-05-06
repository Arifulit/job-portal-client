// এই ফাইলটি নির্দিষ্ট feature/component UI ও interaction logic বাস্তবায়ন করে।
import { Link, useNavigate } from 'react-router-dom';
import { Job } from '../types';
import {
  MapPin,
  Briefcase,
  Calendar,
  Bookmark,
  BookmarkCheck,
  DollarSign,
  Zap,
  ArrowRight,
} from 'lucide-react';
import { useSaveJob, useUnsaveJob } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { getJobDetailsPath } from '../utils/helpers';
import { motion } from 'framer-motion';

interface JobCardProps {
  job: Job;
  isSaved?: boolean;
}

const getCompanyId = (company: Job['company']): string | undefined => {
  if (!company || typeof company === 'string') {
    return undefined;
  }

  const companyRecord = company as Record<string, unknown>;
  const rawId = companyRecord._id ?? companyRecord.id;

  return typeof rawId === 'string' || typeof rawId === 'number' ? String(rawId) : undefined;
};

export const JobCard = ({ job, isSaved = false }: JobCardProps) => {
  const { user } = useAuth();
  const saveJobMutation = useSaveJob();
  const unsaveJobMutation = useUnsaveJob();
  const [saved, setSaved] = useState(isSaved);
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canSave = ['candidate', 'seeker', 'job_seeker'].includes(normalizedRole);
  const jobPath = getJobDetailsPath(job as Job & { id?: string; routeId?: string });

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !canSave) return;

    const jobId = job._id || (job as Job & { id?: string }).id || (job as Job & { routeId?: string }).routeId;
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
  const companyLogo =
    typeof job.company === 'string'
      ? undefined
      : job.company?.logo;
  const companyId = getCompanyId(job.company);
  const navigate = useNavigate();

  const handleCompanyClick = (e: React.MouseEvent, id?: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (id) navigate(`/company/${id}/profile`);
  };
  const salary = job.salary as
    | {
        currency?: string;
        min?: number;
        max?: number;
      }
    | undefined;
  const deadlineText = job.deadline
    ? new Date(job.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Open';
  const experienceText = job.experience || (job.experienceLevel ? `${job.experienceLevel} level` : 'Experience not specified');

  const normalizedStatus = String(job.status || '').toLowerCase();
  const statusStyles =
    normalizedStatus === 'approved'
      ? 'badge-success'
      : normalizedStatus === 'pending'
        ? 'badge-warning'
        : 'badge-primary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={{ y: -8 }}
    >
      <Link
        to={jobPath}
        className="group relative block h-full overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50 shadow-[0_10px_30px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 via-cyan-400 to-fuchsia-500 opacity-80" />
        <div className="relative h-full flex flex-col p-5 sm:p-6">
          {/* Gradient background on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50/70 via-transparent to-fuchsia-50/50 dark:from-primary-900/20 dark:via-transparent dark:to-fuchsia-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            {/* Header with status badge */}
            <div className="relative mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-1 items-start gap-3">
                <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-800">
                  {companyLogo ? (
                    <img src={companyLogo} alt={companyName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      {companyName.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                <motion.div 
                  className="mb-2 flex flex-wrap items-center gap-2"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  {job.jobType && (
                    <motion.span 
                      className="inline-flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 shadow-sm dark:border-primary-900 dark:bg-primary-900/70 dark:text-primary-200"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      <Zap className="h-3 w-3" />
                      {job.jobType}
                    </motion.span>
                  )}
                  {job.status && (
                    <motion.span 
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold capitalize shadow-sm ${statusStyles}`}
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                    >
                      {job.status}
                    </motion.span>
                  )}
                </motion.div>
                <motion.h3 
                  className="mb-1 line-clamp-2 text-[1.05rem] font-extrabold leading-tight tracking-tight text-slate-900 transition-colors group-hover:text-primary-700 dark:text-slate-100 dark:group-hover:text-primary-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {job.title}
                </motion.h3>
                {companyId ? (
                  <motion.p 
                    onClick={(e) => handleCompanyClick(e, companyId)}
                    className="line-clamp-1 cursor-pointer text-sm font-medium text-slate-600 transition hover:text-primary-600 hover:underline dark:text-slate-400 dark:hover:text-primary-300"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {companyName}
                  </motion.p>
                ) : (
                  <motion.p 
                    className="line-clamp-1 text-sm font-medium text-slate-600 dark:text-slate-400"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {companyName}
                  </motion.p>
                )}
              </div>
              </div>
              
              {/* Save button with animation */}
              {canSave && (
                <motion.button
                  onClick={handleSaveToggle}
                  type="button"
                  aria-label={saved ? 'Unsave job' : 'Save job'}
                  className={`flex-shrink-0 rounded-lg p-2.5 transition-all duration-200 ${
                    saved
                      ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100 dark:bg-primary-900/70 dark:text-primary-300 dark:ring-primary-900'
                      : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700 dark:hover:bg-slate-700'
                  }`}
                  disabled={saveJobMutation.isPending || unsaveJobMutation.isPending}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: saved ? 360 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {saved ? (
                      <BookmarkCheck className="h-5 w-5" />
                    ) : (
                      <Bookmark className="h-5 w-5" />
                    )}
                  </motion.div>
                </motion.button>
              )}
            </div>

            {/* Location with animation */}
            <motion.div 
              className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
            >
              <MapPin className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="truncate">{job.location || 'Location not specified'}</span>
            </motion.div>

            {/* Salary and Experience Grid with stagger */}
            <motion.div 
              className="mb-4 grid grid-cols-2 gap-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ staggerChildren: 0.05, delayChildren: 0.3 }}
            >
              {[
                {
                  icon: Briefcase,
                  label: 'Experience',
                  value: experienceText,
                },
                {
                  icon: Calendar,
                  label: 'Deadline',
                  value: deadlineText,
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700"
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                >
                  <item.icon className="h-4 w-4 flex-shrink-0 text-slate-400 dark:text-slate-500" />
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{item.label}</p>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{item.value}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Salary info if available */}
            {(job.salary || job.salaryMin) && (
              <motion.div 
                className="mb-4 flex items-center gap-2 rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 via-white to-cyan-50/70 p-3 shadow-sm transition-shadow hover:shadow-md dark:border-primary-900 dark:from-primary-900/30 dark:via-slate-900 dark:to-cyan-900/10"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 4 }}
                transition={{ delay: 0.35 }}
              >
                <motion.div
                  animate={{ rotateZ: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 }}
                >
                  <DollarSign className="h-5 w-5 flex-shrink-0 text-primary-600 dark:text-primary-400" />
                </motion.div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-primary-700 dark:text-primary-300">
                    {typeof job.salary === 'object' && salary
                      ? `${salary.currency || 'BDT'} ${salary.min || 0} - ${salary.max || 0}`
                      : typeof job.salary === 'number'
                        ? `${job.currency || 'BDT'} ${job.salary}`
                        : job.salaryMin && job.salaryMax
                          ? `${job.currency || 'BDT'} ${job.salaryMin} - ${job.salaryMax}`
                          : 'Salary Negotiable'}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Footer CTA */}
            <motion.div 
              className="mt-auto flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-700"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-sm font-semibold text-slate-700 transition group-hover:text-primary-700 dark:text-slate-300 dark:group-hover:text-primary-300">View Full Details</span>
              <motion.div
                className="rounded-full bg-primary-50 p-2 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
