// এই ফাইলটি নির্দিষ্ট role er dashboard sidebar menu ও route-component mapping সংজ্ঞায়িত করে।

// ========== adminSidebarItems.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { LayoutDashboard, Users, Briefcase, User } from "lucide-react";

const AdminDashboard = React.lazy(() =>
  import("../pages/admin/AdminDashboard").then((module) => ({ default: module.AdminDashboard }))
);
const AdminProfile = React.lazy(() => import("../pages/admin/AdminProfile"));
const UserManagement = React.lazy(() => import("../pages/admin/UserManagement"));
const Analytics = React.lazy(() => import("../pages/admin/Analytics"));

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