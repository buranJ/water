// src/api/Street.api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface Street {
  id: number;
  name: string;
  letter?: string;
  created_at?: string;
  updated_at?: string;
}

export interface IGetStreetsParams {
  search?: string;
  name?: string;
  letter?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

type Paginated<T> = { results: T[]; count: number };

export const streetApi = createApi({
  reducerPath: 'streetApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    // GET /api/v1/streets/?search=<query>
    getStreets: build.query<Paginated<Street>, IGetStreetsParams | undefined>({
      query: (params) => ({
        url: 'streets/',
        method: 'GET',
        params: params ?? undefined
      })
    })
  })
});

export const { useGetStreetsQuery, useLazyGetStreetsQuery } = streetApi;
