import { useEffect, useState } from 'react';
import { Badge, Button, Col, DatePicker, Form, Input, Row, Select, Space } from 'antd';
import { DownloadOutlined, FilterOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
// import dayjs, { Dayjs } from 'dayjs';
import './styles.scss';

import { usePermissions } from 'hooks/useAuth';

const { RangePicker } = DatePicker;

interface LandParcelsFilterValues {
  search?: string;
  request_number?: string;
  customer_name?: string;
  address?: string;
  purpose?: string;
  council_date_start?: string;
  council_date_end?: string;
  tech_council_date_start?: string;
  tech_council_date_end?: string;
  ordering?: string;
}

interface Props {
  initialValues?: LandParcelsFilterValues;
  onFilterChange: (values: LandParcelsFilterValues) => void;
  onAddClick: () => void;
  onDownloadClick?: () => void;
}

export const LandParcelsFilterBar = ({ onFilterChange, onAddClick, onDownloadClick, initialValues }: Props) => {
  const [form] = Form.useForm();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeCount, setActiveCount] = useState(0);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
      // Считаем активные фильтры (игнорируем search)
      const ignore = ['search'] as (keyof LandParcelsFilterValues)[];
      const cnt = Object.entries(initialValues || {}).filter(
        ([k, v]) => !ignore.includes(k as keyof LandParcelsFilterValues) && v !== undefined && v !== null && String(v).trim() !== ''
      ).length;
      setActiveCount(cnt);
    }
  }, [form, initialValues]);

  const computeActiveCount = (vals: LandParcelsFilterValues) => {
    const ignore = ['search'] as (keyof LandParcelsFilterValues)[];
    return Object.entries(vals || {}).filter(
      ([k, v]) => !ignore.includes(k as keyof LandParcelsFilterValues) && v !== undefined && v !== null && String(v).trim() !== ''
    ).length;
  };

  const handleValuesChange = (_: unknown, allValues: LandParcelsFilterValues) => {
    setActiveCount(computeActiveCount(allValues));
    onFilterChange(allValues);
  };

  const filtersContent = (
    <div className='land-parcels-filters-panel'>
      <div className='land-parcels-filters-header'>
        <span>Фильтры</span>
        <Space size={8}>
          <Button size='small' type='text' onClick={() => setFiltersOpen(false)}>
            Отмена
          </Button>
        </Space>
      </div>

      <Form form={form} layout='vertical' onValuesChange={handleValuesChange}>
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='ordering' label='Сортировка'>
              <Select variant='filled' allowClear style={{ width: '100%' }}>
                <Select.Option value='address'>Адрес (А-Я)</Select.Option>
                <Select.Option value='-address'>Адрес (Я-А)</Select.Option>
                <Select.Option value='created_at'>Сначала старые</Select.Option>
                <Select.Option value='-created_at'>Сначала новые</Select.Option>
                <Select.Option value='council_date'>Дата запроса (возр.)</Select.Option>
                <Select.Option value='-council_date'>Дата запроса (убыв.)</Select.Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='request_number' label='Номер запроса'>
              <Input allowClear style={{ width: '100%' }} placeholder='Введите номер' />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='customer_name' label='Заказчик'>
              <Input allowClear style={{ width: '100%' }} placeholder='ФИО заказчика' />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='address' label='Адрес'>
              <Input allowClear style={{ width: '100%' }} placeholder='Адрес' />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='purpose' label='Наименование объекта'>
              <Input allowClear style={{ width: '100%' }} placeholder='Например: Сельхоз' />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='council_date_range' label='Дата запроса'>
              <RangePicker
                format='DD.MM.YYYY'
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    form.setFieldsValue({
                      council_date_start: dates[0].format('YYYY-MM-DD'),
                      council_date_end: dates[1].format('YYYY-MM-DD')
                    });
                  } else {
                    form.setFieldsValue({
                      council_date_start: undefined,
                      council_date_end: undefined
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12} md={8} lg={6}>
            <Form.Item name='tech_council_date_range' label='Дата тех совета'>
              <RangePicker
                format='DD.MM.YYYY'
                style={{ width: '100%' }}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    form.setFieldsValue({
                      tech_council_date_start: dates[0].format('YYYY-MM-DD'),
                      tech_council_date_end: dates[1].format('YYYY-MM-DD')
                    });
                  } else {
                    form.setFieldsValue({
                      tech_council_date_start: undefined,
                      tech_council_date_end: undefined
                    });
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );

  return (
    <div className='land-parcels-filter-bar'>
      {/* Top bar */}
      <Form
        form={form}
        layout='inline'
        onValuesChange={handleValuesChange}
        initialValues={initialValues}
        style={{ flexWrap: 'wrap', rowGap: 12 }}
      >
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder='Поиск по всем полям' allowClear />
        </Form.Item>
      </Form>

      <Space>
        <Button disabled={!hasPermission('add_landparcel')} type='primary' icon={<PlusOutlined />} onClick={() => onAddClick()}>
          Добавить участок
        </Button>

        {onDownloadClick && (
          <Button icon={<DownloadOutlined />} onClick={() => onDownloadClick()}>
            Экспорт
          </Button>
        )}

        <Badge count={activeCount} size='small' offset={[6, 0]} showZero={false}>
          <Button
            className={filtersOpen ? 'filters-btn filters-btn--active' : 'filters-btn'}
            icon={<FilterOutlined />}
            onClick={() => setFiltersOpen((o) => !o)}
          >
            Фильтры
          </Button>
        </Badge>
      </Space>

      {filtersOpen ? <div>{filtersContent}</div> : null}
    </div>
  );
};
