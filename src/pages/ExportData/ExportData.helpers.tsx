import { FC, ReactNode, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, Row, Select, Tooltip, Typography } from 'antd';
import { CalendarOutlined, CheckOutlined, ControlOutlined, NodeIndexOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import type { FieldConfig } from './ExportData.config';
import { FILTER_SECTIONS } from './ExportData.config';

// Кнопка-переключатель для формы (multi-select): ведёт себя как чекбокс, но выглядит как кнопка
export const CheckableButton: FC<{ checked?: boolean; onChange?: (checked: boolean) => void; icon?: ReactNode; children?: ReactNode }> = ({
  checked = false,
  onChange,
  icon,
  children
}) => (
  <Button
    type={checked ? 'primary' : 'default'}
    icon={checked ? <CheckOutlined /> : icon}
    onClick={() => onChange?.(!checked)}
    style={{ borderRadius: 999 }}
  >
    {children}
  </Button>
);

import { useGetAllCustomersQuery } from 'api/Customer.api';
import { useGetAllFormulasQuery } from 'api/Formula.api';
import { useGetAllObjectsQuery } from 'api/Object.api';
import { useGetTyGroupsQuery, useGetTypesTyQuery } from 'api/Ty.api';
import { t } from 'i18next';

export const FiltersGrid: FC<{ fields: FieldConfig[] }> = ({ fields }) => {
  // Local state for live search inputs
  const [customerSearch, setCustomerSearch] = useState('');
  const [objectSearch, setObjectSearch] = useState('');

  // Load dynamic options
  const formulasQuery = useGetAllFormulasQuery({ page: 1 });
  const typesTyQuery = useGetTypesTyQuery();
  const tyGroupsQuery = useGetTyGroupsQuery();
  const customersQuery = useGetAllCustomersQuery({ page: 1, search: customerSearch || undefined });
  const objectsQuery = useGetAllObjectsQuery({ page: 1, page_size: 20, search: objectSearch || undefined });

  // Map to Select options
  const formulaOptions = useMemo(
    () => formulasQuery.data?.results?.map((f) => ({ value: f.id, label: f.title })) ?? [],
    [formulasQuery.data]
  );
  const typeTyOptions = useMemo(() => typesTyQuery.data?.map((t) => ({ value: t.id, label: t.title })) ?? [], [typesTyQuery.data]);
  const groupOptions = useMemo(() => tyGroupsQuery.data?.map((g) => ({ value: g.id, label: g.title })) ?? [], [tyGroupsQuery.data]);
  const customerOptions = useMemo(
    () => customersQuery.data?.results?.map((c) => ({ value: c.id, label: c.full_name })) ?? [],
    [customersQuery.data]
  );
  const objectOptions = useMemo(() => objectsQuery.data?.results?.map((o) => ({ value: o.id, label: o.title })) ?? [], [objectsQuery.data]);

  const renderField = (fc: FieldConfig, idx: number) => {
    const name = ['filters', fc.name];
    const label = fc.name === 'object_names' ? fc.label : t(`exportData.filters.${fc.name}`) || fc.label;

    // Подсказка: либо явная из конфига, либо из словаря по имени поля (пусто → не показываем)
    const tip = fc.tooltip || t(`exportData.tooltips.${fc.name}`, '');

    // ✅ Label с tooltip если есть
    const labelNode = tip ? (
      <span>
        {label}{' '}
        <Tooltip title={tip}>
          <QuestionCircleOutlined style={{ color: '#999' }} />
        </Tooltip>
      </span>
    ) : (
      label
    );

    const commonProps = { name, label: labelNode } as const;

    if (fc.type === 'text_array') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Input placeholder={fc.placeholder || 'Например: Объект1/Объект2/Объект3'} />
          </Form.Item>
        </Col>
      );
    }

    // Dynamic overrides by field name
    if (fc.name === 'formula_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              options={formulaOptions}
              placeholder={t('exportData.placeholders.selectFormula') || 'Выберите формулу'}
              optionFilterProp='label'
              loading={formulasQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'type_ty') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              options={typeTyOptions}
              placeholder={t('exportData.placeholders.selectTypeTU') || 'Выберите тип ТУ'}
              optionFilterProp='label'
              loading={typesTyQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'group_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              options={groupOptions}
              placeholder={t('exportData.placeholders.selectGroup') || 'Выберите группу'}
              optionFilterProp='label'
              loading={tyGroupsQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'customer_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={setCustomerSearch}
              options={customerOptions}
              placeholder={t('exportData.placeholders.searchCustomer') || 'Поиск заказчика (ФИО/Название)'}
              loading={customersQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    if (fc.name === 'entity_id') {
      return (
        <Col span={12} key={`${fc.name}_${idx}`}>
          <Form.Item {...commonProps}>
            <Select
              allowClear
              showSearch
              filterOption={false}
              onSearch={setObjectSearch}
              options={objectOptions}
              placeholder={t('exportData.placeholders.searchObject') || 'Поиск объекта (по названию)'}
              loading={objectsQuery.isLoading}
            />
          </Form.Item>
        </Col>
      );
    }

    // Default rendering by type
    switch (fc.type) {
      case 'number':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <InputNumber min={0} style={{ width: '100%' }} placeholder={t('exportData.placeholders.numberExample') || '123'} />
            </Form.Item>
          </Col>
        );
      case 'string':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <Input placeholder={fc.placeholder || t('exportData.placeholders.text') || 'Текст'} />
            </Form.Item>
          </Col>
        );
      case 'date':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <DatePicker style={{ width: '100%' }} format='DD.MM.YYYY' placeholder={t('exportData.placeholders.date') || 'DD.MM.YYYY'} />
            </Form.Item>
          </Col>
        );
      case 'boolean':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item name={name} valuePropName='checked' getValueFromEvent={(c: boolean) => c} style={{ marginBottom: 12 }}>
              {tip ? (
                <CheckableButton>
                  <Tooltip title={tip}>{label}</Tooltip>
                </CheckableButton>
              ) : (
                <CheckableButton>{label}</CheckableButton>
              )}
            </Form.Item>
          </Col>
        );
      case 'select':
        return (
          <Col span={12} key={`${fc.name}_${idx}`}>
            <Form.Item {...commonProps}>
              <Select
                allowClear
                optionFilterProp='label'
                options={fc.options?.map((o) => ({
                  ...o,
                  label: t(`exportData.select.${fc.name}.${o.value}`) || o.label
                }))}
              />
            </Form.Item>
          </Col>
        );
      default:
        return null;
    }
  };

  // Без разбивки на секции — плоская сетка (обратная совместимость)
  const hasSections = fields.some((f) => f.section);
  if (!hasSections) {
    return <Row gutter={16}>{fields.map((fc, idx) => renderField(fc, idx))}</Row>;
  }

  const sectionIcon: Record<string, ReactNode> = {
    main: <ControlOutlined />,
    dates: <CalendarOutlined />,
    connection: <NodeIndexOutlined />
  };

  const groups = FILTER_SECTIONS.map((s) => ({
    ...s,
    items: fields.filter((f) => (f.section ?? 'main') === s.key)
  })).filter((g) => g.items.length);

  return (
    <>
      {groups.map((g) => (
        <div key={g.key} style={{ marginBottom: 20 }}>
          <Typography.Text
            type='secondary'
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 10,
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: 0.4
            }}
          >
            {sectionIcon[g.key]}
            {g.title}
          </Typography.Text>
          <Row gutter={16}>{g.items.map((fc, idx) => renderField(fc, idx))}</Row>
        </div>
      ))}
    </>
  );
};
