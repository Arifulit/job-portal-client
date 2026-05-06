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
        color: "bg-[#123f7a]",
      },
      {
        icon: Rocket,
        value: dashboardStats.uniqueCompanies,
        label: "Hiring Companies",
        color: "bg-[#1c5da8]",
      },
      {
        icon: CheckCircle2,
        value: dashboardStats.recent,
        label: "Fresh Openings",
        color: "bg-[#2d78cb]",
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
    <div className="bg-[#f3f8ff] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-blue-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-[#eaf2ff] via-[#d4e4ff] to-[#f0e6ff] dark:from-slate-900 dark:via-slate-950 dark:to-[#1a1f3a]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1f4f93]/15 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#cf2f92]/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-[#1f4f93]/10 to-transparent rounded-full blur-3xl" />

        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-0 px-4 py-8 md:px-6 lg:grid-cols-[1fr_340px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pr-0 lg:pr-8"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Find Your <span className="bg-gradient-to-r from-[#1f4f93] via-[#cf2f92] to-[#1f4f93] bg-clip-text text-transparent">Dream Job Today</span>
            </h1>
            <p className="mt-3 text-lg text-slate-600 dark:text-slate-300">Discover thousands of opportunities from the world's leading companies</p>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3">
              {[
                { icon: Briefcase, label: "Live Jobs", value: dashboardStats.total, bgColor: "from-blue-500 to-blue-600", cardBg: "from-blue-100 to-blue-50", textColor: "text-blue-700", action: () => navigate("/jobs") },
                { icon: Building2, label: "Companies", value: dashboardStats.uniqueCompanies, bgColor: "from-pink-500 to-pink-600", cardBg: "from-pink-100 to-pink-50", textColor: "text-pink-700", action: () => navigate("/companies") },
                { icon: Stethoscope, label: "New Jobs", value: dashboardStats.recent, bgColor: "from-green-500 to-green-600", cardBg: "from-green-100 to-green-50", textColor: "text-green-700", action: () => navigate("/jobs?newOnly=true") },
              ].map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <motion.button
                    key={stat.label}
                    onClick={stat.action}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 + idx * 0.1 }}
                    className={`flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br ${stat.cardBg} border border-white/60 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer`}
                  >
                    <div className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br ${stat.bgColor} shadow-lg flex-shrink-0`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-500">{stat.label}</p>
                      <p className={`text-3xl font-extrabold leading-none ${stat.textColor}`}>{stat.value || 0}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <div className="mt-7 rounded-md bg-[#1f4f93] p-3 shadow-lg">
              <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_240px_160px]" style={{background: "linear-gradient(to right, #1f4f93, #2d6ac0)"}}>
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by keyword"
                    className="h-14 w-full rounded-lg border-0 bg-white/95 dark:bg-slate-900 dark:text-slate-100 pl-12 pr-4 text-lg outline-none ring-0 shadow-md focus:ring-2 focus:ring-[#cf2f92] focus:ring-offset-0 transition-all"
                  />
                </label>

                <label className="relative">
                  <Landmark className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="h-14 w-full appearance-none rounded-lg border-0 bg-white/95 dark:bg-slate-900 pl-12 pr-10 text-lg text-slate-500 dark:text-slate-300 outline-none shadow-md focus:ring-2 focus:ring-[#cf2f92] transition-all"
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
                  className="h-14 rounded-lg bg-gradient-to-r from-[#9ac8a2] to-[#7bb888] text-lg font-bold text-white shadow-lg hover:shadow-xl hover:from-[#8fbe97] hover:to-[#70ae7d] transition-all active:scale-95"
                >
                  Search
                </Button>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {(cityTags.length > 0 ? cityTags : ["Bangladesh (0)"]).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => navigate(`/jobs?location=${encodeURIComponent(city.split(" (")[0])}`)}
                  className="rounded-full bg-gradient-to-r from-[#4a70a8] to-[#3a5f95] px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95 shadow-md"
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
            className="mt-6 rounded-xl bg-gradient-to-br from-[#255c9f] via-[#1f4f93] to-[#1a3d6e] p-8 shadow-2xl text-white lg:mt-0 border border-blue-400/20"
          >
            <h2 className="mb-8 text-2xl font-bold uppercase tracking-widest text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Quick Links
            </h2>
            <ul className="space-y-4">
              {quickLinks.map((item) => (
                <li key={item.label} className="hover:bg-white/15 rounded-lg p-3 transition-all duration-300">
                  <Link to={item.href} className="flex items-center justify-between gap-3 text-base text-white/90 transition hover:text-white no-underline">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-5 w-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <span className="ml-auto flex-shrink-0 rounded-full bg-gradient-to-r from-[#cf2f92] to-[#e84ba8] px-3 py-1 text-sm font-bold text-white shadow-md">{item.count || 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-6">
        <div>
          <h3 className="text-4xl font-bold text-slate-900 dark:text-white" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Start Your Journey Today
          </h3>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">Create your profile and get hired by top companies in Bangladesh.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/register/candidate">
            <Button className="h-12 rounded-lg bg-gradient-to-r from-[#cf2f92] to-[#e84ba8] px-8 text-base font-bold text-white hover:shadow-lg shadow-md transition-all active:scale-95 whitespace-nowrap">
              Candidate Registration
            </Button>
          </Link>
          <Link to="/register/recruiter">
            <Button variant="outline" className="h-12 rounded-lg border-2 border-[#1f4f93] px-8 text-base font-bold text-[#1f4f93] dark:text-blue-300 hover:bg-[#f0f6ff] dark:hover:bg-slate-800 transition-all shadow-md whitespace-nowrap">
              Recruiter Registration
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-4 md:px-6">
        <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-gradient-to-br from-white via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-8 shadow-lg">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mb-3">Trusted by Leading Companies</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2" style={{ fontFamily: "Montserrat, sans-serif" }}>Explore Opportunities at Top Organizations</h2>
            <p className="text-slate-600 dark:text-slate-300">Click on any company to explore all available opportunities</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4 lg:grid-cols-9">
            {dynamicCompanies.length > 0 ? (
              dynamicCompanies.map((company) => (
                <button
                  key={company.id}
                  onClick={() => navigate(`/company/${company.id}/profile`)}
                  className="flex flex-col items-center justify-center rounded-lg bg-white dark:bg-slate-800/60 px-4 py-6 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-md hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:bg-gradient-to-br hover:from-blue-100 hover:to-purple-100 dark:hover:from-slate-700 dark:hover:to-slate-600 border border-transparent hover:border-blue-300 dark:hover:border-purple-500 cursor-pointer h-full w-full"
                >
                  {company.logo ? (
                    <img src={company.logo} alt={company.name} className="h-12 w-auto mb-3 object-contain opacity-90 hover:opacity-100 hover:scale-125 transition-all duration-300 filter saturate-100 hover:drop-shadow-xl" />
                  ) : (
                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-purple-100 text-sm font-bold text-[#1f4f93] hover:shadow-lg transition-all duration-300">
                      {company.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-[#1f4f93] transition-colors">{company.name}</span>
                  <span className="mt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">{company.openRoles} {company.openRoles === 1 ? 'role' : 'roles'}</span>
                  <div className="mt-3 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <ExternalLink className="h-3.5 w-3.5 text-[#1f4f93] hover:text-[#cf2f92]" />
                  </div>
                </button>
              ))
            ) : (
              <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-600 dark:text-slate-400">
                No company data available yet.
              </div>
            )}
          </div>
        </div>
      </section>



      {/* Recommended & Featured Jobs Section */}
      <section className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
        {isAuthenticated && user?.role?.toLowerCase() === 'candidate' && (
          <div className="mb-12">
            <div className="mb-7 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Recommended Jobs</h3>
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
                  <div key={`recommended-skeleton-${index}`} className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
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
                    <article className="group rounded-xl bg-white dark:bg-slate-900 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden border border-transparent cursor-pointer h-full flex flex-col">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0f6ff] to-[#eef8ff] px-3 py-1 text-xs font-semibold text-[#1f4f93]">{job.jobType || "full-time"}</span>
                          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff0f7] to-[#fff6fb] px-3 py-1 text-xs font-semibold text-[#b42880]">Recommended</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSaveJob(job._id);
                          }}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            savedJobs.has(job._id)
                              ? "bg-blue-50 dark:bg-blue-900/30 text-[#1f4f93]"
                              : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#1f4f93] hover:bg-blue-50 dark:hover:bg-slate-700"
                          }`}
                          title={savedJobs.has(job._id) ? "Unsave job" : "Save job"}
                        >
                          <Bookmark
                            className="h-5 w-5"
                            fill={savedJobs.has(job._id) ? "currentColor" : "none"}
                          />
                        </button>
                      </div>

                      <div className="text-sm text-slate-400 mb-4">{job.deadline || "Deadline: Not specified"}</div>

                      <h4 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-[#1f4f93]">{job.title}</h4>
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                        {typeof job.company === 'object' && job.company?.logo ? (
                          <img src={job.company.logo} alt={getHomeCompanyName(job.company)} className="h-6 w-6 object-contain rounded-sm" />
                        ) : null}
                        {typeof job.company === 'object' && job.company?._id ? (
                          <Link 
                            to={`/company/${job.company._id}/profile`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-[#1f4f93] hover:underline transition-colors"
                          >
                            {getHomeCompanyName(job.company)}
                          </Link>
                        ) : (
                          <span>{getHomeCompanyName(job.company)}</span>
                        )}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                        <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{job.location || "Bangladesh"}</span>
                        </div>
                        <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2">
                          <Briefcase className="h-4 w-4 text-slate-400" />
                          <span className="font-medium">{formatHomeSalary(job)}</span>
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                        <span className="text-sm font-semibold text-[#1f4f93] group-hover:text-[#153a6f]">See details</span>
                        <Button
                          onClick={(e) => handleApply(e, job._id)}
                          className="h-10 rounded-md bg-[#cf2f92] px-4 text-sm text-white hover:bg-[#b42880]"
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

        <div>
          <div className="mb-7 flex items-end justify-between gap-3">
            <div>
              <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>All Jobs</h3>
              <p className="text-slate-600 dark:text-slate-400">
                {isLoadingPublicJobs
                  ? "Loading jobs..."
                  : featuredJobs.length > 0
                    ? "Latest jobs from all companies"
                    : "No jobs available at the moment"
                }
              </p>
            </div>
            <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f93] hover:text-[#153a6f]">
              View All Jobs
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {isLoadingPublicJobs ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={`public-skeleton-${index}`} className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
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
                  <article className="group rounded-xl bg-white dark:bg-slate-900 p-6 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden border border-transparent cursor-pointer h-full flex flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f0f6ff] to-[#eef8ff] px-3 py-1 text-xs font-semibold text-[#1f4f93]">{job.type}</span>
                        <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fff0f7] to-[#fff6fb] px-3 py-1 text-xs font-semibold text-[#b42880]">Featured</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveJob(job.routeId);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          savedJobs.has(job.routeId)
                            ? "bg-blue-50 dark:bg-blue-900/30 text-[#1f4f93]"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#1f4f93] hover:bg-blue-50 dark:hover:bg-slate-700"
                        }`}
                        title={savedJobs.has(job.routeId) ? "Unsave job" : "Save job"}
                      >
                        <Bookmark
                          className="h-5 w-5"
                          fill={savedJobs.has(job.routeId) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    
                    <div className="text-sm text-slate-400 mb-4">{job.deadline}</div>

                    <h4 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 leading-tight group-hover:text-[#1f4f93]">{job.title}</h4>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                      <span>{job.company}</span>
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{job.location}</span>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-md bg-slate-50 dark:bg-slate-800 px-3 py-2">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="font-medium">{job.salary}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                      <span className="text-sm font-semibold text-[#1f4f93] group-hover:text-[#153a6f]">See details</span>
                      <Button
                        onClick={(e) => handleApply(e, job.routeId)}
                        className="h-10 rounded-md bg-[#cf2f92] px-4 text-sm text-white hover:bg-[#b42880]"
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
              <div key={item.label} className={`${item.color} rounded-xl p-6 text-white shadow-md`}>
                <Icon className="h-8 w-8" />
                <h4 className="mt-4 text-3xl font-extrabold">{item.value.toLocaleString()}</h4>
                <p className="text-blue-100">{item.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Career Resources</h3>
            <p className="text-slate-600 dark:text-slate-400">Guides to help you get hired faster</p>
          </div>
          <Link to="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f93] hover:text-[#153a6f]">
            Explore More
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {isLoadingResources && !homePageData?.careerResources?.length ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`resource-skeleton-${index}`} className="rounded-xl bg-white dark:bg-slate-900 p-6 shadow-md">
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
                <article className="rounded-xl bg-white dark:bg-slate-900 p-6 shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-1 cursor-pointer h-full">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#f3f9ff] px-3 py-1 text-xs font-semibold text-[#1f4f93]">{item.tag}</span>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>

                  <h4 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{item.desc}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#1f4f93]">Read Article</span>
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

   

      <section className="mx-auto max-w-[1320px] px-4 pb-14 pt-8 md:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-[#123f7a] to-[#2b66aa] p-8 text-white md:flex md:items-center md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wide">
              <GraduationCap className="h-4 w-4" />
              For Freshers & Professionals
            </p>
            <h3 className="mt-3 text-3xl font-extrabold" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Build your profile, get discovered, and land your next role
            </h3>
            <p className="mt-2 text-blue-100">Join thousands of candidates and recruiters in one trusted platform.</p>
          </div>
          <div className="mt-5 flex gap-3 md:mt-0">
            <Link to="/register/candidate">
              <Button className="h-11 rounded-md bg-[#cf2f92] px-5 font-semibold text-white hover:bg-[#b42880]">Join As Candidate</Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="outline" className="h-11 rounded-md border-white bg-transparent px-5 font-semibold hover:text-[#123f7a]">Hire Talent</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;



