// src/api/Accounting.api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IDownloadProtocolParams,
  IGenerateInvoiceParams,
  IGenerateInvoiceResponse,
  IGetAccountingProtocolParams,
  IGetAccountingProtocolResponse,
  IGetInvoiceByProtocolParams,
  IGetInvoiceByProtocolResponse,
  IUpdateProtocolParams,
  IUpdateProtocolResponse
} from 'types/entities/accounting';

export const accountingApi = createApi({
  reducerPath: 'accountingApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Invoice', 'Protocol'],
  endpoints: (build) => ({
    getAccountingProtocol: build.query<IGetAccountingProtocolResponse, IGetAccountingProtocolParams>({
      query: ({ technicalConditionId }) => ({
        url: `/buhgalteria/protocolsbyty/${technicalConditionId}/`,
        method: 'GET'
      }),
      providesTags: ['Protocol']
    }),

    getInvoiceByProtocol: build.query<IGetInvoiceByProtocolResponse, IGetInvoiceByProtocolParams>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/invoicesbyprot/${protocolId}/`,
        method: 'GET'
      }),
      providesTags: ['Invoice']
    }),

    generateInvoice: build.mutation<IGenerateInvoiceResponse, IGenerateInvoiceParams>({
      query: ({ protocolId }) => ({
        url: `/buhgaleria/invoices/generate/${protocolId}/`,
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
    })
  })
});

export const {
  useGetAccountingProtocolQuery,
  useGetInvoiceByProtocolQuery,
  useGenerateInvoiceMutation,
  useUpdateProtocolMutation,
  useLazyDownloadProtocolQuery
} = accountingApi;
