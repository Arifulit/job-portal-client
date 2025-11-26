// // /* eslint-disable @typescript-eslint/no-explicit-any */


// import React, { createContext, useContext, useState, useEffect } from 'react';
// import axios from 'axios';
// import bcrypt from 'bcryptjs';

// const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

// // Set axios defaults
// axios.defaults.baseURL = API_BASE;

// type Role = 'candidate' | 'recruiter' | 'admin';

// export interface User {
//   id: string;
//   email: string;
//   name: string;
//   role: Role;
//   phone?: string;
//   companyName?: string;
//   profileImage?: string;
//   skills?: string[];
//   designation?: string;
//   agency?: string;
// }

// interface AuthContextValue {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   login: (email: string, password: string) => Promise<User>;
//   logout: () => Promise<void>;
//   register: (data: any) => Promise<User>;
//   hasRole: (role: Role | Role[]) => boolean;
//   loading: boolean;
// }

// const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(() => {
//     const storedUser = localStorage.getItem('user');
//     return storedUser ? JSON.parse(storedUser) : null;
//   });
  
//   const [token, setToken] = useState<string | null>(() => {
//     return localStorage.getItem('token');
//   });
  
//   const [loading, setLoading] = useState(true);

//   // Set auth token in axios headers and initialize auth state
//   useEffect(() => {
//     const initializeAuth = async () => {
//       const token = localStorage.getItem('token');
//       if (token) {
//         try {
//           // Verify token with backend
//           const response = await axios.get('/auth/me', {
//             headers: { Authorization: `Bearer ${token}` }
//           });
          
//           if (response.data.user) {
//             setUser(response.data.user);
//             setToken(token);
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//           } else {
//             // Token is invalid, clear auth state
//             clearAuth();
//           }
//         } catch (error) {
//           console.error('Failed to verify token:', error);
//           clearAuth();
//         }
//       }
//       setLoading(false);
//     };

//     initializeAuth();
//   }, []);

//   const clearAuth = () => {
//     setUser(null);
//     setToken(null);
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     delete axios.defaults.headers.common['Authorization'];
//   };

//   const login = async (email: string, password: string): Promise<User> => {
//     try {
//       setLoading(true);
      
//       // Send the plain password to the server for hashing
//       const response = await axios.post(`${API_BASE}/auth/login`, { 
//         email: email.trim(),
//         password: password // Send plain password, let server handle hashing
//       }, {
//         headers: { 
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });
      
//       console.log('Raw login response:', response);
//       const responseData = response.data;
//       let authToken, userData;

//       // Handle the specific response format we're getting
//       if (responseData.success && responseData.data) {
//         // Extract tokens and user data from the response
//         authToken = responseData.data.accessToken || responseData.data.token;
//         userData = responseData.data.user;
        
//         // If we have a refresh token, store it as well
//         if (responseData.data.refreshToken) {
//           localStorage.setItem('refreshToken', responseData.data.refreshToken);
//         }
        
//         console.log('Extracted token and user:', { authToken, userData });
//       } else if (responseData.token) {
//         authToken = responseData.token;
//         userData = responseData.user || responseData;
//       } else {
//         // If no known format matches, try to extract token from root level
//         console.log('No standard format found, checking root level for token');
//         authToken = responseData.token || responseData.access_token;
//         userData = responseData.user || {
//           email: email,
//           name: email.split('@')[0],
//           role: 'candidate'
//         };
        
//         if (!authToken) {
//           console.error('No token found in any expected location:', responseData);
//           throw new Error('Authentication token is missing from the response. Please check the server response format.');
//         }
//       }
      
//       if (!authToken) {
//         throw new Error('Authentication token is missing from the response');
//       }

//       // Ensure user data has required fields
//       if (!userData) {
//         userData = { 
//           email: email,
//           name: email.split('@')[0],
//           role: 'candidate'
//         };
//       }
      
//       // Set auth state
//       setToken(authToken);
//       setUser(userData);
      
//       // Persist to localStorage
//       localStorage.setItem('token', authToken);
//       localStorage.setItem('user', JSON.stringify(userData));
      
