// এই ফাইলটি public facing informational page বা section render করে।
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Briefcase,
  Building2,
  CalendarClock,
  ChevronRight,
  CheckCircle2,
  GraduationCap,
  Landmark,
  MapPin,
  MessageSquareQuote,
  Rocket,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCandidateProfile, useCandidateRecommendations } from "@/services/candidateService";
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
  id?: string;
  title: string;
  location?: string;
  jobType?: string;
  salary?: number | { min: number; max: number; currency: string };
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  deadline?: string;
  company?: { name?: string } | string | null;
  relevanceScore?: number;
  skills?: string[];
};

const getHomeJobId = (job: HomeApiJob) => job._id || job.id || "";

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

const formatSkillsLabel = (skills: string[]) => {
  if (skills.length === 0) {
    return "Update your profile skills to improve matches.";
  }

  if (skills.length === 1) {
    return `Matched with your ${skills[0]} skill`;
  }

  return `Matched with your ${skills.slice(0, 3).join(", ")} skills`;
};

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" },
  },
};

const staggerParent: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: "easeOut" },
  },
};



const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const { user, isAuthenticated } = useAuth();
  const isCandidate = isAuthenticated && user?.role === "candidate";

  const { data: candidateProfile } = useCandidateProfile(isCandidate);
  const {
    data: candidateRecommendations,
    isLoading: isLoadingCandidateRecommendations,
    isError: isCandidateRecommendationsError,
  } = useCandidateRecommendations(10, isCandidate);

  const profileSkills = useMemo(
    () => candidateProfile?.data?.skills || user?.skills || [],
    [candidateProfile?.data?.skills, user?.skills]
  );

  const backendJobs = useMemo(() => {
    const recommended = (candidateRecommendations || []) as unknown as HomeApiJob[];

    if (!isCandidate || recommended.length === 0) {
      return [] as HomeApiJob[];
    }

    const mergedJobs = [...recommended];
    const seenIds = new Set<string>();

    return mergedJobs.filter((job) => {
      const jobId = getHomeJobId(job);

      if (!jobId || seenIds.has(jobId)) {
        return false;
      }

      seenIds.add(jobId);
      return true;
    });
  }, [candidateRecommendations, isCandidate]);

  const dashboardStats = useMemo(() => {
    const total = backendJobs.length;
    const fullTime = backendJobs.filter((job) => (job.jobType || "").toLowerCase() === "full-time").length;
    const uniqueCompanies = new Set(
      backendJobs.map((job) => {
        if (typeof job.company === "string") return job.company;
        return job.company?.name || "Confidential Company";
      })
    ).size;

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recent = backendJobs.filter((job) => {
      if (!job.deadline) return false;
      const date = new Date(job.deadline);
      return Number.isFinite(date.getTime()) && date >= oneWeekAgo;
    }).length;

    return {
      total,
      fullTime,
      uniqueCompanies,
      recent,
    };
  }, [backendJobs]);

  const cityTags = useMemo(() => {
    const locationCounts = backendJobs.reduce<Record<string, number>>((acc, job) => {
      const raw = job.location || "Bangladesh";
      const city = raw.split(",")[0]?.trim() || "Bangladesh";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([city, count]) => `${city} (${count})`);
  }, [backendJobs]);

  const quickLinks = useMemo(
    () => [
      { label: "All Jobs", count: dashboardStats.total, href: "/jobs" },
      { label: "Full Time Jobs", count: dashboardStats.fullTime, href: "/jobs" },
      { label: "Top Companies", count: dashboardStats.uniqueCompanies, href: "/jobs" },
      { label: "New Openings", count: dashboardStats.recent, href: "/jobs" },
    ],
    [dashboardStats.fullTime, dashboardStats.recent, dashboardStats.total, dashboardStats.uniqueCompanies]
  );

  const handleSearch = () => {
    const params = new URLSearchParams();

    if (searchText.trim()) {
      params.append("search", searchText.trim());
    }

    if (jobTypeFilter) {
      params.append("jobType", jobTypeFilter);
    }

    if (locationFilter.trim()) {
      params.append("location", locationFilter.trim());
    }

    navigate(`/jobs${params.toString() ? `?${params.toString()}` : ""}`);
  };





  const resourceCards = [
    {
      title: "How To Build A Winning CV In 2026",
      desc: "Format, keywords, and real recruiter tips that increase shortlist rate.",
      tag: "Career Tips",
    },
    {
      title: "Interview Questions For Freshers",
      desc: "Prepare with practical technical and HR questions by industry.",
      tag: "Interview",
    },
    {
      title: "Salary Negotiation In Bangladesh",
      desc: "A simple framework to negotiate confidently and professionally.",
      tag: "Growth",
    },
  ];

  const companies = ["Grameenphone", "bKash", "Pathao", "Brain Station 23", "ShopUp", "Robi", "Daraz", "Nagad"];

  const featuredJobs: FeaturedJobItem[] = useMemo(
    () =>
      backendJobs.length > 0
        ? backendJobs.map((job): FeaturedJobItem => ({
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
          routeId: getHomeJobId(job),
        }))
        : [],
    [backendJobs]
  );

  const isLoadingRecommendations = isCandidate ? isLoadingCandidateRecommendations : false;
  const recommendationHeadline = isCandidate
    ? "Recommended Jobs For You"
    : "Recommended Jobs";
  const recommendationDescription = isCandidate
    ? formatSkillsLabel(profileSkills)
    : "Login or register as candidate to see skill-based job recommendations.";

  return (
    <div className="bg-[linear-gradient(180deg,_#f4f8ff_0%,_#edf4ff_42%,_#f8fbff_100%)] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-blue-100 bg-[#eaf2ff] dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(37,92,159,0.26),_transparent_42%),radial-gradient(circle_at_bottom_left,_rgba(207,47,146,0.15),_transparent_35%)]" />
        <div className="absolute -left-24 top-10 h-64 w-64 rounded-full bg-[#2f6cb4]/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-[#cf2f92]/15 blur-3xl" />

        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-6 px-4 py-10 md:px-6 lg:grid-cols-[1fr_360px] lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pr-0 lg:pr-4"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-[#2f6cb4]/30 bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#1f4f93] backdrop-blur dark:border-blue-400/40 dark:bg-slate-900/70 dark:text-blue-200">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Career Platform
            </p>

            <h1 className="mt-4 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-[#0f2f57] dark:text-white md:text-5xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Build Your Future With The Right Job Match
            </h1>
            <p className="mt-4 max-w-2xl text-base text-slate-700 dark:text-slate-300 md:text-lg">
              Explore curated opportunities, filter by location and job type, and connect with top recruiters across Bangladesh in one streamlined experience.
            </p>

            <div className="mt-8 rounded-2xl border border-[#c8ddfb] bg-white/85 p-3 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/75 md:p-4">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_280px_160px_150px]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by keyword"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base outline-none ring-0 transition focus:border-[#1f4f93]/45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Location"
                    className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-4 text-base outline-none ring-0 transition focus:border-[#1f4f93]/45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  />
                </label>

                <label className="relative">
                  <Landmark className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="h-14 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-12 pr-10 text-base text-slate-600 outline-none transition focus:border-[#1f4f93]/45 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
                  >
                    <option value="">Job Type</option>
                    <option value="full-time">Full-time</option>
                    <option value="remote">Remote</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="freelance">Freelance</option>
                  </select>
                  <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90 text-slate-500" />
                </label>

                <Button
                  onClick={handleSearch}
                  className="h-14 rounded-xl bg-[#1f4f93] text-base font-semibold text-white hover:bg-[#183f77]"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1f4f93]">
                  <Briefcase className="h-4 w-4" />
                  Live Jobs
                </div>
                <p className="mt-2 text-3xl font-extrabold text-[#123f7a] dark:text-blue-200">{dashboardStats.total || 0}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1f4f93]">
                  <Sparkles className="h-4 w-4" />
                  Full Time
                </div>
                <p className="mt-2 text-3xl font-extrabold text-[#123f7a] dark:text-blue-200">{dashboardStats.fullTime || 0}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1f4f93]">
                  <Building2 className="h-4 w-4" />
                  Companies
                </div>
                <p className="mt-2 text-3xl font-extrabold text-[#123f7a] dark:text-blue-200">{dashboardStats.uniqueCompanies || 0}</p>
              </div>
              <div className="rounded-xl border border-blue-100 bg-white/90 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#1f4f93]">
                  <CalendarClock className="h-4 w-4" />
                  New Jobs
                </div>
                <p className="mt-2 text-3xl font-extrabold text-[#123f7a] dark:text-blue-200">{dashboardStats.recent || 0}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {(cityTags.length > 0 ? cityTags : ["Dhaka", "Chattogram", "Sylhet", "Khulna"]).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => navigate(`/jobs?location=${encodeURIComponent(city.split(" (")[0])}`)}
                  className="rounded-full border border-[#2f6cb4]/40 bg-white/70 px-3 py-1.5 text-sm font-semibold text-[#1f4f93] transition hover:border-[#1f4f93] hover:bg-white dark:border-blue-400/40 dark:bg-slate-900/70 dark:text-blue-200"
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
            className="mt-2 rounded-2xl border border-blue-200/70 bg-white/90 p-6 text-[#123f7a] shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-100 lg:mt-0"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f6cb4] dark:text-blue-300">Navigation</p>
            <h2 className="mb-5 mt-2 text-3xl font-bold uppercase" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Quick Links
            </h2>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="group flex items-center gap-2 rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5 text-sm font-semibold text-[#123f7a] transition hover:border-[#2f6cb4]/45 hover:bg-[#f2f7ff] dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-blue-400/50 dark:hover:bg-slate-700">
                    <ChevronRight className="h-4 w-4 text-[#2f6cb4] transition group-hover:translate-x-0.5 dark:text-blue-300" />
                    <span>{item.label}</span>
                    <span className="ml-auto rounded-full bg-[#1f4f93] px-2 py-0.5 text-xs font-semibold text-white dark:bg-blue-400/25 dark:text-blue-100">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-xl bg-gradient-to-r from-[#1f4f93] to-[#2f6cb4] p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-100">Need a strong profile?</p>
              <p className="mt-1 text-sm">Complete your account and improve your visibility to recruiters.</p>
              <Link to="/register/candidate" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/95 hover:text-white">
                Create Candidate Profile
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.aside>
        </div>
      </section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-6"
      >
        <div className="w-full rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85 md:flex md:items-center md:justify-between md:p-7">
          <div>
            <p className="inline-flex rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f4f93] dark:bg-blue-500/20 dark:text-blue-200">
              Get Started
            </p>
            <h3 className="mt-3 text-3xl font-bold text-[#1f4f93] dark:text-blue-300" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Start Your Journey Today
            </h3>
            <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">Create your profile and get hired by top companies in Bangladesh.</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3 md:mt-0">
            <Link to="/register/candidate">
              <Button className="h-12 rounded-md bg-[#cf2f92] px-6 text-base font-semibold text-white hover:bg-[#b42880]">
                Candidate Registration
              </Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="outline" className="h-12 rounded-md border-[#1f4f93] px-6 text-base font-semibold text-[#1f4f93] hover:bg-[#edf4ff] dark:border-blue-300 dark:text-blue-200 dark:hover:bg-blue-500/10">
                Recruiter Registration
              </Button>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[1320px] px-4 pb-4 md:px-6"
      >
        <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trusted by Leading Companies</p>
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 lg:grid-cols-8"
          >
            {companies.map((company) => (
              <motion.div
                key={company}
                variants={staggerChild}
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-800 px-2 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:shadow dark:text-slate-200"
              >
                {company}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.12 }}
        className="mx-auto max-w-[1320px] px-4 py-12 md:px-6"
      >
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f4f93] dark:bg-blue-500/20 dark:text-blue-200">Top Matches</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>{recommendationHeadline}</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {isLoadingRecommendations
                ? "Loading personalized recommendations..."
                : isCandidate && isCandidateRecommendationsError
                  ? "Personalized recommendations are unavailable right now. Please try again shortly."
                  : recommendationDescription
              }
            </p>
          </div>
          <Link to="/jobs" className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-[#1f4f93] shadow-sm transition hover:border-[#1f4f93]/40 hover:text-[#153a6f] dark:border-slate-700 dark:bg-slate-900 dark:text-blue-200">
            View All Jobs
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {isLoadingRecommendations ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5"
              >
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : featuredJobs.length > 0 ? (
            featuredJobs.map((job) => (
              <motion.div
                key={job.routeId}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.16 }}
                transition={{ duration: 0.35 }}
              >
                <Link
                  to={job.routeId ? `/jobs/${job.routeId}` : "/jobs"}
                  className="group block rounded-xl border border-blue-100 bg-white p-5 shadow-sm ring-1 ring-transparent transition hover:-translate-y-0.5 hover:border-[#1f4f93]/40 hover:shadow-md hover:ring-[#1f4f93]/10 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#e9f2ff] px-3 py-1 text-xs font-bold uppercase text-[#1f4f93]">{job.type}</span>
                    <span className="rounded-full bg-[#ffeaf7] px-3 py-1 text-xs font-bold uppercase text-[#b42880]">
                      {isCandidate ? "Recommended" : "Featured"}
                    </span>
                  </div>

                  <h4 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h4>
                  <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{job.company}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{job.location}</p>
                    <p className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" />{job.salary}</p>
                    <p className="col-span-2 inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" />{job.deadline}</p>
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f93] group-hover:text-[#153a6f]">
                    See details
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </Link>
              </motion.div>
            ))
          ) : (
            <div className="md:col-span-2 rounded-xl border border-dashed border-blue-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 p-7 text-center">
              <p className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                {isCandidate
                  ? "No recommendations found yet. Add more skills in your profile to improve matching."
                  : "No jobs are shown for guests."}
              </p>
              {!isCandidate && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  Please login or register as a candidate to view recommended jobs on the home page.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[1320px] px-4 py-10 md:px-6"
      >
        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <motion.div variants={staggerChild} whileHover={{ y: -3 }} className="rounded-xl bg-gradient-to-br from-[#123f7a] to-[#1a508f] p-6 text-white shadow-md ring-1 ring-white/10">
            <Users className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">85K+</h4>
            <p className="text-blue-100">Active Candidates</p>
          </motion.div>
          <motion.div variants={staggerChild} whileHover={{ y: -3 }} className="rounded-xl bg-gradient-to-br from-[#1c5da8] to-[#246bbf] p-6 text-white shadow-md ring-1 ring-white/10">
            <Rocket className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">12K+</h4>
            <p className="text-blue-100">Successful Placements</p>
          </motion.div>
          <motion.div variants={staggerChild} whileHover={{ y: -3 }} className="rounded-xl bg-gradient-to-br from-[#2d78cb] to-[#3f8de3] p-6 text-white shadow-md ring-1 ring-white/10">
            <CheckCircle2 className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">97%</h4>
            <p className="text-blue-100">Employer Satisfaction</p>
          </motion.div>
        </motion.div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[1320px] px-4 py-12 md:px-6"
      >
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <p className="mb-2 inline-flex rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1f4f93] dark:bg-blue-500/20 dark:text-blue-200">Learning Hub</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Career Resources</h3>
            <p className="text-slate-600 dark:text-slate-400">Guides to help you get hired faster</p>
          </div>
          <Link to="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f93] hover:text-[#153a6f]">
            Explore More
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <motion.div
          variants={staggerParent}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {resourceCards.map((item) => (
            <motion.article
              key={item.title}
              variants={staggerChild}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm ring-1 ring-transparent transition hover:ring-[#1f4f93]/12 hover:shadow-md"
            >
              <span className="rounded bg-[#edf4ff] px-2 py-1 text-xs font-bold uppercase text-[#1f4f93]">{item.tag}</span>
              <h4 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              <button type="button" className="mt-4 inline-flex items-center gap-2 rounded-full border border-blue-200 px-3 py-1.5 text-sm font-semibold text-[#1f4f93] transition hover:border-[#1f4f93]/40 hover:text-[#153a6f] dark:border-slate-700 dark:text-blue-200 dark:hover:border-blue-400/40">
                Read Article
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </motion.article>
          ))}
        </motion.div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[1320px] px-4 py-8 md:px-6"
      >
        <div className="rounded-2xl border border-blue-100 dark:border-slate-800 bg-white/95 dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Success Stories</h3>
          <motion.div
            variants={staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2"
          >
            <motion.div variants={staggerChild} className="rounded-lg border border-blue-100 bg-[#f6f9ff] dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm">
              <MessageSquareQuote className="h-6 w-6 text-[#1f4f93]" />
              <p className="mt-3 text-slate-700 dark:text-slate-300">I got my first software job within 3 weeks using this platform. The filters and alerts are excellent.</p>
              <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">Sadia Rahman, Software Engineer</p>
            </motion.div>
            <motion.div variants={staggerChild} className="rounded-lg border border-blue-100 bg-[#f6f9ff] dark:border-slate-700 dark:bg-slate-800 p-5 shadow-sm">
              <MessageSquareQuote className="h-6 w-6 text-[#1f4f93]" />
              <p className="mt-3 text-slate-700 dark:text-slate-300">As a recruiter, shortlisting became much faster. Candidate quality and profile matching are impressive.</p>
              <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">Mahin Karim, HR Lead</p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        variants={sectionReveal}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mx-auto max-w-[1320px] px-4 pb-14 pt-8 md:px-6"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4 }}
          className="rounded-2xl border border-white/20 bg-gradient-to-r from-[#123f7a] to-[#2b66aa] p-8 text-white shadow-xl ring-1 ring-white/10 md:flex md:items-center md:justify-between"
        >
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
              <Button className="h-11 rounded-md bg-[#cf2f92] px-5 font-semibold text-white shadow-md hover:bg-[#b42880]">Join As Candidate</Button>
            </Link>
            <Link to="/register/recruiter">
              <Button variant="outline" className="h-11 rounded-md border-white bg-transparent px-5 font-semibold text-white hover:bg-white hover:text-[#123f7a]">Hire Talent</Button>
            </Link>
          </div>
        </motion.div>
      </motion.section>
    </div>
  );
};

export default HomePage;

