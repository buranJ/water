// src/components/EditProtocolModal/EditProtocolModal.tsx
import { FC, useEffect } from 'react';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Typography } from 'antd';
import type { IAccountingProtocol } from 'types/entities/accounting';

import { useUpdateProtocolMutation } from 'api/Accounting.api';

const { Title } = Typography;

interface IProps {
  visible: boolean;
  onClose: () => void;
  protocolData: IAccountingProtocol | null;
  onSuccess?: () => void; // Добавляем колбек для успешного сохранения
}

interface IFormValues {
  load: string;
  water_price: string;
  kanal_price: string;
  coefficient: number;
  total_water_sum: string;
  total_kanal_sum: string;
}

export const EditProtocolModal: FC<IProps> = ({ visible, onClose, protocolData, onSuccess }) => {
  const [form] = Form.useForm<IFormValues>();
  const [updateProtocol, { isLoading }] = useUpdateProtocolMutation();

  useEffect(() => {
    if (visible && protocolData) {
      form.setFieldsValue({
        load: protocolData.load,
        water_price: protocolData.water_price,
        kanal_price: protocolData.kanal_price,
        coefficient: protocolData.coefficient,
        total_water_sum: protocolData.total_water_sum,
        total_kanal_sum: protocolData.total_kanal_sum
      });
    }
  }, [visible, protocolData, form]);

  const handleSubmit = async (values: IFormValues) => {
    if (!protocolData) return;

    try {
      await updateProtocol({
        protocolId: protocolData.id.toString(),
        body: {
          ...values,
          technical_condition: protocolData.technical_condition
        }
      }).unwrap();

      message.success('Протокол успешно обновлен');
      onSuccess?.(); // Вызываем колбек для обновления данных
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal title='Редактирование протокола' open={visible} onCancel={handleCancel} width={600} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Title level={5}>Основные данные</Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='load' label='Нагрузка' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
              <Input placeholder='Введите нагрузку' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='coefficient' label='Коэффициент' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
              <InputNumber style={{ width: '100%' }} placeholder='Введите коэффициент' step={0.01} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Стоимость
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='water_price'
              label='Стоимость водопровода'
              rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}
            >
              <Input placeholder='Введите стоимость' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='kanal_price'
              label='Стоимость канализации'
              rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}
            >
              <Input placeholder='Введите стоимость' />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          Итоговая сумма
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='total_water_sum'
              label='Общая сумма водопровода'
              rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}
            >
              <Input placeholder='Введите общую сумму' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='total_kanal_sum'
              label='Общая сумма канализации'
              rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}
            >
              <Input placeholder='Введите общую сумму' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>Отмена</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Сохранить
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
