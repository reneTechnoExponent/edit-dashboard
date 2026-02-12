import { adminApi } from '@/lib/api';
import type { AnalyticsMetrics, ApiResponse } from '@/types';

interface GetMetricsParams {
  startDate?: string;
  endDate?: string;
}

interface AnalyticsMetricsResponse {
  status: boolean;
  message: string;
  data: AnalyticsMetrics;
}

interface ExportAnalyticsParams {
  startDate?: string;
  endDate?: string;
}

export const analyticsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserMetrics: builder.query<AnalyticsMetricsResponse, GetMetricsParams>({
      query: (params) => ({
        url: '/analytics/users',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getClothingItemMetrics: builder.query<AnalyticsMetricsResponse, GetMetricsParams>({
      query: (params) => ({
        url: '/analytics/clothing-items',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getSubscriptionMetrics: builder.query<AnalyticsMetricsResponse, GetMetricsParams>({
      query: (params) => ({
        url: '/analytics/subscriptions',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    exportAnalytics: builder.mutation<Blob, ExportAnalyticsParams>({
      query: (params) => ({
        url: '/analytics/export',
        method: 'POST',
        params,
        responseHandler: (response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetUserMetricsQuery,
  useGetClothingItemMetricsQuery,
  useGetSubscriptionMetricsQuery,
  useExportAnalyticsMutation,
} = analyticsApi;
