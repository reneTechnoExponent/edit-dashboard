import { adminApi } from '@/lib/api';
import type { ApiResponse } from '@/types';

interface CMSContent {
  _id: string;
  type: 'terms' | 'privacy';
  content: string;
  updatedAt: string;
}

interface CMSContentResponse {
  status: boolean;
  message: string;
  data: {
    content: string;
  };
}

interface UpdateCMSContentRequest {
  type: 'terms' | 'privacy';
  content: string;
}

export const cmsApi = adminApi.injectEndpoints({
  endpoints: (builder) => ({
    getTermsAndConditions: builder.query<CMSContentResponse, void>({
      query: () => '/cms/terms',
      providesTags: [{ type: 'CMS' as const, id: 'terms' }],
    }),
    getPrivacyPolicy: builder.query<CMSContentResponse, void>({
      query: () => '/cms/privacy',
      providesTags: [{ type: 'CMS' as const, id: 'privacy' }],
    }),
    updateCMSContent: builder.mutation<ApiResponse<CMSContent>, UpdateCMSContentRequest>({
      query: ({ type, content }) => ({
        url: `/cms/${type}`,
        method: 'PUT',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { type }) => [{ type: 'CMS', id: type }],
    }),
  }),
});

export const {
  useGetTermsAndConditionsQuery,
  useGetPrivacyPolicyQuery,
  useUpdateCMSContentMutation,
} = cmsApi;
