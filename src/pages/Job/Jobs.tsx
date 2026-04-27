// এই ফাইলটি job listing/details related page rendering ও data flow পরিচালনা করে।
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs, useSavedJobs } from '../../services/jobService';
import { JobCard } from '../../components/JobCard';
import { Loader } from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Search, Briefcase, Star, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { JobFilters } from '../../types';
import { debounce } from '../../utils/helpers';

const sectionReveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35 },
  },
};

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const normalizedRole = String(user?.role || '').toLowerCase();
  const canUseSavedJobs = ['candidate', 'seeker', 'job_seeker'].includes(normalizedRole);
  
  const [filters, setFilters] = useState<JobFilters>({
    keyword: '',
    category: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    page: 1,
    limit: 10,
  });

  // Read URL parameters and update filters
  useEffect(() => {
    const urlFilters: JobFilters = {
      keyword: searchParams.get('keyword') || searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      jobType: searchParams.get('jobType') || '',
      experienceLevel: searchParams.get('experienceLevel') || '',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Number(searchParams.get('limit') || '10'),
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const { data, isLoading, isError } = useJobs(filters);
  const { data: savedJobs = [] } = useSavedJobs();
  const savedJobIds = new Set(
    canUseSavedJobs ? savedJobs.map((job) => String(job._id || (job as { id?: string }).id || '')) : []
  );
  const jobs = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalJobs = data?.pagination?.total || 0;
  const totalVacancies = jobs.reduce((sum, job) => sum + (typeof job.vacancies === 'number' ? job.vacancies : 0), 0);
  const activeFilterCount = [
    filters.keyword,
    filters.location,
    filters.jobType,
    filters.category,
    filters.experienceLevel,
  ].filter(Boolean).length;
  const currentPage = filters.page || 1;

  const getPaginationItems = (page: number, pages: number): Array<number | 'ellipsis'> => {
    if (pages <= 7) {
      return Array.from({ length: pages }, (_, i) => i + 1);
    }

    const items: Array<number | 'ellipsis'> = [1];
    let start = Math.max(2, page - 1);
    let end = Math.min(pages - 1, page + 1);

    if (page <= 3) {
      end = 4;
    }

    if (page >= pages - 2) {
      start = pages - 3;
    }

    if (start > 2) {
      items.push('ellipsis');
    }

    for (let p = start; p <= end; p += 1) {
      items.push(p);
    }

    if (end < pages - 1) {
      items.push('ellipsis');
    }

    items.push(pages);

    return items;
  };

  const paginationItems = getPaginationItems(currentPage, totalPages);

  const handleLimitChange = (value: number) => {
    setFilters((prev) => {
      const newFilters = { ...prev, limit: value, page: 1 };
      const params = new URLSearchParams(searchParams);
      params.set('limit', String(value));
      params.set('page', '1');
      setSearchParams(params);
      return newFilters;
    });
  };

  const handleSearchChange = debounce((value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, keyword: value, page: 1 };
      
      // Update URL
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }
      params.set('page', '1');
      setSearchParams(params);

      return newFilters;
    });
  }, 500);

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value, page: 1 };
      
      // Update URL
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1');
      setSearchParams(params);
      
      return newFilters;
    });
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => {
      const newFilters = { ...prev, page: newPage };
      
      // Update URL
      const params = new URLSearchParams(searchParams);
      params.set('page', String(newPage));
      setSearchParams(params);
      
      return newFilters;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearAllFilters = () => {
    setFilters({
      keyword: '',
      category: '',
      location: '',
      jobType: '',
      experienceLevel: '',
      page: 1,
      limit: 10,
    });
    setSearchParams(new URLSearchParams());
  };

  if (isError) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_56%,_#f8fafc_100%)] flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 text-center shadow-sm">
          <p className="mb-4 text-xl font-semibold text-red-700">Failed to load jobs</p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f3f5] px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 pb-3">
          <p className="text-3xl font-extrabold leading-none text-[#0b3d66] md:text-4xl">
            {totalJobs} Jobs <span className="mx-2 text-slate-500">|</span>
            <span className="text-2xl text-[#334e68] md:text-3xl">{totalVacancies || `${Math.max(totalJobs * 4, totalJobs)}`}+ Vacancies</span>
          </p>

          {totalPages > 1 && (
            <div className="flex items-center gap-2 rounded-xl">
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <span className="inline-flex items-center gap-1">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              </button>
              {paginationItems.map((item, idx) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-top-${idx}`} className="px-1 text-lg font-semibold text-slate-500">...</span>
                ) : (
                  <button
                    key={item}
                    className={`h-11 w-11 rounded-xl text-sm font-bold ${item === currentPage ? 'bg-[#0b77b7] text-white' : 'bg-transparent text-slate-700'}`}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <span className="inline-flex items-center gap-1">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              </button>
            </div>
          )}
        </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_1fr]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:h-fit">
          <motion.div
            variants={sectionReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="rounded-xl border border-slate-300 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#0b77b7]" />
                <input
                  type="text"
                  placeholder="Search for Jobs..."
                  value={filters.keyword}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-300 bg-[#f8f9fa] pl-11 pr-3 text-base font-medium text-slate-700 outline-none focus:border-[#0b77b7]"
                />
              </label>
            </div>

            <div className="p-5">
              <h3 className="mb-3 text-2xl font-bold text-slate-700">More Filters</h3>
              <div className="space-y-3">
              <div>
                <label className="mb-1.5 block text-base font-medium text-slate-700">Job Type</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  value={filters.jobType}
                  onChange={(e) => handleFilterChange('jobType', e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="full-time">Full Time</option>
                  <option value="remote">Remote</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-base font-medium text-slate-700">Experience Level</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  value={filters.experienceLevel}
                  onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                >
                  <option value="">All Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-base font-medium text-slate-700">Category</label>
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="technology">Technology</option>
                  <option value="marketing">Marketing</option>
                  <option value="design">Design</option>
                  <option value="sales">Sales</option>
                  <option value="finance">Finance</option>
                  <option value="hr">Human Resources</option>
                </select>
              </div>

              <button
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={clearAllFilters}
              >
                Clear Filters
              </button>
            </div>
            </div>
          </motion.div>
        </aside>

        <main>
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <motion.div
                variants={sectionReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                className="mb-4 rounded-xl border border-slate-300 bg-white p-5 shadow-sm"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="inline-flex items-center gap-2 text-2xl font-bold text-slate-900">
                    <Star className="h-5 w-5 text-[#ff922b]" />
                    Featured
                  </h2>

                  <label className="inline-flex items-center gap-2 text-sm text-slate-700 md:text-base">
                    Jobs per page
                    <select
                      value={Number(filters.limit || 10)}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm font-semibold text-slate-700"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={30}>30</option>
                      <option value={50}>50</option>
                    </select>
                  </label>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center text-slate-700">
                    <Briefcase className="mr-2 h-4 w-4 text-[#0b77b7]" />
                    <span className="text-sm font-medium">
                      {`${data?.pagination?.total || 0} jobs found`}
                      {filters.keyword && ` for "${filters.keyword}"`}
                      {filters.location && ` in "${filters.location}"`}
                    </span>
                  </div>

                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    {activeFilterCount} active filters
                  </div>

                  {(filters.keyword || filters.location || filters.jobType || filters.category || filters.experienceLevel) && (
                    <div className="flex flex-wrap gap-2">
                      {filters.keyword && (
                        <button
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, keyword: '', page: 1 }));
                            const params = new URLSearchParams(searchParams);
                            params.delete('search');
                            params.set('page', '1');
                            setSearchParams(params);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Search
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {filters.location && (
                        <button
                          onClick={() => {
                            setFilters((prev) => ({ ...prev, location: '', page: 1 }));
                            const params = new URLSearchParams(searchParams);
                            params.delete('location');
                            params.set('page', '1');
                            setSearchParams(params);
                          }}
                          className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                        >
                          Location
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <button
                        onClick={clearAllFilters}
                        className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Reset All
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>

              {data && data.data.length > 0 ? (
                <>
                  <div className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
                    {data.data.map((job, idx) => (
                      <motion.div
                        key={job._id}
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.16 }}
                        transition={{ duration: 0.28, delay: Math.min(idx * 0.03, 0.2) }}
                      >
                        <JobCard
                          job={job}
                          isSaved={savedJobIds.has(String(job._id || (job as { id?: string }).id || ''))}
                        />
                      </motion.div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm">
                        <button
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <span className="inline-flex items-center gap-1">
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                          </span>
                        </button>
                        {paginationItems.map((item, idx) =>
                          item === 'ellipsis' ? (
                            <span key={`ellipsis-bottom-${idx}`} className="px-1 text-lg font-semibold text-slate-500">...</span>
                          ) : (
                            <button
                              key={item}
                              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                                item === currentPage
                                  ? 'bg-[#0b77b7] text-white'
                                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                              }`}
                              onClick={() => handlePageChange(item)}
                            >
                              {item}
                            </button>
                          )
                        )}
                        <button
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <span className="inline-flex items-center gap-1">
                            Next
                            <ChevronRight className="h-4 w-4" />
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-xl border border-slate-300 bg-white py-12 text-center shadow-sm">
                  <Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                  <p className="text-xl font-semibold text-slate-700">No jobs found</p>
                  <p className="mt-1.5 text-sm text-slate-500">Try updating your filters or clearing search criteria.</p>
                  <button
                    onClick={clearAllFilters}
                    className="mt-5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                  >
                    Show All Jobs
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      </div>
    </div>
  );
};

export default Jobs;
