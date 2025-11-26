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

import React from 'react';
import { useCandidateProfile } from '../../services/candidateService';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { Mail, Phone, Calendar, Briefcase, MapPin, Award, User } from 'lucide-react';

const CandidateProfile = () => {
  const { data, isLoading, error } = useCandidateProfile();
  const profile = data?.data;

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl p-8">
            <div className="flex items-center gap-6 mb-8">
              <Skeleton className="h-28 w-28 rounded-full" />
              <div className="space-y-3 flex-1">
                <Skeleton className="h-9 w-64" />
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-10 text-center max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Profile Not Found</h2>
          <p className="text-gray-600">We couldn't load the candidate profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">

          {/* Hero Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="h-32 w-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white/30 flex items-center justify-center text-5xl font-bold shadow-2xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 h-10 w-10 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="h-4 w-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Info */}
              <div className="text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold mb-2">{profile.name}</h1>
                <p className="text-xl text-blue-100 mb-3">{profile.headline || 'Full Stack Developer'}</p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm">
                  {profile.location && (
                    <span className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile.location}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {profile.experienceLevel || 'Mid Level'}
                  </span>
                </div>
              </div>

              {/* Role Badge */}
              <div>
                <Badge className="bg-white/20 text-white border-white/30 text-lg px-6 py-3 backdrop-blur-sm">
                  {profile.user.role.charAt(0).toUpperCase() + profile.user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-8 lg:p-12">
            <div className="grid lg:grid-cols-3 gap-10">

              {/* Left Column - Contact & Info */}
              <div className="lg:col-span-1 space-y-8">
                {/* Contact Info */}
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{profile.user.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-500" />
                        <span className="text-gray-700">{profile.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">
                        Joined {new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <h3 className="text-lg font-bold mb-4">Profile Strength</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Skills Added</span>
                      <span className="font-bold">{profile.skills?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Applications</span>
                      <span className="font-bold">{profile.applications?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Skills & About */}
              <div className="lg:col-span-2 space-y-8">

                {/* About / Summary */}
                {profile.summary && (
                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                      <Award className="w-6 h-6 text-blue-600" />
                      Professional Summary
                    </h3>
                    <p className="text-gray-700 leading-relaxed">{profile.summary}</p>
                  </div>
                )}

                {/* Skills */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-3">
                    <Award className="w-6 h-6 text-blue-600" />
                    Skills
                  </h3>
                  {profile.skills && profile.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-3">
                      {profile.skills.map((skill, index) => (
                        <Badge
                          key={index}
                          className="bg-blue-100 text-blue-800 hover:bg-blue-200 border border-blue-300 text-sm px-5 py-2.5 font-medium transition-all"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No skills added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;