import { FC, useState } from 'react';
import { useParams } from 'react-router';
import { Alert, Button, Card, Spin, Tabs, Tag, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetApplicationByIdQuery } from 'api/Application.api';

const tabItems = [
  { key: 'data', label: 'Данные' },
  { key: 'documents', label: 'Документы' }
];

export const ApplicationDetails: FC<{ title?: string }> = ({ title = 'Заявка №' }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('data');

  const { data, isLoading, isError } = useGetApplicationByIdQuery(id || '');

  return (
    <DashboardLayout title={title + id}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button icon={<DownloadOutlined />}>PDF</Button>
        <Button type='primary'>Оформление ТУ</Button>
        <Button danger>Отказать ТУ</Button>
      </div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} />
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type='error' message='Ошибка загрузки данных заявки' />
      ) : data ? (
        <>
          {activeTab === 'data' && (
            <>
              <Card style={{ marginBottom: 24 }}>
                <Typography.Title level={4}>Наименование объекта</Typography.Title>
                <Typography.Text>{data.object}</Typography.Text>
              </Card>
              <Card>
                <div style={{ marginBottom: 8 }}>
                  <b>Дата регистрации</b>
                  <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Заказчик</b>
                  <div>{data.customer}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Адрес</b>
                  <div>{data.address}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Количество водопроводной воды</b>
                  <div>{data.waterRequired}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Количество стоков</b>
                  <div>{data.firefightingExpenses}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>Статус</b>
                  <div>
                    <Tag color={data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'processing'}>
                      {data.status === 'approved'
                        ? 'Одобрено'
                        : data.status === 'rejected'
                          ? 'Отказано'
                          : data.status === 'pending'
                            ? 'В ожидании'
                            : 'ТУ заключён'}
                    </Tag>
                  </div>
                </div>
              </Card>
            </>
          )}
          {activeTab === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24 }}>
              {/* Здесь будет список документов */}
              Документы (заглушка)
            </div>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
};
