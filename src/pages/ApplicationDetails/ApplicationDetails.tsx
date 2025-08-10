import { FC, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Button, Card, message, Modal, Spin, Tabs, Tag, Typography } from 'antd';
import {
  ArrowDownOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileWordOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { useDeleteApplicationFileMutation, useGetApplicationByIdQuery, useUploadApplicationFilesMutation } from 'api/Application.api';
import { t } from 'i18next';

type ApplicationFileItem = string | { id: number; file: string; created_at?: string };

const tabItems = [
  { key: 'data', label: t('applicationDetails.tabs.data') },
  { key: 'documents', label: t('applicationDetails.tabs.documents') }
];

export const ApplicationDetails: FC<{ title?: string }> = ({ title = 'routers.ApplicationDetails' }) => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('data');
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetApplicationByIdQuery(id || '');
  const [deleteApplicationFile] = useDeleteApplicationFileMutation();
  const [uploadApplicationFiles] = useUploadApplicationFilesMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <DashboardLayout title={t(title) + id}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginBottom: 16 }}>
        <Button icon={<DownloadOutlined />}>{t('applicationDetails.buttons.pdf')}</Button>
        <Button onClick={() => navigate(`/dashboard/applications/${id}/edit`)}>{t('applicationDetails.buttons.edit')}</Button>
        <Button onClick={() => navigate(`/dashboard/applications/${id}/change-history`)}>История изменений</Button>
        <Button type='primary'>{t('applicationDetails.buttons.createTu')}</Button>
        <Button danger>{t('applicationDetails.buttons.rejectTu')}</Button>
      </div>
      <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} style={{ marginBottom: 24 }} />
      {isLoading ? (
        <Spin />
      ) : isError ? (
        <Alert type='error' message={t('applicationDetails.loadError')} />
      ) : data ? (
        <>
          {activeTab === 'data' && (
            <>
              <Card style={{ marginBottom: 24 }}>
                <Typography.Title level={4}>{t('applicationDetails.labels.objectName')}</Typography.Title>
                <Typography.Text>{data.object}</Typography.Text>
              </Card>
              <Card>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.registrationDate')}</b>
                  <div>{data.created_at ? new Date(data.created_at).toLocaleDateString() : ''}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.customer')}</b>
                  <div>{data.customer}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.address')}</b>
                  <div>{data.address}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.waterRequired')}</b>
                  <div>{data.waterRequired}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.wastewater')}</b>
                  <div>{data.firefightingExpenses}</div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <b>{t('applicationDetails.labels.status')}</b>
                  <div>
                    <Tag color={data.status === 'approved' ? 'success' : data.status === 'rejected' ? 'error' : 'processing'}>
                      {data.status === 'approved'
                        ? t('applicationDetails.status.approved')
                        : data.status === 'rejected'
                          ? t('applicationDetails.status.rejected')
                          : data.status === 'pending'
                            ? t('applicationDetails.status.pending')
                            : t('applicationDetails.status.tuConcluded')}
                    </Tag>
                  </div>
                </div>
              </Card>
            </>
          )}
          {activeTab === 'documents' && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column' }}>
              <Typography.Title level={5} style={{ marginBottom: 16 }}>
                {t('applicationDetails.documentsTitle')}
              </Typography.Title>
              <div style={{ marginBottom: 16 }}>
                <Button type='primary' icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
                  {t('applicationDetails.buttons.addFile')}
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  style={{ display: 'none' }}
                  onChange={async (e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    if (files.length > 0 && id) {
                      try {
                        await uploadApplicationFiles({ application: Number(id), files });
                        refetch();
                        // Можно добавить message.success('Файл успешно загружен');
                      } catch {
                        // Можно добавить message.error('Ошибка при загрузке файла');
                      }
                    }
                    e.target.value = '';
                  }}
                />
              </div>
              {data.application_files && data.application_files.length > 0 ? (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.name')}</th>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.uploadDate')}</th>
                      <th style={{ textAlign: 'left' }}>{t('applicationDetails.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.application_files as ApplicationFileItem[]).map((file) => (
                      <tr key={typeof file === 'string' ? file : `id-${file.id}`}>
                        <td>
                          {(() => {
                            const fileUrl = typeof file === 'string' ? file : file.file;
                            const name = fileUrl.split('/').pop() || '';
                            const ext = name.split('.').pop()?.toLowerCase();
                            if (ext === 'pdf') return <FilePdfOutlined style={{ color: '#d4380d', fontSize: 18, marginRight: 8 }} />;
                            if (['doc', 'docx'].includes(ext || ''))
                              return <FileWordOutlined style={{ color: '#1890ff', fontSize: 18, marginRight: 8 }} />;
                            if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'].includes(ext || ''))
                              return <FileImageOutlined style={{ color: '#52c41a', fontSize: 18, marginRight: 8 }} />;
                            return <FileOutlined style={{ fontSize: 18, marginRight: 8 }} />;
                          })()}
                          <a href={typeof file === 'string' ? file : file.file} target='_blank' rel='noopener noreferrer'>
                            {(typeof file === 'string' ? file : file.file).split('/').pop()}
                          </a>
                        </td>
                        <td>{typeof file !== 'string' && file.created_at ? new Date(file.created_at).toLocaleDateString() : ''}</td>
                        <td>
                          {typeof file !== 'string' && (
                            <Button
                              type='text'
                              danger
                              icon={
                                <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                  <DeleteOutlined />
                                </span>
                              }
                              onClick={() => {
                                Modal.confirm({
                                  title: 'Удалить файл?',
                                  content: 'Это действие необратимо. Вы уверены, что хотите удалить файл?',
                                  okText: 'Удалить',
                                  cancelText: 'Отмена',
                                  okButtonProps: { danger: true },
                                  onOk: async () => {
                                    try {
                                      await deleteApplicationFile({ id: file.id }).unwrap();
                                      message.success('Файл удален');
                                      refetch();
                                    } catch {
                                      message.error('Не удалось удалить файл');
                                    }
                                  }
                                });
                              }}
                            />
                          )}
                          <Button
                            type='text'
                            icon={
                              <span style={{ fontWeight: 'bold', fontSize: 18 }}>
                                <ArrowDownOutlined />
                              </span>
                            }
                            href={typeof file === 'string' ? file : file.file}
                            target='_blank'
                            rel='noopener noreferrer'
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <Typography.Text type='secondary'>{t('applicationDetails.noDocs')}</Typography.Text>
              )}
            </div>
          )}
        </>
      ) : null}
    </DashboardLayout>
  );
};
