import { adminApi } from '@/lib/api';
import type { PaginatedResponse, Subscription, ApiResponse } from '@/types';

interface GetSubscriptionsParams {
  page?: number;
  limit?: number;
  status?: string;
  planType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface SubscriptionDetailsResponse {
  status: boolean;
  message: string;
  data: {
    subscription: Subscription;
  };
}

interface UpdateSubscriptionStatusRequest {
  id: string;
  status: string;
}

interface GrantComplimentaryRequest {
  userId: string;
  duration: number;
  planType: string;
}

interface CancelSubscriptionRequest {
  id: string;
  immediate: boolean;
}

export const subscriptionsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscriptions: builder.query<PaginatedResponse<Subscription>, GetSubscriptionsParams>({
      query: (params) => ({
        url: '/subscriptions',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ _id }) => ({ type: 'Subscriptions' as const, id: _id })),
              { type: 'Subscriptions', id: 'LIST' },
            ]
          : [{ type: 'Subscriptions', id: 'LIST' }],
    }),
    getSubscriptionDetails: builder.query<SubscriptionDetailsResponse, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Subscriptions', id }],
    }),
    updateSubscriptionStatus: builder.mutation<ApiResponse<Subscription>, UpdateSubscriptionStatusRequest>({
      query: ({ id, status }) => ({
        url: `/subscriptions/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Subscriptions', id },
        { type: 'Subscriptions', id: 'LIST' },
      ],
    }),
    grantComplimentary: builder.mutation<ApiResponse<Subscription>, GrantComplimentaryRequest>({
      query: (data) => ({
        url: '/subscriptions/grant-complimentary',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'Subscriptions', id: 'LIST' }],
    }),
    cancelSubscription: builder.mutation<ApiResponse<Subscription>, CancelSubscriptionRequest>({
      query: ({ id, immediate }) => ({
        url: `/subscriptions/${id}/cancel`,
        method: 'POST',
        body: { immediate },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Subscriptions', id },
        { type: 'Subscriptions', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetSubscriptionsQuery,
  useGetSubscriptionDetailsQuery,
  useUpdateSubscriptionStatusMutation,
  useGrantComplimentaryMutation,
  useCancelSubscriptionMutation,
} = subscriptionsApi;
