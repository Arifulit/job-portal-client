// এই ফাইলটি authentication state, login/register/logout এবং user session management পরিচালনা করে।
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

type Role = 'candidate' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  profileImage?: string;
  phone?: string;
  biodata?: string;
  location?: string;
  skills?: string[];
  designation?: string;
  agency?: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: 'candidate' | 'recruiter';
  phone?: string;
  biodata?: string;
  location?: string;
  skills?: string[];
  designation?: string;
  agency?: string;
  companyName?: string;
  yearOfEstablishment?: number;
  companyAddress?: string;
  industryType?: string;
  websiteUrl?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const normalizeRole = (role: string | undefined): Role => {
  const value = (role || '').toLowerCase();

  if (value === 'admin') {
    return 'admin';
  }

  if (value === 'recruiter') {
    return 'recruiter';
  }

  return 'candidate';
};

const normalizeUser = (input: Partial<User> | undefined): User => ({
  _id: input?._id || '',
  name: input?.name || 'User',
  email: input?.email || '',
  role: normalizeRole(input?.role),
  avatar: input?.avatar,
  profileImage: input?.profileImage,
  phone: input?.phone,
  biodata: input?.biodata,
  location: input?.location,
  skills: input?.skills,
  designation: input?.designation,
  agency: input?.agency,
});

const extractAuthData = (raw: unknown): { token: string; refreshToken?: string; user: User } => {
  const data = (raw || {}) as {
    message?: string;
    data?: {
      accessToken?: string;
      token?: string;
      refreshToken?: string;
      user?: Partial<User>;
    };
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: Partial<User>;
  };

  const token = data.data?.accessToken || data.data?.token || data.accessToken || data.token;
  const refreshToken = data.data?.refreshToken || data.refreshToken;
  const user = normalizeUser(data.data?.user || data.user);

  if (!token) {
    throw new Error(data.message || 'Authentication token is missing from response');
  }

  if (!user.email) {
    throw new Error(data.message || 'User data is missing from response');
  }

  return { token, refreshToken, user };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      return null;
    }

    try {
      return normalizeUser(JSON.parse(storedUser) as Partial<User>);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common.Authorization;
  }, []);

  const persistAuth = useCallback((accessToken: string, userData: User, refreshToken?: string) => {
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, []);

  useEffect(() => {
    const initialize = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${token}`;

      try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const payload = response.data as { data?: { user?: Partial<User> }; user?: Partial<User> };
        const storedUser = (() => {
          try {
            const raw = localStorage.getItem('user');
            if (!raw) return undefined;
            return JSON.parse(raw) as Partial<User>;
          } catch {
            return undefined;
          }
        })();

        const serverUser = normalizeUser(payload.data?.user || payload.user || storedUser || undefined);

        if (!serverUser.email) {
          throw new Error('Session expired. Please login again.');
        }

        setUser(serverUser);
        localStorage.setItem('user', JSON.stringify(serverUser));
      } catch {
        clearAuth();
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [clearAuth, token]);

  const login = useCallback(
    async (email: string, password: string): Promise<User> => {
      setLoading(true);

      try {
        const response = await axios.post(`${API_BASE}/auth/login`, {
          email: email.trim().toLowerCase(),
          password: password.trim(),
        });

        const { token: accessToken, refreshToken, user: userData } = extractAuthData(response.data);
        persistAuth(accessToken, userData, refreshToken);
        return userData;
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Login failed. Please check your credentials.'));
      } finally {
        setLoading(false);
      }
    },
    [persistAuth]
  );

  const register = useCallback(
    async (payload: RegisterPayload): Promise<User> => {
      setLoading(true);

      try {
        const response = await axios.post(`${API_BASE}/auth/register`, payload);
        const { token: accessToken, refreshToken, user: userData } = extractAuthData(response.data);
        persistAuth(accessToken, userData, refreshToken);
        return userData;
      } catch (error) {
        throw new Error(getErrorMessage(error, 'Registration failed. Please try again.'));
      } finally {
        setLoading(false);
      }
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    void axios
      .post(`${API_BASE}/auth/logout`, {}, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .catch(() => undefined)
      .finally(() => {
        clearAuth();
        toast.success('You have been logged out successfully', {
          position: 'top-right',
          style: {
            marginTop: '56px',
          },
        });
      });
  }, [clearAuth, token]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) {
        return prev;
      }

      const nextUser = normalizeUser({ ...prev, ...userData });
      localStorage.setItem('user', JSON.stringify(nextUser));
      return nextUser;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isLoading: loading,
      isAuthenticated: !!user && !!token,
      login,
      register,
      logout,
      updateUser,
    }),
    [login, loading, logout, register, token, updateUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
