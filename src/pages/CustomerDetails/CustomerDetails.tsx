import { FC } from 'react';
import { useSearchParams } from 'react-router';
import { Button, Row, Tabs, TabsProps } from 'antd';
import { DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components';
import './styles.scss';

import { ApplicationsTab, CustomerDetailsData, CustomerObjects, Documents, PaymentsTab } from 'features/customerDetails';

interface IProps {
  title: string;
}

export const CustomerDetails: FC<IProps> = ({ title }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') || 'customer-data';

  const items: TabsProps['items'] = [
    {
      key: 'customer-data',
      label: 'Данные',
      children: <CustomerDetailsData />
    },
    {
      key: 'customer-objects',
      label: 'Объекты',
      children: <CustomerObjects />
    },
    {
      key: 'customer-applications',
      label: 'Заявки',
      children: <ApplicationsTab />
    },
    {
      key: 'customer-documents',
      label: 'Документы',
      children: <Documents />
    },
    {
      key: 'customer-payments',
      label: 'Платежи',
      children: <PaymentsTab />
    }
  ];

  const onTabChange = (key: string) => {
    setSearchParams(
      (prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('tab', key);
        newParams.delete('tab-detail');
        return newParams;
      },
      { replace: true }
    );
  };

  return (
    <DashboardLayout title={title}>
      <div className='customer-details'>
        <Row justify='end' className='actions'>
          <Button icon={<DownloadOutlined />} iconPosition='end'>
            PDF
          </Button>
          <Row className='buttons'>
            <Button icon={<EditOutlined />} />
            <Button icon={<DeleteOutlined className='delete-button' />} />
          </Row>
        </Row>
        <Tabs defaultActiveKey={tab} items={items} onTabClick={onTabChange} />
      </div>
    </DashboardLayout>
  );
};
