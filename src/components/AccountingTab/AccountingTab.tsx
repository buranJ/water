// src/components/AccountingTab/AccountingTab.tsx
import { FC, useCallback, useEffect, useState } from 'react';
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
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined, EditOutlined, UploadOutlined } from '@ant-design/icons';
import { EditProtocolModal } from 'components/EditProtocolModal/EditProtocolModal';
import { PaymentsTab } from 'components/PaymentsTab/PaymentsTab';

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
    data: invoiceData,
    isLoading: invoiceLoading,
    isError: invoiceError,
    refetch: refetchInvoice
  } = useGetInvoiceByProtocolQuery({ protocolId: protocolData?.id.toString() || '' }, { skip: !protocolData?.id });

  const [generateInvoice, { isLoading: isGenerating }] = useGenerateInvoiceMutation();
  const [downloadProtocol, { isLoading: isDownloading }] = useLazyDownloadProtocolQuery();

  const calculateTotalAmount = useCallback(() => {
    if (protocolData) {
      return (parseFloat(protocolData.total_water_sum) + parseFloat(protocolData.total_kanal_sum)).toString();
    }
    return invoiceData?.total_sum || '0';
  }, [protocolData, invoiceData?.total_sum]);

  const actualTotalAmount = calculateTotalAmount();
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
    if (!protocolData?.id) return;

    try {
      await generateInvoice({ protocolId: protocolData.id.toString() }).unwrap();
      message.success(t('accounting.messages.generateInvoiceSuccess'));
      refetchInvoice();
    } catch (error) {
      console.log(error);
    }
  };

  const handleDownloadInvoice = () => {
    if (invoiceData?.pdf_file) {
      window.open(invoiceData.pdf_file, '_blank');
    } else {
      message.info(t('accounting.messages.invoiceFileUnavailable'));
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

      message.success(t('accounting.messages.protocolDownloaded'));
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
    return <Alert message={t('accounting.errors.loadTitle')} description={t('accounting.errors.loadDesc')} type='error' showIcon />;
  }

  const protocolTableData: IProtocolTableData[] = [
    {
      key: '1',
      item: t('protocolDoc.companyName'),
      price: ''
    },
    {
      key: '2',
      item: t('protocolDoc.vikCostLabel'),
      price: `10080${currency}`
    },
    {
      key: '3',
      item: t('protocolDoc.tuWater'),
      price: `${protocolData.water_price}${currency}`
    },
    {
      key: '4',
      item: t('protocolDoc.tuSewer'),
      price: `${protocolData.kanal_price}${currency}`
    },
    {
      key: '5',
      item: t('protocolDoc.totalWithoutVat'),
      price: `${protocolData.total_water_sum}${currency}`,
      badge: t('protocolDoc.takeaway')
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
      label: t('protocolDetail.tabs.protocol'),
      children: (
        <Card>
          <Flex justify='space-between' align='center' style={{ marginBottom: 16 }}>
            <Title level={4} style={{ margin: 0 }}>
              {t('routers.tuNumberPrefix')}
              {technicalConditionId}-472
            </Title>
            <Space>
              <Button icon={<EditOutlined />} type='primary' onClick={handleEditClick}>
                {t('common.edit')}
              </Button>
              <Button icon={<DownloadOutlined />} type='default' onClick={handleDownloadProtocol} loading={isDownloading}>
                {t('protocolDetail.buttons.downloadProtocol')}
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
      label: t('protocolDetail.tabs.payments'),
      children:
        invoiceData && !invoiceError ? (
          <PaymentsTab
            invoiceId={invoiceData.id.toString()}
            totalAmount={actualTotalAmount}
            autoOpenModal={shouldOpenPaymentModal}
            onModalOpen={() => setShouldOpenPaymentModal(false)}
          />
        ) : (
          <div>{t('accounting.messages.needCreateInvoiceFirst')}</div>
        )
    }
  ];

  return (
    <>
      <Row gutter={24}>
        <Col span={16}>
          <Tabs activeKey={activeAccountingTab} items={accountingTabItems} onChange={setActiveAccountingTab} />
        </Col>

        <Col span={8}>
          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>{t('protocolDetail.invoice.title')}</Title>

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
                    <Text>
                      {t('protocolDetail.invoice.title')} #{invoiceData.invoice_number}
                    </Text>
                    {invoiceData.is_paid && <Text type='success'>{t('accounting.messages.paidTag')}</Text>}
                  </>
                ) : (
                  <>
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                    <Text>{t('common.pending')}</Text>
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
                {t('protocolDetail.buttons.downloadInvoice')}
              </Button>
            ) : (
              <Button type='primary' block onClick={handleGenerateInvoice} loading={isGenerating} style={{ marginBottom: 16 }}>
                {t('protocolDetail.buttons.generateInvoice')}
              </Button>
            )}
          </Card>

          <Card>
            <Title level={4}>{t('protocolDetail.invoice.uploadReceipt')}</Title>
            <div
              style={{
                backgroundColor: '#327BE8',
                height: 8,
                borderRadius: 4,
                margin: '16px 0'
              }}
            />
            <Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
              {t('tuDetails.hint.uploadToFinishTu')}
            </Text>

            <Button type='primary' block icon={<UploadOutlined />} onClick={handleUpload}>
              {t('common.upload')}
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
