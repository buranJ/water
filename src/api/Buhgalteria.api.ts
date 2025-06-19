import { createApi } from '@reduxjs/toolkit/query/react';
import { getBaseQuery } from 'common/helpers';

export const buhgalteriaApi = createApi({
  reducerPath: 'buhgalteriaApi',
  baseQuery: getBaseQuery(),
  endpoints: (build) => ({
    postProtocol: build.mutation({
      query: ({ protocol_id }) => ({
        url: '/buhgalteria/invoices/generate/' + protocol_id,
        method: 'POST'
      })
    })
  })
});

export const { usePostProtocolMutation } = buhgalteriaApi;
