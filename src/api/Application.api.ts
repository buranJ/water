import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export interface IApplication {
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  INN: string;
  customer: number;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  attachments: string[];
  entity: number;
}

interface ICreateApplicationResponse extends IApplication {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface IGetApplicationsParams {
  status?: 'pending' | 'rejected' | 'approved' | 'contracted';
  search?: string;
  customer?: number;
  entity?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IApplicationResponse {
  id: number;
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  INN: string;
  customer: number;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  application_files: string[];
  entity: number;
  created_at: string;
  updated_at: string;
  ty_id?: string;
}

export interface IApplicationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IApplicationResponse[];
}

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
  useDeleteApplicationFileMutation
} = applicationsApi;
