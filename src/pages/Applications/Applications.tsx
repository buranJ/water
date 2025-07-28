import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table, Tabs } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { ApplicationData, getColumns, tabItems, useRejectModal } from './Applications.helpers';

import { IApplicationResponse, useGetApplicationsQuery } from 'api/Application.api';

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

const STATUS_TAB_MAP: Record<string, IApplicationResponse['status'] | undefined> = {
  all: undefined,
  accepted: 'approved',
  pending: 'pending',
  rejected: 'rejected',
  contracted: 'contracted'
};

export const Applications: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { openRejectModal, RejectModalComponent } = useRejectModal();

  // Фильтры
  const [search, setSearch] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [status, setStatus] = useState<string>('all');

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
    // Можно добавить обработку других фильтров, если потребуется
  }, []);

  // Обработка смены таба (статуса)
  const handleTabChange = useCallback((key: string) => {
    setStatus(key);
  }, []);

  // Получение данных с бэка
  const { data = [], isLoading } = useGetApplicationsQuery(
    {
      search: debouncedSearch || undefined,
      status: STATUS_TAB_MAP[status]
    },
    { refetchOnMountOrArgChange: true }
  );

  // Преобразование данных к формату таблицы (если нужно)
  const tableData: ApplicationData[] = useMemo(() => {
    return data.map((item) => ({
      key: String(item.id),
      id: String(item.id),
      date: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      customer: String(item.customer),
      address: item.address,
      objectName: item.object,
      waterAmount: item.waterRequired,
      wastewaterAmount: item.firefightingExpenses,
      status: item.status as 'approved' | 'rejected' | 'pending',
      rejectReason: undefined,
      comment: undefined,
      hasTu: item.status === 'contracted'
    }));
  }, [data]);

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

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };

  return (
    <DashboardLayout title={title}>
      <FilterBar
        showAlphabet
        onFilterChange={handleFilterChange}
        actionButtons={
          <>
            <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
              Добавить
            </Button>
            <Button icon={<DownloadOutlined />} iconPosition='end' onClick={onDownloadClick}>
              PDF
            </Button>
          </>
        }
      />
      <Tabs items={tabItems} onChange={handleTabChange} />
      <Table bordered columns={columns} dataSource={tableData} scroll={{ x: 'max-content' }} pagination={false} loading={isLoading} />
      <RejectModalComponent />
    </DashboardLayout>
  );
};
