import { lazy } from 'react';
import { RouteObject } from 'react-router';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));
const TechnicalConditions = lazy(() => import('features/technical-conditions'));
const AddTuForms = lazy(() => import('pages/AddTuForms'));
const ExportData = lazy(() => import('pages/ExportData'));
const ExportDataHistory = lazy(() => import('pages/ExportDataHistory'));
const Customers = lazy(() => import('pages/Customers'));
const TuDetails = lazy(() => import('pages/TuDetails'));
const HistoryOfLoads = lazy(() => import('pages/HistoryOfLoads'));
const Architecture = lazy(() => import('pages/Architecture'));
const ArchitectureDetails = lazy(() => import('pages/ArchitectureDetails'));
const Protocol = lazy(() => import('pages/Protocol'));
const ProtocolDetail = lazy(() => import('pages/ProtocolDetail'));

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
    path: '/dashboard/technical-conditions/tu-details/:id',
    element: <TuDetails title='ТУ №' />
  },
  {
    path: '/dashboard/technical-conditions/history-of-loads',
    element: <HistoryOfLoads title='История увеличения нагрузок' />
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
  },
  {
    path: '/dashboard/architecture',
    element: <Architecture title='Архитектура' />
  },
  {
    path: '/dashboard/architecture/details/:id',
    element: <ArchitectureDetails title='Документ №' />
  },
  {
    path: '/dashboard/protocol',
    element: <Protocol title='Протокол' />
  },
  {
    path: '/dashboard/protocol-details/:id',
    element: <ProtocolDetail title='Протокол' />
  }
];
