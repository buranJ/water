import { FC } from 'react';
import { Button, Checkbox, Col, DatePicker, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';

import { DashboardLayout } from 'components/DashboardLayout';

const { Title } = Typography;
const { Option } = Select;

const ExportData: FC<{ title: string }> = ({ title }) => {
  const [form] = Form.useForm();

  const onFinish = (values: FormData) => {
    console.log('Форма отправлена:', values);
  };

  return (
    <DashboardLayout title={title}>
      <Form form={form} layout='vertical' onFinish={onFinish} style={{ background: '#fff', borderRadius: 8 }}>
        <Title level={4} style={{ marginBottom: 24 }}>
          Выберите параметры и выгрузите необходимые данные
        </Title>

        {/* ПАРАМЕТРЫ ВЫБОРКИ */}
        <Form.Item label='Типы данных' name='dataType' rules={[{ required: true, message: 'Выберите раздел' }]}>
          <Select placeholder='Выберите раздел'>
            <Option value='orders'>Заказы</Option>
            <Option value='clients'>Клиенты</Option>
            <Option value='requests'>Запросы</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Статусы' name='statuses' rules={[{ required: false }]}>
              <Select placeholder='Все'>
                <Option value='all'>Все</Option>
                <Option value='new'>Новые</Option>
                <Option value='progress'>В работе</Option>
                <Option value='done'>Завершённые</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Ответственный' name='responsible' rules={[{ required: false }]}>
              <Select placeholder='ФИО или отдел'>
                <Option value='departmentA'>Отдел A</Option>
                <Option value='departmentB'>Отдел B</Option>
                <Option value='ivanov'>Иванов И.И.</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Дата от' name='dateFrom' rules={[{ required: false }]}>
              <DatePicker placeholder='10-03-2025' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Дата до' name='dateTo' rules={[{ required: false }]}>
              <DatePicker placeholder='10-04-2025' style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {/* ПОЛЯ ДЛЯ ЭКСПОРТА */}
        <Form.Item label='Выберите поля для экспорта' style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox>Дата регистрации</Checkbox>
            <Checkbox>Заказчик</Checkbox>
            <div style={{ marginLeft: 24 }}>
              <Checkbox defaultChecked>ОсОО "Сайрус"</Checkbox>
            </div>
            <Checkbox defaultChecked>Право на добавление запроса</Checkbox>

            <Checkbox>Заказчик</Checkbox>
            <div style={{ marginLeft: 24 }}>
              <Checkbox defaultChecked>ОсОО "Сайрус"</Checkbox>
            </div>
            <Checkbox defaultChecked>Право на добавление запроса</Checkbox>
            <Checkbox defaultChecked>Право на добавление запроса</Checkbox>

            <Checkbox defaultChecked>Excel (.xlsx)</Checkbox>
            <Checkbox>CSV (.csv)</Checkbox>
            <Checkbox>PDF (для отчётов)</Checkbox>
          </div>
        </Form.Item>

        {/* КНОПКИ ВНИЗУ */}
        <Row justify='end' gutter={16} style={{ marginTop: 24 }}>
          <Col>
            <Button type='default'>История экспорта</Button>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit' icon={<DownloadOutlined />}>
              Экспорт
            </Button>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default ExportData;
