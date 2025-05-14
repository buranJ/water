import { FC, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Button, Card, Col, Flex, List, Row, Space, Tabs, Typography, Upload, UploadFile } from 'antd';
import { UploadChangeParam, UploadProps } from 'antd/es/upload';
import { ClockCircleTwoTone, CloseCircleTwoTone, DownloadOutlined, FileOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { MyModal } from './MyModal';

const { TabPane } = Tabs;
const { Title, Text } = Typography;

interface IProps {
  title: string;
}

export const TuDetails: FC<IProps> = ({ title }) => {
  const { id } = useParams();

  const isArchitectureDisabled = false;
  const isDocumentsDisabled = false;
  const isAccountingDisabled = false;

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [uploadFileList, setUploadFileList] = useState<UploadFile<File>[]>([]);

  const handleRejectClick = () => {
    setIsModalVisible(true);
  };

  const handleUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile<File>>) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file: UploadFile<File>) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  return (
    <DashboardLayout title={`${title} ${id}`}>
      <Flex justify='end' align='center' gap={24} style={{ marginBottom: 16 }}>
        <Link to='/dashboard/technical-conditions/history-of-loads'>История увеличения нагрузок</Link>
        <Link to='/change'>Изменить данные ТУ</Link>
        <Button icon={<DownloadOutlined />}>Скачать ТУ</Button>
        <Button icon={<PlusOutlined />}>Добавить нагрузку</Button>
        <Button danger onClick={handleRejectClick}>
          Отказать ТУ
        </Button>
      </Flex>

      <Row gutter={24}>
        <Col span={16}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab='Данные' key='1'>
              <Card style={{ marginBottom: 24 }}>
                <Title level={4}>Наименование объекта</Title>
                <Text>
                  3-х эт. гостиница с цокольным этажом и эксплуатируемой кровлей на собственной территории (без права перепрофилирования под
                  многоквартирный жилой дом)
                </Text>
              </Card>

              <Card style={{ marginBottom: 24 }}>
                <Title level={4}>Заказчик</Title>
                <Text>Смаилов А.Э.</Text>
                <Title level={4} style={{ marginTop: 16 }}>
                  Место нахождения объекта
                </Title>
                <Text>ул. Турусбекова, 185</Text>
                <Title level={4} style={{ marginTop: 16 }}>
                  Требуемое количество водопроводной воды
                </Title>
                <Text>16.5000 м³/сут</Text>
                <Title level={4} style={{ marginTop: 16 }}>
                  Требуемый свободный напор
                </Title>
                <Text>22.00 м.вод.ст</Text>
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
                <Text>
                  3-х эт. гостиница с цокольным этажом и эксплуатируемой кровлей на собственной территории (без права перепрофилирования под
                  многоквартирный жилой дом)
                </Text>
              </Card>

              <Card>
                <Title level={4}>Канализация</Title>
                <Text>
                  3-х эт. гостиница с цокольным этажом и эксплуатируемой кровлей на собственной территории (без права перепрофилирования под
                  многоквартирный жилой дом)
                </Text>
              </Card>
            </TabPane>

            <TabPane tab='Архитектура' key='2' disabled={isArchitectureDisabled}></TabPane>
            <TabPane tab='Документы' key='3' disabled={isDocumentsDisabled}></TabPane>
            <TabPane tab='Бухгалтерия' key='4' disabled={isAccountingDisabled}></TabPane>
          </Tabs>
        </Col>

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
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <CloseCircleTwoTone
                        twoToneColor='#E63A3A'
                        style={{ marginRight: 8, cursor: 'pointer' }}
                        onClick={() => handleRemoveFile(item)}
                      />
                      <FileOutlined style={{ color: '#327BE8' }} />
                      {item.name}
                    </Space>
                  </List.Item>
                )}
              />
            )}

            <div style={{ marginTop: 16, width: '100%', textAlign: 'center' }}>
              <Upload multiple showUploadList={false} fileList={uploadFileList} beforeUpload={() => false} onChange={handleUploadChange}>
                <Button type='primary' block icon={<UploadOutlined />}>
                  Загрузить
                </Button>
              </Upload>
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
      </Row>

      <MyModal onClose={handleModalCancel} visible={isModalVisible} />
    </DashboardLayout>
  );
};
