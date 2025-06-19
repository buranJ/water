import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface TyItem {
  id: number;
  status_display: string;
  stage_display: string;
  request_source: string;
  request_number: string;
  request_date: string;
  object_name: string;
  address: string;
  eni: string;
  status: string;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  is_water: boolean;
  is_kanal: boolean;
  stage: string;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;
  fire_input_1: string;
  fire_input_2: string;
  notes: string;
  payment_paper: string;
  payment_connection: string;
  payment_status: string;
  payment_amount: string;
  payment_deadline: string;
  payment_invoice_number: string;
  created_at: string;
  updated_at: string;
  customer: number;
  entity: number;
  author: number;
  formula: number;
  responsible: number;
  application: number;
}

export interface TyBody {
  request_source: string;
  request_number: string;
  request_date: string;
  object_name: string;
  address: string;
  eni: string;
  status: string;
  sewage_amount: string;
  water_required: string;
  pressure_required: string;
  fire_fighting: string;
  is_water: boolean;
  is_kanal: boolean;
  stage: string;
  connection_target: string;
  street_pass: string;
  collector: string;
  water_pipe: string;
  sewer: string;
  fire_input_1: string;
  fire_input_2: string;
  notes: string;
  payment_paper: string;
  payment_connection: string;
  payment_status: string;
  payment_amount: string;
  payment_deadline: string;
  payment_invoice_number: string;
  customer: number;
  entity: number;
  author: number;
  formula: number;
  responsible: number;
  application: number;
}

export const tyApi = createApi({
  reducerPath: 'tyApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getAllTy: build.query<TyItem[], void>({
      query: () => ({
        url: '/ty/',
        method: 'GET'
      })
    }),

    createTy: build.mutation<TyItem, TyBody>({
      query: (body) => ({
        url: '/ty/',
        method: 'POST',
        body
      })
    }),

    getTyById: build.query<TyItem, number>({
      query: (id) => ({
        url: `/ty/${id}/`,
        method: 'GET'
      })
    }),

    updateTy: build.mutation<TyItem, { id: number; body: TyBody }>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PUT',
        body
      })
    }),

    patchTy: build.mutation<TyItem, { id: number; body: Partial<TyBody> }>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PATCH',
        body
      })
    }),

    deleteTy: build.mutation<void, number>({
      query: (id) => ({
        url: `/ty/${id}/`,
        method: 'DELETE'
      })
    })
  })
});

export const { useGetAllTyQuery, useCreateTyMutation, useGetTyByIdQuery, useUpdateTyMutation, usePatchTyMutation, useDeleteTyMutation } =
  tyApi;
