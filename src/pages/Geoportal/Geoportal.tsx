import { FC } from 'react';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space } from 'antd';
import { DownOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';

import { DashboardLayout } from 'components';

const items: MenuProps['items'] = [
  {
    label: '1st menu item',
    key: '1',
    icon: <UserOutlined />
  },
  {
    label: '2nd menu item',
    key: '2',
    icon: <UserOutlined />
  }
];

const handleMenuClick: MenuProps['onClick'] = (e) => {
  message.info('Click on menu item.');
  console.log('click', e);
};

const menuProps = {
  items,
  onClick: handleMenuClick
};

export const Geoportal: FC<{ title: string }> = ({ title }) => {
  return (
    <DashboardLayout title={title}>
      <Flex gap={12}>
        <Input addonBefore={<SearchOutlined />} placeholder='large size' />
        <Dropdown menu={menuProps}>
          <Button>
            <Space>
              По типу
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Dropdown menu={menuProps}>
          <Button>
            <Space>
              По статусу
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Dropdown menu={menuProps}>
          <Button>
            <Space>
              По дате
              <DownOutlined />
            </Space>
          </Button>
        </Dropdown>
        <Button type='primary' icon={<PlusOutlined />}>
          Добавить
        </Button>
      </Flex>
    </DashboardLayout>
  );
};
