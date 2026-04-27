import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Notification } from '../types';
import { api, handleApiError } from '../utils/api';

type AnyRecord = Record<string, unknown>;

const normalizeNotificationType = (value: unknown): Notification['type'] => {
  const parsed = String(value || '').toLowerCase();

  if (parsed === 'success' || parsed === 'warning' || parsed === 'error') {
    return parsed;
  }

  return 'info';
};

const toBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  const parsed = String(value || '').toLowerCase();
  return parsed === 'true' || parsed === '1' || parsed === 'yes' || parsed === 'read';
};

const normalizeNotification = (raw: unknown): Notification => {
  const item = (raw || {}) as AnyRecord;

  const id =
    String(item._id || item.id || item.notificationId || `${Date.now()}-${Math.random()}`);

  const isRead =
    toBoolean(item.isRead) ||
    toBoolean(item.read) ||
    toBoolean(item.is_read) ||
    toBoolean(item.readStatus);

  const createdAt = String(
    item.createdAt || item.created_at || item.updatedAt || item.updated_at || new Date().toISOString()
  );

  const linkValue = item.link || item.url || item.path;

  return {
    _id: id,
    userId: String(item.userId || item.user || ''),
    title: String(item.title || 'Notification'),
    message: String(item.message || item.body || item.description || 'You have a new notification.'),
    type: normalizeNotificationType(item.type || item.notificationType),
    isRead,
    link: linkValue ? String(linkValue) : undefined,
    createdAt,
  };
};

const extractArray = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value !== 'object') {
    return [];
  }

  const objectValue = value as AnyRecord;
  const firstLevelCandidates = [
    objectValue.notifications,
    objectValue.items,
    objectValue.results,
    objectValue.data,
  ];

  for (const candidate of firstLevelCandidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  for (const candidate of firstLevelCandidates) {
    if (candidate && typeof candidate === 'object') {
      const nested = candidate as AnyRecord;
      const secondLevelCandidates = [nested.notifications, nested.items, nested.results, nested.data];

      for (const secondCandidate of secondLevelCandidates) {
        if (Array.isArray(secondCandidate)) {
          return secondCandidate;
        }
      }
    }
  }

  return [];
};

export const useNotifications = (enabled = true) => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/notifications');
      return extractArray(response.data).map(normalizeNotification);
    },
    enabled,
    staleTime: 30 * 1000,
    refetchInterval: 45 * 1000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      await api.put(`/notifications/${notificationId}/read`);
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
    onError: (error) => {
      toast.error(handleApiError(error));
    },
  });
};
