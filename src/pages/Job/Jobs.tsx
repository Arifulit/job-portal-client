import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useJobs } from '../../services/jobService';
import { JobCard } from '../../components/JobCard';
import { Loader } from '../../components/Loader';
import { Search, Filter, MapPin, Briefcase, Building, TrendingUp, Clock } from 'lucide-react';
import { JobFilters } from '../../types';
import { debounce } from '../../utils/helpers';

const Jobs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState<JobFilters>({
    keyword: '',
    category: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    page: 1,
    limit: 12,
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
      limit: 12,
    };
    setFilters(urlFilters);
  }, [searchParams]);

  const { data, isLoading, isError } = useJobs(filters);
  const jobs = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalJobs = data?.pagination?.total || 0;
  const fullTimeCount = jobs.filter((job) => String(job.jobType || '').toLowerCase() === 'full-time').length;
  const uniqueCompanyCount = new Set(
    jobs
      .map((job) => {
        if (typeof job.company === 'string') return job.company;
        return job.company?.name || null;
      })
      .filter(Boolean)
  ).size;
  const newJobsCount = jobs.filter((job) => {
    if (!job.createdAt) return false;
    const createdTime = new Date(job.createdAt).getTime();
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return createdTime >= sevenDaysAgo;
  }).length;
  const locationCounts = jobs.reduce<Record<string, number>>((acc, job) => {
    const location = String(job.location || '').toLowerCase();
    if (location.includes('dhaka')) acc.Dhaka = (acc.Dhaka || 0) + 1;
    if (location.includes('chittagong')) acc.Chittagong = (acc.Chittagong || 0) + 1;
    return acc;
  }, {});

  console.log('Current filters being used:', filters); // Debug log

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is already handled by handleSearchChange
  };

  const handleSearchChange = debounce((value: string) => {
    console.log('Search input changed:', value); // Debug log
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
      
      console.log('Filters updated:', newFilters); // Debug log
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

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Failed to load jobs</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Briefcase className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{totalJobs}</span>
              </div>
              <span className="text-sm">LIVE JOBS</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{fullTimeCount}</span>
              </div>
              <span className="text-sm">FULL TIME</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Building className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{uniqueCompanyCount}</span>
              </div>
              <span className="text-sm">COMPANIES</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">{newJobsCount}</span>
              </div>
              <span className="text-sm">NEW JOBS</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-lg mb-8 text-blue-100">Discover opportunities that match your skills</p>

          {/* Professional Search Bar */}
          <div className="bg-white rounded-xl shadow-xl p-6">
            <form onSubmit={handleSearchSubmit}>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${filters.keyword ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Search by keyword"
                    value={filters.keyword}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 ${
                      filters.keyword ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div className="relative lg:w-48">
                  <MapPin className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${filters.location ? 'text-blue-500' : 'text-gray-400'}`} />
                  <input
                    type="text"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 placeholder-gray-500 ${
                      filters.location ? 'border-blue-300 bg-blue-50' : 'border-gray-300'
                    }`}
                  />
                </div>
                <div className="relative lg:w-48">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 appearance-none"
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  >
                    <option value="">Job Type</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 shadow-lg"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Location Pills */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button 
                onClick={() => handleFilterChange('location', 'Dhaka')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.location === 'Dhaka' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Dhaka ({locationCounts.Dhaka || 0})
              </button>
              <button 
                onClick={() => handleFilterChange('location', 'Chittagong')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.location === 'Chittagong' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Chittagong ({locationCounts.Chittagong || 0})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>

              <div className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Job Type</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
                    value={filters.jobType}
                    onChange={(e) => handleFilterChange('jobType', e.target.value)}
                  >
                    <option value="">All Types</option>
                    <option value="full-time">Full Time</option>
                    <option value="part-time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                    <option value="remote">Remote</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Experience Level</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
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

                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Category</span>
                  </label>
                  <select
                    className="select select-bordered select-sm w-full"
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
                  className="btn btn-ghost btn-sm w-full"
                  onClick={() => {
                    setFilters({
                      keyword: '',
                      category: '',
                      location: '',
                      jobType: '',
                      experienceLevel: '',
                      page: 1,
                      limit: 12,
                    });
                    // Clear all URL parameters
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                QUICK LINKS
              </h3>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, location: '', jobType: '', keyword: '', page: 1 }));
                    setSearchParams(new URLSearchParams());
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">All Jobs</span>
                  <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-semibold">{totalJobs}</span>
                </button>
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, jobType: 'full-time', page: 1 }));
                    const params = new URLSearchParams();
                    params.set('jobType', 'full-time');
                    setSearchParams(params);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">Full Time Jobs</span>
                  <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">{fullTimeCount}</span>
                </button>
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, keyword: 'top', page: 1 }));
                    const params = new URLSearchParams();
                    params.set('search', 'top');
                    setSearchParams(params);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">Top Companies</span>
                  <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs font-semibold">{uniqueCompanyCount}</span>
                </button>
                <button 
                  onClick={() => {
                    setFilters(prev => ({ ...prev, keyword: 'new', page: 1 }));
                    const params = new URLSearchParams();
                    params.set('search', 'new');
                    setSearchParams(params);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-between"
                >
                  <span className="font-medium text-gray-700">New Openings</span>
                  <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs font-semibold">{newJobsCount}</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {isLoading ? (
              <Loader />
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center text-gray-600">
                    <Briefcase className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      {isLoading ? 'Searching...' : `${data?.pagination?.total || 0} jobs found`}
                      {filters.keyword && ` for "${filters.keyword}"`}
                      {filters.location && ` in "${filters.location}"`}
                    </span>
                  </div>
                  {(filters.keyword || filters.location) && (
                    <div className="flex gap-2">
                      {filters.keyword && (
                        <button
                          onClick={() => {
                            setFilters(prev => ({ ...prev, keyword: '', page: 1 }));
                            const params = new URLSearchParams(searchParams);
                            params.delete('search');
                            setSearchParams(params);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear search
                        </button>
                      )}
                      {filters.location && (
                        <button
                          onClick={() => {
                            setFilters(prev => ({ ...prev, location: '', page: 1 }));
                            const params = new URLSearchParams(searchParams);
                            params.delete('location');
                            setSearchParams(params);
                          }}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Clear location
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {data && data.data.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      {data.data.map((job) => (
                        <JobCard key={job._id} job={job} />
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex justify-center">
                        <div className="join">
                          <button
                            className="join-item btn"
                            onClick={() => handlePageChange(filters.page! - 1)}
                            disabled={filters.page === 1}
                          >
                            Previous
                          </button>
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                            (page) => (
                              <button
                                key={page}
                                className={`join-item btn ${
                                  page === filters.page ? 'btn-active' : ''
                                }`}
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            )
                          )}
                          <button
                            className="join-item btn"
                            onClick={() => handlePageChange(filters.page! + 1)}
                            disabled={filters.page === totalPages}
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-xl text-gray-600">No jobs found</p>
                    <p className="text-gray-500 mt-2">Try adjusting your filters</p>
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
