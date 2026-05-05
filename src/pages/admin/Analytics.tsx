


import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDashboardStats } from '../../services/userService';
import { useAdminAllJobs, useDeleteJob } from '../../services/jobService';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

type StatusKey =
  | 'approved' | 'active' | 'pending' | 'rejected' | 'expired'
  | 'draft' | 'reviewed' | 'applied' | 'shortlisted' | 'interview' | 'hired';

const STATUS_CLASSES: Record<StatusKey, string> = {
  approved:    'bg-[#EAF3DE] text-[#27500A] border border-[#C0DD97]',
  active:      'bg-[#E1F5EE] text-[#085041] border border-[#9FE1CB]',
  pending:     'bg-[#FAEEDA] text-[#633806] border border-[#FAC775]',
  rejected:    'bg-[#FCEBEB] text-[#791F1F] border border-[#F7C1C1]',
  expired:     'bg-[#F1EFE8] text-[#444441] border border-[#D3D1C7]',
  draft:       'bg-[#F1EFE8] text-[#444441] border border-[#D3D1C7]',
  reviewed:    'bg-[#E6F1FB] text-[#0C447C] border border-[#B5D4F4]',
  applied:     'bg-[#E6F1FB] text-[#0C447C] border border-[#B5D4F4]',
  shortlisted: 'bg-[#E6F1FB] text-[#0C447C] border border-[#B5D4F4]',
  interview:   'bg-[#FAEEDA] text-[#633806] border border-[#FAC775]',
  hired:       'bg-[#EAF3DE] text-[#27500A] border border-[#C0DD97]',
};

function statusPill(status: string) {
  const key = (status || '').toLowerCase() as StatusKey;
  const cls = STATUS_CLASSES[key] ?? 'bg-slate-100 text-slate-600 border border-slate-200';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide ${cls}`}>
      {status}
    </span>
  );
}

/* ─── stat card ───────────────────────────────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: number | string;
  sub: string;
  accentColor: string;
}

function StatCard({ label, accentColor, value, sub }: StatCardProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-5">
      <div
        className="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
        style={{ background: accentColor }}
      />
      <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 font-mono text-3xl font-semibold tracking-tight text-slate-900">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      <p className="mt-1.5 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

/* ─── kpi row ─────────────────────────────────────────────────────────────── */

function KpiRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="font-mono text-sm font-medium text-slate-800">{value.toLocaleString()}</span>
    </div>
  );
}

/* ─── filter input ────────────────────────────────────────────────────────── */

function FilterInput({
  value,
  onChange,
  placeholder,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-[7px] text-xs text-slate-800 placeholder:text-slate-400 outline-none focus:border-slate-400 transition-colors ${className}`}
    />
  );
}

