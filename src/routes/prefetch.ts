const prefetched = new Set<string>();

type Loader = () => Promise<unknown>;

const routeChunkLoaders: Record<string, Loader> = {
  '/': () => import('../public/Home'),
  '/about': () => import('../public/About'),
  '/features': () => import('../public/Features'),
  '/contact': () => import('../public/Contact'),
  '/faq': () => import('../public/FAQ'),
  '/jobs': () => import('../pages/Job/Jobs'),
  '/jobs/:id': () => import('../pages/Job/JobDetails'),
  '/jobs/:jobId/apply': () => import('../pages/Application/ApplyPage'),
  '/login': () => import('../components/auth/Login'),
  '/register/candidate': () => import('../components/auth/Register'),
  '/register/recruiter': () => import('../components/auth/RecruiterRegister'),

  '/admin/dashboard': () => import('../pages/admin/AdminDashboard'),
  '/admin/users': () => import('../pages/admin/UserManagement'),
  '/admin/jobs': () => import('../pages/admin/Analytics'),
  '/admin/profile': () => import('../pages/admin/AdminProfile'),

  '/recruiter/dashboard': () => import('../pages/Recruiter/RecruiterDashboard'),
  '/recruiter/jobs/create': () => import('../pages/Recruiter/JobPost'),
  '/recruiter/jobs/edit/:jobId': () => import('../pages/Recruiter/JobPost'),
  '/recruiter/jobs': () => import('../pages/Recruiter/MyJob'),
  '/recruiter/applications': () => import('../pages/Recruiter/RecruiterApplications'),
  '/recruiter/profile': () => import('../pages/Recruiter/RecruiterProfile'),

  '/candidate/dashboard': () => import('../pages/Candidate/CandidateDashboard'),
  '/candidate/jobs': () => import('../pages/Job/Jobs'),
  '/candidate/applications': () => import('../pages/Candidate/MyApplications'),
  '/candidate/profile': () => import('../pages/Candidate/CandidateProfile'),
};

const resolvePrefetchKey = (rawPath: string): string | null => {
  const path = rawPath.split('?')[0].split('#')[0];

  if (routeChunkLoaders[path]) {
    return path;
  }

  if (path.startsWith('/jobs/')) {
    if (path.endsWith('/apply')) {
      return '/jobs/:jobId/apply';
    }
    return '/jobs/:id';
  }

  if (path.startsWith('/recruiter/jobs/edit/')) {
    return '/recruiter/jobs/edit/:jobId';
  }

  return null;
};

export const prefetchRoute = (path: string) => {
  const key = resolvePrefetchKey(path);
  if (!key || prefetched.has(key)) {
    return;
  }

  const loader = routeChunkLoaders[key];
  if (!loader) {
    return;
  }

  prefetched.add(key);
  void loader().catch(() => {
    prefetched.delete(key);
  });
};
