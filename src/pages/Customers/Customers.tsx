
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { FC, useMemo } from 'react';
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
  const handleFilterChange = (filter: FilterValues) => {
    console.log('Filter changed:', filter);
  };

  const onAddClick = () => {
    console.log('Add button clicked');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };
  const navigate = useNavigate();
  const columns: ColumnsType<CustomerRecord> = [
    {
      title: '№',
      dataIndex: 'number',
      key: 'number',
      align: 'center'
    },
    {
      title: 'Заказчик',
      dataIndex: 'customer',
      key: 'customer',
      width: 220,
      align: 'center'
    },
    {
      title: 'Категории',
      dataIndex: 'categories',
      key: 'categories',
      render: (text) => {
        return text === 1 ? <Tag color='processing'>Физ. лицо</Tag> : <Tag color='success'>Юр. лицо</Tag>;
      },
      align: 'center'
    },
    {
      title: 'Паспортные данные',
      dataIndex: 'passportData',
      key: 'passportData',
      align: 'center',
      width: 200
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      align: 'center',
      width: 200
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      width: 200,
      render: (_, record) => (
        <div style={{ color: '#000000', cursor: 'pointer' }} onClick={() => navigate(`/dashboard/protocol-details/${record.key}`)}>
          {record.address}
        </div>
      )
    },
    {
      title: 'Контакты',
      dataIndex: 'contacts',
      key: 'contacts',
      align: 'center',
      width: 180
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        return text === 'active' ? <Tag color='success'>Активен</Tag> : <Tag>Не активен</Tag>;
      },
      align: 'center',
      width: 150
    },
    {
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 126,
      render: (_, record) => (
        <div
          style={{ color: '#000000', cursor: 'pointer' }}
          onClick={() => navigate(`/dashboard/technical-conditions/tu-details/${record.key}`)}
        >
          {record.action}
        </div>
      )
    }
  ];

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'edit':
            console.log('Edit action clicked for record:', record);
            break;
          case 'delete':
            console.log('Delete action clicked for record:', record);
            break;
        }
      }
    });
  }, []);

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
