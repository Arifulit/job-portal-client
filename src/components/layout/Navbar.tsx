import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  Briefcase,
  ChevronDown,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Sun,
  User,
  X,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../hooks/useTheme';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

const RECRUITER_LINKS = [
  { label: 'Recruiter Login', href: '/login' },
  { label: 'Recruiter Register', href: '/register/recruiter' },
];

const roleToDashboard: Record<string, string> = {
  admin: '/admin/dashboard',
  recruiter: '/recruiter/dashboard',
  candidate: '/candidate/dashboard',
};

export const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [recruiterOpen, setRecruiterOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const recruiterRef = useRef<HTMLDivElement>(null);

  /* scroll shadow */
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* click-outside to close dropdowns */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (recruiterRef.current && !recruiterRef.current.contains(e.target as Node)) {
        setRecruiterOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const normalizedRole = (user?.role || '').toLowerCase();

  const dashboardLink = useMemo(
    () => roleToDashboard[normalizedRole] || '/candidate/dashboard',
    [normalizedRole]
  );

  const profileLink = useMemo(() => {
    if (normalizedRole === 'admin') return '/admin/profile';
    if (normalizedRole === 'recruiter') return '/recruiter/profile';
    return '/candidate/profile';
  }, [normalizedRole]);

  const appliedJobsLink =
    normalizedRole === 'recruiter' ? '/recruiter/applications' : '/candidate/applications';

  const accountMenuItems = useMemo(
    () => [
      { label: 'Dashboard', href: dashboardLink, icon: LayoutDashboard },
      { label: 'My Profile', href: profileLink, icon: User },
      { label: 'Applications', href: appliedJobsLink, icon: FileText },
    ],
    [dashboardLink, profileLink, appliedJobsLink]
  );

  const profileName = user?.name || 'Account';
  const userEmail = user?.email || '';
  const avatarSource =
    (user as { profileImage?: string; avatar?: string } | null)?.profileImage ||
    (user as { profileImage?: string; avatar?: string } | null)?.avatar ||
    '';

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const isActive = (href: string) =>
    href === '/'
      ? location.pathname === '/'
      : location.pathname === href || location.pathname.startsWith(`${href}/`);

  const isDark = resolvedTheme === 'dark';

  /* ── role badge ── */
  const roleBadge = useMemo(() => {
    const map: Record<string, { label: string; cls: string }> = {
      admin: { label: 'Admin', cls: 'bg-purple-100 text-purple-700' },
      recruiter: { label: 'Recruiter', cls: 'bg-emerald-100 text-emerald-700' },
      candidate: { label: 'Candidate', cls: 'bg-blue-100 text-blue-700' },
    };
    return map[normalizedRole] || { label: 'User', cls: 'bg-slate-100 text-slate-600' };
  }, [normalizedRole]);

  /* ── avatar initials ── */
  const initials = profileName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? isDark
            ? 'bg-slate-950/95 shadow-lg shadow-black/20 backdrop-blur-md'
            : 'bg-white/95 shadow-md shadow-slate-200/80 backdrop-blur-md'
          : isDark
          ? 'bg-slate-950'
          : 'bg-white'
      } border-b ${isDark ? 'border-slate-800' : 'border-slate-200'}`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* ── Logo ── */}
          <Link to="/" className="flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#0E5EA8] shadow-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-[#0E5EA8]">
              Job<span className={isDark ? 'text-white' : 'text-slate-900'}>Portal</span>
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={`relative rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  isActive(item.href)
                    ? isDark
                      ? 'text-white'
                      : 'text-[#0E5EA8]'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive(item.href) && (
                  <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-[#0E5EA8]" />
                )}
              </Link>
            ))}
          </nav>

          {/* ── Right Section ── */}
          <div className="hidden items-center gap-3 lg:flex">

            {/* Dark / Light Toggle */}
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button
                  type="button"
                  aria-label="Notifications"
                  className={`relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isDark
                      ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Bell className="h-4.5 w-4.5" />
                  <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                </button>

                {/* Profile Dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileOpen((p) => !p)}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-1.5 transition-colors ${
                      isDark
                        ? 'border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold ${
                        isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {avatarSource ? (
                        <img src={avatarSource} alt={profileName} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </span>
                    <div className="text-left leading-none">
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {profileName.split(' ')[0]}
                      </p>
                      <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {roleBadge.label}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 transition-transform ${
                        profileOpen ? 'rotate-180' : ''
                      } ${isDark ? 'text-slate-400' : 'text-slate-400'}`}
                    />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border shadow-xl ${
                          isDark
                            ? 'border-slate-700 bg-slate-900'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {/* User info header */}
                        <div className={`px-4 py-3 ${isDark ? 'border-b border-slate-800 bg-slate-800/50' : 'border-b border-slate-100 bg-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold ${
                                isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'
                              }`}
                            >
                              {avatarSource ? (
                                <img src={avatarSource} alt={profileName} className="h-full w-full object-cover" />
                              ) : (
                                initials
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {profileName}
                              </p>
                              <p className={`truncate text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                                {userEmail}
                              </p>
                              <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadge.cls}`}>
                                {roleBadge.label}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Links */}
                        <div className="p-1.5">
                          {accountMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.label}
                                to={item.href}
                                onClick={() => setProfileOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                                  isDark
                                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                              >
                                <Icon className={`h-4 w-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                                {item.label}
                              </Link>
                            );
                          })}
                        </div>

                        <div className={`border-t p-1.5 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                          <button
                            type="button"
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                {/* For Recruiter dropdown */}
                <div ref={recruiterRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setRecruiterOpen((p) => !p)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    For Recruiter
                    <ChevronDown className={`h-4 w-4 transition-transform ${recruiterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {recruiterOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -4 }}
                        transition={{ duration: 0.12 }}
                        className={`absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border p-1.5 shadow-xl ${
                          isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                        }`}
                      >
                        {RECRUITER_LINKS.map((item) => (
                          <Link
                            key={item.label}
                            to={item.href}
                            onClick={() => setRecruiterOpen(false)}
                            className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                              isDark
                                ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link
                  to="/register/candidate"
                  className={`inline-flex h-9 items-center rounded-lg border px-4 text-sm font-semibold transition-colors ${
                    isDark
                      ? 'border-slate-700 text-slate-300 hover:border-slate-600 hover:bg-slate-800 hover:text-white'
                      : 'border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                  }`}
                >
                  Register
                </Link>
                <Link
                  to="/login"
                  className="inline-flex h-9 items-center rounded-lg bg-[#0E5EA8] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0a4d8f]"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            type="button"
            onClick={() => setMobileOpen((p) => !p)}
            aria-label="Toggle menu"
            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition-colors lg:hidden ${
              isDark
                ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                : 'border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? 'close' : 'open'}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.15 }}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`overflow-hidden border-t lg:hidden ${
              isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
            }`}
          >
            <div className="space-y-1 px-4 pb-5 pt-3">

              {/* Nav links */}
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? isDark
                        ? 'bg-blue-900/40 text-blue-300'
                        : 'bg-blue-50 text-[#0E5EA8]'
                      : isDark
                      ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              <div className={`my-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />

              {/* Theme toggle */}
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isDark
                    ? 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </button>

              <div className={`my-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`} />

              {isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className={`mb-2 flex items-center gap-3 rounded-xl px-3 py-3 ${isDark ? 'bg-slate-800/60' : 'bg-slate-50'}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isDark ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                      {avatarSource ? (
                        <img src={avatarSource} alt={profileName} className="h-full w-full rounded-full object-cover" />
                      ) : (
                        initials
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{profileName}</p>
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${roleBadge.cls}`}>{roleBadge.label}</span>
                    </div>
                  </div>

                  {accountMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                          isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-lg bg-[#0E5EA8] px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#0a4d8f]"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register/candidate"
                    onClick={() => setMobileOpen(false)}
                    className={`block rounded-lg border px-3 py-2.5 text-center text-sm font-semibold transition-colors ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Register
                  </Link>

                  <div className={`pt-1 ${isDark ? 'border-t border-slate-800' : 'border-t border-slate-100'}`}>
                    <p className={`px-3 py-2 text-xs font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      For Recruiter
                    </p>
                    {RECRUITER_LINKS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
