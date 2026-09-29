import { adminApi } from '@/lib/api';
import type {
  ApiResponse,
  IngestionCostByAccount,
  IngestionCostOverview,
  IngestionItemDropReasons,
  IngestionOverview,
  IngestionRetailer,
  IngestionSkipFailure,
  IngestionTrends,
  ParserMismatches,
} from '@/types';

interface IngestionFilterParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

interface RetailerParams extends IngestionFilterParams {
  limit?: number;
}

interface ParserMismatchParams extends IngestionFilterParams {
  page?: number;
  limit?: number;
}

type RetailerBreakdownResponse = ApiResponse<{ items: IngestionRetailer[] }>;

export const ingestionApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getIngestionOverview: builder.query<ApiResponse<IngestionOverview>, IngestionFilterParams>({
      query: (params) => ({ url: '/analytics/ingestion/overview', params }),
      providesTags: [{ type: 'Ingestion', id: 'OVERVIEW' }],
    }),
    getRetailerBreakdown: builder.query<RetailerBreakdownResponse, RetailerParams>({
      query: (params) => ({ url: '/analytics/ingestion/retailers', params }),
      providesTags: [{ type: 'Ingestion', id: 'RETAILERS' }],
    }),
    getSkipFailureReasons: builder.query<ApiResponse<IngestionSkipFailure>, IngestionFilterParams>({
      query: (params) => ({ url: '/analytics/ingestion/skip-failure-reasons', params }),
      providesTags: [{ type: 'Ingestion', id: 'SKIP_FAILURE' }],
    }),
    getIngestionTrends: builder.query<ApiResponse<IngestionTrends>, IngestionFilterParams>({
      query: (params) => ({ url: '/analytics/ingestion/trends', params }),
      providesTags: [{ type: 'Ingestion', id: 'TRENDS' }],
    }),
    getParserMismatches: builder.query<ApiResponse<ParserMismatches>, ParserMismatchParams>({
      query: (params) => ({ url: '/analytics/ingestion/parser-mismatches', params }),
      providesTags: [{ type: 'Ingestion', id: 'PARSER_MISMATCHES' }],
    }),
    // ── Cost (Plan #7) ──
    getIngestionCostOverview: builder.query<ApiResponse<IngestionCostOverview>, IngestionFilterParams>({
      query: (params) => ({ url: '/analytics/ingestion/cost/overview', params }),
      providesTags: [{ type: 'Ingestion', id: 'COST_OVERVIEW' }],
    }),
    getIngestionCostByAccount: builder.query<ApiResponse<IngestionCostByAccount>, ParserMismatchParams>({
      query: (params) => ({ url: '/analytics/ingestion/cost/by-account', params }),
      providesTags: [{ type: 'Ingestion', id: 'COST_BY_ACCOUNT' }],
    }),
    // ── Item / email drop reasons by retailer (Plan #6d) ──
    getItemDropReasons: builder.query<ApiResponse<IngestionItemDropReasons>, RetailerParams>({
      query: (params) => ({ url: '/analytics/ingestion/item-drop-reasons', params }),
      providesTags: [{ type: 'Ingestion', id: 'ITEM_DROP_REASONS' }],
    }),
  }),
});

export const {
  useGetIngestionOverviewQuery,
  useGetRetailerBreakdownQuery,
  useGetSkipFailureReasonsQuery,
  useGetIngestionTrendsQuery,
  useGetParserMismatchesQuery,
  useGetIngestionCostOverviewQuery,
  useGetIngestionCostByAccountQuery,
  useGetItemDropReasonsQuery,
} = ingestionApi;
