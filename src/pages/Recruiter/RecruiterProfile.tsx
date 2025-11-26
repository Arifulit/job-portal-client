import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Badge from '@/components/ui/badge';
import { Building2, Briefcase, Phone, Globe, Users } from 'lucide-react';
import recruiterService from '@/services/recruiterService';

interface Agency {
  _id: string;
  name: string;
  website: string;
  size: string;
  industry: string;
}

interface RecruiterProfile {
  _id: string;
  designation: string;
  phone: string;
  agency: Agency;
  createdAt: string;
  updatedAt: string;
}

const RecruiterProfile = () => {
  const [profile, setProfile] = useState<RecruiterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await recruiterService.getRecruiterProfile();
        if (response.success) {
          setProfile(response.data);
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
              <p className="text-sm text-muted-foreground">Designation</p>
              <p className="font-medium">{profile.designation}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {profile.phone}
              </p>
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
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Agency Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Agency Name</p>
              <p className="font-medium">{profile.agency.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Industry</p>
              <Badge variant="outline">{profile.agency.industry}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Company Size</p>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{profile.agency.size} employees</span>
              </div>
            </div>
            {profile.agency.website && (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecruiterProfile;