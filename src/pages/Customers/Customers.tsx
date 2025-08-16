import { FC, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Table } from 'common/ui';
import CustomPagination from 'common/ui/Pagination/CustomPagination';
import { DashboardLayout, FilterBar } from 'components';
import type { FilterValues } from 'components/FilterBar/FilterBar';
import { getColumns } from './Customers.helpers';
import './styles.scss';

import { ICustomer, IGetCustomersParams, useGetAllCustomersQuery } from 'api/Customer.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

interface IProps {
  title: string;
}

const CATEGORY_OPTIONS = [
  { value: '', label: t('common.all') },
  { value: '0', label: t('customers.category.legalShort') },
  { value: '1', label: t('customers.category.physicalShort') }
];

const ALPHABET_OPTIONS = [
  { value: 'full_name', label: t('filterBar.alphabetAsc') },
  { value: '-full_name', label: t('filterBar.alphabetDesc') }
];

export const Customers: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [filters, setFilters] = useState<IGetCustomersParams>({
    page: 1,
    page_size: 8
  });

  const { data, isLoading } = useGetAllCustomersQuery({
    page,
    page_size: pageSize,
    ...filters
  });

  const handleFilterChange = (filter: FilterValues) => {
    const { alphabet, date, ...rest } = filter;
    const orderingValue = [alphabet, date].filter(Boolean).join(', ');

    setFilters({ ...rest, category: filter.category as '0' | '1', ordering: orderingValue });
    setPage(1); // сбрасываем на первую страницу при фильтрации
  };

  const onAddClick = () => {
    navigate('/dashboard/add-customer');
  };

  const onDownloadClick = () => {
    navigate('/dashboard/export-data');
  };

  // Преобразование данных к формату таблицы
  const tableData = useMemo(() => {
    return (data?.results || []).map((item: ICustomer, idx: number) => ({
      key: String(item.id),
      number: String((page - 1) * pageSize + idx + 1),
      customer: item.full_name,
      categories: (item.category === '1' ? 1 : 0) as 0 | 1,
      passportData: item.pasport || '',
      registrationDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      address: item.address,
      contacts: item.contact,
      status: (item.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
      action: 'Редактировать'
    }));
  }, [data, page, pageSize]);

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'details':
            navigate(`/dashboard/customers/${record.key}`);
            break;
          case 'registrationDate':
            navigate(`/dashboard/customers/${record.key}`);
            break;
          case 'edit':
            navigate(`/dashboard/customers/${record.key}/edit`);
            break;
          case 'delete':
            // Можно реализовать удаление
            break;
        }
      },
      hasPermission
    });
  }, [navigate, hasPermission]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setFilters({ ...filters, page });
    if (pageSize) setPageSize(pageSize);
  };

  return (
    <DashboardLayout title={t(title)}>
      <div className='customers-page'>
        <FilterBar
          onFilterChange={handleFilterChange}
          showAlphabet
          showCategory
          showDate
          categoryOptions={CATEGORY_OPTIONS}
          alphabetOptions={ALPHABET_OPTIONS}
          actionButtons={
            <>
              {hasPermission('add_customer') && (
                <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
                  {t('filterBar.add')}
                </Button>
              )}
              <Button icon={<DownloadOutlined />} iconPosition='end' onClick={onDownloadClick}>
                {t('common.export')}
              </Button>
            </>
          }
        />
        <Table pagination={false} columns={columns} dataSource={tableData} bordered scroll={{ x: 'max-content' }} loading={isLoading} />
        <CustomPagination current={page} pageSize={pageSize} total={data?.count || 0} onChange={handlePaginationChange} />
      </div>
    </DashboardLayout>
  );
};
