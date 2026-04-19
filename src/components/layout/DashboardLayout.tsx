// এই ফাইলটি app layout (navbar/sidebar/footer/outlet) structure নিয়ন্ত্রণ করে।

import React, { useState, useRef, useEffect } from 'react';
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { Menu, Search, Bell, User, LogOut, Home, ChevronRight, Sun, Moon, Compass } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';
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
import { prefetchRoute } from '@/routes/prefetch';

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
  const { user, logout, loading } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const flatSidebarItems = sidebarItems.flatMap((section) =>
    section.items.map((item) => ({ ...item, section: section.title }))
  );
  const commandItems = flatSidebarItems.filter((item, index, arr) => {
    return arr.findIndex((entry) => entry.url === item.url) === index;
  });

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
      navigate('/');
    } finally {
      setDropdownOpen(false);
    }
  };

  const isActiveRoute = (url: string) => {
    if (!url) return false;
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  const getBestActiveUrl = (items: ISidebarItem['items']) => {
    const matches = items
      .map((item) => item.url)
      .filter((url) => isActiveRoute(url))
      .sort((a, b) => b.length - a.length);

    return matches[0] || '';
  };

  const activeSidebarItem = flatSidebarItems
    .filter((item) => isActiveRoute(item.url))
    .sort((a, b) => b.url.length - a.url.length)[0];

  const activeSectionTitle = activeSidebarItem?.section || 'Dashboard';
  const activePageTitle = activeSidebarItem?.title || 'Overview';
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

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

  const normalizedRole = String(user?.role || '').toLowerCase();
  const profileLink =
    normalizedRole === 'admin'
      ? '/admin/profile'
      : normalizedRole === 'recruiter'
      ? '/recruiter/profile'
      : '/candidate/profile';

  const avatarSource =
    (user as { profileImage?: string; avatar?: string } | null)?.profileImage ||
    (user as { profileImage?: string; avatar?: string } | null)?.avatar ||
    '';

  const handleProfileNavigate = () => {
    setDropdownOpen(false);
    setSidebarOpen(false);
    navigate(profileLink);
  };

  const handleSidebarNavigate = (url: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setDropdownOpen(false);
    setSidebarOpen(false);
    navigate(url);
  };

  const openCommandPalette = () => {
    setCommandOpen(true);
  };

  const closeCommandPalette = () => {
    setCommandOpen(false);
    setCommandQuery('');
  };

  const handleCommandNavigate = (url: string) => {
    closeCommandPalette();
    setDropdownOpen(false);
    setSidebarOpen(false);
    navigate(url);
  };

  const normalizedCommandQuery = commandQuery.trim().toLowerCase();
  const filteredCommandItems = commandItems
    .filter((item) => {
      if (!normalizedCommandQuery) return true;
      return (
        item.title.toLowerCase().includes(normalizedCommandQuery) ||
        item.section.toLowerCase().includes(normalizedCommandQuery) ||
        item.url.toLowerCase().includes(normalizedCommandQuery)
      );
    })
    .slice(0, 8);

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

  useEffect(() => {
    const handleKeyboardOpen = (event: KeyboardEvent) => {
      const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
      if (isCommandShortcut) {
        event.preventDefault();
        openCommandPalette();
      }

      if (event.key === 'Escape' && commandOpen) {
        closeCommandPalette();
      }
    };

    document.addEventListener('keydown', handleKeyboardOpen);
    return () => document.removeEventListener('keydown', handleKeyboardOpen);
  }, [commandOpen]);

  useEffect(() => {
    if (commandOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
  }, [commandOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-slate-800">
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
            {(() => {
              const bestActiveUrl = getBestActiveUrl(section.items);

              return (
                <>
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, j) => {
                const Icon = item.icon;
                const active = bestActiveUrl ? bestActiveUrl === item.url : isActiveRoute(item.url);
                return (
                  <Link
                    key={j}
                    to={item.url}
                    onClick={handleSidebarNavigate(item.url)}
                    onMouseEnter={() => prefetchRoute(item.url)}
                    onFocus={() => prefetchRoute(item.url)}
                    className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm'
                        : 'text-gray-700 dark:text-slate-300'
                    }`}
                  >
                    {Icon && <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500 dark:text-slate-400'}`} />}
                    <span>{item.title}</span>
                    <span className="ml-auto w-2 h-2 shrink-0 rounded-full bg-transparent" />
                    {active && <span className="absolute right-3 h-2 w-2 rounded-full bg-blue-600" />}
                  </Link>
                );
              })}
            </div>
                </>
              );
            })()}
          </div>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <button
          type="button"
          onClick={handleProfileNavigate}
          className="flex w-full items-center gap-3 rounded-lg p-3 text-left"
        >
          <Avatar className="h-10 w-10 ring-2 ring-blue-100">
            <ControlledAvatarImage src={avatarSource} alt={getUserFullName()} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-slate-100 truncate">{getUserFullName()}</p>
            <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              {user?.role}
            </p>
          </div>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-300 border-t-blue-600 mx-auto mb-4" />
          <p className="bg-white dark:bg-slate-900 dark:text-slate-100 font-medium">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen overflow-x-clip bg-gray-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-slate-900 border-r-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 dark:shadow-black/10">
          <div className="flex items-center justify-between px-4 py-3 lg:px-8">
            <div className="flex min-w-0 items-center gap-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="min-w-0">
                <div className="hidden items-center gap-2 text-xs font-medium text-gray-500 dark:text-slate-400 sm:flex">
                  <span>{activeSectionTitle}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-gray-700 dark:text-slate-300">{activePageTitle}</span>
                </div>
                <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-slate-100">{activePageTitle}</h1>
                <p className="hidden text-xs text-gray-500 dark:text-slate-400 sm:block">
                  Welcome back, {getUserFullName()} • {currentDate}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={openCommandPalette}
                className="hidden items-center rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-left shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:border-slate-600 dark:hover:bg-slate-700/60 lg:flex"
              >
                <Search className="mr-2 h-4 w-4 text-gray-400 dark:text-slate-400" />
                <span className="text-xs text-gray-500 dark:text-slate-400">Search dashboard</span>
                <span className="ml-3 rounded-md border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  Ctrl K
                </span>
              </button>

              <Button
                variant="ghost"
                size="icon"
                onClick={openCommandPalette}
                className="lg:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate('/')}>
                <Compass className="mr-1.5 h-4 w-4" />
                Visit Site
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="hidden sm:inline-flex"
              >
                {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-600" />
              </Button>

              {/* Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  className="h-9 w-9 overflow-hidden rounded-full p-0 ring-2 ring-slate-200 transition-colors hover:ring-slate-300 dark:ring-slate-700 dark:hover:ring-slate-600"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <Avatar className="h-9 w-9">
                    <ControlledAvatarImage src={avatarSource} alt={getUserFullName()} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white text-sm font-bold">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                      <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">{getUserFullName()}</p>
                      <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                    <div className="py-2">
                      <button
                        type="button"
                        onClick={handleProfileNavigate}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <User className="w-4 h-4" /> Profile
                      </button>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-500/10"
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

        {commandOpen && (
          <div
            className="fixed inset-0 z-40 flex items-start justify-center bg-slate-950/55 px-4 pt-24 backdrop-blur-sm"
            onClick={closeCommandPalette}
          >
            <div
              className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-700">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  value={commandQuery}
                  onChange={(event) => setCommandQuery(event.target.value)}
                  placeholder="Search dashboard pages..."
                  className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
                />
                <span className="rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:border-slate-600 dark:text-slate-300">
                  ESC
                </span>
              </div>

              <div className="max-h-[55vh] overflow-y-auto p-2">
                {filteredCommandItems.length > 0 ? (
                  filteredCommandItems.map((item) => {
                    const ItemIcon = item.icon || Home;
                    return (
                      <button
                        key={item.url}
                        type="button"
                        onClick={() => handleCommandNavigate(item.url)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <span className="rounded-lg border border-slate-200 p-1.5 dark:border-slate-700">
                          <ItemIcon className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{item.title}</p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">{item.section} • {item.url}</p>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                    No pages found for "{commandQuery}".
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;