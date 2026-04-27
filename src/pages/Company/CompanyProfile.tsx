import React, { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Building2, MapPin, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Loader } from '../../components/Loader';
import {
  useCompanyProfile,
  useCreateCompanyReview,
  useUpdateCompanyReview,
} from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';

const clampRating = (value: number): number => {
  return Math.min(5, Math.max(1, value));
};

const formatReviewDate = (value?: string) => {
  if (!value) {
    return 'Recently';
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return 'Recently';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const CompanyProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.max(1, Number(searchParams.get('limit') || 10));
  const reviewsLimit = Math.max(1, Number(searchParams.get('reviewsLimit') || 10));

  const { data, isLoading, isError, refetch } = useCompanyProfile(id, page, limit, reviewsLimit);

  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [mode, setMode] = useState<'create' | 'update'>('create');

  const createReviewMutation = useCreateCompanyReview(id);
  const updateReviewMutation = useUpdateCompanyReview(id);

  const isSubmitting = createReviewMutation.isPending || updateReviewMutation.isPending;

  const averageRating = useMemo(() => {
    if (!data?.reviews.length) {
      return 0;
    }

    const total = data.reviews.reduce((sum, item) => sum + item.rating, 0);
    return total / data.reviews.length;
  }, [data?.reviews]);

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault();

    const normalizedRating = clampRating(rating);
    const normalizedReview = reviewText.trim();

    if (normalizedRating < 1 || normalizedRating > 5) {
      return;
    }

    if (!normalizedReview) {
      return;
    }

    const payload = {
      rating: normalizedRating,
      review: normalizedReview,
    };

    if (mode === 'update') {
      updateReviewMutation.mutate(payload, {
        onSuccess: () => {
          setReviewText('');
        },
      });
      return;
    }

    createReviewMutation.mutate(payload, {
      onSuccess: () => {
        setReviewText('');
      },
    });
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(nextPage));
    params.set('limit', String(limit));
    params.set('reviewsLimit', String(reviewsLimit));
    setSearchParams(params);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-lg font-bold text-red-700">Unable to load company profile</p>
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

  const companyName = data.name || 'Company Profile';
  const totalPages = data.openPositions.totalPages || 1;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl font-black text-slate-900">{companyName}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                {data.industry ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <Building2 className="h-4 w-4" />
                    {data.industry}
                  </span>
                ) : null}
                {data.location ? (
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5">
                    <MapPin className="h-4 w-4" />
                    {data.location}
                  </span>
                ) : null}
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1.5 text-amber-700">
                  <Star className="h-4 w-4" />
                  {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'} ({data.reviews.length} reviews)
                </span>
              </div>
              {data.description ? <p className="mt-4 max-w-3xl text-sm text-slate-700">{data.description}</p> : null}
            </div>
            {data.website ? (
              <a
                href={data.website}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Visit Website
              </a>
            ) : null}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900">Open Positions</h2>
              <p className="text-sm text-slate-600">
                Total {data.openPositions.total} | Page {data.openPositions.page} of {totalPages}
              </p>
            </div>

            {data.openPositions.jobs.length === 0 ? (
              <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                No open positions available right now.
              </p>
            ) : (
              <div className="space-y-3">
                {data.openPositions.jobs.map((job) => (
                  <Link
                    key={job._id}
                    to={`/jobs/${job._id}`}
                    className="block rounded-xl border border-slate-200 px-4 py-3 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="text-base font-semibold text-slate-900">{job.title}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {job.location} • {job.jobType}
                    </p>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => changePage(page - 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => changePage(page + 1)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-900">Reviews</h2>

              <div className="mt-4 space-y-3">
                {data.reviews.length === 0 ? (
                  <p className="text-sm text-slate-600">No reviews yet.</p>
                ) : (
                  data.reviews.map((item) => (
                    <article key={item._id} className="rounded-xl border border-slate-200 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{item.user?.name || 'Anonymous User'}</p>
                        <span className="text-xs font-semibold text-amber-600">{item.rating}/5</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-700">{item.review}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatReviewDate(item.updatedAt || item.createdAt)}</p>
                    </article>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900">Write a Review</h3>
                <select
                  value={mode}
                  onChange={(event) => setMode(event.target.value as 'create' | 'update')}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                >
                  <option value="create">Create</option>
                  <option value="update">Update</option>
                </select>
              </div>

              {!isAuthenticated ? (
                <p className="mt-3 text-sm text-slate-600">Login required to create or update a review.</p>
              ) : (
                <form className="mt-4 space-y-3" onSubmit={submitReview}>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Rating (1 to 5)</label>
                    <input
                      type="number"
                      min={1}
                      max={5}
                      step={1}
                      value={rating}
                      onChange={(event) => setRating(clampRating(Number(event.target.value || 1)))}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Review</label>
                    <textarea
                      rows={4}
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                      placeholder="Share your experience"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !user}
                    className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : mode === 'create' ? 'Create Review' : 'Update Review'}
                  </button>
                </form>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default CompanyProfile;
