import { Button, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';

type actionType = 'payment';

export interface PaymentData {
  key: string;
  ptuNumber: string;
  customer: string;
  date: string;
  address: string;
  protocol: string;
  status: 'approved' | 'pending';
}
type IGetColumnsFn = (options: { onClick: (record: PaymentData, action: actionType) => void }) => ColumnsType<PaymentData>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    { title: '№ ПТУ', dataIndex: 'ptuNumber', key: 'ptuNumber' },
    { title: 'Заказчик', dataIndex: 'customer', key: 'customer' },
    { title: 'Дата регистрации', dataIndex: 'date', key: 'date' },
    { title: 'Адрес', dataIndex: 'address', key: 'address' },
    { title: 'Протокол', dataIndex: 'protocol', key: 'protocol' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'approved' | 'pending') => (
        <Tag color={status === 'approved' ? 'green' : 'orange'}>{status === 'approved' ? 'Утверждено' : 'Ожидает'}</Tag>
      )
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record: PaymentData) => (
        <Button size='large' type='primary' onClick={() => onClick(record, 'payment')}>
          Счет на оплату
        </Button>
      )
    }
  ];
};

export const data: PaymentData[] = [
  {
    key: '1',
    ptuNumber: '44-957',
    customer: 'ОССО "Сайрус"',
    date: '03-03-2025',
    address: 'пр. Дон Сайрус, 304',
    protocol: '№ 505155/ЕО',
    status: 'approved'
  },
  {
    key: '2',
    ptuNumber: '44-957',
    customer: 'ОССО "Сайрус"',
    date: '03-03-2025',
    address: 'пр. Дон Сайрус, 304',
    protocol: '№ 505155/ЕО',
    status: 'pending'
  }
];
