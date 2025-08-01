import { FC, useCallback, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Typography } from 'antd';
import { DashboardLayout } from 'components';
import { ITyItem } from 'types/entities';
import './style.scss';

import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
import { useCreateObjectMutation, useLazyGetAllObjectsQuery } from 'api/Object.api';
import { useLazyCheckRefuseByCustomerQuery, useLazyCheckRefuseByEntityQuery } from 'api/Refusal.api';
import { useCreateTyMutation } from 'api/Ty.api';

const { Option } = Select;
const { Title } = Typography;

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const [createTy] = useCreateTyMutation();
  const [getCustomer] = useLazyGetCustomerQuery();
  const [getObject, { data: object }] = useLazyGetAllObjectsQuery();
  const [createCustomer] = useCreateCustomerMutation();
  const [createObject] = useCreateObjectMutation();
  const [checkRefuseByCustomer] = useLazyCheckRefuseByCustomerQuery();
  const [checkRefuseByEntity] = useLazyCheckRefuseByEntityQuery();
  const [form] = Form.useForm<ITyItem>();

  const [foundCustomer, setFoundCustomer] = useState<{ id: number; full_name: string } | null>(null);

  const onFinish = useCallback(
    async (values: ITyItem) => {
      let customerId = foundCustomer?.id;
      let objectId = object?.results[0]?.id;

      if (customerId) {
        const refuseCustomerResp = await checkRefuseByCustomer(customerId).unwrap();
        if (refuseCustomerResp?.results?.length) {
          message.error(`Для заказчика ID=${customerId} найден отказ. Создание ТУ невозможно.`);
          return;
        }
      } else {
        const payloadForCustomer = {
          inn: values.inn,
          full_name: values.customer as string
        };
        const newCustomer = await createCustomer({ inn: payloadForCustomer.inn, full_name: payloadForCustomer.full_name }).unwrap();
        customerId = newCustomer.id;
      }

      if (objectId) {
        const refuseEntityResp = await checkRefuseByEntity(objectId).unwrap();
        if (refuseEntityResp?.results?.length) {
          message.error(`Для объекта ID=${objectId} найден отказ. Создание ТУ невозможно.`);
          return;
        }
      } else {
        const newObject = await createObject({
          title: values.object_name,
          address_street: values.address,
          customer: customerId,
          address_number: values.address,
          kadastr_number: values.eni,
          status: values.status
        }).unwrap();
        objectId = newObject.id;
      }

      const payload = {
        ...values,
        customer: customerId,
        request_date: values.request_date,
        payment_deadline: values.payment_deadline,
        entity: objectId
      };
      createTy(payload);
      setFoundCustomer(null);
    },
    [checkRefuseByCustomer, checkRefuseByEntity, createCustomer, createObject, createTy, foundCustomer?.id, object?.results]
  );

  const handleBlurInn = useCallback(async () => {
    const innValue: string = form.getFieldValue('inn');
    if (!innValue) {
      setFoundCustomer(null);
      return;
    }

    try {
      const { results } = await getCustomer({ search: innValue, page: 1, page_size: 5 }).unwrap();
      if (results && results.length > 0) {
        setFoundCustomer({ id: results[0].id, full_name: results[0].full_name });

        form.setFieldsValue({
          customer: results[0].full_name
        });
      } else {
        setFoundCustomer(null);
      }
    } catch (e) {
      console.error(e);
      setFoundCustomer(null);
    }
  }, [form, getCustomer]);

  const handleBlurObject = useCallback(async () => {
    const objectName: string = form.getFieldValue('object_name');
    if (!objectName) {
      return;
    }
    try {
      getObject({ search: objectName, page: 1, page_size: 5 });
    } catch (e) {
      console.error(e);
    }
  }, [form, getObject]);

  return (
    <DashboardLayout title={title}>
      <Form form={form} requiredMark={false} name='add-tu-form' layout='vertical' onFinish={onFinish} className='add-tu-forms'>
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          Основная информация
        </Title>

        <Form.Item label='Источник запроса' name='request_source' rules={[{ required: true, message: 'Укажите источник' }]}>
          <Input size='large' placeholder='Название объекта' />
        </Form.Item>

        <Form.Item
          label='ИНН'
          name='inn'
          rules={[
            { required: true, message: 'Укажите ИНН заказчика' },
            { min: 14, max: 14, message: 'ИНН должен состоять из 14 цифр' }
          ]}
        >
          <Input minLength={14} maxLength={14} size='large' onBlur={handleBlurInn} placeholder='ИНН заказчика' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Номер запроса' name='request_number' rules={[{ required: true, message: 'Укажите номер запроса' }]}>
              <Input size='large' placeholder='12345' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Дата запроса' name='request_date' rules={[{ required: true, message: 'Укажите дату запроса' }]}>
              <DatePicker format='YYYY-MM-DD' size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Заказчик' name='customer' rules={[{ required: true, message: 'Укажите заказчика' }]}>
              <Input disabled={!!foundCustomer} size='large' placeholder='ФИО или организация' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label='Наименование объекта'
              name='object_name'
              rules={[{ required: true, message: 'Укажите наименование объекта' }]}
            >
              <Input size='large' placeholder='Жилой дом' onBlur={handleBlurObject} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Место нахождения объекта' name='address' rules={[{ required: true, message: 'Укажите адрес' }]}>
              <Input size='large' placeholder='Адрес объекта' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Тип технического условия' name='tech_conditionType' rules={[{ required: true, message: 'Выберите тип' }]}>
              <Select size='large' placeholder='Активен / Неактивен'>
                <Option value='active'>Активен</Option>
                <Option value='inactive'>Неактивен</Option>
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

        <Row>
          <Form.Item label='Стадия' name='stage' rules={[{ required: false }]}>
            <Select size='large' placeholder='Активен / Неактивен'>
              <Option value='draft'>Черновик</Option>
              <Option value='review'>На рассмотрении</Option>
              <Option value='approved'>Одобрено</Option>
              <Option value='done'>Завершено</Option>
            </Select>
          </Form.Item>
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
            <Form.Item label='Статус оплаты' name='payment_status' rules={[{ required: false }]}>
              <Input size='large' placeholder='Адрес' />
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
            <Form.Item label='Срок оплаты ТУ' name='payment_deadline' rules={[{ required: false }]}>
              <DatePicker size='large' placeholder='02-02-2025' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='№ счета на оплату' name='payment_invoice_number' rules={[{ required: false }]}>
              <Select size='large' placeholder='Активен / Неактивен'>
                <Option value='active'>Активен</Option>
                <Option value='inactive'>Неактивен</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: '24px' }}>
              <Button type='primary' htmlType='submit' size='large'>
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
