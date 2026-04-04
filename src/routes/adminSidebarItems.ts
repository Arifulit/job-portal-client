
// ========== adminSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { LayoutDashboard, Users, Briefcase, User } from "lucide-react";
import { AdminDashboard } from "../pages/admin/AdminDashboard";
import AdminProfile from "../pages/admin/AdminProfile";
import UserManagement from "../pages/admin/UserManagement";
import Analytics from "../pages/admin/Analytics";

interface ISidebarSubItem {
  title: string;
  url: string;
  icon?: any;
  component: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
}

interface ISidebarItem {
  title: string;
  items: ISidebarSubItem[];
}

export const adminSidebarItems: ISidebarItem[] = [
  {
    title: "Main",
    items: [
      {
        title: "Dashboard",
        url: "/admin/dashboard",
        icon: LayoutDashboard,
        component: AdminDashboard,
      },
      {
        title: "Manage Users",
        url: "/admin/users",
        icon: Users,
        component: UserManagement,
      },
      {
        title: "Moderate Jobs",
        url: "/admin/jobs",
        icon: Briefcase,
        component: Analytics,
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        title: "Profile",
        url: "/admin/profile",
        icon: User,
        component: AdminProfile,
      },
    ],
  },
];