//       // Set default auth header
//       axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
//       return userData;
//     } catch (error: any) {
//       let errorMessage = 'Login failed. Please check your credentials.';
      
//       if (error.response) {
//         // Handle different HTTP error statuses
//         const { status, data } = error.response;
        
//         if (status === 400) {
//           errorMessage = data?.message || 'Invalid email or password format';
//         } else if (status === 401) {
//           errorMessage = 'Invalid email or password';
//         } else if (status >= 500) {
//           errorMessage = 'Server error. Please try again later.';
//         } else {
//           errorMessage = data?.message || errorMessage;
//         }
//       } else if (error.request) {
//         errorMessage = 'No response from server. Please check your connection.';
//       }
      
//       console.error('Login error:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status
//       });
      
//       throw new Error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = async (): Promise<void> => {
//     try {
//       // Call backend logout endpoint if we have a token
//       if (token) {
//         await axios.post('/auth/logout', {}, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//       // Continue with client-side cleanup even if server logout fails
//     } finally {
//       // Clear auth state
//       clearAuth();
      
//       // Redirect to login
//       window.location.href = '/login';
//     }
//   };

//   const register = async (data: any): Promise<User> => {
//     try {
//       setLoading(true);
//       const response = await axios.post('/auth/register', data);
//       const { token: authToken, user: userData } = response.data;
      
//       // Store token and user in state
//       setToken(authToken);
//       setUser(userData);
      
//       // Save to localStorage
//       localStorage.setItem('token', authToken);
//       localStorage.setItem('user', JSON.stringify(userData));
      
//       // Set default auth header for axios
//       axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
//       return userData;
//     } catch (error) {
//       console.error('Registration failed:', error);
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const hasRole = (role: Role | Role[]): boolean => {
//     if (!user) return false;
//     if (Array.isArray(role)) {
//       return role.includes(user.role);
//     }
//     return user.role === role;
//   };

//   const value = {
//     user,
//     token,
//     isAuthenticated: !!user,
//     login,
//     logout,
//     register,
//     hasRole,
//     loading
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// };

// export const useAuth = (): AuthContextValue => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export default AuthContext;
// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

type Role = 'candidate' | 'recruiter' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  skills?: string[];
  designation?: string;
  agency?: string;
}

interface AuthResponse {
  data: {
    accessToken: string;
    user: User;
    refreshToken?: string;
  };
  message?: string;
  success: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);



useEffect(() => {
  const initializeAuth = () => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // Set the token and user immediately
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        
        // Verify token in the background
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error initializing auth:', error);
        clearAuth();
      }
    } else {
      setLoading(false);
    }
  };

  const verifyToken = async (token: string) => {
    try {
      await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Token is valid, keep user logged in
      setLoading(false);
    } catch (error) {
      console.error('Token verification failed:', error);
      clearAuth();
    }
  };

  initializeAuth();
}, []);
  

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await axios.post<AuthResponse>(`${API_BASE}/auth/login`, {
        email: email.trim().toLowerCase(),
        password: password.trim(),
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      const { data } = response;
      
      if (!data.success || !data.data?.accessToken || !data.data?.user) {
        throw new Error(data.message || 'Authentication failed');
      }

      const { accessToken, user: userData, refreshToken } = data.data;

      // Update state and storage
      setToken(accessToken);
      setUser(userData);
      localStorage.setItem('token', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set default auth header
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      // Store refresh token if available
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }

      return userData;
    } catch (error) {
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message?: string }>;
        errorMessage = axiosError.response?.data?.message || errorMessage;
        
        // Handle specific status codes
        if (axiosError.response?.status === 401) {
          errorMessage = 'Invalid email or password.';
        } else if (axiosError.response?.status === 400) {
          errorMessage = 'Invalid input. Please check your email and password.';
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Call logout API if needed
    axios.post(`${API_BASE}/auth/logout`).catch(console.error);
    clearAuth();
    toast.success('You have been logged out successfully');
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        login, 
        logout,
        isAuthenticated: !!user && !!token
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};