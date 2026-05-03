import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Loader2,
  RefreshCw,
  Trophy,
  UserCircle2,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  getRankedCandidates,
  RankedCandidate,
} from '@/services/candidateRankingService';

const scoreToText = (score?: number) => {
  if (typeof score !== 'number') return 'N/A';
  return score.toFixed(2);
};

const topSkills = (skills?: string[]) => {
  if (!Array.isArray(skills) || skills.length === 0) return [];
  return skills.slice(0, 5);
};

const getStatusStyles = (status?: string) => {
  const normalizedStatus = String(status || '').toLowerCase().trim();

  switch (normalizedStatus) {
    case 'applied':
      return {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        icon: Clock,
      };
    case 'reviewed':
      return {
        bg: 'bg-cyan-100 dark:bg-cyan-900/30',
        text: 'text-cyan-800 dark:text-cyan-300',
        icon: AlertCircle,
      };
    case 'shortlisted':
      return {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
        icon: CheckCircle,
      };
    case 'interviewed':
      return {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        icon: AlertCircle,
      };
    case 'accepted':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-800 dark:text-emerald-300',
        icon: CheckCircle,
      };
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-700/30',
        text: 'text-slate-700 dark:text-slate-300',
        icon: AlertCircle,
      };
  }
};

const CandidateRanker = () => {
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['candidate-ranked-all'],
    queryFn: () => getRankedCandidates(),
  });

  const ranked = useMemo<RankedCandidate[]>(() => {
    const list = data?.rankedCandidates || [];
    return [...list].sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [data?.rankedCandidates]);

  const scorePercent = (score?: number) => {
    if (typeof score !== 'number') return 0;
    const raw = score > 1 ? score : score * 100;
    return Math.max(0, Math.min(100, Math.round(raw)));
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">All Ranked Candidates</h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Source: GET <span className="font-semibold">/candidate/candidates/ranked</span>
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </section>

        {isLoading ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-500" />
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Loading ranked candidates...</p>
          </section>
        ) : null}

        {isError ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
            <h2 className="text-lg font-semibold">Failed to load ranked candidates</h2>
            <p className="mt-2 text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
          </section>
        ) : null}

        {!isLoading && !isError ? (
          <section className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800 sm:px-6">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Total ranked candidates: <span className="font-bold">{ranked.length}</span>
              </p>
            </div>

            <div className="grid gap-4 p-6 md:grid-cols-2">
              {ranked.length === 0 ? (
                <div className="p-8 text-center text-slate-500 dark:text-slate-400">No ranked candidates found.</div>
              ) : (
                ranked.map((candidate, index) => (
                  <article
                    key={`${candidate.candidateId || candidate.email || candidate.name}-${index}`}
                    className="flex w-full items-stretch gap-4 rounded-lg border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex flex-shrink-0 flex-col items-center gap-3 p-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-white text-slate-700 dark:from-slate-800 dark:to-slate-700">
                        <UserCircle2 className="h-7 w-7" />
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">#{index + 1}</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{candidate.name || 'Unnamed Candidate'}</h3>

                            <div className="flex items-center gap-2">
                              <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">Score {scoreToText(candidate.score)}</span>

                              {candidate.status ? (
                                (() => {
                                  const { bg, text, icon: StatusIcon } = getStatusStyles(candidate.status);
                                  return (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${bg} ${text}`}>
                                      <StatusIcon className="h-3 w-3" />
                                      {candidate.status}
                                    </span>
                                  );
                                })()
                              ) : null}
                            </div>
                          </div>

                          {candidate.email ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{candidate.email}</p> : null}
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{scoreToText(candidate.score)}</span>
                          </div>

                          <div className="w-28">
                            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                              <div className="h-2 rounded-full bg-amber-400" style={{ width: `${scorePercent(candidate.score)}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {candidate.summary ? <p className="mt-3 text-sm leading-6 text-slate-700 dark:text-slate-300 line-clamp-3">{candidate.summary}</p> : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {topSkills(candidate.skills).map((skill) => (
                          <span key={`${candidate.candidateId || candidate.email || candidate.name}-${skill}`} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">{skill}</span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <Button size="sm" variant="ghost">View</Button>
                      <Button size="sm" variant="outline">Message</Button>
                    </div>
                  </article>
                ))
              )}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
};

export default CandidateRanker;
