import { FC, useState } from 'react';
import { Alert, Button, Card, Flex, Space, Spin, Table, TableColumnsType, Tag, Typography } from 'antd';
import { FileTextOutlined, PlusOutlined } from '@ant-design/icons';
import type { IPayment } from 'types/entities/accounting';
import { AddPaymentModal } from './AddPaymentModal';

import { useGetPaymentsByInvoiceQuery } from 'api/Accounting.api';

const { Title, Text } = Typography;

interface IProps {
  invoiceId: string;
  totalAmount: string;
}

export const PaymentsTab: FC<IProps> = ({ invoiceId, totalAmount }) => {
  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);

  const {
    data: paymentsData,
    isLoading,
    isError
  } = useGetPaymentsByInvoiceQuery({
    invoiceId
  });

  const handleAddPayment = () => {
    setIsAddModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsAddModalVisible(false);
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'completed':
        return <Tag color='success'>Поступили</Tag>;
      case 'pending':
        return <Tag color='warning'>В ожидании</Tag>;
      case 'failed':
        return <Tag color='error'>Отклонен</Tag>;
      default:
        return <Tag>Поступили</Tag>;
    }
  };

  const columns: TableColumnsType<IPayment> = [
    {
      title: '№ платежа',
      dataIndex: 'payment_number',
      key: 'payment_number',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Дата',
      dataIndex: 'payment_date',
      key: 'payment_date',
      render: (date: string) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Сумма',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => <Text strong>{amount} KGZ</Text>
    },
    {
      title: 'Источник',
      dataIndex: 'source',
      key: 'source'
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status)
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.receipt_file && (
            <Button size='small' icon={<FileTextOutlined />} onClick={() => window.open(record.receipt_file || '', '_blank')}>
              Чек
            </Button>
          )}
        </Space>
      )
    }
  ];

  if (isLoading) {
    return (
      <Flex justify='center' align='center' style={{ minHeight: 200 }}>
        <Spin size='large' />
      </Flex>
    );
  }

  if (isError) {
    return <Alert message='Ошибка загрузки' description='Не удалось загрузить данные платежей' type='error' showIcon />;
  }

  const totalPaid = paymentsData?.reduce((sum, payment) => sum + parseFloat(payment.amount), 0) || 0;

  const remainingAmount = parseFloat(totalAmount) - totalPaid;

  return (
    <div>
      <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          ТУ №04-472
        </Title>
        <Space>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddPayment}>
            Добавить
          </Button>
          <Button icon={<FileTextOutlined />}>PDF</Button>
        </Space>
      </Flex>

      <Table
        dataSource={paymentsData || []}
        columns={columns}
        rowKey='id'
        pagination={false}
        locale={{ emptyText: 'Нет платежей' }}
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Flex justify='space-between' align='center'>
          <Text strong>
            Оплачено: {totalPaid.toFixed(2)} KGZ / {totalAmount} KGZ
          </Text>
          {remainingAmount > 0 ? (
            <Button type='primary' danger>
              Закрыть счёт
            </Button>
          ) : (
            <Text type='success' strong>
              Счёт полностью оплачен
            </Text>
          )}
        </Flex>
      </Card>

      <AddPaymentModal visible={isAddModalVisible} onClose={handleCloseModal} invoiceId={invoiceId} />
    </div>
  );
};
