import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IDownloadContractDocxParams, IDownloadContractDocxResponse } from 'types/requests';
import type { IGetInvoicesByProtocolTyParams, IGetInvoicesByProtocolTyResponse } from 'types/requests';

// Типы для нового endpoint
export interface IExportProtocolsParams {
  created_start?: string; // ISO 8601 формат: 2024-01-01T00:00:00
  created_end?: string; // ISO 8601 формат: 2024-12-31T23:59:59
  tu_numbers?: string; // строка через запятую: "123,456,789"
}

// Типы для редактирования протокола
// Добавь эти поля в IUpdateProtocolTableParams body

export interface IUpdateProtocolTableParams {
  protocolId: string;
  body: {
    protocol_number?: string;
    protocol_date?: string;
    load?: string;
    customer?: string;
    water_required?: string;
    sewage_amount?: string;
    water_price?: string;
    kanal_price?: string;
    coefficient?: number;
    water_sum?: string;
    kanal_sum?: string;
    total_water_sum?: string;
    total_kanal_sum?: string;
    paper_water_sum?: string;
    paper_kanal_sum?: string;
    nsp_water_paper?: string;
    nsp_kanal_paper?: string;
    nsp_paper?: string;
    nds_kanal_paper?: string;
    nds_water_paper?: string;
    nds_paper?: string;
    total_sum_main?: string;
    total_sum_paper?: string;
    nds?: string;
    nsp?: string;
    nsp_water?: string;
    nsp_kanal?: string;
    note?: string;
    technical_condition?: number;
    // Новые поля
    all_water_required?: string;
    all_sewage_amount?: string;
    paid_water_required?: string;
    paid_sewage_amount?: string;
  };
}

// И в IProtocolResponse добавь эти же поля

export interface IProtocolResponse {
  id: number;
  load: string;
  customer: string;
  water_required: string;
  sewage_amount: string;
  water_price: string;
  kanal_price: string;
  coefficient: number;
  water_sum: string;
  kanal_sum: string;
  total_water_sum: string;
  total_kanal_sum: string;
  paper_water_sum: string;
  paper_kanal_sum: string;
  nsp_water_paper: string;
  nsp_kanal_paper: string;
  nsp_paper: string;
  nds_kanal_paper: string;
  nds_water_paper: string;
  nds_paper: string;
  total_sum_main: string;
  total_sum_paper: string;
  nds: string;
  nsp: string;
  nsp_water: string;
  nsp_kanal: string;
  note: string;
  created_at: string;
  technical_condition: number;
  // Новые поля
  all_water_required?: string;
  all_sewage_amount?: string;
  paid_water_required?: string;
  paid_sewage_amount?: string;
}

export const buhgalteriaApi = createApi({
  reducerPath: 'buhgalteriaApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Protocol'],
  endpoints: (build) => ({
    postProtocol: build.mutation({
      query: ({ protocol_id }) => ({
        url: '/buhgalteria/invoices/generate/' + protocol_id,
        method: 'POST'
      })
    }),
    downloadContractDocx: build.query<IDownloadContractDocxResponse, IDownloadContractDocxParams>({
      query: ({ ty_id, customer_type }) => ({
        url: `/buhgalteria/protocols/${ty_id}/contract-docx/`,
        method: 'GET',
        params: { customer_type },
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          // Try RFC 5987 filename*
          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }

          // Fallback to regular filename
          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }

          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),
    getInvoicesByProtocolTy: build.query<IGetInvoicesByProtocolTyResponse, IGetInvoicesByProtocolTyParams>({
      query: ({ protocol_id }) => ({
        url: `/buhgalteria/invoices/by_protocol/${protocol_id}/`,
        method: 'GET'
      })
    }),
    // Экспорт протоколов в Excel
    exportProtocolsExcel: build.mutation<Blob, IExportProtocolsParams>({
      query: (params) => {
        const filteredParams: Record<string, string> = {};

        if (params.created_start) {
          filteredParams.created_start = params.created_start;
        }
        if (params.created_end) {
          filteredParams.created_end = params.created_end;
        }
        if (params.tu_numbers) {
          filteredParams.tu_numbers = params.tu_numbers;
        }

        return {
          url: '/buhgalteria/protocols/export-excel/',
          method: 'GET',
          params: filteredParams,
          responseHandler: async (response) => {
            return await response.blob();
          }
        };
      }
    }),
    // Новый endpoint для получения протокола
    getProtocol: build.query<IProtocolResponse, string>({
      query: (protocolId) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'GET'
      }),
      providesTags: ['Protocol']
    }),
    // Новый endpoint для обновления протокола
    updateProtocolTable: build.mutation<IProtocolResponse, IUpdateProtocolTableParams>({
      query: ({ protocolId, body }) => ({
        url: `/buhgalteria/protocols/${protocolId}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Protocol']
    })
  })
});

export const {
  usePostProtocolMutation,
  useLazyDownloadContractDocxQuery,
  useGetInvoicesByProtocolTyQuery,
  useLazyGetInvoicesByProtocolTyQuery,
  useExportProtocolsExcelMutation,
  useGetProtocolQuery,
  useUpdateProtocolTableMutation
} = buhgalteriaApi;
