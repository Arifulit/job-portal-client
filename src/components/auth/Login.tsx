/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// LOGIN.TSX - Professional Login Component
// ============================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Eye, EyeOff, Briefcase, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const { data } = await axios.post(`${API_BASE}/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    },
    onSuccess: (data: any) => {
      const token = data.token ?? data.access_token ?? data?.data?.token;
      const user = data.user ?? data?.data?.user ?? data;

      if (token) {
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
      }

      try {
        if (typeof login === "function") login(user, token);
      } catch {}

      toast.success("Welcome back! Login successful");

      const roleStr = (user?.role ?? data.role ?? "").toString().toLowerCase();

      if (roleStr === "admin") {
        navigate("/admin/dashboard");
      } else if (roleStr === "employer") {
        navigate("/employer/dashboard");
      } else if (roleStr === "job_seeker" || roleStr === "jobseeker") {
        navigate("/jobseeker/dashboard");
      } else {
        navigate("/");
      }
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || error?.message || "Login failed";
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl mb-6 relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-3xl blur-lg opacity-60 group-hover:opacity-80 transition-opacity" />
            <Briefcase className="w-10 h-10 text-white relative z-10" strokeWidth={2.5} />
          </div>
          
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent mb-4 leading-tight">
            Welcome Back
          </h1>
          
          <p className="text-gray-600 text-lg font-medium">
            Continue your professional journey
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
          <div className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-600" />
                Email Address
              </Label>
              <div className="relative group">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="h-12 px-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600" />
                Password
              </Label>
              <div className="relative group">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="h-12 px-4 pr-12 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors focus:outline-none"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 transition-colors"
                />
                <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-600 transition-colors">
                  Remember me
                </span>
              </label>

              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-all"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <Button 
                type="submit" 
                onClick={handleSubmit}
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-700 hover:via-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing you in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative px-8 py-6 bg-gray-50/50">
            <div className="absolute inset-0 flex items-center px-8">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gray-50/50 text-sm font-medium text-gray-500">
                New to CareerCode?
              </span>
            </div>
          </div>

          {/* Register Link */}
          <div className="p-8 pt-0">
            <Link
              to="/register"
              className="flex items-center justify-center w-full h-12 px-6 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 transition-all group"
            >
              Create New Account
              <Sparkles className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Security Badge */}
        <p className="text-center text-sm text-gray-500 mt-8 flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Protected by 256-bit SSL encryption
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}

export default Login;

