import { useState } from 'react';
import { Table, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components/DashboardLayout';
import './styles.scss';

import { Pagination } from 'ui/index';

interface TURecord {
  key: string;
  number: string;
  date: string;
  customer: string;
  address: string;
  objectName: string;
  waterAmount: string;
  wastewaterAmount: string;
  contractNumber: string;
  invoiceNumber: string;
  paymentAmount: string;
  paid: string;
  paymentDate: string;
  balance: string;
  status: 'approved' | 'rejected';
}

const initialData: TURecord[] = [
  {
    key: '1',
    number: '04-472',
    date: '03-03-2025',
    customer: 'ОсОО "Сайрус"',
    address: 'пр. Дэн Сяопина, 304',
    objectName: '9-ти этажный многоквартирный жилой дом с торговыми помещениями на собственной территории',
    waterAmount: '62,436',
    wastewaterAmount: '62,436',
    contractNumber: 'Nº332 07.03.2025',
    invoiceNumber: 'Nº413 05.03.2025',
    paymentAmount: '26 159,88',
    paid: '26 159,88',
    paymentDate: '19.03.2025',
    balance: '0,00',
    status: 'approved'
  },
  {
    key: '2',
    number: 'ТУ-002',
    date: '2025-03-05',
    customer: 'ИП "Иванов"',
    address: 'ул. Ленина, 1',
    objectName: 'Офисное здание',
    waterAmount: '200',
    wastewaterAmount: '100',
    contractNumber: 'Договор-002',
    invoiceNumber: 'Счет-002',
    paymentAmount: '2000',
    paid: '1500',
    paymentDate: '2025-03-02',
    balance: '500',
    status: 'rejected'
  }
];

interface TUFilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
}

export const TechnicalConditionsPage = () => {
  const [data] = useState<TURecord[]>(initialData);
  const [filteredData, setFilteredData] = useState<TURecord[]>(initialData);

  const handleFilterChange = (filters: TUFilterValues) => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter((item) => item.customer.toLowerCase().includes(filters.search?.toLowerCase() || ''));
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredData(filtered);
  };

  const handleAddClick = () => {
    console.log('Открыть модалку добавления');
  };

  const handleDownloadClick = () => {
    console.log('Генерация PDF');
  };

  const columns: ColumnsType<TURecord> = [
    {
      title: '№ ТУ',
      dataIndex: 'number',
      key: 'number',
      render: (text) => <Typography.Text strong>{text}</Typography.Text>,
      width: 90,
      align: 'center'
    },
    { title: 'Дата регистрации', dataIndex: 'date', key: 'date', width: 150, align: 'center' },
    { title: 'Заказчик', dataIndex: 'customer', key: 'customer', width: 170, align: 'center' },
    { title: 'Адрес', dataIndex: 'address', key: 'address', width: 170, align: 'center' },
    { title: 'Наименование объекта', dataIndex: 'objectName', key: 'objectName', width: 260, align: 'center' },
    { title: 'Количество водопроводной воды', dataIndex: 'waterAmount', key: 'waterAmount', width: 135, align: 'center' },
    {
      title: 'Количество стоков',
      dataIndex: 'wastewaterAmount',
      key: 'wastewaterAmount',
      width: 135,
      align: 'center'
    },
    {
      title: 'Nº и дата договора на оплату за ТУ и разреш.',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      width: 160,
      align: 'center'
    },
    { title: '№ счета на оплату', dataIndex: 'invoiceNumber', key: 'invoiceNumber', width: 160, align: 'center' },
    { title: 'Сумма оплаты за ТУ и разреш', dataIndex: 'paymentAmount', key: 'paymentAmount', width: 145, align: 'center' },
    { title: 'Опачено', dataIndex: 'paid', key: 'paid', width: 145, align: 'center' },
    { title: 'Дата оплаты', dataIndex: 'paymentDate', key: 'paymentDate', width: 145, align: 'center' },
    { title: 'Остаток', dataIndex: 'balance', key: 'balance', width: 145, align: 'center' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (status === 'approved' ? <Tag color='green'>Утверждено</Tag> : <Tag color='red'>Отклонено</Tag>),
      width: 145,
      align: 'center'
    }
  ];

  return (
    <DashboardLayout title='Технические условия'>
      <div className='technical-conditions-page'>
        <TUFilterBar onFilterChange={handleFilterChange} onAddClick={handleAddClick} onDownloadClick={handleDownloadClick} />
        <Table pagination={false} columns={columns} dataSource={filteredData} rowKey='key' bordered scroll={{ x: 'max-content' }} />
        <Pagination />
      </div>
    </DashboardLayout>
  );
};
