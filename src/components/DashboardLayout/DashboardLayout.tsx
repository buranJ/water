import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Flex, Layout, Menu, MenuProps, theme, Typography } from 'antd';
import { BellOutlined, CreditCardOutlined, LeftOutlined, TeamOutlined } from '@ant-design/icons';
import logo from 'assets/icons/logo.svg';
import ApplicationIcon from 'assets/icons/sidebar/applications.svg?react';
import ArchitectureIcon from 'assets/icons/sidebar/architecture.svg?react';
import BuildingIcon from 'assets/icons/sidebar/building.svg?react';
import ComputingIcon from 'assets/icons/sidebar/computing.svg?react';
import ExportIcon from 'assets/icons/sidebar/export.svg?react';
import GeoportalIcon from 'assets/icons/sidebar/geoportal.svg?react';
import TuIcon from 'assets/icons/sidebar/tu.svg?react';
import './styles.scss';

import clsx from 'clsx';

const { Header, Sider, Content } = Layout;

interface Props {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const items: MenuProps['items'] = [
    {
      key: '/dashboard/geo',
      icon: <GeoportalIcon />,
      label: 'Геопортал'
    },
    {
      key: '/dashboard/technical-conditions',
      icon: <TuIcon />,
      label: 'ТУ'
    },
    {
      key: '/dashboard/objects',
      icon: <BuildingIcon />,
      label: 'Объекты'
    },
    {
      key: '/dashboard/applications',
      icon: <ApplicationIcon />,
      label: 'Заявки'
    },
    {
      key: '/dashboard/customers',
      icon: <TeamOutlined />,
      label: 'Заказчики'
    },
    {
      key: '/dashboard/bills',
      icon: <CreditCardOutlined />,
      label: 'Счета и платежи'
    },
    {
      key: '/dashboard/architecture',
      icon: <ArchitectureIcon />,
      label: 'Архитектура'
    },
    {
      key: '/dashboard/export',
      icon: <ExportIcon />,
      label: 'Экспорт'
    },
    {
      key: '/dashboard/formulas',
      icon: <ComputingIcon />,
      label: 'Формулы'
    }
  ];

  return (
    <Layout className='dashboard' style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(collapsed) => setCollapsed(collapsed)}
        width={200}
        style={{ background: '#001529' }}
      >
        <Flex
          className='dashboard__logo'
          wrap='nowrap'
          align='center'
          gap={8}
          style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 600 }}
        >
          <img src={logo} alt='Logo' />{' '}
          <Typography.Text className={clsx('dashboard__logo-text', { hidden: collapsed })}>Бишкексууканал</Typography.Text>
        </Flex>
        <Menu theme='dark' mode='inline' selectedKeys={[location.pathname]} items={items} onClick={({ key }) => navigate(key)} />
      </Sider>

      <Layout>
        <Header style={{ background: colorBgContainer, paddingLeft: 24 }}>
          <Flex justify='space-between' align='center' gap={16}>
            <Flex align='center' gap={8}>
              {window.location.pathname.split('/').length > 3 && <LeftOutlined onClick={() => navigate(-1)} />}
              <h2 style={{ margin: 0 }}>{title || 'Панель управления'}</h2>
            </Flex>
            <div>
              <Button icon={<BellOutlined />} />
            </div>
          </Flex>
        </Header>
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ padding: 24, background: colorBgContainer, minHeight: '80vh' }}>{children}</div>
        </Content>
      </Layout>
    </Layout>
  );
};
