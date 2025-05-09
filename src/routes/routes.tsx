import { lazy } from 'react';
import { RouteObject } from 'react-router';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));
const AddTuForms = lazy(() => import('pages/AddTuForms'));

export const routerConfig: RouteObject[] = [
  {
    path: '/auth',
    element: <Login />
  },
  {
    path: '/dashboard/geo',
    element: <Geoportal title='Геопортал' />
  },
  {
    path: '/dashboard/add-tu-forms',
    element: <AddTuForms title='Добавление ТУ' />
  }
];
