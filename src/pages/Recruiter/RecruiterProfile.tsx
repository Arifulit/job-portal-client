


import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building2, Briefcase, Mail, Phone, MapPin, Edit3, Users, CheckCircle2 } from 'lucide-react';
import recruiterService from '@/services/recruiterService';

/* ─── Types ───────────────────────────────────────────────────────────────── */
/* ─── Small helpers ───────────────────────────────────────────────────────── */
interface Company {
  _id?: string;
  name?: string;
  website?: string;
  description?: string;
  size?: string;
  industry?: string;
  jobsPosted?: number;
  applicantsCount?: number;
  hires?: number;
}

interface RecruiterProfileData {
  _id?: string;
  avatar?: string;
  profileImage?: string;
  user?: { name?: string; email?: string };
  biodata?: string;
  bio?: string;
  designation?: string;
  phone?: string;
  location?: string;
  company?: Company;
  jobsPosted?: number;
  applicantsCount?: number;
  hires?: number;
  stats?: { jobsPosted?: number; applicantsCount?: number; hires?: number };
}

const RecruiterProfile = () => {
  // no updateUser required here; recruiter profile is read-only in this view
  const [profile, setProfile] = useState<RecruiterProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await recruiterService.getRecruiterProfile();
        if (response?.success) {
          const next = response.data as RecruiterProfileData;
          setProfile(next);
        } else {
          setError('Failed to fetch profile');
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return (
    <div className="container mx-auto min-h-[calc(100vh-5rem)] p-6">
      <Skeleton className="mb-6 h-10 w-64" />
      <div className="grid gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );

  if (error) return (
    <div className="container mx-auto min-h-[calc(100vh-5rem)] p-6">
      <div className="rounded-md bg-red-50 p-4 text-red-700">{error}</div>
    </div>
  );

  if (!profile) return (
    <div className="container mx-auto min-h-[calc(100vh-5rem)] p-6">No profile data</div>
  );

  const avatar = profile.avatar || profile.profileImage || profile.user?.name?.charAt(0).toUpperCase() || 'R';

  return (
    <div className="container mx-auto min-h-[calc(100vh-5rem)] p-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-2xl ring-2 ring-slate-100 bg-indigo-700/5 flex items-center justify-center text-3xl font-bold text-slate-800 dark:text-slate-100">
              {avatar}
            </div>
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-semibold">{profile.user?.name || 'Recruiter'}</h2>
              <div className="mt-1 flex flex-wrap gap-3 items-center text-sm text-slate-500">
                {profile.designation && <span className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4" />{profile.designation}</span>}
                {profile.location && <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4" />{profile.location}</span>}
              </div>
              {profile.biodata && <p className="mt-3 text-sm text-slate-600 max-w-2xl">{profile.biodata}</p>}
            </div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <a href="#" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50">
              <Mail className="h-4 w-4" /> Message
            </a>
            <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left: contact & stats */}
        <div className="space-y-6 md:col-span-1">
          <Card className="px-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">Contact</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {profile.phone && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <div>{profile.phone}</div>
                  </div>
                )}
                {profile.user?.email && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Mail className="h-4 w-4 text-indigo-600" />
                    <div>{profile.user.email}</div>
                  </div>
                )}
                {profile.company?.website && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Building2 className="h-4 w-4 text-slate-600" />
                    <a href={profile.company.website.startsWith('http') ? profile.company.website : `https://${profile.company.website}`} target="_blank" rel="noreferrer" className="text-indigo-600">{profile.company.website.replace(/^https?:\/\//, '')}</a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-600">
                <div className="flex items-center justify-between"><span className="font-medium">Company</span><span>{profile.company?.name || '—'}</span></div>
                <div className="flex items-center justify-between mt-2"><span className="font-medium">Industry</span><span>{profile.company?.industry || '—'}</span></div>
                <div className="flex items-center justify-between mt-2"><span className="font-medium">Size</span><span>{profile.company?.size || '—'}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: main details */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Company Details</CardTitle>
            </CardHeader>
            <CardContent>
              {profile.company ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-emerald-50">
                      <Building2 className="h-6 w-6 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{profile.company.name}</h3>
                      {profile.company.industry && <div className="text-sm text-slate-500">{profile.company.industry}</div>}
                    </div>
                  </div>
                  {profile.company.description && <p className="text-sm text-slate-600">{profile.company.description}</p>}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No company information available.</div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg border p-4 bg-white/60 dark:bg-[#07101a]">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Jobs Posted</div>
                <Building2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.company?.jobsPosted ?? profile.jobsPosted ?? profile.stats?.jobsPosted ?? '—'}</div>
                <div className="text-xs text-slate-500">{profile.company?.name || ''}</div>
              </div>
            </div>

            <div className="rounded-lg border p-4 bg-white/60 dark:bg-[#07101a]">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Applicants</div>
                <Users className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.company?.applicantsCount ?? profile.applicantsCount ?? profile.stats?.applicantsCount ?? '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Total applicants across active listings</div>
            </div>

            <div className="rounded-lg border p-4 bg-white/60 dark:bg-[#07101a]">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-500">Hires</div>
                <CheckCircle2 className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-3 text-2xl font-bold text-slate-900 dark:text-slate-100">{profile.company?.hires ?? profile.hires ?? profile.stats?.hires ?? '—'}</div>
              <div className="mt-1 text-xs text-slate-500">Confirmed hires</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterProfile;