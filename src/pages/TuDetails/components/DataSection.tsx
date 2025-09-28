import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Typography } from 'antd';
import type { IGetTyById } from 'types/entities/tu';

import { useGetCustomerByIdQuery } from 'api/Customer.api';

const { Title, Text } = Typography;

interface DataSectionProps {
  objectData: IGetTyById;
}

export const DataSection: FC<DataSectionProps> = ({ objectData }) => {
  const { t } = useTranslation();

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

      {/* <Card style={{ marginBottom: 24 }}>
        <Title level={4}>{t('tuDetails.titles.applicationInfo')}</Title>
        <Text strong>{t('tuDetails.labels.requestDate')}</Text> <Text>{(objectData?.request_date as string) || '—'}</Text>
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
        <br />
        <br />
        <br />
      </Card> */}

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
