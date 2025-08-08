import { ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, Layout, Menu, MenuProps, theme, Typography } from 'antd';
import { BellOutlined, CreditCardOutlined, LeftOutlined, TeamOutlined } from '@ant-design/icons';
import arrow from 'assets/icons/arrow.svg';
import logo from 'assets/icons/logo.svg';
import ApplicationIcon from 'assets/icons/sidebar/applications.svg?react';
import ArchitectureIcon from 'assets/icons/sidebar/architecture.svg?react';
import BuildingIcon from 'assets/icons/sidebar/building.svg?react';
import ComputingIcon from 'assets/icons/sidebar/computing.svg?react';
import ExportIcon from 'assets/icons/sidebar/export.svg?react';
import GeoportalIcon from 'assets/icons/sidebar/geoportal.svg?react';
import TuIcon from 'assets/icons/sidebar/tu.svg?react';
import avatar from 'assets/images/avatar.png';
import './styles.scss';

import { useGetUserPermissionsQuery } from 'api/Auth.api';
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
  const { t } = useTranslation();

  const {
    token: { colorBgContainer }
  } = theme.useToken();

  const { data: permissionsData } = useGetUserPermissionsQuery();
  const userPermissions = permissionsData?.permissions || [];

  const hasPermission = (codename: string) => userPermissions.some((p) => p.codename === codename);

  const siderStyle: React.CSSProperties = {
    overflow: 'auto',
    height: '100vh',
    position: 'sticky',
    insetInlineStart: 0,
    top: 0,
    bottom: 0,
    scrollbarWidth: 'thin',
    scrollbarGutter: 'stable',
    background: '#001529'
  };

  const items: MenuProps['items'] = [
    {
      key: '/dashboard/geo',
      icon: <GeoportalIcon />,
      label: t('dashboard.pages.geoportal')
    },
    hasPermission('view_technicalcondition') && {
      key: '/dashboard/technical-conditions',
      icon: <TuIcon />,
      label: t('dashboard.pages.ty')
    },
    hasPermission('view_entity') && {
      key: '/dashboard/objects',
      icon: <BuildingIcon />,
      label: t('dashboard.pages.objects')
    },
    hasPermission('view_application') && {
      key: '/dashboard/applications',
      icon: <ApplicationIcon />,
      label: t('dashboard.pages.applications')
    },
    hasPermission('view_customer') && {
      key: '/dashboard/customers',
      icon: <TeamOutlined />,
      label: t('dashboard.pages.customers')
    },
    hasPermission('view_payment') && {
      key: '/dashboard/bills',
      icon: <CreditCardOutlined />,
      label: t('dashboard.pages.bills')
    },
    hasPermission('view_architecture') && {
      key: '/dashboard/architecture',
      icon: <ArchitectureIcon />,
      label: t('dashboard.pages.architecture')
    },
    hasPermission('view_export') && {
      key: '/dashboard/export',
      icon: <ExportIcon />,
      label: t('dashboard.pages.export')
    },
    hasPermission('view_formula') && {
      key: '/dashboard/formulas',
      icon: <ComputingIcon />,
      label: t('dashboard.pages.formulas')
    }
  ] as MenuProps['items'];

  return (
    <Layout className='dashboard' style={{ minHeight: '100vh' }}>
      <Sider style={siderStyle} collapsible collapsed={collapsed} onCollapse={(collapsed) => setCollapsed(collapsed)} width={230}>
        <Flex vertical style={{ height: '100%' }}>
          <Flex
            className='dashboard__logo'
            wrap='nowrap'
            align='center'
            gap={8}
            style={{ color: '#fff', textAlign: 'center', padding: 16, fontWeight: 600 }}
          >
            <img src={logo} alt='Logo' />
            <Typography.Text className={clsx('dashboard__logo-text', { hidden: collapsed })}>{t('login.title')}</Typography.Text>
          </Flex>
          <Menu
            theme='dark'
            mode='inline'
            style={{ flex: 1 }}
            selectedKeys={[location.pathname]}
            items={items}
            onClick={({ key }) => navigate(key)}
          />
          <Flex
            onClick={() => navigate('/dashboard/profile')}
            align='center'
            gap={8}
            style={{
              backgroundColor: '#3787FF',
              borderRadius: 12,
              padding: 8,
              margin: 16,
              cursor: 'pointer',
              color: '#fff',
              overflow: 'hidden'
            }}
          >
            <img
              src={avatar}
              alt='avatar'
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            {!collapsed && (
              <div>
                <Typography.Text style={{ color: '#fff' }}>Кайрат Буранов</Typography.Text>
                <br />
                <Typography.Text style={{ color: '#d6e4ff', fontSize: 12 }}>ID 4433954</Typography.Text>
              </div>
            )}
            <img src={arrow} alt='#' />
          </Flex>
        </Flex>
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, paddingLeft: 24 }}>
          <Flex justify='space-between' align='center' gap={16}>
            <Flex align='center' gap={8}>
              {window.location.pathname.split('/').length > 3 && <LeftOutlined onClick={() => navigate(-1)} />}
              <h2 style={{ margin: 0 }}>{title || t('dashboard.panel')}</h2>
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
