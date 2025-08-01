import { FC } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Button, message, Space, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectDetails } from 'components/ObjectDetails/ObjectDetails';

import { useDeleteObjectMutation, useGetObjectByIdQuery, useUpdateObjectTitleMutation } from 'api/Object.api';

interface ObjectDetailProps {
  title?: string;
}

export const ObjectDetail: FC<ObjectDetailProps> = ({ title = 'Детали объекта' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: object, isLoading, error } = useGetObjectByIdQuery(Number(id));

  const [updateObjectTitle] = useUpdateObjectTitleMutation();
  const [deleteObject] = useDeleteObjectMutation();

  const handleTitleChange = async (newTitle: string): Promise<void> => {
    if (!object) return;

    try {
      await updateObjectTitle({
        id: object.id,
        title: newTitle
      }).unwrap();
      message.success('Название обновлено');
    } catch (error) {
      message.error('Ошибка при обновлении названия');
      console.error('Update title error:', error);
    }
  };

  const handleEdit = (): void => {
    navigate(`/dashboard/objects/${id}/edit`);
  };

  const handleDelete = async (): Promise<void> => {
    if (!object) return;

    try {
      await deleteObject(object.id).unwrap();
      message.success('Объект удален');
      navigate('/dashboard/objects');
    } catch (error) {
      message.error('Ошибка при удалении объекта');
      console.error('Delete object error:', error);
    }
  };

  const handleBack = (): void => {
    navigate('/dashboard/objects');
  };

  if (error) {
    return (
      <DashboardLayout title={title}>
        <Alert message='Ошибка загрузки' description='Не удалось загрузить информацию об объекте' type='error' showIcon />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={object?.title || title}>
      {/* Заголовок с кнопками */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 24
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleBack}
          style={{
            borderRadius: 12,
            border: 'none',
            backgroundColor: '#f5f5f7'
          }}
        >
          Назад к списку
        </Button>

        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            style={{
              borderRadius: 12,
              backgroundColor: '#f5f5f7',
              border: 'none'
            }}
          >
            Редактировать
          </Button>

          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            style={{
              borderRadius: 12
            }}
          >
            Удалить
          </Button>
        </Space>
      </div>

      {/* Контент */}
      {isLoading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '100px 0'
          }}
        >
          <Spin size='large' />
        </div>
      ) : object ? (
        <ObjectDetails object={object} onTitleChange={handleTitleChange} />
      ) : (
        <Alert message='Объект не найден' description='Объект с указанным ID не существует' type='warning' showIcon />
      )}
    </DashboardLayout>
  );
};
