/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

type Role = "seeker" | "employer";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  companyName?: string;
}

export interface AuthContextValue {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  register: (data: RegisterPayload) => Promise<any>;
  login: (user: any, token?: string | null) => void;
  logout: () => void;
}

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("token");
    } catch {
      return null;
    }
  });

  const [user, setUser] = useState<any | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      localStorage.setItem("token", token);
    } else {
      delete axios.defaults.headers.common["Authorization"];
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = (u: any, t?: string | null) => {
    if (t) setToken(t);
    setUser(u ?? null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } catch {
      /* ignore */
    }
  };

  const register = async (data: RegisterPayload) => {
    const mappedRole = data.role === "seeker" ? "job_seeker" : "employer";

    const payload = {
      email: data.email,
      password: data.password,
      full_name: data.name,
      role: mappedRole,
      phone: data.phone,
      company_name: data.companyName,
    };

    const res = await axios.post(`${API_BASE}/auth/register`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const respData = res.data;

    // If backend returns token/user, persist and update context
    const respToken = respData?.token ?? respData?.access_token ?? null;
    const respUser = respData?.user ?? respData?.data ?? respData ?? null;

    if (respToken) setToken(respToken);
    if (respUser) setUser(respUser);

    return respData;
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token || !!user,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};