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

  const initialValues: ApplicationFormData | undefined = useMemo(
    () =>
      data
        ? {
            INN: data.INN,
            customer: String(data.customer),
            object: data.object,
            address: data.address,
            contact: data.contact,
            quantity: data.quantity,
            pressure: data.pressure,
            waterRequired: data.waterRequired,
            firefightingExpenses: data.firefightingExpenses,
            x: data.x,
            y: data.y
          }
        : undefined,
    [data]
  );

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
          customer: Number(values.customer),
          entity: 1,
          status: values.status || 'pending'
        }
      }).unwrap();
      message.success('Заявка успешно обновлена');
      navigate('/dashboard/applications');
    } catch (error: any) {
      if (error?.data && typeof error.data === 'object') {
        const messages = Object.entries(error.data)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
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

  return (
    <DashboardLayout title={title}>
      <ApplicationForm onCancel={onCancel} onSave={onSave} initialValues={initialValues} form={form} submitText='Сохранить' />
    </DashboardLayout>
  );
};
