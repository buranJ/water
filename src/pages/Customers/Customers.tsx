import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Pagination, Table } from 'common/ui';
import { DashboardLayout, FilterBar } from 'components';
import type { FilterValues } from 'components/FilterBar/FilterBar';
import { getColumns } from './Customers.helpers';
import './styles.scss';

import { ICustomer, useGetAllCustomersQuery } from 'api/Customer.api';

interface IProps {
  title: string;
}

export const Customers: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();

  const { data = [], isLoading } = useGetAllCustomersQuery();

  const handleFilterChange = (filter: FilterValues) => {
    console.log('Filter changed:', filter);
  };

  const onAddClick = () => {
    navigate('/dashboard/add-customer');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };

  // Преобразование данных к формату таблицы
  const tableData = useMemo(() => {
    return data.map((item: ICustomer, idx: number) => ({
      key: String(item.id),
      number: String(idx + 1),
      customer: item.full_name,
      categories: (item.category === '1' ? 1 : 0) as 0 | 1,
      passportData: item.passport || '',
      registrationDate: item.created_at ? new Date(item.created_at).toLocaleDateString() : '',
      address: item.address,
      contacts: item.contact,
      status: (item.status === 'active' ? 'active' : 'inactive') as 'active' | 'inactive',
      action: 'Редактировать'
    }));
  }, [data]);

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
            // Можно реализовать редактирование
            break;
          case 'delete':
            // Можно реализовать удаление
            break;
        }
      }
    });
  }, [navigate]);

  return (
    <DashboardLayout title={title}>
      <div className='customers-page'>
        <FilterBar
          onFilterChange={handleFilterChange}
          showAlphabet
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
        <Pagination />
      </div>
    </DashboardLayout>
  );
};
