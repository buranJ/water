import { FC } from 'react';
import { useNavigate } from 'react-router';
import { Button, Checkbox, Col, DatePicker, Form, Row, Select, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import type { ReportType } from 'api/Reports.api';
import { useLazyGetReportsQuery } from 'api/Reports.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

const { Title } = Typography;

const REPORT_TYPE_OPTIONS: { value: ReportType; label: string }[] = [
  { value: 'issued', label: 'Выданные ТУ' },
  { value: 'canceled', label: 'Аннулированные ТУ' },
  { value: 'not_issued', label: 'Не выданные ТУ' },
  { value: 'requests', label: 'Заявки' },
  { value: 'land_agreements', label: 'Согласованные участки' },
  { value: 'unpaid_tu', label: 'Неоплаченные ТУ' },
  { value: 'objects', label: 'Объекты' },
  { value: 'payments', label: 'Оплаты' },
  { value: 'debts', label: 'Задолженности' },
  { value: 'reconciliation', label: 'Акт сверки' }
];

const ExportData: FC<{ title: string }> = ({ title }) => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [getReports, { isFetching }] = useLazyGetReportsQuery();
  const { hasPermission } = usePermissions();

  const onFinish = async (values: { dataType: ReportType }) => {
    try {
      const res = await getReports({ report_type: values.dataType }).unwrap();
      navigate('/dashboard/export-data/history', { state: { reports: res } });
    } catch {
      // noop
    }
  };

  if (!hasPermission('view_report')) {
    return (
      <DashboardLayout title={title}>
        <Typography.Text type='danger'>{t('common.noAccess') || 'Недостаточно прав для просмотра отчётов'}</Typography.Text>
      </DashboardLayout>
    );
  }

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
          <Select placeholder={t('exportData.placeholders.selectSection')} size='large' options={REPORT_TYPE_OPTIONS} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.statuses')} name='statuses' rules={[{ required: false }]}>
              <Select
                placeholder={t('common.all')}
                size='large'
                options={[
                  { value: 'all', label: t('common.all') },
                  { value: 'new', label: t('exportData.status.new') },
                  { value: 'progress', label: t('exportData.status.inProgress') },
                  { value: 'done', label: t('exportData.status.completed') }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('exportData.fields.responsible')} name='responsible' rules={[{ required: false }]}>
              <Select
                placeholder={t('exportData.placeholders.responsible')}
                size='large'
                options={[
                  { value: 'departmentA', label: t('exportData.responsible.departmentA') },
                  { value: 'departmentB', label: t('exportData.responsible.departmentB') },
                  { value: 'ivanov', label: t('exportData.responsible.ivanov') }
                ]}
              />
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
            <Button
              type='primary'
              htmlType='submit'
              icon={<DownloadOutlined />}
              loading={isFetching}
              disabled={!hasPermission('add_report')}
            >
              {t('common.export')}
            </Button>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default ExportData;
