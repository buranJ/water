import { FC, useMemo } from 'react';
import { Button, Table, Tabs } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { Pagination } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { data, getColumns, tabItems } from './Applications.helpers';

interface IProps {
  title: string;
}

export const Applications: FC<IProps> = ({ title }) => {
  const handleFilterChange = (filter: unknown) => {
    console.log(filter);
  };

  const onAddClick = () => {
    console.log('Add button clicked');
  };

  const onDownloadClick = () => {
    console.log('Download button clicked');
  };

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record, action) => {
        switch (action) {
          case 'create':
            console.log('Delete action clicked for record:', record);
            break;
          case 'reject':
            console.log('Customer details action clicked for record:', record);
            break;
          case 'approve':
            console.log('Registration date action clicked for record:', record);
            break;
        }
      }
    });
  }, []);

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
      <Pagination />
    </DashboardLayout>
  );
};
