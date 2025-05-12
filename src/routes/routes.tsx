import { lazy } from 'react';
import { RouteObject } from 'react-router';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));
const TechnicalConditions = lazy(() => import('features/technical-conditions'));
const AddTuForms = lazy(() => import('pages/AddTuForms'));
const ExportData = lazy(() => import('pages/ExportData'));
const ExportDataHistory = lazy(() => import('pages/ExportDataHistory'));
const Customers = lazy(() => import('pages/Customers'));

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
    path: '/dashboard/technical-conditions',
    element: <TechnicalConditions />
  },
  {
    path: '/dashboard/add-tu-forms',
    element: <AddTuForms title='Добавление ТУ' />
  },
  {
    path: '/dashboard/export-data',
    element: <ExportData title='Экспорт данных' />
  },
  {
    path: '/dashboard/export-data/history',
    element: <ExportDataHistory title='История экспорта данных' />
  },
  {
    path: '/dashboard/customers',
    element: <Customers title='Заказчики' />
  }
];
