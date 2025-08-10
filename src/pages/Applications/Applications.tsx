import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { ApplicationData, getColumns, useRejectModal } from './Applications.helpers';

import { useGetApplicationsQuery } from 'api/Application.api';
import { t } from 'i18next';

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
  { value: '', label: t('applications.tabs.all') },
  { value: 'pending', label: t('applications.statusTag.pending') },
  { value: 'rejected', label: t('applications.statusTag.rejected') },
  { value: 'approved', label: t('applications.statusTag.approved') },
  { value: 'contracted', label: t('applications.statusTag.contracted') }
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
      date: item.created_at ? dayjs(item.created_at).format('DD.MM.YYYY-HH:mm') : '',
      customer: String(item.customer), // временно используем id как строку, если нет имени
      customerId: item.customer,
      address: item.address,
      objectName: item.object,
      waterAmount: item.waterRequired,
      wastewaterAmount: item.firefightingExpenses,
      status: item.status as 'approved' | 'rejected' | 'pending' | 'contracted',
      rejectReason: undefined,
      comment: undefined,
      hasTu: item.status === 'contracted',
      ty_id: item.ty_id
    }));
  }, [data]);

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'create': // переход на создание ТУ
            navigate(`/dashboard/add-tu-forms/${record.ty_id}`);
            break;
          case 'tuDetails': // переход на страницу существующего ТУ
            if (record.ty_id) {
              navigate(`/dashboard/technical-conditions/tu-details/${record.ty_id}`);
            }
            break;
          case 'reject':
            // обработка отказа будет добавлена позже
            break;
          case 'approve':
            // обработка одобрения будет добавлена позже
            break;
        }
      },
      onReject: (record) => {
        openRejectModal(record);
      }
    });
  }, [navigate, openRejectModal]);

  const onAddClick = () => {
    navigate('create');
  };

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPage(page);
    if (pageSize) setPageSize(pageSize);
  };

  return (
    <DashboardLayout title={t(title)}>
      <FilterBar
        onFilterChange={handleFilterChange}
        showStatusSelect
        statusOptions={STATUS_OPTIONS}
        actionButtons={
          <>
            <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
              {t('filterBar.add')}
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
