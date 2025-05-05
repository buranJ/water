import { lazy } from 'react';
import { RouteObject } from 'react-router';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));

export const routerConfig: RouteObject[] = [
  {
    path: '/auth',
    element: <Login />
  },
  {
    path: '/dashboard/geo',
    element: <Geoportal title='Геопортал' />
  }
];
