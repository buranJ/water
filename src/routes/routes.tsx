import { lazy } from 'react';
import { RouteObject } from 'react-router';
import { DashboardLayout } from 'components/DashboardLayout';

const LandParcelsPage = lazy(() => import('pages/LandParcelsPage'));
const AddLandParcelForm = lazy(() => import('pages/AddLandParcelForm'));
const LandParcelDetails = lazy(() => import('pages/LandParcelDetails'));

const Login = lazy(() => import('features/auth/pages'));
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
const FolderDetail = lazy(() => import('pages/FolderDetail'));
const ProtocolDetail = lazy(() => import('pages/ProtocolDetail'));
const AddCustomer = lazy(() => import('pages/AddCustomer'));
const NotFound = lazy(() => import('pages/NotFound'));
const Profile = lazy(() => import('pages/Profile'));
const ChangeHistory = lazy(() => import('pages/ChangeHistory'));
const ChangeCustomerHistory = lazy(() => import('pages/ChangeCustomerHistory'));
const Notifications = lazy(() => import('pages/Notification'));
const TyImport = lazy(() => import('pages/TyImport'));
const Invoices = lazy(() => import('pages/Invoices'));
const Protocols = lazy(() => import('pages/Protocols'));
const ProtocolsExport = lazy(() => import('pages/ProtocolsExport'));

export const routerConfig: RouteObject[] = [
  {
    path: '/',
    element: <Login />,
    index: true
  },

  // ✅ ЗЕМЕЛЬНЫЕ УЧАСТКИ - ПРАВИЛЬНЫЙ ПОРЯДОК!
  {
    path: '/dashboard/land-parcels',
    element: <LandParcelsPage title='Земельные участки' />
  },
  {
    // ✅ ДОБАВЛЕНИЕ - ДОЛЖНО БЫТЬ ПЕРЕД :id
    path: '/dashboard/land-parcels/add',
    element: <AddLandParcelForm title='Добавить земельный участок' />
  },
  {
    // ✅ РЕДАКТИРОВАНИЕ - ДОЛЖНО БЫТЬ ПЕРЕД :id (без /edit)
    path: '/dashboard/land-parcels/:id/edit',
    element: <AddLandParcelForm title='Редактировать земельный участок' />
  },
  {
    // ✅ ДЕТАЛЬНАЯ СТРАНИЦА - ПОСЛЕ всех конкретных роутов
    path: '/dashboard/land-parcels/:id',
    element: <LandParcelDetails title='Детали участка' />
  },

  {
    path: '/dashboard/technical-conditions',
    element: <TechnicalConditions />
  },
  {
    path: '/dashboard/technical-conditions/tu-details/:id',
    element: <TuDetails title='routers.tuNumberPrefix' />
  },
  {
    path: '/dashboard/technical-conditions/history-of-loads/:id',
    element: <HistoryOfLoads title='routers.historyOfLoads' />
  },
  {
    path: '/dashboard/archive',
    element: (
      <DashboardLayout title='dashboard.pages.archive'>
        <TyImport />
      </DashboardLayout>
    )
  },
  {
    path: '/dashboard/add-tu-forms/:tyId',
    element: <AddTuForms title='routers.addTu' />
  },
  {
    path: '/dashboard/add-tu-forms',
    element: <AddTuForms title='routers.addTu' />
  },
  {
    path: '/dashboard/export-data',
    element: <ExportData title='routers.exportData' />
  },
  {
    path: '/dashboard/export-data/history',
    element: <ExportDataHistory title='routers.historyExportData' />
  },
  {
    path: '/dashboard/customers',
    element: <Customers title='dashboard.pages.customers' />
  },
  {
    path: '/dashboard/customers/:customerId',
    element: <CustomerDetails title='routers.customerDetails' />
  },
  {
    path: '/dashboard/customers/:customerId/edit',
    element: <EditCustomer title='routers.editRequister' />
  },
  {
    path: '/dashboard/customers/:customerId/change-history',
    element: <ChangeCustomerHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/add-customer',
    element: <AddCustomer title='routers.addCustomer' />
  },
  {
    path: '/dashboard/architecture',
    element: <Architecture title='dashboard.pages.architecture' />
  },
  {
    path: '/dashboard/architecture/details/:id',
    element: <ArchitectureDetails title='routers.document' />
  },
  {
    path: '/dashboard/folder-detail/:folderId/:tyId',
    element: <FolderDetail title='routers.protocol' />
  },
  {
    path: '/dashboard/protocol-details/:id',
    element: <ProtocolDetail title='routers.protocol' />
  },
  {
    path: '/dashboard/Profile',
    element: <Profile title='routers.profile' />
  },
  {
    path: '/dashboard/ty/:tyId/change-history',
    element: <ChangeHistory title='routers.changeHistory' />
  },
  {
    path: '/dashboard/notifications',
    element: <Notifications title='routers.notifications' />
  },
  {
    path: '/dashboard/protocols',
    element: <Protocols title='routers.protocols' />
  },
  {
    path: '/dashboard/invoices',
    element: <Invoices title='routers.invoices' />
  },
  {
    path: '/dashboard/protocols/export',
    element: <ProtocolsExport />
  },
  {
    path: '*',
    element: <NotFound />
  }
];
