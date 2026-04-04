import { useMemo, useState } from 'react';
import {
	useAllUsers,
	useDeleteUser,
	useUpdateUserRole,
	useUpdateUserStatus,
	useApproveRecruiter,
	useRejectRecruiter,
} from '../../services/userService';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/ui/button';
import { User } from '../../types';
import { toast } from 'sonner';

const normalizeRole = (role: string) => String(role || '').toLowerCase();

const roleBadgeClass = (role: string) => {
	const value = normalizeRole(role);
	if (value === 'admin') return 'bg-indigo-100 text-indigo-700 border border-indigo-200';
	if (value === 'recruiter') return 'bg-cyan-100 text-cyan-700 border border-cyan-200';
	return 'bg-violet-100 text-violet-700 border border-violet-200';
};

const UserManagement = () => {
	const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'recruiter' | 'candidate'>('all');
	const [search, setSearch] = useState('');

	const { data, isLoading, isError, refetch } = useAllUsers(roleFilter === 'all' ? undefined : roleFilter);
	const { mutate: updateUserStatus, isPending: updatingStatus } = useUpdateUserStatus();
	const { mutate: updateUserRole, isPending: updatingRole } = useUpdateUserRole();
	const { mutate: deleteUser, isPending: deletingUser } = useDeleteUser();
	const { mutate: approveRecruiter, isPending: approvingRecruiter } = useApproveRecruiter();
	const { mutate: rejectRecruiter, isPending: rejectingRecruiter } = useRejectRecruiter();

	const users = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

	const filteredUsers = useMemo(() => {
		const query = search.trim().toLowerCase();

		return users.filter((user) => {
			if (!query) return true;
			return (
				String(user.name || '').toLowerCase().includes(query) ||
				String(user.email || '').toLowerCase().includes(query)
			);
		});
	}, [users, search]);

	const summary = useMemo(() => {
		const total = users.length;
		const active = users.filter((user) => user.isActive).length;
		const recruiters = users.filter((user) => normalizeRole(user.role) === 'recruiter').length;
		const candidates = users.filter((user) => normalizeRole(user.role) === 'candidate').length;
		return { total, active, recruiters, candidates };
	}, [users]);

	const handleRoleChange = (user: User, role: string) => {
		if (normalizeRole(user.role) === normalizeRole(role)) return;
		updateUserRole({ userId: user._id, role });
	};

	const handleStatusToggle = (user: User) => {
		updateUserStatus({ userId: user._id, suspend: user.isActive });
	};

	const handleDelete = (user: User) => {
		const ok = window.confirm(`Delete user ${user.name || user.email}?`);
		if (!ok) return;
		const loadingToastId = toast.loading('Deleting user...');
		deleteUser(user._id, {
			onSettled: () => {
				toast.dismiss(loadingToastId);
			},
		});
	};

	const handleApproveRecruiter = (user: User) => {
		approveRecruiter({ userId: user._id, status: 'shortlisted' });
	};

	const handleRejectRecruiter = (user: User) => {
		rejectRecruiter({ userId: user._id });
	};

	if (isLoading) return <Loader />;

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50 p-6">
				<p className="font-semibold text-red-700">Failed to load users</p>
				<Button onClick={() => refetch()} className="mt-3 bg-red-600 text-white hover:bg-red-700">
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-5">
			<div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white shadow-sm">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">Admin Console</p>
						<h1 className="mt-2 text-2xl font-black">User Management</h1>
						<p className="mt-1 text-sm text-slate-200">Manage user role, recruiter approval, account status, and cleanup actions.</p>
					</div>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
						<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
							<p className="text-[11px] text-slate-200">Total</p>
							<p className="text-lg font-black">{summary.total}</p>
						</div>
						<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
							<p className="text-[11px] text-slate-200">Active</p>
							<p className="text-lg font-black">{summary.active}</p>
						</div>
						<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
							<p className="text-[11px] text-slate-200">Recruiters</p>
							<p className="text-lg font-black">{summary.recruiters}</p>
						</div>
						<div className="rounded-lg bg-white/10 px-3 py-2 text-center">
							<p className="text-[11px] text-slate-200">Candidates</p>
							<p className="text-lg font-black">{summary.candidates}</p>
						</div>
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div className="grid gap-3 md:grid-cols-4">
					<input
						value={search}
						onChange={(event) => setSearch(event.target.value)}
						placeholder="Search by name or email"
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 md:col-span-2"
					/>

					<select
						value={roleFilter}
						onChange={(event) => setRoleFilter(event.target.value as 'all' | 'admin' | 'recruiter' | 'candidate')}
						className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-offset-2 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
					>
						<option value="all">All Roles</option>
						<option value="admin">Admin</option>
						<option value="recruiter">Recruiter</option>
						<option value="candidate">Candidate</option>
					</select>

					<Button
						onClick={() => refetch()}
						variant="outline"
						className="justify-center border-slate-300 text-slate-700"
					>
						Refresh
					</Button>
				</div>
				<p className="mt-3 text-xs text-slate-500">Showing {filteredUsers.length} user{filteredUsers.length === 1 ? '' : 's'} after filters.</p>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
				<table className="min-w-full divide-y divide-slate-200">
					<thead className="bg-slate-50">
						<tr>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">User</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Role</th>
							<th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Status</th>
							<th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">Actions</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200">
						{filteredUsers.map((user) => (
							<tr key={user._id} className="hover:bg-slate-50/70">
								<td className="px-4 py-3">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
											{String(user.name || user.email || 'U').trim().charAt(0).toUpperCase()}
										</div>
										<div>
											<p className="font-semibold text-slate-900">{user.name || 'Unnamed User'}</p>
											<p className="text-sm text-slate-600">{user.email}</p>
										</div>
									</div>
								</td>
								<td className="px-4 py-3">
									<div className="space-y-2">
										<span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${roleBadgeClass(user.role)}`}>
											{normalizeRole(user.role)}
										</span>
										<select
											value={normalizeRole(user.role)}
											onChange={(event) => handleRoleChange(user, event.target.value)}
											disabled={updatingRole}
											className="block w-full rounded-md border border-slate-300 px-2 py-1 text-sm"
										>
											<option value="admin">Admin</option>
											<option value="recruiter">Recruiter</option>
											<option value="candidate">Candidate</option>
										</select>
									</div>
								</td>
								<td className="px-4 py-3">
									<span
										className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
											user.isActive
												? 'bg-emerald-100 text-emerald-700'
												: 'bg-rose-100 text-rose-700'
										}`}
									>
										{user.isActive ? 'Active' : 'Inactive'}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<div className="inline-flex gap-2">
										{normalizeRole(user.role) === 'recruiter' && (
											<>
												<Button
													size="sm"
													variant="outline"
													onClick={() => handleApproveRecruiter(user)}
													disabled={approvingRecruiter}
													className="border-emerald-300 text-emerald-700"
												>
													Approve
												</Button>

												<Button
													size="sm"
													variant="outline"
													onClick={() => handleRejectRecruiter(user)}
													disabled={rejectingRecruiter}
													className="border-rose-300 text-rose-700"
												>
													Reject
												</Button>
											</>
										)}

										<Button
											size="sm"
											variant="outline"
											onClick={() => handleStatusToggle(user)}
											disabled={updatingStatus}
											className="border-slate-300"
										>
											{user.isActive ? 'Suspend' : 'Unsuspend'}
										</Button>

										<Button
											size="sm"
											variant="outline"
											onClick={() => handleDelete(user)}
											disabled={deletingUser}
											className="border-red-300 text-red-700"
										>
											Delete
										</Button>
									</div>
								</td>
							</tr>
						))}

						{filteredUsers.length === 0 && (
							<tr>
								<td colSpan={4} className="px-4 py-12 text-center text-sm text-slate-500">
									No users found for current filter.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default UserManagement;
