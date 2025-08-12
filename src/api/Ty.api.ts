import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import {
  IAddLoadParams,
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetLoadIncreasesParams,
  IGetLoadIncreasesResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IGetTyHistoryParams,
  IGetTyHistoryResponse,
  IITypesTYParams,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  ITypesTYResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse
} from 'types/requests';

export const tyApi = createApi({
  reducerPath: 'tyApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Ty', 'TyLoads'],
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
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'Ty', id: tyId }]
    }),

    updateTy: build.mutation<IUpdateTechnicalConditionResponse, IUpdateTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Ty', id }]
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
    }),
    getTypesTy: build.query<ITypesTYResponse, IITypesTYParams>({
      query: () => ({
        url: '/ty/typesTY/',
        method: 'GET'
      })
    }),
    getHistoryTy: build.query<IGetTyHistoryResponse, IGetTyHistoryParams>({
      query: ({ tyId, ...params }) => ({
        url: `/ty/${tyId}/history/`,
        method: 'GET',
        params
      })
    }),
    createTyFromApplication: build.mutation<void, { application_id: number }>({
      query: ({ application_id }) => ({
        url: `/ty/from-application/${application_id}/`,
        method: 'POST'
      })
    }),
    addLoad: build.mutation<void, IAddLoadParams>({
      query: ({ ty_id, water_required, pressure_required, sewage_amount, comment, files }) => {
        const formData = new FormData();
        formData.append('water_required', water_required);
        formData.append('pressure_required', pressure_required);
        formData.append('sewage_amount', sewage_amount);
        if (comment) formData.append('comment', comment);
        if (files && files.length) {
          files.forEach((file) => formData.append('files', file));
        }
        return {
          url: `/ty/${ty_id}/add-load/`,
          method: 'PATCH',
          body: formData,
          formData: true
        };
      },
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }]
    }),

    getLoadIncreases: build.query<IGetLoadIncreasesResponse, IGetLoadIncreasesParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/load-increases/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'TyLoads', id: tyId }]
    })
  })
});

export const {
  useGetAllTyQuery,
  useCreateTyMutation,
  useGetTyByIdQuery,
  useUpdateTyMutation,
  usePatchTyMutation,
  useDeleteTyMutation,
  useGetTypesTyQuery,
  useGetHistoryTyQuery,
  useCreateTyFromApplicationMutation,
  useAddLoadMutation,
  useGetLoadIncreasesQuery
} = tyApi;
