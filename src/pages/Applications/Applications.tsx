import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Table, Tabs } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { data, getColumns, tabItems, useRejectModal } from './Applications.helpers';

interface IProps {
  title: string;
}

export const Applications: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();

  const { openRejectModal, RejectModalComponent } = useRejectModal();

  const handleFilterChange = (filter: unknown) => {
    console.log(filter);
  };

  const onAddClick = () => {
    navigate('create');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'create':
            navigate('/dashboard/add-tu-forms');
            break;
          case 'reject':
            console.log('Customer details action clicked for record:', record);
            break;
          case 'approve':
            navigate(`/dashboard/application/approve/${record.id}`);
            break;
          case 'tuDetails':
            navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
        }
      },
      onReject: (record) => {
        openRejectModal(record);
      }
    });
  }, [openRejectModal]);

  return (
    <DashboardLayout title={title}>
      <FilterBar
        showAlphabet
        onFilterChange={handleFilterChange}
        actionButtons={
          <>
            <>
              <Button type='primary' icon={<PlusOutlined />} onClick={onAddClick}>
                Добавить
              </Button>
              <Button icon={<DownloadOutlined />} iconPosition='end' onClick={onDownloadClick}>
                PDF
              </Button>
            </>
          </>
        }
      />
      <Tabs items={tabItems} onChange={(value) => console.log(value)} />
      <Table bordered columns={columns} dataSource={data} scroll={{ x: 'max-content' }} pagination={false} />
      <RejectModalComponent />
    </DashboardLayout>
  );
};
