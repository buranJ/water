import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type {
  IActTyResponse,
  IAddLoadParams,
  ICreateActTyParams,
  ICreateBalanceAcceptanceParams,
  ICreateBalanceAcceptanceResponse,
  ICreateTechnicalConditionParams,
  ICreateTechnicalConditionRequest,
  IDeleteBalanceAcceptanceParams,
  IDeleteTechnicalConditionParams,
  IDeleteTechnicalConditionResponse,
  IDownloadTyPdfParams,
  IDownloadTyPdfResponse,
  IForkMinimalParams,
  IForkMinimalResponse,
  IGenerateActTyParams,
  IGenerateActTyResponse,
  IGenerateDopTyParams,
  IGenerateDopTyResponse,
  IGetAllTechnicalConditionParams,
  IGetAllTechnicalConditionResponse,
  IGetBalanceAcceptanceParams,
  IGetBalanceAcceptanceResponse,
  IGetDopTyParams,
  IGetDopTyResponse,
  IGetLoadIncreasesParams,
  IGetLoadIncreasesResponse,
  IGetTechnicalConditionByIdParams,
  IGetTechnicalConditionByIdResponse,
  IGetTyHistoryParams,
  IGetTyHistoryResponse,
  IITypesTYParams,
  ILoadIncreaseDocxParams,
  ILoadIncreaseDocxResponse,
  IPatchActTyParams,
  IPatchBalanceAcceptanceParams,
  IPatchBalanceAcceptanceResponse,
  IPatchTechnicalConditionParams,
  IPatchTechnicalConditionResponse,
  IProtocolDocxParams,
  IProtocolDocxResponse,
  IPutBalanceAcceptanceParams,
  IPutBalanceAcceptanceResponse,
  IReportParams,
  IReportResponse,
  ITypesTYResponse,
  IUpdateTechnicalConditionParams,
  IUpdateTechnicalConditionResponse
} from 'types/requests';

export interface IUploadDopTyParams {
  ty_id: string;
  file: File;
}

