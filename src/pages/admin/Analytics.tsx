// এই ফাইলটি admin panel এর একটি page UI ও business flow পরিচালনা করে।
import { Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useDashboardStats } from '../../services/userService';
import { useAdminAllJobs, useDeleteJob } from '../../services/jobService';
import { useAdminJobApplications } from '../../services/applicationService';
import { Loader } from '../../components/Loader';
import { BarChart3, Briefcase, FileText, Users } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';

const Analytics = () => {
	const [selectedJobId, setSelectedJobId] = useState<string>('');
	const [jobSearch, setJobSearch] = useState('');
	const [jobTypeFilter, setJobTypeFilter] = useState('all');
	const [jobStatusFilter, setJobStatusFilter] = useState('all');
	const [jobPage, setJobPage] = useState(1);

	const [applicationSearch, setApplicationSearch] = useState('');
	const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
	const [applicationPage, setApplicationPage] = useState(1);
	const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

	const { data: stats, isLoading } = useDashboardStats();
	const { data: adminJobs = [], isLoading: jobsLoading } = useAdminAllJobs();
	const { mutate: deleteJob, isPending: deletingJob } = useDeleteJob();
	const { data: applications = [], isLoading: applicationsLoading } = useAdminJobApplications(selectedJobId || undefined);

	const jobsPerPage = 8;
	const applicationsPerPage = 6;

	const totalUsers = stats?.totalUsers ?? 0;
	const totalJobs = stats?.totalJobs ?? 0;
	const totalApplications = stats?.totalApplications ?? 0;
	const activeJobs = stats?.activeJobs ?? 0;
	const pendingApplications = stats?.pendingApplications ?? 0;
	const hiredCount = stats?.hiredCount ?? 0;
	const conversionRate = totalApplications > 0 ? Math.round((hiredCount / totalApplications) * 100) : 0;

	const handleDeleteJob = (jobId: string, title?: string) => {
		setDeleteTarget({ id: jobId, title: title || 'this job' });
	};

	const handleConfirmDeleteJob = () => {
		if (!deleteTarget) return;
		deleteJob(deleteTarget.id, {
			onSuccess: () => setDeleteTarget(null),
			onError: () => setDeleteTarget(null),
		});
	};

	const handleViewApplications = (jobId: string) => {
		setSelectedJobId(jobId);
		setApplicationPage(1);
		setApplicationSearch('');
		setApplicationStatusFilter('all');
	};

	const filteredJobs = useMemo(() => {
		const query = jobSearch.trim().toLowerCase();
		return adminJobs.filter((job) => {
			const titleMatch = String(job.title || '').toLowerCase().includes(query);
			const locationMatch = String(job.location || '').toLowerCase().includes(query);
			const queryMatched = !query || titleMatch || locationMatch;

			const type = String(job.jobType || '').toLowerCase();
			const status = String(job.status || '').toLowerCase();
			const typeMatched = jobTypeFilter === 'all' || type === jobTypeFilter;
			const statusMatched = jobStatusFilter === 'all' || status === jobStatusFilter;

			return queryMatched && typeMatched && statusMatched;
		});
	}, [adminJobs, jobSearch, jobTypeFilter, jobStatusFilter]);

	const totalJobPages = Math.max(1, Math.ceil(filteredJobs.length / jobsPerPage));
	const safeJobPage = Math.min(jobPage, totalJobPages);
	const paginatedJobs = useMemo(() => {
		const start = (safeJobPage - 1) * jobsPerPage;
		return filteredJobs.slice(start, start + jobsPerPage);
	}, [filteredJobs, safeJobPage]);

	const filteredApplications = useMemo(() => {
		const query = applicationSearch.trim().toLowerCase();
		return applications.filter((application) => {
			const candidateName = String(application.candidate?.name || '').toLowerCase();
			const candidateId = String(application.candidateId || '').toLowerCase();
			const queryMatched = !query || candidateName.includes(query) || candidateId.includes(query);
			const statusMatched =
				applicationStatusFilter === 'all' || String(application.status || '').toLowerCase() === applicationStatusFilter;
			return queryMatched && statusMatched;
		});
	}, [applications, applicationSearch, applicationStatusFilter]);

	const totalApplicationPages = Math.max(1, Math.ceil(filteredApplications.length / applicationsPerPage));
	const safeApplicationPage = Math.min(applicationPage, totalApplicationPages);
	const paginatedApplications = useMemo(() => {
		const start = (safeApplicationPage - 1) * applicationsPerPage;
		return filteredApplications.slice(start, start + applicationsPerPage);
	}, [filteredApplications, safeApplicationPage]);

	if (isLoading) return <Loader />;

	return (
		<>
		<div className="space-y-6">
			<div className="rounded-2xl border border-violet-200 bg-gradient-to-r from-violet-700 to-indigo-700 p-6 text-white shadow-sm">
				<h1 className="text-2xl font-black">Analytics and Moderation</h1>
				<p className="mt-1 text-sm text-violet-100">
					Monitor operational metrics and jump to key admin actions quickly.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-4 md:grid-cols-3">
				<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-semibold text-slate-500">Users</p>
					<p className="mt-2 text-3xl font-black text-slate-900">{totalUsers}</p>
					<p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
						<Users className="h-4 w-4" /> Platform accounts
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-semibold text-slate-500">Jobs</p>
					<p className="mt-2 text-3xl font-black text-slate-900">{totalJobs}</p>
					<p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
						<Briefcase className="h-4 w-4" /> {activeJobs} active
					</p>
				</div>

				<div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
					<p className="text-sm font-semibold text-slate-500">Applications</p>
					<p className="mt-2 text-3xl font-black text-slate-900">{totalApplications}</p>
					<p className="mt-2 inline-flex items-center gap-2 text-xs text-slate-600">
						<FileText className="h-4 w-4" /> {conversionRate}% hire conversion
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
						<BarChart3 className="h-5 w-5 text-violet-600" /> KPI Summary
					</h2>
					<div className="space-y-3 text-sm text-slate-700">
						<p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
							<span>Active jobs</span>
							<span className="font-semibold">{activeJobs}</span>
						</p>
						<p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
							<span>Pending applications</span>
							<span className="font-semibold">{pendingApplications}</span>
						</p>
						<p className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
							<span>Hired candidates</span>
							<span className="font-semibold">{hiredCount}</span>
						</p>
					</div>
				</div>

				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2>
					<div className="space-y-3">
						<Link
							to="/admin/users"
							className="inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
						>
							Open User Management
						</Link>
						<Link
							to="/admin/dashboard"
							className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
						>
							Back to Admin Dashboard
						</Link>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
				<div className="mb-4 flex items-center justify-between">
					<h2 className="text-lg font-bold text-slate-900">All Jobs (Admin)</h2>
					<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
						{filteredJobs.length} filtered
					</span>
				</div>

				<div className="mb-4 grid gap-3 md:grid-cols-4">
					<input
						value={jobSearch}
						onChange={(event) => {
							setJobSearch(event.target.value);
							setJobPage(1);
						}}
						placeholder="Search jobs"
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
					/>
					<select
						value={jobTypeFilter}
						onChange={(event) => {
							setJobTypeFilter(event.target.value);
							setJobPage(1);
						}}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
					>
						<option value="all">All Types</option>
						<option value="full-time">Full-time</option>
						<option value="part-time">Part-time</option>
						<option value="contract">Contract</option>
						<option value="internship">Internship</option>
						<option value="remote">Remote</option>
					</select>
					<select
						value={jobStatusFilter}
						onChange={(event) => {
							setJobStatusFilter(event.target.value);
							setJobPage(1);
						}}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
					>
						<option value="all">All Status</option>
						<option value="approved">Approved</option>
						<option value="reviewed">Reviewed</option>
						<option value="pending">Pending</option>
						<option value="rejected">Rejected</option>
						<option value="draft">Draft</option>
						<option value="active">Active</option>
						<option value="expired">Expired</option>
					</select>
					<div className="flex items-center justify-end gap-2 text-xs text-slate-600">
						<span>Page {safeJobPage} / {totalJobPages}</span>
					</div>
				</div>

				{jobsLoading ? (
					<Loader />
				) : filteredJobs.length === 0 ? (
					<p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">No jobs found.</p>
				) : (
					<div className="space-y-3">
						{paginatedJobs.map((job) => (
							<div key={job._id} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-semibold text-slate-900">{job.title || 'Untitled Job'}</p>
									<p className="text-xs text-slate-600">
										{job.location || 'Location not set'} • {job.jobType || 'Type not set'} • {job.status || 'unknown'}
									</p>
								</div>
								<div className="inline-flex gap-2">
									<Button
										size="sm"
										variant="outline"
										onClick={() => handleViewApplications(job._id)}
										className="border-blue-300 text-blue-700"
									>
										Applications
									</Button>
									<Button
										size="sm"
										variant="outline"
										disabled={deletingJob}
										onClick={() => handleDeleteJob(job._id, job.title)}
										className="border-red-300 text-red-700"
									>
										Delete
									</Button>
								</div>
							</div>
						))}

						<div className="flex items-center justify-end gap-2 pt-2">
							<Button
								size="sm"
								variant="outline"
								disabled={safeJobPage <= 1}
								onClick={() => setJobPage((prev) => Math.max(1, prev - 1))}
							>
								Previous
							</Button>
							<Button
								size="sm"
								variant="outline"
								disabled={safeJobPage >= totalJobPages}
								onClick={() => setJobPage((prev) => Math.min(totalJobPages, prev + 1))}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</div>

			{selectedJobId && (
				<div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
					<div className="mb-4 flex items-center justify-between">
						<h2 className="text-lg font-bold text-slate-900">Applications for Selected Job</h2>
						<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
							Job ID: {selectedJobId}
						</span>
					</div>

					<div className="mb-4 grid gap-3 md:grid-cols-3">
						<input
							value={applicationSearch}
							onChange={(event) => {
								setApplicationSearch(event.target.value);
								setApplicationPage(1);
							}}
							placeholder="Search candidate"
							className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
						/>
						<select
							value={applicationStatusFilter}
							onChange={(event) => {
								setApplicationStatusFilter(event.target.value);
								setApplicationPage(1);
							}}
							className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
						>
							<option value="all">All Status</option>
							<option value="applied">Applied</option>
							<option value="shortlisted">Shortlisted</option>
							<option value="interview">Interview</option>
							<option value="hired">Hired</option>
							<option value="rejected">Rejected</option>
						</select>
						<div className="flex items-center justify-end text-xs text-slate-600">
							Page {safeApplicationPage} / {totalApplicationPages}
						</div>
					</div>

					{applicationsLoading ? (
						<Loader />
					) : filteredApplications.length === 0 ? (
						<p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
							No applications found for this job.
						</p>
					) : (
						<div className="space-y-3">
							{paginatedApplications.map((application) => (
								<div key={application._id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p className="text-sm font-semibold text-slate-900">
										Candidate: {application.candidate?.name || application.candidateId || 'Unknown Candidate'}
									</p>
									<p className="mt-1 text-xs text-slate-600">Status: {application.status}</p>
									<p className="mt-1 text-xs text-slate-600">Applied At: {new Date(application.appliedAt).toLocaleString()}</p>
								</div>
							))}

							<div className="flex items-center justify-end gap-2 pt-2">
								<Button
									size="sm"
									variant="outline"
									disabled={safeApplicationPage <= 1}
									onClick={() => setApplicationPage((prev) => Math.max(1, prev - 1))}
								>
									Previous
								</Button>
								<Button
									size="sm"
									variant="outline"
									disabled={safeApplicationPage >= totalApplicationPages}
									onClick={() => setApplicationPage((prev) => Math.min(totalApplicationPages, prev + 1))}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</div>
			)}
		</div>
		<ConfirmDialog
			open={Boolean(deleteTarget)}
			title="Delete Job"
			description={`Are you sure you want to delete "${deleteTarget?.title || 'this job'}"? This action cannot be undone.`}
			confirmLabel="Yes, Delete"
			cancelLabel="Cancel"
			loading={deletingJob}
			onConfirm={handleConfirmDeleteJob}
			onCancel={() => setDeleteTarget(null)}
		/>
		</>
	);
};

export default Analytics;
