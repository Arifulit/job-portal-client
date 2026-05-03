
// এই ফাইলটি authentication state, login/register/logout এবং user session management পরিচালনা করে।
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

// Production এ secure:true, development এ false — localhost এ secure:true কাজ করে না
const IS_PROD = import.meta.env.PROD;

// sameSite: 'lax' দিলে Google redirect এর পরেও cookie থাকে।
// 'strict' দিলে cross-origin navigation এ cookie block হয়।
const COOKIE_OPTIONS: Cookies.CookieAttributes = {
  expires: 7,
  secure: IS_PROD,
  sameSite: 'lax',
};

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
  resume?: string;
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
  setUserFromToken: (token: string, refreshToken?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

const normalizeRole = (role: string | undefined): Role => {
  const v = (role || '').toLowerCase();
  if (v === 'admin') return 'admin';
  if (v === 'recruiter') return 'recruiter';
  return 'candidate';
};

type ProviderUser = Partial<User> & {
  id?: string;
  fullName?: string;
  emailAddress?: string;
  picture?: string;
  photo?: string;
};

const decodeJwtPayload = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4);
    const parsed = atob(padded);
    return JSON.parse(parsed) as Record<string, unknown>;
  } catch {
    return null;
  }
};

const fallbackUserFromToken = (token: string): User | null => {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const email = String(payload.email || payload.emailAddress || payload.sub || '');
  const name = String(payload.name || payload.fullName || payload.username || 'User');

  if (!email) {
    return null;
  }

  return normalizeUser({
    _id: String(payload._id || payload.id || payload.userId || payload.sub || email),
    name,
    email,
    role: normalizeRole(String(payload.role || payload.userRole || 'candidate')),
    avatar: String(payload.picture || payload.photo || ''),
    profileImage: String(payload.picture || payload.photo || ''),
  });
};

const normalizeUser = (input: ProviderUser | undefined): User => {
  const picture = input?.picture || input?.photo || input?.profileImage || input?.avatar;
  return {
    _id: input?._id || input?.id || '',
    name: input?.name || input?.fullName || 'User',
    email: input?.email || input?.emailAddress || '',
    role: normalizeRole(input?.role),
    avatar: input?.avatar || picture || undefined,
    profileImage: input?.profileImage || picture || undefined,
    phone: input?.phone,
    biodata: input?.biodata,
    location: input?.location,
    skills: input?.skills,
    designation: input?.designation,
    agency: input?.agency,
  };
};

const extractAuthData = (raw: unknown): { token: string; refreshToken?: string; user: User } => {
  const data = (raw || {}) as {
    message?: string;
    data?: { accessToken?: string; token?: string; refreshToken?: string; user?: Partial<User> };
    token?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: Partial<User>;
  };

  const token = data.data?.accessToken || data.data?.token || data.accessToken || data.token;
  const refreshToken = data.data?.refreshToken || data.refreshToken;
  const user = normalizeUser(data.data?.user || data.user);

  if (!token) throw new Error(data.message || 'Authentication token is missing from response');
  if (!user.email) throw new Error(data.message || 'User data is missing from response');

  return { token, refreshToken, user };
};

// ─── Cookie & storage utils ───────────────────────────────────────
const saveTokens = (accessToken: string, refreshToken?: string) => {
  Cookies.set('accessToken', accessToken, COOKIE_OPTIONS);
  localStorage.setItem('token', accessToken);
  if (refreshToken) {
    Cookies.set('refreshToken', refreshToken, COOKIE_OPTIONS);
    localStorage.setItem('refreshToken', refreshToken);
  }
};

const clearTokens = () => {
  Cookies.remove('accessToken');
  Cookies.remove('refreshToken');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};

const getStoredToken = (): string | null =>
  Cookies.get('accessToken') || localStorage.getItem('token') || null;

// ─── Provider ─────────────────────────────────────────────────────
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? normalizeUser(JSON.parse(raw) as Partial<User>) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(getStoredToken);
  const [loading, setLoading] = useState<boolean>(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setToken(null);
    clearTokens();
    delete axios.defaults.headers.common.Authorization;
  }, []);

  const persistAuth = useCallback((accessToken: string, userData: User, refreshToken?: string) => {
    setToken(accessToken);
    setUser(userData);
    saveTokens(accessToken, refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  }, []);

  // Google OAuth success — refreshToken optional parameter
  const setUserFromToken = useCallback(
    async (newToken: string, refreshToken?: string) => {
      // /auth/me call এর আগেই token save করো
      setToken(newToken);
      saveTokens(newToken, refreshToken);
      axios.defaults.headers.common.Authorization = `Bearer ${newToken}`;

      try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${newToken}` },
        });
        const payload = response.data as {
          data?: { user?: Partial<User> };
          user?: Partial<User>;
        };
        const userData = normalizeUser(payload.data?.user || payload.user);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        const fallbackUser = fallbackUserFromToken(newToken);

        if (fallbackUser) {
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          return;
        }

        clearAuth();
        throw err;
      }
    },
    [clearAuth]
  );

  useEffect(() => {
    const initialize = async () => {
      const currentToken = getStoredToken();

      if (!currentToken) {
        setLoading(false);
        return;
      }

      axios.defaults.headers.common.Authorization = `Bearer ${currentToken}`;

      try {
        const response = await axios.get(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        const payload = response.data as {
          data?: { user?: Partial<User> };
          user?: Partial<User>;
        };
        const storedUserRaw = (() => {
          try {
            const raw = localStorage.getItem('user');
            return raw ? (JSON.parse(raw) as Partial<User>) : undefined;
          } catch { return undefined; }
        })();

        const serverUser = normalizeUser(payload.data?.user || payload.user || storedUserRaw);
        if (!serverUser.email) throw new Error('Session expired.');

        setUser(serverUser);
        setToken(currentToken);
        localStorage.setItem('user', JSON.stringify(serverUser));
      } catch {
        const fallbackUser = fallbackUserFromToken(currentToken);

        if (fallbackUser) {
          setUser(fallbackUser);
          setToken(currentToken);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        } else {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    void initialize();
  }, [clearAuth]);

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
      .post(
        `${API_BASE}/auth/logout`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      )
      .catch(() => undefined)
      .finally(() => {
        clearAuth();
        toast.success('You have been logged out successfully', {
          position: 'top-right',
          style: { marginTop: '56px' },
        });
      });
  }, [clearAuth, token]);

  const updateUser = useCallback((userData: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = normalizeUser({ ...prev, ...userData });
      localStorage.setItem('user', JSON.stringify(next));
      return next;
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
      setUserFromToken,
    }),
    [login, loading, logout, register, token, updateUser, user, setUserFromToken]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};