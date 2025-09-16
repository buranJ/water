/* eslint-disable simple-import-sort/imports */
import { FC, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Button, Checkbox, Col, Divider, Form, Input, message, Modal, Row, Select, Space, Typography } from 'antd';
import { DownloadOutlined, SaveOutlined } from '@ant-design/icons';
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

import { useCreatePresetMutation, useGetPresetsQuery } from 'api/Presets.api';
import { useExportReportsMutation } from 'api/Reports.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';

const { Title } = Typography;

type AutoExportPayload = {
  preset_id: number;
  entity?: ExportEntity;
  export?: 'pdf' | 'xlsx';
  include?: FormValues['include'];
  filename?: string;
  include_pending?: boolean;
};

type ExportLocationState = {
  autoExport?: AutoExportPayload;
};

// Helpers to serialize/deserialize Export form values into a query-string (for presets)
const encodeFormToQS = (values: FormValues): string => {
  try {
    const qs = new URLSearchParams();

    if (values?.export) qs.set('export', String(values.export));
    if (values?.entity) qs.set('entity', String(values.entity));
    if (values?.filename) qs.set('filename', String(values.filename).trim());
    if (values?.include_pending !== undefined) qs.set('include_pending', String(Boolean(values.include_pending)));

    // include object (booleans)
    if (values?.include && typeof values.include === 'object') {
      Object.entries(values.include).forEach(([k, v]) => {
        if (v !== undefined) qs.set(`include.${k}`, String(Boolean(v)));
      });
    }

    // fields and ids as comma-separated
    if (Array.isArray(values?.fields) && values.fields.length) {
      qs.set('fields', values.fields.join(','));
    }
    if (Array.isArray(values?.ids) && values.ids.length) {
      qs.set('ids', values.ids.join(','));
    }

    // filters.* flatten
    if (values?.filters && typeof values.filters === 'object') {
      Object.entries(values.filters).forEach(([k, v]) => {
        if (v === undefined || v === null || String(v).trim?.() === '') return;
        if (Array.isArray(v)) qs.set(`filters.${k}`, v.join(','));
        else qs.set(`filters.${k}`, String(v));
      });
    }

    return qs.toString();
  } catch {
    // fallback: store full JSON if something goes wrong
    return new URLSearchParams({ form: JSON.stringify(values || {}) }).toString();
  }
};

const parseBoolean = (s: string | null) => (s === 'true' ? true : s === 'false' ? false : undefined);
const parseList = (s: string | null) => (s ? s.split(',').filter((x) => x !== '') : undefined);

const decodeQSToFormValues = (qs: string): Partial<FormValues> => {
  const sp = new URLSearchParams(qs);

  // JSON fallback
  const formJson = sp.get('form');
  if (formJson) {
    try {
      return JSON.parse(formJson) as Partial<FormValues>;
    } catch {
      // ignore
    }
  }

  const out: Partial<FormValues> = {};

  // Simple typed keys
  const exportVal = sp.get('export');
  if (exportVal) out.export = exportVal as 'pdf' | 'xlsx';

  const entityVal = sp.get('entity');
  if (entityVal) out.entity = entityVal as ExportEntity;

  const filenameVal = sp.get('filename');
  if (filenameVal) out.filename = filenameVal;

  const includePendingVal = parseBoolean(sp.get('include_pending'));
  if (includePendingVal !== undefined) out.include_pending = includePendingVal;

  const fieldsVal = parseList(sp.get('fields'));
  if (fieldsVal) out.fields = fieldsVal;

  const idsVal = parseList(sp.get('ids'));
  if (idsVal) out.ids = idsVal;

  // include.*
  const includeKeys: (keyof NonNullable<FormValues['include']>)[] = ['customer', 'entity', 'protocol', 'invoices', 'payments'];
  const includeObj: NonNullable<FormValues['include']> = {};
  let includeSet = false;
  includeKeys.forEach((key) => {
    const v = parseBoolean(sp.get(`include.${key}`));
    if (v !== undefined) {
      includeObj[key] = v;
      includeSet = true;
    }
  });
  if (includeSet) out.include = includeObj;

  // filters.*
  const filtersObj: Record<string, unknown> = {};
  let filtersSet = false;
  Array.from(sp.keys())
    .filter((k) => k.startsWith('filters.'))
    .forEach((k) => {
      const name = k.slice('filters.'.length);
      const raw = sp.get(k);
      if (raw && raw.includes(',')) {
        filtersObj[name] = raw.split(',');
        filtersSet = true;
      } else if (raw && !Number.isNaN(Number(raw))) {
        filtersObj[name] = Number(raw);
        filtersSet = true;
      } else if (raw !== null) {
        filtersObj[name] = raw;
        filtersSet = true;
      }
    });
  if (filtersSet) out.filters = filtersObj;

  return out;
};

