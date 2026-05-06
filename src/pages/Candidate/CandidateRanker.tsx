
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

const getInitials = (name?: string) => {
  return (name || '??')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (index: number) => {
  const colors = [
    'bg-amber-100 text-amber-800',
    'bg-slate-200 text-slate-700',
    'bg-orange-100 text-orange-800',
    'bg-blue-100 text-blue-800',
    'bg-emerald-100 text-emerald-800',
    'bg-violet-100 text-violet-800',
  ];
  return colors[index % colors.length];
};

const getMedalIcon = (index: number) => {
  if (index === 0) return <Trophy className="h-3.5 w-3.5 text-amber-500" />;
  if (index === 1) return <Trophy className="h-3.5 w-3.5 text-slate-400" />;
  if (index === 2) return <Trophy className="h-3.5 w-3.5 text-orange-400" />;
  return null;
};

const getStatusStyles = (status?: string) => {
  const normalizedStatus = String(status || '').toLowerCase().trim();
  switch (normalizedStatus) {
    case 'applied':
      return { bg: 'bg-blue-50 text-blue-700 border border-blue-200', icon: Clock };
    case 'reviewed':
      return { bg: 'bg-cyan-50 text-cyan-700 border border-cyan-200', icon: AlertCircle };
    case 'shortlisted':
      return { bg: 'bg-violet-50 text-violet-700 border border-violet-200', icon: Star };
    case 'interviewed':
      return { bg: 'bg-amber-50 text-amber-700 border border-amber-200', icon: AlertCircle };
    case 'accepted':
      return { bg: 'bg-emerald-50 text-emerald-700 border border-emerald-200', icon: CheckCircle };
    default:
      return { bg: 'bg-slate-100 text-slate-600 border border-slate-200', icon: AlertCircle };
  }
};

const CandidateRanker = () => {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
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

        {/* ── Header ── */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                  All Ranked Candidates
                </h1>
                {!isLoading && !isError && (
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {ranked.length} candidate{ranked.length !== 1 ? 's' : ''} ranked
                  </p>
                )}
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="gap-2 text-sm"
            >
              {isFetching
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />}
              Refresh
            </Button>
          </div>
        </section>

        {/* ── Loading ── */}
        {isLoading && (
          <section className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-amber-500" />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading ranked candidates…
            </p>
          </section>
        )}

        {/* ── Error ── */}
        {isError && (
          <section className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
            <h2 className="text-base font-semibold">Failed to load ranked candidates</h2>
            <p className="mt-1.5 text-sm">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </section>
        )}

        {/* ── Candidate Grid ── */}
        {!isLoading && !isError && (
          <div className="grid gap-4 md:grid-cols-2">
            {ranked.length === 0 ? (
              <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-16 text-center text-sm text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                No ranked candidates found.
              </div>
            ) : (
              ranked.map((candidate, index) => {
                const { bg, icon: StatusIcon } = getStatusStyles(candidate.status);
                const pct = scorePercent(candidate.score);

                return (
                  <article
                    key={`${candidate.candidateId || candidate.email || candidate.name}-${index}`}
                    className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                  >
                    {/* Top row: avatar + name + rank */}
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold ${getAvatarColor(index)}`}
                      >
                        {getInitials(candidate.name)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="truncate text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                            {candidate.name || 'Unnamed Candidate'}
                          </h3>
                          {getMedalIcon(index)}
                        </div>
                        {candidate.email && (
                          <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {candidate.email}
                          </p>
                        )}
                      </div>

                      <span className="flex-shrink-0 text-xs font-medium text-slate-400 dark:text-slate-500">
                        #{index + 1}
                      </span>
                    </div>

                    {/* Score bar */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
                          Score
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {scoreToText(candidate.score)}
                          <span className="ml-1 text-xs font-normal text-slate-400">
                            ({pct}%)
                          </span>
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className="h-1.5 rounded-full bg-amber-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badge */}
                    {candidate.status && (
                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${bg}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {candidate.status}
                        </span>
                      </div>
                    )}

                    {/* Summary */}
                    {candidate.summary && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                        {candidate.summary}
                      </p>
                    )}

                    {/* Skills */}
                    {topSkills(candidate.skills).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {topSkills(candidate.skills).map((skill) => (
                          <span
                            key={`${candidate.candidateId || candidate.email}-${skill}`}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-auto flex gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Button size="sm" variant="outline" className="flex-1 text-xs">
                        View Profile
                      </Button>
                      <Button size="sm" variant="ghost" className="flex-1 text-xs">
                        Message
                      </Button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateRanker;