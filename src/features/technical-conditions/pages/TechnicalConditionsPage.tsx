import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button, DatePicker, Form, Input, message, Modal, Space } from 'antd';
import { Table } from 'common/ui';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import { ITechnicalCondition } from 'types/entities';
import { IGetAllTechnicalConditionParams } from 'types/requests';
import { getColumns } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { useCreatePresetMutation, useGetPresetsQuery } from 'api/Presets.api';
import { useExportReportsMutation } from 'api/Reports.api';
import { useGetAllTyQuery, usePatchTyMutation } from 'api/Ty.api';
import { t } from 'i18next';
import { getApiErrorMessage } from 'utils/apiError';

interface TUFilterValues {
  search?: string;
  ordering?: string;
  payment_ordering?: string;
  stage?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
  has_invoice?: boolean | string; // ✅ ИЗМЕНЕНО: может быть строкой ('viewed', 'not_viewed')
  overdue?: boolean;
  due_in_days?: number;
  type_ty?: number;
  id?: number;
  address?: string;
  payment_amount?: number;
  tu_with_loads?: boolean;
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page')) > 0 ? Number(searchParams.get('page')) : 1;
  const pageSize = Number(searchParams.get('page_size')) > 0 ? Number(searchParams.get('page_size')) : 8;

  const s = (key: string) => searchParams.get(key) || undefined;

  const search = s('search');
  const status = (s('status') as IStatus6b3Enum | undefined) || undefined;
  const stage = (s('stage') as IStageEnum | undefined) || undefined;
  const date = s('date');
  const payment_ordering = s('payment_ordering');
  const filterOrdering = s('ordering');
  const hasInvoiceStr = s('has_invoice'); // ✅ Оставляем как строку
  const overdueStr = s('overdue');
  const dueInDaysStr = s('due_in_days');

  // ❌ УДАЛЕНО: const has_invoice = hasInvoiceStr === 'true' ? true : ...
  const overdue = overdueStr === 'true' ? true : overdueStr === 'false' ? false : undefined;
  const due_in_days = dueInDaysStr && !Number.isNaN(Number(dueInDaysStr)) ? Number(dueInDaysStr) : undefined;

  const typeTyStr = s('type_ty');
  const idStr = s('id');
  const addressParam = s('address');
  const paymentAmountStr = s('payment_amount');
  const tuWithLoadsStr = s('tu_with_loads');

  // Column header filters from URL (server-side if backend supports)
  const tuNumberParam = s('tu_number');
  const customerNameParam = s('customer_name');
  const objectNameParam = s('object_name');
  const authorNameParam = s('author_name');

  const type_ty = typeTyStr && !Number.isNaN(Number(typeTyStr)) ? Number(typeTyStr) : undefined;
  const id = idStr && !Number.isNaN(Number(idStr)) ? Number(idStr) : undefined;
  const address = addressParam || undefined;
  const payment_amount = paymentAmountStr && !Number.isNaN(Number(paymentAmountStr)) ? Number(paymentAmountStr) : undefined;
  const tu_with_loads = tuWithLoadsStr === 'true' ? true : tuWithLoadsStr === 'false' ? false : undefined;

  const ordering = [date, payment_ordering, filterOrdering].filter(Boolean).join(', ');

  // ✅ ИЗМЕНЕНО: Собираем базовые параметры БЕЗ has_invoice
  const queryParams: IGetAllTechnicalConditionParams = {
    page,
    page_size: pageSize,
    search,
    status,
    stage,
    type_ty,
    ordering: ordering || '-created_at',
    // has_invoice - убрали отсюда, добавим ниже условно
    overdue,
    due_in_days,
    // Column-level filters (backend may support; fallback is applied on client below)
    address,
    tu_number: tuNumberParam,
    customer_name: customerNameParam,
    object_name: objectNameParam,
    author_name: authorNameParam
  };

  // ✅ НОВАЯ ЛОГИКА: Обрабатываем has_invoice и is_viewed
  if (hasInvoiceStr === 'viewed') {
    // Просмотренные
    queryParams.is_viewed = true;
  } else if (hasInvoiceStr === 'not_viewed') {
    // Не просмотренные
    queryParams.is_viewed = false;
  } else if (hasInvoiceStr === 'true') {
    // Да (есть счет)
    queryParams.has_invoice = true;
  } else if (hasInvoiceStr === 'false') {
    // Нет (нет счета)
    queryParams.has_invoice = false;
  }

  const { data: tuData, isLoading } = useGetAllTyQuery(queryParams, {
    refetchOnMountOrArgChange: true
  });
  const [patchTy] = usePatchTyMutation();

  const { data: presetsData, isFetching: presetsLoading } = useGetPresetsQuery({ target: 'ty', page_size: 100 });
  const [createPreset, { isLoading: creatingPreset }] = useCreatePresetMutation();

  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [exportModal, setExportModal] = useState(false);
  const [saveForm] = Form.useForm();
  const [exportForm] = Form.useForm();
  const [exportReports, { isLoading: exporting }] = useExportReportsMutation();