export const tyApi = createApi({
  reducerPath: 'tyApi',
  baseQuery: getBaseQuery(),
  tagTypes: ['Ty', 'TyLoads', 'DopTy'],
  endpoints: (build) => ({
    getAllTy: build.query<IGetAllTechnicalConditionResponse, IGetAllTechnicalConditionParams>({
      query: (params) => ({
        url: '/ty/',
        method: 'GET',
        params
      }),
      providesTags: ['Ty']
    }),

    createTy: build.mutation<ICreateTechnicalConditionRequest, ICreateTechnicalConditionParams>({
      query: (body) => ({
        url: '/ty/',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Ty']
    }),

    getTyById: build.query<IGetTechnicalConditionByIdResponse, IGetTechnicalConditionByIdParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'Ty', id: tyId }]
    }),

    getTyByNumber: build.query<IGetAllTechnicalConditionResponse, { tuNumber: string }>({
      query: ({ tuNumber }) => ({
        url: `/ty/`,
        method: 'GET',
        params: { search: tuNumber }
      })
    }),

    updateTy: build.mutation<IUpdateTechnicalConditionResponse, IUpdateTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PUT',
        body
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Ty', id }]
    }),

    patchTy: build.mutation<IPatchTechnicalConditionResponse, IPatchTechnicalConditionParams>({
      query: ({ id, body }) => ({
        url: `/ty/${id}/`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['Ty']
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

    forkMinimal: build.mutation<IForkMinimalResponse, IForkMinimalParams>({
      query: ({ id, water_required, pressure_required, sewage_amount, comment, files, ...rest }) => {
        if (files && files.length) {
          const formData = new FormData();
          formData.append('water_required', String(water_required));
          formData.append('pressure_required', String(pressure_required));
          formData.append('sewage_amount', String(sewage_amount));
          if (comment) formData.append('comment', comment);

          Object.entries(rest).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            formData.append(key, typeof value === 'number' || typeof value === 'boolean' ? String(value) : (value as string));
          });

          files.forEach((file) => formData.append('files', file));
          return {
            url: `/ty/technical-conditions/${id}/fork_minimal/`,
            method: 'POST',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/technical-conditions/${id}/fork_minimal/`,
          method: 'POST',
          body: {
            water_required,
            pressure_required,
            sewage_amount,
            ...(comment ? { comment } : {}),
            ...rest
          }
        };
      },
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Ty', id },
        { type: 'TyLoads', id }
      ]
    }),

    getLoadIncreases: build.query<IGetLoadIncreasesResponse, IGetLoadIncreasesParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/load-increases/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { tyId }) => [{ type: 'TyLoads', id: tyId }]
    }),

    downloadTyPdf: build.query<IDownloadTyPdfResponse, IDownloadTyPdfParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/protocol-pdf/`,
        method: 'GET',
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }

          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }

          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),

    downloadLoadIncreaseDocx: build.query<ILoadIncreaseDocxResponse, ILoadIncreaseDocxParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/load-increase-docx/`,
        method: 'GET',
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }
          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }
          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),

    getBalanceAcceptance: build.query<IGetBalanceAcceptanceResponse, IGetBalanceAcceptanceParams>({
      query: ({ ty_id }) => ({
        url: `/ty/${ty_id}/balance_acceptance/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }]
    }),

    createBalanceAcceptance: build.mutation<ICreateBalanceAcceptanceResponse, ICreateBalanceAcceptanceParams>({
      query: ({ body }) => {
        const anyBody = body as unknown as Record<string, unknown>;
        if (anyBody && anyBody.file instanceof File) {
          const formData = new FormData();
          Object.entries(anyBody).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value instanceof File) formData.append(key, value);
            else formData.append(key, typeof value === 'string' ? value : String(value));
          });
          return {
            url: `/ty/balance_acceptance/`,
            method: 'POST',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/balance_acceptance/`,
          method: 'POST',
          body
        };
      },
      invalidatesTags: (_result, _error, { body }) => [{ type: 'Ty', id: String(body.ty) }, 'Ty']
    }),

    putBalanceAcceptance: build.mutation<IPutBalanceAcceptanceResponse, IPutBalanceAcceptanceParams>({
      query: ({ ty_id, body }) => {
        const anyBody = body as unknown as Record<string, unknown>;
        if (anyBody && anyBody.file instanceof File) {
          const formData = new FormData();
          Object.entries(anyBody).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value instanceof File) formData.append(key, value);
            else formData.append(key, typeof value === 'string' ? value : String(value));
          });
          return {
            url: `/ty/${ty_id}/balance_acceptance/`,
            method: 'PUT',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/${ty_id}/balance_acceptance/`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }, 'Ty']
    }),

    patchBalanceAcceptance: build.mutation<IPatchBalanceAcceptanceResponse, IPatchBalanceAcceptanceParams>({
      query: ({ ty_id, body }) => {
        const anyBody = body as unknown as Record<string, unknown>;
        if (anyBody && anyBody.file instanceof File) {
          const formData = new FormData();
          Object.entries(anyBody).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (value instanceof File) formData.append(key, value);
            else formData.append(key, typeof value === 'string' ? value : String(value));
          });
          return {
            url: `/ty/${ty_id}/balance_acceptance/`,
            method: 'PATCH',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/${ty_id}/balance_acceptance/`,
          method: 'PATCH',
          body
        };
      },
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }, 'Ty']
    }),

    deleteBalanceAcceptance: build.mutation<void, IDeleteBalanceAcceptanceParams>({
      query: ({ ty_id }) => ({
        url: `/ty/${ty_id}/balance_acceptance/`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }, 'Ty']
    }),

    downloadProtocolDocx: build.query<IProtocolDocxResponse, IProtocolDocxParams>({
      query: ({ tyId }) => ({
        url: `/ty/${tyId}/protocol-docx/`,
        method: 'GET',
        headers: {
          Accept: '*/*'
        },
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename: string | null = null;

          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }

          if (!filename) {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : null;
          }

          return { blob, filename };
        }
      }),
      keepUnusedDataFor: 0
    }),

    getActTyById: build.query<IActTyResponse, { id: string | number }>({
      query: ({ id }) => ({
        url: `/ty/act_ty/${id}`,
        method: 'GET'
      })
    }),

    createActTy: build.mutation<IActTyResponse, ICreateActTyParams>({
      query: (body) => {
        if (body.file && body.file instanceof File) {
          const formData = new FormData();
          formData.append('ty', String(body.ty));
          if (body.status) formData.append('status', body.status);
          formData.append('file', body.file);
          return {
            url: `/ty/act_ty/`,
            method: 'POST',
            body: formData,
            formData: true
          };
        }
        return {
          url: `/ty/act_ty/`,
          method: 'POST',
          body: {
            ty: typeof body.ty === 'string' ? Number(body.ty) : body.ty,
            ...(body.status ? { status: body.status } : {}),
            ...(body.file ? { file: body.file } : {})
          }
        };
      },
      invalidatesTags: (_result, _error, body) => [{ type: 'Ty', id: String(body.ty) }, 'Ty']
    }),

    updateActTy: build.mutation<
      IActTyResponse,
      { id: number | string; file: File; status?: import('types/common').IActEnum; ty?: number | string }
    >({
      query: ({ id, file, status, ty }) => {
        const formData = new FormData();
        if (status) formData.append('status', status);
        if (ty !== undefined) formData.append('ty', String(ty));
        formData.append('file', file);
        return {
          url: `/ty/act_ty/${id}`,
          method: 'PUT',
          body: formData,
          formData: true
        };
      },
      invalidatesTags: (result) => (result ? [{ type: 'Ty', id: String(result.ty) }, 'Ty'] : ['Ty'])
    }),

    patchActTy: build.mutation<IActTyResponse, IPatchActTyParams>({
      query: ({ id, body }) => ({
        url: `/ty/act_ty/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: (result) => (result ? [{ type: 'Ty', id: String(result.ty) }, 'Ty'] : ['Ty'])
    }),

    generateActTy: build.mutation<IGenerateActTyResponse, IGenerateActTyParams>({
      query: ({ ty_id, type }) => ({
        url: `/ty/${ty_id}/act_ty/generate/?type=${type}`,
        method: 'POST'
      }),
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'Ty', id: ty_id }]
    }),

    getDopTy: build.query<IGetDopTyResponse, IGetDopTyParams>({
      query: ({ ty_id }) => ({
        url: `/ty/${ty_id}/dop_ty/`,
        method: 'GET'
      }),
      providesTags: (_result, _error, { ty_id }) => [{ type: 'DopTy', id: ty_id }]
    }),

    generateDopTy: build.mutation<IGenerateDopTyResponse, IGenerateDopTyParams>({
      query: ({ ty_id }) => ({
        url: `/ty/${ty_id}/dop_ty/generate/`,
        method: 'POST'
      }),
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'DopTy', id: ty_id }]
    }),

    uploadDopTy: build.mutation<IGetDopTyResponse, IUploadDopTyParams>({
      query: ({ ty_id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `/ty/${ty_id}/dop_ty/`,
          method: 'PUT',
          body: formData,
          formData: true
        };
      },
      invalidatesTags: (_result, _error, { ty_id }) => [{ type: 'DopTy', id: ty_id }]
    }),

    // ✅✅✅ НОВЫЕ ENDPOINTS ДЛЯ ОТЧЁТА
    // ✅✅✅ ИСПРАВЛЕННЫЕ ENDPOINTS ДЛЯ ОТЧЁТА
    getReport: build.query<IReportResponse, IReportParams>({
      query: (params) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { export: _export, ...queryParams } = params;
        return {
          url: '/ty/report/',
          method: 'GET',
          params: queryParams
        };
      }
    }),

    downloadReport: build.mutation<{ blob: Blob; filename: string }, IReportParams>({
      query: (params) => ({
        url: '/ty/report/',
        method: 'GET',
        params, // Здесь включаем export параметр
        responseHandler: async (response) => {
          const blob = await response.blob();
          const disposition = response.headers.get('content-disposition') || '';
          let filename = 'report.xlsx';

          const starMatch = /filename\*\s*=\s*[^']+'[^']*'([^;]+)/i.exec(disposition);
          if (starMatch) {
            try {
              filename = decodeURIComponent(starMatch[1]);
            } catch {
              filename = starMatch[1];
            }
          }
          if (!filename || filename === 'report.xlsx') {
            const match = /filename="?([^";]+)"?/i.exec(disposition);
            filename = match ? match[1] : 'report.xlsx';
          }
          return { blob, filename };
        }
      })
    })
  })
});

export const {
  useGetAllTyQuery,
  useCreateTyMutation,
  useGetTyByIdQuery,
  useLazyGetTyByNumberQuery,
  useUpdateTyMutation,
  usePatchTyMutation,
  useDeleteTyMutation,
  useGetTypesTyQuery,
  useGetHistoryTyQuery,
  useCreateTyFromApplicationMutation,
  useGenerateActTyMutation,
  useAddLoadMutation,
  useForkMinimalMutation,
  useGetLoadIncreasesQuery,
  useLazyDownloadTyPdfQuery,
  useLazyDownloadProtocolDocxQuery,
  useLazyDownloadLoadIncreaseDocxQuery,
  useGetDopTyQuery,
  useGenerateDopTyMutation,
  useGetBalanceAcceptanceQuery,
  useCreateBalanceAcceptanceMutation,
  usePutBalanceAcceptanceMutation,
  usePatchBalanceAcceptanceMutation,
  useDeleteBalanceAcceptanceMutation,
  useCreateActTyMutation,
  useUpdateActTyMutation,
  usePatchActTyMutation,
  useUploadDopTyMutation,
  useLazyGetActTyByIdQuery,
  useGetReportQuery,
  useDownloadReportMutation
} = tyApi;
