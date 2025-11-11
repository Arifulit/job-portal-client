import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export default function AdminProfile(): JSX.Element {
  const navigate = useNavigate();
  const { user: ctxUser, logout } = useAuth();

  const tokenPresent = !!ctxUser || !!localStorage.getItem("token");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      // use backend route that returns profile
      const res = await axios.get(`${API_BASE}/auth/profile`);
      // handle various shapes: { data: {...} } or {...}
      return res.data ?? res.data?.data ?? null;
    },
    enabled: tokenPresent,
    staleTime: 5 * 60 * 1000,
  });

  // prefer query result, fallback to context user
  const user = data?.user ?? data ?? ctxUser;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Profile</h1>
          <p className="text-sm text-gray-600">Manage your account and admin tools</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Logout
          </button>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Name</h3>
          <p className="text-lg font-medium text-gray-800">{user?.name ?? user?.full_name ?? user?.email ?? "—"}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Email</h3>
          <p className="text-lg font-medium text-gray-800">{user?.email ?? "—"}</p>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <h3 className="text-sm text-gray-500">Role</h3>
          <p className="text-lg font-medium text-gray-800 capitalize">{user?.role ?? "admin"}</p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link to="/admin/users" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
          <h4 className="text-sm text-gray-500">Users</h4>
          <p className="mt-2 text-xl font-semibold text-gray-800">Manage users</p>
        </Link>

        <Link to="/admin/jobs" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
          <h4 className="text-sm text-gray-500">Jobs</h4>
          <p className="mt-2 text-xl font-semibold text-gray-800">Moderate job posts</p>
        </Link>

        <Link to="/admin/settings" className="block bg-white hover:shadow-lg transition-shadow rounded-lg p-6 border">
          <h4 className="text-sm text-gray-500">Settings</h4>
          <p className="mt-2 text-xl font-semibold text-gray-800">Account & platform settings</p>
        </Link>
      </section>

      <section className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">About</h3>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading profile...</p>
        ) : isError ? (
          <p className="text-sm text-red-600">Failed to load profile details.</p>
        ) : (
          <div className="text-sm text-gray-700">
            <p>
              You are logged in as <strong className="capitalize">{user?.role ?? "admin"}</strong>. Use the links above to
              manage users, review jobs and configure platform settings.
            </p>
            <pre className="mt-4 p-3 bg-gray-50 rounded text-xs overflow-x-auto">
              {JSON.stringify(user ?? {}, null, 2)}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}