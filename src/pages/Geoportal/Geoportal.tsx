import { FC } from 'react';
import type { MenuProps } from 'antd';
import { Flex, message } from 'antd';
import {  UserOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components';
import { FilterBar } from 'components';
import { FilterValues } from 'components/FilterBar/FilterBar';

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
  const handleFilterChange = (values: FilterValues) => {
    console.log('Filter values:', values);
  };
  return (
    <DashboardLayout title={title}>
      <Flex gap={12}>
        <FilterBar onFilterChange={handleFilterChange}/>
      </Flex>
    </DashboardLayout>
  );
};
