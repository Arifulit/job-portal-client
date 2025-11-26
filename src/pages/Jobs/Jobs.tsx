
// src/pages/Jobs/Jobs.tsx
import React from 'react';
import { useJobs } from '../../services/jobService';
import { Link } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { MapPin, Briefcase, Calendar, Building2, Clock, ArrowRight } from 'lucide-react';

const Jobs = () => {
  const { data, isLoading, error } = useJobs({});

  // Loading State - Professional
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Browse Jobs</h1>
            <p className="text-lg text-gray-600 mt-2">Finding your dream job...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Skeleton className="h-7 w-64 mb-2" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-xl" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12 border border-gray-200 max-w-md">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h2>
          <p className="text-gray-600">We couldn't load the jobs. Please try again later.</p>
        </div>
      </div>
    );
  }

  const jobs = data?.data || [];

  // Empty State
  if (jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center py-20 px-4">
        <div className="text-center bg-white rounded-3xl shadow-2xl p-16 border border-gray-200 max-w-2xl">
          <div className="bg-gray-100 w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-8">
            <Briefcase className="w-14 h-14 text-gray-400" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">No Jobs Available Right Now</h2>
          <p className="text-xl text-gray-600 mb-8">New opportunities are posted daily. Check back soon!</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-all">
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-gray-600">Discover {jobs.length} amazing opportunities waiting for you</p>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="group block transform transition-all duration-300 hover:scale-105"
            >
              <div className="bg-white rounded-3xl shadow-lg hover:shadow-2xl border border-gray-200 overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:border-blue-300">

                {/* Card Header */}
                <div className="p-6 pb-4 flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2 text-gray-700">
                        <Building2 className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">
                          {job.company?.name || job.company || 'Confidential Company'}
                        </span>
                      </div>
                    </div>
                    {job.companyLogo ? (
                      <img
                        src={job.companyLogo}
                        alt="Company logo"
                        className="h-14 w-14 object-contain rounded-xl border border-gray-200 shadow-sm"
                      />
                    ) : (
                      <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                        {job.company?.name?.charAt(0) || 'C'}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-600 line-clamp-2 mb-5 leading-relaxed">
                    {job.description ? job.description.substring(0, 110) + '...' : 'No description available'}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-medium">
                      <Briefcase className="w-3.5 h-3.5 mr-1" />
                      {job.jobType?.replace('-', ' ') || 'Full Time'}
                    </Badge>
                    {job.salary?.min && (
                      <Badge className="bg-green-100 text-green-800 border-green-300 font-medium">
                        ৳{job.salary.min.toLocaleString()} - ৳{job.salary.max?.toLocaleString() || 'Negotiable'}
                      </Badge>
                    )}
                    {job.location && (
                      <Badge variant="outline" className="border-gray-400 text-gray-700">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {job.location}
                      </Badge>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        }) : 'Recently'}
                      </span>
                    </div>
                    <span className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                      View Details
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Bottom Accent */}
                <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </Link>
          ))}
        </div>

        {/* Load More / Pagination Hint */}
        {data?.pagination?.pages > 1 && (
          <div className="text-center mt-16">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-10 py-4 rounded-xl shadow-lg transition-all hover:shadow-xl">
              Load More Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Jobs;