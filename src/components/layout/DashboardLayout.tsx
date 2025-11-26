
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Menu, Search, Bell, User, Settings, LogOut, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '../ui/avatar';
import {
  Sheet,
  SheetContent,
} from '../ui/sheet';
import { Button } from '../ui/button';
import { adminSidebarItems } from '@/routes/adminSidebarItems';
import { recruiterSidebarItems } from '@/routes/recruiterSidebarItems';
import { userSidebarItems } from '@/routes/userSidebarItems';

interface ISidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    icon?: React.ComponentType<{ className?: string }>;
    component?: React.ComponentType;
  }[];
}

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const getSidebarItems = (): ISidebarItem[] => {
    if (!user) return [];
    switch (user.role) {
      case 'admin':
        return adminSidebarItems;
      case 'recruiter':
        return recruiterSidebarItems;
      case 'candidate':
        return userSidebarItems;
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/login');
    } finally {
      setDropdownOpen(false);
    }
  };

  const isActiveRoute = (url: string) => {
    if (!url) return false;
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    if (user.name) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0][0].toUpperCase();
    }
    return user.email?.[0].toUpperCase() || 'U';
  };

  const getUserFullName = () => {
    return user?.name || user?.email?.split('@')[0] || 'User';
  };

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

  const ControlledAvatarImage: React.FC<{ src?: string; alt?: string }> = ({ src, alt }) => {
    const [show, setShow] = useState(!!src);
    if (!src || !show) return null;

    const imageSrc = src.startsWith('http') ? src : `${API_BASE}${src.startsWith('/') ? '' : '/'}${src}`;

    return (
      <AvatarImage
        src={imageSrc}
        alt={alt}
        onError={() => setShow(false)}
        className="object-cover"
      />
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
            <Home className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            JobPortal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {sidebarItems.map((section, i) => (
          <div key={i} className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, j) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.url);
                return (
                  <Link
                    key={j}
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'bg-blue-50 text-blue-700 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {Icon && <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-gray-500'}`} />}
                    <span>{item.title}</span>
                    {active && <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
          <Avatar className="h-10 w-10 ring-2 ring-blue-100">
            <ControlledAvatarImage src={user?.profileImage} alt={getUserFullName()} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{getUserFullName()}</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
          <p className="bg-white font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-600 hidden sm:block">
                Welcome back, <span className="font-medium">{getUserFullName()}</span>
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="hidden sm:flex">
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  className="h-9 w-9 rounded-full p-0 overflow-hidden"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Avatar className="h-9 w-9">
                    <ControlledAvatarImage src={user?.profileImage} alt={getUserFullName()} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56  rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-900 truncate">{getUserFullName()}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <User className="w-4 h-4" /> Profile
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4" /> Settings
                      </Link>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;