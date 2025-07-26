import { Button, Space, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { ITechnicalCondition } from 'api/Ty.api';

type actionType = 'edit' | 'delete';

type IGetColumnsFn = (options: { onClick: (record: ITechnicalCondition, action: actionType) => void }) => ColumnsType<ITechnicalCondition>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: '№ ТУ',
      dataIndex: 'number',
      key: 'number',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
      width: 90
    },
    { title: 'Дата регистрации', dataIndex: 'created_at', key: 'created_at', width: 150 },
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
      render: () => {
        return (
          <>
            <Typography.Text strong>№12345 от 01.01.2023</Typography.Text>
            <br />
            <Typography.Text type='secondary'>Дата: 01.01.2023</Typography.Text>
          </>
        );
      }
    },
    { title: '№ счета на оплату', dataIndex: 'request_number', key: 'payment_invoice_number', width: 160 },
    { title: 'Сумма оплаты за ТУ и разреш', dataIndex: 'payment_amount', key: 'payment_amount', width: 145 },
    { title: 'Опачено', dataIndex: 'payment_status', key: 'payment_status', width: 145 },
    { title: 'Дата оплаты', dataIndex: 'payment_date', key: 'payment_date', width: 145 },
    { title: 'Остаток', dataIndex: 'remaining_amount', key: 'remaining_amount', width: 145 },
    {
      title: 'Статус',
      dataIndex: 'stage',
      key: 'stage',
      render: (status) => (status === 'approved' ? <Tag color='green'>Утверждено</Tag> : <Tag color='red'>Отклонено</Tag>),
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
