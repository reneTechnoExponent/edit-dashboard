import { adminApi } from '@/lib/api';
import type { PaginatedResponse, ClothingItem, ApiResponse } from '@/types';

interface GetClothingItemsParams {
  page?: number;
  limit?: number;
  user?: string;
  category?: string;
  subcategory?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

interface ClothingItemDetailsResponse {
  status: boolean;
  message: string;
  data: {
    clothingItem: ClothingItem;
  };
}

interface UpdateClothingItemRequest {
  id: string;
  data: Partial<ClothingItem>;
}

interface DeleteClothingItemRequest {
  id: string;
}

interface TriggerRecategorizationRequest {
  id: string;
}

interface BulkDeleteClothingItemsRequest {
  ids: string[];
}

export const clothingApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getClothingItems: builder.query<PaginatedResponse<ClothingItem>, GetClothingItemsParams>({
      query: (params) => ({
        url: '/clothing-items',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ _id }) => ({ type: 'ClothingItems' as const, id: _id })),
              { type: 'ClothingItems', id: 'LIST' },
            ]
          : [{ type: 'ClothingItems', id: 'LIST' }],
    }),
    getClothingItemDetails: builder.query<ClothingItemDetailsResponse, string>({
      query: (id) => `/clothing-items/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'ClothingItems', id }],
    }),
    updateClothingItem: builder.mutation<ApiResponse<ClothingItem>, UpdateClothingItemRequest>({
      query: ({ id, data }) => ({
        url: `/clothing-items/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ClothingItems', id },
        { type: 'ClothingItems', id: 'LIST' },
      ],
    }),
    deleteClothingItem: builder.mutation<ApiResponse<null>, DeleteClothingItemRequest>({
      query: ({ id }) => ({
        url: `/clothing-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ClothingItems', id },
        { type: 'ClothingItems', id: 'LIST' },
      ],
    }),
    triggerRecategorization: builder.mutation<ApiResponse<ClothingItem>, TriggerRecategorizationRequest>({
      query: ({ id }) => ({
        url: `/clothing-items/${id}/recategorize`,
        method: 'POST',
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'ClothingItems', id },
        { type: 'ClothingItems', id: 'LIST' },
      ],
    }),
    bulkDeleteClothingItems: builder.mutation<ApiResponse<{ successCount: number; failureCount: number }>, BulkDeleteClothingItemsRequest>({
      query: ({ ids }) => ({
        url: '/clothing-items/bulk-delete',
        method: 'POST',
        body: { ids },
      }),
      invalidatesTags: (_result, _error, { ids }) => [
        ...ids.map((id) => ({ type: 'ClothingItems' as const, id })),
        { type: 'ClothingItems', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetClothingItemsQuery,
  useGetClothingItemDetailsQuery,
  useUpdateClothingItemMutation,
  useDeleteClothingItemMutation,
  useTriggerRecategorizationMutation,
  useBulkDeleteClothingItemsMutation,
} = clothingApi;
