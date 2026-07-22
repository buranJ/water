import { FC, useEffect, useState } from 'react';
import { Button, Col, DatePicker, Divider, Form, Input, InputNumber, message, Modal, Row, Space, Typography } from 'antd';
import dayjs, { Dayjs } from 'dayjs';

import { useUpdateProtocolTableMutation } from 'api/Buhgalteria.api';

const { Title, Text } = Typography;

interface IProtocolData {
  id: number;
  protocol_number?: string;
  protocol_date?: string;
  customer?: string;
  note?: string;
  load?: string;
  water_required?: string;
  sewage_amount?: string;
  coefficient?: number;
  water_price?: string;
  kanal_price?: string;
  technical_condition?: number;
  all_water_required?: string;
  all_sewage_amount?: string;
  paid_water_required?: string;
  paid_sewage_amount?: string;
}

interface IProps {
  visible: boolean;
  onClose: () => void;
  protocolData: IProtocolData | null;
  onSuccess?: () => void;
}

interface IFormValues {
  protocol_number?: string;
  protocol_date?: string;
  customer?: string;
  note?: string;
  load?: string;
  water_required?: string;
  sewage_amount?: string;
  coefficient?: number;
  water_price?: string;
  kanal_price?: string;
  all_water_required?: number;
  all_sewage_amount?: number;
  paid_water_required?: number;
  paid_sewage_amount?: number;
}

