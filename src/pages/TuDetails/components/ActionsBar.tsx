import { FC } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { IGetTyById } from 'types/entities';

import { useGetAccountingProtocolQuery } from 'api/Accounting.api';
import { useGetTypesTyQuery } from 'api/Ty.api';

interface ActionsBarProps {
  id: string;
  hasPermission: (perm: string) => boolean;
  onDownloadTu: () => void;
  onAddLoad: () => void;
  onReject: () => void;
  onApprove: () => void;
  onRejectTu?: () => void;
  isDownloading: boolean;
  // New props for contract download
  onDownloadContract?: (protocol_id: string) => void;
  isContractDownloading?: boolean;
  // New: Load increase TU DOCX
  onDownloadLoadIncrease?: () => void;
  isLoadIncreaseDownloading?: boolean;
  visible?: boolean;
  data: IGetTyById;
}

export const ActionsBar: FC<ActionsBarProps> = ({
  id,
  hasPermission,
  onDownloadTu,
  // onAddLoad — кнопка "Добавить нагрузку" временно скрыта
  onReject,
  onApprove,
  isDownloading,
  onDownloadContract,
  isContractDownloading,
  // load increase
  onDownloadLoadIncrease,
  isLoadIncreaseDownloading,
  data,
  visible = true
}) => {
  const { t } = useTranslation();
  const { data: protocolData } = useGetAccountingProtocolQuery({ technicalConditionId: id }, { skip: !id });
  const protocolId = protocolData?.id ? String(protocolData.id) : '';

  // Отказ определяем по типу "отказы" (в детальном ответе type_ty приходит числом)
  const typesTyQuery = useGetTypesTyQuery();
  const rawTypeTy = data?.type_ty as number | { id?: number } | undefined;
  const typeTyId = typeof rawTypeTy === 'object' ? rawTypeTy?.id : rawTypeTy;
  const isRefusal = typesTyQuery.data?.find((tt) => tt.id === typeTyId)?.title === 'отказы';

  if (!visible) return null;

  return (
    <Flex wrap justify='end' align='center' gap={16} style={{ marginBottom: 16 }}>
      {hasPermission('change_technicalcondition') && <Link to={'/dashboard/add-tu-forms/' + id}>{t('routers.editTy')}</Link>}
      {hasPermission('view_technicalcondition') && (
        <>
          <Button icon={<DownloadOutlined />} onClick={onDownloadTu} loading={isDownloading} disabled={!id}>
            {t('tuDetails.actions.downloadTu')}
          </Button>
          <Button
            onClick={() => onDownloadContract && protocolId && onDownloadContract(protocolId)}
            icon={<DownloadOutlined />}
            loading={isContractDownloading}
          >
            {t('tuDetails.actions.downloadContract')}
          </Button>
          {(data?.type === 'load_increase' || data?.type_ty === 9) && (
            <Button onClick={onDownloadLoadIncrease} icon={<DownloadOutlined />} loading={isLoadIncreaseDownloading} disabled={!id}>
              {t('tuDetails.actions.downloadLoadIncreaseTu', 'Скачать ТУ на увеличение нагрузок')}
            </Button>
          )}
        </>
      )}
      {/* Кнопка "Добавить нагрузку" временно скрыта (возможно вернём позже) */}
      {/* {hasPermission('add_actty') && (
        <Button onClick={onAddLoad} icon={<PlusOutlined />} disabled={data.status === 'inactive'}>
          {t('historyOfLoads.addLoad')}
        </Button>
      )} */}
      {isRefusal
        ? hasPermission('delete_technicalcondition') && (
            <Button danger disabled>
              {t('tuDetails.actions.rejectedTu', 'Отказано')}
            </Button>
          )
        : data.stage !== 'approved' &&
          data.status !== 'inactive' &&
          data.status !== 'archived' && (
            <>
              {hasPermission('delete_technicalcondition') && (
                <Button danger onClick={onReject}>
                  {t('tuDetails.actions.rejectTu')}
                </Button>
              )}
              {hasPermission('change_technicalcondition') && (
                <Button onClick={onApprove} type='primary'>
                  {t('tuDetails.actions.approveTu')}
                </Button>
              )}
            </>
          )}
    </Flex>
  );
};
