import { adminApi } from '@/lib/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  status: boolean;
  message: string;
  data: {
    token: string;
    admin: {
      _id: string;
      email: string;
      role: 'admin' | 'super_admin';
    };
  };
}

export const authApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
  }),
});

export const { useLoginMutation } = authApi;
