import { adminApi } from '@/lib/api';
import type { PaginatedResponse, UserCollection, ApiResponse } from '@/types';

interface GetCollectionsParams {
  page?: number;
  limit?: number;
  user?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface CollectionDetailsResponse {
  status: boolean;
  message: string;
  data: {
    collection: UserCollection;
  };
}

interface DeleteCollectionRequest {
  id: string;
}

export const collectionsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getCollections: builder.query<PaginatedResponse<UserCollection>, GetCollectionsParams>({
      query: (params) => ({
        url: '/collections',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ _id }) => ({ type: 'Collections' as const, id: _id })),
              { type: 'Collections', id: 'LIST' },
            ]
          : [{ type: 'Collections', id: 'LIST' }],
    }),
    getCollectionDetails: builder.query<CollectionDetailsResponse, string>({
      query: (id) => `/collections/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Collections', id }],
    }),
    deleteCollection: builder.mutation<ApiResponse<null>, DeleteCollectionRequest>({
      query: ({ id }) => ({
        url: `/collections/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Collections', id },
        { type: 'Collections', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetCollectionsQuery,
  useGetCollectionDetailsQuery,
  useDeleteCollectionMutation,
} = collectionsApi;
