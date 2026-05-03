// এই ফাইলটি project wide helper, route utility অথবা shared function প্রদান করে।
export const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatRelativeTime = (date?: string): string => {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
};

export const formatSalary = (min: number, max: number, currency = 'USD'): string => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const getStatusColor = (status?: string): string => {
  const colors: Record<string, string> = {
    applied: 'bg-blue-100 text-blue-700',
    reviewed: 'bg-cyan-100 text-cyan-700',
    shortlisted: 'bg-emerald-100 text-emerald-700',
    interview: 'bg-amber-100 text-amber-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-rose-100 text-rose-700',
    active: 'bg-emerald-100 text-emerald-700',
    expired: 'bg-red-100 text-red-700',
    draft: 'bg-slate-100 text-slate-600',
    pending: 'bg-amber-100 text-amber-700',
  };
  return colors[String(status || '').toLowerCase()] || 'bg-slate-100 text-slate-600';
};

export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};

export const debounce = <TArgs extends unknown[]>(
  func: (...args: TArgs) => void,
  wait: number
): ((...args: TArgs) => void) => {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: TArgs) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getJobDetailsPath = (
  job?: { _id?: string; id?: string; routeId?: string } | string | null
): string => {
  if (!job) return '/jobs';

  if (typeof job === 'string') {
    return job ? `/jobs/${job}` : '/jobs';
  }

  const jobId = job._id || job.id || job.routeId;
  return jobId ? `/jobs/${jobId}` : '/jobs';
};
