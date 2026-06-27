import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Alert, Button, Card, Col, Flex, message, Row, Spin, Tabs, TabsProps, Typography } from 'antd';
import { CheckCircleTwoTone, ClockCircleTwoTone, EditTwoTone, FileOutlined, QuestionCircleTwoTone } from '@ant-design/icons';
import { ActionsBar } from './components/ActionsBar';
import { DataSection } from './components/DataSection';
import { DocumentsProgress } from './components/DocumentsProgress';
import { AccountingTab } from 'components/AccountingTab/AccountingTab';
import { DashboardLayout } from 'components/DashboardLayout';
import { RejectApplicationModal } from 'components/Modal/RejectApplicationModal';
import { IActEnum } from 'types/common';
import type { ITyBody } from 'types/entities';
import AddLoadModal from './AddLoadModal';
import { Architecture } from './Tabs';

import { useGetUserInfoQuery } from 'api/Auth.api';
import { useLazyDownloadContractDocxQuery } from 'api/Buhgalteria.api';
import { useGetFoldersQuery } from 'api/FileFolder.api';
import { type RefusalBody, useCreateRefusalMutation } from 'api/Refusal.api';
import {
  useCreateActTyMutation,
  useCreateBalanceAcceptanceMutation,
  useGenerateActTyMutation,
  useGenerateDopTyMutation,
  useGetBalanceAcceptanceQuery,
  useGetDopTyQuery,
  useGetTyByIdQuery,
  useLazyDownloadLoadIncreaseDocxQuery,
  useLazyDownloadProtocolDocxQuery,
  // useLazyGetActTyByIdQuery,
  usePatchActTyMutation,
  usePutBalanceAcceptanceMutation,
  useUpdateActTyMutation,
  useUpdateTyMutation,
  useUploadDopTyMutation
} from 'api/Ty.api';
import { usePermissions } from 'hooks/useAuth';
import { t } from 'i18next';
import { downloadServerFile } from 'utils/downloadFile';

type WithCategory = { category?: { id?: string | number; title?: string } };

const normalize = (s?: string) => (s ? s.toLowerCase().trim() : '');
const idsEqual = (a?: string | number, b?: string | number) => String(a ?? '') === String(b ?? '');

const makeByCategory =
  <T extends WithCategory>(list?: T[]) =>
  (categoryId?: string | number, categoryTitle?: string): T[] =>
    (list ?? []).filter((item) => {
      const byId = categoryId !== undefined && idsEqual(item.category?.id, categoryId);
      const byTitle = !!categoryTitle && normalize(item.category?.title) === normalize(categoryTitle);
      return byId || byTitle;
    });

const { Title, Text } = Typography;

interface IProps {
  title: string;
}