function FilterSelect({
  value,
  onChange,
  children,
  className = '',
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-lg border border-slate-200 bg-slate-50 px-3 py-[7px] text-xs text-slate-700 outline-none focus:border-slate-400 transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

/* ─── pagination ──────────────────────────────────────────────────────────── */

function Pagination({
  page,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between">
      <span className="font-mono text-[11px] text-slate-400">
        {page} / {total}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={onPrev}>
          ← Previous
        </Button>
        <Button size="sm" variant="outline" disabled={page >= total} onClick={onNext}>
          Next →
        </Button>
      </div>
    </div>
  );
}

/* ─── main component ──────────────────────────────────────────────────────── */

const Analytics = () => {
  const [jobSearch, setJobSearch]                       = useState('');
  const [jobTypeFilter, setJobTypeFilter]               = useState('all');
  const [jobStatusFilter, setJobStatusFilter]           = useState('all');
  const [jobPage, setJobPage]                           = useState(1);
  const [deleteTarget, setDeleteTarget]                 = useState<{ id: string; title: string } | null>(null);

  const { data: stats, isLoading }                      = useDashboardStats();
  const { data: adminJobs = [], isLoading: jobsLoading }= useAdminAllJobs();
  const { mutate: deleteJob, isPending: deletingJob }   = useDeleteJob();

  const jobsPerPage        = 8;

  const totalUsers        = stats?.totalUsers        ?? 0;
  const totalJobs         = stats?.totalJobs         ?? 0;
  const totalApplications = stats?.totalApplications ?? 0;
  const activeJobs        = stats?.activeJobs        ?? 0;
  const pendingApplications = stats?.pendingApplications ?? 0;
  const hiredCount        = stats?.hiredCount        ?? 0;
  const conversionRate    = totalApplications > 0
    ? Math.round((hiredCount / totalApplications) * 100)
    : 0;

  /* handlers */
  const handleDeleteJob = (jobId: string, title?: string) =>
    setDeleteTarget({ id: jobId, title: title || 'this job' });

  const handleConfirmDeleteJob = () => {
    if (!deleteTarget) return;
    deleteJob(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
      onError:   () => setDeleteTarget(null),
    });
  };

  /* filtered + paginated jobs */
  const filteredJobs = useMemo(() => {
    const query = jobSearch.trim().toLowerCase();
    return adminJobs.filter((job) => {
      const titleMatch    = String(job.title    || '').toLowerCase().includes(query);
      const locationMatch = String(job.location || '').toLowerCase().includes(query);
      const queryMatched  = !query || titleMatch || locationMatch;
      const type          = String(job.jobType  || '').toLowerCase();
      const status        = String(job.status   || '').toLowerCase();
      return queryMatched
        && (jobTypeFilter   === 'all' || type   === jobTypeFilter)
        && (jobStatusFilter === 'all' || status === jobStatusFilter);
    });
  }, [adminJobs, jobSearch, jobTypeFilter, jobStatusFilter]);

  const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
  const safeJobPage   = Math.min(jobPage, totalJobPages);
  const paginatedJobs = useMemo(() => {
    const start = (safeJobPage - 1) * jobsPerPage;
    return filteredJobs.slice(start, start + jobsPerPage);
  }, [filteredJobs, safeJobPage]);

  if (isLoading) return <Loader />;

  return (
    <>
      <div className="space-y-5">

        {/* ── page header ── */}
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              Admin / Analytics
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-900">
              Analytics &amp; Moderation
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Monitor platform metrics and manage content.
            </p>
          </div>
          <div className="flex shrink-0 gap-2">
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0F6E56] px-4 py-2 text-xs font-medium text-[#E1F5EE] transition-opacity hover:opacity-85"
            >
              User management
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M2 9L9 2M9 2H4M9 2v5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              to="/admin/dashboard"
              className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* ── stat cards ── */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Total users"
            value={totalUsers}
            sub="Platform accounts"
            accentColor="#1D9E75"
          />
          <StatCard
            label="Total jobs"
            value={totalJobs}
            sub={`${activeJobs.toLocaleString()} currently active`}
            accentColor="#378ADD"
          />
          <StatCard
            label="Applications"
            value={totalApplications}
            sub={`${conversionRate}% hire conversion`}
            accentColor="#D85A30"
          />
        </div>

        {/* ── kpi + quick actions ── */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#1D9E75]" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">KPI summary</h2>
            </div>
            <div className="space-y-2">
              <KpiRow label="Active jobs"          value={activeJobs}          />
              <KpiRow label="Pending applications" value={pendingApplications} />
              <KpiRow label="Hired candidates"     value={hiredCount}          />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#378ADD]" />
              <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-400">Quick actions</h2>
            </div>
            <div className="space-y-2.5">
              <Link
                to="/admin/users"
                className="flex w-full items-center justify-between rounded-lg bg-[#E1F5EE] px-4 py-3 text-sm font-semibold text-[#085041] transition-opacity hover:opacity-80 border border-[#9FE1CB]"
              >
                Open user management
                <span className="opacity-60">↗</span>
              </Link>
              <Link
                to="/admin/dashboard"
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
              >
                Back to admin dashboard
                <span className="opacity-40">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ── all jobs ── */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">All jobs — admin view</h2>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 font-mono text-[11px] text-slate-500">
              {filteredJobs.length} shown
            </span>
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-[2fr_1fr_1fr]">
            <FilterInput
              value={jobSearch}
              onChange={(v) => { setJobSearch(v); setJobPage(1); }}
              placeholder="Search title or location…"
            />
            <FilterSelect value={jobTypeFilter} onChange={(v) => { setJobTypeFilter(v); setJobPage(1); }}>
              <option value="all">All types</option>
              <option value="full-time">Full-time</option>
              <option value="remote">Remote</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="freelance">Freelance</option>
            </FilterSelect>
            <FilterSelect value={jobStatusFilter} onChange={(v) => { setJobStatusFilter(v); setJobPage(1); }}>
              <option value="all">All status</option>
              <option value="approved">Approved</option>
              <option value="reviewed">Reviewed</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
            </FilterSelect>
          </div>

          {jobsLoading ? (
            <Loader />
          ) : filteredJobs.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-xs text-slate-400">
              No jobs found.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                {paginatedJobs.map((job) => (
                  <div
                    key={job._id}
                    className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3.5 transition-colors hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {job.title || 'Untitled Job'}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                        <span>{job.location || 'Location not set'}</span>
                        <span className="text-slate-200">·</span>
                        <span>{job.jobType || 'Type not set'}</span>
                        <span className="text-slate-200">·</span>
                        {statusPill(job.status || 'unknown')}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={deletingJob}
                        onClick={() => handleDeleteJob(job._id, job.title)}
                        className="border-[#F7C1C1] bg-[#FCEBEB] text-[#791F1F] hover:opacity-80"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Pagination
                page={safeJobPage}
                total={totalJobPages}
                onPrev={() => setJobPage((p) => Math.max(1, p - 1))}
                onNext={() => setJobPage((p) => Math.min(totalJobPages, p + 1))}
              />
            </>
          )}
        </div>

      </div>

      {/* ── confirm dialog ── */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete job"
        description={`Are you sure you want to delete "${deleteTarget?.title || 'this job'}"? This action cannot be undone.`}
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        loading={deletingJob}
        onConfirm={handleConfirmDeleteJob}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default Analytics;