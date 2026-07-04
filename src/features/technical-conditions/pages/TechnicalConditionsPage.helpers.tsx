import { Input, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
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
  // Общие свойства для всех ячеек
  const clickableCellProps = (record: ITechnicalCondition) => ({
    style: { cursor: 'pointer' },
    onClick: () => onClick(record, 'view')
  });

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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'tu_number',
      key: 'tu_number',
      render: (text, record) => {
        // Для типа "отказы" вместо номера показываем "Отказ"
        const isRefusal = (record as { type_ty?: { title?: string } })?.type_ty?.title === 'отказы';
        return (
          <Typography.Text strong type={isRefusal ? 'danger' : undefined}>
            {isRefusal ? t('tuDetails.status.rejected', 'Отказ') : text}
          </Typography.Text>
        );
      },
      onCell: clickableCellProps,
      width: 90
    },
    {
      title: t('addTuForms.form.labels.council_date'),
      dataIndex: 'council_date',
      key: 'council_date',
      width: 150,
      render: (date) => {
        if (!date) return '—';
        return dayjs(date).format('DD.MM.YYYY');
      },
      onCell: clickableCellProps
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: ['customer', 'full_name'],
      key: 'customer',
      width: 170,
      onCell: clickableCellProps
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'address',
      key: 'address',
      width: 170,
      onCell: clickableCellProps
    },
    {
      title: t('applicationDetails.labels.requestDate'),
      dataIndex: 'request_date',
      key: 'request_date',
      width: 135,
      render: (date) => {
        if (!date) return '—';
        return dayjs(date).format('DD.MM.YYYY');
      },
      onCell: clickableCellProps
    },
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'object_name',
      key: 'objectName',
      width: 260,
      onCell: clickableCellProps
    },
    {
      title: t('applicationDetails.labels.waterRequired'),
      dataIndex: 'water_required',
      key: 'water_required',
      width: 135,
      onCell: clickableCellProps
    },
    {
      title: t('applicationDetails.labels.wastewater'),
      dataIndex: 'sewage_amount',
      key: 'sewage_amount',
      width: 135,
      onCell: clickableCellProps
    },
    // ✅ ИСПОЛНИТЕЛЬ: показываем "Пользователь" если None или пусто
    {
      title: 'Исполнитель:',
      dataIndex: 'author_name',
      key: 'author_name',
      width: 200,
      render: (text) => {
        // Если None, пусто, или строка "None" - показываем "Пользователь"
        if (!text || text === 'None' || text.trim() === '' || text.includes('None')) {
          return 'Пользователь';
        }
        return text;
      },
      onCell: clickableCellProps
    },
    {
      title: t('tuDetails.labels.paymentInvoiceNumber'),
      dataIndex: 'request_number',
      key: 'payment_invoice_number',
      width: 160,
      onCell: clickableCellProps
    },
    {
      title: t('tuDetails.labels.paymentAmount'),
      dataIndex: 'payment_amount',
      key: 'payment_amount',
      width: 145,
      onCell: clickableCellProps
    },
    {
      title: t('protocolDetail.paid'),
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 145,
      onCell: clickableCellProps
    },
    {
      title: t('protocolDetail.payment.columns.date'),
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 145,
      render: (date) => {
        if (!date) return '—';
        return dayjs(date).format('DD.MM.YYYY');
      },
      onCell: clickableCellProps
    },
    {
      title: t('common.remaining'),
      dataIndex: 'remaining_amount',
      key: 'remaining_amount',
      width: 145,
      render: (text) => (text < 0 ? 0 : text),
      onCell: clickableCellProps
    }
  ];
};
