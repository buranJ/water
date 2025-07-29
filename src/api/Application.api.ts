import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface IApplication {
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  INN: string;
  customer: number;
  object: number | string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  attachments: string[];
  entity: number;
}

interface ICreateApplicationResponse extends IApplication {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface IGetApplicationsParams {
  status?: 'pending' | 'rejected' | 'approved' | 'contracted';
  search?: string;
  customer?: number;
  entity?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IApplicationResponse {
  id: number;
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  INN: string;
  customer: number;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  application_files: string[];
  entity: number;
  created_at: string;
  updated_at: string;
}

export interface IApplicationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IApplicationResponse[];
}

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    createApplication: build.mutation<ICreateApplicationResponse, IApplication>({
      query: (data) => ({
        url: 'application/create',
        method: 'POST',
        body: data
      })
    }),
    getApplications: build.query<IApplicationsListResponse, IGetApplicationsParams | void>({
      query: (params) => ({
        url: 'application/',
        method: 'GET',
        params: params || {}
      })
    }),
    getApplicationById: build.query<IApplicationResponse, number | string>({
      query: (id) => ({
        url: `application/${id}`,
        method: 'GET'
      })
    })
  })
});

export const { useCreateApplicationMutation, useGetApplicationsQuery, useGetApplicationByIdQuery } = applicationsApi;
