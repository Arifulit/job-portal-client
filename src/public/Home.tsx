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
  Stethoscope,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useJobRecommendations } from "@/services/jobService";

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
  company?: { name?: string } | string | null;
  relevanceScore?: number;
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



const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");

  const { data: recommendedJobs, isLoading: isLoadingRecommendations } = useJobRecommendations(10);

  const backendJobs = useMemo(
    () => (recommendedJobs || []) as unknown as HomeApiJob[],
    [recommendedJobs]
  );

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
        ? backendJobs.slice(0, 4).map((job): FeaturedJobItem => ({
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
    [backendJobs]
  );

  return (
    <div className="bg-[#f3f8ff] dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="relative overflow-hidden border-b border-blue-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff]/95 via-[#eff6ff]/90 to-[#e6f0ff]/85" />

        <div className="relative mx-auto grid max-w-[1320px] grid-cols-1 gap-0 px-4 py-8 md:px-6 lg:grid-cols-[1fr_340px]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="pr-0 lg:pr-8"
          >
            <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white md:text-5xl" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Find The Right Job
            </h1>

            <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#1f5ca7] bg-white dark:bg-slate-900">
                  <Briefcase className="h-7 w-7 text-[#1f5ca7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-[#1f5ca7]">Live Jobs</p>
                  <p className="text-4xl font-extrabold leading-none text-[#1f5ca7]">{dashboardStats.total || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#1f5ca7] bg-white dark:bg-slate-900">
                  <Sparkles className="h-7 w-7 text-[#1f5ca7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-[#1f5ca7]">Full Time</p>
                  <p className="text-4xl font-extrabold leading-none text-[#1f5ca7]">{dashboardStats.fullTime || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#1f5ca7] bg-white dark:bg-slate-900">
                  <Building2 className="h-7 w-7 text-[#1f5ca7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-[#1f5ca7]">Companies</p>
                  <p className="text-4xl font-extrabold leading-none text-[#1f5ca7]">{dashboardStats.uniqueCompanies || 0}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#1f5ca7] bg-white dark:bg-slate-900">
                  <Stethoscope className="h-7 w-7 text-[#1f5ca7]" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase text-[#1f5ca7]">New Jobs</p>
                  <p className="text-4xl font-extrabold leading-none text-[#1f5ca7]">{dashboardStats.recent || 0}</p>
                </div>
              </div>
            </div>

            <div className="mt-7 rounded-md bg-[#1f4f93] p-3 shadow-lg">
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_300px_160px_160px]">
                <label className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    placeholder="Search by keyword"
                    className="h-14 w-full rounded-md border-0 bg-white dark:bg-slate-900 dark:text-slate-100 pl-12 pr-4 text-lg outline-none ring-0"
                  />
                </label>

                <label className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    placeholder="Location"
                    className="h-14 w-full rounded-md border-0 bg-white dark:bg-slate-900 dark:text-slate-100 pl-12 pr-4 text-lg outline-none ring-0"
                  />
                </label>

                <label className="relative">
                  <Landmark className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <select
                    value={jobTypeFilter}
                    onChange={(e) => setJobTypeFilter(e.target.value)}
                    className="h-14 w-full appearance-none rounded-md border-0 bg-white dark:bg-slate-900 pl-12 pr-10 text-lg text-slate-500 dark:text-slate-300 outline-none"
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
                  onClick={handleSearch}
                  className="h-14 rounded-md bg-[#9ac8a2] text-2xl font-semibold text-slate-900 hover:bg-[#88ba91]"
                >
                  Search
                </Button>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              {(cityTags.length > 0 ? cityTags : ["Dhaka", "Chattogram", "Sylhet", "Khulna"]).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => navigate(`/jobs?location=${encodeURIComponent(city.split(" (")[0])}`)}
                  className="rounded bg-[#4a70a8]/85 px-3 py-1.5 text-base font-semibold text-white transition hover:bg-[#345d99]"
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
            className="mt-6 bg-[#255c9f] p-6 text-white lg:mt-0"
          >
            <h2 className="mb-4 text-3xl font-bold uppercase" style={{ fontFamily: "Montserrat, sans-serif" }}>
              Quick Links
            </h2>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.label}>
                  <Link to={item.href} className="flex items-center gap-2 text-base text-white/95 transition hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="ml-auto rounded bg-white/20 px-2 py-0.5 text-xs font-semibold">{item.count}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.aside>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row md:px-6">
        <div>
          <h3 className="text-3xl font-bold text-[#1f4f93] dark:text-blue-300" style={{ fontFamily: "Montserrat, sans-serif" }}>
            Start Your Journey Today
          </h3>
          <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">Create your profile and get hired by top companies in Bangladesh.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/register/candidate">
            <Button className="h-12 rounded-md bg-[#cf2f92] px-6 text-base font-semibold text-white hover:bg-[#b42880]">
              Candidate Registration
            </Button>
          </Link>
          <Link to="/register/recruiter">
            <Button variant="outline" className="h-12 rounded-md border-[#1f4f93] px-6 text-base font-semibold text-[#1f4f93] hover:bg-[#edf4ff]">
              Recruiter Registration
            </Button>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 pb-4 md:px-6">
        <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Trusted by Leading Companies</p>
          <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4 lg:grid-cols-8">
            {companies.map((company) => (
              <div key={company} className="rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-3 text-sm font-bold text-slate-700 dark:text-slate-200">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 md:px-6">
        <div className="mb-7 flex items-end justify-between gap-3">
          <div>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Featured Jobs</h3>
            <p className="text-slate-600 dark:text-slate-400">
              {isLoadingRecommendations
                ? "Loading personalized recommendations..."
                : backendJobs.length > 0
                  ? "Live opportunities from backend"
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
          {isLoadingRecommendations ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
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
              <article key={job.routeId} className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#e9f2ff] px-3 py-1 text-xs font-bold uppercase text-[#1f4f93]">{job.type}</span>
                  <span className="rounded-full bg-[#ffeaf7] px-3 py-1 text-xs font-bold uppercase text-[#b42880]">Featured</span>
                </div>

                <h4 className="mt-3 text-xl font-bold text-slate-900 dark:text-slate-100">{job.title}</h4>
                <p className="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-300">{job.company}</p>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <p className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" />{job.location}</p>
                  <p className="inline-flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" />{job.salary}</p>
                  <p className="col-span-2 inline-flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" />{job.deadline}</p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Link to={job.routeId ? `/jobs/${job.routeId}` : "/jobs"} className="text-sm font-semibold text-[#1f4f93] hover:text-[#153a6f]">See details</Link>
                  <Button className="h-10 rounded-md bg-[#cf2f92] px-4 text-sm text-white hover:bg-[#b42880]">Apply Now</Button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-10 md:px-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-[#123f7a] p-6 text-white shadow-md">
            <Users className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">85K+</h4>
            <p className="text-blue-100">Active Candidates</p>
          </div>
          <div className="rounded-xl bg-[#1c5da8] p-6 text-white shadow-md">
            <Rocket className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">12K+</h4>
            <p className="text-blue-100">Successful Placements</p>
          </div>
          <div className="rounded-xl bg-[#2d78cb] p-6 text-white shadow-md">
            <CheckCircle2 className="h-8 w-8" />
            <h4 className="mt-4 text-3xl font-extrabold">97%</h4>
            <p className="text-blue-100">Employer Satisfaction</p>
          </div>
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
          {resourceCards.map((item) => (
            <article key={item.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm">
              <span className="rounded bg-[#edf4ff] px-2 py-1 text-xs font-bold uppercase text-[#1f4f93]">{item.tag}</span>
              <h4 className="mt-4 text-xl font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{item.desc}</p>
              <button type="button" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#1f4f93] hover:text-[#153a6f]">
                Read Article
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-8 md:px-6">
        <div className="rounded-xl border border-blue-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100" style={{ fontFamily: "Montserrat, sans-serif" }}>Success Stories</h3>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg bg-[#f6f9ff] dark:bg-slate-800 p-5">
              <MessageSquareQuote className="h-6 w-6 text-[#1f4f93]" />
              <p className="mt-3 text-slate-700 dark:text-slate-300">I got my first software job within 3 weeks using this platform. The filters and alerts are excellent.</p>
              <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">Sadia Rahman, Software Engineer</p>
            </div>
            <div className="rounded-lg bg-[#f6f9ff] dark:bg-slate-800 p-5">
              <MessageSquareQuote className="h-6 w-6 text-[#1f4f93]" />
              <p className="mt-3 text-slate-700 dark:text-slate-300">As a recruiter, shortlisting became much faster. Candidate quality and profile matching are impressive.</p>
              <p className="mt-4 text-sm font-bold text-slate-900 dark:text-slate-100">Mahin Karim, HR Lead</p>
            </div>
          </div>
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
              <Button variant="outline" className="h-11 rounded-md border-white bg-transparent px-5 font-semibold text-white hover:bg-white hover:text-[#123f7a]">Hire Talent</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

