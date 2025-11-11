/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
import HomePage from "../public/Home"; // Changed from { Home }
import About from "../public/About";
import Features from "../public/Features";
import ContactPage from "../public/Contact";
import FAQ from "../public/FAQ";
import { Login } from "../components/auth/Login";
import { Register } from "../components/auth/Register";
import Unauthorized from "../pages/status/Unauthorized";
import NotFound from "../pages/status/NotFound";
import DashboardLayout from "../components/layout/DashboardLayout";
import MainLayout from "../components/layout/MainLayout";
import { withAuth } from "../utils/withAuth";
import { generateRoutes } from "../utils/generateRoutes";
import { adminSidebarItems } from "./adminSidebarItems";
import { employerSidebarItems } from "./employerSidebarItems";
import { userSidebarItems } from "./userSidebarItems";

// Simple inline RouteError component used as errorElement fallback
function RouteError({ error }: { error?: unknown }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    </div>
  );
}

// Create authenticated layout components
const AdminDashboardLayout = withAuth(DashboardLayout, "admin");
const EmployerDashboardLayout = withAuth(DashboardLayout, "employer");
const JobSeekerDashboardLayout = withAuth(DashboardLayout, "jobseeker");

export const router = createBrowserRouter([
  // Public Routes with MainLayout (Navbar + Footer)
  {
    path: "/",
    Component: MainLayout,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "features",
        element: <Features />,
      },
      {
        path: "contact",
        element: <ContactPage />,
      },
      {
        path: "faq",
        element: <FAQ />,
      },
    ],
  },

  // Authentication Routes (No Layout)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },

  // Admin Routes (DashboardLayout)
  {
    path: "/admin",
    Component: AdminDashboardLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      ...generateRoutes(adminSidebarItems),
    ],
  },

  // Employer Routes (DashboardLayout)
  {
    path: "/employer",
    Component: EmployerDashboardLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/employer/dashboard" replace /> },
      ...generateRoutes(employerSidebarItems),
    ],
  },

  // Job Seeker Routes (DashboardLayout)
  {
    path: "/jobseeker",
    Component: JobSeekerDashboardLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/jobseeker/dashboard" replace /> },
      ...generateRoutes(userSidebarItems),
    ],
  },

  // Alternative User Route (redirects to jobseeker)
  {
    path: "/user",
    element: <Navigate to="/jobseeker" replace />,
  },

  // Status Routes (No Layout)
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;