const ExportData: FC<{ title: string }> = ({ title }) => {
  const [form] = Form.useForm<FormValues>();
  const navigate = useNavigate();
  const [exportReports, { isLoading }] = useExportReportsMutation();
  const { hasPermission } = usePermissions();
  const location = useLocation() as { state?: ExportLocationState };
  const [autoExportDone, setAutoExportDone] = useState(false);

  // Watch selected entity to drive presets target
  const selectedEntity = Form.useWatch('entity', form) as ExportEntity | undefined;
  const presetTarget = useMemo(() => {
    if (!selectedEntity) return undefined;
    return selectedEntity === 'technical_conditions' ? 'ty' : selectedEntity;
  }, [selectedEntity]);

  useEffect(() => {
    setSelectedPresetId(undefined);
  }, [presetTarget]);
  // Presets hooks/state
  const { data: presetsData, isFetching: presetsLoading } = useGetPresetsQuery(
    presetTarget ? { target: presetTarget, page_size: 100 } : { page_size: 100 }
  );
  const [createPreset, { isLoading: creatingPreset }] = useCreatePresetMutation();
  const [selectedPresetId, setSelectedPresetId] = useState<number | string | undefined>(undefined);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [saveForm] = Form.useForm();

  useEffect(() => {
    const auto = location.state?.autoExport;

    if (!autoExportDone && auto && typeof auto.preset_id === 'number') {
      const body: import('types/requests').IExportReportsParams = {
        export: auto.export || 'xlsx',
        entity: auto.entity || 'technical_conditions',
        preset_id: auto.preset_id,
        include: auto.include,
        filename: auto.filename,
        include_pending: auto.include_pending
      };

      (async () => {
        try {
          const res = await exportReports(body).unwrap();
          handleDownload(res.blob, res.filename, body.entity, body.export, body.filename);
          message.success(t('exportData.messages.downloaded') || 'Файл сформирован и скачан');
        } catch {
          message.error(t('exportData.messages.failed') || 'Не удалось сформировать файл экспорта');
        } finally {
          setAutoExportDone(true);
          navigate('/dashboard/export-data', { replace: true });
        }
      })();
    }
  }, [location, autoExportDone, exportReports, navigate]);

  const handleApplyPresetById = (id?: number | string) => {
    setSelectedPresetId(id);
    if (!id) return;
    const preset = (presetsData?.results || []).find((p) => String(p.id) === String(id));
    if (!preset) return;
    const values = decodeQSToFormValues(preset.query_string);
    // Safely apply only known fields (set non-nested first to satisfy Form typing)
    const { filters, ...rest } = values;
    form.setFieldsValue(rest as Partial<Omit<FormValues, 'filters'>>);
    // Then set nested filters field-by-field to avoid typing mismatch
    if (filters && typeof filters === 'object') {
      const fieldsArr = Object.entries(filters).map(([k, v]) => ({
        name: ['filters', k],
        value: v
      }));
      if (fieldsArr.length) form.setFields(fieldsArr);
    }
    message.success(t('exportData.presets.applied', 'Шаблон применён'));
  };

  const handleRequestSavePreset = () => setSaveModalOpen(true);

  const handleSavePresetOk = async () => {
    try {
      const modalValues = await saveForm.validateFields();
      const currentValues = form.getFieldsValue(true) as FormValues;
      const qs = encodeFormToQS(currentValues);
      if (!currentValues.entity) {
        message.error(t('exportData.presets.entityRequired', 'Сначала выберите сущность'));
        return;
      }
      await createPreset({
        name: modalValues.name,
        description: modalValues.description,
        target: currentValues.entity === 'technical_conditions' ? 'ty' : (currentValues.entity as string),
        query_string: qs
      }).unwrap();
      message.success(t('exportData.presets.saved', 'Шаблон сохранён'));
      setSaveModalOpen(false);
      saveForm.resetFields();
    } catch {
      // ignore
    }
  };
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
        <Row align='middle' justify='space-between' style={{ marginBottom: 12 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              {t('exportData.title') || 'Экспорт данных (PDF/XLSX)'}
            </Title>
          </Col>
          <Col>
            <Space size={8} align='center' wrap>
              <Typography.Text type='secondary' style={{ marginRight: 4 }}>
                {t('exportData.presets.label', 'Шаблоны')}
              </Typography.Text>
              <Select
                size='middle'
                allowClear
                placeholder={t('exportData.presets.select', 'Выберите шаблон')}
                style={{ minWidth: 280 }}
                loading={presetsLoading}
                disabled={!presetTarget}
                value={selectedPresetId}
                onChange={(val) => handleApplyPresetById(val)}
                options={(presetsData?.results || []).map((p) => ({ value: p.id, label: p.name }))}
                showSearch
                filterOption={(input, option) => ((option?.label as string) || '').toLowerCase().includes(input.toLowerCase())}
              />
              <Button size='middle' icon={<SaveOutlined />} onClick={handleRequestSavePreset}>
                {t('exportData.presets.save', 'Сохранить шаблон')}
              </Button>
            </Space>
          </Col>
        </Row>

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
        <Modal
          open={saveModalOpen}
          title={t('exportData.presets.saveTitle', 'Сохранить шаблон')}
          onOk={handleSavePresetOk}
          onCancel={() => setSaveModalOpen(false)}
          confirmLoading={creatingPreset}
          destroyOnClose
        >
          <Form form={saveForm} layout='vertical'>
            <Form.Item
              name='name'
              label={t('exportData.presets.name', 'Название')}
              rules={[{ required: true, message: t('exportData.presets.nameReq', 'Введите название') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name='description' label={t('exportData.presets.description', 'Описание')}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
      </Form>
    </DashboardLayout>
  );
};

export default ExportData;
