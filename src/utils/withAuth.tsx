// ========== withAuth.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ComponentType } from "react";

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, user } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
      const userRole = (user?.role || '').toLowerCase();
      const required = requiredRole.toLowerCase();
      
      // Handle different role formats
      const normalizedUserRole = userRole === 'job_seeker' ? 'candidate' : userRole;
      const normalizedRequired = required === 'job_seeker' ? 'candidate' : required;

      if (normalizedUserRole !== normalizedRequired) {
        return <Navigate to="/unauthorized" replace />;
      }
    }

    return <Component {...props} />;
  };
}

// ========== generateRoutes.ts ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
interface SidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    component: React.ComponentType<any>;
    icon?: any;
  }[];
}

export function generateRoutes(sidebarItems: SidebarItem[]) {
  const routes: any[] = [];

  sidebarItems.forEach((section) => {
    section.items.forEach((item) => {
      // Extract the path from the full URL
      // e.g., "/admin/dashboard" -> "dashboard"
      const urlParts = item.url.split("/").filter(Boolean);
      const path = urlParts.slice(1).join("/"); // Remove the first part (admin/recruiter/candidate)

      routes.push({
        path: path || "dashboard",
        element: <item.component />,
      });
    });
  });

  return routes;
}