import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

interface IUserInfo {
  id: number;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  auth_provider: string;
  avatar: string;
  is_confirm: boolean;
  allowed_categories: number[];
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    login: build.mutation({
      query: (data) => ({
        url: '/authentication/token/',
        method: 'POST',
        body: data
      })
    }),
    getUserInfo: build.query<IUserInfo, void>({
      query: () => ({
        url: '/authentication/users/me',
        method: 'GET'
      })
    }),
    getPermissions: build.query({
      query: () => ({
        url: '/authentication/users/permissions',
        method: 'GET'
      })
    }),
    logout: build.mutation({
      query: () => ({
        url: '/authentication/logout',
        method: 'POST'
      })
    }),
    forgotPassword: build.mutation({
      query: (data) => ({
        url: '/authentication/forgot-password',
        method: 'POST',
        body: data
      })
    }),
    resetPassword: build.mutation({
      query: (data) => ({
        url: '/authentication/reset-password',
        method: 'POST',
        body: data
      })
    })
  })
});

export const {
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useResetPasswordMutation,
  useGetUserInfoQuery,
  useGetPermissionsQuery,
  useLazyGetUserInfoQuery
} = authApi;
