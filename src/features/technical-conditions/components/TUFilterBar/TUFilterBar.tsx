import { useEffect } from 'react';
import { Button, Form, Input, Select, Space } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import './styles.scss';

import { t } from 'i18next';

const { Option } = Select;

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean;
  overdue?: boolean;
  due_in_days?: number;
}

interface Props {
  initialValues?: TUFilterValues;
  onFilterChange: (values: TUFilterValues) => void;
  onAddClick: () => void;
  onDownloadClick: () => void;
}

export const TUFilterBar = ({ onFilterChange, onAddClick, onDownloadClick, initialValues }: Props) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        has_invoice: initialValues.has_invoice === undefined ? undefined : String(initialValues.has_invoice),
        overdue: initialValues.overdue === undefined ? undefined : String(initialValues.overdue)
      });
    }
  }, [form, initialValues]);

  const handleValuesChange = (_: unknown, allValues: TUFilterValues) => {
    onFilterChange(allValues);
  };

  const handleAddClick = () => {
    onAddClick();
  };

  return (
    <div className='tu-filter-bar'>
      <Form
        form={form}
        layout='inline'
        onValuesChange={handleValuesChange}
        initialValues={
          initialValues
            ? {
                ...initialValues,
                has_invoice: initialValues.has_invoice === undefined ? undefined : String(initialValues.has_invoice),
                overdue: initialValues.overdue === undefined ? undefined : String(initialValues.overdue)
              }
            : undefined
        }
        style={{ flexWrap: 'wrap', rowGap: 12 }}
      >
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder={t('filterBar.search')} allowClear />
        </Form.Item>

        <Form.Item name='due_in_days'>
          <Input placeholder={t('tuDetails.labels.paymentDeadline')} allowClear />
        </Form.Item>

        <Form.Item name='ordering'>
          <Select variant='filled' placeholder={t('filterBar.filter.alphabet')} allowClear style={{ width: 140 }}>
            <Option value='object_name'>{t('filterBar.alphabetAsc')}</Option>
            <Option value='-object_name'>{t('filterBar.alphabetDesc')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='status'>
          <Select variant='filled' placeholder={t('filterBar.filter.status')} allowClear style={{ width: 140 }}>
            <Option value='active'>{t('filterBar.approved')}</Option>
            <Option value='inactive'>{t('filterBar.rejected')}</Option>
            <Option value='archived'>{t('filterBar.archived')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='stage'>
          <Select variant='filled' placeholder={t('tuDetails.labels.stage')} allowClear style={{ width: 140 }}>
            <Option value='draft'>{t('tuDetails.stage.draft')}</Option>
            <Option value='review'>{t('tuDetails.stage.review')}</Option>
            <Option value='approved'>{t('tuDetails.stage.approved')}</Option>
            <Option value='done'>{t('tuDetails.stage.done')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='date'>
          <Select variant='filled' placeholder={t('filterBar.byDate')} allowClear style={{ width: 180 }}>
            <Option value='-created_at'>{t('filterBar.newOnesfirst')}</Option>
            <Option value='created_at'>{t('filterBar.newOldFirst')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='payment_ordering'>
          <Select variant='filled' placeholder={t('tuDetails.titles.payment')} allowClear style={{ width: 220 }}>
            <Option value='payment_deadline'>{t('filterBar.paymentDeadlineAsc')}</Option>
            <Option value='-payment_deadline'>{t('filterBar.paymentDeadlineDesc')}</Option>
            <Option value='payment_date'>{t('filterBar.paymentDateAsc')}</Option>
            <Option value='-payment_date'>{t('filterBar.paymentDateDesc')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='has_invoice' valuePropName='checked'>
          <Select variant='filled' placeholder={t('technicalConditions.filter.hasInvoice')} allowClear style={{ width: 180 }}>
            <Option value='true'>{t('profile.yes')}</Option>
            <Option value='false'>{t('profile.no')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='overdue' valuePropName='checked'>
          <Select variant='filled' placeholder={t('technicalConditions.filter.overdue')} allowClear style={{ width: 180 }}>
            <Option value='true'>{t('profile.yes')}</Option>
            <Option value='false'>{t('profile.no')}</Option>
          </Select>
        </Form.Item>
      </Form>

      <Space>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => {
            handleAddClick();
            onAddClick();
          }}
        >
          {t('filterBar.add')}
        </Button>
        <Button icon={<DownloadOutlined />} onClick={onDownloadClick}>
          {t('common.export')}
        </Button>
      </Space>
    </div>
  );
};