export const EditProtocolTableModal: FC<IProps> = ({ visible, onClose, protocolData, onSuccess }) => {
  const [form] = Form.useForm<IFormValues>();
  const [updateProtocol, { isLoading }] = useUpdateProtocolTableMutation();

  // Состояния для расчётов
  const [allWaterRequired, setAllWaterRequired] = useState<number>(0);
  const [allSewageAmount, setAllSewageAmount] = useState<number>(0);
  const [paidWaterRequired, setPaidWaterRequired] = useState<number>(0);
  const [paidSewageAmount, setPaidSewageAmount] = useState<number>(0);
  const [waterPrice, setWaterPrice] = useState<number>(0);
  const [kanalPrice, setKanalPrice] = useState<number>(0);

  useEffect(() => {
    if (visible && protocolData) {
      const formValues: IFormValues = {
        protocol_number: protocolData.protocol_number || '',
        protocol_date: protocolData.protocol_date || undefined,
        customer: protocolData.customer || '',
        note: protocolData.note || '',
        load: protocolData.load || '',
        water_required: protocolData.water_required || '',
        sewage_amount: protocolData.sewage_amount || '',
        coefficient: protocolData.coefficient || 0,
        water_price: protocolData.water_price || '',
        kanal_price: protocolData.kanal_price || '',
        all_water_required: parseFloat(protocolData.all_water_required || '0') || 0,
        all_sewage_amount: parseFloat(protocolData.all_sewage_amount || '0') || 0,
        paid_water_required: parseFloat(protocolData.paid_water_required || '0') || 0,
        paid_sewage_amount: parseFloat(protocolData.paid_sewage_amount || '0') || 0
      };

      form.setFieldsValue(formValues);

      // Устанавливаем начальные значения для расчётов
      setAllWaterRequired(formValues.all_water_required || 0);
      setAllSewageAmount(formValues.all_sewage_amount || 0);
      setPaidWaterRequired(formValues.paid_water_required || 0);
      setPaidSewageAmount(formValues.paid_sewage_amount || 0);
      setWaterPrice(parseFloat(protocolData.water_price || '0') || 0);
      setKanalPrice(parseFloat(protocolData.kanal_price || '0') || 0);
    }
  }, [visible, protocolData, form]);

  // Расчёт разницы
  const waterDifference = allWaterRequired - paidWaterRequired;
  const sewageDifference = allSewageAmount - paidSewageAmount;

  // Расчёт итоговых сумм
  const waterTotal = waterDifference * waterPrice;
  const kanalTotal = sewageDifference * kanalPrice;
  const grandTotal = waterTotal + kanalTotal;

  const handleSubmit = async (values: IFormValues) => {
    if (!protocolData) return;

    try {
      // Подготавливаем данные для API
      const apiBody: Record<string, string | number | undefined> = {};

      // Номер и дата протокола (необязательные)
      if (values.protocol_number !== undefined && values.protocol_number !== '') {
        apiBody.protocol_number = values.protocol_number;
      }
      if (values.protocol_date) {
        apiBody.protocol_date = values.protocol_date;
      }

      // Обрабатываем каждое поле отдельно
      if (values.customer !== undefined && values.customer !== '') {
        apiBody.customer = values.customer;
      }
      if (values.note !== undefined && values.note !== '') {
        apiBody.note = values.note;
      }
      if (values.load !== undefined && values.load !== '') {
        apiBody.load = values.load;
      }
      if (values.water_required !== undefined && values.water_required !== '') {
        apiBody.water_required = values.water_required;
      }
      if (values.sewage_amount !== undefined && values.sewage_amount !== '') {
        apiBody.sewage_amount = values.sewage_amount;
      }
      if (values.coefficient !== undefined) {
        apiBody.coefficient = values.coefficient;
      }
      if (values.water_price !== undefined && values.water_price !== '') {
        apiBody.water_price = values.water_price;
      }
      if (values.kanal_price !== undefined && values.kanal_price !== '') {
        apiBody.kanal_price = values.kanal_price;
      }

      // Новые поля
      if (values.all_water_required !== undefined) {
        apiBody.all_water_required = values.all_water_required.toString();
      }
      if (values.all_sewage_amount !== undefined) {
        apiBody.all_sewage_amount = values.all_sewage_amount.toString();
      }
      if (values.paid_water_required !== undefined) {
        apiBody.paid_water_required = values.paid_water_required.toString();
      }
      if (values.paid_sewage_amount !== undefined) {
        apiBody.paid_sewage_amount = values.paid_sewage_amount.toString();
      }

      await updateProtocol({
        protocolId: protocolData.id.toString(),
        body: {
          ...apiBody,
          technical_condition: protocolData.technical_condition || 0
        }
      }).unwrap();

      message.success('Протокол успешно обновлен');

      if (onSuccess) {
        await onSuccess();
      }

      onClose();
    } catch (error) {
      console.error('Update protocol error:', error);

      let errorMessage = 'Ошибка при обновлении протокола';

      if (error && typeof error === 'object' && 'status' in error) {
        const httpError = error as { status: number; data?: { message?: string } };

        if (httpError.status === 400) {
          errorMessage = 'Некорректные данные';
        } else if (httpError.status === 404) {
          errorMessage = 'Протокол не найден';
        } else if (httpError.status === 403) {
          errorMessage = 'Нет доступа для редактирования';
        } else if (httpError.status === 500) {
          errorMessage = 'Внутренняя ошибка сервера';
        } else if (httpError.data?.message) {
          errorMessage = httpError.data.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      message.error(errorMessage);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setAllWaterRequired(0);
    setAllSewageAmount(0);
    setPaidWaterRequired(0);
    setPaidSewageAmount(0);
    onClose();
  };

  const handleValuesChange = (changedValues: Partial<IFormValues>) => {
    if ('all_water_required' in changedValues && changedValues.all_water_required !== undefined) {
      setAllWaterRequired(changedValues.all_water_required);
    }
    if ('all_sewage_amount' in changedValues && changedValues.all_sewage_amount !== undefined) {
      setAllSewageAmount(changedValues.all_sewage_amount);
    }
    if ('paid_water_required' in changedValues && changedValues.paid_water_required !== undefined) {
      setPaidWaterRequired(changedValues.paid_water_required);
    }
    if ('paid_sewage_amount' in changedValues && changedValues.paid_sewage_amount !== undefined) {
      setPaidSewageAmount(changedValues.paid_sewage_amount);
    }
    if ('water_price' in changedValues && changedValues.water_price !== undefined) {
      setWaterPrice(parseFloat(changedValues.water_price) || 0);
    }
    if ('kanal_price' in changedValues && changedValues.kanal_price !== undefined) {
      setKanalPrice(parseFloat(changedValues.kanal_price) || 0);
    }
  };

  return (
    <Modal
      title='Изменить протокол'
      open={visible}
      onCancel={handleCancel}
      width={800}
      footer={null}
      maskClosable={!isLoading}
      closable={!isLoading}
      style={{ top: 20 }}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} onValuesChange={handleValuesChange} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='protocol_number' label='Номер протокола'>
              <Input placeholder='Введите номер протокола' disabled={isLoading} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name='protocol_date'
              label='Дата протокола'
              normalize={(value: Dayjs) => (value ? value.format('YYYY-MM-DD') : '')}
              getValueProps={(value: string) => ({ value: value ? dayjs(value) : null })}
            >
              <DatePicker style={{ width: '100%' }} format='DD.MM.YYYY' placeholder='Выберите дату' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5}>Основные данные протокола</Title>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='customer' label='Заказчик'>
              <Input placeholder='Введите название заказчика' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='note' label='Примечание/объект'>
              <Input.TextArea placeholder='Введите примечание или описание объекта' disabled={isLoading} rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Технические параметры
        </Title>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name='load' label='Нагрузка'>
              <Input placeholder='0.0' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='water_required' label='Требуемый объем воды'>
              <Input placeholder='0.0' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='sewage_amount' label='Объем канализации'>
              <Input placeholder='0.0' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='coefficient' label='Коэффициент'>
              <InputNumber<number> style={{ width: '100%' }} placeholder='0.0' step={0.1} min={0} disabled={isLoading} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Стоимость
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='water_price' label='Цена за водопровод, сом'>
              <Input placeholder='0' disabled={isLoading} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='kanal_price' label='Цена за канализацию, сом'>
              <Input placeholder='0' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Divider />

        <Title level={5}>Расчёт оплаты</Title>

        <Text type='secondary' style={{ display: 'block', marginBottom: 16 }}>
          Укажите общий и оплаченный объём для автоматического расчёта суммы к доплате
        </Text>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='all_water_required'
              label='Общий объём воды (м³)'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber<number> style={{ width: '100%' }} placeholder='0' min={0} step={0.01} disabled={isLoading} precision={2} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='paid_water_required'
              label='Оплачено воды (м³)'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber<number> style={{ width: '100%' }} placeholder='0' min={0} step={0.01} disabled={isLoading} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='all_sewage_amount'
              label='Общий объём канализации (м³)'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber<number> style={{ width: '100%' }} placeholder='0' min={0} step={0.01} disabled={isLoading} precision={2} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='paid_sewage_amount'
              label='Оплачено канализации (м³)'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber<number> style={{ width: '100%' }} placeholder='0' min={0} step={0.01} disabled={isLoading} precision={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col span={24}>
            <div
              style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #d9d9d9'
              }}
            >
              <Space direction='vertical' style={{ width: '100%' }} size='small'>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Разница по воде:</Text>
                  <Text strong style={{ color: waterDifference >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {waterDifference.toFixed(2)} м³
                  </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Стоимость водопровода:</Text>
                  <Text>{waterTotal.toFixed(2)} сом</Text>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Разница по канализации:</Text>
                  <Text strong style={{ color: sewageDifference >= 0 ? '#52c41a' : '#ff4d4f' }}>
                    {sewageDifference.toFixed(2)} м³
                  </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>Стоимость канализации:</Text>
                  <Text>{kanalTotal.toFixed(2)} сом</Text>
                </div>

                <Divider style={{ margin: '8px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong style={{ fontSize: '16px' }}>
                    Итого к оплате:
                  </Text>
                  <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                    {grandTotal.toFixed(2)} сом
                  </Text>
                </div>
              </Space>
            </div>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel} disabled={isLoading}>
              Отмена
            </Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Сохранить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
