import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse
} from 'types/requests';

export const tyApi = createApi({
  reducerPath: 'tyApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getAllTy: build.query<IGetAllTechnicalConditionResponse, IGetAllTechnicalConditionParams>({
      query: (params) => ({
        url: '/ty/',
        method: 'GET',
        params
      })
    }),

    createTy: build.mutation<ICreateTechnicalConditionRequest, ICreateTechnicalConditionParams>({
      query: (body) => ({
        url: '/ty/',
        method: 'POST',
        body
      })
    }),

    getTyById: build.query<IGetTechnicalConditionByIdResponse, IGetTechnicalConditionByIdParams>({
      query: (id) => ({
        url: `/ty/${id}/`,
        method: 'GET'
      })
    }),

    updateTy: build.mutation<IUpdateTechnicalConditionResponse, IUpdateTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PUT',
        body
      })
    }),

    patchTy: build.mutation<IPatchTechnicalConditionResponse, IPatchTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PATCH',
        body
      })
    }),

    deleteTy: build.mutation<IDeleteTechnicalConditionResponse, IDeleteTechnicalConditionParams>({
      query: (id) => ({
        url: `/ty/${id}/`,
        method: 'DELETE'
      })
    })
  })
});

export const { useGetAllTyQuery, useCreateTyMutation, useGetTyByIdQuery, useUpdateTyMutation, usePatchTyMutation, useDeleteTyMutation } =
  tyApi;
