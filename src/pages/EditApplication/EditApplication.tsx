import { FC, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Form, message } from 'antd';
import { ApplicationForm, ApplicationFormData } from 'components/ApplicationForm/ApplicationForm';
import { DashboardLayout } from 'components/DashboardLayout';

import { useGetApplicationByIdQuery, useUpdateApplicationMutation } from 'api/Application.api';

interface IProps {
  title: string;
}

export const EditApplication: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data } = useGetApplicationByIdQuery(id || '');
  const [updateApplication] = useUpdateApplicationMutation();
  const [form] = Form.useForm<ApplicationFormData>();

  const initialValues: ApplicationFormData | undefined = useMemo(() => {
    if (!data) return undefined;
    const { customer, ...rest } = data;
    return {
      customer: customer.full_name,
      ...rest
    };
  }, [data]);

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [form, initialValues]);

  const onSave = async (values: ApplicationFormData) => {
    try {
      await updateApplication({
        id: Number(id),
        body: {
          ...values,
          customer: data?.customer.id,
          entity: data?.entity,
          status: data?.status || 'pending'
        }
      }).unwrap();
      message.success('Заявка успешно обновлена');
      navigate('/dashboard/applications');
    } catch (error: unknown) {
      const data = typeof error === 'object' && error !== null && 'data' in error ? (error as { data?: unknown }).data : undefined;

      if (data && typeof data === 'object') {
        const messages = Object.entries(data as Record<string, unknown>)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? (msg as unknown[]).join(', ') : String(msg)}`)
          .join('; ');
        message.error(`Ошибка: ${messages}`);
      } else {
        message.error('Ошибка при обновлении заявки');
      }
      console.error('Ошибка при обновлении заявки:', error);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  // Кнопка "Изменить" у полей: Заказчик/Объект/Улица
  const onCustomerEdit = () => {
    const cid = data?.customer?.id;
    if (cid) {
      navigate(`/dashboard/customers/${cid}/edit`);
    } else {
      message.warning('Данные клиента не загружены');
    }
  };

  const onObjectEdit = () => {
    const objId = data?.entity;
    if (objId) {
      // Редактирование объекта выполняется на странице объекта
      navigate(`/dashboard/objects/${objId}`);
    } else {
      message.warning('Данные объекта не загружены');
    }
  };

  // Улица (address) — часть адреса объекта, ведём туда же
  const onStreetEdit = () => {
    const objId = data?.entity;
    if (objId) {
      navigate(`/dashboard/objects/${objId}`);
    } else {
      message.warning('Данные объекта не загружены');
    }
  };

  return (
    <DashboardLayout title={title}>
      <ApplicationForm
        onCancel={onCancel}
        onSave={onSave}
        initialValues={initialValues}
        form={form}
        submitText='Сохранить'
        onCustomerEdit={onCustomerEdit}
        onObjectEdit={onObjectEdit}
        onStreetEdit={onStreetEdit}
      />
    </DashboardLayout>
  );
};
