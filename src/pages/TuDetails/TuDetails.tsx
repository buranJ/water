import { FC, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Alert, Button, Card, Col, Flex, List, Row, Space, Spin, Tabs, TabsProps, Typography, UploadFile } from 'antd';
import { ClockCircleTwoTone, CloseCircleTwoTone, DownloadOutlined, FileOutlined, PlusOutlined } from '@ant-design/icons';
import { AccountingTab } from 'components/AccountingTab/AccountingTab';
import { DashboardLayout } from 'components/DashboardLayout';
import type { IGetTyById } from 'types/entities/tu';
import { MyModal } from './MyModal';

import { useGetTyByIdQuery } from 'api/Ty.api';

const { Title, Text } = Typography;

interface IProps {
  title: string;
}

interface IUploadFile extends UploadFile<File> {
  name: string;
  uid: string;
}

export const TuDetails: FC<IProps> = ({ title }) => {
  const { id } = useParams<{ id: string }>();

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

  const isArchitectureDisabled = false;
  const isDocumentsDisabled = false;
  const isAccountingDisabled = false;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [uploadFileList] = useState<IUploadFile[]>([
    {
      name: 'Документ 1',
      uid: '1'
    },
    {
      name: 'Документ 2',
      uid: '2'
    }
  ]);

  const handleRejectClick = (): void => {
    setIsModalVisible(true);
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
  };

  const handleTabChange = (key: string): void => {
    setActiveTab(key);
  };

  const renderDataContent = (data: IGetTyById) => (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Наименование объекта</Title>
        <Text>{data.object_name || 'Не указано'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Заказчик</Title>
        <Text>{data.customer.full_name}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Место нахождения объекта
        </Title>
        <Text>{data.address}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Требуемое количество водопроводной воды
        </Title>
        <Text>{data.water_required} м³/сут</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Требуемый свободный напор
        </Title>
        <Text>{data.pressure_required} м.вод.ст</Text>
      </Card>

      <div style={{ marginBottom: 24 }}>
        <Row justify='space-between' align='middle'>
          <Title level={4}>Запрос на создание геопортала</Title>
          <Button type='primary'>Запросить</Button>
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
          <Title level={5}>Сохраненный запрос на геопортал</Title>
          <Text type='secondary'>Автоматически загружено</Text>
        </div>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Водопровод</Title>
        <Text>{data.water_pipe || 'Не указано'}</Text>
      </Card>

      <Card>
        <Title level={4}>Канализация</Title>
        <Text>{data.sewer || 'Не указано'}</Text>
      </Card>
    </>
  );

  const tabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Данные',
      children: objectData ? renderDataContent(objectData) : null
    },
    {
      key: '2',
      label: 'Архитектура',
      disabled: isArchitectureDisabled,
      children: <div>Содержимое вкладки Архитектура</div>
    },
    {
      key: '3',
      label: 'Документы',
      disabled: isDocumentsDisabled,
      children: <div>Содержимое вкладки Документы</div>
    },
    {
      key: '4',
      label: 'Бухгалтерия',
      disabled: isAccountingDisabled,
      children: id ? <AccountingTab technicalConditionId={id} /> : null
    }
  ];

  if (isLoading) {
    return (
      <DashboardLayout title={`${title} ${id}`}>
        <Flex justify='center' align='center' style={{ minHeight: 200 }}>
          <Spin size='large' />
        </Flex>
      </DashboardLayout>
    );
  }

  if (isError || !objectData) {
    return (
      <DashboardLayout title={`${title} ${id}`}>
        <Alert message='Ошибка загрузки' description='Не удалось загрузить данные технических условий' type='error' showIcon />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`${title} ${id}`}>
      {activeTab === '1' && (
        <Flex justify='end' align='center' gap={24} style={{ marginBottom: 16 }}>
          <Link to='/dashboard/technical-conditions/history-of-loads'>История увеличения нагрузок</Link>
          <Link to='/change'>Изменить данные ТУ</Link>
          <Button icon={<DownloadOutlined />}>Скачать ТУ</Button>
          <Button icon={<PlusOutlined />}>Добавить нагрузку</Button>
          <Button danger onClick={handleRejectClick}>
            Отказать ТУ
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
              <Title level={4}>Другие документы</Title>
              <div
                style={{
                  backgroundColor: '#327BE8',
                  height: 8,
                  borderRadius: 4,
                  margin: '16px 0'
                }}
              />
              <Text type='secondary'>Загрузите соответствующий документ, чтобы завершить создание ТУ</Text>
              {uploadFileList.length > 0 && (
                <List
                  style={{ margin: '16px 0' }}
                  bordered
                  dataSource={uploadFileList}
                  renderItem={(item: IUploadFile) => (
                    <List.Item>
                      <Space>
                        <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ marginRight: 8 }} />
                        <FileOutlined style={{ color: '#327BE8' }} />
                        {item.name}
                      </Space>
                    </List.Item>
                  )}
                />
              )}
              <div style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>
                <Button type='primary' block>
                  Загрузить
                </Button>
              </div>
            </Card>

            <Card>
              <Title level={4}>Акт подтверждения</Title>
              <Row justify='space-between' align='middle'>
                <Text>В ожидании</Text>
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
