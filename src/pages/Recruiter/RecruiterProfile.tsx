
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Skeleton } from '../../components/ui/skeleton';
import recruiterService from '../../services/recruiterService';
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Save,
  X,
  Camera,
  AlertCircle,
  Globe,
  Users,
  Briefcase,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

const inp =
  'w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500';

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
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  biodata?: string;
  bio?: string;
  avatar?: string;
  profileImage?: string;
  designation?: string;
  company?: Company;
  jobsPosted?: number;
  applicantsCount?: number;
  hires?: number;
}

const RecruiterProfilePage = () => {
  const [profile, setProfile] = useState<RecruiterProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    biodata: '',
    company: {
      name: '',
      website: '',
      description: '',
      size: '',
      industry: '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');

  const initials = useMemo(
    () => (profile?.name || 'R').trim().charAt(0).toUpperCase(),
    [profile?.name]
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await recruiterService.getRecruiterProfile();
      if (response?.success && response.data) {
        setProfile(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          biodata: response.data.biodata || response.data.bio || '',
          company: {
            name: response.data.company?.name || '',
            website: response.data.company?.website || '',
            description: response.data.company?.description || '',
            size: response.data.company?.size || '',
            industry: response.data.company?.industry || '',
          },
        });
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCompanyChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      company: { ...prev.company, [field]: value },
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('phone', formData.phone);
      payload.append('location', formData.location);
      payload.append('biodata', formData.biodata);
      payload.append('company[name]', formData.company.name);
      payload.append('company[website]', formData.company.website);
      payload.append('company[description]', formData.company.description);
      payload.append('company[size]', formData.company.size);
      payload.append('company[industry]', formData.company.industry);

      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }

      const response = await recruiterService.updateRecruiterProfile(payload);
      if (response?.success) {
        toast.success('Profile updated successfully');
        setAvatarFile(null);
        setAvatarPreview('');
        setIsEditing(false);
        fetchProfile();
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: profile?.name || '',
      phone: profile?.phone || '',
      location: profile?.location || '',
      biodata: profile?.biodata || profile?.bio || '',
      company: {
        name: profile?.company?.name || '',
        website: profile?.company?.website || '',
        description: profile?.company?.description || '',
        size: profile?.company?.size || '',
        industry: profile?.company?.industry || '',
      },
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="mx-auto max-w-4xl space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 flex items-center justify-center">
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5" />
            <p>Failed to load profile</p>
          </div>
        </div>
      </div>
    );
  }

  const profileAvatar = avatarPreview || profile.avatar || profile.profileImage || '';

  /* ─── EDIT MODE ─────────────────────────────────────────────────────── */
  if (isEditing) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-slate-900">Edit Profile</h1>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name.trim()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-lg p-8">
            {/* Avatar Section */}
            <div className="mb-8">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                Profile Picture
              </p>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="h-24 w-24 overflow-hidden rounded-2xl border-4 border-emerald-100 bg-emerald-50 flex items-center justify-center text-3xl font-bold text-emerald-700">
                    {profileAvatar ? (
                      <img src={profileAvatar} alt="preview" className="h-full w-full object-cover" />
                    ) : (
                      initials
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-emerald-600 ring-4 ring-white hover:bg-emerald-700 transition">
                    <Camera className="h-4 w-4 text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                    <Camera className="h-4 w-4" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="mb-8 border-t border-slate-100 pt-8">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-600">
                Personal Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your name"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Email
                  </label>
                  <input
                    type="email"
                    value={profile.email || ''}
                    disabled
                    className={`${inp} cursor-not-allowed opacity-60`}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+880 1XXX XXXXXX"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="City, Country"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Bio
                  </label>
                  <textarea
                    value={formData.biodata}
                    onChange={(e) => handleInputChange('biodata', e.target.value)}
                    placeholder="Write a short bio about yourself..."
                    rows={4}
                    className={`${inp} resize-none`}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="border-t border-slate-100 pt-8">
              <h3 className="mb-6 text-sm font-bold uppercase tracking-wider text-slate-600">
                Company Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={formData.company.name}
                    onChange={(e) => handleCompanyChange('name', e.target.value)}
                    placeholder="Your company"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.company.website}
                    onChange={(e) => handleCompanyChange('website', e.target.value)}
                    placeholder="https://example.com"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Size
                  </label>
                  <select
                    value={formData.company.size}
                    onChange={(e) => handleCompanyChange('size', e.target.value)}
                    className={inp}
                    disabled={isSaving}
                  >
                    <option value="">Select size</option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501-1000">501-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.company.industry}
                    onChange={(e) => handleCompanyChange('industry', e.target.value)}
                    placeholder="e.g. Technology, Finance"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Description
                  </label>
                  <textarea
                    value={formData.company.description}
                    onChange={(e) => handleCompanyChange('description', e.target.value)}
                    placeholder="Describe your company..."
                    rows={4}
                    className={`${inp} resize-none`}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ─── VIEW MODE ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Hero Header */}
        <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 p-8 text-white shadow-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-white bg-emerald-100 flex items-center justify-center text-4xl font-bold">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="mt-2 text-emerald-100">{profile.email}</p>
                <div className="mt-4 flex gap-4 text-sm">
                  {profile.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {profile.phone}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-slate-50"
            >
              <Edit2 className="h-4 w-4" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Stats */}
          <div className="space-y-4 lg:col-span-1">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Stats</p>
              <div className="mt-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Jobs Posted</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      {profile.jobsPosted || 0}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Applications</span>
                    <span className="text-2xl font-bold text-blue-600">
                      {profile.applicantsCount || 0}
                    </span>
                  </div>
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600">Hires</span>
                    <span className="text-2xl font-bold text-green-600">{profile.hires || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Links</p>
              <div className="mt-4 space-y-2">
                <Link
                  to="/recruiter/jobs"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Briefcase className="h-4 w-4" />
                  My Jobs
                </Link>
                <Link
                  to="/recruiter/applications"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  <Users className="h-4 w-4" />
                  Applications
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600">
                Personal Information
              </h2>
              <div className="space-y-4">
                {profile.biodata && (
                  <div className="rounded-lg bg-slate-50 p-4">
                    <p className="text-sm text-slate-600">{profile.biodata}</p>
                  </div>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  {profile.phone && (
                    <InfoItem
                      icon={Phone}
                      label="Phone"
                      value={profile.phone}
                    />
                  )}
                  {profile.location && (
                    <InfoItem
                      icon={MapPin}
                      label="Location"
                      value={profile.location}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Company Info Card */}
            {profile.company && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-600">
                  Company Details
                </h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Building2 className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Company Name
                      </p>
                      <p className="mt-1 font-semibold text-slate-900">{profile.company.name}</p>
                    </div>
                  </div>

                  {profile.company.description && (
                    <div className="border-t border-slate-100 pt-4">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Description
                      </p>
                      <p className="mt-2 text-sm text-slate-600">{profile.company.description}</p>
                    </div>
                  )}

                  <div className="border-t border-slate-100 pt-4 grid gap-4 sm:grid-cols-2">
                    {profile.company.size && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Company Size
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.size}</p>
                      </div>
                    )}
                    {profile.company.industry && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Industry
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.industry}</p>
                      </div>
                    )}
                  </div>

                  {profile.company.website && (
                    <div className="border-t border-slate-100 pt-4">
                      <a
                        href={profile.company.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                      >
                        <Globe className="h-4 w-4" />
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors hover:bg-slate-50">
    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-slate-200">
      <Icon className="h-4 w-4 text-slate-600" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">{value}</p>
    </div>
  </div>
);

export default RecruiterProfilePage;