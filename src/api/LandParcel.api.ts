import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type {
  ICreateLandParcelParams,
  IDeleteLandParcelParams,
  IGetAllLandParcelsParams,
  IGetLandParcelByIdParams,
  ILandParcel,
  ILandParcelsListResponse,
  IUpdateLandParcelParams
} from 'types/requests';

export const landParcelApi = createApi({
  reducerPath: 'landParcelApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['LandParcel'],
  endpoints: (build) => ({
    // GET /object/land-parcels/ - список всех участков
    getAllLandParcels: build.query<ILandParcelsListResponse, IGetAllLandParcelsParams>({
      query: (params) => ({
        url: '/object/land-parcels/',
        method: 'GET',
        params
      }),
      providesTags: ['LandParcel']
    }),

    // ✅ ИСПРАВЛЕНО: убрали слэш в конце
    // GET /object/land-parcels/{id} - получить участок по ID
    getLandParcelById: build.query<ILandParcel, IGetLandParcelByIdParams>({
      query: ({ id }) => ({
        url: `/object/land-parcels/${id}`, // ✅ БЕЗ слэша
        method: 'GET'
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }]
    }),

    // POST /object/land-parcels/create - создать новый участок
    createLandParcel: build.mutation<ILandParcel, ICreateLandParcelParams>({
      query: (body) => ({
        url: '/object/land-parcels/create',
        method: 'POST',
        body
      }),
      invalidatesTags: ['LandParcel']
    }),

    // ✅ ИСПРАВЛЕНО: убрали слэш
    // PUT /object/land-parcels/{id} - полное обновление
    updateLandParcel: build.mutation<ILandParcel, IUpdateLandParcelParams>({
      query: ({ id, body }) => ({
        url: `/object/land-parcels/${id}`, // ✅ БЕЗ слэша
        method: 'PUT',
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }, 'LandParcel']
    }),

    // ✅ ИСПРАВЛЕНО: убрали слэш
    // PATCH /object/land-parcels/{id} - частичное обновление
    patchLandParcel: build.mutation<ILandParcel, IUpdateLandParcelParams>({
      query: ({ id, body }) => ({
        url: `/object/land-parcels/${id}`, // ✅ БЕЗ слэша
        method: 'PATCH',
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }, 'LandParcel']
    }),

    // ✅ ИСПРАВЛЕНО: убрали слэш
    // DELETE /object/land-parcels/{id} - удалить участок
    deleteLandParcel: build.mutation<void, IDeleteLandParcelParams>({
      query: ({ id }) => ({
        url: `/object/land-parcels/${id}`, // ✅ БЕЗ слэша
        method: 'DELETE'
      }),
      invalidatesTags: ['LandParcel']
    })
  })
});

export const {
  useGetAllLandParcelsQuery,
  useGetLandParcelByIdQuery,
  useCreateLandParcelMutation,
  useUpdateLandParcelMutation,
  usePatchLandParcelMutation,
  useDeleteLandParcelMutation
} = landParcelApi;
