import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useNotifications, useMarkNotificationRead } from '../../services/notificationService';

interface NotificationBellProps {
  isDark: boolean;
  buttonClassName?: string;
  panelClassName?: string;
  iconClassName?: string;
}

interface NotificationItem {
  _id: string;
  title: string;
  message?: string;
  createdAt: string;
  isRead: boolean;
  link?: string;
}

const formatRelativeTime = (value: string): string => {
  const dateValue = new Date(value).getTime();

  if (!Number.isFinite(dateValue)) {
    return 'Just now';
  }

  const diffMs = dateValue - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);

  const formatter = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffMinutes) < 1) {
    return 'Just now';
  }

  if (Math.abs(diffMinutes) < 60) {
    return formatter.format(diffMinutes, 'minute');
  }

  const diffHours = Math.round(diffMinutes / 60);

  if (Math.abs(diffHours) < 24) {
    return formatter.format(diffHours, 'hour');
  }

  const diffDays = Math.round(diffHours / 24);
  return formatter.format(diffDays, 'day');
};

export const NotificationBell: React.FC<NotificationBellProps> = ({
  isDark,
  buttonClassName,
  panelClassName,
  iconClassName,
}) => {
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useState(false);
  const [pendingReadIds, setPendingReadIds] = useState<Record<string, boolean>>({});

  const {
    data: notificationsData = [],
    isLoading,
    refetch,
  } = useNotifications();

  const notifications = useMemo<NotificationItem[]>(() => notificationsData as NotificationItem[], [notificationsData]);

  const { mutateAsync: markAsReadAsync } = useMarkNotificationRead();

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  const latestNotifications = useMemo(() => notifications.slice(0, 8), [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const handleOpenToggle = useCallback(async () => {
    const nextOpen = !open;
    setOpen(nextOpen);

    if (nextOpen) {
      await refetch();
    }
  }, [open, refetch]);

  const markNotificationRead = useCallback(async (notificationId: string) => {
    setPendingReadIds((previous) => ({ ...previous, [notificationId]: true }));

    try {
      await markAsReadAsync(notificationId);
    } finally {
      setPendingReadIds((previous) => {
        const next = { ...previous };
        delete next[notificationId];
        return next;
      });
    }
  }, [markAsReadAsync]);

  const handleNotificationClick = useCallback(
    async (notificationId: string, isRead: boolean, link?: string) => {
      if (!isRead) {
        await markNotificationRead(notificationId);
      }

      if (!link) return;

      setOpen(false);

      if (link.startsWith('/')) {
        navigate(link);
        return;
      }

      window.open(link, '_blank', 'noopener,noreferrer');
    },
    [markNotificationRead, navigate]
  );

  useEffect(() => {
    if (!open) return;

    // focus first actionable item in the panel for keyboard users
    const el = panelRef.current?.querySelector<HTMLElement>('button[data-notification]');
    if (el) el.focus();
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => {
          void handleOpenToggle();
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        className={
          buttonClassName ||
          `relative inline-flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
            isDark
              ? 'text-slate-400 hover:bg-slate-800 hover:text-white'
              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
          }`
        }
      >
        <Bell className={iconClassName || 'h-4.5 w-4.5'} />

        {unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className={
            panelClassName ||
            `absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border shadow-xl ${
              isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
            }`
          }
          ref={panelRef}
          role="menu"
          aria-label="Notifications panel"
        >
          <div
            className={`flex items-center justify-between border-b px-4 py-3 ${
              isDark ? 'border-slate-800' : 'border-slate-100'
            }`}
          >
            <p className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Notifications
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                unreadCount > 0
                  ? 'bg-blue-100 text-blue-700'
                  : isDark
                  ? 'bg-slate-800 text-slate-400'
                  : 'bg-slate-100 text-slate-500'
              }`}
            >
              {unreadCount} unread
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className={`px-4 py-5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Loading notifications...
              </div>
            ) : latestNotifications.length === 0 ? (
              <div className={`px-4 py-5 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                No notifications yet.
              </div>
            ) : (
              latestNotifications.map((notification) => {
                const pending = !!pendingReadIds[notification._id];

                return (
                  <div
                    key={notification._id}
                    className={`border-b px-4 py-3 ${
                      isDark ? 'border-slate-800' : 'border-slate-100'
                    } ${!notification.isRead ? (isDark ? 'bg-slate-800/40' : 'bg-blue-50/50') : ''}`}
                  >
                    <button
                      type="button"
                      data-notification
                      role="menuitem"
                      tabIndex={0}
                      onClick={() => {
                        void handleNotificationClick(notification._id, notification.isRead, notification.link);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          void handleNotificationClick(notification._id, notification.isRead, notification.link);
                        }
                      }}
                      className="w-full text-left focus:outline-none"
                    >
                      <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                        {notification.title}
                      </p>
                      <p className={`mt-1 line-clamp-2 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                      <p className={`mt-1 text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                        {formatRelativeTime(notification.createdAt)}
                      </p>
                    </button>

                    {!notification.isRead ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          void markNotificationRead(notification._id);
                        }}
                        className={`mt-2 text-xs font-semibold ${
                          pending
                            ? 'cursor-not-allowed text-slate-400'
                            : isDark
                            ? 'text-blue-300 hover:text-blue-200'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        {pending ? 'Marking...' : 'Mark as read'}
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
