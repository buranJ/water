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
    })
  })
});

export const { useCreateApplicationMutation } = applicationsApi;
