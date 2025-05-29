import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

interface ObjectItem {
  id: number;
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer: number;
}

type ObjectListResponse = ObjectItem[];

interface ObjectBody {
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  customer: number;
}

interface ObjectHistoryItem {
  history_user: string;
  history_date: string;
  history_type: string;
}
type ObjectHistoryResponse = ObjectHistoryItem[];

export const objectApi = createApi({
  reducerPath: 'objectApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getAllObjects: build.query<ObjectListResponse, void>({
      query: () => ({
        url: '/api/v1/object/',
        method: 'GET'
      })
    }),

    getObjectById: build.query<ObjectItem, number>({
      query: (id) => ({
        url: `/api/v1/object/${id}`,
        method: 'GET'
      })
    }),

    updateObject: build.mutation<ObjectItem, { id: number; body: ObjectBody }>({
      query: ({ id, body }) => ({
        url: `/api/v1/object/${id}`,
        method: 'PUT',
        body
      })
    }),

    // PATCH /api/v1/object/{id} — частичное обновление
    // (если структура полей совпадает, используем тот же ObjectBody)
    patchObject: build.mutation<ObjectItem, { id: number; body: Partial<ObjectBody> }>({
      query: ({ id, body }) => ({
        url: `/api/v1/object/${id}`,
        method: 'PATCH',
        body
      })
    }),

    deleteObject: build.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/object/${id}`,
        method: 'DELETE'
      })
    }),

    getObjectHistory: build.query<ObjectHistoryResponse, number>({
      query: (id) => ({
        url: `/api/v1/object/${id}/history`,
        method: 'GET'
      })
    }),
    // POST /api/v1/object/create
    createObject: build.mutation<ObjectItem, ObjectBody>({
      query: (body) => ({
        url: '/api/v1/object/create',
        method: 'POST',
        body
      })
    })
  })
});

export const {
  useGetAllObjectsQuery,
  useGetObjectByIdQuery,
  useUpdateObjectMutation,
  usePatchObjectMutation,
  useDeleteObjectMutation,
  useGetObjectHistoryQuery,
  useCreateObjectMutation
} = objectApi;
