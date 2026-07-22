/* eslint-disable */
import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Modal, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components';
import { ITyItem } from 'types/entities';
import './style.scss';

import {
  useCreateTyMutation,
  useGetTyByIdQuery,
  useGetTyGroupsQuery,
  useGetTypesTyQuery,
  useLazyGetTyByNumberQuery,
  usePatchTyMutation
} from 'api/Ty.api';
import {
  useCreateCustomerMutation,
  useLazyGetCustomerByIdQuery,
  useLazyGetCustomerQuery,
  useUpdateCustomerMutation
} from 'api/Customer.api';
import { useCreateObjectMutation, useLazyGetAllObjectsQuery } from 'api/Object.api';
import { useGetAllFormulasQuery } from 'api/Formula.api';
import { useGetRequestSourcesQuery } from 'api/RequestSource.api';
import {
  useLazyCheckRefuseByCustomerQuery,
  useLazyCheckRefuseByEntityQuery,
  useLazyCheckTuByCustomerQuery,
  useLazyCheckTuByEntityQuery
} from 'api/Refusal.api';
import { t } from 'i18next';
import { handleEnterFocusNext } from 'utils/formNavigation';

const { Option } = Select;
const { Title } = Typography;

type FormValues = Omit<ITyItem, 'type_ty' | 'customer' | 'application'> & {
  type_ty: number;
  group?: number;
  customer: string;
  application: number;
  request_date?: string;
  incoming_request_number?: string;
  incoming_request_date?: string;
  payment_deadline?: string;
  // Extra fields used only during creation mapping
  object?: string;
  quantity?: number;
  pressure?: number;
  firefightingExpensesInner?: number;
  firefightingExpensesOuter?: number;
  formula?: number;
  fire_fighting_inner?: string;
  fire_fighting_outer?: string;

  // Newly added fields mapped to payloadCreate
  tu_number?: string;
  council_date?: string;
  fire_input_1?: string | string[];
  fire_input_2?: string | string[];

  // Connection and sewer fields
  water_pipe?: string;
  street_pass_water?: string;
  provide_water?: string;
  collector_diametr_fire_1?: string;
  street_pass_input_1?: string;
  collector_diametr_fire_2?: string;
  street_pass_input_2?: string;
  sewer_pipe?: string;
  collector_diametr_sewer?: number | string;
  street_pass_sewer?: string;
  provide_sewer?: string;
  comment_voda?: string;
  comment_kanal?: string;

  // Increase load specific fields (strings)
  increase_water?: string;
  increase_sewage?: string;
  additional_cold_water_required?: string;
  additional_sewage_amount?: string;
  previous_tu_number?: string;
  old_council_date?: string; // Новое поле для "на увеличение нагрузок"

  // Refusal field
  notes?: string;
};

const getTypeTyId = (tt: unknown): number | undefined => {
  if (typeof tt === 'number') return tt;
  if (tt && typeof tt === 'object' && 'id' in (tt as Record<string, unknown>)) {
    const id = (tt as { id?: number }).id;
    return typeof id === 'number' ? id : undefined;
  }
  return undefined;
};

const getRequestSourceTitle = (rs: unknown): string | undefined => {
  if (typeof rs === 'string') return rs;
  if (rs && typeof rs === 'object' && 'title' in (rs as Record<string, unknown>)) {
    const title = (rs as { title?: unknown }).title;
    return typeof title === 'string' ? title : String(title ?? '');
  }
  return undefined;
};

// Автотекст для "Комментарий к водопроводу" при типе ТУ "на вынос водопроводной линии"
const WATER_RELOCATION_COMMENT =
  'ПРОИЗВЕСТИ ВЫНОС ВОДОПРОВОДНОЙ ЛИНИИ ЗА ПРЕДЕЛЫ ГРАНИЦ ЗАСТРОЙКИ, ПРИ УСЛОВИИ СОХРАНЕНИЯ СУЩЕСТВУЮЩИХ ТОЧЕК ПОДКЛЮЧЕНИЯ И СОБЛЮДЕНИЯ ДЕЙСТВУЮЩЕГО ГИДРАВЛИЧЕСКОГО РЕЖИМА\nРАЗРАБОТКУ ПРОЕКТА СОГЛАСОВАТЬ С МП "БИШКЕКВОДОКАНАЛ"';

