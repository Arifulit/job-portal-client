import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Globe, MapPin } from 'lucide-react';
import { Loader } from '../../components/Loader';
import { useCompanies } from '../../services/companyService';

const Companies: React.FC = () => {
  const { data: companies = [], isLoading, isError, refetch } = useCompanies();

  if (isLoading) {
    return <Loader />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-bold text-red-700">Unable to load companies</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-black text-slate-900">All Companies</h1>
          <p className="mt-2 text-sm text-slate-600">
            {companies.length} companies are currently listed.
          </p>
        </div>

        {companies.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-600">
            No companies available right now.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {companies.map((company) => (
              <Link
                key={company._id}
                to={`/company/${company._id}/profile`}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100">
                    {company.logo ? (
                      <img src={company.logo} alt={company.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <Building2 className="h-6 w-6 text-slate-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-slate-900">{company.name}</h2>
                    <p className="mt-1 text-sm text-slate-600">{company.industry || 'Industry not specified'}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {company.location || 'Location not specified'}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {company.website || 'No website'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Companies;
