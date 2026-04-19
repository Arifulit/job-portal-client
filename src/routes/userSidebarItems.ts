// এই ফাইলটি নির্দিষ্ট role er dashboard sidebar menu ও route-component mapping সংজ্ঞায়িত করে।
// ========== userSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { LayoutDashboard, User, Briefcase, FileText } from "lucide-react";
// import Jobs from "@/pages/Jobs/Jobs";

const CandidateDashboard = React.lazy(() =>
  import("../pages/Candidate/CandidateDashboard").then((module) => ({ default: module.CandidateDashboard }))
);
const CandidateProfile = React.lazy(() => import("../pages/Candidate/CandidateProfile"));
const MyApplications = React.lazy(() => import("@/pages/Candidate/MyApplications"));
const Jobs = React.lazy(() => import("@/pages/Job/Jobs"));

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
    component: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
  }[];
}

export const userSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/candidate/dashboard",
        icon: LayoutDashboard,
        component: CandidateDashboard,
      },
      {
        title: "Browse Jobs",
        url: "/candidate/jobs",
        icon: Briefcase,
        component:Jobs, // Replace with actual component
      },
      {
        title: "My Applications",
        url: "/candidate/applications",
        icon: FileText,
        component: MyApplications,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/candidate/profile",
        icon: User,
        component: CandidateProfile,
      },
    ],
  },
];

