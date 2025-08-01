import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { IGetObjectParams, ObjectBody, ObjectHistoryResponse, ObjectItem, ObjectListResponse } from 'types/entities/objects';

export interface IGetObjectsParams {
  customer?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
  type?: string;
}

export const objectApi = createApi({
  reducerPath: 'objectApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Object'],
  endpoints: (build) => ({
    getAllObjects: build.query<{ results: ObjectListResponse }, IGetObjectParams>({
      query: (params) => ({
        url: 'object/',
        method: 'GET',
        params
      }),
      providesTags: ['Object']
    }),

    getObjectById: build.query<ObjectItem, number>({
      query: (id) => ({
        url: `object/${id}`,
        method: 'GET'
      }),
      providesTags: (_, __, id) => [{ type: 'Object', id }]
    }),

    updateObject: build.mutation<ObjectItem, { id: number; body: ObjectBody }>({
      query: ({ id, body }) => ({
        url: `object/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    }),

    // PATCH object/{id} — частичное обновление
    patchObject: build.mutation<ObjectItem, { id: number; body: Partial<ObjectBody> }>({
      query: ({ id, body }) => ({
        url: `object/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    }),

    deleteObject: build.mutation<void, number>({
      query: (id) => ({
        url: `object/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Object']
    }),

    getObjectHistory: build.query<ObjectHistoryResponse, number>({
      query: (id) => ({
        url: `object/${id}/history`,
        method: 'GET'
      })
    }),

    // POST object/create
    createObject: build.mutation<ObjectItem, ObjectBody>({
      query: (body) => ({
        url: 'object/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Object']
    }),

    // Удобный метод для обновления только title
    updateObjectTitle: build.mutation<ObjectItem, { id: number; title: string }>({
      query: ({ id, title }) => ({
        url: `object/${id}`,
        method: 'PATCH',
        body: { title }
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'Object', id }, 'Object']
    })
  })
});

export const {
  useGetAllObjectsQuery,
  useLazyGetAllObjectsQuery,
  useGetObjectByIdQuery,
  useUpdateObjectMutation,
  usePatchObjectMutation,
  useDeleteObjectMutation,
  useGetObjectHistoryQuery,
  useCreateObjectMutation,
  useUpdateObjectTitleMutation
} = objectApi;
