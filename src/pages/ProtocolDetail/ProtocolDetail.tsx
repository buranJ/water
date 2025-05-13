import { FC, useState } from 'react';
import { Button, Card, Col, List, Row, Space, Tabs, Typography, Upload, UploadFile, UploadProps } from 'antd';
import { ClockCircleTwoTone, CloseCircleTwoTone, DownloadOutlined, EditOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface IProps {
  title: string;
}

export const ProtocolDetail: FC<IProps> = ({ title }) => {
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([]);

  const handleUploadChange: UploadProps['onChange'] = (info) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file: UploadFile) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const isProtocolDisabled = false;
  const isPaymentsDisabled = false;

  return (
    <DashboardLayout title={title}>
      <Row gutter={24}>
        <Col span={16}>
          <Tabs defaultActiveKey='1'>
            <TabPane tab='Протокол' key='1' disabled={isProtocolDisabled}>
              <Row justify='end' style={{ marginBottom: 16 }}>
                <Col>
                  <Space>
                    <Button type='primary' icon={<EditOutlined />}>
                      Изменить
                    </Button>
                    <Button icon={<DownloadOutlined />}>Скачать протокол</Button>
                  </Space>
                </Col>
              </Row>
              <Card style={{ marginBottom: 24 }}>
                <Row>
                  <Col span={12}>
                    <Title level={4} style={{ marginBottom: 16 }}>
                      МП "Бишкектеплосеть"
                    </Title>
                  </Col>
                  <Col span={12} style={{ textAlign: 'right' }}>
                    <Button size='small' danger>
                      На вынос
                    </Button>
                  </Col>
                </Row>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>Ст‑ть подключ. ВиК сом(без НДС)</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Space>
                        <Text>10080KGZ</Text>
                      </Space>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>ТУ водопровод</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text>496KGZ</Text>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Row>
                    <Col span={12}>
                      <Text>ТУ канализация</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text>496KGZ</Text>
                    </Col>
                  </Row>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Row>
                    <Col span={12}>
                      <Title level={4} style={{ margin: 0 }}>
                        Всего (без НДС)
                      </Title>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Title level={5} style={{ margin: 0 }}>
                        992KGZ
                      </Title>
                    </Col>
                  </Row>
                </div>
              </Card>

              <div>Дополнительный текст или контент протокола...</div>
            </TabPane>

            <TabPane tab='Платежи' key='2' disabled={isPaymentsDisabled}>
              <Card>
                <Title level={4}>Какие-то данные по платежам</Title>
                <Text>Заглушка под контент вкладки Платежи</Text>
              </Card>
            </TabPane>
          </Tabs>
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>Счет на оплату</Title>
            <Row justify={'space-between'}>
              <Text>В ожидании</Text>
              <ClockCircleTwoTone twoToneColor='#327BE8' />
            </Row>
            <Button style={{ marginTop: 16 }} block>
              Сгенерировать счет на оплату
            </Button>
          </Card>

          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>Загрузить чек об оплате</Title>
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
        </Col>
      </Row>
    </DashboardLayout>
  );
};