// Автотекст для "Комментарий к канализации" при типе ТУ "на вынос канализационных линий"
const SEWER_RELOCATION_COMMENT =
  'ПРОИЗВЕСТИ ВЫНОС КАНАЛИЗАЦИОННОЙ ЛИНИИ ЗА ПРЕДЕЛЫ ГРАНИЦ ЗАСТРОЙКИ, ПРИ УСЛОВИИ СОХРАНЕНИЯ, СУЩЕСТВУЮЩИХ ТОЧЕК ПОДКЛЮЧЕНИЯ И СОБЛЮДЕНИЯ ДЕЙСТВУЮЩЕГО ГИДРАВЛИЧЕСКОГО РЕЖИМА.\nРАЗРАБОТКУ ПРОЕКТА СОГЛАСОВАТЬ С МП "БИШКЕКВОДОКАНАЛ"';

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { tyId } = useParams();
  const typesTyQuery = useGetTypesTyQuery();
  const tyGroupsQuery = useGetTyGroupsQuery();
  const { data: formulas } = useGetAllFormulasQuery({ page: 1, page_size: 100 });
  const { data: requestSources } = useGetRequestSourcesQuery({ page: 1, page_size: 100 });
  const [patchTy, { isLoading, isSuccess }] = usePatchTyMutation();
  const [createTy, { isLoading: createLoading }] = useCreateTyMutation();
  const isCreateMode = !tyId;

  // Customer/Object helpers
  const [createCustomer] = useCreateCustomerMutation();
  const [updateCustomer] = useUpdateCustomerMutation();
  const [triggerGetCustomerById] = useLazyGetCustomerByIdQuery();
  const [createObject] = useCreateObjectMutation();
  const [triggerGetCustomers] = useLazyGetCustomerQuery();
  const [triggerGetObjects] = useLazyGetAllObjectsQuery();
  const [triggerCheckCustomer] = useLazyCheckRefuseByCustomerQuery();
  const [triggerCheckEntity] = useLazyCheckRefuseByEntityQuery();
  const [triggerCheckTuCustomer] = useLazyCheckTuByCustomerQuery();
  const [triggerCheckTuEntity] = useLazyCheckTuByEntityQuery();
  const [triggerGetTyByNumber] = useLazyGetTyByNumberQuery();

  const tuQuery = useGetTyByIdQuery({ tyId: tyId || '' }, { skip: !tyId });
  const [form] = Form.useForm<FormValues>();

  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);
  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);
  const toStr = useCallback(
    (v: string | Date | undefined) => (typeof v === 'string' ? v : v ? dayjs(v).format('YYYY-MM-DD') : undefined),
    []
  );

  // Watch selected TU type to conditionally render fields
  const selectedTypeId = Form.useWatch('type_ty', form);
  const isIncreaseLoads = typesTyQuery.data?.find((type) => type.id === selectedTypeId)?.title === 'на увеличение нагрузок';
  const isRefusal = typesTyQuery.data?.find((type) => type.id === selectedTypeId)?.title === 'отказы';
  // Типы "на вынос ..." — сверяем по вхождению слов (устойчиво к формулировке)
  const selectedTypeTitle = (typesTyQuery.data?.find((type) => type.id === selectedTypeId)?.title || '').toLowerCase();
  const isWaterRelocation = selectedTypeTitle.includes('вынос') && selectedTypeTitle.includes('водопровод');
  const isSewerRelocation = selectedTypeTitle.includes('вынос') && selectedTypeTitle.includes('канализац');

  const onFinish = useCallback(
    async (values: FormValues) => {
      try {
        if (isCreateMode) {
          // Resolve or create customer
          let customerId: number | undefined;
          if (values.customer) {
            const customerSearch = await triggerGetCustomers({ search: String(values.customer), page: 1, page_size: 10 }).unwrap();
            const foundCustomer = Array.isArray(customerSearch.results)
              ? customerSearch.results.find((c: { full_name?: string; id?: number }) => c.full_name === String(values.customer))
              : undefined;
            if (foundCustomer?.id != null) {
              customerId = foundCustomer.id;
            } else {
              // Заказчик создаётся всегда, в т.ч. для типа «отказы»
              const customerResponse = await createCustomer({
                full_name: values.customer,
                pasport: '',
                address: values.address,
                status: 'active'
              }).unwrap();
              customerId = customerResponse.id;
            }
          }

          // Resolve or create object
          let objectId: number | undefined;
          if (values.object && customerId && !isRefusal) {
            const objectSearch = await triggerGetObjects({ search: values.object, page: 1, page_size: 10 }).unwrap();
            const foundObject = objectSearch.results?.find(
              (o: { id: number; title?: string; address_street?: string; customer?: number }) =>
                o.title === values.object && o.address_street === values.address && o.customer === customerId
            );
            if (foundObject?.id != null) {
              objectId = foundObject.id;
            } else {
              const objectResponse = await createObject({
                title: values.object as string,
                address_street: values.address,
                kadastr_number: '',
                status: 'active',
                customer: customerId
              }).unwrap();
              objectId = objectResponse.id;
            }
          }

          // Build TU create payload
          const payloadCreate: any = {
            tu_number: values.tu_number,
            council_date: values.council_date,
            free_pressure_connection_point: values.free_pressure_connection_point,
            request_source: values.request_source,
            request_number: values.request_number,
            request_date: values.request_date || dayjs(Date.now()).format('YYYY-MM-DD'),
            incoming_request_number: values.incoming_request_number,
            incoming_request_date: values.incoming_request_date,
            payment_deadline: values.payment_deadline,
            type_ty: values.type_ty,
            group: values.group,
            object_name: values.object_name ?? values.object,
            address: values.address,
            status: values.status,
            water_required: values.quantity != null ? String(values.quantity) : values.water_required,
            pressure_required:
              values.pressure != null && !Number.isNaN(Number(values.pressure))
                ? Number(values.pressure)
                : Number(values.pressure_required),
            fire_fighting_inner:
              values.firefightingExpensesInner != null ? String(values.firefightingExpensesInner) : values.fire_fighting_inner,
            fire_fighting_outer:
              values.firefightingExpensesOuter != null ? String(values.firefightingExpensesOuter) : values.fire_fighting_outer,
            sewage_amount: values.sewage_amount,
            fire_input_1: Array.isArray(values.fire_input_1) ? values.fire_input_1.join(', ') : values.fire_input_1,
            fire_input_2: Array.isArray(values.fire_input_2) ? values.fire_input_2.join(', ') : values.fire_input_2,
            customer: customerId != null ? String(customerId) : undefined,
            water_pipe: values.water_pipe,
            street_pass_water: values.street_pass_water,
            provide_water: values.provide_water,
            comment_voda: values.comment_voda,
            collector_diametr_fire_1: values.collector_diametr_fire_1,
            street_pass_input_1: values.street_pass_input_1,
            collector_diametr_fire_2: values.collector_diametr_fire_2,
            street_pass_input_2: values.street_pass_input_2,
            sewer_pipe: values.sewer_pipe,
            collector_diametr_sewer: values.collector_diametr_sewer != null ? String(values.collector_diametr_sewer) : undefined,
            street_pass_sewer: values.street_pass_sewer,
            provide_sewer: values.provide_sewer,
            comment_kanal: values.comment_kanal,
            increase_water: values.increase_water,
            increase_sewage: values.increase_sewage,
            additional_cold_water_required: values.additional_cold_water_required,
            additional_sewage_amount: values.additional_sewage_amount,
            previous_tu_number: values.previous_tu_number,
            tech_council_date: values.tech_council_date,
            collector_diametr_water: values.collector_diametr_water,
            parent_tc_number: values.parent_tc_number,
            notes: values.notes
          };

          // Добавляем old_council_date только для "на увеличение нагрузок"
          if (isIncreaseLoads && values.old_council_date) {
            payloadCreate.old_council_date = values.old_council_date;
          }

          // Добавляем formula для всех типов ТУ
          if (values.formula != null) {
            payloadCreate.formula = values.formula;
          }

          // Добавляем остальные поля
          if (objectId != null) payloadCreate.entity = objectId;
          if (values.eni != null) payloadCreate.eni = values.eni;

          // Пропускаем проверки отказов для типа "отказы"
          if (!isRefusal) {
            // Pre-submit refusal + TU checks
            try {
              const [byCustomer, byEntity, tuByCustomer, tuByEntity] = await Promise.all([
                customerId
                  ? triggerCheckCustomer(customerId)
                      .unwrap()
                      .catch(() => ({ results: [] }))
                  : Promise.resolve({ results: [] }),
                objectId
                  ? triggerCheckEntity(objectId)
                      .unwrap()
                      .catch(() => ({ results: [] }))
                  : Promise.resolve({ results: [] }),
                customerId
                  ? triggerCheckTuCustomer(customerId)
                      .unwrap()
                      .catch(() => ({ results: [] }))
                  : Promise.resolve({ results: [] }),
                objectId
                  ? triggerCheckTuEntity(objectId)
                      .unwrap()
                      .catch(() => ({ results: [] }))
                  : Promise.resolve({ results: [] })
              ]);

              const hasCustomerRefusals = Array.isArray(byCustomer?.results) && byCustomer.results.length > 0;
              const hasEntityRefusals = Array.isArray(byEntity?.results) && byEntity.results.length > 0;
              const hasRefusals = hasCustomerRefusals || hasEntityRefusals;

              type TuShort = { request_number?: string; number?: string; tu_number?: string; title?: string; id?: number };
              const tuCustomerList = (tuByCustomer as { results?: TuShort[] } | undefined)?.results ?? [];
              const tuEntityList = (tuByEntity as { results?: TuShort[] } | undefined)?.results ?? [];
              const labelOf = (item: TuShort): string =>
                item.request_number ?? item.number ?? item.tu_number ?? item.title ?? (item.id != null ? `ID: ${item.id}` : '');

              const tuCustomerItems = (Array.isArray(tuCustomerList) ? tuCustomerList : [])
                .map((item) => ({ id: item?.id, label: labelOf(item) }))
                .filter((v) => !!v.label);
              const tuEntityItems = (Array.isArray(tuEntityList) ? tuEntityList : [])
                .map((item) => ({ id: item?.id, label: labelOf(item) }))
                .filter((v) => !!v.label);

              const hasTuCustomer = tuCustomerItems.length > 0;
              const hasTuEntity = tuEntityItems.length > 0;
              const showModal = hasRefusals || hasTuCustomer || hasTuEntity;

              if (showModal) {
                const confirmContent = hasRefusals
                  ? hasCustomerRefusals && hasEntityRefusals
                    ? t('refusal.confirmContentBoth', 'Найдены отказы по заказчику и объекту. Продолжить отправку заявки?')
                    : hasCustomerRefusals
                      ? t('refusal.confirmContentCustomer', 'Найдены отказы по заказчику. Продолжить отправку заявки?')
                      : t('refusal.confirmContentEntity', 'Найдены отказы по объекту. Продолжить отправку заявки?')
                  : hasTuCustomer && hasTuEntity
                    ? t('refusal.confirmContentTuBoth', 'Найдены связанные ТУ по заказчику и объекту. Продолжить отправку заявки?')
                    : hasTuCustomer
                      ? t('refusal.confirmContentTuCustomer', 'Найдены связанные ТУ по заказчику. Продолжить отправку заявки?')
                      : t('refusal.confirmContentTuEntity', 'Найдены связанные ТУ по объекту. Продолжить отправку заявки?');

                const customerCauseTitles = ((byCustomer?.results ?? []) as Array<{ causes?: Array<{ title?: string }> }>)
                  .flatMap((r) => r.causes ?? [])
                  .map((c) => c.title)
                  .filter((v): v is string => Boolean(v))
                  .filter((v, i, a) => a.indexOf(v) === i);

                const entityCauseTitles = ((byEntity?.results ?? []) as Array<{ causes?: Array<{ title?: string }> }>)
                  .flatMap((r) => r.causes ?? [])
                  .map((c) => c.title)
                  .filter((v): v is string => Boolean(v))
                  .filter((v, i, a) => a.indexOf(v) === i);

                const detailsContent = (
                  <div>
                    <div style={{ marginBottom: 8 }}>{confirmContent}</div>

                    {hasCustomerRefusals && (
                      <div style={{ marginTop: 8 }}>
                        <strong>{t('refusal.customerTitle', 'Отказы по заказчику')}</strong>
                        {customerCauseTitles.length > 0 ? (
                          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                            {customerCauseTitles.map((title, idx) => (
                              <li key={idx}>{title}</li>
                            ))}
                          </ul>
                        ) : (
                          <div>- {t('refusal.noCauses', 'Причины не указаны')}</div>
                        )}
                      </div>
                    )}

                    {hasEntityRefusals && (
                      <div style={{ marginTop: 8 }}>
                        <strong>{t('refusal.entityTitle', 'Отказы по объекту')}</strong>
                        {entityCauseTitles.length > 0 ? (
                          <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                            {entityCauseTitles.map((title, idx) => (
                              <li key={idx}>{title}</li>
                            ))}
                          </ul>
                        ) : (
                          <div>- {t('refusal.noCauses', 'Причины не указаны')}</div>
                        )}
                      </div>
                    )}

                    {hasTuCustomer && (
                      <div style={{ marginTop: 8 }}>
                        <strong>{t('refusal.tuCustomerTitle', 'Найдены ТУ по заказчику')}</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                          {tuCustomerItems.map((item, idx) => (
                            <li key={idx}>
                              {item.id != null ? (
                                <a href={`/dashboard/technical-conditions/tu-details/${item.id}`} target='_blank'>
                                  {item.label}
                                </a>
                              ) : (
                                item.label
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hasTuEntity && (
                      <div style={{ marginTop: 8 }}>
                        <strong>{t('refusal.tuEntityTitle', 'Найдены ТУ по объекту')}</strong>
                        <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                          {tuEntityItems.map((item, idx) => (
                            <li key={idx}>
                              {item.id != null ? (
                                <a href={`/dashboard/technical-conditions/tu-details/${item.id}`} target='_blank'>
                                  {item.label}
                                </a>
                              ) : (
                                item.label
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );

                const confirmed = await new Promise<boolean>((resolve) => {
                  Modal.confirm({
                    title: t('refusal.confirmTitle', 'Вы уверены, что хотите продолжить?'),
                    content: detailsContent,
                    okText: t('common.continue', 'Продолжить'),
                    cancelText: t('common.cancel', 'Отмена'),
                    onOk: () => resolve(true),
                    onCancel: () => resolve(false)
                  });
                });
                if (!confirmed) return;
              }
            } catch (e) {
              console.warn('Refusal/TU checks failed', e);
            }
          }

          const created = await createTy(payloadCreate).unwrap();
          message.success(t('addTuForms.messages.createTuSuccess'));
          form.resetFields();
          navigate(`/dashboard/technical-conditions/tu-details/${created.id}`);
          return;
        }

        if (!tuQuery.data) {
          message.error(t('addTuForms.messages.loadTuError'));
          return;
        }

        // Update mode
        const base: any = {
          ...values,
          customer: tuQuery.data.customer.id,
          group: values.group,
          entity: tuQuery.data.entity,
          parent_tc_number: values.parent_tc_number,
          increase_water: values.increase_water,
          increase_sewage: values.increase_sewage,
          additional_cold_water_required: values.additional_cold_water_required,
          additional_sewage_amount: values.additional_sewage_amount,
          notes: values.notes
        };

        // Добавляем old_council_date только для "на увеличение нагрузок" в режиме редактирования
        if (isIncreaseLoads && values.old_council_date) {
          base.old_council_date = values.old_council_date;
        }

        if (values.request_date) base.request_date = values.request_date;
        if (values.payment_deadline) base.payment_deadline = values.payment_deadline;
        if (tuQuery.data.application?.id != null) base.application = tuQuery.data.application.id;

        // Обновляем самого заказчика (PUT /customer/{id}) данными из формы.
        // Тянем полный объект и мержим, чтобы PUT не затёр остальные поля.
        const editCustomerId = tuQuery.data.customer.id;
        if (editCustomerId && values.customer) {
          try {
            const fullCustomer = await triggerGetCustomerById(editCustomerId).unwrap();
            await updateCustomer({
              id: editCustomerId,
              body: {
                ...fullCustomer,
                full_name: values.customer,
                address: values.address
              }
            }).unwrap();
          } catch (err) {
            console.warn('Не удалось обновить заказчика', err);
          }
        }

        await patchTy({ id: Number(tyId), body: base }).unwrap();
      } catch (e) {
        console.error(e);
        message.error(t('addTuForms.messages.createTuError'));
      }
    },
    [
      isCreateMode,
      createTy,
      form,
      navigate,
      tuQuery,
      tyId,
      patchTy,
      triggerGetCustomers,
      createCustomer,
      updateCustomer,
      triggerGetCustomerById,
      triggerGetObjects,
      createObject,
      triggerCheckCustomer,
      triggerCheckEntity,
      triggerCheckTuCustomer,
      triggerCheckTuEntity,
      isRefusal,
      isIncreaseLoads
    ]
  );

  useEffect(() => {
    if (isSuccess) {
      message.success(t('addTuForms.messages.createTuSuccess'));
      form.resetFields();
      navigate(`/dashboard/technical-conditions/tu-details/${tyId}`);
    }
  }, [form, isSuccess, navigate, tyId]);

  useEffect(() => {
    if (tuQuery.data) {
      const toStr = (v: string | Date | undefined) => (typeof v === 'string' ? v : v ? dayjs(v).format('YYYY-MM-DD') : undefined);

      form.setFieldsValue({
        ...tuQuery.data,
        customer: tuQuery.data.customer.full_name,
        application: tuQuery.data.application?.id,
        request_date: toStr(tuQuery.data.request_date as unknown as string | Date | undefined),
        incoming_request_date: toStr((tuQuery.data as any).incoming_request_date as unknown as string | Date | undefined),
        payment_deadline: toStr(tuQuery.data.payment_deadline as unknown as string | Date | undefined),
        type_ty: getTypeTyId(tuQuery.data.type_ty),
        group: (tuQuery.data as any).group?.id,
        request_source: getRequestSourceTitle((tuQuery.data as any).request_source),
        parent_tc_number: tuQuery.data.parent_tc_number,
        increase_water: tuQuery.data.increase_water,
        increase_sewage: tuQuery.data.increase_sewage,
        additional_cold_water_required: tuQuery.data.additional_cold_water_required,
        additional_sewage_amount: tuQuery.data.additional_sewage_amount,
        old_council_date: toStr((tuQuery.data as any).old_council_date as unknown as string | Date | undefined),
        notes: tuQuery.data.notes
      } as any);
    }
  }, [form, tuQuery]);

  // Автозаполнение комментария к водопроводу при выборе типа "на вынос водопроводной линии".
  // Только при создании; в режиме редактирования берём значение с бэка (не автозаполняем).
  // Не перезаписываем, если поле уже заполнено — чтобы сохранить правки сотрудника.
  useEffect(() => {
    if (!isCreateMode) return;
    const current = form.getFieldValue('comment_voda');
    if (isWaterRelocation) {
      // Заполняем, если поле пустое (правки сотрудника не трогаем)
      if (!current) form.setFieldValue('comment_voda', WATER_RELOCATION_COMMENT);
    } else if (current === WATER_RELOCATION_COMMENT) {
      // Ушли с типа "вынос водопровода": чистим только неотредактированный автотекст
      form.setFieldValue('comment_voda', '');
    }
  }, [isCreateMode, isWaterRelocation, form]);

  // Аналогично для типа "на вынос канализационных линий" -> "Комментарий к канализации".
  // Комбинированный тип (и водопровод, и канализация) заполняет оба поля — оба флага true.
  useEffect(() => {
    if (!isCreateMode) return;
    const current = form.getFieldValue('comment_kanal');
    if (isSewerRelocation) {
      if (!current) form.setFieldValue('comment_kanal', SEWER_RELOCATION_COMMENT);
    } else if (current === SEWER_RELOCATION_COMMENT) {
      form.setFieldValue('comment_kanal', '');
    }
  }, [isCreateMode, isSewerRelocation, form]);

  const onParentTuBlur = useCallback(async () => {
    const raw = form.getFieldValue('parent_tc_number');
    const value = typeof raw === 'string' ? raw.trim() : String(raw ?? '').trim();
    if (!value) return;

    try {
      const resp = await triggerGetTyByNumber({ tuNumber: value }).unwrap();
      const results = (resp as any)?.results;
      const data = Array.isArray(results) ? (results.find((i: any) => i?.tu_number === value) ?? results[0]) : resp;
      if (!data) {
        message.error('Не удалось найти ТУ по номеру');
        return;
      }

      const mapped: any = {
        request_source: getRequestSourceTitle((data as any).request_source),
        request_number: (data as any).request_number,
        request_date: toStr((data as any).request_date as any),
        customer: (data as any).customer?.full_name,
        object_name: (data as any).object_name,
        address: (data as any).address,
        eni: (data as any).eni,
        sewage_amount: (data as any).sewage_amount,
        water_required: (data as any).water_required,
        pressure_required: (data as any).pressure_required,
        fire_fighting_inner: (data as any).fire_fighting_inner,
        fire_fighting_outer: (data as any).fire_fighting_outer,
        fire_input_1: (data as any).fire_input_1,
        fire_input_2: (data as any).fire_input_2,
        street_pass_water: (data as any).street_pass_water,
        collector_diametr_water: (data as any).collector_diametr_water,
        provide_water: (data as any).provide_water,
        street_pass_sewer: (data as any).street_pass_sewer,
        collector_diametr_sewer: (data as any).collector_diametr_sewer,
        sewer_pipe: (data as any).sewer_pipe,
        provide_sewer: (data as any).provide_sewer,
        street_pass_input_1: (data as any).street_pass_input_1,
        collector_diametr_fire_1: (data as any).collector_diametr_fire_1,
        street_pass_input_2: (data as any).street_pass_input_2,
        collector_diametr_fire_2: (data as any).collector_diametr_fire_2,
        payment_deadline: toStr((data as any).payment_deadline as any),
        free_pressure_connection_point: (data as any).free_pressure_connection_point,
        increase_water: (data as any).water_required,
        increase_sewage: (data as any).sewage_amount,
        additional_cold_water_required: (data as any).additional_cold_water_required,
        additional_sewage_amount: (data as any).additional_sewage_amount,
        old_council_date: toStr((data as any).council_date as any) // Подставляем дату совета из предыдущего ТУ
      };

      delete mapped.tech_council_date;
      delete mapped.tu_number;
      delete mapped.council_date;

      form.setFieldsValue(mapped);
      message.success('Данные предыдущего ТУ подставлены');
    } catch (e) {
      console.error(e);
      message.error('Не удалось найти ТУ по номеру');
    }
  }, [form, toStr, triggerGetTyByNumber]);

  const onCustomerEdit = useCallback(() => {
    navigate(`/dashboard/customers/${tuQuery.data?.customer.id}/edit`);
  }, [navigate, tuQuery.data?.customer?.id]);

  return (
    <DashboardLayout title={title}>
      <Form
        scrollToFirstError={{ behavior: 'smooth', scrollMode: 'if-needed', block: 'center' }}
        form={form}
        requiredMark
        name='add-tu-form'
        // Свободный напор по умолчанию 10 (только при создании; при редактировании берётся с бэка). Редактируется вручную.
        initialValues={isCreateMode ? { free_pressure_connection_point: 10 } : undefined}
        layout='vertical'
        onFinish={onFinish}
        onFinishFailed={(errorInfo) => console.log(errorInfo)}
        onKeyDown={handleEnterFocusNext}
        className='add-tu-forms'
      >
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          {t('addTuForms.titles.main')}
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name='tech_council_date'
              label={'Дата тех совета'}
              rules={[{ message: t('addTuForms.form.validation.specifyRequestDate') }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='DD.MM.YYYY' size='large' placeholder={t('addTuForms.form.placeholders.requestDate')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name='tu_number' label={'Исходящий номер ТУ'} rules={[{ message: t('addTuForms.form.validation.specifySource') }]}>
              <Input size='large' defaultValue={'04-'} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name='council_date'
              label={'Дата исходящих ТУ'}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='DD.MM.YYYY' size='large' placeholder={'Выберите дату исходящих ТУ'} />
            </Form.Item>
          </Col>
        </Row>

        {!isIncreaseLoads && !isRefusal && (
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label={t('addTuForms.form.labels.requestSource')}
                name='request_source'
                rules={[{ required: true, message: t('addTuForms.form.validation.specifySource') }]}
              >
                <Select size='large' placeholder={t('addTuForms.form.placeholders.requestSource')} showSearch optionFilterProp='children'>
                  {requestSources?.results?.map((rs: any) => (
                    <Option key={rs.id} value={rs.title}>
                      {rs.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('addTuForms.form.labels.incomingRequestNumber', 'Входящий номер запроса')}
                name='incoming_request_number'
                rules={[{ required: false }]}
              >
                <Input size='large' placeholder={t('addTuForms.form.placeholders.incomingRequestNumber', 'Входящий номер')} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label={t('addTuForms.form.labels.incomingRequestDate', 'Дата входящего запроса')}
                name='incoming_request_date'
                rules={[{ required: false }]}
                normalize={(value: Dayjs) => formatDate(value)}
                getValueProps={(value: string) => ({ value: parseDate(value) })}
              >
                <DatePicker format='DD.MM.YYYY' size='large' placeholder={t('addTuForms.form.placeholders.date', 'Выберите дату')} />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isRefusal && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label={t('addTuForms.form.labels.requestSource')} name='request_source' rules={[{ required: false }]}>
                <Select size='large' placeholder={t('addTuForms.form.placeholders.requestSource')} showSearch optionFilterProp='children'>
                  {requestSources?.results?.map((rs: any) => (
                    <Option key={rs.id} value={rs.title}>
                      {rs.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestNumber')}
              name='request_number'
              rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.specifyRequestNumber') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.requestNumber')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestDate')}
              name='request_date'
              rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.specifyRequestDate') }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='DD.MM.YYYY' size='large' placeholder={t('addTuForms.form.placeholders.requestDate')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.customer')}
              name='customer'
              rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.specifyCustomer') }]}
              extra={
                !isCreateMode ? (
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                    <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                  </Button>
                ) : undefined
              }
            >
              <TextArea size='large' placeholder={t('addTuForms.form.placeholders.customer')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.objectName')}
              name='object_name'
              rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.specifyObjectName') }]}
            >
              <TextArea size='large' placeholder={t('addTuForms.form.placeholders.objectName')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.address')}
              name='address'
              rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.specifyAddress') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.address')} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.techConditionType')}
              name='type_ty'
              rules={[{ required: true, message: t('addTuForms.form.validation.selectType') }]}
              validateTrigger={['onChange', 'onBlur']}
            >
              <Select size='large' placeholder={t('addTuForms.form.placeholders.techConditionType')}>
                {typesTyQuery.data?.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.group', 'Группа')} name='group'>
              <Select
                size='large'
                allowClear
                loading={tyGroupsQuery.isLoading}
                placeholder={t('addTuForms.form.placeholders.group', 'Выберите группу')}
              >
                {tyGroupsQuery.data?.map((group) => (
                  <Option key={group.id} value={group.id}>
                    {group.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {/* Поле причины отказа для типа "отказы" */}
        {isRefusal && (
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name='notes'
                label='Причина отказа'
                rules={[{ required: true, message: 'Обязательное поле - укажите причину отказа' }]}
              >
                <TextArea size='large' rows={4} placeholder='Укажите причину отказа в выдаче технических условий...' />
              </Form.Item>
            </Col>
          </Row>
        )}

        {isIncreaseLoads && (
          <>
            {/* Источник запроса для "на увеличение нагрузок" */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={t('addTuForms.form.labels.requestSource')}
                  name='request_source'
                  rules={[{ required: true, message: t('addTuForms.form.validation.specifySource') }]}
                >
                  <Select size='large' placeholder={t('addTuForms.form.placeholders.requestSource')} showSearch optionFilterProp='children'>
                    {requestSources?.results?.map((rs: any) => (
                      <Option key={rs.id} value={rs.title}>
                        {rs.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            {/* Номер предыдущего тех условия */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name='parent_tc_number' label='Номер предыдущего тех условия' rules={[{ required: false }]}>
                  <Input size='large' placeholder='Введите номер предыдущего тех условия' onBlur={onParentTuBlur} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name='old_council_date'
                  label='Дата'
                  rules={[{ required: false }]}
                  normalize={(value: Dayjs) => formatDate(value)}
                  getValueProps={(value: string) => ({ value: parseDate(value) })}
                >
                  <DatePicker format='DD.MM.YYYY' size='large' placeholder='Выберите дату' />
                </Form.Item>
              </Col>
            </Row>

            {/* Вода и Стоки */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name='increase_water' label='Существующие нагрузки Вода' rules={[{ required: false }]}>
                  <Input size='large' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='increase_sewage' label='Стоки' rules={[{ required: false }]}>
                  <Input size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* Дополнительные количества */}
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name='additional_cold_water_required'
                  label='Дополнительно требуемое количество холодной воды'
                  rules={[{ required: false }]}
                >
                  <Input size='large' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name='additional_sewage_amount' label='Дополнительное количество стоков' rules={[{ required: false }]}>
                  <Input size='large' />
                </Form.Item>
              </Col>
            </Row>

            {/* ФОРМУЛА ДЛЯ "НА УВЕЛИЧЕНИЕ НАГРУЗОК" - ОБЯЗАТЕЛЬНОЕ */}
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  label={t('addTuForms.form.labels.formula')}
                  name='formula'
                  rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.required') }]}
                >
                  <Select size='large' placeholder={t('addTuForms.form.placeholders.formula')}>
                    {formulas?.results?.map((formula: any) => (
                      <Option key={formula.id} value={formula.id}>
                        {formula.title}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ (скрыты для "На увеличение нагрузок" и "отказы") */}
        <div style={{ display: isIncreaseLoads || isRefusal ? 'none' : undefined }}>
          <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
            {t('addTuForms.titles.techParams')}
          </Title>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('addTuForms.form.labels.waterRequired')}
                name='water_required'
                rules={[{ required: !isIncreaseLoads && !isRefusal, message: t('addTuForms.form.validation.required') }]}
              >
                <Input size='large' placeholder={t('addTuForms.form.placeholders.waterRequired')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('addTuForms.form.labels.pressureRequired')}
                name='pressure_required'
                rules={[{ required: !isIncreaseLoads && !isRefusal, message: t('addTuForms.form.validation.required') }]}
              >
                <Input size='large' placeholder={t('addTuForms.form.placeholders.pressureRequired')} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label={t('addTuForms.form.labels.fireFightingInner')} name='fire_fighting_inner' rules={[{ required: false }]}>
                <Input size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label={t('addTuForms.form.labels.fireFightingOuter')} name='fire_fighting_outer' rules={[{ required: false }]}>
                <Input size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label={t('addTuForms.form.labels.sewageAmount')}
            name='sewage_amount'
            rules={[{ required: !isIncreaseLoads && !isRefusal, message: t('addTuForms.form.validation.required') }]}
          >
            <Input size='large' placeholder={t('addTuForms.form.placeholders.sewageAmount')} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={t('addTuForms.form.labels.formula')}
                name='formula'
                rules={[{ required: !isRefusal, message: t('addTuForms.form.validation.required') }]}
              >
                <Select size='large' placeholder={t('addTuForms.form.placeholders.formula')}>
                  {formulas?.results?.map((formula: any) => (
                    <Option key={formula.id} value={formula.id}>
                      {formula.title}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* ПОДКЛЮЧЕНИЕ (скрыто для "отказы") */}
        <div style={{ display: isRefusal ? 'none' : undefined }}>
          <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
            {t('addTuForms.titles.connection')}
          </Title>

          {/* Водопровод и пожаротушение (скрывать при "На увеличение нагрузок") */}
          <div style={{ display: isIncreaseLoads ? 'none' : undefined }}>
            <Title level={5} style={{ marginTop: '12px' }}>
              {t('tuDetails.titles.waterSupply')}
            </Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={'Подключение выполнить от водопроводной линии'}
                  name='water_pipe'
                  rules={[{ required: false }]}
                  normalize={(v) => (Array.isArray(v) ? v.slice(-1)[0] : v)}
                  getValueProps={(value: string | undefined) => ({ value: value ? [value] : [] })}
                >
                  <Select mode='tags' size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                    <Option value='существующий'>существующий</Option>
                    <Option value='проектируемый'>проектируемый</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={'Диаметром'} name='collector_diametr_water' rules={[{ required: false }]}>
                  <Input size='large' />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_water' rules={[{ required: false }]}>
              <TextArea size='large' />
            </Form.Item>
            <Form.Item label={'Предусмотреть'} name='provide_water' rules={[{ required: false }]}>
              <TextArea size='large' />
            </Form.Item>
            <Form.Item
              label={t('addTuForms.form.labels.commentWater', 'Комментарий к водопроводу')}
              name='comment_voda'
              rules={[{ required: false }]}
            >
              <TextArea size='large' />
            </Form.Item>

            {/* Пожаротушение */}
            <Title level={5} style={{ marginTop: '12px' }}>
              {t('addTuForms.form.labels.fireInput1')}
            </Title>

            <Form.Item name='fire_input_1' label={'На пожаротушение объекта подключение выполнить'} rules={[{ required: false }]}>
              <Select mode='tags' size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                <Option value='существующий'>существующий</Option>
                <Option value='проектируемый'>проектируемый</Option>
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={t('addTuForms.form.labels.waterPipeDiameter1')}
                  name='collector_diametr_fire_1'
                  rules={[{ required: false }]}
                >
                  <Input size='large' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_1' rules={[{ required: false }]}>
                  <TextArea size='large' />
                </Form.Item>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: '12px' }}>
              {t('addTuForms.form.labels.fireInput2')}
            </Title>
            <Form.Item name='fire_input_2' label={'На пожаротушение объекта подключение выполнить'} rules={[{ required: false }]}>
              <Select mode='tags' size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                <Option value='существующий'>существующий</Option>
                <Option value='проектируемый'>проектируемый</Option>
              </Select>
            </Form.Item>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label={t('addTuForms.form.labels.waterPipeDiameter2')}
                  name='collector_diametr_fire_2'
                  rules={[{ required: false }]}
                >
                  <Input size='large' />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_2' rules={[{ required: false }]}>
                  <TextArea size='large' />
                </Form.Item>
              </Col>
            </Row>
          </div>

          <Form.Item
            label={t('addTuForms.form.labels.freePressureAtConnectionPoint')}
            name='free_pressure_connection_point'
            rules={[{ required: false }]}
            preserve
          >
            <Input size='large' placeholder='10' type='number' />
          </Form.Item>

          {/* Канализация */}
          <Title level={5} style={{ marginTop: '12px' }}>
            {t('tuDetails.titles.sewer')}
          </Title>
          <div style={{ display: isIncreaseLoads ? 'none' : undefined }}>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item
                  label={t('addTuForms.form.labels.sewer')}
                  name='sewer_pipe'
                  rules={[{ required: false }]}
                  normalize={(v) => (Array.isArray(v) ? v.slice(-1)[0] : v)}
                  getValueProps={(value: string | undefined) => ({ value: value ? [value] : [] })}
                >
                  <Select mode='tags' size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                    <Option value='существующий'>существующий</Option>
                    <Option value='проектируемый'>проектируемый</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={t('addTuForms.form.labels.collector')} name='collector_diametr_sewer' rules={[{ required: false }]}>
                  <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.diameter')} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_sewer' rules={[{ required: false }]}>
                  <TextArea size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
                </Form.Item>
              </Col>
            </Row>
          </div>
          <Form.Item label={'Предусмотреть'} name='provide_sewer' rules={[{ required: false }]} preserve>
            <TextArea size='large' />
          </Form.Item>
          <Form.Item
            label={t('addTuForms.form.labels.commentSewer', 'Комментарий к канализации')}
            name='comment_kanal'
            rules={[{ required: false }]}
            preserve
          >
            <TextArea size='large' />
          </Form.Item>
        </div>

        {/* ФИНАНСЫ (скрыто для "отказы") */}
        <div style={{ display: isRefusal ? 'none' : undefined }}>
          <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
            {t('addTuForms.titles.finance')}
          </Title>

          <Form.Item
            label={t('addTuForms.form.labels.paymentDeadline')}
            name='payment_deadline'
            rules={[]}
            normalize={(value: Dayjs) => formatDate(value)}
            getValueProps={(value: string) => ({ value: parseDate(value) })}
          >
            <DatePicker size='large' placeholder={t('addTuForms.form.placeholders.paymentDeadline')} format='DD.MM.YYYY' />
          </Form.Item>
        </div>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button loading={isLoading || createLoading} type='primary' htmlType='submit' size='large'>
                {t('addTuForms.form.buttons.submit')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default AddTuForms;
