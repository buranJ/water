import { Button, Space, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { ITechnicalCondition } from 'types/entities/tu';

type actionType = 'edit' | 'delete' | 'view';

type IGetColumnsFn = (options: { onClick: (record: ITechnicalCondition, action: actionType) => void }) => ColumnsType<ITechnicalCondition>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: '№ ТУ',
      dataIndex: 'id',
      key: 'id',
      render: (text, record) => (
        <Typography.Link onClick={() => onClick(record, 'view')} strong>
          {text}
        </Typography.Link>
      ),
      width: 90
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => dayjs(date).format('DD-MM-YYYY-HH:mm')
    },
    { title: 'Заказчик', dataIndex: ['customer', 'full_name'], key: 'customer', width: 170 },
    { title: 'Адрес', dataIndex: 'address', key: 'address', width: 170 },
    { title: 'Наименование объекта', dataIndex: 'object_name', key: 'objectName', width: 260 },
    { title: 'Количество водопроводной воды', dataIndex: 'water_required', key: 'water_required', width: 135 },
    {
      title: 'Количество стоков',
      dataIndex: 'sewage_amount',
      key: 'sewage_amount',
      width: 135
    },
    {
      title: 'Nº и дата договора на оплату за ТУ и разреш.',
      dataIndex: 'payment_paper',
      key: 'payment_paper',
      width: 160,
      render: (_, record) => {
        return (
          <>
            <Typography.Text strong>№{record.payment_paper.number}</Typography.Text>
            <br />
            <Typography.Text type='secondary'>Дата: {dayjs(record.payment_paper.date).format('DD.MM.YYYY')}</Typography.Text>
          </>
        );
      }
    },
    { title: '№ счета на оплату', dataIndex: 'request_number', key: 'payment_invoice_number', width: 160 },
    { title: 'Сумма оплаты за ТУ и разреш', dataIndex: 'payment_amount', key: 'payment_amount', width: 145 },
    { title: 'Оплачено', dataIndex: 'paid_amount', key: 'paid_amount', width: 145 },
    { title: 'Дата оплаты', dataIndex: 'payment_date', key: 'payment_date', width: 145 },
    { title: 'Остаток', dataIndex: 'remaining_amount', key: 'remaining_amount', width: 145 },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (_, record: ITechnicalCondition) => {
        if (record.status === 'active') {
          return <Tag color='green'>Утверждено</Tag>;
        }
        if (record.status === 'inactive') {
          return <Tag color='red'>Отклонено</Tag>;
        }
        return <Tag color='default'>В архиве</Tag>;
      },
      width: 145
    },
    {
      title: 'Действия',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => onClick(record, 'edit')} />
          <Button icon={<DeleteOutlined />} onClick={() => onClick(record, 'delete')} danger />
        </Space>
      ),
      width: 145
    }
  ];
};
