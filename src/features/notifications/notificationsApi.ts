import { adminApi } from '@/lib/api';
import type {
  SendPushRequest,
  SendPushResponse,
  UsersWithTokensResponse,
} from '@/types';

export const notificationsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    // Users who currently have an active FCM token — the recipient picker.
    getUsersWithTokens: builder.query<UsersWithTokensResponse, void>({
      query: () => ({ url: '/notifications/users-with-tokens' }),
      providesTags: [{ type: 'PushTokens', id: 'LIST' }],
    }),
    // Send a push to every active device of a user; response carries the
    // per-device delivery diagnostics. A failed send may deactivate a stale
    // token server-side, so refresh the recipient list afterwards.
    sendPushToUser: builder.mutation<SendPushResponse, SendPushRequest>({
      query: (body) => ({
        url: '/notifications/send-user',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PushTokens', id: 'LIST' }],
    }),
  }),
});

export const { useGetUsersWithTokensQuery, useSendPushToUserMutation } =
  notificationsApi;
