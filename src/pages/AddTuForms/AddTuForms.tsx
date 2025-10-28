/* eslint-disable */
import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Modal, Typography } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components';
import { ITyItem } from 'types/entities';
import './style.scss';

import { useCreateTyMutation, useGetTyByIdQuery, useGetTypesTyQuery, usePatchTyMutation } from 'api/Ty.api';
import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
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
  customer: string;
  application: number;
  request_date?: string;
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

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { tyId } = useParams();
  const typesTyQuery = useGetTypesTyQuery();
  const { data: formulas } = useGetAllFormulasQuery({ page: 1, page_size: 100 });
  const { data: requestSources } = useGetRequestSourcesQuery({ page: 1, page_size: 100 });
  const [patchTy, { isLoading, isSuccess }] = usePatchTyMutation();
  const [createTy, { isLoading: createLoading }] = useCreateTyMutation();
  const isCreateMode = !tyId;

  // Customer/Object helpers (migrated from ApplicationsCreate)
  const [createCustomer] = useCreateCustomerMutation();
  const [createObject] = useCreateObjectMutation();
  const [triggerGetCustomers] = useLazyGetCustomerQuery();
  const [triggerGetObjects] = useLazyGetAllObjectsQuery();
  const [triggerCheckCustomer] = useLazyCheckRefuseByCustomerQuery();
  const [triggerCheckEntity] = useLazyCheckRefuseByEntityQuery();
  const [triggerCheckTuCustomer] = useLazyCheckTuByCustomerQuery();
  const [triggerCheckTuEntity] = useLazyCheckTuByEntityQuery();

  const tuQuery = useGetTyByIdQuery({ tyId: tyId || '' }, { skip: !tyId });
  const [form] = Form.useForm<FormValues>();

  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);
  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);

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
              const customerResponse = await createCustomer({
                full_name: values.customer,
                pasport: '',
                address: values.address,
                status: 'active'
              }).unwrap();
              customerId = customerResponse.id;
            }
          }

          // Resolve or create object (without house/contact)
          let objectId: number | undefined;
          if (values.object && customerId) {
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

          // Build TU create payload (map migrated fields)
          const payloadCreate: any = {
            // Core TU fields from the form
            request_source: values.request_source,
            request_number: values.request_number,
            request_date: values.request_date || dayjs(Date.now()).format('YYYY-MM-DD'),
            payment_deadline: values.payment_deadline,
            type_ty: values.type_ty,
            object_name: values.object_name ?? values.object,
            address: values.address,
            status: values.status,
            // Mapping from ApplicationsCreate fields to TU fields
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
            customer: customerId
          };
          if (objectId != null) payloadCreate.entity = objectId;
          if (values.formula != null) payloadCreate.formula = values.formula;
          if (values.eni != null) payloadCreate.eni = values.eni;

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

            // Build TU lists (labels)
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
            // In case of unexpected error during checks, proceed but log it
            console.warn('Refusal/TU checks failed', e);
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

        // Update mode: keep normalized strings for dates
        const base: any = {
          ...values,
          customer: tuQuery.data.customer.id,
          entity: tuQuery.data.entity
        };
        if (values.request_date) base.request_date = values.request_date;
        if (values.payment_deadline) base.payment_deadline = values.payment_deadline;
        if (tuQuery.data.application?.id != null) base.application = tuQuery.data.application.id;

        patchTy({ id: Number(tyId), body: base });
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
      triggerGetObjects,
      createObject,
      triggerCheckCustomer,
      triggerCheckEntity,
      triggerCheckTuCustomer,
      triggerCheckTuEntity
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
        payment_deadline: toStr(tuQuery.data.payment_deadline as unknown as string | Date | undefined),
        // Для Select поле ожидает id. Бэк может вернуть либо объект, либо число.
        type_ty: getTypeTyId(tuQuery.data.type_ty),
        // request_source может прийти строкой или объектом {id,title}
        request_source: getRequestSourceTitle((tuQuery.data as any).request_source)
      } as any);
    }
  }, [form, tuQuery]);

  // const stageOptions = useMemo(
  //   () => [
  //     { value: 'draft', label: t('addTuForms.form.options.stages.draft') },
  //     { value: 'review', label: t('addTuForms.form.options.stages.review') },
  //     { value: 'approved', label: t('addTuForms.form.options.stages.approved') },
  //     { value: 'done', label: t('addTuForms.form.options.stages.done') }
  //   ],
  //   []
  // );

  // const statusOptions = [
  //   {
  //     value: 'active',
  //     label: t('addTuForms.form.options.status.active')
  //   },
  //   {
  //     value: 'inactive',
  //     label: t('addTuForms.form.options.status.inactive')
  //   },
  //   {
  //     value: 'archived',
  //     label: t('addTuForms.form.options.status.archived')
  //   }
  // ];

  // All fields inside "ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ" should be read-only while editing TU (match water-2)
  const techParamsReadOnly = Boolean(tuQuery.data?.id);

  const onCustomerEdit = useCallback(() => {
    navigate(`/dashboard/customers/${tuQuery.data?.customer.id}/edit`);
  }, [navigate, tuQuery.data?.customer?.id]);

  const onAddressEdit = useCallback(() => {
    navigate(`/dashboard/objects/${tuQuery.data?.entity}`);
  }, [navigate, tuQuery.data?.entity]);

  return (
    <DashboardLayout title={title}>
      <Form
        scrollToFirstError={{ behavior: 'smooth', scrollMode: 'if-needed', block: 'center' }}
        form={form}
        requiredMark={false}
        name='add-tu-form'
        layout='vertical'
        onFinish={onFinish}
        onKeyDown={handleEnterFocusNext}
        className='add-tu-forms'
      >
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          {t('addTuForms.titles.main')}
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={'Номер тех условия'} rules={[{ required: true, message: t('addTuForms.form.validation.specifySource') }]}>
              <Input size='large' defaultValue={'04-'} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={'Дата тех совета'}
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyRequestDate') }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='DD.MM.YYYY' size='large' placeholder={t('addTuForms.form.placeholders.requestDate')} />
            </Form.Item>
          </Col>
        </Row>

        {/* Источник запроса: Select (из сервера) */}
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

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestNumber')}
              name='request_number'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyRequestNumber') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.requestNumber')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.requestDate')}
              name='request_date'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyRequestDate') }]}
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
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyCustomer') }]}
            >
              <Input
                disabled={!isCreateMode}
                size='large'
                placeholder={t('addTuForms.form.placeholders.customer')}
                addonAfter={
                  !isCreateMode ? (
                    <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                      <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                    </Button>
                  ) : undefined
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.objectName')}
              name='object_name'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyObjectName') }]}
            >
              <Input size='large' placeholder={t('addTuForms.form.placeholders.objectName')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.address')}
              name='address'
              rules={[{ required: true, message: t('addTuForms.form.validation.specifyAddress') }]}
            >
              <Input
                disabled={!isCreateMode}
                size='large'
                placeholder={t('addTuForms.form.placeholders.address')}
                addonAfter={
                  !isCreateMode ? (
                    <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onAddressEdit}>
                      <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                    </Button>
                  ) : undefined
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.techConditionType')}
              name='type_ty'
              rules={[{ required: true, message: t('addTuForms.form.validation.selectType') }]}
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
        </Row>

        {/* ENI */}
        {/* <Form.Item label={t('addTuForms.form.labels.eni')} name='eni' rules={[{ required: false }, { validator: zodRule(eniSchema) }]}>
          <MaskedInput size='large' mask='000-000-000-000' placeholder={t('addTuForms.form.placeholders.eni')} inputMode='numeric' />
        </Form.Item> */}

        {/* =========================
            ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.techParams')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.waterRequired')} name='water_required' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.waterRequired')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.pressureRequired')} name='pressure_required' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.pressureRequired')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.fireFightingInner')} name='fire_fighting_outer' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.fireFightingOuter')} name='fire_fighting_inner' rules={[{ required: false }]}>
              <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={t('addTuForms.form.labels.sewageAmount')}
          name='sewage_amount'
          rules={[{ required: true, message: t('addTuForms.form.validation.required') }]}
        >
          <Input disabled={techParamsReadOnly} size='large' placeholder={t('addTuForms.form.placeholders.sewageAmount')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.formula')} name='formula' rules={[{ required: false }]}>
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

        {/* =========================
            ПОДКЛЮЧЕНИЕ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.connection')}
        </Title>

        {/* Водопровод */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('tuDetails.titles.waterSupply')}
        </Title>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={'Подключение выполнить к водопроводной линии Д'} name='water_pipe' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
                <Option value='существующий'>существующий</Option>
                <Option value='проектируемый'>проектируемый</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={'Диаметром'} name='street_pass_water' rules={[{ required: false }]}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_water' rules={[{ required: false }]}>
          <Input size='large' />
        </Form.Item>
        <Form.Item label={'Предусмотреть'} name='provide_water' rules={[{ required: false }]}>
          <TextArea size='large' />
        </Form.Item>

        {/* Пожаротушение */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('addTuForms.form.labels.fireInput1')}
        </Title>

        <Form.Item label={'На пожаротушение объекта подключение выполнить'} rules={[{ required: false }]}>
          <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
            <Option value='существующий'>существующий</Option>
            <Option value='проектируемый'>проектируемый</Option>
          </Select>
        </Form.Item>
        <Form.Item label={t('addTuForms.form.labels.fireInput1')} name='fire_input_1' rules={[{ required: false }]}>
          <Input size='large' />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.waterPipeDiameter1')} name='collector_diametr_fire_1' rules={[{ required: false }]}>
              <Input size='large' />
            </Form.Item>
          </Col>
          {/* <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.freePressureInput1')}
              name='free_pressure_required_input_1'
              rules={[{ required: false }]}
            >
              <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.freePressureInput1')} />
            </Form.Item>
          </Col> */}
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_1' rules={[{ required: false }]}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: '12px' }}>
          {t('addTuForms.form.labels.fireInput2')}
        </Title>
        <Form.Item label={'На пожаротушение объекта подключение выполнить'} rules={[{ required: false }]}>
          <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
            <Option value='существующий'>существующий</Option>
            <Option value='проектируемый'>проектируемый</Option>
          </Select>
        </Form.Item>
        <Form.Item label={t('addTuForms.form.labels.fireInput2')} name='fire_input_2' rules={[{ required: false }]}>
          <Input size='large' />
        </Form.Item>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.waterPipeDiameter2')} name='collector_diametr_fire_2' rules={[{ required: false }]}>
              <Input size='large' />
            </Form.Item>
          </Col>
          {/* <Col span={8}>
            <Form.Item
              label={t('addTuForms.form.labels.freePressureInput2')}
              name='free_pressure_required_input_2'
              rules={[{ required: false }]}
            >
              <Input type='number' min={0} size='large' placeholder={t('addTuForms.form.placeholders.freePressureInput2')} />
            </Form.Item>
          </Col> */}
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass_input_2' rules={[{ required: false }]}>
              <Input size='large' />
            </Form.Item>
          </Col>
        </Row>

        {/* Канализация */}
        <Title level={5} style={{ marginTop: '12px' }}>
          {t('tuDetails.titles.sewer')}
        </Title>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item label={t('addTuForms.form.labels.sewer')} name='sewer_pipe' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.selectOption')}>
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
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item label={'Предусмотреть'} name='provide_sewer' rules={[{ required: false }]}>
          <TextArea size='large' />
        </Form.Item>

        {/* Примечания */}
        {/* <Form.Item label={t('addTuForms.form.labels.notes')} name='notes' rules={[{ required: false }]}>
          <Input.TextArea placeholder={t('addTuForms.form.placeholders.notes')} rows={3} />
        </Form.Item> */}

        {/* =========================
            ФИНАНСЫ
        ========================= */}
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
