import { FC } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';

interface ActionsBarProps {
  id: string;
  hasPermission: (perm: string) => boolean;
  onDownloadTu: () => void;
  onAddLoad: () => void;
  onReject: () => void;
  isDownloading: boolean;
  // New props for contract download
  onDownloadContract?: () => void;
  isContractDownloading?: boolean;
  visible?: boolean;
}

export const ActionsBar: FC<ActionsBarProps> = ({
  id,
  hasPermission,
  onDownloadTu,
  onAddLoad,
  onReject,
  isDownloading,
  onDownloadContract,
  isContractDownloading,
  visible = true
}) => {
  const { t } = useTranslation();
  if (!visible) return null;

  return (
    <Flex wrap justify='end' align='center' gap={16} style={{ marginBottom: 16 }}>
      {hasPermission('change_technicalcondition') && <Link to={'/dashboard/add-tu-forms/' + id}>{t('routers.editTy')}</Link>}
      {hasPermission('view_actty') && (
        <Link to={`/dashboard/technical-conditions/history-of-loads/${id}`}>{t('routers.historyOfLoads')}</Link>
      )}
      {hasPermission('view_historicaltechnicalcondition') && (
        <Link to={`/dashboard/ty/${id}/change-history`}>{t('tuDetails.actions.changeTuData')}</Link>
      )}
      {hasPermission('view_technicalcondition') && (
        <>
          <Button icon={<DownloadOutlined />} onClick={onDownloadTu} loading={isDownloading} disabled={!id}>
            {t('tuDetails.actions.downloadTu')}
          </Button>
          <Button onClick={onDownloadContract} icon={<DownloadOutlined />} loading={isContractDownloading} disabled={!id}>
            Скачать договор
          </Button>
        </>
      )}
      {hasPermission('add_actty') && (
        <Button onClick={onAddLoad} icon={<PlusOutlined />}>
          {t('historyOfLoads.addLoad')}
        </Button>
      )}
      {hasPermission('delete_technicalcondition') && (
        <Button danger onClick={onReject}>
          {t('tuDetails.actions.rejectTu')}
        </Button>
      )}
    </Flex>
  );
};
