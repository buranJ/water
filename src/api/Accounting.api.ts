import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IAccountingProtocol,
  IAccountingProtocolsListResponse,
  ICreatePaymentResponse,
  IGenerateInvoiceParams,
  IGenerateInvoiceResponse,
  IGetAccountingProtocolParams,
  IGetAccountingProtocolResponse,
  IGetAccountingProtocolsListParams,
  IGetInvoicesByProtocolParams,
  IGetInvoicesByProtocolResponse,
  IGetInvoicesListParams,
  IGetPaymentsByInvoiceParams,
  IGetPaymentsByInvoiceResponse,
  IInvoiceRequisite,
  IPaginatedInvoicesList,
  IUpdateProtocolParams,
  IUpdateProtocolResponse
} from 'types/entities/accounting';

interface IExportProtocolsParams {
  council_date_start?: string;
  council_date_end?: string;
  tech_council_date_start?: string;
  tech_council_date_end?: string;
  tu_numbers?: string;
  exclude_tu_numbers?: string;
}

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

    getInvoicesList: build.query<IPaginatedInvoicesList, IGetInvoicesListParams>({
      query: (params = {}) => ({
        url: '/buhgalteria/invoices/',
        method: 'GET',
        params
      }),
      providesTags: ['Invoice']
    }),

    getProtocolById: build.query<IAccountingProtocol, { protocolId: string }>({
      query: ({ protocolId }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'GET'
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

    downloadInvoice: build.query<Blob, { invoiceId: string; requisite?: number | string }>({
      query: ({ invoiceId, requisite }) => ({
        url: `/buhgalteria/invoices/dublicate/${invoiceId}/`,
        method: 'GET',
        params: requisite != null ? { requisite } : undefined,
        responseHandler: (response) => response.blob()
      }),
      keepUnusedDataFor: 0
    }),

    getInvoiceRequisites: build.query<IInvoiceRequisite[], void>({
      query: () => ({
        url: '/buhgalteria/invoices/requisites/',
        method: 'GET'
      })
    }),

    updateProtocol: build.mutation<IUpdateProtocolResponse, IUpdateProtocolParams>({
      query: ({ protocolId, body }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Protocol', 'Invoice']
    }),

    downloadProtocol: build.query<Blob, { technicalConditionId: string }>({
      query: ({ technicalConditionId }) => ({
        url: `/ty/${technicalConditionId}/protocol-excel/`,
        method: 'GET',
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          if (blob.size === 0) {
            throw new Error('Получен пустой файл');
          }

          return blob;
        }
      }),
      keepUnusedDataFor: 0
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
    }),

    exportProtocolsExcel: build.mutation<Blob, IExportProtocolsParams>({
      query: (params) => ({
        url: '/buhgalteria/protocols/export-excel/',
        method: 'GET',
        params,
        responseHandler: async (response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const blob = await response.blob();

          if (blob.size === 0) {
            throw new Error('Получен пустой файл');
          }

          return blob;
        }
      })
    }),

    // ✅ НОВЫЙ ENDPOINT: Изменение статуса просмотра протокола
    patchProtocol: build.mutation<IAccountingProtocol, { id: number; body: { is_viewed: boolean } }>({
      query: ({ id, body }) => ({
        url: `/buhgalteria/protocols/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Protocol']
    })
  })
});

export const useGetAccountingProtocolQuery = accountingApi.useGetAccountingProtocolQuery;
export const useGetAllProtocolsQuery = accountingApi.useGetAllProtocolsQuery;
export const useGetInvoicesListQuery = accountingApi.useGetInvoicesListQuery;
export const useGetInvoicesByProtocolQuery = accountingApi.useGetInvoicesByProtocolQuery;
export const useGenerateInvoiceMutation = accountingApi.useGenerateInvoiceMutation;
export const useLazyDownloadInvoiceQuery = accountingApi.useLazyDownloadInvoiceQuery;
export const useUpdateProtocolMutation = accountingApi.useUpdateProtocolMutation;
export const useLazyDownloadProtocolQuery = accountingApi.useLazyDownloadProtocolQuery;
export const useGetPaymentsByInvoiceQuery = accountingApi.useGetPaymentsByInvoiceQuery;
export const useCreatePaymentMutation = accountingApi.useCreatePaymentMutation;
export const useLazyGetProtocolByIdQuery = accountingApi.useLazyGetProtocolByIdQuery;
export const useExportProtocolsExcelMutation = accountingApi.useExportProtocolsExcelMutation;
export const usePatchProtocolMutation = accountingApi.usePatchProtocolMutation; // ✅ НОВОЕ
export const useGetInvoiceRequisitesQuery = accountingApi.useGetInvoiceRequisitesQuery;
