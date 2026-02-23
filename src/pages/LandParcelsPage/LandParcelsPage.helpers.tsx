import { Button, Input, Space, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ILandParcel } from 'types/requests';

type ActionType = 'edit' | 'delete' | 'view';

type ColumnFilters = {
  title?: string;
  kadastr_number?: string;
  customer_name?: string;
  address?: string;
};

type IGetColumnsFn = (options: {
  onClick: (record: ILandParcel, action: ActionType) => void;
  filters: ColumnFilters;
  onFilterChange: (field: keyof ColumnFilters, value: string) => void;
}) => ColumnsType<ILandParcel>;

export const getColumns: IGetColumnsFn = ({ onClick, filters, onFilterChange }) => {
  // Общие свойства для кликабельных ячеек
  const clickableCellProps = (record: ILandParcel) => ({
    style: { cursor: 'pointer' },
    onClick: () => onClick(record, 'view')
  });

  return [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (text) => <Typography.Text strong>#{text}</Typography.Text>,
      onCell: clickableCellProps
    },
    {
      title: (
        <div>
          <div>Название участка</div>
          <Input
            allowClear
            size='small'
            value={filters.title}
            onChange={(e) => onFilterChange('title', e.target.value)}
            placeholder='Поиск по названию'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'title',
      key: 'title',
      width: 200,
      render: (text) => text || '—',
      onCell: clickableCellProps
    },
    {
      title: (
        <div>
          <div>Кадастровый номер</div>
          <Input
            allowClear
            size='small'
            value={filters.kadastr_number}
            onChange={(e) => onFilterChange('kadastr_number', e.target.value)}
            placeholder='Поиск по кадастру'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'kadastr_number',
      key: 'kadastr_number',
      width: 200,
      render: (text) => text || '—',
      onCell: clickableCellProps
    },
    {
      title: (
        <div>
          <div>Адрес</div>
          <Input
            allowClear
            size='small'
            value={filters.address}
            onChange={(e) => onFilterChange('address', e.target.value)}
            placeholder='Поиск по адресу'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'address',
      key: 'address',
      width: 250,
      render: (text) => text || '—',
      onCell: clickableCellProps
    },
    {
      title: 'Назначение',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 150,
      render: (text) => text || '—',
      onCell: clickableCellProps
    },
    {
      title: (
        <div>
          <div>Заказчик</div>
          <Input
            allowClear
            size='small'
            value={filters.customer_name}
            onChange={(e) => onFilterChange('customer_name', e.target.value)}
            placeholder='Поиск по заказчику'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ),
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 200,
      render: (text) => text || '—',
      onCell: clickableCellProps
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => (date ? dayjs(date).format('DD.MM.YYYY') : '—'),
      onCell: clickableCellProps
    },
    {
      title: 'Действия',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              onClick(record, 'edit');
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={(e) => {
              e.stopPropagation();
              onClick(record, 'delete');
            }}
          />
        </Space>
      )
    }
  ];
};
