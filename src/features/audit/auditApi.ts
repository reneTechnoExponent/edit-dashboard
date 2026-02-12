import { adminApi } from '@/lib/api';
import type { PaginatedResponse, AuditLogEntry } from '@/types';

interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  adminUserId?: string;
  action?: string;
  resourceType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const auditApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getAuditLogs: builder.query<PaginatedResponse<AuditLogEntry>, GetAuditLogsParams>({
      query: (params) => ({
        url: '/audit-logs',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ _id }) => ({ type: 'AuditLogs' as const, id: _id })),
              { type: 'AuditLogs', id: 'LIST' },
            ]
          : [{ type: 'AuditLogs', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetAuditLogsQuery,
} = auditApi;
