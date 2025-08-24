import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import type { INotificationsListResponse } from 'types/entities';

export interface IGetNotificationsParams {
  page?: number;
  page_size?: number;
}

export const notificationsApi = createApi({
  reducerPath: 'notificationsApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    getNotifications: build.query<INotificationsListResponse, IGetNotificationsParams | void>({
      query: (params) => {
        const args: { url: string; method: 'GET'; params?: IGetNotificationsParams } = {
          url: 'notifications/',
          method: 'GET'
        };
        if (params) args.params = params;
        return args;
      }
    })
  })
});

export const { useGetNotificationsQuery } = notificationsApi;
