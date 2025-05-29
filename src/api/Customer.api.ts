import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getAllCustomers: build.query({
      query: () => ({
        url: '/api/v1/customer/',
        method: 'GET'
      })
    }),

    getCustomerById: build.query({
      query: (id) => ({
        url: `/api/v1/customer/${id}`,
        method: 'GET'
      })
    }),

    updateCustomer: build.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/customer/${id}`,
        method: 'PUT',
        body
      })
    }),

    patchCustomer: build.mutation({
      query: ({ id, body }) => ({
        url: `/api/v1/customer/${id}`,
        method: 'PATCH',
        body
      })
    }),

    deleteCustomer: build.mutation({
      query: (id) => ({
        url: `/api/v1/customer/${id}`,
        method: 'DELETE'
      })
    }),

    getCustomerHistory: build.query({
      query: (id) => ({
        url: `/api/v1/customer/${id}/history`,
        method: 'GET'
      })
    }),

    createCustomer: build.mutation({
      query: (body) => ({
        url: '/api/v1/customer/create',
        method: 'POST',
        body
      })
    })
  })
});

export const {
  useGetAllCustomersQuery,
  useGetCustomerByIdQuery,
  useUpdateCustomerMutation,
  usePatchCustomerMutation,
  useDeleteCustomerMutation,
  useGetCustomerHistoryQuery,
  useCreateCustomerMutation
} = customerApi;
