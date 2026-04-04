
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useProfile, useUpdateProfile } from '../../services/userService';
import { MapPin, Phone, ShieldCheck, UserCircle2 } from 'lucide-react';

const AdminProfile = (): JSX.Element => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { data: profile, isLoading, isError, refetch } = useProfile();
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [biodata, setBiodata] = useState('');

  useEffect(() => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBiodata(profile.biodata || profile.bio || '');
  }, [profile]);

  const initials = useMemo(() => {
    const base = String(profile?.name || 'A').trim();
    return base.charAt(0).toUpperCase();
  }, [profile?.name]);

  const handleSave = () => {
    if (!profile) return;

    updateProfile(
      {
        name: name.trim(),
        phone: phone.trim() || undefined,
        location: location.trim() || undefined,
        biodata: biodata.trim() || undefined,
        bio: biodata.trim() || undefined,
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  const handleCancel = () => {
    if (!profile) return;
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setLocation(profile.location || '');
    setBiodata(profile.biodata || profile.bio || '');
    setIsEditing(false);
  };

  if (isLoading) return <Loader />;

  if (isError || !profile) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6">
        <p className="font-semibold text-red-700">Failed to load admin profile.</p>
        <Button onClick={() => refetch()} className="mt-3 bg-red-600 text-white hover:bg-red-700">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Administration</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">Admin Profile</h1>
            <p className="mt-2 text-sm text-slate-200">Update your account identity and keep admin contact details current.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/40 bg-transparent text-white hover:bg-white/10"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Logout
            </Button>
            <Button variant="outline" className="border-white/40 bg-transparent text-white hover:bg-white/10" asChild>
              <Link to="/admin/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-black text-white shadow-sm">
                {initials}
              </div>
              <div>
                <CardTitle className="text-2xl font-black text-slate-900">{profile.name || 'Admin'}</CardTitle>
                <p className="text-sm text-slate-600">{profile.email}</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              {String(profile.role || 'admin').toUpperCase()}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-slate-700">Profile Details</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <UserCircle2 className="h-4 w-4" /> Full Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!isEditing || isUpdating}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Phone className="h-4 w-4" /> Phone
                </label>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  disabled={!isEditing || isUpdating}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                  placeholder="Add phone number"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input
                  value={profile.email || ''}
                  disabled
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Role</label>
                <input
                  value={String(profile.role || 'Admin')}
                  disabled
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                />
              </div>
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <MapPin className="h-4 w-4" /> Location
                </label>
                <input
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  disabled={!isEditing || isUpdating}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                  placeholder="Dhaka, Bangladesh"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Biodata</label>
                <textarea
                  value={biodata}
                  onChange={(event) => setBiodata(event.target.value)}
                  disabled={!isEditing || isUpdating}
                  className="min-h-[108px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-offset-2 transition focus:border-slate-500 focus:ring-2 focus:ring-slate-300 disabled:bg-slate-100"
                  placeholder="Write a short admin biodata"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="bg-slate-900 text-white hover:bg-slate-800">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating || !name.trim()}
                    className="bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={handleCancel} disabled={isUpdating} className="border-slate-300">
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-3">
        <Link to="/admin/users" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Users</p>
          <p className="mt-2 text-lg font-black text-slate-900">Manage Users</p>
          <p className="mt-1 text-sm text-slate-600">Handle roles, suspension, approvals, and removals.</p>
        </Link>

        <Link to="/admin/jobs" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Moderation</p>
          <p className="mt-2 text-lg font-black text-slate-900">Moderate Jobs</p>
          <p className="mt-1 text-sm text-slate-600">Review platform activity and job-related actions.</p>
        </Link>

        <Link to="/admin/dashboard" className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Overview</p>
          <p className="mt-2 text-lg font-black text-slate-900">Dashboard</p>
          <p className="mt-1 text-sm text-slate-600">Go back to high-level metrics and quick admin actions.</p>
        </Link>
      </section>
    </div>
  );
};

export default AdminProfile;