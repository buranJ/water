import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table } from 'antd';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { ITechnicalCondition } from 'types/entities';
import { IGetAllTechnicalConditionParams } from 'types/requests';
import { getColumns } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { useGetAllTyQuery } from 'api/Ty.api';

interface TUFilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();

  const [filters, setFilters] = useState<IGetAllTechnicalConditionParams>({
    page: 1,
    page_size: 8
  });

  const { data: tuData, isLoading } = useGetAllTyQuery(filters, {
    refetchOnMountOrArgChange: true
  });

  const [tableData, setTableData] = useState<ITechnicalCondition[]>([]);

  useEffect(() => {
    if (tuData?.results) {
      setTableData(tuData.results);
    }
  }, [tuData]);

  const handleFilterChange = (values: TUFilterValues) => {
    setFilters((prev) => ({
      ...prev,
      search: values.search || undefined,
      ordering: values.alphabet || undefined,
      stage: (values.type as IGetAllTechnicalConditionParams['stage']) || undefined,
      status: (values.status as IGetAllTechnicalConditionParams['status']) || undefined,
      page: 1
    }));
  };

  const handleAddClick = () => {
    console.log('Открыть модалку добавления');
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
    <DashboardLayout title='Технические условия'>
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
