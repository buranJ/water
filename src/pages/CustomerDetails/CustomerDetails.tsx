import { FC, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Card, Spin, Tabs, Tag, Typography } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetCustomerByIdQuery } from 'api/Customer.api';
import { t } from 'i18next';

const tabItems = [
  { key: 'data', label: t('customers.details.tabs.data') },
  { key: 'objects', label: t('customers.details.tabs.objects') },
  { key: 'applications', label: t('customers.details.tabs.applications') },
  { key: 'documents', label: t('customers.details.tabs.documents') },
  { key: 'payments', label: t('customers.details.tabs.payments') }
];

export const CustomerDetails: FC<{ title?: string }> = ({ title }) => {
  const { customerId } = useParams<{ customerId: string }>();
  const [activeTab, setActiveTab] = useState('data');

  const { data, isLoading, isError } = useGetCustomerByIdQuery(customerId || '');

  return (
    <DashboardLayout title={data?.full_name || title || 'dashboard.pages.customers'}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button icon={<DownloadOutlined />}>PDF</Button>
        <Button icon={<EditOutlined />} />
        <Button danger icon={<DeleteOutlined />} />
      </div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} />
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type='error' message={t('customers.details.loadError')} />
      ) : data ? (
        <>
          {activeTab === 'data' && (
            <Card>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>
                {data.full_name}
              </Typography.Title>
              <Typography.Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
                {data.category === '1' ? t('customers.category.physicalFull') : t('customers.category.legalFull')}
              </Typography.Text>
              <div style={{ marginBottom: 8 }}>
                <b>{t('customers.columns.registrationDate')}</b>
                <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>{t('customers.columns.passportData')}</b>
                <div>{data.pasport || '-'}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>{t('customers.columns.address')}</b>
                <div>{data.address}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>{t('customers.columns.contacts')}</b>
                <div>{data.contact}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <b>{t('customers.columns.status')}</b>
                <div>
                  <Tag color={data.status === 'active' ? 'success' : undefined}>
                    {data.status === 'active' ? t('customers.status.active') : t('customers.status.inactive')}
                  </Tag>
                </div>
              </div>
            </Card>
          )}
          {activeTab !== 'data' && (
            <Card>
              <Typography.Text type='secondary'>{t('common.inDevelopment')}</Typography.Text>
            </Card>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
};
