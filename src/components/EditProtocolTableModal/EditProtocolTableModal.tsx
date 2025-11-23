import { FC, useEffect } from 'react';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Typography } from 'antd';
import type { IAccountingProtocol } from 'types/entities/accounting';

import { useUpdateProtocolMutation } from 'api/Accounting.api';

const { Title } = Typography;

interface IProps {
  visible: boolean;
  onClose: () => void;
  protocolData: IAccountingProtocol | null;
  onSuccess?: () => void;
}

interface IFormValues {
  customer_name: string; // Заказчик
  object_name: string; // Наименование объекта, адрес
  load_vik: number; // Нагрузки ВиК, м3/сут
  connection_cost_vik: number; // Ст-ть подключ. ВиК сом (без НДС)
  coefficient: number; // Прим. коэфф.
  total_cost: number; // Всего (ст-ть подкл + ст-ть ТУ), сом (без НДС)
  paid_earlier: number; // Погашено раньше
  payment_balance: number; // Остаток по оплате
}
export const EditProtocolTableModal: FC<IProps> = ({ visible, onClose, protocolData, onSuccess }) => {
  const [form] = Form.useForm<IFormValues>();
  const [updateProtocol, { isLoading }] = useUpdateProtocolMutation();

  useEffect(() => {
    if (visible && protocolData) {
      form.setFieldsValue({
        customer_name: protocolData.customer_name || '',
        object_name: protocolData.object_name || '',
        load_vik: protocolData.load_vik || 0,
        connection_cost_vik: protocolData.connection_cost_vik || 0,
        coefficient: protocolData.coefficient || 0,
        total_cost: protocolData.total_cost || 0,
        paid_earlier: protocolData.paid_earlier || 0, // Новое поле
        payment_balance: protocolData.payment_balance || 0 // Новое поле
      });
    }
  }, [visible, protocolData, form]);

  const handleSubmit = async (values: IFormValues) => {
    if (!protocolData) return;

    try {
      await updateProtocol({
        protocolId: protocolData.id.toString(),
        body: {
          load: protocolData.load,
          water_price: protocolData.water_price,
          kanal_price: protocolData.kanal_price,
          ...values,
          technical_condition: protocolData.technical_condition
        }
      }).unwrap();

      // Вызываем callback для обработки успешного обновления в родительском компоненте
      if (onSuccess) {
        await onSuccess();
      }

      message.success('Протокол успешно обновлен');

      // Закрываем модалку только после успешной обработки
      onClose();
    } catch (error) {
      console.error('Update protocol error:', error);

      // Показываем детализированное сообщение об ошибке
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
    onClose();
  };
  return (
    <Modal
      title='Изменить протокол'
      open={visible}
      onCancel={handleCancel}
      width={700} // Увеличиваем ширину для новых полей
      footer={null}
      maskClosable={!isLoading}
      closable={!isLoading}
      style={{ top: 20 }}
    >
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Title level={5}>Основные данные протокола</Title>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='customer_name' label='Заказчик' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input placeholder='Введите название заказчика' disabled={isLoading} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='object_name' label='Наименование объекта, адрес' rules={[{ required: true, message: 'Обязательное поле' }]}>
              <Input.TextArea placeholder='Введите наименование объекта и адрес' disabled={isLoading} rows={2} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='load_vik'
              label='Нагрузки ВиК, м³/сут'
              rules={[
                { required: true, message: 'Обязательное поле' },
                { type: 'number', min: 0, message: 'Значение должно быть больше 0' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder='0.000' step={0.001} min={0} disabled={isLoading} precision={3} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='coefficient'
              label='Прим. коэфф.'
              rules={[
                { required: true, message: 'Обязательное поле' },
                { type: 'number', min: 0, message: 'Значение должно быть больше 0' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder='0.0' step={0.1} min={0} disabled={isLoading} precision={1} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Финансовые данные
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='connection_cost_vik'
              label='Ст-ть подключ. ВиК сом (без НДС)'
              rules={[
                { required: true, message: 'Обязательное поле' },
                { type: 'number', min: 0, message: 'Значение должно быть больше 0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder='0'
                step={100}
                min={0}
                disabled={isLoading}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='total_cost'
              label='Всего (ст-ть подкл + ст-ть ТУ), сом (без НДС)'
              rules={[
                { required: true, message: 'Обязательное поле' },
                { type: 'number', min: 0, message: 'Значение должно быть больше 0' }
              ]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder='0'
                step={100}
                min={0}
                disabled={isLoading}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              />
            </Form.Item>
          </Col>
        </Row>

        {/* НОВЫЕ ПОЛЯ */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='paid_earlier'
              label='Погашено раньше, сом'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder='0'
                step={100}
                min={0}
                disabled={isLoading}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='payment_balance'
              label='Остаток по оплате, сом'
              rules={[{ type: 'number', min: 0, message: 'Значение не может быть отрицательным' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                placeholder='0'
                step={100}
                min={0}
                disabled={isLoading}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
              />
            </Form.Item>
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
