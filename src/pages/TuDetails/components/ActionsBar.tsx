import { FC, useRef } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button, Flex, message, Popconfirm, Typography } from 'antd';
import { DeleteOutlined, DownloadOutlined, PaperClipOutlined, UploadOutlined } from '@ant-design/icons';
import { IGetTyById } from 'types/entities';

import { useGetAccountingProtocolQuery } from 'api/Accounting.api';
import { useDeleteTyFileMutation, useGetTyFileQuery, useGetTypesTyQuery, useUploadTyFileMutation } from 'api/Ty.api';

interface ActionsBarProps {
  id: string;
  hasPermission: (perm: string) => boolean;
  onDownloadTu: () => void;
  onAddLoad: () => void;
  onReject: () => void;
  onApprove: () => void;
  onRestore?: () => void;
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
  onRestore,
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

  // Файл ТУ (произвольный документ, прикладываемый вручную; не связан с /protocol-docx/)
  const tyFileQuery = useGetTyFileQuery({ ty_id: id }, { skip: !id });
  const [uploadTyFile, { isLoading: isUploadingTyFile }] = useUploadTyFileMutation();
  const [deleteTyFile, { isLoading: isDeletingTyFile }] = useDeleteTyFileMutation();
  const tyFileInputRef = useRef<HTMLInputElement>(null);
  const tyFile = tyFileQuery.data?.file ? tyFileQuery.data : undefined;

  const handleTyFilePickClick = () => {
    tyFileInputRef.current?.click();
  };

  const handleTyFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !id) return;
    try {
      await uploadTyFile({ ty_id: id, file }).unwrap();
      message.success(t('tuDetails.messages.tyFileUploaded', 'Файл ТУ загружен'));
    } catch {
      message.error(t('tuDetails.messages.tyFileUploadFailed', 'Не удалось загрузить файл ТУ'));
    }
  };

  const handleTyFileDelete = async () => {
    if (!id) return;
    try {
      await deleteTyFile({ ty_id: id }).unwrap();
      message.success(t('tuDetails.messages.tyFileDeleted', 'Файл ТУ удалён'));
    } catch {
      message.error(t('tuDetails.messages.tyFileDeleteFailed', 'Не удалось удалить файл ТУ'));
    }
  };

  if (!visible) return null;

  return (
    <Flex wrap justify='end' align='center' gap={16} style={{ marginBottom: 16 }}>
      {hasPermission('change_technicalcondition') && <Link to={'/dashboard/add-tu-forms/' + id}>{t('routers.editTy')}</Link>}

      {hasPermission('view_technicalcondition') && !tyFileQuery.isLoading && (
        <>
          <input ref={tyFileInputRef} type='file' style={{ display: 'none' }} onChange={handleTyFileSelected} />
          {tyFile ? (
            <>
              <Typography.Link href={tyFile.file} target='_blank' rel='noopener noreferrer'>
                <PaperClipOutlined /> {t('tuDetails.actions.tyFile', 'Файл ТУ')}
              </Typography.Link>
              {hasPermission('change_technicalcondition') && (
                <>
                  <Button icon={<UploadOutlined />} loading={isUploadingTyFile} onClick={handleTyFilePickClick} disabled={!id}>
                    {t('tuDetails.actions.replaceTyFile', 'Заменить')}
                  </Button>
                  <Popconfirm
                    title={t('tuDetails.actions.deleteTyFileConfirm', 'Удалить файл ТУ?')}
                    onConfirm={handleTyFileDelete}
                    okText='Да'
                    cancelText='Нет'
                  >
                    <Button danger icon={<DeleteOutlined />} loading={isDeletingTyFile}>
                      {t('tuDetails.actions.deleteTyFile', 'Удалить')}
                    </Button>
                  </Popconfirm>
                </>
              )}
            </>
          ) : (
            hasPermission('change_technicalcondition') && (
              <Button icon={<UploadOutlined />} loading={isUploadingTyFile} onClick={handleTyFilePickClick} disabled={!id}>
                {t('tuDetails.actions.uploadTyFile', 'Загрузить файл')}
              </Button>
            )
          )}
        </>
      )}

      {isRefusal && hasPermission('change_technicalcondition') && (
        <Button type='primary' ghost onClick={onRestore}>
          {t('tuDetails.actions.restoreTu', 'Восстановить')}
        </Button>
      )}
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
