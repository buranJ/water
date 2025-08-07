// src/components/AccountingTab/AccountingTab.tsx
import { FC, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Flex,
  message,
  Row,
  Space,
  Spin,
  Table,
  TableColumnsType,
  Tabs,
  TabsProps,
  Typography
} from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { EditProtocolModal } from 'components/EditProtocolModal/EditProtocolModal';

import {
  useGenerateInvoiceMutation,
  useGetAccountingProtocolQuery,
  useGetInvoiceByProtocolQuery,
  useLazyDownloadProtocolQuery
} from 'api/Accounting.api';

const { Title, Text } = Typography;

interface IProps {
  technicalConditionId: string;
}

interface IProtocolTableData {
  key: string;
  item: string;
  price: string;
  badge?: string;
}

export const AccountingTab: FC<IProps> = ({ technicalConditionId }) => {
  const [uploadStatus, setUploadStatus] = useState<'waiting' | 'uploaded'>('waiting');
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);

  const {
    data: protocolData,
    isLoading: protocolLoading,
    isError: protocolError,
    refetch: refetchProtocol
  } = useGetAccountingProtocolQuery({
    technicalConditionId
  });

  const {
    data: invoiceData,
    isLoading: invoiceLoading,
    isError: invoiceError,
    refetch: refetchInvoice
  } = useGetInvoiceByProtocolQuery({ protocolId: protocolData?.id.toString() || '' }, { skip: !protocolData?.id });

  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [downloadProtocol, { isLoading: isDownloading }] = useLazyDownloadProtocolQuery();

  const handleUpload = () => {
    setUploadStatus('uploaded');
    message.success('Чек успешно загружен');
  };

  const handleEditClick = () => {
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    // Принудительно обновляем данные после закрытия модалки
    refetchProtocol();
  };

  const handleGenerateInvoice = async () => {
    if (!protocolData?.id) return;

    try {
      await generateInvoice({ protocolId: protocolData.id.toString() }).unwrap();
      message.success('Счет успешно сгенерирован');
      refetchInvoice();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadInvoice = () => {
    if (invoiceData?.pdf_file) {
      window.open(invoiceData.pdf_file, '_blank');
    } else {
      message.info('Файл счета недоступен для скачивания');
    }
  };

  const handleDownloadProtocol = async () => {
    try {
      const result = await downloadProtocol({ technicalConditionId }).unwrap();

      // Создаем ссылку для скачивания
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol-${technicalConditionId}.xlsx`;
      document.body.appendChild(link);
      link.click();

      // Очищаем ресурсы
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      message.success('Протокол успешно скачан');
    } catch (error) {
      console.log(error);
    }
  };

  if (protocolLoading) {
    return (
      <Flex justify='center' align='center' style={{ minHeight: 200 }}>
        <Spin size='large' />
      </Flex>
    );
  }

  if (protocolError || !protocolData) {
    return <Alert message='Ошибка загрузки' description='Не удалось загрузить данные бухгалтерии' type='error' showIcon />;
  }

  const protocolTableData: IProtocolTableData[] = [
    {
      key: '1',
      item: 'МП "Бишкектеплосеть"',
      price: ''
    },
    {
      key: '2',
      item: 'Ст-ть подключ. ВиК сом(без НДС)',
      price: '10080KGZ'
    },
    {
      key: '3',
      item: 'ТУ водопровод',
      price: `${protocolData.water_price}KGZ`
    },
    {
      key: '4',
      item: 'ТУ канализация',
      price: `${protocolData.kanal_price}KGZ`
    },
    {
      key: '5',
      item: 'Всего (без НДС)',
      price: `${protocolData.total_water_sum}KGZ`,
      badge: 'На вынос'
    }
  ];

  const columns: TableColumnsType<IProtocolTableData> = [
    {
      title: '',
      dataIndex: 'item',
      key: 'item',
      render: (text: string, record) => (
        <Flex justify='space-between' align='center'>
          <Text strong={record.key === '5'}>{text}</Text>
          {record.badge && <Badge count={record.badge} style={{ backgroundColor: '#ff4d4f' }} />}
        </Flex>
      )
    },
    {
      title: '',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (text: string, record) => <Text strong={record.key === '5'}>{text}</Text>
    }
  ];

  const accountingTabItems: TabsProps['items'] = [
    {
      key: '1',
      label: 'Протокол',
      children: (
        <Card>
          <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              ТУ №{technicalConditionId}-472
            </Title>
            <Space>
              <Button icon={<EditOutlined />} type='primary' onClick={handleEditClick}>
                Изменить
              </Button>
              <Button icon={<DownloadOutlined />} type='default' onClick={handleDownloadProtocol} loading={isDownloading}>
                Скачать протокол
              </Button>
            </Space>
          </Flex>

          <Table
            dataSource={protocolTableData}
            columns={columns}
            pagination={false}
            showHeader={false}
            size='small'
            bordered
            style={{ marginBottom: 24 }}
          />
        </Card>
      )
    },
    {
      key: '2',
      label: 'Платежи',
      children: <div>Содержимое вкладки Платежи</div>
    }
  ];

  return (
    <>
      <Row gutter={24}>
        <Col span={16}>
          <Tabs items={accountingTabItems} />
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>Счет на оплату</Title>

            {invoiceLoading && (
              <Flex justify='center' style={{ margin: '16px 0' }}>
                <Spin />
              </Flex>
            )}

            {!invoiceLoading && (
              <Flex align='center' gap={8} style={{ marginBottom: 16 }}>
                {invoiceData && !invoiceError ? (
                  <>
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                    <Text>Счет #{invoiceData.invoice_number}</Text>
                    {invoiceData.is_paid && <Text type='success'>(Оплачено)</Text>}
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <Text>В ожидании</Text>
                  </>
                )}
              </Flex>
            )}

            {invoiceData && !invoiceError ? (
              <Button
                type='primary'
                block
                icon={<DownloadOutlined />}
                onClick={handleDownloadInvoice}
                disabled={!invoiceData.pdf_file}
                style={{ marginBottom: 16 }}
              >
                Скачать счет
              </Button>
            ) : (
              <Button type='primary' block onClick={handleGenerateInvoice} loading={isGenerating} style={{ marginBottom: 16 }}>
                Сгенерировать счет на оплату
              </Button>
            )}
          </Card>

          <Card>
            <Title level={4}>Загрузить чек об оплате</Title>
            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '16px 0'
              }}
            />
            <Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
              Загрузите соответствующий документ чтобы завершить создание ТУ
            </Text>

            {uploadStatus === 'uploaded' && (
              <Flex
                align='center'
                gap={8}
                style={{
                  marginBottom: 16,
                  padding: 8,
                  backgroundColor: '#f6ffed',
                  border: '1px solid #b7eb8f',
                  borderRadius: 4
                }}
              >
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <Text>Чек загружен</Text>
              </Flex>
            )}

            <Button type='primary' block icon={<UploadOutlined />} onClick={handleUpload} disabled={uploadStatus === 'uploaded'}>
              {uploadStatus === 'uploaded' ? 'Загружено' : 'Загрузить'}
            </Button>
          </Card>
        </Col>
      </Row>
      <EditProtocolModal
        visible={isEditModalVisible}
        onClose={handleEditModalClose}
        protocolData={protocolData || null}
        onSuccess={refetchProtocol}
      />
    </>
  );
};
