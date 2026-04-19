// এই ফাইলটি candidate dashboard এর একটি page UI ও interaction flow পরিচালনা করে।
// import React from 'react';
// import { useCandidateProfile } from '../../services/candidateService';
// import Badge from '../../components/ui/badge';
// import { Skeleton } from '../../components/ui/skeleton';

// const CandidateProfile = () => {
//   const { data, isLoading, error } = useCandidateProfile();
//   const profile = data?.data;

//   if (isLoading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
//           <div className="flex items-center space-x-4 mb-6">
//             <Skeleton className="h-24 w-24 rounded-full" />
//             <div className="space-y-2">
//               <Skeleton className="h-8 w-64" />
//               <Skeleton className="h-4 w-48" />
//             </div>
//           </div>
//           <div className="space-y-4">
//             <Skeleton className="h-6 w-32" />
//             <Skeleton className="h-4 w-full" />
//             <Skeleton className="h-4 w-5/6" />
//             <Skeleton className="h-4 w-4/6" />
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-3xl mx-auto bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-6">
//           <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">Error loading profile</h2>
//           <p className="text-red-600 dark:text-red-400">{error.message}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!profile) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 text-center">
//           <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Profile not found</h2>
//           <p className="text-gray-600 dark:text-gray-300">The requested profile could not be found.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
//         {/* Header with profile info */}
//         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
//           <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//             <div className="flex items-center space-x-4">
//               <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
//                 {profile.name.charAt(0).toUpperCase()}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">{profile.name}</h1>
//                 <p className="text-blue-100">{profile.user.email}</p>
//               </div>
//             </div>
//             <div className="mt-4 md:mt-0">
//               <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
//                 {profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1)}
//               </span>
//             </div>
//           </div>
//         </div>

//         {/* Profile details */}
//         <div className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Contact Information</h2>
//               <div className="space-y-3">
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
//                   <p className="text-gray-800 dark:text-white">{profile.user.email}</p>
//                 </div>
//                 {profile.phone && (
//                   <div>
//                     <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
//                     <p className="text-gray-800 dark:text-white">{profile.phone}</p>
//                   </div>
//                 )}
//                 <div>
//                   <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
//                   <p className="text-gray-800 dark:text-white">
//                     {new Date(profile.createdAt).toLocaleDateString('en-US', {
//                       year: 'numeric',
//                       month: 'long',
//                       day: 'numeric',
//                     })}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Skills</h2>
//               {profile.skills && profile.skills.length > 0 ? (
//                 <div className="flex flex-wrap gap-2">
//                   {profile.skills.map((skill, index) => (
//                     <Badge key={index} variant="secondary">
//                       {skill}
//                     </Badge>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 dark:text-gray-400">No skills added yet</p>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CandidateProfile;

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCandidateProfile, useUpdateCandidateProfile } from '../../services/candidateService';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Mail, Phone, Calendar, Briefcase, MapPin, Award, User, Pencil, X } from 'lucide-react';
import { toast } from 'sonner';

