import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';
import { IGetProtocolParams, IGetProtocolResponse } from 'types/requests';

export const buhgalteriaApi = createApi({
  reducerPath: 'buhgalteriaApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    postProtocol: build.mutation({
      query: ({ protocol_id }) => ({
        url: '/buhgalteria/invoices/generate/' + protocol_id,
        method: 'POST'
      })
    }),
    getProtocols: build.query<IGetProtocolResponse, IGetProtocolParams>({
      query: (params) => ({
        url: '/buhgalteria/protocols',
        method: 'GET',
        params
      })
    })
  })
});

export const { usePostProtocolMutation, useGetProtocolsQuery } = buhgalteriaApi;
