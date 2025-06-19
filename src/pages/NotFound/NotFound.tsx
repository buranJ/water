import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Result } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';

export const NotFound: FC = () => {
  const redirectTo = useNavigate();

  return (
    <DashboardLayout>
      <Result
        status='404'
        title='404'
        subTitle='Такой страницы не существует'
        extra={
          <Button onClick={() => redirectTo('/dashboard/geo')} type='primary'>
            На главную
          </Button>
        }
      />
    </DashboardLayout>
  );
};
