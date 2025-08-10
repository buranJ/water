import { FC, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Alert, Button, Card, Col, Flex, List, Progress, Row, Space, Spin, Tabs, TabsProps, Typography } from 'antd';
import {
  CheckCircleTwoTone,
  ClockCircleTwoTone,
  CloseCircleTwoTone,
  DownloadOutlined,
  FileOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { AccountingTab } from 'components/AccountingTab/AccountingTab';
import { DashboardLayout } from 'components/DashboardLayout';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { MyModal } from './MyModal';
import { Architecture } from './Tabs';

import { useGetUserInfoQuery } from 'api/Auth.api';
import { useGetFoldersQuery } from 'api/FileFolder.api';
import { useGetTyByIdQuery } from 'api/Ty.api';
import { t } from 'i18next';

const { Title, Text } = Typography;

interface IProps {
  title: string;
}

export const TuDetails: FC<IProps> = ({ title }) => {
  const userQuery = useGetUserInfoQuery();
  const { id } = useParams<{ id: string }>();
  const foldersQuery = useGetFoldersQuery({ ty_id: id || '' });

  const {
    data: objectData,
    isLoading,
    isError
  } = useGetTyByIdQuery(
    {
      tyId: id || ''
    },
    {
      skip: !id
    }
  );

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('1');

  const handleRejectClick = (): void => {
    setIsModalVisible(true);
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
  };

  const handleTabChange = (key: string): void => {
    setActiveTab(key);
  };

  const statusRender = (status: IStatus6b3Enum) => {
    switch (status) {
      case 'active':
        return <Text type='warning'>{t('tuDetails.status.active')}</Text>;
      case 'inactive':
        return <Text type='success'>{t('tuDetails.status.inactive')}</Text>;
      case 'archived':
        return <Text type='danger'>{t('tuDetails.status.archived')}</Text>;
    }
  };

  const stageRender = (stage: IStageEnum) => {
    switch (stage) {
      case 'draft':
        return <Text type='secondary'>{t('tuDetails.stage.draft')}</Text>;
      case 'review':
        return <Text type='warning'>{t('tuDetails.stage.review')}</Text>;
      case 'approved':
        return <Text type='success'>{t('tuDetails.stage.approved')}</Text>;
      case 'done':
        return <Text type='success'>{t('tuDetails.stage.done')}</Text>;
      default:
        return <Text type='secondary'>{t('tuDetails.stage.unknown')}</Text>;
    }
  };

  const renderDataContent = () => (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.objectName')}</Title>
        <Text>{objectData?.object_name || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.applicationInfo')}</Title>
        <Text strong>{t('tuDetails.labels.requestNumber')}</Text> <Text>{objectData?.request_number || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.requestDate')}</Text> <Text>{(objectData?.request_date as string) || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.requestSource')}</Text> <Text>{objectData?.request_source || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.inn')}</Text> <Text>{objectData?.eni || '—'}</Text>
        <br />
        {objectData?.status && (
          <Space>
            <Text strong>{t('common.status')}</Text>
            <Text>{statusRender(objectData?.status) || '—'}</Text>
          </Space>
        )}
        <br />
        {objectData?.stage && (
          <Space>
            <Text strong>{t('tuDetails.labels.stage')}</Text>
            <Text>{stageRender(objectData?.stage) || '—'}</Text>
          </Space>
        )}
      </Card>

      {/* Новый блок: Дополнительные характеристики */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.additionalCharacteristics')}</Title>
        <Text strong>{t('tuDetails.labels.connectionTarget')}</Text> <Text>{objectData?.connection_target || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.collector')}</Text> <Text>{objectData?.collector || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireFighting')}</Text> <Text>{objectData?.fire_fighting || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput1')}</Text> <Text>{objectData?.fire_input_1 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput2')}</Text> <Text>{objectData?.fire_input_2 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.notes')}</Text> <Text>{objectData?.notes || '—'}</Text>
      </Card>

      {/* Новый блок: Оплата */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.payment')}</Title>
        <Text strong>{t('tuDetails.labels.paymentInvoiceNumber')}</Text> <Text>{objectData?.payment_invoice_number || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentPaper')}</Text>{' '}
        <Text>
          {objectData?.payment_paper || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentConnection')}</Text>{' '}
        <Text>
          {objectData?.payment_connection || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentAmount')}</Text>{' '}
        <Text>
          {objectData?.payment_amount || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentDeadline')}</Text> <Text>{(objectData?.payment_deadline as string) || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.customer')}</Title>
        <Text>{objectData?.customer.full_name}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.objectLocation')}
        </Title>
        <Text>{objectData?.address}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.waterRequired')}
        </Title>
        <Text>
          {objectData?.water_required} {t('tuDetails.units.m3PerDay')}
        </Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.pressureRequired')}
        </Title>
        <Text>
          {objectData?.pressure_required} {t('tuDetails.units.mWaterCol')}
        </Text>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <Row justify='space-between' align='middle'>
          <Title level={4}>{t('tuDetails.titles.geoportalRequest')}</Title>
          <Button type='primary'>{t('tuDetails.actions.request')}</Button>
        </Row>
        <div
          style={{
            textAlign: 'center',
            backgroundColor: '#F2F3FE',
            border: '1px solid #D9D9D9',
            padding: 24,
            borderRadius: 8,
            marginTop: 16
          }}
        >
          <Title level={5}>{t('tuDetails.titles.savedGeoportalRequest')}</Title>
          <Text type='secondary'>{t('tuDetails.autoLoaded')}</Text>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.waterSupply')}</Title>
        <Text>{objectData?.water_pipe || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card>
        <Title level={4}>{t('tuDetails.titles.sewer')}</Title>
        <Text>{objectData?.sewer || t('tuDetails.notSpecified')}</Text>
      </Card>
    </>
  );

  const commonFolders = useMemo(
    () => [...(foldersQuery.data?.custom || []), ...(foldersQuery.data?.required || [])],
    [foldersQuery.data?.custom, foldersQuery.data?.required]
  );

  const requireArchitectureDocs = useMemo(
    () => foldersQuery.data?.required.filter((item) => item.category.title.toLowerCase() === 'архитектура') || [],
    [foldersQuery.data?.required]
  );

  const requireDocumentsDocs = useMemo(
    () => foldersQuery.data?.required.filter((item) => item.category.title.toLowerCase() === 'документы') || [],
    [foldersQuery.data?.required]
  );

  const customArchitectureDocs = useMemo(
    () => foldersQuery.data?.custom.filter((item) => item.category.title.toLowerCase() === 'архитектура') || [],
    [foldersQuery.data?.custom]
  );

  const customDocumentsDocs = useMemo(
    () => foldersQuery.data?.custom.filter((item) => item.category.title.toLowerCase() === 'документы') || [],
    [foldersQuery.data?.custom]
  );

  const dynamicTabs =
    userQuery.data?.user.allowed_categories?.map((category, index) => {
      let content: React.ReactNode = <Text>{t('tuDetails.contentNotImplemented', { title: category.title })}</Text>;

      switch (category.title.toLowerCase()) {
        case 'архитектура':
          content = (
            <Architecture categoryId={category.id} documentsRequire={requireArchitectureDocs} documentsCustom={customArchitectureDocs} />
          );
          break;
        case 'документы':
          content = <Architecture categoryId={category.id} documentsRequire={requireDocumentsDocs} documentsCustom={customDocumentsDocs} />;
          break;
        case 'бухгалтерия':
          content = id ? <AccountingTab technicalConditionId={id} /> : null;
          break;
        default:
          break;
      }

      return {
        key: `dynamic-${index + 2}`,
        label: category.title,
        children: content
      };
    }) || [];

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('tuDetails.tabs.data'),
      children: objectData ? renderDataContent() : null
    },
    ...dynamicTabs
  ];

  if (isLoading) {
    return (
      <DashboardLayout title={`${t(title)} ${id}`}>
        <Flex justify='center' align='center' style={{ minHeight: 200 }}>
          <Spin size='large' />
        </Flex>
      </DashboardLayout>
    );
  }

  if (isError || !objectData) {
    return (
      <DashboardLayout title={`${t(title)} ${id}`}>
        <Alert message={t('tuDetails.loadError')} description={t('tuDetails.loadErrorDescription')} type='error' showIcon />
      </DashboardLayout>
    );
  }

  const folders = foldersQuery.data; // где foldersQuery.data имеет тип IFileFolderFolder

  // Подсчитываем общее число необходимых папок
  const totalRequiredFolders = folders?.required?.length ?? 0;

  // Подсчитываем, сколько из них имеют filled === true
  const filledRequiredFolders = folders?.required?.filter((item) => item.filled).length ?? 0;

  // Вычисляем процент (если totalRequiredFolders > 0)
  const percent = totalRequiredFolders > 0 ? (filledRequiredFolders / totalRequiredFolders) * 100 : 0;

  return (
    <DashboardLayout title={`${t(title)} ${id}`}>
      {activeTab === '1' && (
        <Flex justify='end' align='center' gap={24} style={{ marginBottom: 16 }}>
          <Link to='/dashboard/technical-conditions/history-of-loads'>{t('routers.historyOfLoads')}</Link>
          <Link to={`/dashboard/ty/${id}/change-history`}>{t('tuDetails.actions.changeTuData')}</Link>
          <Button icon={<DownloadOutlined />}>{t('tuDetails.actions.downloadTu')}</Button>
          <Button icon={<PlusOutlined />}>{t('historyOfLoads.addLoad')}</Button>
          <Button danger onClick={handleRejectClick}>
            {t('tuDetails.actions.rejectTu')}
          </Button>
        </Flex>
      )}

      <Row gutter={24}>
        <Col span={activeTab === '1' ? 16 : 24}>
          <Tabs defaultActiveKey='1' items={tabItems} onChange={handleTabChange} />
        </Col>
        {activeTab === '1' && (
          <Col span={8}>
            <Card style={{ marginBottom: 16 }}>
              <Title level={4}>{t('tuDetails.titles.otherDocuments')}</Title>
              <Progress percent={percent} status={percent < 100 ? 'exception' : 'success'} />

              <Text type='secondary'>{t('tuDetails.hint.uploadToFinishTu')}</Text>
              {commonFolders.length > 0 && (
                <List
                  style={{ margin: '16px 0' }}
                  bordered
                  dataSource={commonFolders}
                  renderItem={(item) => {
                    return (
                      <List.Item>
                        <Space>
                          {item.filled ? (
                            <CheckCircleTwoTone twoToneColor='#6be275ff' style={{ marginRight: 8 }} />
                          ) : (
                            <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ marginRight: 8 }} />
                          )}
                          <FileOutlined style={{ color: '#327BE8' }} />
                          {item.title}
                        </Space>
                      </List.Item>
                    );
                  }}
                />
              )}

              <div style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>
                <Button type='primary' block>
                  {t('common.upload')}
                </Button>
              </div>
            </Card>

            <Card>
              <Title level={4}>{t('tuDetails.titles.confirmationAct')}</Title>
              <Row justify='space-between' align='middle'>
                <Text>{t('common.pending')}</Text>
                <ClockCircleTwoTone twoToneColor='#327BE8' />
              </Row>
            </Card>
          </Col>
        )}
      </Row>

      <MyModal onClose={handleModalCancel} visible={isModalVisible} />
    </DashboardLayout>
  );
};
