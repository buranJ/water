import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface MapObject {
  id: number;
  request_number: string;
  object_name: string;
  address: string;
  type_ty: string | null;
  status: 'active' | 'inactive' | 'archived';
  stage: 'draft' | 'approved' | 'completed';
  x: number;
  y: number;
}

interface ApiMapObject {
  id: number;
  request_number: string;
  object_name: string;
  address: string;
  type_ty: string | null;
  status: 'active' | 'inactive' | 'archived';
  stage: 'draft' | 'approved' | 'completed';
  x: number;
  y: number;
}

export interface ApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ApiMapObject[];
}

export interface TransformedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: MapObject[];
}

const isValidCoordinates = (x: number, y: number): boolean => {
  return typeof x === 'number' && typeof y === 'number' && !Number.isNaN(x) && !Number.isNaN(y) && x !== 0 && y !== 0;
};

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
        const validResults = response.results.filter((obj) => {
          const isValid = isValidCoordinates(obj.x, obj.y);

          if (!isValid) {
            console.warn(`Объект ${obj.id} имеет невалидные координаты:`, {
              x: obj.x,
              y: obj.y
            });
          }

          return isValid;
        });

        return {
          ...response,
          results: validResults
        };
      }
    })
  })
});

export const { useGetAllMapObjectsQuery } = geoportalApi;
