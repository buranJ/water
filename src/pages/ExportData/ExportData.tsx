import { FC, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Button, Checkbox, Col, Divider, Form, Input, message, Row, Select, Space, Typography } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import type { ExportEntity } from 'types/entities/reports.entities';
import {
  EXPORT_ENTITY_OPTIONS,
  EXPORT_FORMAT_OPTIONS,
  FILTER_CONFIG,
  FormValues,
  handleDownload,
  isIncludePendingVisible,
  prepareFilters,
  prepareIds
} from './ExportData.config';
import { FiltersGrid } from './ExportData.helpers';

import { useExportReportsMutation } from 'api/Reports.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

const { Title } = Typography;

const ExportData: FC<{ title: string }> = ({ title }) => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const [exportReports, { isLoading }] = useExportReportsMutation();
  const { hasPermission } = usePermissions();

  const selectedEntity = Form.useWatch('entity', form) as ExportEntity | undefined;

  const fieldsForEntity = useMemo(() => {
    if (!selectedEntity) return [];
    return FILTER_CONFIG[selectedEntity];
  }, [selectedEntity]);

  const onFinish = async (values: FormValues) => {
    const preparedFilters = prepareFilters(values.filters);
    const preparedIds = prepareIds(values.ids);

    if (!preparedFilters && (!preparedIds || preparedIds.length === 0)) {
      message.error(t('exportData.messages.filtersOrIdsRequired') || 'Нужно указать либо фильтры, либо список ID (или оба).');
      return;
    }

    try {
      const res = await exportReports({
        export: values.export!,
        entity: values.entity!,
        filters: preparedFilters as unknown as import('types/entities/reports.entities').ExportFilters,
        ids: preparedIds,
        include: values.include,
        fields: values.fields && values.fields.length ? values.fields : undefined,
        filename: values.filename?.trim() || undefined,
        include_pending: values.include_pending
      }).unwrap();

      handleDownload(res.blob, res.filename, values.entity!, values.export!, values.filename);
      message.success(t('exportData.messages.downloaded') || 'Файл сформирован и скачан');
    } catch {
      message.error(t('exportData.messages.failed') || 'Не удалось сформировать файл экспорта');
    }
  };

  return (
    <DashboardLayout title={title}>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        style={{ background: '#fff', borderRadius: 8, padding: 16 }}
        initialValues={{
          export: 'xlsx',
          include: { customer: false, entity: false, protocol: false, invoices: false, payments: false },
          include_pending: false
        }}
      >
        <Title level={4} style={{ marginBottom: 24 }}>
          {t('exportData.title') || 'Экспорт данных (PDF/XLSX)'}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('exportData.ui.formatLabel') || 'Формат'}
              name='export'
              rules={[{ required: true, message: t('exportData.ui.formatRequired') || 'Выберите формат' }]}
            >
              <Select
                placeholder={t('exportData.ui.formatPlaceholder') || 'Выберите формат'}
                options={EXPORT_FORMAT_OPTIONS.map((o) => ({
                  ...o,
                  label: o.value === 'xlsx' ? t('exportData.formats.excel') || o.label : t('exportData.formats.pdf') || o.label
                }))}
                size='large'
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('exportData.ui.entityLabel') || 'Сущность'}
              name='entity'
              rules={[{ required: true, message: t('exportData.ui.entityRequired') || 'Выберите сущность' }]}
            >
              <Select
                placeholder={t('exportData.ui.entityPlaceholder') || 'Что экспортируем'}
                options={EXPORT_ENTITY_OPTIONS.map((o) => ({
                  ...o,
                  label: t(`exportData.entities.${o.value}`) || o.label
                }))}
                size='large'
              />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5} style={{ marginTop: 0 }}>
          {t('exportData.ui.filtersTitle') || 'Фильтры'}
        </Title>
        <Typography.Paragraph type='secondary' style={{ marginTop: -8 }}>
          {t('exportData.ui.filtersHint') || 'Укажите один или несколько фильтров, либо заполните список ID ниже'}
        </Typography.Paragraph>

        <FiltersGrid fields={fieldsForEntity} />

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              label={t('exportData.ui.idsLabel') || 'ID записей (через пробел или запятую)'}
              name='ids'
              tooltip={t('exportData.ui.idsTooltip') || 'Можно указать один или несколько ID'}
            >
              <Select mode='tags' placeholder={t('exportData.ui.idsPlaceholder') || 'Например: 1, 2, 3'} open={false} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>{t('exportData.ui.includeTitle') || 'Склейка связанных сущностей'}</Title>
        <Row gutter={16}>
          <Col span={24}>
            <Space wrap>
              <Form.Item name={['include', 'customer']} valuePropName='checked' noStyle>
                <Checkbox>{t('exportData.ui.include.customer') || 'customer'}</Checkbox>
              </Form.Item>
              <Form.Item name={['include', 'entity']} valuePropName='checked' noStyle>
                <Checkbox>{t('exportData.ui.include.entity') || 'entity'}</Checkbox>
              </Form.Item>
              <Form.Item name={['include', 'protocol']} valuePropName='checked' noStyle>
                <Checkbox>{t('exportData.ui.include.protocol') || 'protocol'}</Checkbox>
              </Form.Item>
              <Form.Item name={['include', 'invoices']} valuePropName='checked' noStyle>
                <Checkbox>{t('exportData.ui.include.invoices') || 'invoices'}</Checkbox>
              </Form.Item>
              <Form.Item name={['include', 'payments']} valuePropName='checked' noStyle>
                <Checkbox>{t('exportData.ui.include.payments') || 'payments'}</Checkbox>
              </Form.Item>
            </Space>
          </Col>
        </Row>

        {isIncludePendingVisible(selectedEntity) && (
          <Row gutter={16} style={{ marginTop: 8 }}>
            <Col span={24}>
              <Form.Item name='include_pending' valuePropName='checked'>
                <Checkbox>{t('exportData.ui.include.pending') || 'Учитывать платежи в статусе pending'}</Checkbox>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider />
        {/* get заказчика(поиск по фамилии), обьекты, формулы(селект), тип ту, стадия, статусы */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('exportData.ui.fieldsLabel') || 'Колонки (опционально)'}
              name='fields'
              tooltip={t('exportData.ui.fieldsTooltip') || 'Список ключей данных. Оставьте пустым для дефолта сервера'}
            >
              <Select mode='tags' placeholder={t('exportData.ui.fieldsPlaceholder') || 'Например: invoice_number, total_sum'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('exportData.ui.filenameLabel') || 'Имя файла (без расширения)'} name='filename'>
              <Input placeholder={t('exportData.ui.filenamePlaceholder') || 'unpaid_invoices'} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify='end' gutter={16} style={{ marginTop: 24 }}>
          <Col>
            <Button type='default' onClick={() => navigate('/dashboard/export-data/history')}>
              {t('exportData.exportHistory') || 'История экспортов'}
            </Button>
          </Col>
          <Col>
            <Button
              type='primary'
              htmlType='submit'
              icon={<DownloadOutlined />}
              loading={isLoading}
              disabled={!hasPermission('add_report')}
            >
              {t('common.export') || 'Экспорт'}
            </Button>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default ExportData;
