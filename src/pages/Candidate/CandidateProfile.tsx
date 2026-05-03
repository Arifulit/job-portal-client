

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCandidateProfile, useUpdateCandidateProfile } from '../../services/candidateService';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Mail, Phone, Calendar, Briefcase, MapPin, User,
  Pencil, X, CheckCircle2, UploadCloud, FileText, Layers,
  TrendingUp, Sparkles, Shield, Trash2, ExternalLink, Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadResumeToBackend, uploadToCloudinary } from '../../utils/api';

const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESUME_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ALLOWED_RESUME_EXTENSIONS = ['pdf', 'doc', 'docx'];

/* ─── InfoRow ─────────────────────────────────────────────────────────────── */
const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-white dark:group-hover:bg-slate-700">
      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  </div>
);

/* ─── StatCard ────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, accent }: { label: string; value: string | number; accent?: string }) => (
  <div className="rounded-xl border border-slate-100 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
    <p className={`mt-0.5 text-xl font-bold ${accent || 'text-slate-900 dark:text-slate-100'}`}>{value}</p>
  </div>
);

/* ─── SkillBadge — staggered fade+slide in ────────────────────────────────── */
const SkillBadge = ({ skill, index }: { skill: string; index: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);
  return (
    <span
      className={`inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-all duration-300 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-violet-700 dark:hover:bg-violet-950/40 dark:hover:text-violet-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      {skill}
    </span>
  );
};

/* ─── ResumeViewer — collapsible inline PDF preview ──────────────────────── */
const ResumeViewer = ({ url, onRemove }: { url: string; onRemove: () => void }) => {
  const [expanded, setExpanded] = useState(false);
  const isPdf = url.toLowerCase().includes('.pdf') || url.includes('application/pdf') || url.includes('cloudinary');

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800/80 dark:bg-[#0e1624]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
            <FileText className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Resume</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Uploaded
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={url} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ExternalLink className="h-3 w-3" /> Open
          </a>
          <button
            onClick={() => setExpanded(v => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-950/60"
          >
            <Eye className="h-3 w-3" /> {expanded ? 'Hide' : 'Preview'}
          </button>
          <button
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-950/40"
          >
            <Trash2 className="h-3 w-3" /> Remove
          </button>
        </div>
      </div>

      {/* Collapsible preview pane */}
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: expanded ? '640px' : '0px' }}
      >
        <div className="border-t border-slate-100 dark:border-slate-800">
          {isPdf ? (
            <iframe
              src={`${url}#toolbar=0&navpanes=0`}
              title="Resume Preview"
              className="h-[600px] w-full"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Preview not available for this format.</p>
              <a
                href={url} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
              >
                <ExternalLink className="h-4 w-4" /> Download & View
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── InlineResumeUpload ──────────────────────────────────────────────────── */
const InlineResumeUpload = ({ onUploaded }: { onUploaded: (url: string) => void }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [dragging, setDragging]   = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);

  const process = async (file: File) => {
    if (file.size > MAX_RESUME_SIZE_BYTES) { toast.error('Max file size is 5 MB.'); return; }
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!ALLOWED_RESUME_MIME_TYPES.includes(file.type) && !ALLOWED_RESUME_EXTENSIONS.includes(ext)) {
      toast.error('PDF, DOC or DOCX only.'); return;
    }
    setUploading(true); setProgress(0);
    try {
      let url = '';
      try { url = await uploadResumeToBackend(file, p => setProgress(p)); }
      catch { url = await uploadToCloudinary(file, p => setProgress(p)); }
      setProgress(100);
      toast.success('Resume uploaded!');
      onUploaded(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed.');
    } finally { setUploading(false); }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800/80 dark:bg-[#0e1624]">
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/40">
          <UploadCloud className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Resume</p>
          <p className="text-xs text-amber-600 dark:text-amber-400">Not uploaded yet</p>
        </div>
      </div>

      <div className="p-5">
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={e => { e.preventDefault(); setDragging(false); }}
          onDrop={async e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) await process(f); }}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-5 py-8 text-center transition ${
            dragging
              ? 'border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-950/20'
              : 'border-slate-200 hover:border-violet-300 dark:border-slate-700 dark:hover:border-violet-600'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <UploadCloud className="mx-auto mb-2 h-7 w-7 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {uploading ? 'Uploading…' : 'Drag & drop or click to upload'}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">PDF, DOC, DOCX — max 5 MB</p>
        </div>

        <input
          ref={inputRef} type="file" accept=".pdf,.doc,.docx"
          onChange={async e => { const f = e.target.files?.[0]; if (f) await process(f); }}
          className="hidden"
        />

        {uploading && (
          <div className="mt-3">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-right text-xs text-slate-400">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── inputCls ────────────────────────────────────────────────────────────── */
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:bg-white focus:ring-2 focus:ring-violet-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-violet-500 dark:focus:bg-slate-900 dark:focus:ring-violet-900/40';

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  MAIN COMPONENT                                                             */
/* ═══════════════════════════════════════════════════════════════════════════ */
const CandidateProfile = () => {
  const { user, updateUser } = useAuth();
  const { data, isLoading }  = useCandidateProfile();
  const profileData          = data?.data;

  const profile = useMemo(
    () =>
      profileData || {
        _id: user?._id || '',
        user: { _id: user?._id || '', name: user?.name || 'Candidate', email: user?.email || '', role: user?.role || 'candidate', createdAt: '', updatedAt: '' },
        name: user?.name || 'Candidate', phone: user?.phone || '',
        skills: user?.skills || [], location: user?.location || '', address: user?.location || '',
        biodata: user?.biodata || '', headline: '', experienceLevel: '',
        summary: user?.biodata || '', avatar: user?.avatar || user?.profileImage || '',
        createdAt: '', updatedAt: '', __v: 0,
      },
    [profileData, user]
  );

  const profileAvatar = profile.avatar || profile.profileImage || profile.user?.avatar || profile.user?.profileImage || user?.avatar || user?.profileImage || '';

  /* live resume state — can be changed by InlineResumeUpload without opening edit modal */
  const [liveResume, setLiveResume] = useState(profile.resume || user?.resume || '');
  useEffect(() => { setLiveResume(profile.resume || user?.resume || ''); }, [profile.resume, user?.resume]);

  const displayEmail      = profile.user?.email || profile.email || user?.email || '';
  const displayLocation   = profile.location || profile.address || user?.location || '';
  const displayBiodata    = profile.biodata || profile.bio || profile.summary || user?.biodata || '';
  const displayHeadline   = profile.headline || 'Candidate Profile';
  const displayExperience = profile.experienceLevel || 'Not specified';

  /* ── edit modal state ───────────────────────────────────────────────── */
  const [isEditing, setIsEditing]         = useState(false);
  const [form, setForm]                   = useState({ name: '', phone: '', headline: '', location: '', experienceLevel: '', biodata: '', summary: '', skills: [] as string[] });
  const [skillInput, setSkillInput]       = useState('');
  const [avatarFile, setAvatarFile]       = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const updateProfileMutation = useUpdateCandidateProfile();
  const updateProfile = updateProfileMutation.mutate;
  const isUpdating = updateProfileMutation.status === 'pending';

  const profileCompletion = useMemo(() => {
    const checks = [
      Boolean(profile.name?.trim()), Boolean(displayEmail.trim()), Boolean(profile.phone?.trim()),
      Boolean(displayLocation.trim()), Boolean(displayBiodata.trim()), Boolean(profileAvatar),
      Boolean(liveResume), Boolean(profile.experienceLevel?.trim()), Boolean((profile.skills || []).length),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [displayBiodata, displayEmail, displayLocation, profile, profileAvatar, liveResume]);

  const openEdit = () => {
    setForm({
      name: profile.name || '', phone: profile.phone || '', headline: profile.headline || '',
      location: profile.location || profile.address || '', experienceLevel: profile.experienceLevel || '',
      biodata: profile.biodata || profile.bio || profile.summary || '',
      summary: profile.biodata || profile.bio || profile.summary || '',
      skills: [...(profile.skills || [])],
    });
    setAvatarPreview(profileAvatar); setAvatarFile(null);
    setIsEditing(true);
  };

  const addSkill    = () => { const s = skillInput.trim(); if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] })); setSkillInput(''); };
  const removeSkill = (sk: string) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== sk) }));
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
  };

  /* Resume uploaded directly from profile page */
  const handleResumeUploaded = (url: string) => {
    setLiveResume(url);
    const payload = new FormData(); payload.append('resume', url);
    updateProfile(payload, {
      onSuccess: () => { updateUser({ resume: url }); toast.success('Resume saved!'); },
      onError:   err => toast.error(err.message),
    });
  };

  /* Remove resume */
  const handleRemoveResume = () => {
    setLiveResume('');
    const payload = new FormData(); payload.append('resume', '');
    updateProfile(payload, {
      onSuccess: () => { updateUser({ resume: undefined }); toast.success('Resume removed.'); },
      onError:   err => toast.error(err.message),
    });
  };

  /* Edit form submit — resume not touched here */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = new FormData();
    payload.append('name', form.name.trim()); payload.append('phone', form.phone.trim());
    payload.append('headline', form.headline.trim()); payload.append('location', form.location.trim());
    payload.append('address', form.location.trim()); payload.append('experienceLevel', form.experienceLevel.trim());
    payload.append('biodata', form.biodata.trim()); payload.append('bio', form.biodata.trim());
    payload.append('summary', form.biodata.trim()); payload.append('skills', JSON.stringify(form.skills));
    if (liveResume) payload.append('resume', liveResume);
    if (avatarFile) payload.append('avatar', avatarFile);

    updateProfile(payload, {
      onSuccess: (response) => {
        const u = response?.data;
        const nextAvatar = u?.avatar || u?.profileImage || u?.user?.avatar || u?.user?.profileImage || '';
        updateUser({ name: u?.name || form.name, phone: u?.phone || form.phone, location: u?.location || form.location,
          biodata: u?.biodata || form.biodata, skills: u?.skills || form.skills,
          resume: u?.resume || liveResume || undefined,
          avatar: nextAvatar || undefined, profileImage: nextAvatar || undefined });
        setAvatarFile(null); setAvatarPreview('');
        setIsEditing(false); toast.success('Profile updated!');
      },
      onError: err => toast.error(err.message),
    });
  };

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 dark:bg-[#080b14]">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-56 w-full rounded-3xl bg-slate-200 dark:bg-slate-800" />
        <div className="grid lg:grid-cols-3 gap-4">
          <Skeleton className="h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="lg:col-span-2 h-72 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>
    </div>
  );

  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#080b14]">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 dark:bg-rose-950/30">
          <User className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile not found</h2>
        <p className="mt-1 text-sm text-slate-500">Please try again later.</p>
      </div>
    </div>
  );

  const initials        = (profile.name || profile.user?.name || 'C').charAt(0).toUpperCase();
  const completionColor = profileCompletion >= 80 ? 'text-emerald-600 dark:text-emerald-400' : profileCompletion >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-500';
  const completionBar   = profileCompletion >= 80 ? 'bg-emerald-500' : profileCompletion >= 50 ? 'bg-amber-400' : 'bg-rose-500';

  /* ══════════════════ RENDER ══════════════════ */
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 dark:bg-[#080b14]">
      <div className="mx-auto max-w-5xl space-y-5">

        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1120] text-white shadow-2xl">
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: `radial-gradient(circle at 70% -10%,rgba(109,40,217,.28) 0%,transparent 55%),radial-gradient(circle at 10% 110%,rgba(37,99,235,.18) 0%,transparent 50%)` }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)' }} />

          <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:p-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-2xl ring-2 ring-white/10 overflow-hidden bg-violet-700/30 flex items-center justify-center text-3xl font-bold">
                {profileAvatar ? <img src={profileAvatar} alt={profile.name || 'Candidate'} className="h-full w-full object-cover" /> : <span>{initials}</span>}
              </div>
              <div className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-500 ring-2 ring-[#0c1120] flex items-center justify-center">
                <div className="h-2.5 w-2.5 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-300">
                  <Shield className="h-3 w-3" />
                  {profile.user?.role ? profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1) : 'Candidate'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
                  <Sparkles className="h-3 w-3" /> {profileCompletion}% Complete
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{profile.name || profile.user?.name}</h1>
              <p className="mt-1.5 text-base text-slate-300">{displayHeadline}</p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                {displayLocation && <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-violet-400" />{displayLocation}</span>}
                <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-blue-400" />{displayExperience}</span>
                {displayEmail && <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-500" />{displayEmail}</span>}
              </div>
            </div>

            {/* Edit btn */}
            <div className="sm:self-start">
              <button onClick={openEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.08] px-4 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.14] active:scale-95">
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Progress strip */}
          <div className="h-0.5 w-full bg-white/10">
            <div className={`h-full transition-all duration-700 ${completionBar}`} style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>

        {/* ── Body Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-5 lg:col-span-1">
            {/* Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/80 dark:bg-[#0e1624]">
              <h3 className="mb-1 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Contact</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
                <InfoRow icon={Mail}     label="Email"        value={displayEmail || '—'} />
                <InfoRow icon={Phone}    label="Phone"        value={profile.phone || '—'} />
                <InfoRow icon={Calendar} label="Member since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Recently joined'} />
              </div>
            </div>

            {/* Snapshot */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800/80 dark:bg-[#0e1624]">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Snapshot</h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Skills"       value={profile.skills?.length || 0} />
                <StatCard label="Applications" value={profile.applications?.length || 0} />
                <StatCard label="Resume"       value={liveResume ? 'Uploaded' : 'Missing'} accent={liveResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'} />
                <StatCard label="Completion"   value={`${profileCompletion}%`} accent={completionColor} />
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-medium text-slate-400">
                  <span>Profile strength</span><span>{profileCompletion}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div className={`h-full rounded-full transition-all duration-700 ${completionBar}`} style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-2">

            {/* About */}
            {displayBiodata && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0e1624]">
                <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <TrendingUp className="h-4 w-4" /> About
                </h3>
                <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{displayBiodata}</p>
              </div>
            )}

            {/* ── Skills — staggered one-by-one reveal ─────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800/80 dark:bg-[#0e1624]">
              <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                <Layers className="h-4 w-4" /> Skills
              </h3>
              {profile.skills && profile.skills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill, i) => (
                    <SkillBadge key={skill} skill={skill} index={i} />
                  ))}
                </div>
              ) : (
                <p className="text-sm italic text-slate-400 dark:text-slate-500">
                  No skills added yet —{' '}
                  <button onClick={openEdit} className="font-semibold text-violet-600 hover:underline dark:text-violet-400">edit profile</button>
                  {' '}to add some.
                </p>
              )}
            </div>

            {/* ── Resume — inline viewer OR upload widget ───────────────── */}
            {liveResume
              ? <ResumeViewer url={liveResume} onRemove={handleRemoveResume} />
              : <InlineResumeUpload onUploaded={handleResumeUploaded} />
            }
          </div>
        </div>
      </div>

      {/* ── Edit Modal (no resume section) ──────────────────────────────────── */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-sm">
          <div className="w-full sm:max-w-xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700/80 dark:bg-[#0e1624]">
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5 dark:border-slate-800 dark:bg-[#0e1624]">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Edit Profile</h2>
                <p className="text-xs text-slate-400">Update your public candidate details</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="rounded-full p-2 transition hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {/* Avatar */}
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                    {avatarPreview || profileAvatar
                      ? <img src={avatarPreview || profileAvatar} alt="Preview" className="h-full w-full object-cover" />
                      : <div className="flex h-full w-full items-center justify-center text-base font-bold text-slate-500">{initials}</div>
                    }
                  </div>
                  <input type="file" accept="image/*" onChange={handleAvatarChange}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:file:bg-slate-200 dark:file:text-slate-900" />
                </div>
              </div>

              {/* Text fields */}
              {([
                ['Name',     'name',     'text', 'Your full name'],
                ['Phone',    'phone',    'tel',  '+880…'],
                ['Headline', 'headline', 'text', 'e.g. Full Stack Developer'],
                ['Location', 'location', 'text', 'e.g. Dhaka, Bangladesh'],
              ] as [string, keyof typeof form, string, string][]).map(([label, key, type, ph]) => (
                <div key={key}>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>
                  <input type={type} value={form[key] as string} placeholder={ph}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} className={inputCls} />
                </div>
              ))}

              {/* Experience */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Experience Level</label>
                <select value={form.experienceLevel} onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))} className={inputCls}>
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Biodata */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Biodata</label>
                <textarea rows={4} value={form.biodata}
                  onChange={e => setForm(f => ({ ...f, biodata: e.target.value, summary: e.target.value }))}
                  placeholder="Write a short bio about yourself…" className={`${inputCls} resize-none`} />
              </div>

              {/* Skills */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Skills</label>
                <div className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter" className={inputCls} />
                  <button type="button" onClick={addSkill}
                    className="flex-shrink-0 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 active:scale-95 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white">
                    Add
                  </button>
                </div>
                {form.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {form.skills.map(sk => (
                      <span key={sk} className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {sk}
                        <button type="button" onClick={() => removeSkill(sk)} className="ml-0.5 text-slate-400 hover:text-rose-500">
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(''); setIsEditing(false); }}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                  Cancel
                </button>
                <button type="submit" disabled={isUpdating}
                  className="flex-1 rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-violet-500 dark:hover:bg-violet-600">
                  {isUpdating ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateProfile;
