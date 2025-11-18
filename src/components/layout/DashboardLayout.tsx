/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  Outlet,
  Link,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Menu,
  Home,
  User,
  LogOut,
  Bell,
  Search,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { adminSidebarItems } from '../../routes/adminSidebarItems';
import { employerSidebarItems } from '../../routes/employerSidebarItems';
import { userSidebarItems } from '../../routes/userSidebarItems';
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
import { ModeToggle } from './ModeToggler';

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
      case 'employer':
        return employerSidebarItems;
      case 'jobseeker':
        return userSidebarItems;
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  const isActiveRoute = (url: string) => {
    if (!url) return false;
    return (
      location.pathname === url ||
      location.pathname.startsWith(`${url}/`)
    );
  };

  const getDashboardTitle = () => {
    const role = user?.role || '';
    switch (role) {
      case 'admin':
        return 'Admin Dashboard';
      case 'employer':
        return 'Employer Dashboard';
      case 'jobseeker':
        return 'Job Seeker Dashboard';
      default:
        return 'Dashboard';
    }
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user?.email) {
      const namePart = user.email.split('@')[0];
      return namePart.charAt(0).toUpperCase();
    }
    return 'U';
  };

  const capitalize = (s: string) =>
    s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const getUserFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${capitalize(user.firstName)} ${capitalize(user.lastName)}`;
    }
    if (user?.firstName) return capitalize(user.firstName);
    if (user?.lastName) return capitalize(user.lastName);
    if (user?.email) {
      const name = user.email.split('@')[0];
      return capitalize(name);
    }
    return 'User';
  };

  const ControlledAvatarImage: React.FC<{ src?: string; alt?: string }> = ({
    src,
    alt,
  }) => {
    const [show, setShow] = useState(!!src);
    if (!src || !show) return null;
    return (
      <AvatarImage
        src={src}
        alt={alt ? `${alt} avatar` : ''}
        onError={() => setShow(false)}
      />
    );
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-card">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border/50">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 transition-transform group-hover:scale-105">
            <Home className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            JobPortal
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-6 overflow-y-auto scrollbar-thin">
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-2">
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const active = isActiveRoute(item.url);
                return (
                  <Link
                    key={itemIndex}
                    to={item.url}
                    onClick={() => setSidebarOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    {Icon && (
                      <Icon
                        className={`mr-3 h-5 w-5 transition-colors ${
                          active
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                    )}
                    <span className="flex-1">{item.title}</span>
                    {active && (
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Profile in Sidebar */}
      <div className="p-4 border-t border-border/50 bg-accent/30">
        <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-accent transition-colors">
          <Avatar className="h-10 w-10 ring-2 ring-blue-100 dark:ring-blue-900">
            <ControlledAvatarImage
              src={user?.profileImage}
              alt={getUserFullName()}
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {getUserFullName()}
            </p>
            <p className="text-xs text-muted-foreground capitalize flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
              {user?.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-accent/20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-400 mx-auto mb-4" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse" />
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            Loading your workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:border-border/50 lg:bg-card shadow-sm z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:pl-64 flex flex-col">
        {/* Top Header */}
        <header className="bg-card/95 backdrop-blur-sm shadow-sm border-b border-border/50 sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4 flex-1">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden hover:bg-accent"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">
                  {getDashboardTitle()}
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  Welcome back, {getUserFullName()}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Search Button (Desktop) */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex hover:bg-accent"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hover:bg-accent"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-card" />
              </Button>

              {/* Theme Toggle */}
              <ModeToggle />

              {/* Click-to-Toggle Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full p-0 overflow-hidden"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-label="User menu"
                >
                  <Avatar className="h-9 w-9">
                    <ControlledAvatarImage
                      src={user?.profileImage}
                      alt={getUserFullName()}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-blue-700 text-white font-semibold text-sm">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                {/* Dropdown Menu - Click to Open */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-md shadow-lg bg-card ring-1 ring-black ring-opacity-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="py-1">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-border/50">
                        <p className="text-sm font-semibold text-foreground truncate">
                          {getUserFullName()}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <User className="mr-3 h-4 w-4" />
                        Profile
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>

                      <div className="border-t border-border/50 my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <LogOut className="mr-3 h-4 w-4" />
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-accent/10">
          <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;