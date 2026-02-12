import { adminApi } from '@/lib/api';
import type { PaginatedResponse, User, ApiResponse } from '@/types';

interface GetUsersParams {
  page?: number;
  limit?: number;
  status?: string;
  isSubscribed?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
}

interface UserDetailsResponse {
  status: boolean;
  message: string;
  data: {
    user: User;
  };
}

interface UpdateUserStatusRequest {
  id: string;
  status: string;
}

export const usersApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<User>, GetUsersParams>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.items.map(({ _id }) => ({ type: 'Users' as const, id: _id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),
    getUserDetails: builder.query<UserDetailsResponse, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Users', id }],
    }),
    updateUserStatus: builder.mutation<ApiResponse<User>, UpdateUserStatusRequest>({
      query: ({ id, status }) => ({
        url: `/users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Users', id },
        { type: 'Users', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserDetailsQuery,
  useUpdateUserStatusMutation,
} = usersApi;