export const TuDetails: FC<IProps> = ({ title }) => {
  const { id } = useParams<{ id: string }>();
  const userQuery = useGetUserInfoQuery();
  const foldersQuery = useGetFoldersQuery({ ty_id: id || '' });
  const { hasPermission } = usePermissions();

  const [searchParams, setSearchParams] = useSearchParams();

  const {
    data: objectData,
    isLoading,
    isError,
    refetch
  } = useGetTyByIdQuery(
    {
      tyId: id || ''
    },
    {
      skip: !id
    }
  );

  // В заголовке показываем исходящий номер ТУ (а не id из роута); фолбэк — id
  const tuNumber = objectData?.tu_number || id;

  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || '1');
  const [isAddLoadVisible, setIsAddLoadVisible] = useState<boolean>(false);

  const [triggerDownload, { isFetching: isDownloading }] = useLazyDownloadProtocolDocxQuery();
  const [triggerLoadIncrease, { isFetching: isLoadIncreaseDownloading }] = useLazyDownloadLoadIncreaseDocxQuery();
  const [triggerContractDownload, { isFetching: isContractDownloading }] = useLazyDownloadContractDocxQuery();
  const [updateTy] = useUpdateTyMutation();
  const [patchActTy] = usePatchActTyMutation();
  const [createAct, { isLoading: isActCreating }] = useCreateActTyMutation();
  const [updateActTy, { isLoading: isActUpdating }] = useUpdateActTyMutation();
  // const [triggerGetAct, { isFetching: isActFetching }] = useLazyGetActTyByIdQuery();
  const [generateActTy, { isLoading: isGeneratingActTy }] = useGenerateActTyMutation();

  const balanceQuery = useGetBalanceAcceptanceQuery({ ty_id: id || '' }, { skip: !id });
  const [createBalance, { isLoading: isBalanceCreating }] = useCreateBalanceAcceptanceMutation();
  const [updateBalance, { isLoading: isBalanceUpdating }] = usePutBalanceAcceptanceMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const balanceFileInputRef = useRef<HTMLInputElement>(null);
  const [createRefusal] = useCreateRefusalMutation();
  const balanceData = balanceQuery.data as import('types/requests').IGetBalanceAcceptanceResponse;

  const dopTyQuery = useGetDopTyQuery({ ty_id: id || '' }, { skip: !id });
  const [generateDopTy, { isLoading: isGeneratingDopTy }] = useGenerateDopTyMutation();
  const [uploadDopTy, { isLoading: isUploadingDopTy }] = useUploadDopTyMutation();
  const dopTyData = dopTyQuery.data as import('types/requests').IGetDopTyResponse | undefined;
  const dopTyFileInputRef = useRef<HTMLInputElement>(null);

  const isTuApproved = objectData?.stage === 'approved';

  const getActStatusLabel = (st?: IActEnum) => {
    const map: Record<IActEnum, string> = {
      draft: t('tuDetails.act.status.draft', 'Черновик'),
      review: t('tuDetails.act.status.review', 'На рассмотрении'),
      approved: t('tuDetails.act.status.approved', 'Утвержден'),
      done: t('tuDetails.act.status.done', 'Завершен')
    };
    return st ? map[st] : t('tuDetails.act.status.none', 'Нет акта');
  };

  const getActStatusIcon = (st?: IActEnum) => {
    switch (st) {
      case 'draft':
        return <EditTwoTone twoToneColor='#fa8c16' />;
      case 'review':
        return <ClockCircleTwoTone twoToneColor='#327BE8' />;
      case 'approved':
        return <CheckCircleTwoTone twoToneColor='#52c41a' />;
      case 'done':
        return <CheckCircleTwoTone twoToneColor='#389e0d' />;
      default:
        return <QuestionCircleTwoTone twoToneColor='#8c8c8c' />;
    }
  };

  const handleRejectClick = (): void => {
    setIsModalVisible(true);
  };

  const handleApproveClick = async () => {
    if (!id) return;
    try {
      await updateTy({ id, body: { ...objectData, stage: 'approved' } as unknown as ITyBody }).unwrap();
      message.success(t('tuDetails.messages.approved', 'ТУ одобрены'));
      refetch();
    } catch (e) {
      console.error('Failed to approve TU', e);
      message.error(t('tuDetails.messages.approveFailed', 'Не удалось одобрить ТУ'));
    }
  };

  const handleRejectTu = async () => {
    if (!id) return;
    try {
      await updateTy({ id, body: { ...objectData, status: 'rejected' } as unknown as ITyBody }).unwrap();
      message.success(t('tuDetails.messages.tuRejected', 'ТУ отклонено'));
      refetch();
    } catch (e) {
      console.error('Failed to reject TU', e);
      message.error(t('tuDetails.messages.tuRejectFailed', 'Не удалось отказать ТУ'));
    }
  };

  const handleRejectSubmit = async (data: RefusalBody) => {
    if (!id) return;
    try {
      await createRefusal({
        ty: id,
        causes_ids: (data.causes_ids as (number | string)[]).map((v) => Number(v)),
        comment: data.comment,
        refusal_files: data.refusal_files || []
      }).unwrap();
      message.success(t('tuDetails.messages.rejected', 'Отказ создан'));
      setIsModalVisible(false);
      refetch();
    } catch (e) {
      console.error('Failed to create refusal', e);
      message.error(t('tuDetails.messages.rejectFailed', 'Не удалось создать отказ'));
    }
  };

  const handleModalCancel = (): void => {
    setIsModalVisible(false);
  };

  const handleTabChange = (key: string): void => {
    setActiveTab(key);
    const next = new URLSearchParams(searchParams);
    next.set('tab', key);
    setSearchParams(next);
  };

  const commonFolders = useMemo(
    () => [...(foldersQuery.data?.custom || []), ...(foldersQuery.data?.required || [])],
    [foldersQuery.data?.custom, foldersQuery.data?.required]
  );
  const getRequiredByCategory = useMemo(() => makeByCategory(foldersQuery.data?.required), [foldersQuery.data?.required]);
  const getCustomByCategory = useMemo(() => makeByCategory(foldersQuery.data?.custom), [foldersQuery.data?.custom]);

  const getCategoryLabel = useCallback((title: string) => {
    switch (title.toLowerCase()) {
      case 'архитектура':
        return t('tuDetails.tabs.architecture');
      case 'документы':
        return t('tuDetails.tabs.documents');
      case 'бухгалтерия':
        return t('tuDetails.tabs.accounting');
      default:
        return title;
    }
  }, []);

  const dynamicTabs: TabsProps['items'] = useMemo(
    () =>
      userQuery.data?.user.allowed_categories?.map((category, index) => {
        let content: React.ReactNode = <Text>{t('tuDetails.contentNotImplemented', { title: category.title })}</Text>;

        switch (category.title.toLowerCase()) {
          case 'бухгалтерия':
            content = id ? <AccountingTab data={objectData} technicalConditionId={id} /> : null;
            break;
          default:
            content = (
              <Architecture
                categoryId={category.id}
                documentsRequire={getRequiredByCategory(category.id, category.title)}
                documentsCustom={getCustomByCategory(category.id, category.title)}
              />
            );
            break;
        }

        return {
          key: category.title.toLowerCase() === 'бухгалтерия' ? 'accounting' : `dynamic-${index + 2}`,
          label: getCategoryLabel(category.title),
          children: content
        };
      }) || [],
    [userQuery.data?.user.allowed_categories, getCategoryLabel, id, objectData, getRequiredByCategory, getCustomByCategory]
  );

  const tabItems: TabsProps['items'] = useMemo(
    () => [
      {
        key: '1',
        label: t('tuDetails.tabs.data'),
        children: objectData ? <DataSection objectData={objectData} /> : null
      },
      ...dynamicTabs
    ],
    [objectData, dynamicTabs]
  );

  useEffect(() => {
    const validKeys = (tabItems || []).map((i) => i?.key as string);
    const urlTab = searchParams.get('tab') || '1';
    const next = validKeys.includes(urlTab) ? urlTab : '1';
    if (next !== activeTab) {
      setActiveTab(next);
    }
  }, [searchParams, tabItems, activeTab]);

  const handleAddLoad = () => {
    setIsAddLoadVisible(true);
  };

  const handleDownloadTu = async () => {
    if (!id) return;
    try {
      const { blob, filename } = await triggerDownload({ tyId: id }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `technical_condition_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download TU DOCX', error);
    }
  };

  const handleDownloadLoadIncrease = async () => {
    if (!id) return;
    try {
      const { blob, filename } = await triggerLoadIncrease({ tyId: id }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `load_increase_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download Load Increase DOCX', error);
    }
  };

  const handleDownloadContract = async (protocol_id: string) => {
    if (!id) return;
    const customerType = objectData?.customer?.type;
    if (!customerType) {
      console.error('Cannot download contract: missing customer type');
      message.warning(t('tuDetails.messages.customerRequiredForContract', 'Для скачивания договора укажите заказчика'));
      return;
    }
    try {
      const { blob, filename } = await triggerContractDownload({ ty_id: protocol_id, customer_type: customerType }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `contract_${id}.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download contract DOCX', error);
    }
  };

  const handleCreateAndFinishAct = async () => {
    if (!id) return;
    if (objectData?.stage !== 'approved') {
      message.warning(t('tuDetails.act.messages.mustBeApproved', 'Действие доступно только после утверждения ТУ'));
      return;
    }
    try {
      const created = await createAct({ ty: id, status: 'draft' }).unwrap();
      const actId = created?.id;
      if (!actId) {
        message.error(t('tuDetails.act.messages.createFailed', 'Не удалось создать акт'));
        return;
      }
      await patchActTy({ id: actId, body: { status: 'done' } }).unwrap();
      message.success(t('tuDetails.act.messages.statusUpdated', 'Статус акта обновлён'));
      refetch();
    } catch (e) {
      console.error('[ACT CREATE+FINISH] failed', e);
      message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
    }
  };

  const handleFinishAct = async () => {
    if (!objectData?.act?.id) {
      message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
      return;
    }
    try {
      await patchActTy({ id: objectData.act.id, body: { status: 'done' } }).unwrap();
      message.success(t('tuDetails.act.messages.statusUpdated', 'Статус акта обновлён'));
      refetch();
    } catch (e) {
      console.error('[ACT FINISH] failed', e);
      message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось изменить статус акта'));
    }
  };

  const handleUploadActClick = () => {
    fileInputRef.current?.click();
  };

  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!id) return;

    console.log('[ACT UPLOAD] Starting upload');
    console.log('[ACT UPLOAD] TU ID:', id);
    console.log('[ACT UPLOAD] File:', file.name);

    try {
      if (objectData?.act?.id) {
        // ✅ ОБНОВЛЕНИЕ: используем ID ТУ, а не ID акта!
        console.log('[ACT UPLOAD] Updating act for TU:', id);

        await updateActTy({
          id: id, // ✅✅✅ ID ТУ (893), НЕ ID АКТА!
          file,
          status: 'done',
          ty: id // ✅ ID ТУ
        }).unwrap();
      } else {
        // ✅ СОЗДАНИЕ: используем ID ТУ
        console.log('[ACT UPLOAD] Creating new act for TU:', id);

        await createAct({
          ty: id, // ✅ ID ТУ
          file,
          status: 'done'
        }).unwrap();
      }

      message.success(t('tuDetails.act.messages.fileUploaded', 'Файл акта загружен'));
      await refetch();
    } catch (err) {
      console.error('[ACT UPLOAD] Error:', err);
      message.error(t('tuDetails.act.messages.uploadFailed', 'Не удалось загрузить акт'));
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };
  const handleUploadBalanceClick = () => {
    balanceFileInputRef.current?.click();
  };

  const onBalanceFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      if (balanceData && balanceData.id) {
        const payloadUpdate: import('types/requests').IPutBalanceAcceptanceParams['body'] = { ty: id, file };
        await updateBalance({ ty_id: id, body: payloadUpdate }).unwrap();
      } else {
        const payloadCreate: import('types/requests').ICreateBalanceAcceptanceParams['body'] = { ty: id, file };
        await createBalance({ body: payloadCreate }).unwrap();
      }
      message.success(t('tuDetails.act.messages.fileUploaded', 'Файл загружен'));
      await balanceQuery.refetch();
    } catch (err) {
      console.error('[BALANCE UPLOAD] failed', err);
      message.error(t('tuDetails.act.messages.uploadFailed', 'Не удалось загрузить файл'));
    } finally {
      if (balanceFileInputRef.current) balanceFileInputRef.current.value = '';
    }
  };

  const handleDownloadBalance = async () => {
    try {
      const fileVal = balanceData?.file;
      if (!fileVal) {
        message.warning(t('tuDetails.act.messages.fileRequired', 'Выберите файл'));
        return;
      }
      if (fileVal instanceof File) {
        const url = window.URL.createObjectURL(fileVal);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileVal.name || `balance_acceptance_${id}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        return;
      }
      await downloadServerFile(fileVal, `balance_acceptance_${id}`);
    } catch (e) {
      console.error('[BALANCE GET] failed', e);
      message.error(t('tuDetails.act.messages.statusUpdateFailed', 'Не удалось получить данные'));
    }
  };

  const handleGenerateDopTy = async () => {
    if (!id) return;
    try {
      await generateDopTy({ ty_id: id }).unwrap();
      message.success('Дополнения к ТУ успешно сгенерированы');
      await dopTyQuery.refetch();
    } catch (error) {
      console.error('Failed to generate DopTy', error);
      message.error('Не удалось сгенерировать дополнения');
    }
  };

  const handleDownloadDopTy = async () => {
    const fileUrl = dopTyData?.file;
    if (!fileUrl) {
      message.warning('Файл дополнений не найден');
      return;
    }
    await downloadServerFile(fileUrl, `dop_ty_${id}.docx`);
  };

  const handleUploadDopTyClick = () => {
    dopTyFileInputRef.current?.click();
  };

  const onDopTyFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !id) return;
    try {
      await uploadDopTy({ ty_id: id, file }).unwrap();
      message.success('Файл дополнений загружен');
      await dopTyQuery.refetch();
    } catch (err) {
      console.error('[DOP_TY UPLOAD] failed', err);
      message.error('Не удалось загрузить файл дополнений');
    } finally {
      if (dopTyFileInputRef.current) dopTyFileInputRef.current.value = '';
    }
  };

  // Единое надёжное скачивание сгенерированного акта.
  // Файл (/media/...) защищён так же, как всё API — Bearer-токеном из localStorage,
  // поэтому качаем его авторизованным fetch (как handleDownloadTu / протокол / договор),
  // а не cookie-запросом. Это работает одинаково и локально, и на сервере.
  const downloadGeneratedAct = async (type: 'default_act' | 'multi_act', label: string, fallbackName: string) => {
    if (!id) return;

    let fileUrl = '';
    try {
      const response = await generateActTy({ ty_id: id, type }).unwrap();
      fileUrl = response.file_url || '';
    } catch (error) {
      console.error(`Failed to generate act (${type})`, error);
      message.error(t('tuDetails.act.messages.generateFailed', `Не удалось сгенерировать ${label.toLowerCase()}`));
      return;
    }

    if (!fileUrl) {
      message.error(t('tuDetails.act.messages.noFile', 'Сервер не вернул файл акта, попробуйте ещё раз'));
      return;
    }

    await downloadServerFile(fileUrl, fallbackName);
  };

  const handleGenerateSimpleAct = () => downloadGeneratedAct('default_act', 'Простой акт', `simple_act_${id}.docx`);

  const handleGenerateBlockAct = () => downloadGeneratedAct('multi_act', 'Блочный акт', `block_act_${id}.docx`);

  // Скачивание уже загруженного файла акта (objectData.act.file)
  const handleDownloadActFile = async () => {
    const fileUrl = objectData?.act?.file;
    if (!fileUrl) {
      message.warning(t('tuDetails.act.messages.fileRequired', 'Файл акта не найден'));
      return;
    }
    await downloadServerFile(fileUrl, `act_${id}.docx`);
  };

  if (isLoading) {
    return (
      <DashboardLayout title={`${t(title)} ${tuNumber}`}>
        <Flex justify='center' align='center' style={{ minHeight: 200 }}>
          <Spin size='large' />
        </Flex>
      </DashboardLayout>
    );
  }

  if (isError || !objectData) {
    return (
      <DashboardLayout title={`${t(title)} ${tuNumber}`}>
        <Alert message={t('tuDetails.loadError')} description={t('tuDetails.loadErrorDescription')} type='error' showIcon />
      </DashboardLayout>
    );
  }

  const folders = foldersQuery.data;
  const totalRequiredFolders = folders?.required?.length ?? 0;
  const filledRequiredFolders = folders?.required?.filter((item) => item.filled).length ?? 0;
  const percent = totalRequiredFolders > 0 ? (filledRequiredFolders / totalRequiredFolders) * 100 : 0;

  return (
    <DashboardLayout title={`${t(title)} ${tuNumber}`}>
      <ActionsBar
        visible={activeTab === '1'}
        id={id || ''}
        hasPermission={hasPermission}
        onDownloadTu={handleDownloadTu}
        onAddLoad={handleAddLoad}
        onReject={handleRejectClick}
        onApprove={handleApproveClick}
        onRejectTu={handleRejectTu}
        isDownloading={isDownloading}
        onDownloadContract={handleDownloadContract}
        isContractDownloading={isContractDownloading}
        onDownloadLoadIncrease={handleDownloadLoadIncrease}
        isLoadIncreaseDownloading={isLoadIncreaseDownloading}
        data={objectData}
      />

      <Row gutter={24}>
        <Col span={activeTab === '1' ? 16 : 24}>
          <Tabs activeKey={activeTab} items={tabItems} onChange={handleTabChange} />
        </Col>
        {activeTab === '1' && (
          <Col span={8}>
            <DocumentsProgress percent={percent} commonFolders={commonFolders} />

            <Card>
              <Title level={4}>{t('tuDetails.titles.confirmationAct')}</Title>

              {objectData.act?.file && (
                <Row justify='start' align='middle' gutter={8}>
                  <Col>
                    <FileOutlined style={{ color: '#1677ff' }} />
                  </Col>
                  <Col>
                    <Typography.Link onClick={handleDownloadActFile}>
                      {decodeURIComponent(objectData.act!.file!.split('/').pop() || 'act.docx')}
                    </Typography.Link>
                  </Col>
                </Row>
              )}

              <Row justify='space-between' align='middle'>
                <Text>{getActStatusLabel(objectData.act?.status as IActEnum | undefined)}</Text>
                {getActStatusIcon(objectData.act?.status as IActEnum | undefined)}
              </Row>

              <br />

              {isTuApproved && (
                <>
                  <Row gutter={8} style={{ marginBottom: 12 }}>
                    <Col>
                      <Button type='default' loading={isGeneratingActTy} onClick={handleGenerateSimpleAct}>
                        Простой акт
                      </Button>
                    </Col>
                    <Col>
                      <Button type='default' loading={isGeneratingActTy} onClick={handleGenerateBlockAct}>
                        Блочный акт
                      </Button>
                    </Col>
                  </Row>

                  <input ref={fileInputRef} type='file' accept='.pdf,.doc,.docx' style={{ display: 'none' }} onChange={onFileSelected} />
                  <Row gutter={8}>
                    <Col>
                      <Button type='primary' ghost loading={isActCreating || isActUpdating} onClick={handleUploadActClick}>
                        {t('tuDetails.act.actions.upload', 'Загрузить')}
                      </Button>
                    </Col>
                    {objectData.act?.file && (
                      <Col>
                        <Button onClick={handleDownloadActFile}>{t('tuDetails.act.actions.download', 'Скачать')}</Button>
                      </Col>
                    )}
                  </Row>
                </>
              )}

              {isTuApproved &&
                (!objectData.act ? (
                  <Button type='primary' style={{ marginTop: 8, marginLeft: 0, display: 'none' }} onClick={handleCreateAndFinishAct}>
                    {t('tuDetails.act.actions.create', 'Создать акт')}
                  </Button>
                ) : objectData.act.status !== 'done' ? (
                  <Button type='primary' style={{ marginTop: 8, marginLeft: 8 }} onClick={handleFinishAct}>
                    {t('tuDetails.act.actions.finish', 'Завершить')}
                  </Button>
                ) : null)}
            </Card>

            <Card style={{ marginTop: 16 }}>
              <Title level={4}>Информация о принятии на баланс предприятия наружных сетей водопровода и канализации</Title>

              {balanceData?.file && (
                <Row justify='start' align='middle' gutter={8}>
                  <Col>
                    <FileOutlined style={{ color: '#1677ff' }} />
                  </Col>
                  <Col>
                    <Typography.Link onClick={handleDownloadBalance}>
                      {typeof balanceData!.file === 'string'
                        ? decodeURIComponent((balanceData!.file as string).split('/').pop() || 'balance_acceptance.docx')
                        : (balanceData!.file as File)?.name || 'balance_acceptance.docx'}
                    </Typography.Link>
                  </Col>
                </Row>
              )}

              <br />

              {isTuApproved && (
                <>
                  <input
                    ref={balanceFileInputRef}
                    type='file'
                    accept='.pdf,.doc,.docx'
                    style={{ display: 'none' }}
                    onChange={onBalanceFileSelected}
                  />
                  <Row gutter={8}>
                    <Col>
                      <Button type='primary' ghost loading={isBalanceCreating || isBalanceUpdating} onClick={handleUploadBalanceClick}>
                        Загрузить
                      </Button>
                    </Col>
                    {balanceData?.file && (
                      <Col>
                        <Button loading={balanceQuery.isFetching} onClick={handleDownloadBalance}>
                          Скачать
                        </Button>
                      </Col>
                    )}
                  </Row>
                </>
              )}
            </Card>

            <Card style={{ marginTop: 16 }}>
              <Title level={4}>Дополнения к ТУ</Title>

              {dopTyData?.file ? (
                <Row justify='start' align='middle' gutter={8} style={{ marginBottom: 16 }}>
                  <Col>
                    <FileOutlined style={{ color: '#1677ff' }} />
                  </Col>
                  <Col>
                    <Typography.Link onClick={handleDownloadDopTy}>
                      {decodeURIComponent(dopTyData.file.split('/').pop() || 'dop_ty.docx')}
                    </Typography.Link>
                  </Col>
                </Row>
              ) : (
                <Row justify='start' align='middle' gutter={8} style={{ marginBottom: 16 }}>
                  <Col>
                    <FileOutlined style={{ color: '#999' }} />
                  </Col>
                  <Col>
                    <Typography.Text type='secondary'>Файл не загружен</Typography.Text>
                  </Col>
                </Row>
              )}

              <input
                ref={dopTyFileInputRef}
                type='file'
                accept='.pdf,.doc,.docx'
                style={{ display: 'none' }}
                onChange={onDopTyFileSelected}
              />

              <Row gutter={8}>
                {!dopTyData?.file && (
                  <Col>
                    <Button type='primary' loading={isGeneratingDopTy || dopTyQuery.isFetching} onClick={handleGenerateDopTy}>
                      Сгенерировать дополнения
                    </Button>
                  </Col>
                )}

                {dopTyData?.file && (
                  <>
                    <Col>
                      <Button type='primary' ghost loading={isUploadingDopTy} onClick={handleUploadDopTyClick}>
                        Загрузить
                      </Button>
                    </Col>
                    <Col>
                      <Button type='default' loading={dopTyQuery.isFetching} onClick={handleDownloadDopTy}>
                        Скачать
                      </Button>
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          </Col>
        )}
      </Row>

      <RejectApplicationModal open={isModalVisible} onCancel={handleModalCancel} onReject={handleRejectSubmit} />
      <AddLoadModal visible={isAddLoadVisible} onClose={() => setIsAddLoadVisible(false)} tyId={id || ''} />
    </DashboardLayout>
  );
};
