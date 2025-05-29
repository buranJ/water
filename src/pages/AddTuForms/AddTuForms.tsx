import { FC } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'antd';
import Title from 'antd/es/typography/Title';
import { DashboardLayout } from 'components';
import './style.scss';

const { Option } = Select;

const AddTuForms: FC<{ title: string }> = ({ title }) => {
  const onFinish = (values: FormData) => {
    console.log('Форма отправлена:', values);
  };

  return (
    <DashboardLayout title={title}>
      <Form requiredMark={false} name='add-tu-form' layout='vertical' onFinish={onFinish} className='add-tu-forms'>
        <Title level={4} style={{ borderBottom: '1px solid #D9D9D9', paddingBottom: '4px' }}>
          Основная информация
        </Title>

        <Form.Item label='Источник запроса' name='source' rules={[{ required: true, message: 'Укажите источник' }]}>
          <Input size='large' placeholder='Например: Заявка №...' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Номер запроса' name='requestNumber' rules={[{ required: true, message: 'Укажите номер запроса' }]}>
              <Input size='large' placeholder='12345' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Дата запроса' name='requestDate' rules={[{ required: true, message: 'Укажите дату запроса' }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Заказчик' name='customer' rules={[{ required: true, message: 'Укажите заказчика' }]}>
              <Input size='large' placeholder='ФИО или организация' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Наименование объекта' name='objectName' rules={[{ required: true, message: 'Укажите наименование объекта' }]}>
              <Input size='large' placeholder='Жилой дом' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Место нахождения объекта' name='objectLocation' rules={[{ required: true, message: 'Укажите адрес' }]}>
              <Input size='large' placeholder='Адрес объекта' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Тип технического условия' name='techConditionType' rules={[{ required: true, message: 'Выберите тип' }]}>
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

        <Form.Item label='Количество стоков' name='wasteCount' rules={[{ required: true, message: 'Укажите кол-во' }]}>
          <Input size='large' placeholder='например: 2' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Требуемое количество воды' name='waterNeeded' rules={[{ required: false }]}>
              <Input size='large' placeholder='Адрес' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Требуемый свободный напор' name='freePressure' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label='Пожаротушение (внутреннее/наружное)' name='fireSuppression' rules={[{ required: false }]}>
          <Input size='large' placeholder='Жилой дом' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Стадия' name='stage' rules={[{ required: false }]}>
              <Select size='large' placeholder='Активен / Неактивен'>
                <Option value='active'>Активен</Option>
                <Option value='inactive'>Неактивен</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Ответственный' name='responsible' rules={[{ required: false }]}>
              <Select size='large' placeholder='Активен / Неактивен'>
                <Option value='active'>Активен</Option>
                <Option value='inactive'>Неактивен</Option>
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

        <Form.Item label='К чему подключается объект' name='connectionTarget' rules={[{ required: false }]}>
          <Input size='large' placeholder='Название объекта' />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Проходящий по ул.' name='street' rules={[{ required: false }]}>
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
            <Form.Item label='Водопровод' name='waterPipe' rules={[{ required: false }]}>
              <Input size='large' placeholder='Проходящий по ул.' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Канализация' name='sewage' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Пожарные' name='fire' rules={[{ required: false }]}>
              <Input size='large' placeholder='ввод 1' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Ввод 2' name='inlet2' rules={[{ required: false }]}>
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
            <Form.Item label='Оплата за ТУ (за бумагу)' name='paymentForTU' rules={[{ required: false }]}>
              <Input size='large' placeholder='Название объекта' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Оплата за подключение' name='paymentForConnection' rules={[{ required: false }]}>
              <Input size='large' placeholder='Название объекта' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Статус оплаты' name='paymentStatus' rules={[{ required: false }]}>
              <Input size='large' placeholder='Адрес' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='Сумма оплаты' name='paymentAmount' rules={[{ required: false }]}>
              <Input size='large' placeholder='01:00|12:34567' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label='Срок оплаты ТУ' name='tuPaymentDeadline' rules={[{ required: false }]}>
              <Input size='large' placeholder='02-02-2025' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label='№ счета на оплату' name='invoiceNumber' rules={[{ required: false }]}>
              <Select placeholder='Активен / Неактивен'>
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
