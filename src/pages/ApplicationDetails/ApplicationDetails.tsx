import { FC, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Button, Card, Spin, Tabs, Tag, Typography } from 'antd';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined
} from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { useDeleteApplicationFileMutation, useGetApplicationByIdQuery } from 'api/Application.api';

const tabItems = [
  { key: 'data', label: 'Данные' },
  { key: 'documents', label: 'Документы' }
];

export const ApplicationDetails: FC<{ title?: string }> = ({ title = 'Заявка №' }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('data');
  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetApplicationByIdQuery(id || '');
  const [deleteApplicationFile] = useDeleteApplicationFileMutation();

  return (
    <DashboardLayout title={title + id}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button icon={<DownloadOutlined />}>PDF</Button>
        <Button onClick={() => navigate(`/dashboard/applications/${id}/edit`)}>Редактировать</Button>
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
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                Документы
              </Typography.Title>
              {data.application_files && data.application_files.length > 0 ? (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>Название</th>
                      <th style={{ textAlign: 'left' }}>Дата загрузки</th>
                      <th style={{ textAlign: 'left' }}>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.application_files.map((file: any) => (
                      <tr key={file.id}>
                        <td>
                          {(() => {
                            const name = file.file.split('/').pop() || '';
                            const ext = name.split('.').pop()?.toLowerCase();
                            if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#d4380d', fontSize: 18, marginRight: 8 }} />;
                            if (['doc', 'docx'].includes(ext || ''))
                              return <FileWordOutlined style={{ color: '#1890ff', fontSize: 18, marginRight: 8 }} />;
                            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext || ''))
                              return <FileImageOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />;
                            return <FileOutlined style={{ fontSize: 18, marginRight: 8 }} />;
                          })()}
                          <a href={file.file} target='_blank' rel='noopener noreferrer'>
                            {file.file.split('/').pop()}
                          </a>
                        </td>
                        <td>{file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}</td>
                        <td>
                          <Button
                            type='text'
                            danger
                            icon={
                              <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                <DeleteOutlined />
                              </span>
                            }
                            onClick={async () => {
                              await deleteApplicationFile({ id: file.id });
                            }}
                          />
                          <Button
                            type='text'
                            icon={
                              <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                <ArrowDownOutlined />
                              </span>
                            }
                            href={file.file}
                            target='_blank'
                            rel='noopener noreferrer'
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography.Text type='secondary'>Нет загруженных документов</Typography.Text>
              )}
            </div>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
};
