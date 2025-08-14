import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table } from 'antd';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { ITechnicalCondition } from 'types/entities';
import { IGetAllTechnicalConditionParams } from 'types/requests';
import { getColumns } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { useGetAllTyQuery } from 'api/Ty.api';
import { t } from 'i18next';

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  type?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<IGetAllTechnicalConditionParams>({
    page: 1,
    page_size: 8,
    ordering: 'created_at'
  });

  const { data: tuData, isLoading } = useGetAllTyQuery(filters, {
    refetchOnMountOrArgChange: true
  });

  const [tableData, setTableData] = useState<ITechnicalCondition[]>([]);

  useEffect(() => {
    if (tuData && Array.isArray(tuData.results)) {
      setTableData(tuData.results);
    }
  }, [tuData]);

  const handleFilterChange = (values: TUFilterValues) => {
    const { date, payment_ordering, ordering: filterOrdering, ...rest } = values;
    const ordering = [date, payment_ordering, filterOrdering].filter(Boolean).join(', ');
    setFilters((prev) => ({
      ...prev,
      ...rest,
      ordering,
      page: 1
    }));
  };

  const handleAddClick = () => {
    navigate('/dashboard/applications/create');
  };

  const handleDownloadClick = () => {
    console.log('Генерация PDF');
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
              console.log('Delete action clicked for record:', record);
              break;
            case 'view':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
          }
        }
      }),
    [navigate]
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
      page_size: newPageSize ?? prev.page_size
    }));
  };

  return (
    <DashboardLayout title={t('routers.technicalSpecificatio')}>
      <div className='technical-conditions-page'>
        <TUFilterBar onFilterChange={handleFilterChange} onAddClick={handleAddClick} onDownloadClick={handleDownloadClick} />
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
        <Pagination total={tuData?.count || 0} current={filters.page} pageSize={filters.page_size} onChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
};
