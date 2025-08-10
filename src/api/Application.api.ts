import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { IApplicationResponse, IApplicationsListResponse, ICreateApplicationResponse } from 'types/entities';
import type { IApplication, IGetApplicationsParams } from 'types/requests';

export const applicationsApi = createApi({
  reducerPath: 'applicationsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    createApplication: build.mutation<ICreateApplicationResponse, IApplication>({
      query: (data) => ({
        url: 'application/create',
        method: 'POST',
        body: data
      })
    }),
    getApplications: build.query<IApplicationsListResponse, IGetApplicationsParams>({
      query: ({ ordering = 'created_at', ...params }) => ({
        url: 'application/',
        method: 'GET',
        params: { ...params, ordering }
      })
    }),
    getApplicationById: build.query<IApplicationResponse, number | string>({
      query: (id) => ({
        url: `application/${id}`,
        method: 'GET'
      })
    }),
    updateApplication: build.mutation<IApplicationResponse, { id: number; body: Partial<IApplicationResponse> }>({
      query: ({ id, body }) => ({
        url: `application/${id}`,
        method: 'PUT',
        body
      })
    }),
    uploadApplicationFiles: build.mutation<any, { application: number; files: File[] }>({
      query: ({ application, files }) => {
        const formData = new FormData();
        formData.append('application', String(application));
        files.forEach((file) => formData.append('files', file));
        return {
          url: 'application/files/upload/',
          method: 'POST',
          body: formData
        };
      }
    }),
    replaceApplicationFile: build.mutation<any, { id: number; file: File }>({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append('file', file);
        return {
          url: `application-files/${id}/replace/`,
          method: 'PUT',
          body: formData
        };
      }
    }),
    deleteApplicationFile: build.mutation<void, { id: number }>({
      query: ({ id }) => ({
        url: `application-files/${id}/delete/`,
        method: 'DELETE'
      })
    }),
    approveApplication: build.mutation<void, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/approve/`,
        method: 'POST'
      })
    }),
    rejectApplication: build.mutation<void, { applicationId: string }>({
      query: ({ applicationId }) => ({
        url: `application/${applicationId}/reject/`,
        method: 'POST'
      })
    })
  })
});

export const {
  useCreateApplicationMutation,
  useGetApplicationsQuery,
  useGetApplicationByIdQuery,
  useUpdateApplicationMutation,
  useUploadApplicationFilesMutation,
  useReplaceApplicationFileMutation,
  useDeleteApplicationFileMutation,
  useApproveApplicationMutation,
  useRejectApplicationMutation
} = applicationsApi;
