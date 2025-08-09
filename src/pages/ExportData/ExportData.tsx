import { FC } from 'react';
import { Button, Checkbox, Col, DatePicker, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { t } from 'i18next';

const { Title } = Typography;
const { Option } = Select;

const ExportData: FC<{ title: string }> = ({ title }) => {
  const [form] = Form.useForm();

  const onFinish = (values: FormData) => {
    console.log(t('exportData.formSubmitted'), values);
  };

  return (
    <DashboardLayout title={title}>
      <Form form={form} layout='vertical' onFinish={onFinish} style={{ background: '#fff', borderRadius: 8 }}>
        <Title level={4} style={{ marginBottom: 24 }}>
          {t('exportData.title')}
        </Title>

        {/* ПАРАМЕТРЫ ВЫБОРКИ */}
        <Form.Item
          label={t('exportData.fields.dataType')}
          name='dataType'
          rules={[{ required: true, message: t('exportData.validation.selectSection') }]}
        >
          <Select placeholder={t('exportData.placeholders.selectSection')} size='large'>
            <Option value='orders'>{t('exportData.options.orders')}</Option>
            <Option value='clients'>{t('exportData.options.clients')}</Option>
            <Option value='requests'>{t('exportData.options.requests')}</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.statuses')} name='statuses' rules={[{ required: false }]}>
              <Select placeholder={t('common.all')} size='large'>
                <Option value='all'>{t('common.all')}</Option>
                <Option value='new'>{t('exportData.status.new')}</Option>
                <Option value='progress'>{t('exportData.status.inProgress')}</Option>
                <Option value='done'>{t('exportData.status.completed')}</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.responsible')} name='responsible' rules={[{ required: false }]}>
              <Select placeholder={t('exportData.placeholders.responsible')} size='large'>
                <Option value='departmentA'>{t('exportData.responsible.departmentA')}</Option>
                <Option value='departmentB'>{t('exportData.responsible.departmentB')}</Option>
                <Option value='ivanov'>{t('exportData.responsible.ivanov')}</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.dateFrom')} name='dateFrom' rules={[{ required: false }]}>
              <DatePicker placeholder='10-03-2025' style={{ width: '100%' }} size='large' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.dateTo')} name='dateTo' rules={[{ required: false }]}>
              <DatePicker placeholder='10-04-2025' style={{ width: '100%' }} size='large' />
            </Form.Item>
          </Col>
        </Row>

        {/* ПОЛЯ ДЛЯ ЭКСПОРТА */}
        <Form.Item label={t('exportData.fields.selectFields')} style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Checkbox>{t('exportData.checkboxes.registrationDate')}</Checkbox>
            <Checkbox>{t('exportData.checkboxes.customer')}</Checkbox>
            <div style={{ marginLeft: 24 }}>
              <Checkbox defaultChecked>{t('exportData.checkboxes.customerSample')}</Checkbox>
            </div>
            <Checkbox defaultChecked>{t('exportData.checkboxes.rightToAddRequest')}</Checkbox>

            <Checkbox>{t('exportData.checkboxes.customer')}</Checkbox>
            <div style={{ marginLeft: 24 }}>
              <Checkbox defaultChecked>{t('exportData.checkboxes.customerSample')}</Checkbox>
            </div>
            <Checkbox defaultChecked>{t('exportData.checkboxes.rightToAddRequest')}</Checkbox>
            <Checkbox defaultChecked>{t('exportData.checkboxes.rightToAddRequest')}</Checkbox>

            <Checkbox defaultChecked>{t('exportData.formats.excel')}</Checkbox>
            <Checkbox>{t('exportData.formats.csv')}</Checkbox>
            <Checkbox>{t('exportData.formats.pdf')}</Checkbox>
          </div>
        </Form.Item>

        {/* КНОПКИ ВНИЗУ */}
        <Row justify='end' gutter={16} style={{ marginTop: 24 }}>
          <Col>
            <Button type='default'>{t('exportData.exportHistory')}</Button>
          </Col>
          <Col>
            <Button type='primary' htmlType='submit' icon={<DownloadOutlined />}>
              {t('common.export')}
            </Button>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default ExportData;
