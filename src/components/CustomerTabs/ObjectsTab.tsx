// src/components/CustomerTabs/ObjectsTab.tsx
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ICustomerObject {
  id: number;
  full_address: string;
  title: string;
  contract_date: string | null;
  type: string | null;
  status: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  usage_type: string | null;
  tu_status: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  customer: number;
  creater: number;
}

interface IProps {
  objects: ICustomerObject[];
}

export const ObjectsTab: FC<IProps> = ({ objects }) => {
  const navigate = useNavigate();

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'active':
        return <Tag color='success'>Активный</Tag>;
      case 'inactive':
        return <Tag color='default'>Неактивный</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<ICustomerObject> = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Название объекта',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            Кадастр: {record.kadastr_number}
          </Text>
        </div>
      )
    },
    {
      title: 'Адрес',
      dataIndex: 'full_address',
      key: 'full_address',
      render: (text: string, record) => (
        <div>
          <Text>{text}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {record.address_street}, {record.address_number}
          </Text>
        </div>
      )
    },
    {
      title: 'Статус ТУ',
      dataIndex: 'tu_status',
      key: 'tu_status',
      render: (status: string | null) => (status ? <Tag color='processing'>{status}</Tag> : <Text type='secondary'>Не указан</Text>)
    },
    {
      title: 'Статус объекта',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Button size='small' icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/objects/${record.id}`)}>
          Детали
        </Button>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={objects}
      rowKey='id'
      pagination={false}
      locale={{ emptyText: 'У клиента нет объектов' }}
      scroll={{ x: 'max-content' }}
    />
  );
};
