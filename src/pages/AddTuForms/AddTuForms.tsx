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

const { Option } = Select;
const { Title } = Typography;

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  const { tyId } = useParams();
  const formulasQuery = useGetAllFormulasQuery({ page: 1 });
  const typesTyQuery = useGetTypesTyQuery();
  const [updateTy, { isLoading, isSuccess }] = useUpdateTyMutation();
  const tuQuery = useGetTyByIdQuery({ tyId: tyId || '' });
  const [getObject] = useLazyGetAllObjectsQuery();
  const [form] = Form.useForm<ITyItem>();

  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);

  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);

  const onFinish = useCallback(
    async (values: ITyItem) => {
      try {
        if (!tuQuery.data) {
          message.error('Не удалось получить данные ТУ.');
          return;
        }

        const payload = {
          ...tuQuery,
          ...values,
          customer: tuQuery.data?.customer.id,
          request_date: values.request_date,
          payment_deadline: values.payment_deadline,
          entity: tuQuery.data?.entity
        };
        updateTy({ id: tyId as string, body: payload });
        console.log('create');
      } catch (e) {
        console.error(e);
        message.error('Произошла ошибка при создании ТУ.');
      }
    },
    [tuQuery, tyId, updateTy]
  );

  useEffect(() => {
    if (isSuccess) {
      message.success('Техническое условие успешно создано!');
      form.resetFields();
      navigate(`/dashboard/technical-conditions/tu-details/${tyId}`);
    }
  }, [form, isSuccess, navigate, tyId]);

  useEffect(() => {
    if (tuQuery.data) {
      form.setFieldsValue({
        ...tuQuery.data,
        customer: tuQuery.data.customer.full_name,
        application: tuQuery.data.application?.id,
        request_date: tuQuery.data.request_date,
        payment_deadline: tuQuery.data.payment_deadline
      });
    }
  }, [form, getObject, tuQuery]);

  const stageOptions = useMemo(
    () => [
      { value: 'draft', label: 'Черновик' },
      { value: 'review', label: 'На рассмотрении' },
      { value: 'approved', label: 'Одобрено' },
      { value: 'done', label: 'Завершено' }
    ],
    []
  );
  const statusOptions = [
    {
      value: 'active',
      label: 'Активен'
    },
    {
      value: 'inactive',
      label: 'Неактивен'
    },
    {
      value: 'archived',
      label: 'Архивирован'
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
          Основная информация
        </Title>

        <Form.Item label='Источник запроса' name='request_source' rules={[{ required: true, message: 'Укажите источник' }]}>
          <Input size='large' placeholder='Название объекта' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Номер запроса' name='request_number' rules={[{ required: true, message: 'Укажите номер запроса' }]}>
              <Input size='large' placeholder='12345' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Дата запроса'
              name='request_date'
              rules={[{ required: true, message: 'Укажите дату запроса' }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker format='YYYY-MM-DD' size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Заказчик' name='customer' rules={[{ required: true, message: 'Укажите заказчика' }]}>
              <Input
                disabled
                size='large'
                placeholder='ФИО или организация'
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onCustomerEdit}>
                    <span style={{ fontSize: 14 }}>Изменить</span>
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Наименование объекта'
              name='object_name'
              rules={[{ required: true, message: 'Укажите наименование объекта' }]}
            >
              <Input size='large' placeholder='Жилой дом' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Место нахождения объекта' name='address' rules={[{ required: true, message: 'Укажите адрес' }]}>
              <Input
                disabled
                size='large'
                placeholder='Адрес объекта'
                addonAfter={
                  <Button type='link' style={{ padding: 0, height: 'auto' }} onClick={onAddressEdit}>
                    <span style={{ fontSize: 14 }}>Изменить</span>
                  </Button>
                }
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Тип технического условия' name='tech_conditionType' rules={[{ required: true, message: 'Выберите тип' }]}>
              <Select size='large' placeholder='Тип ТУ'>
                {typesTyQuery.data?.map((type) => (
                  <Option key={type.id} value={type.id}>
                    {type.title}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='ЕНИ' name='eni' rules={[{ required: false }]}>
          <Input size='large' placeholder='1234' />
        </Form.Item>

        {/* =========================
            ТЕХНИЧЕСКИЕ ПАРАМЕТРЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          Технические параметры
        </Title>

        <Form.Item label='Количество стоков' name='sewage_amount' rules={[{ required: true, message: 'Укажите кол-во' }]}>
          <Input size='large' placeholder='Например: 2' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Требуемое количество воды' name='water_required' rules={[{ required: false }]}>
              <Input size='large' placeholder='123' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Требуемый свободный напор' name='pressure_required' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Пожаротушение (внутреннее/наружное)' name='fire_fighting' rules={[{ required: false }]}>
          <Input size='large' placeholder='Жилой дом' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Стадия' name='stage' rules={[{ required: false }]}>
              <Select size='large' placeholder='Активен / Неактивен'>
                {stageOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Формулы' name='formula' rules={[{ required: false }]}>
              <Select size='large' placeholder='Формулы'>
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
          Подключение
        </Title>

        <Form.Item label='К чему подключается объект' name='connection_target' rules={[{ required: false }]}>
          <Input size='large' placeholder='Название объекта' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Проходящий по ул.' name='street_pass' rules={[{ required: false }]}>
              <Input size='large' placeholder='Проходящий по ул.' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Коллектор' name='collector' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Водопровод' name='water_pipe' rules={[{ required: false }]}>
              <Input size='large' placeholder='Проходящий по ул.' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Канализация' name='sewer' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Пожарные' name='fire_input_1' rules={[{ required: false }]}>
              <Input size='large' placeholder='ввод 1' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Ввод 2' name='fire_input_2' rules={[{ required: false }]}>
              <Input size='large' placeholder='ввод 2' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Примечания и комментарии' name='notes' rules={[{ required: false }]}>
          <Input.TextArea placeholder='Комментарий' rows={3} />
        </Form.Item>

        {/* =========================
            ФИНАНСЫ
        ========================= */}
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px', marginTop: '24px' }}>
          Финансы
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Оплата за ТУ (за бумагу)' name='payment_paper' rules={[{ required: false }]}>
              <Input size='large' placeholder='Название объекта' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Оплата за подключение' name='payment_connection' rules={[{ required: false }]}>
              <Input size='large' placeholder='Название объекта' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='СтатусОплаты' name='status' rules={[{ required: true }]}>
              <Select size='large' placeholder='Оплачено / Не оплачено'>
                {statusOptions.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Сумма оплаты' name='payment_amount' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label='Срок оплаты ТУ'
              name='payment_deadline'
              rules={[{ required: false }]}
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker size='large' placeholder='02-02-2025' format='YYYY-MM-DD' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='№ счета на оплату' name='payment_invoice_number' rules={[{ required: false }]}>
              <Input size='large' placeholder='1234567890' />
            </Form.Item>
          </Col>
        </Row>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button loading={isLoading} type='primary' htmlType='submit' size='large'>
                Готово
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default AddTuForms;
