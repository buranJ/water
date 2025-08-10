import { FC } from 'react';
import { useLocation } from 'react-router';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space, Table } from 'antd';
import { DeleteOutlined, DownOutlined, RetweetOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { DashboardLayout } from 'components/DashboardLayout';

import type { ReportsResponse } from 'api/Reports.api';
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
  {
    title: 'Дата',
    dataIndex: 'created_at',
    key: 'created_at',
    render: (text: string) => (text ? dayjs(text).format('DD.MM.YYYY HH:mm') : '-')
  },
  { title: 'Тип', dataIndex: 'report_type_display', key: 'report_type_display' },
  { title: 'Название', dataIndex: 'title', key: 'title', render: (text: string) => text || '-' },
  {
    title: 'Файл',
    dataIndex: 'pdf_file',
    key: 'pdf_file',
    render: (url: string | undefined) =>
      url ? (
        <a href={url} target='_blank' rel='noopener noreferrer'>
          PDF
        </a>
      ) : (
        '-'
      )
  },
  {
    title: 'Действия',
    key: 'actions',
    render: (_: unknown, record: { key: number }) => (
      <Space>
        <Button
          icon={<RetweetOutlined />}
          shape='circle'
          onClick={() => {
            // Временно логируем действие
            // eslint-disable-next-line no-console
            console.log('re-export', record);
          }}
        />
        <Button
          icon={<DeleteOutlined />}
          shape='circle'
          danger
          onClick={() => {
            // Временно логируем действие
            // eslint-disable-next-line no-console
            console.log('delete', record);
          }}
        />
      </Space>
    )
  }
];

/* rows будут получены из state при навигации со страницы экспорта */

interface ExportDataHistoryProps {
  title: string;
}

const ExportDataHistory: FC<ExportDataHistoryProps> = ({ title }) => {
  const location = useLocation() as { state?: { reports?: ReportsResponse } };
  const rows =
    location.state?.reports?.results?.map((r) => ({
      key: r.id,
      ...r
    })) || [];

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
        <Table columns={tableColumns} dataSource={rows} pagination={false} />
      </div>
    </DashboardLayout>
  );
};

export default ExportDataHistory;
