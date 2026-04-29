import { useQuery } from '@tanstack/react-query';
import { api } from '../utils/api';

export type CareerResource = {
  _id: string;
  title: string;
  description?: string;
  tag?: string;
  slug?: string;
  createdAt?: string;
};

export const useCareerResources = (limit = 6) => {
  return useQuery<CareerResource[]>({
    queryKey: ['career-resources', limit],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (limit) params.append('limit', String(limit));

      const endpoints = params.toString() ? [`/career-resources?${params.toString()}`, '/career-resources'] : ['/career-resources'];
      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const payload = response.data as { success?: boolean; data?: CareerResource[] } | CareerResource[];

          if (Array.isArray(payload)) return payload;

          if (payload && typeof payload === 'object') {
            if ('success' in payload && payload.success === false) {
              throw new Error((payload as any).message || 'Failed to fetch resources');
            }

            if (Array.isArray((payload as any).data)) return (payload as any).data;
          }

          return [] as CareerResource[];
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      throw lastError || new Error('Failed to fetch career resources');
    },
  });
};

export const useCareerResource = (id?: string) => {
  return useQuery<CareerResource>({
    queryKey: ['career-resource', id],
    queryFn: async () => {
      if (!id) throw new Error('Resource id is required');
      const endpoints = [`/career-resources/${id}`, `/career-resources/resource/${id}`];
      let lastError: unknown;

      for (const endpoint of endpoints) {
        try {
          const response = await api.get(endpoint);
          const payload = response.data as { success?: boolean; data?: CareerResource } | CareerResource;

          if (payload && typeof payload === 'object') {
            if ('success' in payload && payload.success === false) {
              throw new Error((payload as any).message || 'Failed to fetch resource');
            }

            if ('data' in payload && payload.data) return payload.data as CareerResource;
            return payload as CareerResource;
          }

          throw new Error('Invalid response');
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      throw lastError || new Error('Failed to fetch career resource');
    },
    enabled: !!id,
  });
};
