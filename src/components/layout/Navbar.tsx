import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Briefcase, ChevronDown, FileText, LayoutDashboard, LogOut, Mail, Menu, Moon, Sun, User, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const NAV_ITEMS = [
  { label: 'My bdjobs', href: '/jobs' },
  { label: 'Jobs', href: '/jobs' },
];

const EMPLOYER_ITEMS = [
  { label: 'Recruiter Login', href: '/login' },
  { label: 'Recruiter Register', href: '/register/recruiter' },
];

const roleToDashboard: Record<string, string> = {
  admin: '/admin/dashboard',
  recruiter: '/recruiter/dashboard',
  candidate: '/candidate/dashboard',
  job_seeker: '/candidate/dashboard',
};

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [employerOpen, setEmployerOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [language, setLanguage] = useState<'ENG' | 'বাংলা'>('ENG');

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardLink = useMemo(() => {
    const normalizedRole = (user?.role || '').toLowerCase();
    return roleToDashboard[normalizedRole] || '/candidate/dashboard';
  }, [user?.role]);

  const normalizedRole = (user?.role || '').toLowerCase();

  const profileLink = useMemo(() => {
    if (normalizedRole === 'admin') return '/admin/profile';
    if (normalizedRole === 'recruiter') return '/recruiter/profile';
    return '/candidate/profile';
  }, [normalizedRole]);

  const jobsLink = useMemo(() => {
    if (normalizedRole === 'recruiter') return '/recruiter/jobs';
    return '/candidate/jobs';
  }, [normalizedRole]);

  const appliedJobsLink = useMemo(() => {
    if (normalizedRole === 'candidate' || normalizedRole === 'job_seeker') {
      return '/candidate/applications';
    }
    return dashboardLink;
  }, [dashboardLink, normalizedRole]);

  const accountMenuItems = useMemo(
    () => [
      { label: 'Bdjobs Profile', href: profileLink, icon: User },
      { label: 'Video CV', href: dashboardLink, icon: Briefcase },
      { label: 'Email CV', href: dashboardLink, icon: Mail },
      { label: 'Shortlisted Jobs', href: jobsLink, icon: Bell },
      { label: 'Following Employer', href: dashboardLink, icon: LayoutDashboard },
      { label: 'Applied Jobs', href: appliedJobsLink, icon: FileText },
    ],
    [appliedJobsLink, dashboardLink, jobsLink, profileLink]
  );

  const profileName = user?.name || 'Account';
  const avatarSource = (user as { profileImage?: string; avatar?: string } | null)?.profileImage ||
    (user as { profileImage?: string; avatar?: string } | null)?.avatar ||
    '';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeAllMenus = () => {
    setEmployerOpen(false);
    setProfileOpen(false);
  };

  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(`${href}/`);
  };

  const isDark = resolvedTheme === 'dark';

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        isScrolled
          ? isDark
            ? 'border-slate-800 bg-slate-950/95 backdrop-blur-md shadow-sm'
            : 'border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'
          : isDark
            ? 'border-slate-800 bg-slate-950'
            : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mx-auto max-w-[1300px] px-4 md:px-6">
        <div className="flex h-[88px] items-center justify-between gap-4">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <div className="h-10 w-10 rounded-md bg-[#0E5EA8] flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <div className="leading-none">
              <p className="text-[26px] font-extrabold tracking-tight text-[#0E5EA8]">bdjobs</p>
              <p className={`-mt-0.5 text-[8px] font-semibold tracking-[0.12em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                LARGEST JOB SITE IN BANGLADESH
              </p>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-3">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`inline-flex items-center gap-1 rounded-md px-2 py-2 text-[15px] font-semibold transition-colors ${
                  isActive(item.href)
                    ? isDark
                      ? 'text-white'
                      : 'text-slate-900'
                    : isDark
                      ? 'text-slate-300 hover:text-white'
                      : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
              </Link>
            ))}

            <span className={`px-1 ${isDark ? 'text-slate-700' : 'text-slate-300'}`}>|</span>
            <button
              type="button"
              className={`inline-flex items-center gap-2 rounded-md px-2 py-2 text-[15px] font-semibold ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              bdjobs
              <span className="rounded bg-[#0dad5f] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">PRO</span>
            </button>
          </nav>

          <div className="hidden lg:flex items-center gap-4">
            <div className={`inline-flex items-center rounded-full border p-1 shadow-sm ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <button
                type="button"
                onClick={() => setLanguage('ENG')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  language === 'ENG' ? 'bg-[#cf2f92] text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                ENG
              </button>
              <button
                type="button"
                onClick={() => setLanguage('বাংলা')}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
                  language === 'বাংলা' ? 'bg-[#cf2f92] text-white' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                বাংলা
              </button>
            </div>

            <div className={`inline-flex items-center rounded-full border p-1 ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`}>
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors ${
                  isDark ? 'text-slate-100 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full ${
                    isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  aria-label="Messages"
                >
                  <Mail className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full ${
                    isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                  }`}
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute right-1 top-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#ef2d62] px-1 text-[11px] font-bold text-white">
                    3
                  </span>
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen((prev) => !prev);
                      setEmployerOpen(false);
                    }}
                    className={`inline-flex items-center gap-3 rounded-full py-1 pl-1 pr-2 ${
                      isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
                    }`}
                  >
                    <span className={`flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border ${
                      isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-100'
                    }`}>
                      {avatarSource ? (
                        <img src={avatarSource} alt={profileName} className="h-full w-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-slate-500" />
                      )}
                    </span>
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profileName}</span>
                    <ChevronDown className={`h-4 w-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-full mt-2 w-72 rounded-xl border p-2 shadow-lg ${
                          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                        }`}
                      >
                        <div className={`mb-2 rounded-lg px-3 py-2 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
                          <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profileName}</p>
                          <span className="mt-1 inline-flex items-center rounded-full border border-[#6fd1a2] bg-[#dff6e8] px-2 py-0.5 text-xs font-semibold text-[#0b7d4f]">
                            Get Bdjobs Pro
                          </span>
                        </div>

                        {accountMenuItems.map((item) => {
                          const ItemIcon = item.icon;
                          return (
                            <Link
                              key={item.label}
                              to={item.href}
                              onClick={() => setProfileOpen(false)}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                                isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                              }`}
                            >
                              <ItemIcon className="h-4 w-4" />
                              {item.label}
                            </Link>
                          );
                        })}

                        <div className={`my-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/register/candidate"
                  className={`inline-flex h-12 items-center rounded-xl border px-8 text-sm font-bold text-[#bd2c87] ${
                    isDark ? 'border-[#7b4565] hover:bg-[#3a2030]' : 'border-[#e4bbd7] hover:bg-[#fff6fb]'
                  }`}
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-12 items-center rounded-xl bg-[#cf2f92] px-8 text-sm font-bold text-white hover:bg-[#b92882]"
                >
                  Sign In
                </Link>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setEmployerOpen((prev) => !prev);
                      setProfileOpen(false);
                    }}
                    className={`inline-flex items-center gap-1 px-1 py-2 text-sm font-semibold ${
                      isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                    }`}
                  >
                    For Employer
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {employerOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute right-0 top-full mt-2 w-52 rounded-xl border p-2 shadow-lg ${
                          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                        }`}
                      >
                        {EMPLOYER_ITEMS.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={closeAllMenus}
                            className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                              isDark ? 'text-slate-200 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border lg:hidden ${
              isDark ? 'border-slate-700 text-slate-200' : 'border-slate-200 text-slate-700'
            }`}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`border-t lg:hidden ${isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'}`}
          >
            <div className="space-y-2 px-4 py-4">
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold ${
                  isDark
                    ? 'border-slate-700 text-slate-100 hover:bg-slate-900'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>

              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2 text-sm font-semibold ${
                    isDark ? 'text-slate-200 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {!isAuthenticated ? (
                <>
                  <Link
                    to="/register/candidate"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block rounded-lg border px-3 py-2 text-center text-sm font-semibold text-[#bd2c87] ${
                      isDark ? 'border-[#7b4565]' : 'border-[#e4bbd7]'
                    }`}
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block rounded-lg bg-[#cf2f92] px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Sign In
                  </Link>

                  <div className={`pt-2 ${isDark ? 'border-t border-slate-800' : 'border-t border-slate-100'}`}>
                    <p className={`px-3 py-1 text-xs font-semibold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>For Employer</p>
                    {EMPLOYER_ITEMS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                          isDark ? 'text-slate-200 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {accountMenuItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${
                          isDark ? 'text-slate-200 hover:bg-slate-900' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <ItemIcon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className={`my-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
