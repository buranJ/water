import { FC, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components';
import { ITyItem } from 'types/entities';
import './style.scss';

import { useGetAllFormulasQuery } from 'api/Formula.api';
import { useLazyGetAllObjectsQuery } from 'api/Object.api';
import { useGetTyByIdQuery, useGetTypesTyQuery, useUpdateTyMutation } from 'api/Ty.api';
import { t } from 'i18next';

const { Option } = Select;
const { Title } = Typography;

type FormValues = Omit<ITyItem, 'type_ty' | 'customer' | 'application'> & {
  type_ty: number;
  customer: string;
  application: number;
};

const getTypeTyId = (tt: unknown): number | undefined => {
  if (typeof tt === 'number') return tt;
  if (tt && typeof tt === 'object' && 'id' in (tt as Record<string, unknown>)) {
    const id = (tt as { id?: number }).id;
    return typeof id === 'number' ? id : undefined;
  }
  return undefined;
};

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { tyId } = useParams();
  const formulasQuery = useGetAllFormulasQuery({ page: 1 });
  const typesTyQuery = useGetTypesTyQuery();
  const [updateTy, { isLoading, isSuccess }] = useUpdateTyMutation();
  const tuQuery = useGetTyByIdQuery({ tyId: tyId || '' });
  const [getObject] = useLazyGetAllObjectsQuery();
  const [form] = Form.useForm<FormValues>();

  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);

  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);

  const onFinish = useCallback(
    async (values: FormValues) => {
      try {
        if (!tuQuery.data) {
          message.error(t('addTuForms.messages.loadTuError'));
          return;
        }

        const payload = {
          ...values,
          customer: tuQuery.data.customer.id,
          application: tuQuery.data.application!.id,
          entity: tuQuery.data.entity,
          request_date: values.request_date,
          payment_deadline: values.payment_deadline,
          // Select возвращает id типа, поэтому отправляем число, а не объект
          type_ty: values.type_ty
        };
        updateTy({ id: tyId as string, body: payload });
      } catch (e) {
        console.error(e);
        message.error(t('addTuForms.messages.createTuError'));
      }
    },
    [tuQuery, tyId, updateTy]
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
      console.log(tuQuery?.data);
      form.setFieldsValue({
        ...tuQuery.data,
        customer: tuQuery.data.customer.full_name,
        application: tuQuery.data.application?.id,
        request_date: tuQuery.data.request_date,
        payment_deadline: tuQuery.data.payment_deadline,
        // Для Select поле ожидает id. Бэк может вернуть либо объект, либо число.
        type_ty: getTypeTyId(tuQuery.data.type_ty)
      });
    }
  }, [form, getObject, tuQuery]);

  const stageOptions = useMemo(
    () => [
      { value: 'draft', label: t('addTuForms.form.options.stages.draft') },
      { value: 'review', label: t('addTuForms.form.options.stages.review') },
      { value: 'approved', label: t('addTuForms.form.options.stages.approved') },
      { value: 'done', label: t('addTuForms.form.options.stages.done') }
    ],
    []
  );
  const statusOptions = [
    {
      value: 'active',
      label: t('addTuForms.form.options.status.active')
    },
    {
      value: 'inactive',
      label: t('addTuForms.form.options.status.inactive')
    },
    {
      value: 'archived',
      label: t('addTuForms.form.options.status.archived')
    }
  ];

  const onCustomerEdit = useCallback(() => {
    navigate(`/dashboard/customers/${tuQuery.data?.customer.id}/edit`);
  }, [navigate, tuQuery.data?.customer.id]);

  const onAddressEdit = useCallback(() => {
    navigate(`/dashboard/objects/${tuQuery.data?.entity}`);
  }, [navigate, tuQuery.data?.entity]);

  return (
    <DashboardLayout title={title}>
      <Form form={form} requiredMark={false} name='add-tu-form' layout='vertical' onFinish={onFinish} className='add-tu-forms'>
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          {t('addTuForms.titles.main')}
        </Title>

        <Form.Item
          label={t('addTuForms.form.labels.requestSource')}
          name='request_source'
          rules={[{ required: true, message: t('addTuForms.form.validation.specifySource') }]}
        >
          <Input size='large' placeholder={t('addTuForms.form.placeholders.requestSource')} />
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
              <DatePicker format='YYYY-MM-DD' size='large' placeholder={t('addTuForms.form.placeholders.requestDate')} />
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
                disabled
                size='large'
                placeholder={t('addTuForms.form.placeholders.customer')}
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                    <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                  </Button>
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
                disabled
                size='large'
                placeholder={t('addTuForms.form.placeholders.address')}
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onAddressEdit}>
                    <span style={{ fontSize: 14 }}>{t('addTuForms.form.buttons.change')}</span>
                  </Button>
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

        <Form.Item label={t('addTuForms.form.labels.eni')} name='eni' rules={[{ required: false }]}>
          <Input size='large' placeholder={t('addTuForms.form.placeholders.eni')} />
        </Form.Item>

        {/* =========================
            ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.techParams')}
        </Title>

        <Form.Item
          label={t('addTuForms.form.labels.sewageAmount')}
          name='sewage_amount'
          rules={[{ required: true, message: t('addTuForms.form.validation.required') }]}
        >
          <Input size='large' placeholder={t('addTuForms.form.placeholders.sewageAmount')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.waterRequired')} name='water_required' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.waterRequired')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.pressureRequired')} name='pressure_required' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.pressureRequired')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('addTuForms.form.labels.fireFighting')} name='fire_fighting' rules={[{ required: false }]}>
          <Input size='large' placeholder={t('addTuForms.form.placeholders.fireFighting')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.stage')} name='stage' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.stage')}>
                {stageOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.formula')} name='formula' rules={[{ required: false }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.formula')}>
                {formulasQuery.data?.results.map((formula) => (
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

        <Form.Item label={t('addTuForms.form.labels.connectionTarget')} name='connection_target' rules={[{ required: false }]}>
          <Input size='large' placeholder={t('addTuForms.form.placeholders.connectionTarget')} />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.streetPass')} name='street_pass' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.streetPass')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.collector')} name='collector' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.collector')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.waterPipe')} name='water_pipe' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.waterPipe')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.sewer')} name='sewer' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.sewer')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.fireInput1')} name='fire_input_1' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.fireInput1')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.fireInput2')} name='fire_input_2' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.fireInput2')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('addTuForms.form.labels.notes')} name='notes' rules={[{ required: false }]}>
          <Input.TextArea placeholder={t('addTuForms.form.placeholders.notes')} rows={3} />
        </Form.Item>

        {/* =========================
            ФИНАНСЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          {t('addTuForms.titles.finance')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.paymentPaper')} name='payment_paper' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.paymentPaper')} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.paymentConnection')} name='payment_connection' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.paymentConnection')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.status')} name='status' rules={[{ required: true }]}>
              <Select size='large' placeholder={t('addTuForms.form.placeholders.status')}>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.paymentAmount')} name='payment_amount' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.paymentAmount')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label={t('addTuForms.form.labels.paymentDeadline')}
              name='payment_deadline'
              rules={[{ required: false }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker size='large' placeholder={t('addTuForms.form.placeholders.paymentDeadline')} format='YYYY-MM-DD' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label={t('addTuForms.form.labels.paymentInvoiceNumber')} name='payment_invoice_number' rules={[{ required: false }]}>
              <Input size='large' placeholder={t('addTuForms.form.placeholders.invoiceNumber')} />
            </Form.Item>
          </Col>
        </Row>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button loading={isLoading} type='primary' htmlType='submit' size='large'>
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
