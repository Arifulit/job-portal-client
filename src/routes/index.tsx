// এই ফাইলটি সব route, layout এবং protected navigation configuration নির্ধারণ করে।
/* eslint-disable react-refresh/only-export-components */
import * as React from 'react';
import { createBrowserRouter, Navigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import MainLayout from "../components/layout/MainLayout";
import { useAuth } from "../context/AuthContext";
import { withAuth } from "../utils/withAuth";
import { generateRoutes } from "../utils/generateRoutes";
import { adminSidebarItems } from "./adminSidebarItems";
import { recruiterSidebarItems } from "./recruiterSidebarItems";
import { userSidebarItems } from "./userSidebarItems";

const HomePage = React.lazy(() => import("../public/Home"));
const About = React.lazy(() => import("../public/About"));
const Features = React.lazy(() => import("../public/Features"));
const ContactPage = React.lazy(() => import("../public/Contact"));
const FAQ = React.lazy(() => import("../public/FAQ"));
const Jobs = React.lazy(() => import("../pages/Job/Jobs"));
const JobDetails = React.lazy(() => import("../pages/Job/JobDetails"));
const CompanyProfile = React.lazy(() => import("../pages/Company/CompanyProfile"));
const ApplyPage = React.lazy(() => import("../pages/Application/ApplyPage"));
const ResourceDetails = React.lazy(() => import("../pages/resources/ResourceDetails"));
const Register = React.lazy(() => import("../components/auth/Register"));
const RecruiterRegister = React.lazy(() => import("../components/auth/RecruiterRegister"));
const Login = React.lazy(() =>
  import("../components/auth/Login").then((module) => ({ default: module.Login }))
);
const GoogleSuccess = React.lazy(() => import("../components/auth/GoogleSuccess").then((m) => ({ default: m.default })));
const Unauthorized = React.lazy(() => import("../pages/status/Unauthorized"));
const NotFound = React.lazy(() => import("../pages/status/NotFound"));
const JobPost = React.lazy(() => import("../pages/Recruiter/JobPost"));

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

const RouteLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
  </div>
);

function DashboardResolver() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user?.role || '').toLowerCase();

  if (role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (role === 'recruiter') {
    return <Navigate to="/recruiter/dashboard" replace />;
  }

  return <Navigate to="/candidate/dashboard" replace />;
}

const withSuspense = (element: React.ReactElement) => (
  <React.Suspense fallback={<RouteLoader />}>{element}</React.Suspense>
);

// Create authenticated layout components
const AdminDashboardLayout = withAuth(DashboardLayout, "admin");
const recruiterDashboardLayout = withAuth(DashboardLayout, "recruiter");
const candidateDashboardLayout = withAuth(DashboardLayout, "candidate");

export const router = createBrowserRouter([
  // Public Routes with MainLayout (Navbar + Footer)
  {
    path: "/",
    Component: MainLayout,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        element: withSuspense(<HomePage />),
      },
      {
        path: "login",
        element: withSuspense(<Login />),
      },
      {
        path: "auth/google/success",
        element: withSuspense(<GoogleSuccess />),
      },
      {
        path: "dashboard",
        element: withSuspense(<DashboardResolver />),
      },
      {
        path: "register",
        element: <Navigate to="/register/candidate" replace />,
      },
      {
        path: "register/candidate",
        element: withSuspense(<Register />),
      },
      {
        path: "register/recruiter",
        element: withSuspense(<RecruiterRegister />),
      },
      {
        path: "about",
        element: withSuspense(<About />),
      },
      {
        path: "features",
        element: withSuspense(<Features />),
      },
      {
        path: "contact",
        element: withSuspense(<ContactPage />),
      },
      {
        path: "faq",
        element: withSuspense(<FAQ />),
      },
      {
        path: "jobs",
        element: withSuspense(<Jobs />),
      },
      {
        path: "candidate/jobs",
        element: <Navigate to="/jobs" replace />,
      },
      {
        path: "jobs/:id",
        element: withSuspense(<JobDetails />),
      },
      {
        path: "company/:id/profile",
        element: withSuspense(<CompanyProfile />),
      },
      {
        path: "candidate/jobs/:id",
        element: withSuspense(<JobDetails />),
      },
      {
        path: "jobs/:jobId/apply",
        element: withSuspense(<ApplyPage />),
      },
      {
        path: "resources/:id",
        element: withSuspense(<ResourceDetails />),
      },
      {
        path: "unauthorized",
        element: withSuspense(<Unauthorized />),
      },
      {
        path: "*",
        element: withSuspense(<NotFound />),
      },
    ],
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

  // recruiter Routes (DashboardLayout)
  {
    path: "/recruiter",
    Component: recruiterDashboardLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/recruiter/dashboard" replace /> },
      { path: "jobs/edit/:jobId", element: withSuspense(<JobPost />) },
      ...generateRoutes(recruiterSidebarItems),
    ],
  },

  // Candidate Routes (DashboardLayout)
  {
    path: "/candidate",
    Component: candidateDashboardLayout,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <Navigate to="/candidate/dashboard" replace /> },
      ...generateRoutes(userSidebarItems),
    ],
  },

  // Alternative User Route (redirects to candidate)
  {
    path: "/user",
    element: <Navigate to="/candidate" replace />,
  },

]);

export default router;