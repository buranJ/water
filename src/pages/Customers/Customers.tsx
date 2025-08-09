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

import { ICustomer, useGetAllCustomersQuery } from 'api/Customer.api';
import { t } from 'i18next';

interface IProps {
  title: string;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Все' },
  { value: '0', label: 'Юр. лицо' },
  { value: '1', label: 'Физ. лицо' }
];

export const Customers: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(8);
  const [category, setCategory] = useState<string>('');

  const { data, isLoading } = useGetAllCustomersQuery({
    page,
    page_size: pageSize,
    ...(category ? { category } : {})
  });

  const handleFilterChange = (filter: FilterValues) => {
    setCategory(filter.category || '');
    setPage(1); // сбрасываем на первую страницу при фильтрации
  };

  const onAddClick = () => {
    navigate('/dashboard/add-customer');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
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
      }
    });
  }, [navigate]);

  const handlePaginationChange = (page: number, pageSize?: number) => {
    setPage(page);
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
          actionButtons={
            <>
              <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
                Добавить
              </Button>
              <Button icon={<DownloadOutlined />} iconPosition='end' onClick={onDownloadClick}>
                Экспорт
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
