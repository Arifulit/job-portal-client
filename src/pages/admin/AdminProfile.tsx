
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { useProfile, useUpdateProfile } from '../../services/userService';
import {
  ShieldCheck,
  UserCircle2,
  Phone,
  MapPin,
  Mail,
  Calendar,
  LayoutDashboard,
  Users,
  Briefcase,
  LogOut,
  AlertCircle,
  Pencil,
  ArrowLeft,
  Camera,
  Check,
  X,
} from 'lucide-react';

/* ─── Shared input class ─────────────────────────────────────────────────── */
const inp =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-900 dark:focus:ring-indigo-900/40';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
    {children}
  </p>
);

const FieldValue = ({ children }: { children: React.ReactNode }) => (
  <p className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-200">{children}</p>
);

const Divider = () => <div className="border-t border-slate-100 dark:border-slate-800" />;

const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="group flex items-center gap-3 rounded-xl px-3 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-white dark:bg-slate-800 dark:group-hover:bg-slate-700">
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <SectionLabel>{label}</SectionLabel>
      <FieldValue>{value || '—'}</FieldValue>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════ */
const AdminProfile = (): JSX.Element => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isSaving } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [location, setLocation]   = useState('');
  const [biodata, setBiodata]     = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBiodata(profile.biodata || profile.bio || '');
  }, [profile]);

  const initials = useMemo(
    () => (String(profile?.name || 'A').trim().charAt(0) || 'A').toUpperCase(),
    [profile?.name],
  );

  const profileAvatar = avatarPreview || profile?.avatar || profile?.profileImage || '';
  const bioText       = profile?.biodata || profile?.bio || '';

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const handleSave = () => {
    if (!profile) return;
    const payload = new FormData();
    payload.append('name', name.trim());
    payload.append('phone', phone.trim());
    payload.append('location', location.trim());
    payload.append('biodata', biodata.trim());
    payload.append('bio', biodata.trim());
    if (avatarFile) payload.append('avatar', avatarFile);
    updateProfile(payload, {
      onSuccess: () => {
        setAvatarFile(null);
        setAvatarPreview('');
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBiodata(profile.biodata || profile.bio || '');
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(false);
  };

  /* ── Loading ─────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 dark:bg-[#080b14]">
        <div className="mx-auto max-w-5xl space-y-5">
          <Skeleton className="h-52 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
          <div className="grid md:grid-cols-2 gap-5">
            <Skeleton className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <Skeleton className="h-80 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ───────────────────────────────────────────────────────────── */
  if (isError || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-[#080b14]">
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-8 py-6 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="text-sm font-medium">Failed to load admin profile.</p>
          </div>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     EDIT VIEW
  ══════════════════════════════════════════════════════════════════════ */
  if (isEditing) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 dark:bg-[#080b14]">
        <div className="mx-auto max-w-2xl space-y-5">

          {/* Top bar */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0e1624] dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Profile
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-[#0e1624] dark:text-slate-300"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 active:scale-95"
              >
                <Check className="h-4 w-4" />
                {isSaving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Edit Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0e1624]">
            {/* Card header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
                  <UserCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Edit Profile</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:border-indigo-900/40 dark:bg-indigo-950/30 dark:text-indigo-400">
                <ShieldCheck className="h-3 w-3" />
                {String(profile.role || 'admin').toUpperCase()}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar upload */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <SectionLabel>Profile Picture</SectionLabel>
                <div className="mt-3 flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="h-16 w-16 overflow-hidden rounded-2xl border border-slate-200 bg-indigo-100 dark:border-slate-700 dark:bg-indigo-900/30 flex items-center justify-center text-xl font-bold text-indigo-700 dark:text-indigo-300">
                      {profileAvatar ? (
                        <img src={profileAvatar} alt="preview" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <label className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-indigo-600 ring-2 ring-white transition hover:bg-indigo-700 dark:ring-[#0e1624]">
                      <Camera className="h-3 w-3 text-white" />
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{profile.name || 'Admin'}</p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{profile.email}</p>
                    <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                      <Camera className="h-3 w-3" />
                      Change Photo
                      <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Fields grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <UserCircle2 className="h-3.5 w-3.5" /> Full Name
                  </label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className={inp} disabled={isSaving} />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Phone className="h-3.5 w-3.5" /> Phone
                  </label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880…" className={inp} disabled={isSaving} />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <Mail className="h-3.5 w-3.5" /> Email
                  </label>
                  <input type="email" value={profile.email || ''} disabled className={inp} />
                </div>

                <div>
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <ShieldCheck className="h-3.5 w-3.5" /> Role
                  </label>
                  <input type="text" value={String(profile.role || 'Admin')} disabled className={inp} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <MapPin className="h-3.5 w-3.5" /> Location
                  </label>
                  <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Dhaka, Bangladesh" className={inp} disabled={isSaving} />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Biodata
                  </label>
                  <textarea
                    rows={4}
                    value={biodata}
                    onChange={(e) => setBiodata(e.target.value)}
                    placeholder="Write a short admin biodata…"
                    className={`${inp} resize-none`}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Bottom action row */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  <X className="h-4 w-4" /> Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !name.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-50 active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  {isSaving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════════════
     PROFILE VIEW
  ══════════════════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 dark:bg-[#080b14]">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* ── Hero Banner ──────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1120] text-white shadow-2xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle at 72% -8%,rgba(99,102,241,.30) 0%,transparent 52%),' +
                'radial-gradient(circle at 8% 110%,rgba(99,102,241,.14) 0%,transparent 48%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 44px),' +
                'repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 44px)',
            }}
          />

          <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:p-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl ring-2 ring-white/10 bg-indigo-700/30 flex items-center justify-center text-3xl font-bold">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profile.name || 'Admin'} className="h-full w-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-indigo-500 ring-2 ring-[#0c1120] flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-indigo-300">
                  <ShieldCheck className="h-3 w-3" />
                  {String(profile.role || 'admin').toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{profile.name || 'Admin'}</h1>
              <p className="mt-1.5 text-base text-slate-300">{profile.email}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-indigo-400" />{profile.location}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-indigo-300" />{profile.phone}
                  </span>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="sm:self-start flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.15] active:scale-95"
              >
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-300 backdrop-blur-sm transition hover:bg-rose-500/20 active:scale-95"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Grid ────────────────────────────────────────────────── */}
        <div className="grid gap-5 md:grid-cols-2">

          {/* Personal Information */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0e1624]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/40">
                  <UserCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Personal Information</h2>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Pencil className="h-3 w-3" /> Edit
              </button>
            </div>
            <div className="p-5">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <InfoItem icon={UserCircle2} label="Full Name"   value={profile.name || ''} />
                <InfoItem icon={Mail}        label="Email"       value={profile.email || ''} />
                <InfoItem icon={Phone}       label="Phone"       value={profile.phone || ''} />
                <InfoItem icon={MapPin}      label="Location"    value={profile.location || ''} />
                <InfoItem icon={ShieldCheck} label="Role"        value={String(profile.role || 'Admin')} />
                <InfoItem
                  icon={Calendar}
                  label="Member Since"
                  value={
                    profile.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'long', day: 'numeric',
                        })
                      : '—'
                  }
                />
                {bioText && (
                  <>
                    <Divider />
                    <div className="px-3 py-4">
                      <SectionLabel>Biodata</SectionLabel>
                      <p className="mt-1.5 text-sm leading-6 text-slate-600 dark:text-slate-300">{bioText}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Admin Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#0e1624]">
            <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                <LayoutDashboard className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Admin Actions</h2>
            </div>
            <div className="p-5 space-y-3">
              {(
                [
                  {
                    to: '/admin/users',
                    icon: Users,
                    label: 'Manage Users',
                    sub: 'Roles, suspension & approvals',
                    iconColor: 'text-indigo-600 dark:text-indigo-400',
                    iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
                    hoverBorder: 'hover:border-indigo-200 dark:hover:border-indigo-800',
                  },
                  {
                    to: '/admin/jobs',
                    icon: Briefcase,
                    label: 'Moderate Jobs',
                    sub: 'Review platform activity',
                    iconColor: 'text-amber-600 dark:text-amber-400',
                    iconBg: 'bg-amber-50 dark:bg-amber-950/40',
                    hoverBorder: 'hover:border-amber-200 dark:hover:border-amber-800',
                  },
                  {
                    to: '/admin/dashboard',
                    icon: LayoutDashboard,
                    label: 'Dashboard',
                    sub: 'High-level metrics & quick actions',
                    iconColor: 'text-emerald-600 dark:text-emerald-400',
                    iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
                    hoverBorder: 'hover:border-emerald-200 dark:hover:border-emerald-800',
                  },
                ] as const
              ).map(({ to, icon: Icon, label, sub, iconColor, iconBg, hoverBorder }) => (
                <Link
                  key={to}
                  to={to}
                  className={`group flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/30 ${hoverBorder}`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${iconBg}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>
                  </div>
                  <svg className="h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ))}

              {/* Edit Profile action */}
              <button
                onClick={() => setIsEditing(true)}
                className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-700/80 dark:bg-slate-800/30 dark:hover:border-slate-600"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 transition-transform group-hover:scale-110 dark:bg-slate-800">
                  <Pencil className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Edit Profile</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Update admin identity & avatar</p>
                </div>
                <svg className="h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick Stats Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            {
              label: 'Role',
              value: String(profile.role || 'admin').charAt(0).toUpperCase() + String(profile.role || 'admin').slice(1),
              color: 'text-indigo-600 dark:text-indigo-400',
            },
            { label: 'Email',    value: profile.email || '—',         color: 'text-slate-800 dark:text-slate-200' },
            { label: 'Location', value: profile.location || 'Not set', color: 'text-slate-700 dark:text-slate-300' },
            {
              label: 'Member Since',
              value: profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
                : '—',
              color: 'text-slate-700 dark:text-slate-300',
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800/80 dark:bg-[#0e1624]"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
              <p className={`mt-1 text-sm font-bold truncate ${color}`}>{value}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;