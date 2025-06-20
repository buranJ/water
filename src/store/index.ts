import { configureStore } from '@reduxjs/toolkit';
import Slice from './Slice';

import { applicationsApi, authApi, buhgalteriaApi, customerApi, docsApi, filefolderApi, objectApi, refusalApi, tyApi } from 'api/index';

const store = configureStore({
  reducer: {
    Slice: Slice,
    [authApi.reducerPath]: authApi.reducer,
    [buhgalteriaApi.reducerPath]: buhgalteriaApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [docsApi.reducerPath]: docsApi.reducer,
    [filefolderApi.reducerPath]: filefolderApi.reducer,
    [objectApi.reducerPath]: objectApi.reducer,
    [refusalApi.reducerPath]: refusalApi.reducer,
    [tyApi.reducerPath]: tyApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      buhgalteriaApi.middleware,
      customerApi.middleware,
      docsApi.middleware,
      filefolderApi.middleware,
      objectApi.middleware,
      refusalApi.middleware,
      tyApi.middleware,
      applicationsApi.middleware
    )
});

export type RootState = ReturnType<typeof store.getState>;
export type AppStore = typeof store;
export type AppDispatch = AppStore['dispatch'];

export default store;