  const [tableData, setTableData] = useState<ITechnicalCondition[]>([]);

  // Column filters UI state + debounce to update URL/query
  const [columnFilters, setColumnFilters] = useState({
    tu_number: tuNumberParam || '',
    customer_name: customerNameParam || '',
    address: address || '',
    object_name: objectNameParam || ''
  });

  // Sync header inputs with URL if filters were changed externally (e.g., presets/filter bar)
  useEffect(() => {
    setColumnFilters({
      tu_number: tuNumberParam || '',
      customer_name: customerNameParam || '',
      address: address || '',
      object_name: objectNameParam || ''
    });
  }, [tuNumberParam, customerNameParam, address, objectNameParam]);

  const filterDebounceRef = useRef<number | undefined>(undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleColumnFilterChange = (field: 'tu_number' | 'customer_name' | 'address' | 'object_name', value: string) => {
    setColumnFilters((prev) => ({ ...prev, [field]: value }));
    if (filterDebounceRef.current) {
      clearTimeout(filterDebounceRef.current);
    }
    filterDebounceRef.current = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const setOrDelete = (key: string, val: string) => {
        if (!val || val.trim() === '') next.delete(key);
        else next.set(key, val);
      };
      setOrDelete('tu_number', field === 'tu_number' ? value : columnFilters.tu_number);
      setOrDelete('customer_name', field === 'customer_name' ? value : columnFilters.customer_name);
      setOrDelete('address', field === 'address' ? value : columnFilters.address);
      setOrDelete('object_name', field === 'object_name' ? value : columnFilters.object_name);
      next.set('page', '1');
      next.set('page_size', String(pageSize));
      setSearchParams(next, { replace: false });
    }, 400);
  };

  useEffect(() => {
    if (tuData && Array.isArray(tuData.results)) {
      let data = tuData.results;

      if (id !== undefined) {
        data = data.filter((d) => d.id === id);
      }

      if (address) {
        const addr = address.toLowerCase();
        data = data.filter((d) => (d.address || '').toLowerCase().includes(addr));
      }

      if (payment_amount !== undefined) {
        data = data.filter((d) => {
          const amt = parseFloat(String(d.payment_amount).replace(/\s/g, '').replace(',', '.'));
          return !Number.isNaN(amt) && amt === payment_amount;
        });
      }

      if (tu_with_loads !== undefined) {
        data = data.filter((d) => ((d.type || '') === 'load_increase') === tu_with_loads);
      }

      // Column header filters (client-side fallback; server also receives params)
      if (tuNumberParam && tuNumberParam.trim()) {
        const term = tuNumberParam.toLowerCase();
        data = data.filter((d) => (d.tu_number || '').toLowerCase().includes(term));
      }
      if (customerNameParam && customerNameParam.trim()) {
        const term = customerNameParam.toLowerCase();
        data = data.filter((d) => (d.customer?.full_name || '').toLowerCase().includes(term));
      }
      if (objectNameParam && objectNameParam.trim()) {
        const term = objectNameParam.toLowerCase();
        data = data.filter((d) => (d.object_name || '').toLowerCase().includes(term));
      }
      if (authorNameParam && authorNameParam.trim()) {
        const term = authorNameParam.toLowerCase();
        data = data.filter((d) => (d.author_name || '').toLowerCase().includes(term));
      }

      setTableData(data);
    }
  }, [tuData, id, address, payment_amount, tu_with_loads, tuNumberParam, customerNameParam, objectNameParam, authorNameParam]);

  const handleFilterChange = (values: TUFilterValues) => {
    const next = new URLSearchParams(searchParams);
    const { date, payment_ordering, ordering: filterOrd, ...rest } = values;

    const setOrDelete = (key: string, val: unknown) => {
      if (val === undefined || val === null || String(val).trim() === '') next.delete(key);
      else next.set(key, String(val));
    };

    setOrDelete('date', date);
    setOrDelete('payment_ordering', payment_ordering);
    setOrDelete('ordering', filterOrd);

    Object.entries(rest).forEach(([k, v]) => setOrDelete(k, v as unknown));

    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleAddClick = () => {
    navigate('/dashboard/add-tu-forms');
  };

  const handleDownloadClick = () => {
    setExportModal(true);
  };

  const applyPreset = (preset: { query_string: string }) => {
    const next = new URLSearchParams(preset.query_string);
    next.set('page', '1');
    next.set('page_size', String(pageSize));
    setSearchParams(next, { replace: false });
  };

  const handleRequestSavePreset = () => setSaveModalOpen(true);

  const handleSavePresetOk = async () => {
    try {
      const values = await saveForm.validateFields();
      const next = new URLSearchParams(searchParams);
      next.delete('page');
      next.set('page_size', String(pageSize));
      const qs = next.toString();
      await createPreset({ name: values.name, description: values.description, target: 'ty', query_string: qs }).unwrap();
      message.success(t('technicalConditions.presets.saved', 'Шаблон сохранён'));
      setSaveModalOpen(false);
      saveForm.resetFields();
    } catch {
      // ignore
    }
  };

  const downloadFile = (blob: Blob, filename?: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'tu_export_by_query.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportSubmit = async () => {
    let vals: Record<string, unknown>;
    try {
      vals = await exportForm.validateFields();
    } catch {
      // ignore validation/cancel
      return;
    }

    try {
      const sp = new URLSearchParams(searchParams);
      sp.delete('page');
      sp.delete('page_size');
      if (vals?.date_from) sp.set('request_date_start', (vals.date_from as unknown as import('dayjs').Dayjs).format('YYYY-MM-DD'));
      if (vals?.date_to) sp.set('request_date_end', (vals.date_to as unknown as import('dayjs').Dayjs).format('YYYY-MM-DD'));

      const body: import('types/requests').IExportReportsParams = {
        export: 'xlsx',
        entity: 'technical_conditions',
        query_string: sp.toString(),
        include: { customer: true, entity: true, protocol: true },
        filename: 'tu_export_by_query'
      };

      const res = await exportReports(body).unwrap();
      downloadFile(res.blob, res.filename || body.filename);
      message.success(t('technicalConditions.export.success', 'Экспорт начат'));
      setExportModal(false);
      exportForm.resetFields();
    } catch (error) {
      // Показываем причину ошибки с бэка ({ error: "..." })
      message.error(getApiErrorMessage(error, t('technicalConditions.export.error', 'Ошибка при экспорте')));
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onClick: (record, action) => {
          switch (action) {
            case 'edit':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
            case 'delete':
              patchTy({ id: record.id, body: { status: 'inactive' } });
              break;
            case 'view':
              navigate(`/dashboard/technical-conditions/tu-details/${record.id}`);
              break;
          }
        },
        filters: columnFilters,
        onFilterChange: handleColumnFilterChange
      }),
    [navigate, patchTy, columnFilters, handleColumnFilterChange]
  );

  const handlePageChange = (newPage: number, newPageSize?: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    next.set('page_size', String(newPageSize ?? pageSize));
    setSearchParams(next, { replace: false });
  };

  // ✅ ИЗМЕНЕНО: Преобразуем has_invoice для initialValues в TUFilterBar
  const has_invoice_for_filter = hasInvoiceStr === 'true' ? true : hasInvoiceStr === 'false' ? false : hasInvoiceStr || undefined;

  return (
    <DashboardLayout title={t('routers.technicalSpecificatio')}>
      <div className='technical-conditions-page'>
        <TUFilterBar
          initialValues={{
            search: search || undefined,
            ordering: filterOrdering,
            payment_ordering,
            status: status,
            stage: stage,
            date,
            has_invoice: has_invoice_for_filter, // ✅ Передаём строку или boolean
            overdue,
            due_in_days,
            type_ty,
            id,
            address,
            payment_amount,
            tu_with_loads
          }}
          onFilterChange={handleFilterChange}
          onAddClick={handleAddClick}
          onDownloadClick={handleDownloadClick}
          presets={presetsData?.results}
          presetsLoading={presetsLoading}
          onApplyPreset={applyPreset}
          onRequestSavePreset={handleRequestSavePreset}
        />
        <Modal
          open={saveModalOpen}
          title={t('technicalConditions.presets.saveTitle', 'Сохранить шаблон')}
          onOk={handleSavePresetOk}
          onCancel={() => setSaveModalOpen(false)}
          confirmLoading={creatingPreset}
          destroyOnHidden
        >
          <Form form={saveForm} layout='vertical'>
            <Form.Item
              name='name'
              label={t('technicalConditions.presets.name', 'Название')}
              rules={[{ required: true, message: t('technicalConditions.presets.nameReq', 'Введите название') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name='description' label={t('technicalConditions.presets.description', 'Описание')}>
              <Input.TextArea rows={3} />
            </Form.Item>
          </Form>
        </Modal>
        {/* export modal */}
        <Modal
          open={exportModal}
          title={t('technicalConditions.export.title', 'Экспорт данных')}
          onCancel={() => setExportModal(false)}
          destroyOnHidden
          footer={
            <Space>
              <Button onClick={() => setExportModal(false)}>{t('common.cancel')}</Button>
              <Button type='primary' onClick={handleExportSubmit} loading={exporting}>
                {t('common.export')}
              </Button>
            </Space>
          }
        >
          <Form layout='vertical' form={exportForm}>
            <Form.Item name='date_from' label={t('technicalConditions.export.from', 'Дата от')}>
              <DatePicker format='DD.MM.YYYY' style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name='date_to' label={t('technicalConditions.export.to', 'Дата до')}>
              <DatePicker format='DD.MM.YYYY' style={{ width: '100%' }} />
            </Form.Item>
          </Form>
        </Modal>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <Table resizable pagination={false} loading={isLoading} columns={columns} dataSource={tableData} rowKey='id' bordered />
        </div>
        <Pagination showSizeChanger total={tuData?.count || 0} current={page} pageSize={pageSize} onChange={handlePageChange} />
      </div>
    </DashboardLayout>
  );
};
