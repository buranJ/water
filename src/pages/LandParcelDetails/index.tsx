import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Card, Col, Descriptions, message, Modal, Row, Skeleton, Space, Tag, Typography } from 'antd';
import { DeleteOutlined, EditOutlined, LeftOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DashboardLayout } from 'components';
import './styles.scss';

import { useDeleteLandParcelMutation, useGetLandParcelByIdQuery } from 'api/LandParcel.api';
import { usePermissions } from 'hooks/useAuth';

const { Title } = Typography;

interface LandParcelDetailsProps {
  title?: string;
}

const LandParcelDetails: FC<LandParcelDetailsProps> = ({ title }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { hasPermission } = usePermissions();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  console.log('🔍 LandParcelDetails - ID from URL:', id);

  // Загружаем данные участка
  const { data: landParcel, isLoading, error } = useGetLandParcelByIdQuery({ id: id! }, { skip: !id });

  useEffect(() => {
    console.log('📥 API Response:', { landParcel, isLoading, error });
  }, [landParcel, isLoading, error]);

  const [deleteLandParcel, { isLoading: isDeleting }] = useDeleteLandParcelMutation();

  const handleDelete = async () => {
    try {
      await deleteLandParcel({ id: id! }).unwrap();
      message.success('Земельный участок удалён');
      navigate('/dashboard/land-parcels');
    } catch (error) {
      console.error('Delete error:', error);
      message.error('Ошибка при удалении участка');
    }
  };

  // Обработка ошибки
  if (error) {
    console.error('❌ Error loading land parcel:', error);
    return (
      <DashboardLayout title={title || 'Детали участка'}>
        <Card>
          <Typography.Title level={4} type='danger'>
            Ошибка загрузки данных участка
          </Typography.Title>
          <Typography.Paragraph>
            {error && typeof error === 'object' && 'status' in error && (
              <>
                Код ошибки: {(error as { status?: number }).status}
                <br />
                {(error as { data?: { detail?: string } }).data?.detail && (
                  <>Детали: {(error as { data?: { detail?: string } }).data?.detail}</>
                )}
              </>
            )}
          </Typography.Paragraph>
          <Button type='primary' onClick={() => navigate('/dashboard/land-parcels')}>
            Вернуться к списку
          </Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={title || 'Детали участка'}>
      <div className='land-parcel-details'>
        {/* Header */}
        <Row justify='space-between' align='middle' style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Button icon={<LeftOutlined />} onClick={() => navigate('/dashboard/land-parcels')}>
                Назад к списку
              </Button>
              {landParcel && (
                <Title level={3} style={{ margin: 0 }}>
                  {landParcel.request_number || `Участок #${landParcel.id}`}
                </Title>
              )}
            </Space>
          </Col>
          <Col>
            <Space>
              <Button
                type='primary'
                icon={<EditOutlined />}
                onClick={() => navigate(`/dashboard/land-parcels/${id}/edit`)}
                disabled={isLoading || !hasPermission('change_landparcel')}
              >
                Редактировать
              </Button>
              <Button danger icon={<DeleteOutlined />} onClick={() => setDeleteModalOpen(true)} disabled={isLoading || !hasPermission('delete_landparcel')}>
                Удалить
              </Button>
            </Space>
          </Col>
        </Row>

        {/* Main Info Card */}
        <Card title='Основная информация' style={{ marginBottom: 24 }}>
          {isLoading ? (
            <Skeleton active paragraph={{ rows: 8 }} />
          ) : landParcel ? (
            <Descriptions bordered column={2}>
              <Descriptions.Item label='ID'>
                <Typography.Text strong>#{landParcel.id}</Typography.Text>
              </Descriptions.Item>

              <Descriptions.Item label='Номер запроса'>
                <Typography.Text copyable={landParcel.request_number ? true : false}>{landParcel.request_number || '—'}</Typography.Text>
              </Descriptions.Item>

              <Descriptions.Item label='Адрес' span={2}>
                {landParcel.address || '—'}
              </Descriptions.Item>

              <Descriptions.Item label='Назначение'>
                {landParcel.purpose ? <Tag color='blue'>{landParcel.purpose}</Tag> : '—'}
              </Descriptions.Item>

              <Descriptions.Item label='Заказчик'>
                {landParcel.customer_name ? (
                  <Space>
                    <Typography.Link onClick={() => navigate(`/dashboard/customers/${landParcel.customer}`)}>
                      {landParcel.customer_name}
                    </Typography.Link>
                    <Typography.Text type='secondary'>(ID: {landParcel.customer})</Typography.Text>
                  </Space>
                ) : (
                  '—'
                )}
              </Descriptions.Item>

              <Descriptions.Item label='Дата совета'>
                {landParcel.council_date ? dayjs(landParcel.council_date).format('DD.MM.YYYY') : '—'}
              </Descriptions.Item>

              <Descriptions.Item label='Дата тех совета'>
                {landParcel.tech_council_date ? dayjs(landParcel.tech_council_date).format('DD.MM.YYYY') : '—'}
              </Descriptions.Item>

              <Descriptions.Item label='Файл' span={2}>
                {landParcel.file ? (
                  <Typography.Link href={landParcel.file} target='_blank' rel='noopener noreferrer'>
                    Скачать файл
                  </Typography.Link>
                ) : (
                  '—'
                )}
              </Descriptions.Item>

              <Descriptions.Item label='Комментарий' span={2}>
                {landParcel.comment ? (
                  <Typography.Paragraph style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{landParcel.comment}</Typography.Paragraph>
                ) : (
                  '—'
                )}
              </Descriptions.Item>

              <Descriptions.Item label='Дата создания'>
                {landParcel.created_at ? dayjs(landParcel.created_at).format('DD.MM.YYYY HH:mm') : '—'}
              </Descriptions.Item>

              <Descriptions.Item label='Дата обновления'>
                {landParcel.updated_at ? dayjs(landParcel.updated_at).format('DD.MM.YYYY HH:mm') : '—'}
              </Descriptions.Item>

              {landParcel.creater && (
                <Descriptions.Item label='Создал' span={2}>
                  <Typography.Text type='secondary'>ID пользователя: {landParcel.creater}</Typography.Text>
                </Descriptions.Item>
              )}
            </Descriptions>
          ) : (
            <Typography.Text type='secondary'>Нет данных для отображения</Typography.Text>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          title='Удалить земельный участок?'
          open={deleteModalOpen}
          onOk={handleDelete}
          onCancel={() => setDeleteModalOpen(false)}
          okText='Удалить'
          cancelText='Отмена'
          okButtonProps={{ danger: true, loading: isDeleting }}
        >
          <Typography.Paragraph>
            Вы уверены, что хотите удалить участок <strong>{landParcel?.request_number || `#${landParcel?.id}`}</strong>?
          </Typography.Paragraph>
          {landParcel?.customer_name && <Typography.Paragraph type='secondary'>Заказчик: {landParcel.customer_name}</Typography.Paragraph>}
          {landParcel?.address && <Typography.Paragraph type='secondary'>Адрес: {landParcel.address}</Typography.Paragraph>}
          <Typography.Paragraph type='danger'>Это действие нельзя отменить!</Typography.Paragraph>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default LandParcelDetails;
