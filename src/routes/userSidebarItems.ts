// ========== userSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDashboard, User, Briefcase, FileText } from "lucide-react";
import { CandidateDashboard } from "../pages/Candidate/CandidateDashboard";
import CandidateProfile from "../pages/Candidate/CandidateProfile";
import Jobs from "@/pages/Jobs/Jobs";

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
        component: CandidateDashboard, // Replace with actual component
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

