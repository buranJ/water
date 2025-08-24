import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Space, Typography } from 'antd';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import type { IGetTyById } from 'types/entities/tu';

const { Title, Text } = Typography;

interface DataSectionProps {
  objectData: IGetTyById;
}

export const DataSection: FC<DataSectionProps> = ({ objectData }) => {
  const { t } = useTranslation();

  const statusRender = (status: IStatus6b3Enum) => {
    switch (status) {
      case 'active':
        return <Text type='warning'>{t('tuDetails.status.active')}</Text>;
      case 'inactive':
        return <Text type='success'>{t('tuDetails.status.inactive')}</Text>;
      case 'archived':
        return <Text type='danger'>{t('tuDetails.status.archived')}</Text>;
    }
  };

  const stageRender = (stage: IStageEnum) => {
    switch (stage) {
      case 'draft':
        return <Text type='secondary'>{t('tuDetails.stage.draft')}</Text>;
      case 'review':
        return <Text type='warning'>{t('tuDetails.stage.review')}</Text>;
      case 'approved':
        return <Text type='success'>{t('tuDetails.stage.approved')}</Text>;
      case 'done':
        return <Text type='success'>{t('tuDetails.stage.done')}</Text>;
      default:
        return <Text type='secondary'>{t('tuDetails.stage.unknown')}</Text>;
    }
  };

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.objectName')}</Title>
        <Text>{objectData?.object_name || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.applicationInfo')}</Title>
        <Text strong>{t('tuDetails.labels.requestNumber')}</Text> <Text>{objectData?.request_number || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.requestDate')}</Text> <Text>{(objectData?.request_date as string) || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.requestSource')}</Text> <Text>{objectData?.request_source || '—'}</Text>
        <br />
        <br />
        {objectData?.status && (
          <Space>
            <Text strong>{t('common.status')}</Text>
            <Text>{statusRender(objectData?.status) || '—'}</Text>
          </Space>
        )}
        <br />
        {objectData?.stage && (
          <Space>
            <Text strong>{t('tuDetails.labels.stage')}</Text>
            <Text>{stageRender(objectData?.stage) || '—'}</Text>
          </Space>
        )}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.additionalCharacteristics')}</Title>
        <Text strong>{t('tuDetails.labels.connectionTarget')}</Text> <Text>{objectData?.connection_target || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.streetPass')}</Text> <Text>{objectData?.street_pass || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.collector')}</Text> <Text>{objectData?.collector || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireFighting')}</Text> <Text>{objectData?.fire_fighting || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput1')}</Text> <Text>{objectData?.fire_input_1 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.fireInput2')}</Text> <Text>{objectData?.fire_input_2 || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.notes')}</Text> <Text>{objectData?.notes || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.payment')}</Title>
        <Text strong>{t('tuDetails.labels.paymentInvoiceNumber')}</Text> <Text>{objectData?.payment_invoice_number || '—'}</Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentPaper')}</Text>{' '}
        <Text>
          {objectData?.payment_paper || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentConnection')}</Text>{' '}
        <Text>
          {objectData?.payment_connection || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentAmount')}</Text>{' '}
        <Text>
          {objectData?.payment_amount || '—'} {t('tuDetails.currency')}
        </Text>
        <br />
        <Text strong>{t('tuDetails.labels.paymentDeadline')}</Text> <Text>{(objectData?.payment_deadline as string) || '—'}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.customer')}</Title>
        <Text>{objectData?.customer?.full_name}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.objectLocation')}
        </Title>
        <Text>{objectData?.address}</Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.waterRequired')}
        </Title>
        <Text>
          {objectData?.water_required} {t('tuDetails.units.m3PerDay')}
        </Text>
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.pressureRequired')}
        </Title>
        <Text>
          {objectData?.pressure_required} {t('tuDetails.units.mWaterCol')}
        </Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.waterSupply')}</Title>
        <Text>{objectData?.water_pipe || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card>
        <Title level={4}>{t('tuDetails.titles.sewer')}</Title>
        <Text>{objectData?.sewer || t('tuDetails.notSpecified')}</Text>
      </Card>
    </>
  );
};
