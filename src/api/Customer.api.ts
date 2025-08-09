import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { IGetCustomerParams, IGetCustomerResponse } from 'types/requests';

export interface ICustomer {
  id: number;
  inn: string;
  full_name: string;
  category: string;
  created_at: string;
  updated_at: string;
  pasport: string | null;
  address: string;
  contact: string;
  status: string;
}

export interface ICustomersListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ICustomer[];
}

export interface IGetCustomersParams {
  page?: number;
  page_size?: number;
}

export interface ICreateCustomerParams {
  inn: string;
  full_name?: string | number;
  category?: '0' | '1';
  pasport?: string | null;
  address?: string;
  contact?: string;
  status?: string;
}

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getCustomer: build.query<IGetCustomerResponse, IGetCustomerParams>({
      query: (params) => ({
        url: '/customer/',
        method: 'GET',
        params
      })
    }),
    getAllCustomers: build.query<ICustomersListResponse, IGetCustomersParams | void>({
      query: (params) => ({
        url: 'customer/',
        method: 'GET',
        params: params || {}
      })
    }),

    getCustomerById: build.query<ICustomer, number | string>({
      query: (id) => ({
        url: `customer/${id}`,
        method: 'GET'
      })
    }),

    updateCustomer: build.mutation({
      query: ({ id, body }) => ({
        url: `customer/${id}`,
        method: 'PUT',
        body
      })
    }),

    patchCustomer: build.mutation({
      query: ({ id, body }) => ({
        url: `customer/${id}`,
        method: 'PATCH',
        body
      })
    }),

    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `customer/${id}`,
        method: 'DELETE'
      })
    }),

    getCustomerHistory: build.query({
      query: (id) => ({
        url: `customer/${id}/history`,
        method: 'GET'
      })
    }),

    createCustomer: build.mutation<ICustomer, ICreateCustomerParams>({
      query: (body) => ({
        url: 'customer/create',
        method: 'POST',
        body
      })
    })
  })
});

export const {
  useGetCustomerQuery,
  useLazyGetCustomerQuery,
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  usePatchCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerHistoryQuery,
  useCreateCustomerMutation
} = customerApi;
