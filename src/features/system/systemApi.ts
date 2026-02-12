import { adminApi } from '@/lib/api';
import type { CronJobStatus, ApiResponse } from '@/types';

interface CronJobStatusResponse {
  status: boolean;
  message: string;
  data: {
    cronJobs: CronJobStatus[];
  };
}

interface TriggerCronJobRequest {
  jobName: string;
}

interface EmailQueueStatus {
  queueSize: number;
  processing: number;
  failed: number;
  recentProcessed: Array<{
    email: string;
    status: 'success' | 'failure';
    timestamp: string;
    error?: string;
  }>;
}

interface EmailQueueStatusResponse {
  status: boolean;
  message: string;
  data: EmailQueueStatus;
}

interface AIServiceHealth {
  status: 'healthy' | 'degraded' | 'down';
  lastSync: string | null;
  last24Hours: {
    successCount: number;
    failureCount: number;
  };
  averageResponseTime: number;
}

interface AIServiceHealthResponse {
  status: boolean;
  message: string;
  data: AIServiceHealth;
}

export const systemApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getCronJobStatus: builder.query<CronJobStatusResponse, void>({
      query: () => '/system/cron-jobs',
      providesTags: ['CronJobs'],
    }),
    triggerCronJob: builder.mutation<ApiResponse<null>, TriggerCronJobRequest>({
      query: ({ jobName }) => ({
        url: '/system/cron-jobs/trigger',
        method: 'POST',
        body: { jobName },
      }),
      invalidatesTags: ['CronJobs'],
    }),
    getEmailQueueStatus: builder.query<EmailQueueStatusResponse, void>({
      query: () => '/system/email-queue',
      providesTags: ['CronJobs'],
    }),
    getAIServiceHealth: builder.query<AIServiceHealthResponse, void>({
      query: () => '/system/ai-service',
      providesTags: ['CronJobs'],
    }),
  }),
});

export const {
  useGetCronJobStatusQuery,
  useTriggerCronJobMutation,
  useGetEmailQueueStatusQuery,
  useGetAIServiceHealthQuery,
} = systemApi;
