import { adminApi } from '@/lib/api';
import type {
  ApiResponse,
  EmailProcessingDetail,
  EmailProcessingLog,
  EmailSyncLog,
  EmailSyncSummary,
  PaginatedResponse,
} from '@/types';

interface EmailSyncLogParams {
  userId?: string;
  userEmail?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface EmailProcessingLogParams {
  userId?: string;
  gmailMessageId?: string;
  /** Partial, case-insensitive keyword match against the email subject. */
  subject?: string;
  category?: string;
  skipReason?: string;
  /** 'true' to only show skipped emails. */
  skippedOnly?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  /** 'true' | 'false' — whether to include the (large) HTML body in list rows. */
  includeHtmlBody?: string;
}

interface EmailSyncSummaryParams {
  userId?: string;
  startDate?: string;
  endDate?: string;
}

export const emailLogsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getEmailSyncLogs: builder.query<PaginatedResponse<EmailSyncLog>, EmailSyncLogParams>({
      query: (params) => ({ url: '/analytics/email-sync', params }),
      providesTags: [{ type: 'EmailLogs', id: 'SYNC_LIST' }],
    }),
    getEmailSyncSummary: builder.query<ApiResponse<EmailSyncSummary>, EmailSyncSummaryParams>({
      query: (params) => ({ url: '/analytics/email-sync/summary', params }),
      providesTags: [{ type: 'EmailLogs', id: 'SYNC_SUMMARY' }],
    }),
    getEmailProcessingLogs: builder.query<PaginatedResponse<EmailProcessingLog>, EmailProcessingLogParams>({
      query: (params) => ({ url: '/analytics/email-processing', params }),
      providesTags: [{ type: 'EmailLogs', id: 'PROCESSING_LIST' }],
    }),
    getEmailProcessingDetail: builder.query<ApiResponse<EmailProcessingDetail>, string>({
      query: (gmailMessageId) => ({ url: `/analytics/email-processing/${gmailMessageId}` }),
      providesTags: (_result, _error, gmailMessageId) => [
        { type: 'EmailLogs', id: gmailMessageId },
      ],
    }),
  }),
});

export const {
  useGetEmailSyncLogsQuery,
  useGetEmailSyncSummaryQuery,
  useGetEmailProcessingLogsQuery,
  useGetEmailProcessingDetailQuery,
} = emailLogsApi;
