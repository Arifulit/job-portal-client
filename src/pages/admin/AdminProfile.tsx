// import React from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";
// import { useAuth } from "../../context/AuthContext";
// import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
// import { Button } from "../../components/ui/button";
// import { format } from "date-fns";

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

// interface AdminProfileData {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
// }

// export default function AdminProfile(): JSX.Element {
//   const navigate = useNavigate();
//   const { user: ctxUser, logout } = useAuth();

//   const tokenPresent = !!ctxUser || !!localStorage.getItem("token");

//   const { data, isLoading, isError } = useQuery<{ success: boolean; data: AdminProfileData }>({
//     queryKey: ["adminProfile"],
//     queryFn: async () => {
//       const res = await axios.get(`${API_BASE}/admin/profile`, {
//         headers: {
//           'Authorization': `Bearer ${localStorage.getItem('token')}`
//         }
//       });
//       return res.data;
//     },
//     enabled: tokenPresent,
//     staleTime: 5 * 60 * 1000,
//   });

//   const admin = data?.data;

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//       </div>
//     );
//   }

//   if (isError || !admin) {
//     return (
//       <div className="p-6 max-w-5xl mx-auto">
//         <div className="bg-red-50 p-4 rounded-md">
//           <h3 className="text-red-800 font-medium">Error loading profile</h3>
//           <p className="text-red-700 text-sm mt-1">Failed to load admin profile. Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <header className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
//           <p className="text-gray-600 mt-1">Manage your account and admin settings</p>
//         </div>
//         <div className="flex items-center gap-3">
//           <Button
//             variant="outline"
//             onClick={() => {
//               logout();
//               navigate("/login");
//             }}
//             className="text-red-600 border-red-200 hover:bg-red-50"
//           >
//             Logout
//           </Button>
//           <Link to="/admin/dashboard">
//             <Button>
//               Back to Dashboard
//             </Button>
//           </Link>
//         </div>
//       </header>

//       <Card className="overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
//           <div className="flex items-center space-x-4">
//             <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
//               {admin.name?.charAt(0).toUpperCase()}
//             </div>
//             <div>
//               <CardTitle className="text-2xl">{admin.name}</CardTitle>
//               <p className="text-indigo-100">{admin.email}</p>
//             </div>
//           </div>
//         </CardHeader>
        
//         <CardContent className="p-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div className="space-y-1">
//               <h3 className="text-sm font-medium text-gray-500">Admin ID</h3>
//               <p className="text-gray-900">{admin._id}</p>
//             </div>
            
//             <div className="space-y-1">
//               <h3 className="text-sm font-medium text-gray-500">Role</h3>
//               <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
//                 {admin.role}
//               </span>
//             </div>
            
//             <div className="space-y-1">
//               <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
//               <p className="text-gray-900">
//                 {format(new Date(admin.createdAt), 'MMMM d, yyyy')}
//               </p>
//             </div>
            
//             <div className="space-y-1">
//               <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
//               <p className="text-gray-900">
//                 {format(new Date(admin.updatedAt), 'MMMM d, yyyy')}
//               </p>
//             </div>
//           </div>
          
//           <div className="mt-8 pt-6 border-t border-gray-200">
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
//             <div className="flex flex-wrap gap-3">
//               <Button variant="outline">
//                 Edit Profile
//               </Button>
//               <Button variant="outline">
//                 Change Password
//               </Button>
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <Link to="/admin/users" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
//           <h4 className="text-sm text-gray-500">Users</h4>
//           <p className="mt-2 text-xl font-semibold text-gray-800">Manage users</p>
//         </Link>

//         <Link to="/admin/jobs" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
//           <h4 className="text-sm text-gray-500">Jobs</h4>
//           <p className="mt-2 text-xl font-semibold text-gray-800">Moderate job posts</p>
//         </Link>

//         <Link to="/admin/settings" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
//           <h4 className="text-sm text-gray-500">Settings</h4>
//           <p className="mt-2 text-xl font-semibold text-gray-800">Account & platform settings</p>
//         </Link>
//       </section>

//       <section className="bg-white shadow rounded-lg p-6 mt-6">
//         <h3 className="text-lg font-medium text-gray-900 mb-4">About</h3>
//         <p className="text-gray-700">
//           You are logged in as <span className="font-medium text-indigo-600">{admin.role}</span>. 
//           Use the links above to manage users, review jobs and configure platform settings.
//         </p>
//       </section>
//     </div>
//   );
// }


import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { format } from "date-fns";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

interface AdminProfileData {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export default function AdminProfile(): JSX.Element {
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();

  const tokenPresent = !!ctxUser || !!localStorage.getItem("token");

  const { data, isLoading, isError } = useQuery<{
    success: boolean;
    data: AdminProfileData;
  }>({
    queryKey: ["adminProfile"],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE}/admin/profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      return res.data;
    },
    enabled: tokenPresent,
    staleTime: 5 * 60 * 1000,
  });

  const admin = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    );
  }

  if (isError || !admin) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
          <h3 className="font-semibold">Error loading profile</h3>
          <p className="text-sm mt-1">Failed to load admin profile. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and admin settings</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            Logout
          </Button>
          <Link to="/admin/dashboard">
            <Button className="border-blue-300 text-blue-700 hover:bg-blue-50">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <Card className="shadow-lg border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center text-3xl font-bold shadow-lg">
              {admin.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-2xl">{admin.name}</CardTitle>
              <p className="text-blue-100 text-lg">{admin.email}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Admin ID</h3>
              <p className="text-gray-900 font-mono text-sm mt-1">{admin._id}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Role</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 mt-1">
                {admin.role.toUpperCase()}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Account Created</h3>
              <p className="text-gray-900 mt-1">
                {format(new Date(admin.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-gray-900 mt-1">
                {format(new Date(admin.updatedAt), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Edit Profile
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
        <Link
          to="/admin/users"
          className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <h4 className="text-sm font-medium text-gray-500">Users</h4>
          <p className="mt-2 text-2xl font-bold text-gray-800">Manage Users</p>
          <p className="text-sm text-gray-600 mt-1">View, edit, or remove user accounts</p>
        </Link>

        <Link
          to="/admin/jobs"
          className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <h4 className="text-sm font-medium text-gray-500">Jobs</h4>
          <p className="mt-2 text-2xl font-bold text-gray-800">Moderate Jobs</p>
          <p className="text-sm text-gray-600 mt-1">Review and approve job postings</p>
        </Link>

        <Link
          to="/admin/settings"
          className="block bg-white border border-gray-200 rounded-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1"
        >
          <h4 className="text-sm font-medium text-gray-500">Settings</h4>
          <p className="mt-2 text-2xl font-bold text-gray-800">Platform Settings</p>
          <p className="text-sm text-gray-600 mt-1">Configure site-wide options</p>
        </Link>
      </section>

      {/* About Section */}
      <section className="bg-white border border-gray-200 shadow rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">About Your Role</h3>
        <p className="text-gray-700 leading-relaxed">
          You are logged in as an <span className="font-bold text-blue-700">Administrator</span>. 
          You have full access to manage users, moderate job listings, and configure platform settings.
        </p>
      </section>
    </div>
  );
}