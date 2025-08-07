import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { ApplicationData, getColumns, useRejectModal } from './Applications.helpers';

import { useGetApplicationsQuery } from 'api/Application.api';

type FilterValues = {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
};

interface IProps {
  title: string;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Все' },
  { value: 'pending', label: 'В ожидании' },
  { value: 'rejected', label: 'Отказано' },
  { value: 'approved', label: 'Одобрено' },
  { value: 'contracted', label: 'ТУ заключён' }
];

export const Applications: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { openRejectModal, RejectModalComponent } = useRejectModal();

  // Фильтры
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);

  // Debounce для поиска
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Обработка фильтрации из FilterBar
  const handleFilterChange = useCallback((filter: FilterValues) => {
    setSearch(filter.search || '');
    setStatus(filter.status || '');
    setPage(1); // сбрасываем на первую страницу при фильтрации
  }, []);

  // Получение данных с бэка
  const { data, isLoading } = useGetApplicationsQuery(
    {
      search: debouncedSearch || undefined,
      status: (status || undefined) as 'pending' | 'rejected' | 'approved' | 'contracted' | undefined,
      page,
      page_size: pageSize
    },
    { refetchOnMountOrArgChange: true }
  );

  // Преобразование данных к формату таблицы (если нужно)
  const tableData: ApplicationData[] = useMemo(() => {
    return (data?.results || []).map((item) => ({
      key: String(item.id),
      id: String(item.id),
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      customer: String(item.customer), // временно используем id как строку, если нет имени
      customerId: item.customer,
      address: item.address,
      objectName: item.object,
      waterAmount: item.waterRequired,
      wastewaterAmount: item.firefightingExpenses,
      status: item.status as 'approved' | 'rejected' | 'pending',
      rejectReason: undefined,
      comment: undefined,
      hasTu: item.status === 'contracted'
    }));
  }, [data, page, pageSize]);

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'create':
            console.log('Delete action clicked for record:', record);
            break;
          case 'reject':
            console.log('Customer details action clicked for record:', record);
            break;
          case 'approve':
            console.log('Registration date action clicked for record:', record);
            break;
        }
      },
      onReject: (record) => {
        openRejectModal(record);
      }
    });
  }, [openRejectModal]);

  const onAddClick = () => {
    navigate('create');
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  return (
    <DashboardLayout title={title}>
      <FilterBar
        onFilterChange={handleFilterChange}
        showStatusSelect
        statusOptions={STATUS_OPTIONS}
        actionButtons={
          <>
            <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
              Добавить
            </Button>
          </>
        }
      />
      <Table pagination={false} columns={columns} dataSource={tableData} bordered scroll={{ x: 'max-content' }} loading={isLoading} />
      <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
      <RejectModalComponent />
    </DashboardLayout>
  );
};
