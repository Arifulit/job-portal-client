import React, { useEffect, useId, useRef } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { ApplicationStatus } from '../types';

interface StatusChangeModalProps {
  open: boolean;
  candidateName: string;
  currentStatus: ApplicationStatus;
  statusOptions: ApplicationStatus[];
  loading?: boolean;
  onConfirm: (status: ApplicationStatus) => void;
  onCancel: () => void;
}

const statusBadgeColorMap: Record<ApplicationStatus, { bg: string; text: string }> = {
  applied: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300' },
  reviewed: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-300' },
  shortlisted: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300' },
  interview: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-800 dark:text-amber-300' },
  accepted: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-800 dark:text-emerald-300' },
  hired: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300' },
  rejected: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-800 dark:text-rose-300' },
};

const toTitleCase = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  open,
  candidateName,
  currentStatus,
  statusOptions,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const titleId = useId();
  const confirmButtonRef = useRef<HTMLButtonElement | null>(null);
  const [selectedStatus, setSelectedStatus] = React.useState<ApplicationStatus>(currentStatus);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, open]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    confirmButtonRef.current?.focus();

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl ring-1 ring-black/5 motion-safe:animate-[dialogIn_.16s_ease-out] dark:border-slate-700 dark:bg-slate-900"
      >
        <div className="flex items-start justify-between gap-3 mb-6">
          <div className="flex-1">
            <h2 id={titleId} className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Change Application Status
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Update status for <span className="font-semibold">{candidateName}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            Select New Status
          </p>
          <div className="space-y-2">
            {statusOptions.map((status) => {
              const { bg, text } = statusBadgeColorMap[status] || statusBadgeColorMap.applied;
              const isSelected = selectedStatus === status;
              const isCurrent = currentStatus === status;

              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  disabled={loading}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex-1 text-left">
                    <div className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${bg} ${text}`}>
                      {toTitleCase(status)}
                    </div>
                    {isCurrent && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Current status</p>
                    )}
                  </div>
                  {isSelected && (
                    <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button
            ref={confirmButtonRef}
            type="button"
            variant="default"
            onClick={() => onConfirm(selectedStatus)}
            disabled={loading || selectedStatus === currentStatus}
          >
            {loading ? 'Updating...' : 'Update Status'}
          </Button>
        </div>
      </div>
    </div>
  );
};
