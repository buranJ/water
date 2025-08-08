import { FC, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Alert, Button, message, Modal, Space, Spin } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectDetails } from 'components/ObjectDetails/ObjectDetails';

import { useDeleteObjectMutation, useGetObjectByIdQuery, useUpdateObjectTitleMutation } from 'api/Object.api';

interface ObjectDetailProps {
  title?: string;
}

export const ObjectDetail: FC<ObjectDetailProps> = ({ title = 'Детали объекта' }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Валидация ID
  const objectId = useMemo(() => {
    const parsedId = Number(id);
    return isNaN(parsedId) || parsedId <= 0 ? null : parsedId;
  }, [id]);

  const {
    data: object,
    isLoading,
    error,
    refetch
  } = useGetObjectByIdQuery(objectId!, {
    skip: !objectId // Пропускаем запрос если ID невалидный
  });

  const [updateObjectTitle, { isLoading: isUpdating }] = useUpdateObjectTitleMutation();
  const [deleteObject, { isLoading: isDeleting }] = useDeleteObjectMutation();

  // Мемоизированные обработчики для предотвращения лишних рендеров
  const handleTitleChange = useCallback(
    async (newTitle: string): Promise<void> => {
      if (!object || !newTitle.trim()) return;

      try {
        await updateObjectTitle({
          id: object.id,
          title: newTitle.trim()
        }).unwrap();
        message.success('Название обновлено');
      } catch (error) {
        console.error('Update title error:', error);
        const errorMessage =
          error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
            ? String(error.data.message)
            : 'Ошибка при обновлении названия';
        message.error(errorMessage);
      }
    },
    [object, updateObjectTitle]
  );

  const handleDelete = useCallback((): void => {
    if (!object) return;

    Modal.confirm({
      title: 'Подтверждение удаления',
      icon: <ExclamationCircleOutlined />,
      content: `Вы уверены, что хотите удалить объект "${object.title}"? Это действие нельзя отменить.`,
      okText: 'Удалить',
      cancelText: 'Отмена',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteObject(object.id).unwrap();
          message.success('Объект удален');
          navigate('/dashboard/objects', { replace: true });
        } catch (error) {
          console.error('Delete object error:', error);
          const errorMessage =
            error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
              ? String(error.data.message)
              : 'Ошибка при удалении объекта';
          message.error(errorMessage);
        }
      }
    });
  }, [object, deleteObject, navigate]);

  const handleBack = useCallback((): void => {
    navigate('/dashboard/objects');
  }, [navigate]);

  const handleRetry = useCallback((): void => {
    refetch();
  }, [refetch]);

  // Обработка невалидного ID
  if (!objectId) {
    return (
      <DashboardLayout title={title}>
        <Alert
          message='Неверный ID'
          description='Указан некорректный идентификатор объекта'
          type='error'
          showIcon
          action={<Button onClick={handleBack}>Вернуться к списку</Button>}
        />
      </DashboardLayout>
    );
  }

  // Обработка ошибок загрузки
  if (error) {
    const isNotFound = 'status' in error && error.status === 404;

    return (
      <DashboardLayout title={title}>
        <Alert
          message={isNotFound ? 'Объект не найден' : 'Ошибка загрузки'}
          description={
            isNotFound
              ? 'Объект с указанным ID не существует или был удален'
              : 'Не удалось загрузить информацию об объекте. Проверьте подключение к интернету.'
          }
          type={isNotFound ? 'warning' : 'error'}
          showIcon
          action={
            <Space>
              {!isNotFound && <Button onClick={handleRetry}>Повторить</Button>}
              <Button onClick={handleBack}>Вернуться к списку</Button>
            </Space>
          }
        />
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
          disabled={isDeleting}
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
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isUpdating}
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
        <Alert
          message='Нет данных'
          description='Данные об объекте отсутствуют'
          type='info'
          showIcon
          action={<Button onClick={handleRetry}>Обновить</Button>}
        />
      )}
    </DashboardLayout>
  );
};
