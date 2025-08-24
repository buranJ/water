import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IAccountingProtocolsListResponse,
  ICreatePaymentResponse,
  IDownloadProtocolParams,
  IGenerateInvoiceParams,
  IGenerateInvoiceResponse,
  IGetAccountingProtocolParams,
  IGetAccountingProtocolResponse,
  IGetAccountingProtocolsListParams,
  IGetInvoicesByProtocolParams,
  IGetInvoicesByProtocolResponse,
  IGetPaymentsByInvoiceParams,
  IGetPaymentsByInvoiceResponse,
  IUpdateProtocolParams,
  IUpdateProtocolResponse
} from 'types/entities/accounting';

export const accountingApi = createApi({
  reducerPath: 'accountingApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Invoice', 'Protocol', 'Payment'],
  endpoints: (build) => ({
    getAccountingProtocol: build.query<IGetAccountingProtocolResponse, IGetAccountingProtocolParams>({
      query: ({ technicalConditionId }) => ({
        url: `/buhgalteria/protocolsbyty/${technicalConditionId}/`,
        method: 'GET'
      }),
      providesTags: ['Protocol']
    }),

    getAllProtocols: build.query<IAccountingProtocolsListResponse, IGetAccountingProtocolsListParams>({
      query: (params = {}) => ({
        url: '/buhgalteria/protocols/',
        method: 'GET',
        params
      }),
      providesTags: ['Protocol']
    }),

    getInvoicesByProtocol: build.query<IGetInvoicesByProtocolResponse, IGetInvoicesByProtocolParams>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/invoices/by_protocol/${protocolId}/`,
        method: 'GET'
      }),
      providesTags: ['Invoice']
    }),

    generateInvoice: build.mutation<IGenerateInvoiceResponse, IGenerateInvoiceParams>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/invoices/generate/${protocolId}/`,
        method: 'POST',
        body: {}
      }),
      invalidatesTags: ['Invoice']
    }),

    updateProtocol: build.mutation<IUpdateProtocolResponse, IUpdateProtocolParams>({
      query: ({ protocolId, body }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Protocol', 'Invoice']
    }),

    downloadProtocol: build.query<Blob, IDownloadProtocolParams>({
      query: ({ technicalConditionId }) => ({
        url: `/ty/${technicalConditionId}/protocol-excel/`,
        method: 'GET',
        responseHandler: (response) => response.blob()
      })
    }),

    getPaymentsByInvoice: build.query<IGetPaymentsByInvoiceResponse, IGetPaymentsByInvoiceParams>({
      query: ({ invoiceId }) => ({
        url: `/buhgalteria/payments/by_invoice/${invoiceId}/`,
        method: 'GET'
      }),
      providesTags: ['Payment']
    }),

    createPayment: build.mutation<ICreatePaymentResponse, FormData>({
      query: (formData) => ({
        url: `/buhgalteria/payments/`,
        method: 'POST',
        body: formData,
        formData: true
      }),
      invalidatesTags: ['Payment']
    })
  })
});

export const {
  useGetAccountingProtocolQuery,
  useGetAllProtocolsQuery,
  useGetInvoicesByProtocolQuery,
  useGenerateInvoiceMutation,
  useUpdateProtocolMutation,
  useLazyDownloadProtocolQuery,
  useGetPaymentsByInvoiceQuery,
  useCreatePaymentMutation
} = accountingApi;
