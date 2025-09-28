// src/api/RequestSource.api.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface IRequestSource {
  id: number;
  title: string;
  created_at?: string;
  updated_at?: string;
}

export interface IRequestSourcesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IRequestSource[];
}

export interface IRequestSourcesParams {
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  title?: string;
}

export const requestSourceApi = createApi({
  reducerPath: 'requestSourceApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getRequestSources: build.query<IRequestSourcesResponse, IRequestSourcesParams | void>({
      query: (params) => ({
        url: 'request-source/',
        method: 'GET',
        params: params ?? { page: 1, page_size: 100 }
      })
    })
  })
});

export const { useGetRequestSourcesQuery, useLazyGetRequestSourcesQuery } = requestSourceApi;