const CandidateProfile = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useCandidateProfile();
  const profileData = data?.data;
  const profile = profileData || {
    _id: user?._id || '',
    user: {
      _id: user?._id || '',
      name: user?.name || 'Candidate',
      email: user?.email || '',
      role: user?.role || 'candidate',
      createdAt: '',
      updatedAt: '',
    },
    name: user?.name || 'Candidate',
    phone: user?.phone || '',
    skills: user?.skills || [],
    location: user?.location || '',
    address: user?.location || '',
    biodata: user?.biodata || '',
    headline: '',
    experienceLevel: '',
    summary: user?.biodata || '',
    createdAt: '',
    updatedAt: '',
    __v: 0,
  };
  const displayEmail = profile.user?.email || profile.email || user?.email || '';
  const displayLocation = profile.location || profile.address || user?.location || '';
  const displayBiodata = profile.biodata || profile.bio || profile.summary || user?.biodata || '';
  const displayHeadline = profile.headline || 'Candidate Profile';
  const displayExperience = profile.experienceLevel || 'Not specified';

  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', headline: '', location: '', experienceLevel: '', biodata: '', summary: '', skills: [] as string[] });
  const [skillInput, setSkillInput] = useState('');
  const { mutate: updateProfile, isPending: isUpdating } = useUpdateCandidateProfile();

  const openEdit = () => {
    if (!profile) return;
    setForm({
      name: profile.name || '',
      phone: profile.phone || '',
      headline: profile.headline || '',
      location: profile.location || profile.address || '',
      experienceLevel: profile.experienceLevel || '',
      biodata: profile.biodata || profile.bio || profile.summary || '',
      summary: profile.biodata || profile.bio || profile.summary || '',
      skills: [...(profile.skills || [])],
    });
    setIsEditing(true);
  };

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
    setSkillInput('');
  };

  const removeSkill = (skill: string) => setForm(f => ({ ...f, skills: f.skills.filter(s => s !== skill) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form, {
      onSuccess: () => { setIsEditing(false); toast.success('Profile updated successfully!'); },
      onError: (err) => { toast.error(err.message); },
    });
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl bg-white p-8 shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-28 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-9 w-64 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-5 w-48 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-5 w-32 bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32 bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-full bg-slate-200 dark:bg-slate-800" />
                <Skeleton className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-24 bg-slate-200 dark:bg-slate-800" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-8 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
                  <Skeleton className="h-8 w-28 rounded-full bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl bg-white p-10 text-center shadow-xl dark:border dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40">
            <User className="h-10 w-10 text-red-600 dark:text-red-300" />
          </div>
          <h2 className="mb-3 text-2xl font-bold text-gray-900 dark:text-slate-100">Profile Not Found</h2>
          <p className="text-gray-600 dark:text-slate-300">We couldn't load the candidate profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.10),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] py-12 px-4 dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.22),_rgba(2,6,23,0)_36%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)]">
      <div className="max-w-5xl mx-auto">

        {/* Main Profile Card */}
        <div className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)]">

          {/* Hero Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 px-8 py-10 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="h-28 w-28 md:h-32 md:w-32 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-4xl md:text-5xl font-bold shadow-2xl shadow-black/20">
                  {(profile.name || profile.user?.name || 'C').charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-emerald-500 h-9 w-9 rounded-full border-4 border-slate-900 flex items-center justify-center">
                  <div className="h-3.5 w-3.5 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-blue-100 backdrop-blur-sm">
                  Candidate Profile
                </div>
                <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-5xl">{profile.name || profile.user?.name}</h1>
                <p className="mt-3 max-w-2xl text-base md:text-lg text-slate-200">{displayHeadline}</p>
                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm text-slate-200">
                  {displayLocation && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                      <MapPin className="w-4 h-4" />
                      {displayLocation}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 backdrop-blur-sm">
                    <Briefcase className="w-4 h-4" />
                    {displayExperience}
                  </span>
                </div>
              </div>

              {/* Role Badge & Edit */}
              <div className="flex flex-col items-center md:items-end gap-3">
                <Badge className="border border-white/20 bg-white/10 text-white text-sm px-4 py-2.5 backdrop-blur-sm">
                  {profile.user?.role ? profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1) : 'Candidate'}
                </Badge>
                <button
                  onClick={openEdit}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/15"
                >
                  <Pencil className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">

              {/* Left Column - Contact & Info */}
              <div className="lg:col-span-1 space-y-8">
                {/* Contact Info */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-800/60">
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <Mail className="w-6 h-6 text-blue-600 dark:text-slate-300" />
                    Contact Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                      <Mail className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
                        <span className="font-medium text-slate-900 dark:text-slate-100">{displayEmail}</span>
                      </div>
                    </div>
                    {profile.phone && (
                      <div className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                        <Phone className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone</p>
                          <span className="font-medium text-slate-900 dark:text-slate-100">{profile.phone}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
                      <Calendar className="mt-0.5 h-5 w-5 text-slate-500 dark:text-slate-400" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Member since</p>
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {profile.createdAt
                            ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : 'Recently joined'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Profile Snapshot</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <span className="text-slate-600 dark:text-slate-300">Skills Added</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{profile.skills?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 dark:bg-slate-800/70">
                      <span className="text-slate-600 dark:text-slate-300">Applications</span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{profile.applications?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills & About */}
              <div className="lg:col-span-2 space-y-8">

                {/* About / Biodata */}
                {displayBiodata && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <h3 className="mb-4 flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                      <Award className="w-5 h-5 text-blue-600 dark:text-slate-300" />
                      Biodata
                    </h3>
                    <div className="border-l-4 border-blue-500 pl-4 dark:border-slate-600">
                      <p className="leading-7 text-slate-700 dark:text-slate-300">{displayBiodata}</p>
                    </div>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <h3 className="mb-5 flex items-center gap-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    <Award className="w-5 h-5 text-blue-600 dark:text-slate-300" />
                    Skills
                  </h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm italic text-slate-500 dark:text-slate-400">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.28)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_30px_100px_rgba(2,6,23,0.75)]">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Edit Profile</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update your public candidate details.</p>
              </div>
              <button onClick={() => setIsEditing(false)} className="rounded-full p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800">
                <X className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Name</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Headline</label>
                <input
                  value={form.headline}
                  onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
                  placeholder="e.g. Full Stack Developer"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  placeholder="e.g. Dhaka, Bangladesh"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Experience Level</label>
                <select
                  value={form.experienceLevel}
                  onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                >
                  <option value="">Select level</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">Biodata</label>
                <textarea
                  rows={4}
                  value={form.biodata}
                  onChange={e => setForm(f => ({ ...f, biodata: e.target.value, summary: e.target.value }))}
                  placeholder="Write a short bio about yourself..."
                  className="w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Skills</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                    placeholder="Type a skill and press Enter or Add"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500 dark:focus:ring-slate-800"
                  />
                  <button type="button" onClick={addSkill} className="rounded-xl bg-slate-900 px-4 py-2.5 font-medium text-white transition-colors hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white">
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.skills.map(skill => (
                    <span key={skill} className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="text-slate-500 transition-colors hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl border border-slate-300 py-3 font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 rounded-xl bg-blue-600 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
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