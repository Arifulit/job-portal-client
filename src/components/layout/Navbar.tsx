/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, 
  User, 
  LogOut, 
  Menu, 
  X, 
  LayoutDashboard,
  Search,
  FileText,
  Settings,
  ChevronDown,
  Building2,
  Users,
  Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    const roleStr = (user.role || '').toLowerCase();
    
    if (roleStr === 'admin') return '/admin/dashboard';
    if (roleStr === 'recruiter') return '/recruiter/dashboard';
    if (roleStr === 'job_seeker' || roleStr === 'candidate') return '/candidate/dashboard';
    return null;
  };

  const isActiveLink = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const getRoleLinks = () => {
    if (!user) return null;
    const roleStr = (user.role || '').toLowerCase();
    const dashboardLink = getDashboardLink();

    if (roleStr === 'admin') {
      return (
        <>
          {dashboardLink && (
            <Link 
              to={dashboardLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActiveLink(dashboardLink)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link 
            to="/admin/users"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActiveLink('/admin/users')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <Users className="w-4 h-4" />
            Users
          </Link>
          <Link 
            to="/admin/jobs"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActiveLink('/admin/jobs')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Jobs
          </Link>
        </>
      );
    }

    if (roleStr === 'recruiter') {
      return (
        <>
          {dashboardLink && (
            <Link 
              to={dashboardLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActiveLink(dashboardLink)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link 
            to="/recruiter/jobs/create"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
          >
            <Briefcase className="w-4 h-4" />
            Post q Job
          </Link>
          <Link 
            to="/recruiter/jobs"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActiveLink('/recruiter/jobs')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            My Jobs
          </Link>
        </>
      );
    }

    if (roleStr === 'job_seeker' || roleStr === 'candidate') {
      return (
        <>
          <Link 
            to="/jobs"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActiveLink('/jobs')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Jobs
          </Link>
          {dashboardLink && (
            <Link 
              to={dashboardLink}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActiveLink(dashboardLink)
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          )}
          <Link 
            to="/candidate/applications"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              isActiveLink('/candidate/applications')
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'
            }`}
          >
            <FileText className="w-4 h-4" />
            Applications
          </Link>
        </>
      );
    }

    return null;
  };

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-white shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              CareerCode
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {isAuthenticated ? (
              <>
                {getRoleLinks()}
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* User Menu */}
                <div className="relative group ml-3">
                  <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-all">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                      {(user as any)?.avatar ? (
                        <img 
                          src={(user as any)?.avatar} 
                          alt={(user as any)?.name || 'User'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="hidden xl:block text-left">
                      <p className="text-sm font-semibold text-gray-900">
                        {(user as any)?.name || (user as any)?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-400 hidden xl:block" />
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">
                        {(user as any)?.name || (user as any)?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(user as any)?.email}
                      </p>
                    </div>
                    
                    <Link 
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Profile Settings
                    </Link>
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/jobs"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-all"
                >
                  <Search className="w-4 h-4" />
                  Browse Jobs
                </Link>
                <Link 
                  to="/login"
                  className="px-6 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                >
                  Login
                </Link>
                <Link 
                  to="/register"
                  className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-100 bg-white"
          >
            <div className="px-4 py-4 space-y-2">
              {isAuthenticated ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-sm">
                      {(user as any)?.avatar ? (
                        <img 
                          src={(user as any)?.avatar} 
                          alt={(user as any)?.name || 'User'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {(user as any)?.name || (user as any)?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {getRoleLinks()}
                  
                  <Link 
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Search className="w-4 h-4" />
                    Browse Jobs
                  </Link>
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};