import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Table } from 'common/ui';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { ITechnicalCondition } from 'types/entities';
import { IGetAllTechnicalConditionParams } from 'types/requests';
import { getColumns } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { useGetAllTyQuery, usePatchTyMutation } from 'api/Ty.api';
import { t } from 'i18next';

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 8;

  const s = (key: string) => searchParams.get(key) || undefined;

  const search = s('search');
  const status = (s('status') as IStatus6b3Enum | undefined) || undefined;
  const stage = (s('stage') as IStageEnum | undefined) || undefined;
  const date = s('date');
  const payment_ordering = s('payment_ordering');
  const filterOrdering = s('ordering');
  const hasInvoiceStr = s('has_invoice');
  const overdueStr = s('overdue');
  const dueInDaysStr = s('due_in_days');

  const has_invoice = hasInvoiceStr === 'true' ? true : hasInvoiceStr === 'false' ? false : undefined;
  const overdue = overdueStr === 'true' ? true : overdueStr === 'false' ? false : undefined;
  const due_in_days = dueInDaysStr && !Number.isNaN(Number(dueInDaysStr)) ? Number(dueInDaysStr) : undefined;

  const ordering = [date, payment_ordering, filterOrdering].filter(Boolean).join(', ');

  const queryParams: IGetAllTechnicalConditionParams = {
    page,
    page_size: pageSize,
    search,
    status,
    stage,
    ordering: ordering || '-created_at',
    has_invoice,
    overdue,
    due_in_days
  };

  const { data: tuData, isLoading } = useGetAllTyQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });
  const [patchTy] = usePatchTyMutation();

  const [tableData, setTableData] = useState<ITechnicalCondition[]>([]);

  useEffect(() => {
    if (tuData && Array.isArray(tuData.results)) {
      setTableData(tuData.results);
    }
  }, [tuData]);

  const handleFilterChange = (values: TUFilterValues) => {
    const next = new URLSearchParams(searchParams);
    const { date, payment_ordering, ordering: filterOrd, ...rest } = values;

    const setOrDelete = (key: string, val: unknown) => {
      if (val === undefined || val === null || String(val).trim() === '') next.delete(key);
      else next.set(key, String(val));
    };

    setOrDelete('date', date);
    setOrDelete('payment_ordering', payment_ordering);
    setOrDelete('ordering', filterOrd);

    Object.entries(rest).forEach(([k, v]) => setOrDelete(k, v as unknown));

    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleAddClick = () => {
    navigate('/dashboard/applications/create');
  };

  const handleDownloadClick = () => {
    navigate('/dashboard/export-data');
  };

  const columns = useMemo(
    () =>
      getColumns({
        onClick: (record, action) => {
          switch (action) {
            case 'edit':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
            case 'delete':
              patchTy({ id: record.id, body: { status: 'inactive' } });
              break;
            case 'view':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
          }
        }
      }),
    [navigate, patchTy]
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    next.set('page_size', String(newPageSize ?? pageSize));
    setSearchParams(next, { replace: false });
  };

  return (
    <DashboardLayout title={t('routers.technicalSpecificatio')}>
      <div className='technical-conditions-page'>
        <TUFilterBar
          initialValues={{
            search: search || undefined,
            ordering: filterOrdering,
            payment_ordering,
            status: status,
            stage: stage,
            date,
            has_invoice,
            overdue,
            due_in_days
          }}
          onFilterChange={handleFilterChange}
          onAddClick={handleAddClick}
          onDownloadClick={handleDownloadClick}
        />
        <Table
          tableLayout='fixed'
          pagination={false}
          loading={isLoading}
          columns={columns}
          dataSource={tableData}
          rowKey='id'
          bordered
          scroll={{ x: 'max-content' }}
        />
        <Pagination total={tuData?.count || 0} current={page} pageSize={pageSize} onChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
};
