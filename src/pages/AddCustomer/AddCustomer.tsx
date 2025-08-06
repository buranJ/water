import { FC } from 'react';
import { useNavigate } from 'react-router';
import { message } from 'antd';
import { CustomerForm } from 'components';
import { CustomerFormData } from 'components/CustomerForm/CustomerForm';
import { DashboardLayout } from 'components/DashboardLayout';

import { useCreateCustomerMutation } from 'api/Customer.api';

interface IProps {
  title: string;
}

export const AddCustomer: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const [createCustomer] = useCreateCustomerMutation();

  const onSave = async (value: CustomerFormData & { fio?: string; companyName?: string }) => {
    try {
      const isLegal = value.type === 'legal';
      await createCustomer({
        inn: value.inn,
        full_name: isLegal ? value.companyName : value.fio,
        category: isLegal ? '0' : '1',
        passport: value.passportData,
        address: value.address,
        contact: value.contactData,
        status: value.status
      }).unwrap();
      message.success('Заказчик успешно добавлен');
      navigate('/dashboard/customers');
    } catch (error: any) {
      if (error?.data && typeof error.data === 'object') {
        const messages = Object.entries(error.data)
          .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(', ') : msg}`)
          .join('; ');
        message.error(`Ошибка: ${messages}`);
      } else {
        message.error('Ошибка при создании заказчика');
      }
      console.error('Ошибка при создании заказчика:', error);
    }
  };

  const onCancel = () => {
    navigate(-1);
  };

  return (
    <DashboardLayout title={title}>
      <CustomerForm onCancel={onCancel} onSave={onSave} />
    </DashboardLayout>
  );
};
