import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export type ReportType =
  | 'issued' // Выданные ТУ
  | 'canceled' // Аннулированные ТУ
  | 'not_issued' // Не выданные ТУ
  | 'requests' // Заявки
  | 'land_agreements' // Согласованные участки
  | 'unpaid_tu' // Неоплаченные ТУ
  | 'objects' // Объекты
  | 'payments' // Оплаты
  | 'debts' // Задолженности
  | 'reconciliation'; // Акт сверки

export interface GetReportsQuery {
  created_by?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  report_type: ReportType;
}

export interface ReportItem {
  id: number;
  report_type: ReportType;
  report_type_display?: string;
  created_at: string;
  title?: string;
  pdf_file?: string; // ссылка на PDF
}

export interface ReportsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReportItem[];
}

export const reportsApi = createApi({
  reducerPath: 'reportsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getReports: build.query<ReportsResponse, GetReportsQuery>({
      query: (params) => ({
        url: 'reports/',
        method: 'GET',
        params
      })
    })
  })
});

export const { useGetReportsQuery, useLazyGetReportsQuery } = reportsApi;
