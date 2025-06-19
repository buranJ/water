import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

interface RefusalCause {
  id: number;
  title: string;
  created_at: string;
}

interface RefusalFile {
  title: string;
  file: string;
  type: string;
  created_at: string;
}

interface RefusalResponse {
  causes: RefusalCause[];
  comment: string;
  ty: number;
  application: number;
  created_at: string;
  refusal_files: RefusalFile[];
}

interface RefusalBody {
  comment: string;
  ty: number;
  application: number;
  refusal_files: {
    title: string;
    file: string;
    type: string;
  }[];
  causes_ids: number[];
}

interface RefusalHistoryItem {
  history_user: string;
  history_date: string;
  history_type: string;
}

export const refusalApi = createApi({
  reducerPath: 'refusalApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getRefusals: build.query<RefusalResponse[], void>({
      query: () => ({
        url: '/api/v1/refusal/',
        method: 'GET'
      })
    }),

    getRefusalById: build.query<RefusalResponse, number>({
      query: (id) => ({
        url: `/api/v1/refusal/${id}`,
        method: 'GET'
      })
    }),

    updateRefusal: build.mutation<RefusalResponse, { id: number; body: RefusalBody }>({
      query: ({ id, body }) => ({
        url: `/api/v1/refusal/${id}`,
        method: 'PUT',
        body
      })
    }),

    patchRefusal: build.mutation<RefusalResponse, { id: number; body: Partial<RefusalBody> }>({
      query: ({ id, body }) => ({
        url: `/api/v1/refusal/${id}`,
        method: 'PATCH',
        body
      })
    }),

    deleteRefusal: build.mutation<void, number>({
      query: (id) => ({
        url: `/api/v1/refusal/${id}`,
        method: 'DELETE'
      })
    }),

    getRefusalHistory: build.query<RefusalHistoryItem[], number>({
      query: (id) => ({
        url: `/api/v1/refusal/${id}/history/`,
        method: 'GET'
      })
    }),

    getRefusalCauses: build.query<RefusalCause[], void>({
      query: () => ({
        url: '/api/v1/refusal/causes',
        method: 'GET'
      })
    }),

    checkRefuseByCustomer: build.query<RefusalResponse, number>({
      query: (customerId) => ({
        url: `/api/v1/refusal/check-refuse/customer/${customerId}/`,
        method: 'GET'
      })
    }),

    checkRefuseByEntity: build.query<RefusalResponse, number>({
      query: (entityId) => ({
        url: `/api/v1/refusal/check-refuse/entity/${entityId}/`,
        method: 'GET'
      })
    }),

    createRefusal: build.mutation<RefusalResponse, RefusalBody>({
      query: (body) => ({
        url: '/api/v1/refusal/create',
        method: 'POST',
        body
      })
    })
  })
});

export const {
  useGetRefusalsQuery,
  useGetRefusalByIdQuery,
  useUpdateRefusalMutation,
  usePatchRefusalMutation,
  useDeleteRefusalMutation,
  useGetRefusalHistoryQuery,
  useGetRefusalCausesQuery,
  useCheckRefuseByCustomerQuery,
  useCheckRefuseByEntityQuery,
  useCreateRefusalMutation
} = refusalApi;
