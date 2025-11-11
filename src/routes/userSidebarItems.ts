// ========== userSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDashboard, User, Briefcase, FileText } from "lucide-react";
import { JobSeekerDashboard } from "../pages/Job_Seeker/JobSeekerDashboard";
import JobSeekerProfile from "../pages/Job_Seeker/JobSeekerProfile";

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
    component: React.ComponentType<any>;
  }[];
}

export const userSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/jobseeker/dashboard",
        icon: LayoutDashboard,
        component: JobSeekerDashboard,
      },
      {
        title: "Browse Jobs",
        url: "/jobseeker/jobs",
        icon: Briefcase,
        component: JobSeekerDashboard, // Replace with actual component
      },
      {
        title: "My Applications",
        url: "/jobseeker/applications",
        icon: FileText,
        component: JobSeekerDashboard, // Replace with actual component
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/jobseeker/profile",
        icon: User,
        component: JobSeekerProfile,
      },
    ],
  },
];

