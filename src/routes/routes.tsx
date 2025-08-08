import { lazy } from 'react';
import { RouteObject } from 'react-router';

const Login = lazy(() => import('features/auth/pages'));
const Geoportal = lazy(() => import('pages/Geoportal'));
const Objects = lazy(() => import('pages/Objects'));
const ObjectDetail = lazy(() => import('pages/ObjectDetail'));
const TechnicalConditions = lazy(() => import('features/technical-conditions'));
const AddTuForms = lazy(() => import('pages/AddTuForms'));
const ExportData = lazy(() => import('pages/ExportData'));
const ExportDataHistory = lazy(() => import('pages/ExportDataHistory'));
const Customers = lazy(() => import('pages/Customers'));
const CustomerDetails = lazy(() => import('pages/CustomerDetails'));
const EditCustomer = lazy(() => import('pages/EditCustomer'));
const TuDetails = lazy(() => import('pages/TuDetails'));
const HistoryOfLoads = lazy(() => import('pages/HistoryOfLoads'));
const Architecture = lazy(() => import('pages/Architecture'));
const ArchitectureDetails = lazy(() => import('pages/ArchitectureDetails'));
const Protocol = lazy(() => import('pages/Protocol'));
const ProtocolDetail = lazy(() => import('pages/ProtocolDetail'));
const AddCustomer = lazy(() => import('pages/AddCustomer'));
const Applications = lazy(() => import('pages/Applications'));
const NotFound = lazy(() => import('pages/NotFound'));
const ApplicationsCreate = lazy(() => import('pages/ApplicationsCreate'));
const ApplicationDetails = lazy(() => import('pages/ApplicationDetails'));
const EditApplication = lazy(() => import('pages/EditApplication'));
const Profile = lazy(() => import('pages/Profile'));

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
    index: true
  },
  {
    path: '/dashboard/geo',
    element: <Geoportal title='Геопортал' />
  },
  {
    path: '/dashboard/objects',
    element: <Objects title='Объекты' />
  },
  {
    path: '/dashboard/objects/:id',
    element: <ObjectDetail />
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
    path: '/dashboard/customers/:customerId',
    element: <CustomerDetails title='Детали клиента' />
  },
  {
    path: '/dashboard/customers/:customerId/edit',
    element: <EditCustomer title='Редактировать заказчика' />
  },
  {
    path: '/dashboard/add-customer',
    element: <AddCustomer title='Добавление заказчика' />
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
  },
  {
    path: '/dashboard/applications',
    element: <Applications title='Заявки' />
  },
  {
    path: '/dashboard/applications/:id',
    element: <ApplicationDetails title='Заявка №' />
  },
  {
    path: '/dashboard/applications/:id/edit',
    element: <EditApplication title='Редактировать заявку' />
  },
  {
    path: '/dashboard/applications/create',
    element: <ApplicationsCreate title='Оформление заявки' />
  },
  {
    path: '/dashboard/Profile',
    element: <Profile title='Профиль' />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
