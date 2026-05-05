

import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCandidateProfile, useUpdateCandidateProfile } from '../../services/candidateService';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Mail, Phone, Calendar, Briefcase, MapPin, User,
  Pencil, X, CheckCircle2, FileText, Layers,
  TrendingUp, Sparkles, Shield, Trash2, ExternalLink, Eye,
} from 'lucide-react';
import { toast } from 'sonner';

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

/* ─── SkillBadge — enhanced professional skill display ────────────────────── */
const SkillBadge = ({ skill, index }: { skill: string; index: number }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 60);
    return () => clearTimeout(t);
  }, [index]);

  const skillColors = [
    'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-950/30 dark:border-violet-700 dark:text-violet-300',
    'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-700 dark:text-blue-300',
    'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-700 dark:text-emerald-300',
    'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/30 dark:border-amber-700 dark:text-amber-300',
    'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/30 dark:border-rose-700 dark:text-rose-300',
    'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/30 dark:border-indigo-700 dark:text-indigo-300',
  ];
  
  const colorClass = skillColors[index % skillColors.length];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-semibold transition-all duration-300 hover:shadow-md hover:scale-105 ${colorClass} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
      style={{ transitionDelay: `${index * 50}ms` }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {skill}
    </span>
  );
};

/* ─── ResumeViewer — collapsible inline PDF preview ──────────────────────── */
const ResumeViewer = ({ url, onRemove, showConfirm, setShowConfirm }: { url: string; onRemove: () => void; showConfirm: boolean; setShowConfirm: (v: boolean) => void }) => {
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
            onClick={() => setShowConfirm(true)}
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

/* ─── ConfirmDeleteModal ─────────────────────────────────────────────────── */
const ConfirmDeleteModal = ({ isOpen, onConfirm, onCancel }: { isOpen: boolean; onConfirm: () => void; onCancel: () => void }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl dark:bg-[#0e1624] border border-slate-200 dark:border-slate-800">
        <div className="px-6 py-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Delete Resume?</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Are you sure you want to remove your resume? This action cannot be undone.</p>
        </div>
        <div className="border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 px-6 py-4">
          <button onClick={onCancel} className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">Cancel</button>
          <button onClick={onConfirm} className="flex-1 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 active:scale-[0.98] dark:bg-rose-600 dark:hover:bg-rose-700">Delete</button>
        </div>
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

/* Helper: Parse nested JSON skills safely */
const parseSkills = (skills: unknown): string[] => {
  if (!skills) return [];
  
  if (Array.isArray(skills)) {
    let result: string[] = [];
    for (const item of skills) {
      if (typeof item === 'string') {
        try {
          const parsed = JSON.parse(item);
          if (Array.isArray(parsed)) {
            result = result.concat(parseSkills(parsed));
          } else if (typeof parsed === 'string') {
            result.push(parsed);
          }
        } catch {
          result.push(item);
        }
      } else if (typeof item === 'number') {
        result.push(String(item));
      }
    }
    return result.filter((s, i, arr) => s && arr.indexOf(s) === i);
  }
  
  if (typeof skills === 'string') {
    try {
      const parsed = JSON.parse(skills);
      return parseSkills(parsed);
    } catch {
      return [skills];
    }
  }
  
  return [];
};

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

  /* Parse and normalize skills */
  const cleanedSkills = useMemo(() => parseSkills(profile.skills), [profile.skills]);

  /* live resume state — can be removed from the profile page */
  const [liveResume, setLiveResume] = useState(profile.resume || user?.resume || '');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      Boolean(liveResume), Boolean(profile.experienceLevel?.trim()), Boolean(cleanedSkills.length),
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }, [displayBiodata, displayEmail, displayLocation, profile, profileAvatar, liveResume, cleanedSkills.length]);

  const openEdit = () => {
    setForm({
      name: profile.name || '', phone: profile.phone || '', headline: profile.headline || '',
      location: profile.location || profile.address || '', experienceLevel: profile.experienceLevel || '',
      biodata: profile.biodata || profile.bio || profile.summary || '',
      summary: profile.biodata || profile.bio || profile.summary || '',
      skills: [...cleanedSkills],
    });
    setAvatarPreview(profileAvatar); setAvatarFile(null);
    setIsEditing(true);
  };

  const addSkill    = () => { const s = skillInput.trim(); if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] })); setSkillInput(''); };
  const removeSkill = (sk: string) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== sk) }));
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return; setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f));
  };

  /* Remove resume */
  const handleRemoveResume = () => {
    setShowDeleteConfirm(false);
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1120] via-[#1a1f35] to-[#0c1120] text-white shadow-2xl">
          <div aria-hidden className="pointer-events-none absolute inset-0"
            style={{ backgroundImage: `radial-gradient(circle at 70% -10%,rgba(109,40,217,.32) 0%,transparent 55%),radial-gradient(circle at 10% 110%,rgba(37,99,235,.24) 0%,transparent 50%)` }} />
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.02]"
            style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#fff 0px,#fff 1px,transparent 1px,transparent 40px)' }} />

          <div className="relative flex flex-col gap-6 p-7 sm:flex-row sm:items-start sm:p-10">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl ring-4 ring-violet-400/20 overflow-hidden bg-gradient-to-br from-violet-600/30 to-blue-600/30 flex items-center justify-center text-4xl font-bold shadow-xl">
                {profileAvatar ? <img src={profileAvatar} alt={profile.name || 'Candidate'} className="h-full w-full object-cover" /> : <span className="text-white">{initials}</span>}
              </div>
              <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 ring-4 ring-[#0c1120] flex items-center justify-center shadow-lg">
                <div className="h-3 w-3 rounded-full bg-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-violet-200 backdrop-blur-sm">
                  <Shield className="h-3.5 w-3.5" />
                  {profile.user?.role ? profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1) : 'Candidate'}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.08] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
                  <TrendingUp className="h-3.5 w-3.5" /> {profileCompletion}% Complete
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white drop-shadow-lg">{profile.name || profile.user?.name}</h1>
              <p className="mt-2.5 text-lg text-slate-200 font-medium drop-shadow-md">{displayHeadline}</p>
              <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-300">
                {displayLocation && <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-violet-300 flex-shrink-0" /><span>{displayLocation}</span></span>}
                <span className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-300 flex-shrink-0" /><span>{displayExperience}</span></span>
              </div>
            </div>

            {/* Edit btn */}
            <div className="sm:self-start">
              <button onClick={openEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:bg-white/20 hover:border-white/30 active:scale-95 shadow-lg">
                <Pencil className="h-4 w-4" /> Edit Profile
              </button>
            </div>
          </div>

          {/* Progress strip */}
          <div className="h-1 w-full bg-white/10">
            <div className={`h-full transition-all duration-700 ${completionBar}`} style={{ width: `${profileCompletion}%` }} />
          </div>
        </div>

        {/* ── Body Grid ─────────────────────────────────────────────────── */}
        <div className="grid gap-5 lg:grid-cols-3">

          {/* Left column */}
          <div className="space-y-5 lg:col-span-1">
            {/* Profile Card with Avatar & Email */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:from-[#0e1624] dark:to-[#0a0f1a]">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 h-20 w-20 overflow-hidden rounded-2xl ring-4 ring-violet-100 dark:ring-violet-900/30 bg-gradient-to-br from-violet-600/20 to-blue-600/20 flex items-center justify-center shadow-lg">
                  {profileAvatar 
                    ? <img src={profileAvatar} alt={profile.name} className="h-full w-full object-cover" /> 
                    : <span className="text-3xl font-bold text-violet-600 dark:text-violet-400">{initials}</span>
                  }
                </div>
                <h4 className="mb-1 text-sm font-bold text-slate-900 dark:text-slate-100">{profile.name || 'Candidate'}</h4>
                <div className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-violet-50 px-3 py-1.5 dark:bg-violet-950/30">
                  <Mail className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  <p className="text-xs font-semibold text-violet-700 dark:text-violet-300 break-all">{displayEmail || 'No email'}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{displayHeadline}</p>
              </div>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-[#0e1624]">
              <h3 className="mb-4 px-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" /> Contact Information
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 space-y-0">
                <InfoRow icon={Mail}     label="Email"        value={displayEmail || '—'} />
                <InfoRow icon={Phone}    label="Phone"        value={profile.phone || '—'} />
                <InfoRow icon={Calendar} label="Member since" value={profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Recently joined'} />
              </div>
            </div>

            {/* Snapshot */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-[#0e1624]">
              <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Profile Snapshot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Skills"       value={cleanedSkills.length} accent={cleanedSkills.length ? 'text-violet-600 dark:text-violet-400' : ''} />
                <StatCard label="Applications" value={profile.applications?.length || 0} accent={profile.applications?.length ? 'text-blue-600 dark:text-blue-400' : ''} />
                <StatCard label="Resume"       value={liveResume ? '✓' : '—'} accent={liveResume ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
                <StatCard label="Completion"   value={`${profileCompletion}%`} accent={completionColor} />
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <span>Profile Strength</span><span className={completionColor}>{profileCompletion}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800/80">
                  <div className={`h-full rounded-full transition-all duration-700 ${completionBar}`} style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-5 lg:col-span-2">

            {/* About */}
            {displayBiodata && (
              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-[#0e1624]">
                <h3 className="mb-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <TrendingUp className="h-4 w-4 text-violet-500 dark:text-violet-400" /> Professional Summary
                </h3>
                <div className="rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50/50 to-slate-50/30 p-4 dark:border-slate-700/50 dark:from-slate-800/30 dark:to-slate-900/20">
                  <p className="text-sm leading-7 text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-[500]">{displayBiodata}</p>
                </div>
              </div>
            )}

            {/* ── Skills — professional card with enhanced display ─────────────────── */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800/80 dark:bg-[#0e1624]">
              <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  <Layers className="h-4 w-4" /> Skills & Expertise
                </h3>
                {cleanedSkills.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
                    {cleanedSkills.length} Skills
                  </span>
                )}
              </div>

              {cleanedSkills.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {cleanedSkills.map((skill, i) => (
                      <SkillBadge key={skill} skill={skill} index={i} />
                    ))}
                  </div>
                  <div className="mt-4 rounded-lg border border-slate-100 bg-gradient-to-r from-slate-50 to-slate-50/50 p-3 dark:border-slate-800 dark:from-slate-900/30 dark:to-slate-900/10">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-4 w-4 flex-shrink-0 text-violet-500 dark:text-violet-400 mt-0.5" />
                      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                        Highlight these skills in your resume and cover letters to increase your chances of getting hired by recruiters.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center dark:border-slate-700 dark:bg-slate-800/20">
                  <Layers className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    No skills added yet
                  </p>
                  <button onClick={openEdit} className="mt-2 text-xs font-semibold text-violet-600 hover:text-violet-700 hover:underline dark:text-violet-400 dark:hover:text-violet-300">
                    Add skills to your profile
                  </button>
                </div>
              )}
            </div>

            {/* ── Resume — viewer only ─────────────────────────────────── */}
            {liveResume ? (
              <>
                <ResumeViewer url={liveResume} onRemove={handleRemoveResume} showConfirm={showDeleteConfirm} setShowConfirm={setShowDeleteConfirm} />
                <ConfirmDeleteModal isOpen={showDeleteConfirm} onConfirm={handleRemoveResume} onCancel={() => setShowDeleteConfirm(false)} />
              </>
            ) : null}
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
