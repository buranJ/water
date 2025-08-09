import { FC, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Card, Spin, Tabs, Tag, Typography } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetCustomerByIdQuery } from 'api/Customer.api';

const tabItems = [
  { key: 'data', label: 'Данные' },
  { key: 'objects', label: 'Объекты' },
  { key: 'applications', label: 'Заявки' },
  { key: 'documents', label: 'Документы' },
  { key: 'payments', label: 'Платежи' }
];

export const CustomerDetails: FC<{ title?: string }> = ({ title }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const [activeTab, setActiveTab] = useState('data');

  const { data, isLoading, isError } = useGetCustomerByIdQuery(customerId || '');

  return (
    <DashboardLayout title={data?.full_name || title || 'Заказчик'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button icon={<DownloadOutlined />}>PDF</Button>
        <Button icon={<EditOutlined />} />
        <Button danger icon={<DeleteOutlined />} />
      </div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} />
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type='error' message='Ошибка загрузки данных заказчика' />
      ) : data ? (
        <>
          {activeTab === 'data' && (
            <Card>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>
                {data.full_name}
              </Typography.Title>
              <Typography.Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
                {data.category === '1' ? 'Физическое лицо' : 'Юридическое лицо'}
              </Typography.Text>
              <div style={{ marginBottom: 8 }}>
                <b>Дата регистрации</b>
                <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Паспортные данные</b>
                <div>{data.pasport || '-'}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Адрес</b>
                <div>{data.address}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Контакты</b>
                <div>{data.contact}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>Статус</b>
                <div>
                  <Tag color={data.status === 'active' ? 'success' : undefined}>{data.status === 'active' ? 'Одобрено' : 'Неактивен'}</Tag>
                </div>
              </div>
            </Card>
          )}
          {activeTab !== 'data' && (
            <Card>
              <Typography.Text type='secondary'>В разработке</Typography.Text>
            </Card>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
};
