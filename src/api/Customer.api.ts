import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export const customerApi = createApi({
  reducerPath: 'customerApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getAllCustomers: build.query({
      query: () => ({
        url: 'customer/',
        method: 'GET'
      })
    }),

    getCustomerById: build.query({
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

    createCustomer: build.mutation({
      query: (body) => ({
        url: 'customer/create',
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
