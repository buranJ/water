import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { message, Modal } from 'antd';
import { Table } from 'common/ui';
import { Pagination } from 'common/ui';
import { DashboardLayout } from 'components';
import { ILandParcel } from 'types/requests';
import { LandParcelsFilterBar } from './LandParcelsFilterBar/';
import { getColumns } from './LandParcelsPage.helpers';
import './styles.scss';

import { useDeleteLandParcelMutation, useGetAllLandParcelsQuery } from 'api/LandParcel.api';
import { usePermissions } from 'hooks/useAuth';

type ColumnFilters = {
  request_number?: string;
  customer_name?: string;
  address?: string;
};

interface LandParcelsFilterValues {
  search?: string;
  request_number?: string;
  customer_name?: string;
  address?: string;
  purpose?: string;
  council_date_start?: string;
  council_date_end?: string;
  tech_council_date_start?: string;
  tech_council_date_end?: string;
  ordering?: string;
}

interface LandParcelsPageProps {
  title?: string;
}

export const LandParcelsPage: FC<LandParcelsPageProps> = ({ title }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [searchParams, setSearchParams] = useSearchParams();

  // Pagination from URL
  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 10;

  const s = (key: string) => searchParams.get(key) || undefined;

  // Filters from URL
  const search = s('search');
  const requestNumberParam = s('request_number');
  const customerNameParam = s('customer_name');
  const addressParam = s('address');
  const purposeParam = s('purpose');
  const councilDateStart = s('council_date_start');
  const councilDateEnd = s('council_date_end');
  const techCouncilDateStart = s('tech_council_date_start');
  const techCouncilDateEnd = s('tech_council_date_end');
  const ordering = s('ordering') || '-created_at';

  // API Query
  const { data, isLoading } = useGetAllLandParcelsQuery({
    page,
    page_size: pageSize,
    search,
    request_number: requestNumberParam,
    ordering
  });

  const [deleteLandParcel] = useDeleteLandParcelMutation();

  // Column filters state (для инлайн фильтров в таблице)
  const [columnFilters, setColumnFilters] = useState<ColumnFilters>({
    request_number: requestNumberParam || '',
    customer_name: customerNameParam || '',
    address: addressParam || ''
  });

  // Filtered data (client-side fallback)
  const [tableData, setTableData] = useState<ILandParcel[]>([]);

  // Sync column filters with URL
  useEffect(() => {
    setColumnFilters({
      request_number: requestNumberParam || '',
      customer_name: customerNameParam || '',
      address: addressParam || ''
    });
  }, [requestNumberParam, customerNameParam, addressParam]);

  // Client-side filtering
  useEffect(() => {
    if (data?.results) {
      let filtered = data.results;

      // Фильтры из таблицы (инлайн)
      if (requestNumberParam && requestNumberParam.trim()) {
        const term = requestNumberParam.toLowerCase();
        filtered = filtered.filter((d) => (d.request_number || '').toLowerCase().includes(term));
      }

      if (customerNameParam && customerNameParam.trim()) {
        const term = customerNameParam.toLowerCase();
        filtered = filtered.filter((d) => (d.customer_name || '').toLowerCase().includes(term));
      }

      if (addressParam && addressParam.trim()) {
        const term = addressParam.toLowerCase();
        filtered = filtered.filter((d) => (d.address || '').toLowerCase().includes(term));
      }

      // Фильтры из FilterBar
      if (purposeParam && purposeParam.trim()) {
        const term = purposeParam.toLowerCase();
        filtered = filtered.filter((d) => (d.purpose || '').toLowerCase().includes(term));
      }

      if (councilDateStart && councilDateEnd) {
        filtered = filtered.filter((d) => {
          if (!d.council_date) return false;
          const date = new Date(d.council_date);
          return date >= new Date(councilDateStart) && date <= new Date(councilDateEnd);
        });
      }

      if (techCouncilDateStart && techCouncilDateEnd) {
        filtered = filtered.filter((d) => {
          if (!d.tech_council_date) return false;
          const date = new Date(d.tech_council_date);
          return date >= new Date(techCouncilDateStart) && date <= new Date(techCouncilDateEnd);
        });
      }

      setTableData(filtered);
    }
  }, [
    data,
    requestNumberParam,
    customerNameParam,
    addressParam,
    purposeParam,
    councilDateStart,
    councilDateEnd,
    techCouncilDateStart,
    techCouncilDateEnd
  ]);

  // Debounced filter change (для инлайн фильтров таблицы)
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

      setOrDelete('request_number', field === 'request_number' ? value : columnFilters.request_number || '');
      setOrDelete('customer_name', field === 'customer_name' ? value : columnFilters.customer_name || '');
      setOrDelete('address', field === 'address' ? value : columnFilters.address || '');

      next.set('page', '1');
      setSearchParams(next, { replace: false });
    }, 400);
  };

  // Filter change от FilterBar
  const handleFilterChange = (values: LandParcelsFilterValues) => {
    const next = new URLSearchParams(searchParams);
    const setOrDelete = (key: string, val: unknown) => {
      if (val === undefined || val === null || String(val).trim() === '') next.delete(key);
      else next.set(key, String(val));
    };

    Object.entries(values).forEach(([k, v]) => setOrDelete(k, v as unknown));

    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  // Handle actions
  const handleDelete = async (record: ILandParcel) => {
    Modal.confirm({
      title: 'Удалить земельный участок?',
      content: `Вы уверены, что хотите удалить участок "${record.request_number || `#${record.id}`}"?`,
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
        onFilterChange: handleColumnFilterChange,
        hasPermission
      }),
    [navigate, columnFilters, hasPermission]
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
        {/* FilterBar */}
        <LandParcelsFilterBar
          initialValues={{
            search,
            request_number: requestNumberParam,
            customer_name: customerNameParam,
            address: addressParam,
            purpose: purposeParam,
            council_date_start: councilDateStart,
            council_date_end: councilDateEnd,
            tech_council_date_start: techCouncilDateStart,
            tech_council_date_end: techCouncilDateEnd,
            ordering
          }}
          onFilterChange={handleFilterChange}
          onAddClick={() => navigate('/dashboard/land-parcels/add')}
        />

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

export default LandParcelsPage;
