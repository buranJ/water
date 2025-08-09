import { FC } from 'react';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space, Table } from 'antd';
import { DeleteOutlined, DownOutlined, RetweetOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { t } from 'i18next';

const menuItems: MenuProps['items'] = [
  { label: '1st menu item', key: '1', icon: <UserOutlined /> },
  { label: '2nd menu item', key: '2', icon: <UserOutlined /> }
];

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const menuProps = {
  items: menuItems,
  onClick: handleMenuClick
};

const tableColumns = [
  { title: t('exportDataHistory.columns.date'), dataIndex: 'date', key: 'date' },
  { title: t('exportDataHistory.columns.employee'), dataIndex: 'employee', key: 'employee' },
  { title: t('exportDataHistory.columns.dataType'), dataIndex: 'dataType', key: 'dataType' },
  { title: t('exportDataHistory.columns.format'), dataIndex: 'format', key: 'format' },
  {
    title: t('exportDataHistory.columns.actions'),
    key: 'actions',
    render: (_: number, record: { key: number; date: string; employee: string; dataType: string; format: string }) => (
      <Space>
        <Button
          icon={<RetweetOutlined />}
          shape='circle'
          onClick={() => message.info(t('exportDataHistory.reexport', { id: record.key }))}
        />
        <Button
          icon={<DeleteOutlined />}
          shape='circle'
          danger
          onClick={() => message.error(t('exportDataHistory.deletedItem', { id: record.key }))}
        />
      </Space>
    )
  }
];

const tableData = [
  {
    key: 1,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.tu'),
    format: t('exportData.formats.excel')
  },
  {
    key: 2,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.requests'),
    format: t('exportData.formats.csv')
  },
  {
    key: 3,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.invoice'),
    format: t('exportData.formats.pdf')
  },
  {
    key: 4,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.tu'),
    format: t('exportData.formats.excel')
  },
  {
    key: 5,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.requests'),
    format: t('exportData.formats.csv')
  },
  {
    key: 6,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: t('exportDataHistory.dataTypes.invoice'),
    format: t('exportData.formats.pdf')
  }
];

interface ExportDataHistoryProps {
  title: string;
}

const ExportDataHistory: FC<ExportDataHistoryProps> = ({ title }) => {
  return (
    <DashboardLayout title={title}>
      <Flex gap={12}>
        <Input addonBefore={<SearchOutlined />} placeholder={t('filterBar.search')} size='large' />
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              {t('exportDataHistory.byType')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              {t('exportDataHistory.byStatus')}
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
      </Flex>

      <div style={{ marginTop: 24 }}>
        <Table columns={tableColumns} dataSource={tableData} pagination={false} />
      </div>
    </DashboardLayout>
  );
};

export default ExportDataHistory;
