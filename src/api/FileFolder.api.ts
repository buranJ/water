import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

interface FileItem {
  id: number;
  folder: number;
  file: string;
  uploaded_at: string;
}

type FileListResponse = FileItem[];

interface CreateFolderBody {
  title: string;
  description: string;
  category: number;
}

interface CreateFolderResponse {
  id: number;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
  category: number;
}

export const filefolderApi = createApi({
  reducerPath: 'filefolderApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getFilefolderFiles: build.query<FileListResponse, number>({
      query: (folderId) => ({
        url: `/api/v1/filefolder/${folderId}/files/`,
        method: 'GET'
      })
    }),

    createFilefolder: build.mutation<CreateFolderResponse, CreateFolderBody>({
      query: (body) => ({
        url: '/api/v1/filefolder/create/',
        method: 'POST',
        body
      })
    }),

    uploadFile: build.mutation({
      query: (body) => ({
        url: '/api/v1/filefolder/files/upload/',
        method: 'POST',
        body
      })
    })
  })
});

export const { useGetFilefolderFilesQuery, useCreateFilefolderMutation, useUploadFileMutation } = filefolderApi;
