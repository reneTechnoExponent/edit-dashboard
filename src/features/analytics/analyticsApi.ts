import { adminApi } from '@/lib/api';
import type {
  AnalyticsEventSummary,
  AnalyticsMetrics,
  ItemFrequency,
} from '@/types';

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

// Event-tracking endpoints (spec: analytics-tracking)
// Backend returns { success, message, data } per standard response shape
interface EventSummaryResponse {
  success: boolean;
  message: string;
  data: AnalyticsEventSummary;
}

interface ItemFrequencyResponse {
  success: boolean;
  message: string;
  data: ItemFrequency;
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

    // --- Event tracking (from analytics-tracking spec) ---
    getEventSummary: builder.query<EventSummaryResponse, GetMetricsParams>({
      query: (params) => ({
        url: '/analytics/summary',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getItemFrequency: builder.query<ItemFrequencyResponse, GetMetricsParams>({
      query: (params) => ({
        url: '/analytics/item-frequency',
        params,
      }),
      providesTags: ['Analytics'],
    }),
  }),
});

export const {
  useGetUserMetricsQuery,
  useGetClothingItemMetricsQuery,
  useGetSubscriptionMetricsQuery,
  useExportAnalyticsMutation,
  useGetEventSummaryQuery,
  useGetItemFrequencyQuery,
} = analyticsApi;
