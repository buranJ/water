import { FC, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Alert, Button, Card, Col, Flex, List, Row, Space, Spin, Tabs, TabsProps, Typography, UploadFile } from 'antd';
import { ClockCircleTwoTone, CloseCircleTwoTone, DownloadOutlined, FileOutlined, PlusOutlined } from '@ant-design/icons';
import { AccountingTab } from 'components/AccountingTab/AccountingTab';
import { DashboardLayout } from 'components/DashboardLayout';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { MyModal } from './MyModal';

import { useGetUserInfoQuery } from 'api/Auth.api';
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
  const userQuery = useGetUserInfoQuery();
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

  const statusRender = (status: IStatus6b3Enum) => {
    switch (status) {
      case 'active':
        return <Text type='warning'>Утверждено</Text>;
      case 'inactive':
        return <Text type='success'>Утверждено</Text>;
      case 'archived':
        return <Text type='danger'>В Архиве</Text>;
    }
  };

  const stageRender = (stage: IStageEnum) => {
    switch (stage) {
      case 'draft':
        return <Text type='secondary'>Черновик</Text>;
      case 'review':
        return <Text type='warning'>На рассмотрении</Text>;
      case 'approved':
        return <Text type='success'>Утверждено</Text>;
      case 'done':
        return <Text type='success'>Завершено</Text>;
      default:
        return <Text type='secondary'>Неизвестно</Text>;
    }
  };

  const renderDataContent = () => (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Наименование объекта</Title>
        <Text>{objectData?.object_name || 'Не указано'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Информация о заявке</Title>
        <Text strong>Номер заявки:</Text> <Text>{objectData?.request_number || '—'}</Text>
        <br />
        <Text strong>Дата заявки:</Text> <Text>{(objectData?.request_date as string) || '—'}</Text>
        <br />
        <Text strong>Источник запроса:</Text> <Text>{objectData?.request_source || '—'}</Text>
        <br />
        <Text strong>ИНН:</Text> <Text>{objectData?.eni || '—'}</Text>
        <br />
        {objectData?.status && (
          <Space>
            <Text strong>Статус:</Text>
            <Text>{statusRender(objectData?.status) || '—'}</Text>
          </Space>
        )}
        <br />
        {objectData?.stage && (
          <Space>
            <Text strong>Этап:</Text>
            <Text>{stageRender(objectData?.stage) || '—'}</Text>
          </Space>
        )}
      </Card>

      {/* Новый блок: Дополнительные характеристики */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Дополнительные характеристики</Title>
        <Text strong>Объект подключения:</Text> <Text>{objectData?.connection_target || '—'}</Text>
        <br />
        <Text strong>Проход по улице:</Text> <Text>{objectData?.street_pass || '—'}</Text>
        <br />
        <Text strong>Коллектор:</Text> <Text>{objectData?.collector || '—'}</Text>
        <br />
        <Text strong>Пожаротушение:</Text> <Text>{objectData?.fire_fighting || '—'}</Text>
        <br />
        <Text strong>Пожарный ввод 1:</Text> <Text>{objectData?.fire_input_1 || '—'}</Text>
        <br />
        <Text strong>Пожарный ввод 2:</Text> <Text>{objectData?.fire_input_2 || '—'}</Text>
        <br />
        <Text strong>Примечания:</Text> <Text>{objectData?.notes || '—'}</Text>
      </Card>

      {/* Новый блок: Оплата */}
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Оплата</Title>
        <Text strong>Номер счёта:</Text> <Text>{objectData?.payment_invoice_number || '—'}</Text>
        <br />
        <Text strong>Сумма за бумажную работу:</Text> <Text>{objectData?.payment_paper || '—'} сом</Text>
        <br />
        <Text strong>Сумма за подключение:</Text> <Text>{objectData?.payment_connection || '—'} сом</Text>
        <br />
        <Text strong>Итого к оплате:</Text> <Text>{objectData?.payment_amount || '—'} сом</Text>
        <br />
        <Text strong>Крайний срок оплаты:</Text> <Text>{(objectData?.payment_deadline as string) || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>Заказчик</Title>
        <Text>{objectData?.customer.full_name}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Место нахождения объекта
        </Title>
        <Text>{objectData?.address}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Требуемое количество водопроводной воды
        </Title>
        <Text>{objectData?.water_required} м³/сут</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          Требуемый свободный напор
        </Title>
        <Text>{objectData?.pressure_required} м.вод.ст</Text>
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
        <Text>{objectData?.water_pipe || 'Не указано'}</Text>
      </Card>

      <Card>
        <Title level={4}>Канализация</Title>
        <Text>{objectData?.sewer || 'Не указано'}</Text>
      </Card>
    </>
  );

  const dynamicTabs =
    userQuery.data?.user.allowed_categories?.map((category, index) => {
      let content: React.ReactNode = <Text>Контент для "{category.title}" пока не реализован</Text>;

      switch (category.title.toLowerCase()) {
        case 'архитектура':
          content = <div>Содержимое вкладки Архитектура</div>;
          break;
        case 'документы':
          content = <div>Содержимое вкладки Документы</div>;
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
      label: 'Данные',
      children: objectData ? renderDataContent() : null
    },
    ...dynamicTabs
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
