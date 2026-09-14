import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type {
  ICreateLandParcelParams,
  IDeleteLandParcelParams,
  IGenerateLandParcelDocumentParams,
  IGenerateLandParcelDocumentResponse,
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
    getAllLandParcels: build.query<ILandParcelsListResponse, IGetAllLandParcelsParams>({
      query: (params) => ({
        url: '/object/land-parcels/',
        method: 'GET',
        params
      }),
      providesTags: ['LandParcel']
    }),

    getLandParcelById: build.query<ILandParcel, IGetLandParcelByIdParams>({
      query: ({ id }) => ({
        url: `/object/land-parcels/${id}`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }]
    }),

    // ✅ ОБНОВЛЕНО: поддержка файлов
    createLandParcel: build.mutation<ILandParcel, ICreateLandParcelParams>({
      query: (body) => {
        // Если есть файл, используем FormData
        if (body.file && body.file instanceof File) {
          const formData = new FormData();

          Object.entries(body).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          });

          return {
            url: '/object/land-parcels/create',
            method: 'POST',
            body: formData,
            formData: true
          };
        }

        // Иначе обычный JSON
        return {
          url: '/object/land-parcels/create',
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['LandParcel']
    }),

    updateLandParcel: build.mutation<ILandParcel, IUpdateLandParcelParams>({
      query: ({ id, body }) => ({
        url: `/object/land-parcels/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }, 'LandParcel']
    }),

    // ✅ ОБНОВЛЕНО: поддержка файлов
    patchLandParcel: build.mutation<ILandParcel, IUpdateLandParcelParams>({
      query: ({ id, body }) => {
        const anyBody = body as unknown as Record<string, unknown>;

        // Если есть файл, используем FormData
        if (anyBody && anyBody.file instanceof File) {
          const formData = new FormData();

          Object.entries(anyBody).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value instanceof File) {
              formData.append(key, value);
            } else {
              formData.append(key, String(value));
            }
          });

          return {
            url: `/object/land-parcels/${id}`,
            method: 'PATCH',
            body: formData,
            formData: true
          };
        }

        // Иначе обычный JSON
        return {
          url: `/object/land-parcels/${id}`,
          method: 'PATCH',
          body
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }, 'LandParcel']
    }),

    deleteLandParcel: build.mutation<void, IDeleteLandParcelParams>({
      query: ({ id }) => ({
        url: `/object/land-parcels/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['LandParcel']
    }),

    generateLandParcelDocument: build.mutation<IGenerateLandParcelDocumentResponse, IGenerateLandParcelDocumentParams>({
      query: ({ id }) => ({
        url: `/object/land-parcels/${id}/generate-document/`,
        method: 'POST'
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'LandParcel', id }, 'LandParcel']
    })
  })
});

export const {
  useGetAllLandParcelsQuery,
  useGetLandParcelByIdQuery,
  useCreateLandParcelMutation,
  useUpdateLandParcelMutation,
  usePatchLandParcelMutation,
  useDeleteLandParcelMutation,
  useGenerateLandParcelDocumentMutation
} = landParcelApi;
