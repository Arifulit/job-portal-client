import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import { Building2, Briefcase, Phone, Globe, Users, MapPin } from 'lucide-react';
import recruiterService from '@/services/recruiterService';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface Agency {
  _id: string;
  name: string;
  website?: string;
  description?: string;
  size?: string;
  industry?: string;
}

interface RecruiterProfile {
  _id: string;
  user?: {
    _id?: string;
    name?: string;
    email?: string;
    role?: string;
  };
  bio?: string;
  biodata?: string;
  designation: string;
  phone: string;
  location?: string;
  agency?: Agency;
  createdAt: string;
  updatedAt: string;
}

interface ProfileFormValues {
  name: string;
  phone: string;
  designation: string;
  location: string;
  biodata: string;
  bio: string;
}

interface AgencyFormValues {
  name: string;
  website: string;
  description: string;
}

const RecruiterProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAgencyEditing, setIsAgencyEditing] = useState(false);
  const [isAgencySaving, setIsAgencySaving] = useState(false);
  const [formValues, setFormValues] = useState<ProfileFormValues>({
    name: '',
    phone: '',
    designation: '',
    location: '',
    biodata: '',
    bio: '',
  });
  const [agencyFormValues, setAgencyFormValues] = useState<AgencyFormValues>({
    name: '',
    website: '',
    description: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await recruiterService.getRecruiterProfile();
        if (response.success) {
          let nextProfile = response.data as RecruiterProfile;

          if (nextProfile?.agency?._id) {
            try {
              const agencyResponse = await recruiterService.getRecruiterAgencyById(nextProfile.agency._id);
              if (agencyResponse?.success && agencyResponse?.data) {
                nextProfile = {
                  ...nextProfile,
                  agency: {
                    ...nextProfile.agency,
                    ...agencyResponse.data,
                  },
                };
              }
            } catch {
              // Keep profile data even if agency details request fails.
            }
          }

          setProfile(nextProfile);
          setFormValues({
            name: nextProfile?.user?.name || '',
            phone: nextProfile?.phone || '',
            designation: nextProfile?.designation || '',
            location: nextProfile?.location || '',
            biodata: nextProfile?.biodata || nextProfile?.bio || '',
            bio: nextProfile?.biodata || nextProfile?.bio || '',
          });
          setAgencyFormValues({
            name: nextProfile?.agency?.name || '',
            website: nextProfile?.agency?.website || '',
            description: nextProfile?.agency?.description || '',
          });
        } else {
          setError('Failed to fetch profile');
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error fetching profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (field: keyof ProfileFormValues, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleAgencyInputChange = (field: keyof AgencyFormValues, value: string) => {
    setAgencyFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleCancel = () => {
    if (!profile) return;
    setFormValues({
      name: profile.user?.name || '',
      phone: profile.phone || '',
      designation: profile.designation || '',
      location: profile.location || '',
      biodata: profile.biodata || profile.bio || '',
      bio: profile.biodata || profile.bio || '',
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: formValues.name.trim(),
        phone: formValues.phone.trim(),
        designation: formValues.designation.trim(),
        location: formValues.location.trim(),
        biodata: formValues.biodata.trim(),
        bio: formValues.biodata.trim(),
      };

      if (!payload.name || !payload.phone || !payload.designation) {
        toast.error('Name, phone and designation are required');
        return;
      }

      const response = await recruiterService.updateRecruiterProfile(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to update profile');
      }

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phone: payload.phone,
          designation: payload.designation,
          location: payload.location,
          biodata: payload.biodata,
          bio: payload.biodata,
          user: {
            ...prev.user,
            name: payload.name,
          },
        };
      });

      updateUser({
        name: payload.name,
        phone: payload.phone,
        designation: payload.designation,
      });

      setIsEditing(false);
      toast.success('Recruiter profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update recruiter profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAgencyCancel = () => {
    setAgencyFormValues({
      name: profile?.agency?.name || '',
      website: profile?.agency?.website || '',
      description: profile?.agency?.description || '',
    });
    setIsAgencyEditing(false);
  };

  const handleAgencySave = async () => {
    try {
      const agencyName = agencyFormValues.name.trim();
      if (!agencyName) {
        toast.error('Agency name is required');
        return;
      }

      setIsAgencySaving(true);
      const payload = {
        name: agencyName,
        website: agencyFormValues.website.trim(),
        description: agencyFormValues.description.trim(),
      };

      const response = await recruiterService.createRecruiterAgency(payload);
      if (!response?.success) {
        throw new Error(response?.message || 'Failed to save agency');
      }

      const agencyData = response?.data || {};

      setProfile((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          agency: {
            _id: agencyData._id || prev.agency?._id || '',
            name: agencyData.name || payload.name,
            website: agencyData.website || payload.website,
            description: agencyData.description || payload.description,
            size: prev.agency?.size,
            industry: prev.agency?.industry,
          },
        };
      });

      setAgencyFormValues({
        name: agencyData.name || payload.name,
        website: agencyData.website || payload.website,
        description: agencyData.description || payload.description,
      });

      setIsAgencyEditing(false);
      toast.success('Agency saved successfully');
    } catch (err) {
      console.error('Error saving agency:', err);
      toast.error('Failed to save agency');
    } finally {
      setIsAgencySaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <div className="grid gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <p>No profile data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recruiter Profile</h1>
        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-blue-600" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formValues.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium">{profile.user?.name || 'N/A'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Designation</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formValues.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium">{profile.designation}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formValues.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {profile.phone}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Bio</p>
              {isEditing ? (
                <textarea
                  value={formValues.biodata}
                  onChange={(e) => {
                    handleInputChange('biodata', e.target.value);
                    handleInputChange('bio', e.target.value);
                  }}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium">{profile.biodata || profile.bio || 'N/A'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              {isEditing ? (
                <input
                  type="text"
                  value={formValues.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                  placeholder="Dhaka, Bangladesh"
                />
              ) : (
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {profile.location || 'N/A'}
                </p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">
                {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Agency Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Agency Information
              </CardTitle>
              {!isAgencyEditing ? (
                <button
                  type="button"
                  onClick={() => setIsAgencyEditing(true)}
                  className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  {profile.agency?._id ? 'Edit Agency' : 'Create Agency'}
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAgencyCancel}
                    disabled={isAgencySaving}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAgencySave}
                    disabled={isAgencySaving}
                    className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isAgencySaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Agency Name</p>
              {isAgencyEditing ? (
                <input
                  type="text"
                  value={agencyFormValues.name}
                  onChange={(e) => handleAgencyInputChange('name', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium">{profile.agency?.name || 'Not set'}</p>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <Badge variant="outline">{profile.agency?.industry || 'Not set'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company Size</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{profile.agency?.size ? `${profile.agency.size} employees` : 'Not set'}</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Description</p>
              {isAgencyEditing ? (
                <textarea
                  value={agencyFormValues.description}
                  onChange={(e) => handleAgencyInputChange('description', e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              ) : (
                <p className="font-medium">{profile.agency?.description || 'Not set'}</p>
              )}
            </div>
            {isAgencyEditing ? (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <input
                  type="text"
                  value={agencyFormValues.website}
                  onChange={(e) => handleAgencyInputChange('website', e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
                />
              </div>
            ) : profile.agency?.website ? (
              <div>
                <p className="text-sm text-muted-foreground">Website</p>
                <a
                  href={profile.agency.website.startsWith('http') ? profile.agency.website : `https://${profile.agency.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Globe className="h-4 w-4" />
                  {profile.agency.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterProfile;