import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface MapObject {
  id: number;
  request_number: string;
  object_name: string;
  address: string;
  status: 'active' | 'inactive';
  stage: 'draft' | 'approved' | 'completed';
  type: 'water' | 'sewer' | 'gas' | 'electric' | 'other';
  created_date: string;
  x: number;
  y: number;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: {
    id: number;
    request_number: string;
    object_name: string;
    address: string;
    status: 'active' | 'inactive';
    stage: 'draft' | 'approved' | 'completed';
    type: 'water' | 'sewer' | 'gas' | 'electric' | 'other';
    created_date: string;
    x: string;
    y: string;
  }[];
}

// Создаем тип для трансформированного ответа
export interface TransformedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MapObject[];
}

export const geoportalApi = createApi({
  reducerPath: 'geoportalApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['MapObject'],
  endpoints: (build) => ({
    getAllMapObjects: build.query<TransformedApiResponse, void>({
      query: () => ({
        url: 'ty/map/',
        method: 'GET'
      }),
      providesTags: ['MapObject'],
      transformResponse: (response: ApiResponse): TransformedApiResponse => {
        const transformedResults: MapObject[] = response.results
          .map((obj) => ({
            ...obj,
            x: parseFloat(obj.x),
            y: parseFloat(obj.y)
          }))
          .filter((obj) => !isNaN(obj.x) && !isNaN(obj.y));

        return {
          ...response,
          results: transformedResults
        };
      }
    })
  })
});

export const { useGetAllMapObjectsQuery } = geoportalApi;
