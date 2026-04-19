// এই ফাইলটি নির্দিষ্ট role er dashboard sidebar menu ও route-component mapping সংজ্ঞায়িত করে।
// ========== recruiterSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { LayoutDashboard, Briefcase, User, FileText } from "lucide-react";

const RecruiterDashboard = React.lazy(() =>
  import("../pages/Recruiter/RecruiterDashboard").then((module) => ({ default: module.RecruiterDashboard }))
);
const RecruiterProfile = React.lazy(() => import("../pages/Recruiter/RecruiterProfile"));
const JobPost = React.lazy(() => import("../pages/Recruiter/JobPost"));
const MyJob = React.lazy(() => import("@/pages/Recruiter/MyJob"));
const RecruiterApplications = React.lazy(() => import("@/pages/Recruiter/RecruiterApplications"));

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
    component: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
  }[];
}

export const recruiterSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/recruiter/dashboard",
        icon: LayoutDashboard,
        component: RecruiterDashboard,
      },
     {
  title: "Post Job",
  url: "/recruiter/jobs/create", 
  icon: Briefcase,
  component: JobPost,
},
      {
        title: "My Jobs",
        url: "/recruiter/jobs",
        icon: FileText,
        component: MyJob, // Replace with actual component
      },
      {
        title: "Applications",
        url: "/recruiter/applications",
        icon: FileText,
        component: RecruiterApplications,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/recruiter/profile",
        icon: User,
        component: RecruiterProfile,
      },
    ],
  },
];
