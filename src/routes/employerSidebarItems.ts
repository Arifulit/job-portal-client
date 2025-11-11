// ========== employerSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDashboard, Briefcase, User, FileText } from "lucide-react";
import { EmployerDashboard } from "../pages/Employer/EmployerDashboard";
import EmployerProfile from "../pages/Employer/EmployerProfile";

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon: any;
    component: React.ComponentType<any>;
  }[];
}

export const employerSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/employer/dashboard",
        icon: LayoutDashboard,
        component: EmployerDashboard,
      },
      {
        title: "Post Job",
        url: "/employer/jobs/create",
        icon: Briefcase,
        component: EmployerDashboard, // Replace with actual component
      },
      {
        title: "My Jobs",
        url: "/employer/jobs",
        icon: FileText,
        component: EmployerDashboard, // Replace with actual component
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/employer/profile",
        icon: User,
        component: EmployerProfile,
      },
    ],
  },
];
