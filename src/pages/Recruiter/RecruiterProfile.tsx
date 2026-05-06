
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  logo?: string;
  website?: string;
  description?: string;
  size?: string;
  industry?: string;
  yearOfEstablishment?: number;
  address?: string;
  location?: string;
  email?: string;
  phone?: string;
  isVerified?: boolean;
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
  const { user } = useAuth();
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
      yearOfEstablishment: '',
      address: '',
      location: '',
      email: '',
      phone: '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState('');

  const initials = useMemo(
    () => (profile?.name || 'R').trim().charAt(0).toUpperCase(),
    [profile?.name]
  );

  const displayRole = useMemo(
    () => String(user?.role || 'recruiter').toLowerCase(),
    [user?.role]
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await recruiterService.getRecruiterProfile();
      const profileData = response?.data as any;
      if (response?.success && profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          phone: profileData.phone || '',
          location: profileData.location || '',
          biodata: profileData.biodata || profileData.bio || '',
          company: {
            name: profileData.company?.name || '',
            website: profileData.company?.website || '',
            description: profileData.company?.description || '',
            size: profileData.company?.size || '',
            industry: profileData.company?.industry || '',
            yearOfEstablishment: profileData.company?.yearOfEstablishment ? String(profileData.company.yearOfEstablishment) : '',
            address: profileData.company?.address || '',
            location: profileData.company?.location || '',
            email: profileData.company?.email || '',
            phone: profileData.company?.phone || '',
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

  const handleCompanyLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCompanyLogoFile(file);
    setCompanyLogoPreview(URL.createObjectURL(file));
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
      payload.append('company', JSON.stringify({
        name: formData.company.name,
        website: formData.company.website,
        description: formData.company.description,
        size: formData.company.size,
        industry: formData.company.industry,
        yearOfEstablishment: formData.company.yearOfEstablishment
          ? Number(formData.company.yearOfEstablishment)
          : undefined,
        address: formData.company.address,
        location: formData.company.location,
        email: formData.company.email,
        phone: formData.company.phone,
      }));

      if (avatarFile) {
        payload.append('avatar', avatarFile);
      }
      if (companyLogoFile) {
        payload.append('companyLogo', companyLogoFile);
      }

      const response = await recruiterService.updateRecruiterProfile(payload);
      if (response?.success) {
        toast.success('Profile updated successfully');
        setAvatarFile(null);
        setAvatarPreview('');
        setCompanyLogoFile(null);
        setCompanyLogoPreview('');
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
        yearOfEstablishment: profile?.company?.yearOfEstablishment ? String(profile.company.yearOfEstablishment) : '',
        address: profile?.company?.address || '',
        location: profile?.company?.location || '',
        email: profile?.company?.email || '',
        phone: profile?.company?.phone || '',
      },
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setCompanyLogoFile(null);
    setCompanyLogoPreview('');
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
  const profileCompanyLogo = companyLogoPreview || profile.company?.logo || '';

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
              <div className="mb-6 flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-slate-300 bg-white">
                  {profileCompanyLogo ? (
                    <img src={profileCompanyLogo} alt="Company logo preview" className="h-full w-full object-contain p-1" />
                  ) : (
                    <Building2 className="h-6 w-6 text-emerald-600" />
                  )}
                </div>
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100">
                    <Camera className="h-4 w-4" />
                    Upload Company Logo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCompanyLogoChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
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
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={formData.company.yearOfEstablishment}
                    onChange={(e) => handleCompanyChange('yearOfEstablishment', e.target.value)}
                    placeholder="e.g. 2018"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Email
                  </label>
                  <input
                    type="email"
                    value={formData.company.email}
                    onChange={(e) => handleCompanyChange('email', e.target.value)}
                    placeholder="company@example.com"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Phone
                  </label>
                  <input
                    type="text"
                    value={formData.company.phone}
                    onChange={(e) => handleCompanyChange('phone', e.target.value)}
                    placeholder="+8801XXXXXXXXX"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Location
                  </label>
                  <input
                    type="text"
                    value={formData.company.location}
                    onChange={(e) => handleCompanyChange('location', e.target.value)}
                    placeholder="Dhaka, Bangladesh"
                    className={inp}
                    disabled={isSaving}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Company Address
                  </label>
                  <input
                    type="text"
                    value={formData.company.address}
                    onChange={(e) => handleCompanyChange('address', e.target.value)}
                    placeholder="Full company address"
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
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-slate-900 p-8 text-white shadow-2xl relative">
          {/* Background accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -z-10"></div>
          
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-8">
              <div className="h-40 w-40 overflow-hidden rounded-3xl border-4 border-white bg-blue-100 flex items-center justify-center text-5xl font-bold shadow-2xl flex-shrink-0 relative">
                {profileAvatar ? (
                  <img src={profileAvatar} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="bg-gradient-to-br from-blue-400 to-blue-600 text-white w-full h-full flex items-center justify-center">{initials}</span>
                )}
                <div className="absolute inset-0 rounded-3xl border-4 border-white/20"></div>
              </div>
              <div className="flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-200 backdrop-blur-sm">
                    <Users className="h-3.5 w-3.5" />
                    {displayRole}
                  </span>
                </div>
                <h1 className="text-5xl font-bold tracking-tight mb-2">{profile.name}</h1>
                {profile.designation && (
                  <p className="text-blue-100 text-lg font-medium mb-4">{profile.designation}</p>
                )}
                <div className="flex items-center gap-2 text-blue-50 mb-6">
                  <Mail className="h-5 w-5" />
                  <a href={`mailto:${profile.email}`} className="hover:text-white transition font-medium">
                    {profile.email}
                  </a>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  {profile.phone && (
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition">
                      <Phone className="h-4 w-4" />
                      <span className="font-medium">{profile.phone}</span>
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 hover:bg-white/20 transition">
                      <MapPin className="h-4 w-4" />
                      <span className="font-medium">{profile.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-semibold text-blue-700 shadow-lg hover:bg-blue-50 transition-all hover:scale-105 flex-shrink-0"
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
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-lg hover:shadow-xl transition-shadow">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-6">Performance Stats</p>
              <div className="space-y-4">
                <div className="rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4 border border-emerald-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-700">Jobs Posted</span>
                    <span className="text-3xl font-bold text-emerald-600">
                      {profile.jobsPosted || 0}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 border border-blue-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-700">Applications</span>
                    <span className="text-3xl font-bold text-blue-600">
                      {profile.applicantsCount || 0}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-gradient-to-r from-green-50 to-green-100/50 p-4 border border-green-200/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-green-700">Hires</span>
                    <span className="text-3xl font-bold text-green-600">{profile.hires || 0}</span>
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
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-7 shadow-lg hover:shadow-xl transition-shadow">
              <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-slate-700 flex items-center gap-2">
                <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                Personal Information
              </h2>
              <div className="space-y-6">
                {profile.biodata && (
                  <div className="rounded-xl bg-gradient-to-br from-blue-50 to-slate-100 p-5 border border-blue-100/50 italic text-slate-700 leading-relaxed">
                    "{profile.biodata}"
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
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                      {profile.company.logo ? (
                        <img
                          src={profile.company.logo}
                          alt={profile.company.name || 'Company logo'}
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <Building2 className="h-6 w-6 text-emerald-600" />
                      )}
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
                    {profile.company.yearOfEstablishment && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Founded
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.yearOfEstablishment}</p>
                      </div>
                    )}
                    {typeof profile.company.isVerified === 'boolean' && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Verification
                        </p>
                        <p className="mt-1 font-medium text-slate-900">
                          {profile.company.isVerified ? 'Verified' : 'Pending'}
                        </p>
                      </div>
                    )}
                    {profile.company.email && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Company Email
                        </p>
                        <p className="mt-1 font-medium text-slate-900 break-all">{profile.company.email}</p>
                      </div>
                    )}
                    {profile.company.phone && (
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Company Phone
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.phone}</p>
                      </div>
                    )}
                    {profile.company.address && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Address
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.address}</p>
                      </div>
                    )}
                    {profile.company.location && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Location
                        </p>
                        <p className="mt-1 font-medium text-slate-900">{profile.company.location}</p>
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
  <div className="group flex items-start gap-4 rounded-xl px-4 py-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/50 transition-all hover:border-blue-300 hover:shadow-md">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 transition-all group-hover:scale-110">
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-1">{label}</p>
      <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition">{value}</p>
    </div>
  </div>
);

export default RecruiterProfilePage;