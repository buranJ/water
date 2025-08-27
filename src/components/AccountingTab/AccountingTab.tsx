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
import { IGetTyById } from 'types/entities';

import {
  useGenerateInvoiceMutation,
  useGetAccountingProtocolQuery,
  useGetInvoicesByProtocolQuery, // Обновленный хук
  useLazyDownloadProtocolQuery
} from 'api/Accounting.api';
import { useLazyGetInvoicesByProtocolTyQuery } from 'api/Buhgalteria.api';

const { Title, Text } = Typography;

interface IProps {
  technicalConditionId: string;
  onOpenPaymentModal?: () => void;
  data?: IGetTyById;
}

interface IProtocolTableData {
  key: string;
  item: string;
  price: string;
  badge?: string;
}

export const AccountingTab: FC<IProps> = ({ technicalConditionId, data, onOpenPaymentModal }) => {
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
    refetch: refetchInvoice
  } = useGetInvoicesByProtocolQuery({ protocolId: protocolData?.id.toString() || '' }, { skip: !protocolData?.id });

  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [downloadProtocol, { isLoading: isDownloading }] = useLazyDownloadProtocolQuery();
  const [getInvoicesByProtocolTy] = useLazyGetInvoicesByProtocolTyQuery();

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
      message.error(t('accounting.errors.protocolIdNotFound') || 'Не найден ID протокола');
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
      getInvoicesByProtocolTy({ protocol_id: protocolData.id.toString() || '' });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error('Generate invoice error:', error);

      if (error?.status === 404) {
        message.error(t('accounting.errors.endpointNotFound') || 'Эндпоинт для генерации счета не найден');
      } else if (error?.status === 400) {
        message.error(t('accounting.errors.badRequest') || 'Неверные данные для генерации счета');
      } else if (error?.status === 500) {
        message.error(t('accounting.errors.serverError') || 'Ошибка сервера при генерации счета');
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
      message.error(t('accounting.errors.downloadProtocolError') || 'Ошибка при скачивании протокола');
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

  // Обновленная таблица с новыми полями
  const protocolTableData: IProtocolTableData[] = [
    {
      key: '1',
      item: t('protocolDoc.companyName') || 'МП "Бишкектеплосеть"',
      price: ''
    },
    {
      key: '2',
      item: t('protocolDoc.vikCostLabel') || 'Ст-ть подключ. ВиК сом(без НДС)',
      price: `10080${currency}`
    },
    {
      key: '3',
      item: t('protocolDoc.tuWater') || 'ТУ водопровод',
      price: `${protocolData.water_price}${currency}`
    },
    {
      key: '4',
      item: t('protocolDoc.tuSewer') || 'ТУ канализация',
      price: `${protocolData.kanal_price}${currency}`
    },
    {
      key: '5',
      item: t('accounting.protocol.nsp') || 'НСП',
      price: `${protocolData.nsp || '0'}${currency}`
    },
    {
      key: '6',
      item: t('accounting.protocol.nds') || 'НДС',
      price: protocolData.nds ? `${protocolData.nds}${currency}` : t('tuDetails.notSpecified') || 'Не указан'
    },
    {
      key: '7',
      item: t('accounting.protocol.paperWorkWater') || 'Бумажные работы (водопровод)',
      price: `${protocolData.paper_water_sum || '0'}${currency}`
    },
    {
      key: '8',
      item: t('accounting.protocol.paperWorkSewer') || 'Бумажные работы (канализация)',
      price: `${protocolData.paper_kanal_sum || '0'}${currency}`
    },
    {
      key: '9',
      item: t('protocolDoc.totalWithoutVat') || 'Всего (без НДС)',
      price: `${protocolData.total_water_sum}${currency}`,
      badge: t('protocolDoc.takeaway') || 'На вынос'
    }
  ];

  const columns: TableColumnsType<IProtocolTableData> = [
    {
      title: '',
      dataIndex: 'item',
      key: 'item',
      render: (text: string, record) => (
        <Flex justify='space-between' align='center' wrap='wrap' gap={8}>
          <Text strong={record.key === '9'}>{text}</Text>
          {record.badge && <Badge count={record.badge} style={{ backgroundColor: '#ff4d4f' }} />}
        </Flex>
      )
    },
    {
      title: '',
      dataIndex: 'price',
      key: 'price',
      align: 'right' as const,
      render: (text: string, record) => <Text strong={record.key === '9'}>{text}</Text>
    }
  ];

  const accountingTabItems: TabsProps['items'] = [
    {
      key: '1',
      label: t('protocolDetail.tabs.protocol') || 'Протокол',
      children: (
        <Card>
          <Flex justify='space-between' align='flex-start' style={{ marginBottom: 24 }} wrap='wrap' gap={16}>
            <Title level={4} style={{ margin: 0, flex: '1 1 auto', minWidth: 200 }}>
              {t('routers.tuNumberPrefix') || 'ТУ №'}
              {technicalConditionId}-472
            </Title>
            <Space wrap size={[12, 8]} style={{ flex: '0 0 auto' }}>
              <Button icon={<EditOutlined />} type='primary' onClick={handleEditClick} size='middle'>
                {t('common.edit') || 'Редактировать'}
              </Button>
              <Button icon={<DownloadOutlined />} type='default' onClick={handleDownloadProtocol} loading={isDownloading} size='middle'>
                {t('protocolDetail.buttons.downloadProtocol') || 'Скачать протокол'}
              </Button>
            </Space>
          </Flex>

          <div style={{ overflowX: 'auto' }}>
            <Table
              dataSource={protocolTableData}
              columns={columns}
              pagination={false}
              showHeader={false}
              size='middle'
              bordered
              style={{ marginBottom: 0, minWidth: 500 }}
            />
          </div>
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
                message={t('accounting.errors.invoicesLoadTitle') || 'Ошибка загрузки счетов'}
                description={t('accounting.errors.invoicesLoadDesc') || 'Возможно, счета еще не созданы или неверный URL API'}
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </div>
        )
    }
  ];

  const hasInvoices = invoicesData && invoicesData.length > 0 && !invoiceError;

  if (data?.status !== 'active') {
    return 'ТУ находится в архиве';
  }

  return (
    <Space direction='vertical' size={24} style={{ width: '100%' }}>
      {/* Основная область с вкладками - растянута на всю ширину */}
      <div style={{ width: '100%' }}>
        <Tabs activeKey={activeAccountingTab} items={accountingTabItems} onChange={setActiveAccountingTab} tabPosition='top' size='large' />
      </div>

      {/* Секция со счетами и загрузкой - располагается снизу */}
      <Row gutter={[24, 24]}>
        {/* Карточка со счетами */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Card style={{ height: '100%' }} bodyStyle={{ padding: '20px' }}>
            {invoiceLoading && (
              <Flex justify='center' style={{ margin: '20px 0' }}>
                <Spin size='large' />
              </Flex>
            )}

            {!invoiceLoading && hasInvoices ? (
              <>
                <Title level={4} style={{ fontSize: '18px', marginBottom: 20 }}>
                  {t('protocolDetail.invoice.title') || 'Счет на оплату'} ({invoicesData.length})
                </Title>
                <InvoicesList invoices={invoicesData} />
              </>
            ) : !invoiceLoading && !hasInvoices ? (
              <>
                <Title level={4} style={{ fontSize: '18px', marginBottom: 20 }}>
                  {t('protocolDetail.invoice.title') || 'Счет на оплату'}
                </Title>
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <ClockCircleOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
                  <div style={{ marginBottom: '20px' }}>
                    <Text type='secondary' style={{ fontSize: '16px' }}>
                      {t('accounting.labels.invoicesNotFound') || 'Счета не найдены'}
                    </Text>
                  </div>
                  <Button
                    type='primary'
                    size='large'
                    onClick={handleGenerateInvoice}
                    loading={isGenerating}
                    disabled={data?.stage !== 'approved' || data?.status !== 'active'}
                    block
                    style={{ maxWidth: '280px', margin: '0 auto', height: '48px', fontSize: '16px' }}
                  >
                    {t('protocolDetail.buttons.generateInvoice') || 'Сгенерировать счета'}
                  </Button>
                </div>
              </>
            ) : null}

            {invoiceError && (
              <Alert
                message={t('accounting.errors.invoicesWarnTitle') || 'Проблема с загрузкой счетов'}
                description={t('accounting.errors.invoicesWarnDesc') || "Проверьте правильность API endpoint'а"}
                type='warning'
                style={{ marginTop: 16 }}
              />
            )}
          </Card>
        </Col>

        {/* Карточка загрузки квитанции */}
        <Col xs={24} sm={24} md={12} lg={12} xl={12} xxl={12}>
          <Card style={{ height: '100%' }} bodyStyle={{ padding: '20px' }}>
            <Title level={4} style={{ fontSize: '18px', marginBottom: 20 }}>
              {t('protocolDetail.invoice.uploadReceipt') || 'Загрузить квитанцию'}
            </Title>

            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '20px 0'
              }}
            />

            <Text
              type='secondary'
              style={{
                display: 'block',
                marginBottom: 24,
                fontSize: '14px',
                lineHeight: '1.6'
              }}
            >
              {t('tuDetails.hint.uploadToFinishTu') || 'Загрузите документы для завершения ТУ'}
            </Text>

            <Button
              type='primary'
              block
              icon={<UploadOutlined />}
              onClick={handleUpload}
              size='large'
              style={{ height: '48px', fontSize: '16px' }}
            >
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
    </Space>
  );
};
