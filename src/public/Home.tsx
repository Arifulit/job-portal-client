import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Bookmark,
  Briefcase,
  Building2,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Landmark,
  MapPin,
  Rocket,
  Search,
  Stethoscope,
  Users,
  ExternalLink,
} from "lucide-react";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { api } from "@/utils/api";
import { getJobDetailsPath } from "@/utils/helpers";
import { useCareerResources } from "@/services/resourceService";
import { useHomePageData } from "@/services/homeService";
import { useAuth } from "@/context/AuthContext";

type FeaturedJobItem = {
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type: string;
  salary: string;
  deadline: string;
  routeId: string;
};

type HomeApiJob = {
  _id: string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: number | { min: number; max: number; currency: string };
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  deadline?: string;
  company?: { _id?: string; name?: string; logo?: string } | string | null;
  relevanceScore?: number;
};

type HomeCompanyItem = {
  id: string;
  name: string;
  logo?: string;
  openRoles: number;
};

const formatHomeSalary = (job: HomeApiJob) => {
  if (typeof job.salaryMin === "number" && typeof job.salaryMax === "number") {
    return `${job.currency || "BDT"} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}`;
  }

  if (typeof job.salary === "object" && job.salary !== null) {
    return `${job.salary.currency || "BDT"} ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}`;
  }

  if (typeof job.salary === "number") {
    return `${job.currency || "BDT"} ${job.salary.toLocaleString()}`;
  }

  return "Salary Negotiable";
};

const getHomeCompanyName = (company: HomeApiJob["company"]) => {
  if (typeof company === "string") return company;
  return company?.name || "Confidential Company";
};

const getHomeCompanyLogo = (company: HomeApiJob["company"]) => {
  if (typeof company === "string" || !company) return undefined;
  return company.logo || undefined;
};

const estimateReadMinutes = (text: string) => {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 180));
  return `${minutes} min read`;
};



