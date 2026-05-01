/* eslint-disable @typescript-eslint/no-unused-vars */
// এই ফাইলটি authentication related form, input validation ও submit behavior সামলায়।
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import Cookies from "js-cookie";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Briefcase, Mail, Lock, ArrowRight } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export function Login() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const googleLoginUrl = `${API_BASE}/auth/google?redirect=${encodeURIComponent(window.location.origin + "/auth/google/success?redirect=/")}`;

  const getRedirectPath = (role?: string) => {
    const normalizedRole = String(role || '').toLowerCase();

    if (normalizedRole === 'admin') return '/admin/dashboard';
    if (normalizedRole === 'recruiter') return '/recruiter/dashboard';
    return '/';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const loggedInUser = await login(formData.email, formData.password);

      // After login, tokens are already set in cookies by AuthContext (if you update persistAuth)
      toast.success("Welcome back! Login successful");
      navigate(getRedirectPath(loggedInUser.role));
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleGoogleLogin = () => {
    window.location.href = googleLoginUrl;
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_36%),linear-gradient(180deg,_#f8fbff_0%,_#eef3ff_100%)] dark:bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl mb-6 ring-1 ring-blue-200/60 dark:ring-blue-400/20">
            <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
            Welcome Back
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            Sign in to continue your journey
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/95 dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
            <h2 className="text-xl font-bold text-white">Sign In</h2>
            <p className="text-blue-100 text-sm mt-1">Enter your credentials to access your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5" autoComplete="off">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full h-11 pl-10 pr-4 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  spellCheck={false}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full h-11 pl-10 pr-12 border border-slate-300 dark:border-slate-700 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-400">or continue with</span>
              </div>
            </div>

            <Button
              type="button"
              disabled={loading}
              onClick={handleGoogleLogin}
              className="w-full h-11 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-lg shadow-sm transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-100 dark:border-slate-700"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.07-1.41-.2-2.08H12z" />
                <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.3-2.56c-.91.61-2.08.97-3.33.97-2.56 0-4.73-1.73-5.5-4.05l-3.41 2.64C4.75 19.85 8.08 22 12 22z" />
                <path fill="#4A90E2" d="M6.5 13.92A6.02 6.02 0 016.18 12c0-.67.12-1.32.32-1.92l-3.41-2.64A9.99 9.99 0 002 12c0 1.6.38 3.1 1.09 4.44l3.41-2.52z" />
                <path fill="#FBBC05" d="M12 6.03c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.96 3.07 14.7 2 12 2 8.08 2 4.75 4.15 3.09 7.44l3.41 2.64c.77-2.32 2.94-4.05 5.5-4.05z" />
              </svg>
              Continue with Google
            </Button>

            {/* Register Link */}
            <div className="text-center pt-3">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Create Account
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secured with 256-bit SSL encryption
        </p>
      </div>
    </div>
  );
}