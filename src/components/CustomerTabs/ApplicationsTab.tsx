// src/components/CustomerTabs/ApplicationsTab.tsx
import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Space, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface ICustomerApplication {
  id: number;
  entity: number;
  customer: number;
  author: number;
  status: string;
  INN: string;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  created_at: string;
  updated_at: string;
  application_files: unknown[];
  ty_id: number | null;
}

interface IProps {
  applications: ICustomerApplication[];
}

export const ApplicationsTab: FC<IProps> = ({ applications }) => {
  const navigate = useNavigate();

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'pending':
        return <Tag color='warning'>В ожидании</Tag>;
      case 'contracted':
        return <Tag color='success'>Заключен договор</Tag>;
      case 'approved':
        return <Tag color='processing'>Одобрено</Tag>;
      case 'rejected':
        return <Tag color='error'>Отклонено</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const columns: ColumnsType<ICustomerApplication> = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1
    },
    {
      title: 'Объект',
      dataIndex: 'object',
      key: 'object',
      render: (text: string, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            ИНН: {record.INN}
          </Text>
        </div>
      )
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      width: 200
    },
    {
      title: 'Контакт',
      dataIndex: 'contact',
      key: 'contact',
      width: 150
    },
    {
      title: 'Параметры',
      key: 'parameters',
      render: (_, record) => (
        <div>
          <Text style={{ fontSize: '12px' }}>
            Кол-во: {record.quantity} | Напор: {record.pressure}
          </Text>
          <br />
          <Text style={{ fontSize: '12px' }}>
            Вода: {record.waterRequired} | Пожар: {record.firefightingExpenses}
          </Text>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'ТУ',
      dataIndex: 'ty_id',
      key: 'ty_id',
      render: (tyId: number | null) =>
        tyId ? (
          <Button size='small' type='link' onClick={() => navigate(`/dashboard/technical-conditions/${tyId}`)}>
            ТУ #{tyId}
          </Button>
        ) : (
          <Text type='secondary'>Не создано</Text>
        )
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
      width: 120,
      render: (_, record) => (
        <Space>
          <Button size='small' icon={<EyeOutlined />} onClick={() => navigate(`/dashboard/applications/${record.id}`)}>
            Детали
          </Button>
          {record.x && record.y && (
            <Button
              size='small'
              icon={<EnvironmentOutlined />}
              onClick={() => {
                // Открываем карту с координатами
                window.open(`https://maps.google.com/?q=${record.x},${record.y}`, '_blank');
              }}
              title='Показать на карте'
            />
          )}
        </Space>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={applications}
      rowKey='id'
      pagination={false}
      locale={{ emptyText: 'У клиента нет заявок' }}
      scroll={{ x: 'max-content' }}
    />
  );
};
