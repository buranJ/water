import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, message, Modal, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { Table } from 'common/ui';
import { Pagination } from 'common/ui';
import { DashboardLayout } from 'components';
import { ILandParcel } from 'types/requests';
import { getColumns } from './LandParcelsPage.helpers';
import './styles.scss';

import { useDeleteLandParcelMutation, useGetAllLandParcelsQuery } from 'api/LandParcel.api';

type ColumnFilters = {
  title?: string;
  kadastr_number?: string;
  customer_name?: string;
  address?: string;
};

// ✅ ДОБАВИЛИ interface
interface LandParcelsPageProps {
  title?: string;
}

// ✅ ИЗМЕНИЛИ сигнатуру компонента
export const LandParcelsPage: FC<LandParcelsPageProps> = ({ title }) => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination from URL
  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 10;

  // Filters from URL
  const search = searchParams.get('search') || undefined;
  const titleParam = searchParams.get('title') || undefined;
  const kadastrParam = searchParams.get('kadastr_number') || undefined;
  const customerNameParam = searchParams.get('customer_name') || undefined;
  const addressParam = searchParams.get('address') || undefined;

  // API Query
  const { data, isLoading } = useGetAllLandParcelsQuery({
    page,
    page_size: pageSize,
    search,
    kadastr_number: kadastrParam
  });

  const [deleteLandParcel] = useDeleteLandParcelMutation();

  // Column filters state
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    title: titleParam || '',
    kadastr_number: kadastrParam || '',
    customer_name: customerNameParam || '',
    address: addressParam || ''
  });

  // Filtered data (client-side fallback)
  const [tableData, setTableData] = useState<ILandParcel[]>([]);

  // Sync filters with URL
  useEffect(() => {
    setColumnFilters({
      title: titleParam || '',
      kadastr_number: kadastrParam || '',
      customer_name: customerNameParam || '',
      address: addressParam || ''
    });
  }, [titleParam, kadastrParam, customerNameParam, addressParam]);

  // Client-side filtering
  useEffect(() => {
    if (data?.results) {
      let filtered = data.results;

      if (titleParam && titleParam.trim()) {
        const term = titleParam.toLowerCase();
        filtered = filtered.filter((d) => (d.title || '').toLowerCase().includes(term));
      }

      if (kadastrParam && kadastrParam.trim()) {
        const term = kadastrParam.toLowerCase();
        filtered = filtered.filter((d) => (d.kadastr_number || '').toLowerCase().includes(term));
      }

      if (customerNameParam && customerNameParam.trim()) {
        const term = customerNameParam.toLowerCase();
        filtered = filtered.filter((d) => (d.customer_name || '').toLowerCase().includes(term));
      }

      if (addressParam && addressParam.trim()) {
        const term = addressParam.toLowerCase();
        filtered = filtered.filter((d) => (d.address || '').toLowerCase().includes(term));
      }

      setTableData(filtered);
    }
  }, [data, titleParam, kadastrParam, customerNameParam, addressParam]);

  // Debounced filter change
  const filterDebounceRef = useRef<number | undefined>(undefined);
  const handleColumnFilterChange = (field: keyof ColumnFilters, value: string) => {
    setColumnFilters((prev) => ({ ...prev, [field]: value }));

    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }

    filterDebounceRef.current = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const setOrDelete = (key: string, val: string) => {
        if (!val || val.trim() === '') next.delete(key);
        else next.set(key, val);
      };

      setOrDelete('title', field === 'title' ? value : columnFilters.title || '');
      setOrDelete('kadastr_number', field === 'kadastr_number' ? value : columnFilters.kadastr_number || '');
      setOrDelete('customer_name', field === 'customer_name' ? value : columnFilters.customer_name || '');
      setOrDelete('address', field === 'address' ? value : columnFilters.address || '');

      next.set('page', '1');
      setSearchParams(next, { replace: false });
    }, 400);
  };

  // Handle actions
  const handleDelete = async (record: ILandParcel) => {
    Modal.confirm({
      title: 'Удалить земельный участок?',
      content: `Вы уверены, что хотите удалить участок "${record.title || `#${record.id}`}"?`,
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await deleteLandParcel({ id: record.id }).unwrap();
          message.success('Участок удалён');
        } catch (error) {
          console.error('Delete error:', error);
          message.error('Ошибка при удалении');
        }
      }
    });
  };

  const columns = useMemo(
    () =>
      getColumns({
        onClick: (record, action) => {
          switch (action) {
            case 'edit':
              navigate(`/dashboard/land-parcels/${record.id}/edit`);
              break;
            case 'delete':
              handleDelete(record);
              break;
            case 'view':
              navigate(`/dashboard/land-parcels/${record.id}`);
              break;
          }
        },
        filters: columnFilters,
        onFilterChange: handleColumnFilterChange
      }),
    [navigate, columnFilters]
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    next.set('page_size', String(newPageSize ?? pageSize));
    setSearchParams(next, { replace: false });
  };

  return (
    <DashboardLayout title={title || 'Земельные участки'}>
      <div className='land-parcels-page'>
        {/* Toolbar */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Button type='primary' icon={<PlusOutlined />} onClick={() => navigate('/dashboard/land-parcels/add')}>
              Добавить участок
            </Button>
          </Space>
        </div>

        {/* Table */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table resizable pagination={false} loading={isLoading} columns={columns} dataSource={tableData} rowKey='id' bordered />
        </div>

        {/* Pagination */}
        <Pagination showSizeChanger total={data?.count || 0} current={page} pageSize={pageSize} onChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
};

// ✅ Default export
export default LandParcelsPage;
