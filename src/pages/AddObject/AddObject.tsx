import { FC } from 'react';
import { useNavigate } from 'react-router';
import { message } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectForm, ObjectFormData } from 'components/ObjectForm/ObjectForm';

import { useCreateObjectMutation } from 'api/Object.api';

interface AddObjectProps {
  title?: string;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const AddObject: FC<AddObjectProps> = ({ title = 'Добавить объект' }) => {
  const navigate = useNavigate();
  const [createObject, { isLoading }] = useCreateObjectMutation();

  const handleSubmit = async (formData: ObjectFormData): Promise<void> => {
    try {
      // Подготавливаем данные для API
      const objectData = {
        title: formData.title,
        address_street: formData.address_street,
        address_number: formData.address_number || '',
        kadastr_number: formData.kadastr_number,
        status: formData.status,
        customer: formData.customer || 1
      };

      await createObject(objectData).unwrap();
      message.success('Объект успешно создан');
      navigate('/dashboard/objects');
    } catch (error) {
      // Обработка ошибок API с правильной типизацией
      const apiError = error as ApiError;

      if (apiError?.data && typeof apiError.data === 'object') {
        const messages = Object.entries(apiError.data)
          .map(([field, msg]) => {
            const errorMsg = Array.isArray(msg) ? msg.join(', ') : msg;
            return `${field}: ${errorMsg}`;
          })
          .join('; ');
        message.error(`Ошибка: ${messages}`);
      } else if (apiError?.message) {
        message.error(`Ошибка: ${apiError.message}`);
      } else {
        message.error('Ошибка при создании объекта');
      }
      console.error('Create object error:', error);
    }
  };

  const handleCancel = (): void => {
    navigate('/dashboard/objects');
  };

  return (
    <DashboardLayout title={title}>
      <ObjectForm onSubmit={handleSubmit} onCancel={handleCancel} loading={isLoading} />
    </DashboardLayout>
  );
};
