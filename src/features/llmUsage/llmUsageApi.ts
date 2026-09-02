import { adminApi } from '@/lib/api';

// ─── Shared param + entity types (co-located: feature-specific) ──────────────

interface DateRangeParams {
  startDate?: string;
  endDate?: string;
}

export interface LlmBreakdownRow {
  key: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requests: number;
}

export interface LlmTrendPoint {
  date: string;
  totalTokens: number;
  totalCostUsd: number;
  requests: number;
}

export interface LlmTopUser {
  userId: string;
  email: string;
  totalCostUsd: number;
  totalTokens: number;
  requests: number;
}

export interface LlmUserSummaryRow {
  _id: string;
  userId: string;
  email: string;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
  requests: number;
  lastUsedAt: string | null;
}

export interface LlmUsageLogRow {
  _id: string;
  endpoint: string;
  provider: string | null;
  model: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
  currency: string;
  costBasis: 'exact' | 'approximate' | 'unpriced';
  pricing: {
    _id: string;
    inputPricePer1M: number | null;
    outputPricePer1M: number | null;
    source: string | null;
    effectiveFrom: string | null;
    openRouterModelId: string | null;
  } | null;
  createdAt: string;
}

export interface LlmPricingRow {
  _id: string;
  provider: string;
  model: string;
  openRouterModelId: string | null;
  inputPricePer1M: number | null;
  outputPricePer1M: number | null;
  cacheReadPricePer1M: number | null;
  cacheWritePricePer1M: number | null;
  inputPricePerToken: number | null;
  outputPricePerToken: number | null;
  currency: string;
  source: string | null;
  fetchedAt: string | null;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  active: boolean;
}

export interface LlmOverviewData {
  totals: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    requests: number;
    uniqueUsers: number;
    currency: string;
  };
  byProvider: LlmBreakdownRow[];
  byModel: LlmBreakdownRow[];
  byEndpoint: LlmBreakdownRow[];
  trend: LlmTrendPoint[];
  topUsers: LlmTopUser[];
}

export interface LlmUserDetailData {
  user: { _id: string; email?: string; status?: string; createdAt?: string };
  totals: {
    totalInputTokens: number;
    totalOutputTokens: number;
    totalTokens: number;
    totalCostUsd: number;
    requests: number;
    firstUsedAt: string | null;
    lastUsedAt: string | null;
  };
  byProvider: LlmBreakdownRow[];
  byModel: LlmBreakdownRow[];
  byEndpoint: LlmBreakdownRow[];
}

export interface LlmBackfillStats {
  mode: 'exact' | 'approximate';
  processed: number;
  updated: number;
  skippedNoTokens: number;
  exact: number;
  approximate: number;
  unpriced: number;
  users: number;
}

interface Envelope<T> {
  success: boolean;
  message: string;
  data: T;
}

interface Paginated<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: { total: number; page: number; limit: number; pages: number };
  };
}

interface GetUserSummaryParams extends DateRangeParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?:
    | 'totalCostUsd'
    | 'totalTokens'
    | 'totalInputTokens'
    | 'totalOutputTokens'
    | 'requests'
    | 'lastUsedAt';
  sortOrder?: 'asc' | 'desc';
}

interface GetUserLogsParams extends DateRangeParams {
  userId: string;
  page?: number;
  limit?: number;
}

interface GetOverviewParams extends DateRangeParams {
  interval?: 'day' | 'month';
}

const BASE = '/analytics/llm-usage';

export const llmUsageApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getLlmOverview: builder.query<Envelope<LlmOverviewData>, GetOverviewParams>({
      query: (params) => ({ url: `${BASE}/overview`, params }),
      providesTags: [{ type: 'LlmUsage', id: 'OVERVIEW' }],
    }),
    getLlmUserSummary: builder.query<Paginated<LlmUserSummaryRow>, GetUserSummaryParams>({
      query: (params) => ({ url: `${BASE}/users`, params }),
      providesTags: [{ type: 'LlmUsage', id: 'USER_LIST' }],
    }),
    getLlmUserDetail: builder.query<
      Envelope<LlmUserDetailData>,
      { userId: string } & DateRangeParams
    >({
      query: ({ userId, ...params }) => ({ url: `${BASE}/users/${userId}/summary`, params }),
      providesTags: (_r, _e, { userId }) => [{ type: 'LlmUsage', id: `USER_${userId}` }],
    }),
    getLlmUserLogs: builder.query<Paginated<LlmUsageLogRow>, GetUserLogsParams>({
      query: ({ userId, ...params }) => ({ url: `${BASE}/users/${userId}/logs`, params }),
      providesTags: (_r, _e, { userId }) => [{ type: 'LlmUsage', id: `LOGS_${userId}` }],
    }),
    getLlmPricing: builder.query<
      Envelope<{ items: LlmPricingRow[]; count: number }>,
      { includeHistory?: boolean } | void
    >({
      query: (params) => ({ url: `${BASE}/pricing`, params: params || {} }),
      providesTags: [{ type: 'LlmPricing', id: 'LIST' }],
    }),

    // ── Maintenance actions (super-admin) ──────────────────────────────────
    syncLlmPricing: builder.mutation<Envelope<{ activePricingVersions: number }>, void>({
      query: () => ({ url: `${BASE}/pricing/sync`, method: 'POST' }),
      invalidatesTags: [
        { type: 'LlmPricing', id: 'LIST' },
        { type: 'LlmUsage', id: 'OVERVIEW' },
        { type: 'LlmUsage', id: 'USER_LIST' },
      ],
    }),
    backfillLlmCosts: builder.mutation<
      Envelope<LlmBackfillStats>,
      { mode?: 'exact' | 'approximate'; onlyMissing?: boolean } | void
    >({
      query: (body) => ({ url: `${BASE}/backfill`, method: 'POST', body: body || {} }),
      invalidatesTags: [
        { type: 'LlmUsage', id: 'OVERVIEW' },
        { type: 'LlmUsage', id: 'USER_LIST' },
        { type: 'LlmPricing', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetLlmOverviewQuery,
  useGetLlmUserSummaryQuery,
  useGetLlmUserDetailQuery,
  useGetLlmUserLogsQuery,
  useGetLlmPricingQuery,
  useSyncLlmPricingMutation,
  useBackfillLlmCostsMutation,
} = llmUsageApi;
