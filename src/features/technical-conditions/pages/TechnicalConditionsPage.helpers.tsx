import { Button, Input, Space, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ITechnicalCondition } from 'types/entities/tu';

import i18next from 'i18next';

type actionType = 'edit' | 'delete' | 'view';

type ColumnFilters = {
  tu_number?: string;
  customer_name?: string;
  address?: string;
  object_name?: string;
};
type IGetColumnsFn = (options: {
  onClick: (record: ITechnicalCondition, action: actionType) => void;
  filters: ColumnFilters;
  onFilterChange: (field: keyof ColumnFilters, value: string) => void;
}) => ColumnsType<ITechnicalCondition>;

const { t } = i18next;

export const getColumns: IGetColumnsFn = ({ onClick, filters, onFilterChange }) => {
  return [
    {
      title: (
        <div>
          <div>{t('historyOfLoads.columns.tu')}</div>
          <Input
            allowClear
            size='small'
            value={filters.tu_number}
            onChange={(e) => onFilterChange('tu_number', e.target.value)}
            placeholder={t('technicalConditions.tuNumberPrefix', '№ ТУ')}
          />
        </div>
      ),
      dataIndex: 'tu_number',
      key: 'tu_number',
      render: (text, record) => (
        <Typography.Link onClick={() => onClick(record, 'view')} strong>
          {text}
        </Typography.Link>
      ),
      onCell: (record) => ({ style: { cursor: 'pointer' }, onClick: () => onClick(record, 'view') }),
      width: 90
    },
    {
      title: t('addTuForms.form.labels.council_date'),
      dataIndex: 'council_date',
      key: 'council_date',
      width: 150,
      render: (date) => {
        if (!date) return '-';
        return dayjs(date).format('DD-MM-YYYY-HH:mm');
      }
    },
    {
      title: (
        <div>
          <div>{t('customers.columns.customer')}</div>
          <Input
            allowClear
            size='small'
            value={filters.customer_name}
            onChange={(e) => onFilterChange('customer_name', e.target.value)}
            placeholder={t('customers.columns.customer')}
          />
        </div>
      ),
      dataIndex: ['customer', 'full_name'],
      key: 'customer',
      width: 170
    },
    {
      title: (
        <div>
          <div>{t('applicationDetails.labels.address')}</div>
          <Input
            allowClear
            size='small'
            value={filters.address}
            onChange={(e) => onFilterChange('address', e.target.value)}
            placeholder={t('applicationDetails.labels.address')}
          />
        </div>
      ),
      dataIndex: 'address',
      key: 'address',
      width: 170
    },
    // Дата тех совета (request_date)
    { title: t('applicationDetails.labels.requestDate'), dataIndex: 'request_date', key: 'request_date', width: 135 },
    {
      title: (
        <div>
          <div>{t('applicationDetails.labels.objectName')}</div>
          <Input
            allowClear
            size='small'
            value={filters.object_name}
            onChange={(e) => onFilterChange('object_name', e.target.value)}
            placeholder={t('applicationDetails.labels.objectName')}
          />
        </div>
      ),
      dataIndex: 'object_name',
      key: 'objectName',
      width: 260
    },
    { title: t('applicationDetails.labels.waterRequired'), dataIndex: 'water_required', key: 'water_required', width: 135 },
    {
      title: t('applicationDetails.labels.wastewater'),
      dataIndex: 'sewage_amount',
      key: 'sewage_amount',
      width: 135
    },
    {
      title: t('protocolDetail.invoice.title'),
      dataIndex: 'payment_paper',
      key: 'payment_paper',
      width: 160,
      render: (_, record) => {
        return (
          <>
            <Typography.Text strong>№{record.payment_paper?.number}</Typography.Text>
            <br />
            <Typography.Text type='secondary'>
              {t('protocolDetail.payment.columns.date')}: {dayjs(record.payment_paper?.date).format('DD.MM.YYYY')}
            </Typography.Text>
          </>
        );
      }
    },
    { title: t('tuDetails.labels.paymentInvoiceNumber'), dataIndex: 'request_number', key: 'payment_invoice_number', width: 160 },
    { title: t('tuDetails.labels.paymentAmount'), dataIndex: 'payment_amount', key: 'payment_amount', width: 145 },
    { title: t('protocolDetail.paid'), dataIndex: 'paid_amount', key: 'paid_amount', width: 145 },
    { title: t('protocolDetail.payment.columns.date'), dataIndex: 'payment_date', key: 'payment_date', width: 145 },
    {
      title: t('common.remaining'),
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      width: 145,
      render: (text) => (text < 0 ? 0 : text)
    },
    {
      title: t('common.status'),
      dataIndex: 'status',
      key: 'status',
      render: (_, record: ITechnicalCondition) => {
        if (record.status === 'active') {
          return <Tag color='green'>{t('filterBar.approved')}</Tag>;
        }
        if (record.status === 'inactive') {
          return <Tag color='red'>{t('filterBar.rejected')}</Tag>;
        }
        return <Tag color='default'>{t('filterBar.archived')}</Tag>;
      },
      width: 145
    },
    {
      title: t('exportDataHistory.columns.actions'),
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onClick(record, 'edit')} disabled={record.status === 'inactive'} />
          <Button icon={<DeleteOutlined />} onClick={() => onClick(record, 'delete')} danger />
        </Space>
      ),
      width: 145
    }
  ];
};
