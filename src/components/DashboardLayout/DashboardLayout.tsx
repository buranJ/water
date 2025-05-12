import { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Flex, Layout, Menu, theme } from 'antd';
import { BellOutlined, LeftOutlined, LogoutOutlined, NotificationOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import logo from 'assets/icons/logo.svg';

const { Header, Sider, Content } = Layout;

interface Props {
  children: ReactNode;
  title?: string;
}

export const DashboardLayout = ({ children, title }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const items = [
    {
      key: '/dashboard/geo',
      icon: null,
      label: 'Геопортал'
    },
    {
      key: '/dashboard/technical-conditions',
      icon: null,
      label: 'ТУ'
    },
    {
      key: '/dashboard/customers',
      icon: <TeamOutlined />,
      label: 'Заказчики'
    },
    {
      key: '/dashboard/employees',
      icon: <UserOutlined />,
      label: 'Сотрудники'
    },
    {
      key: '/dashboard/notifications',
      icon: <NotificationOutlined />,
      label: 'Уведомления'
    },
    {
      key: '/auth',
      icon: <LogoutOutlined />,
      label: 'Выйти'
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} style={{ background: '#001529' }}>
        <Flex align='center' gap={8} style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 600 }}>
          <img src={logo} alt='Logo' /> Бишкексууканал
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
