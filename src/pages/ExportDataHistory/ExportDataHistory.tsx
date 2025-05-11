// src/pages/ExportDataHistory/index.tsx
import { FC } from 'react';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space, Table } from 'antd';
import { DeleteOutlined, DownOutlined, RetweetOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

import { DashboardLayout } from 'components/DashboardLayout';

// Dropdown menu items
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
  { title: 'Дата', dataIndex: 'date', key: 'date' },
  { title: 'Сотрудник', dataIndex: 'employee', key: 'employee' },
  { title: 'Тип данных', dataIndex: 'dataType', key: 'dataType' },
  { title: 'Формат', dataIndex: 'format', key: 'format' },
  {
    title: 'Действия',
    key: 'actions',
    render: (_: number, record: { key: number; date: string; employee: string; dataType: string; format: string }) => (
      <Space>
        <Button icon={<RetweetOutlined />} shape='circle' onClick={() => message.info(`Повторная выгрузка для #${record.key}`)} />
        <Button icon={<DeleteOutlined />} shape='circle' danger onClick={() => message.error(`Удалён элемент #${record.key}`)} />
      </Space>
    )
  }
];

const tableData = [
  {
    key: 1,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'ТУ',
    format: 'Excel (.xlsx)'
  },
  {
    key: 2,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'Заявки',
    format: 'CSV (.csv)'
  },
  {
    key: 3,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'Счет на оплату',
    format: 'PDF (для отчётов)'
  },
  {
    key: 4,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'ТУ',
    format: 'Excel (.xlsx)'
  },
  {
    key: 5,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'Заявки',
    format: 'CSV (.csv)'
  },
  {
    key: 6,
    date: '04-04-2025',
    employee: 'Атай Аманов',
    dataType: 'Счет на оплату',
    format: 'PDF (для отчётов)'
  }
];

interface ExportDataHistoryProps {
  title: string;
}

const ExportDataHistory: FC<ExportDataHistoryProps> = ({ title }) => {
  return (
    <DashboardLayout title={title}>
      <Flex gap={12}>
        <Input addonBefore={<SearchOutlined />} placeholder='Найти' size='large' />
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              По типу
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Dropdown menu={menuProps}>
          <Button size='large'>
            <Space>
              По статусу
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
