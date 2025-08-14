import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { ClockCircleOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { EditProtocolModal } from 'components/EditProtocolModal/EditProtocolModal';
import { InvoicesList } from 'components/InvoicesList/InvoicesList';
import { EnhancedPaymentsTab } from 'components/PaymentsTab/EnhancedPaymentsTab';

import {
  useGenerateInvoiceMutation,
  useGetAccountingProtocolQuery,
  useGetInvoiceByProtocolQuery,
  useLazyDownloadProtocolQuery
} from 'api/Accounting.api';

const { Title, Text } = Typography;

interface IProps {
  technicalConditionId: string;
  onOpenPaymentModal?: () => void;
}

interface IProtocolTableData {
  key: string;
  item: string;
  price: string;
  badge?: string;
}

export const AccountingTab: FC<IProps> = ({ technicalConditionId, onOpenPaymentModal }) => {
  const [activeAccountingTab, setActiveAccountingTab] = useState<string>('1');
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [shouldOpenPaymentModal, setShouldOpenPaymentModal] = useState<boolean>(false);
  const { t } = useTranslation();

  const {
    data: protocolData,
    isLoading: protocolLoading,
    isError: protocolError,
    refetch: refetchProtocol
  } = useGetAccountingProtocolQuery({
    technicalConditionId
  });

  const {
    data: invoicesData,
    isLoading: invoiceLoading,
    isError: invoiceError,
    refetch: refetchInvoice,
    error: invoiceApiError
  } = useGetInvoiceByProtocolQuery({ protocolId: protocolData?.id.toString() || '' }, { skip: !protocolData?.id });
  console.log(invoiceApiError);
  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [downloadProtocol, { isLoading: isDownloading }] = useLazyDownloadProtocolQuery();

  const currency = t('tuDetails.currency');

  useEffect(() => {
    if (onOpenPaymentModal) {
      setActiveAccountingTab('2');
      onOpenPaymentModal();
    }
  }, [onOpenPaymentModal]);

  const handleUpload = () => {
    setActiveAccountingTab('2');
    setShouldOpenPaymentModal(true);
  };

  const handleEditClick = () => {
    setIsEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalVisible(false);
    refetchProtocol();
  };

  const handleGenerateInvoice = async () => {
    if (!protocolData?.id) {
      message.error('Не найден ID протокола');
      return;
    }

    try {
      const response = await generateInvoice({ protocolId: protocolData.id.toString() }).unwrap();
      if (Array.isArray(response) && response.length > 0) {
        message.success(t('accounting.messages.generateInvoiceSuccess') || 'Счета успешно созданы');
        refetchInvoice();
      } else if (!Array.isArray(response)) {
        message.success(t('accounting.messages.generateInvoiceSuccess') || 'Счет успешно создан');
        refetchInvoice();
      } else {
        throw new Error('Empty response array');
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Generate invoice error:', error);

      if (error?.status === 404) {
        message.error('Эндпоинт для генерации счета не найден');
      } else if (error?.status === 400) {
        message.error('Неверные данные для генерации счета');
      } else if (error?.status === 500) {
        message.error('Ошибка сервера при генерации счета');
      } else {
        message.error(t('accounting.messages.generateInvoiceError') || 'Ошибка при генерации счета');
      }
    }
  };

  const handleDownloadProtocol = async () => {
    try {
      const result = await downloadProtocol({ technicalConditionId }).unwrap();
      const url = window.URL.createObjectURL(result);
      const link = document.createElement('a');
      link.href = url;
      link.download = `protocol-${technicalConditionId}.xlsx`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      message.success(t('accounting.messages.protocolDownloaded') || 'Протокол скачан');
    } catch (error) {
      console.error('Download protocol error:', error);
      message.error('Ошибка при скачивании протокола');
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
    return (
      <Alert
        message={t('accounting.errors.loadTitle') || 'Ошибка загрузки'}
        description={t('accounting.errors.loadDesc') || 'Не удалось загрузить данные протокола'}
        type='error'
        showIcon
      />
    );
  }

  const protocolTableData: IProtocolTableData[] = [
    {
      key: '1',
      item: t('protocolDoc.companyName') || 'Название компании',
      price: ''
    },
    {
      key: '2',
      item: t('protocolDoc.vikCostLabel') || 'Стоимость ВИК',
      price: `10080${currency}`
    },
    {
      key: '3',
      item: t('protocolDoc.tuWater') || 'ТУ Водоснабжение',
      price: `${protocolData.water_price}${currency}`
    },
    {
      key: '4',
      item: t('protocolDoc.tuSewer') || 'ТУ Канализация',
      price: `${protocolData.kanal_price}${currency}`
    },
    {
      key: '5',
      item: t('protocolDoc.totalWithoutVat') || 'Итого без НДС',
      price: `${protocolData.total_water_sum}${currency}`,
      badge: t('protocolDoc.takeaway') || 'Вынос'
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
      label: t('protocolDetail.tabs.protocol') || 'Протокол',
      children: (
        <Card>
          <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {t('routers.tuNumberPrefix') || 'ТУ №'}
              {technicalConditionId}-472
            </Title>
            <Space>
              <Button icon={<EditOutlined />} type='primary' onClick={handleEditClick}>
                {t('common.edit') || 'Редактировать'}
              </Button>
              <Button icon={<DownloadOutlined />} type='default' onClick={handleDownloadProtocol} loading={isDownloading}>
                {t('protocolDetail.buttons.downloadProtocol') || 'Скачать протокол'}
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
      label: t('protocolDetail.tabs.payments') || 'Платежи',
      children:
        invoicesData && invoicesData.length > 0 && !invoiceError ? (
          <EnhancedPaymentsTab
            invoices={invoicesData}
            autoOpenModal={shouldOpenPaymentModal}
            onModalOpen={() => setShouldOpenPaymentModal(false)}
          />
        ) : (
          <div>
            {t('accounting.messages.needCreateInvoiceFirst') || 'Сначала необходимо создать счета'}
            {invoiceError && (
              <Alert
                message='Ошибка загрузки счетов'
                description='Возможно, счета еще не созданы или неверный URL API'
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )
    }
  ];

  const hasInvoices = invoicesData && invoicesData.length > 0 && !invoiceError;

  return (
    <>
      <Row gutter={24}>
        <Col span={16}>
          <Tabs activeKey={activeAccountingTab} items={accountingTabItems} onChange={setActiveAccountingTab} />
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: 16 }}>
            {invoiceLoading && (
              <Flex justify='center' style={{ margin: '16px 0' }}>
                <Spin />
              </Flex>
            )}

            {!invoiceLoading && hasInvoices ? (
              <InvoicesList invoices={invoicesData} />
            ) : !invoiceLoading && !hasInvoices ? (
              <>
                <Title level={4}>{t('protocolDetail.invoice.title') || 'Счет на оплату'}</Title>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '12px' }} />
                  <div style={{ marginBottom: '16px' }}>
                    <Text type='secondary'>{t('common.pending') || 'Счета не созданы'}</Text>
                  </div>
                  <Button type='primary' size='large' onClick={handleGenerateInvoice} loading={isGenerating} style={{ minWidth: '160px' }}>
                    {t('protocolDetail.buttons.generateInvoice') || 'Сгенерировать счета'}
                  </Button>
                </div>
              </>
            ) : null}

            {invoiceError && (
              <Alert
                message='Проблема с загрузкой счетов'
                description="Проверьте правильность API endpoint'а"
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </Card>

          <Card>
            <Title level={4}>{t('protocolDetail.invoice.uploadReceipt') || 'Загрузить квитанцию'}</Title>
            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '16px 0'
              }}
            />
            <Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
              {t('tuDetails.hint.uploadToFinishTu') || 'Загрузите документы для завершения ТУ'}
            </Text>

            <Button type='primary' block icon={<UploadOutlined />} onClick={handleUpload}>
              {t('common.upload') || 'Загрузить'}
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
