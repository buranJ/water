import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Pagination, Table } from 'common/ui';
import { DashboardLayout, FilterBar } from 'components';
import type { FilterValues } from 'components/FilterBar/FilterBar';
import { getColumns, initialData } from './Customers.helpers';
import './styles.scss';

interface IProps {
  title: string;
}

export const Customers: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleFilterChange = (filter: FilterValues) => {
    console.log('Filter changed:', filter);
  };

  const onAddClick = () => {
    console.log('Add button clicked');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };
  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'edit':
            navigate(`/dashboard/technical-conditions/tu-details/${record.key}`);
            break;
          case 'delete':
            console.log('Delete action clicked for record:', record);
            break;
          case 'registrationDate':
            navigate(`/dashboard/protocol-details/${record.key}`);
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
        <Table pagination={false} columns={columns} dataSource={initialData} bordered scroll={{ x: 'max-content' }} />
        <Pagination />
      </div>
    </DashboardLayout>
  );
};
