import { useState } from 'react';
import { useJobs } from '../../services/jobService';
import { JobCard } from '../../components/JobCard';
import { Loader } from '../../components/Loader';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react';
import { JobFilters } from '../../types';
import { debounce } from '../../utils/helpers';

export const Jobs = () => {
  const [filters, setFilters] = useState<JobFilters>({
    search: '',
    category: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    page: 1,
    limit: 12,
  });

  const { data, isLoading, isError } = useJobs(filters);

  const handleSearchChange = debounce((value: string) => {
    setFilters((prev) => ({ ...prev, search: value, page: 1 }));
  }, 500);

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
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
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">Find Your Dream Job</h1>
          <p className="text-xl mb-8">Discover opportunities that match your skills</p>

          <div className="bg-white rounded-lg p-4 shadow-lg">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Job title, keywords..."
                  className="input input-bordered w-full pl-10 text-gray-800"
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <div className="relative md:w-64">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Location"
                  className="input input-bordered w-full pl-10 text-gray-800"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>
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
                  onClick={() =>
                    setFilters({
                      search: '',
                      category: '',
                      location: '',
                      jobType: '',
                      experienceLevel: '',
                      page: 1,
                      limit: 12,
                    })
                  }
                >
                  Clear Filters
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
                      {data?.pagination.total || 0} jobs found
                    </span>
                  </div>
                </div>

                {data && data.data.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      {data.data.map((job) => (
                        <JobCard key={job._id} job={job} />
                      ))}
                    </div>

                    {data.pagination.pages > 1 && (
                      <div className="flex justify-center">
                        <div className="join">
                          <button
                            className="join-item btn"
                            onClick={() => handlePageChange(filters.page! - 1)}
                            disabled={filters.page === 1}
                          >
                            Previous
                          </button>
                          {Array.from({ length: data.pagination.pages }, (_, i) => i + 1).map(
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
                            disabled={filters.page === data.pagination.pages}
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
