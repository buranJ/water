// src/components/InvoicesList/InvoicesList.tsx
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Flex, Space, Tag, Typography } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, DownloadOutlined } from '@ant-design/icons';
import type { IAccountingInvoice } from 'types/entities/accounting';

const { Title, Text } = Typography;

interface IProps {
  invoices: IAccountingInvoice[];
}

export const InvoicesList: FC<IProps> = ({ invoices }) => {
  const { t } = useTranslation();

  const getInvoiceTypeLabel = (invoiceType: string) => {
    switch (invoiceType) {
      case 'main':
        return { label: t('accounting.invoiceTypeLabels.main'), color: 'blue' };
      case 'paper_tu':
        return { label: t('accounting.invoiceTypeLabels.paper_tu'), color: 'orange' };
      default:
        return { label: invoiceType, color: 'default' };
    }
  };

  const handleDownloadInvoice = (invoice: IAccountingInvoice) => {
    if (invoice.pdf_file) {
      window.open(invoice.pdf_file, '_blank');
    }
  };

  const formatCurrency = (amount: string) => {
    const currency = t('tuDetails.currency') || 'сом';
    return `${parseFloat(amount).toLocaleString()} ${currency}`;
  };

  return (
    <div>
      <Title level={4} style={{ marginBottom: 16 }}>
        {t('protocolDetail.invoice.title') || 'Счета на оплату'} ({invoices.length})
      </Title>

      {invoices.map((invoice) => {
        const typeInfo = getInvoiceTypeLabel(invoice.invoice_type);

        return (
          <Card key={invoice.id} size='small' style={{ marginBottom: 12 }}>
            <Flex justify='space-between' align='center'>
              <div style={{ flex: 1 }}>
                <Flex align='center' gap={8} style={{ marginBottom: 8 }}>
                  {invoice.is_paid ? (
                    <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ClockCircleOutlined style={{ color: '#1890ff' }} />
                  )}
                  <Text strong>#{invoice.invoice_number}</Text>
                  <Tag color={typeInfo.color}>{typeInfo.label}</Tag>
                  {invoice.is_paid && <Tag color='success'>{t('accounting.messages.paidTag') || 'Оплачен'}</Tag>}
                </Flex>

                <div style={{ fontSize: '12px', color: '#666', marginBottom: 4 }}>
                  {t('common.dateLabel')} {new Date(invoice.invoice_date).toLocaleDateString('ru-RU')}
                </div>

                <Flex gap={16} style={{ fontSize: '12px' }}>
                  {parseFloat(invoice.total_water_sum) > 0 && (
                    <Text>
                      {t('accounting.labels.waterSupply')}: {formatCurrency(invoice.total_water_sum)}
                    </Text>
                  )}
                  {parseFloat(invoice.total_kanal_sum) > 0 && (
                    <Text>
                      {t('accounting.labels.sewer')}: {formatCurrency(invoice.total_kanal_sum)}
                    </Text>
                  )}
                  <Text strong>
                    {t('common.totalLabel')} {formatCurrency(invoice.total_sum)}
                  </Text>
                </Flex>
              </div>

              <Space>
                <Button
                  size='small'
                  icon={<DownloadOutlined />}
                  onClick={() => handleDownloadInvoice(invoice)}
                  disabled={!invoice.pdf_file}
                >
                  {t('protocolDetail.buttons.downloadInvoice') || 'Скачать'}
                </Button>
              </Space>
            </Flex>
          </Card>
        );
      })}
    </div>
  );
};
