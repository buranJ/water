import { FC } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Space, Typography } from 'antd';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import type { IGetTyById } from 'types/entities/tu';

import { useGetCustomerByIdQuery } from 'api/Customer.api';

const { Title, Text } = Typography;

interface DataSectionProps {
  objectData: IGetTyById;
}

export const DataSection: FC<DataSectionProps> = ({ objectData }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

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

  // Support both objectData.customer (object) and objectData.cusromer (numeric ID) cases
  type MaybeCusromerId = { cusromer?: number | string };
  type MaybeCustomerName = { customer?: { full_name?: string } };

  const directName = (objectData as MaybeCustomerName)?.customer?.full_name;
  const rawCusromer = (objectData as MaybeCusromerId)?.cusromer;

  let parsedId: number | undefined;
  if (typeof rawCusromer === 'number') {
    parsedId = rawCusromer;
  } else if (typeof rawCusromer === 'string') {
    const n = Number(rawCusromer);
    if (!Number.isNaN(n)) parsedId = n;
  }

  const shouldFetch = !directName && parsedId !== undefined;

  const { data: fetchedCustomer, isFetching: isCustomerLoading } = useGetCustomerByIdQuery(parsedId as number, {
    skip: !shouldFetch
  });

  const displayCustomerName = directName ?? fetchedCustomer?.full_name;

  return (
    <>
      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.objectName')}</Title>
        <Text>{objectData?.object_name || t('tuDetails.notSpecified')}</Text>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.applicationInfo')}</Title>
        <Space>
          <Text strong>{t('tuDetails.labels.requestDate')}</Text>
          <Text>{(objectData?.request_date as string) || '—'}</Text>
        </Space>
        <br />
        {objectData?.status && (
          <Space>
            <Text strong>{t('common.status')}</Text>
            <Text>{statusRender(objectData?.status as IStatus6b3Enum) || '—'}</Text>
          </Space>
        )}
        <br />
        {objectData?.stage && (
          <Space>
            <Text strong>{t('tuDetails.labels.stage')}</Text>
            <Text>{stageRender(objectData?.stage as IStageEnum) || '—'}</Text>
          </Space>
        )}
        <br />
        <br />
        {objectData?.application ? (
          <>
            <Button type='primary' onClick={() => navigate(`/dashboard/applications/${objectData.application?.id}`)}>
              {t('tuDetails.buttons.goToApplication', 'Перейти к заявке')}
            </Button>
            <br />
          </>
        ) : (
          <br />
        )}
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.customer')}</Title>
        <Text>{isCustomerLoading ? t('common.loading', 'Загрузка...') : displayCustomerName || t('tuDetails.notSpecified')}</Text>
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
        <Title level={4} style={{ marginTop: 16 }}>
          {t('tuDetails.titles.sewageAmount')}
        </Title>
        <Text>{objectData?.sewage_amount || '—'}</Text>
      </Card>
    </>
  );
};
