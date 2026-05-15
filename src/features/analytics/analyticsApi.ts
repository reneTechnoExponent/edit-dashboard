import { adminApi } from '@/lib/api';
import type {
  AnalyticsEventEntry,
  AnalyticsEventSummary,
  AnalyticsEventType,
  AnalyticsMetrics,
  AnalyticsUserStatsRow,
  AnalyticsUserSummary,
  ItemFrequency,
  PaginatedResponse,
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

interface GetEventUsersParams extends GetMetricsParams {
  page?: number;
  limit?: number;
  sortBy?: 'totalEvents' | 'lastEventAt' | 'firstEventAt';
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

interface GetUserEventsParams extends GetMetricsParams {
  userId: string;
  page?: number;
  limit?: number;
  eventType?: AnalyticsEventType;
  sortOrder?: 'asc' | 'desc';
}

interface UserAnalyticsSummaryResponse {
  success: boolean;
  message: string;
  data: AnalyticsUserSummary;
}

type EventUsersResponse = PaginatedResponse<AnalyticsUserStatsRow> & {
  success?: boolean;
};

type UserEventsResponse = PaginatedResponse<AnalyticsEventEntry> & {
  success?: boolean;
};

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

    // --- Per-user analytics drill-down ---
    getEventUsers: builder.query<EventUsersResponse, GetEventUsersParams>({
      query: (params) => ({
        url: '/analytics/event-users',
        params,
      }),
      providesTags: ['Analytics'],
    }),
    getUserAnalyticsSummary: builder.query<UserAnalyticsSummaryResponse, { userId: string } & GetMetricsParams>({
      query: ({ userId, ...params }) => ({
        url: `/analytics/users/${userId}/summary`,
        params,
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: 'Analytics', id: `user-summary-${userId}` },
      ],
    }),
    getUserEvents: builder.query<UserEventsResponse, GetUserEventsParams>({
      query: ({ userId, ...params }) => ({
        url: `/analytics/users/${userId}/events`,
        params,
      }),
      providesTags: (_result, _error, { userId }) => [
        { type: 'Analytics', id: `user-events-${userId}` },
      ],
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
  useGetEventUsersQuery,
  useGetUserAnalyticsSummaryQuery,
  useGetUserEventsQuery,
} = analyticsApi;
