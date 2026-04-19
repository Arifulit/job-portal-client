// এই ফাইলটি project wide helper, route utility অথবা shared function প্রদান করে।
// ========== withAuth.tsx ==========
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ComponentType } from "react";

export function withAuth<P extends object>(
  Component: ComponentType<P>,
  requiredRole?: string
) {
  const normalizeRole = (role: string): string => {
    const value = role.toLowerCase();

    if (value === 'candidate') {
      return 'candidate';
    }

    return value;
  };

  return function ProtectedComponent(props: P) {
    const { isAuthenticated, user, loading } = useAuth();

    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (requiredRole) {
      const normalizedUserRole = normalizeRole(user?.role || '');
      const normalizedRequired = normalizeRole(requiredRole);

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