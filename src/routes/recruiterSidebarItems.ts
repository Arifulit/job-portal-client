// ========== recruiterSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDashboard, Briefcase, User, FileText } from "lucide-react";
import { RecruiterDashboard } from "../pages/Recruiter/RecruiterDashboard";
import RecruiterProfile from "../pages/Recruiter/RecruiterProfile";
import JobPost from "../pages/Recruiter/JobPost";
import MyJob from "@/pages/Recruiter/MyJob";

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
    component: React.ComponentType<any>;
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
