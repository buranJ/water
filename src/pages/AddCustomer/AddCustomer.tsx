import { FC } from 'react';
import { useNavigate } from 'react-router';
import { CustomerForm } from 'components';
import { CustomerFormData } from 'components/CustomerForm/CustomerForm';
import { DashboardLayout } from 'components/DashboardLayout';

interface IProps {
  title: string;
}

export const AddCustomer: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const onSave = (value: CustomerFormData) => {
    console.log(value);
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