const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { data: homePageData } = useHomePageData();
  const [searchText, setSearchText] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set());
  const [publicJobs, setPublicJobs] = useState<HomeApiJob[]>([]);
  const [isLoadingPublicJobs, setIsLoadingPublicJobs] = useState(true);
  const [recommendedJobs, setRecommendedJobs] = useState<HomeApiJob[]>([]);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadPublicJobs = async () => {
      setIsLoadingPublicJobs(true);

      try {
        const response = await api.get<{
          success?: boolean;
          data?: HomeApiJob[] | { jobs?: HomeApiJob[]; data?: HomeApiJob[] };
          message?: string;
        }>("/jobs?limit=30");

        if (response.data.success === false) {
          throw new Error(response.data.message || "Failed to fetch jobs");
        }

        const payload = response.data.data;
        const jobs = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.jobs)
          ? payload.jobs
          : Array.isArray(payload?.data)
          ? payload.data
          : [];

        if (!isCancelled) {
          setPublicJobs(jobs);
        }
      } catch (error) {
        console.error("Failed to load public jobs:", error);
        if (!isCancelled) {
          setPublicJobs([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingPublicJobs(false);
        }
      }
    };

    void loadPublicJobs();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    // Only fetch recommendations for authenticated candidates
    if (!isAuthenticated || user?.role?.toLowerCase() !== "candidate") {
      setRecommendedJobs([]);
      setIsLoadingRecommendations(false);
      return;
    }

    let isCancelled = false;

    const loadRecommendations = async () => {
      setIsLoadingRecommendations(true);

      try {
        const response = await api.get<{
          success?: boolean;
          data?: HomeApiJob[];
          message?: string;
        }>("/candidate/profile/recommendations?limit=10");

        if (response.data.success === false) {
          throw new Error(response.data.message || "Failed to fetch job recommendations");
        }

        if (!isCancelled) {
          setRecommendedJobs(Array.isArray(response.data.data) ? response.data.data : []);
        }
      } catch (error) {
        console.error("Failed to load job recommendations:", error);
        if (!isCancelled) {
          setRecommendedJobs([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingRecommendations(false);
        }
      }
    };

    void loadRecommendations();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, user?.role]);

  // Load saved jobs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("savedJobs");
    if (stored) {
      try {
        setSavedJobs(new Set(JSON.parse(stored)));
      } catch (e) {
        console.error("Failed to load saved jobs:", e);
      }
    }
  }, []);

  // Save to localStorage whenever savedJobs changes
  useEffect(() => {
    localStorage.setItem("savedJobs", JSON.stringify(Array.from(savedJobs)));
  }, [savedJobs]);

  const handleSaveJob = (jobId: string) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  const handleApply = (e: React.MouseEvent, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/jobs/${jobId}/apply`);
  };

  const normalizedPublicJobs = useMemo(() => (publicJobs || []) as HomeApiJob[], [publicJobs]);

  const displayJobs = useMemo(() => {
    if (isAuthenticated && recommendedJobs.length > 0) {
      return recommendedJobs.slice(0, 6);
    }

    return normalizedPublicJobs.slice(0, 6);
  }, [isAuthenticated, normalizedPublicJobs, recommendedJobs]);

  const dashboardStats = useMemo(() => {
    const total = homePageData?.stats?.totalJobs ?? normalizedPublicJobs.length;
    const fullTime = normalizedPublicJobs.filter((job) => (job.jobType || "").toLowerCase() === "full-time").length;
    const uniqueCompanies = homePageData?.stats?.totalCompanies ?? new Set(
      normalizedPublicJobs.map((job) => {
        if (typeof job.company === "string") return job.company;
        return job.company?.name || "Confidential Company";
      })
    ).size;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recent = homePageData?.stats?.recentJobs ?? normalizedPublicJobs.filter((job) => {
      if (!job.deadline) return false;
      const date = new Date(job.deadline);
      return Number.isFinite(date.getTime()) && date >= oneWeekAgo;
    }).length;

    return {
      total,
      fullTime,
      uniqueCompanies,
      recent,
      totalVacancies: homePageData?.stats?.totalVacancies ?? 0,
    };
  }, [homePageData?.stats?.recentJobs, homePageData?.stats?.totalCompanies, homePageData?.stats?.totalJobs, homePageData?.stats?.totalVacancies, normalizedPublicJobs]);

  const dynamicCompanies = useMemo<HomeCompanyItem[]>(() => {
    if (Array.isArray(homePageData?.topCompanies) && homePageData.topCompanies.length > 0) {
      return homePageData.topCompanies.slice(0, 9).map((company) => ({
        id: company._id,
        name: company.name,
        logo: company.logo,
        openRoles: company.roleCount,
      }));
    }

    const companyMap = new Map<string, HomeCompanyItem>();

    normalizedPublicJobs.forEach((job) => {
      let name = "Confidential Company";
      let logo: string | undefined;
      let id = "unknown";

      if (typeof job.company === "string") {
        name = job.company.trim() || name;
        id = name.toLowerCase();
      } else if (job.company && typeof job.company === "object") {
        name = job.company.name?.trim() || name;
        logo = job.company.logo;
        id = (job.company._id || name).toLowerCase();
      }

      const existing = companyMap.get(id);
      if (existing) {
        existing.openRoles += 1;
      } else {
        companyMap.set(id, {
          id,
          name,
          logo,
          openRoles: 1,
        });
      }
    });

    return Array.from(companyMap.values())
      .sort((a, b) => b.openRoles - a.openRoles)
      .slice(0, 9);
  }, [homePageData?.topCompanies, normalizedPublicJobs]);

  const cityTags = useMemo(() => {
    const locationCounts = normalizedPublicJobs.reduce<Record<string, number>>((acc, job) => {
      const raw = job.location || "Bangladesh";
      const city = raw.split(",")[0]?.trim() || "Bangladesh";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([city, count]) => `${city} (${count})`);
  }, [normalizedPublicJobs]);

  const quickLinks = useMemo(
    () => {
      const categoryLinks = (homePageData?.categories || []).slice(0, 4).map((category) => ({
        label: category.label,
        count: category.count,
        href: `/jobs?jobType=${encodeURIComponent(category.key)}`,
      }));

      if (categoryLinks.length > 0) {
        return categoryLinks;
      }

      return [
        { label: "All Jobs", count: dashboardStats.total, href: "/jobs" },
        { label: "Full Time Jobs", count: dashboardStats.fullTime, href: "/jobs?jobType=full-time" },
        { label: "Top Companies", count: dashboardStats.uniqueCompanies, href: "/companies" },
        { label: "New Openings", count: dashboardStats.recent, href: "/jobs?newOnly=true" },
      ];
    },
    [dashboardStats.fullTime, dashboardStats.recent, dashboardStats.total, dashboardStats.uniqueCompanies, homePageData?.categories]
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchText.trim()) {
      params.append("search", searchText.trim());
    }
    if (jobTypeFilter) {
      params.append("jobType", jobTypeFilter);
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };





  const {
    data: allResources = [],
    isLoading: isLoadingResources,
  } = useCareerResources(3);

  // Map resources from /home first, then fallback to dedicated resources endpoint.
  const resourceCards = useMemo(() => {
    const sourceResources = (homePageData?.careerResources && homePageData.careerResources.length > 0)
      ? homePageData.careerResources
      : allResources;

    return sourceResources.map(resource => ({
      id: resource._id,
      title: resource.title,
      desc: resource.description || 'Learn more about this career topic',
      tag: (() => {
        const normalized = resource as { tag?: string; category?: string };
        return normalized.tag || normalized.category || 'Career';
      })(),
    }));
  }, [allResources, homePageData?.careerResources]);

  const displayResources = resourceCards;

  const homepageHighlights = useMemo(
    () => [
      {
        icon: Users,
        value: dashboardStats.total,
        label: "Open Jobs",
        color: "bg-gradient-to-br from-slate-900 to-slate-700",
      },
      {
        icon: Rocket,
        value: dashboardStats.uniqueCompanies,
        label: "Hiring Companies",
        color: "bg-gradient-to-br from-indigo-700 to-indigo-500",
      },
      {
        icon: CheckCircle2,
        value: dashboardStats.recent,
        label: "Fresh Openings",
        color: "bg-gradient-to-br from-cyan-700 to-cyan-500",
      },
    ],
    [dashboardStats.recent, dashboardStats.total, dashboardStats.uniqueCompanies]
  );

  const featuredJobs: FeaturedJobItem[] = useMemo(
    () =>
      displayJobs.length > 0
        ? displayJobs.map((job): FeaturedJobItem => ({
          title: job.title,
          company: getHomeCompanyName(job.company),
          companyLogo: typeof job.company === 'object' ? job.company?.logo : undefined,
          location: job.location || "Bangladesh",
          type: job.jobType || "full-time",
          salary: formatHomeSalary(job),
          deadline: job.deadline
            ? `Deadline: ${new Date(job.deadline).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}`
            : "Deadline: Not specified",
          routeId: job._id,
        }))
        : [],
    [displayJobs]
  );

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-slate-200/80 dark:border-slate-800">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.08),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(79,70,229,0.08),_transparent_30%),linear-gradient(to_bottom,_rgba(248,250,252,1),_rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(79,70,229,0.18),_transparent_28%),linear-gradient(to_bottom,_rgba(15,23,42,1),_rgba(2,6,23,1))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
        <div className="absolute -right-24 top-12 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -left-24 bottom-0 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-8 px-4 py-10 md:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start lg:py-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pr-0 lg:pr-8"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Professional hiring platform for candidates and recruiters
            </div>

            <h1 className="mt-5 max-w-2xl text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl md:text-4xl dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Find The Right Job
            </h1>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[
                { icon: Briefcase, label: "Live Jobs", value: dashboardStats.total, bgColor: "from-slate-900 to-slate-700", cardBg: "from-white to-slate-50", textColor: "text-slate-900 dark:text-slate-100", action: () => navigate("/jobs") },
                { icon: Building2, label: "Companies", value: dashboardStats.uniqueCompanies, bgColor: "from-indigo-600 to-indigo-500", cardBg: "from-white to-indigo-50/70", textColor: "text-slate-900 dark:text-slate-100", action: () => navigate("/companies") },
                { icon: Stethoscope, label: "New Jobs", value: dashboardStats.recent, bgColor: "from-emerald-600 to-emerald-500", cardBg: "from-white to-emerald-50/70", textColor: "text-slate-900 dark:text-slate-100", action: () => navigate("/jobs?newOnly=true") },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.button
                    key={stat.label}
                    onClick={stat.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    className={`flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-gradient-to-br ${stat.cardBg} p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:border-slate-700`}
                  >
                    <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.bgColor} shadow-lg`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{stat.label}</p>
                      <p className={`text-3xl font-extrabold leading-none ${stat.textColor}`}>{stat.value || 0}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-7 rounded-[1.35rem] border border-slate-200 bg-white p-2.5 shadow-[0_20px_45px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-1 gap-2.5 lg:grid-cols-[1fr_220px_140px]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by keyword"
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm outline-none transition-all placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-700 dark:focus:ring-indigo-950/40"
                  />
                </label>

                <label className="relative">
                  <Landmark className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-10 text-sm text-slate-600 outline-none transition-all focus:border-indigo-300 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-indigo-700 dark:focus:ring-indigo-950/40"
                  >
                    <option value="">Job Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-slate-500" />
                </label>

                <Button
                  type="submit"
                  onClick={handleSearch}
                  className="h-11 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-700 to-cyan-700 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
                >
                  Search
                </Button>
              </form>
            </div>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {(cityTags.length > 0 ? cityTags : ["Bangladesh (0)"]).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => navigate(`/jobs?location=${encodeURIComponent(city.split(" (")[0])}`)}
                  className="rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-300"
                >
                  {city}
                </button>
              ))}
            </div>


          </motion.div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-6 rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_rgba(15,23,42,0.1)] lg:mt-0 dark:border-slate-700 dark:bg-slate-900"
          >
            <h2 className="mb-6 text-2xl font-bold tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Quick Links
            </h2>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-base text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-sm no-underline dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-700 dark:hover:bg-slate-800">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-indigo-500" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="ml-auto flex-shrink-0 rounded-full bg-slate-900 px-3 py-1 text-sm font-bold text-white shadow-sm dark:bg-white dark:text-slate-900">{item.count || 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-10 md:px-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:flex md:items-center md:justify-between md:gap-8 md:p-8 dark:border-slate-700 dark:bg-slate-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Career kickoff</p>
            <h3 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Start Your Journey Today
            </h3>
            <p className="mt-3 max-w-2xl text-base text-slate-600 dark:text-slate-400">Create your profile and get hired by top companies in Bangladesh with a more polished application experience.</p>
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row md:mt-0">
            <Link to="/register/candidate">
              <Button className="h-11 rounded-2xl bg-slate-900 px-6 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] whitespace-nowrap dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
                Candidate Registration
              </Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="outline" className="h-11 rounded-2xl border-2 border-slate-300 px-6 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 transition-all shadow-sm whitespace-nowrap">
                Recruiter Registration
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-4 md:px-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-8 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Trusted employers</p>
            <h2 className="mb-2 text-3xl font-bold tracking-tight text-slate-950 dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>Meet the teams hiring right now</h2>
            <p className="text-slate-600 dark:text-slate-300">Browse verified companies, compare open roles, and apply with confidence.</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 xl:grid-cols-8">
            {dynamicCompanies.length > 0 ? (
              dynamicCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => navigate(`/company/${company.id}/profile`)}
                  className="group relative flex h-[15rem] w-full cursor-pointer flex-col items-center justify-between overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white px-4 py-5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-700"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-slate-200 via-indigo-200 to-cyan-200 opacity-80 dark:from-slate-700 dark:via-indigo-700 dark:to-cyan-700" />
                  <div className="flex flex-1 flex-col items-center justify-center pt-1">
                    {company.logo ? (
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:border-slate-700 dark:bg-slate-900">
                      <img src={company.logo} alt={company.name} className="h-full w-full object-contain opacity-95" />
                      </div>
                    ) : (
                      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-200 to-slate-100 text-xl font-bold text-slate-700 transition-all duration-300 dark:from-slate-800 dark:to-slate-700 dark:text-slate-200">
                        {company.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="max-w-[7.75rem] text-center text-[0.92rem] font-semibold leading-snug text-slate-800 transition-colors line-clamp-2 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">
                      {company.name}
                    </span>
                    <span className="mt-1 text-xs font-medium text-slate-500 transition-colors dark:text-slate-400">{company.openRoles} active role{company.openRoles === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                    View company
                    <ExternalLink className="ml-1 h-3.5 w-3.5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
                </button>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                No company data available yet.
              </div>
            )}
          </div>
        </div>
      </section>



      {/* Recommended & Featured Jobs Section */}
      <section className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
        {isAuthenticated && user?.role?.toLowerCase() === 'candidate' && (
          <div className="mb-12 rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] md:p-6 dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-7 flex items-end justify-between gap-3">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Personalized picks</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Recommended Jobs</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  {isLoadingRecommendations
                    ? "Loading recommended jobs..."
                    : recommendedJobs.length > 0
                      ? "Recommended jobs for your profile"
                      : "No recommendations available right now"
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {isLoadingRecommendations ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={`recommended-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                      <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : recommendedJobs.length > 0 ? (
                recommendedJobs.slice(0, 6).map((job) => (
                  <Link
                    key={`rec-${job._id}`}
                    to={getJobDetailsPath(job._id)}
                    className="no-underline"
                  >
                    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{job.jobType || "full-time"}</span>
                          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">Recommended</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveJob(job._id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            savedJobs.has(job._id)
                                ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700"
                          }`}
                          title={savedJobs.has(job._id) ? "Unsave job" : "Save job"}
                        >
                          <Bookmark
                            className="h-5 w-5"
                            fill={savedJobs.has(job._id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <div className="mb-4 text-sm text-slate-400">{job.deadline || "Deadline: Not specified"}</div>

                      <h4 className="mt-2 text-xl font-semibold leading-tight text-slate-950 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">{job.title}</h4>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        {getHomeCompanyLogo(job.company) ? (
                          <img
                            src={getHomeCompanyLogo(job.company)}
                            alt={getHomeCompanyName(job.company)}
                            className="h-8 w-8 rounded-md object-contain ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                            {getHomeCompanyName(job.company).slice(0, 2)}
                          </span>
                        )}
                        <span>{getHomeCompanyName(job.company)}</span>
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{job.location || "Bangladesh"}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{formatHomeSalary(job)}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-300">See details</span>
                        <Button
                          onClick={(e) => handleApply(e, job._id)}
                          className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                        >
                          Apply Now
                        </Button>
                      </div>
                    </article>
                  </Link>
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  No recommended jobs found.
                </div>
              )}
            </div>
          </div>
        )}

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_35px_rgba(15,23,42,0.06)] md:p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-7 flex items-end justify-between gap-3">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Latest opportunities</p>
              <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>View Jobs</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoadingPublicJobs
                  ? "Loading jobs..."
                  : featuredJobs.length > 0
                    ? "Latest jobs from all companies"
                    : "No jobs available at the moment"
                }
              </p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-200">
              View All Jobs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isLoadingPublicJobs ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`public-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 bg-gray-200 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              featuredJobs.map((job) => (
                <Link
                  key={job.routeId}
                  to={getJobDetailsPath(job.routeId)}
                  className="no-underline"
                >
                  <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/20 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{job.type}</span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">Featured</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveJob(job.routeId);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          savedJobs.has(job.routeId)
                            ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 dark:hover:bg-slate-700"
                        }`}
                        title={savedJobs.has(job.routeId) ? "Unsave job" : "Save job"}
                      >
                        <Bookmark
                          className="h-5 w-5"
                          fill={savedJobs.has(job.routeId) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    
                    <div className="mb-4 text-sm text-slate-400">{job.deadline}</div>

                    <h4 className="mt-2 text-xl font-semibold leading-tight text-slate-950 group-hover:text-indigo-700 dark:text-slate-100 dark:group-hover:text-indigo-300">{job.title}</h4>
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="h-8 w-8 rounded-sm object-contain ring-1 ring-slate-200 dark:ring-slate-700" />
                      ) : (
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 text-[10px] font-bold uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          {job.company.slice(0, 2)}
                        </span>
                      )}
                      <span>{job.company}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{job.salary}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 dark:text-slate-300 dark:group-hover:text-indigo-300">See details</span>
                      <Button
                        onClick={(e) => handleApply(e, job.routeId)}
                        className="h-10 rounded-xl bg-slate-900 px-4 text-sm text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </article>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {homepageHighlights.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`${item.color} rounded-2xl p-6 text-white shadow-[0_20px_45px_rgba(15,23,42,0.15)]`}>
                <Icon className="h-8 w-8" />
                <h4 className="mt-4 text-2xl font-extrabold">{item.value.toLocaleString()}</h4>
                <p className="text-blue-100">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Learning zone</p>
            <h3 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Career Resources</h3>
            <p className="text-slate-600 dark:text-slate-400">Guides to help you get hired faster</p>
          </div>
          <Link to="/features" className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 transition-colors hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-200">
            Explore More
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoadingResources && !homePageData?.careerResources?.length ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`resource-skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <div className="animate-pulse">
                  <div className="h-4 w-20 rounded bg-slate-200 mb-3" />
                  <div className="h-5 w-3/4 rounded bg-slate-200 mb-2" />
                  <div className="h-4 w-full rounded bg-slate-200 mb-1" />
                  <div className="h-4 w-2/3 rounded bg-slate-200" />
                </div>
              </div>
            ))
          ) : displayResources.length > 0 ? (
            displayResources.map((item) => (
              <Link key={item.id} to={`/resources/${item.id}`} className="no-underline">
                <article className="h-full cursor-pointer rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-cyan-50/20 p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-indigo-950/20 dark:to-slate-950">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300">{item.tag}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>

                  <h4 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">{item.title}</h4>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.desc}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">Read Article</span>
                    <span className="text-xs text-slate-400">{estimateReadMinutes(item.desc)}</span>
                  </div>
                </article>
              </Link>
            ))
          ) : (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
              No career resources available right now.
            </div>
          )}
        </div>
      </section>

   

      <section className="mx-auto max-w-[1320px] px-4 py-8 md:px-6">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_20px_50px_rgba(15,23,42,0.08)] md:flex md:items-center md:justify-between md:gap-6 md:p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <GraduationCap className="h-4 w-4" />
              For Freshers & Professionals
            </p>
            <h3 className="mt-3 max-w-2xl text-2xl font-extrabold tracking-tight md:text-3xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Build your profile, get discovered, and land your next role
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-300">
              Join thousands of candidates and recruiters in one trusted platform.
            </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
            <Link to="/register/candidate">
              <Button className="h-10 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                Join As Candidate
              </Button>
            </Link>
            <Link to="/register/recruiter">
              <Button className="h-10 rounded-2xl bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100">
                Hire Talent
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



