import { FC, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

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

      message.success(t('accounting.messages.protocolUpdated'));
      onSuccess?.();
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
    <Modal title={t('protocolEdit.title')} open={visible} onCancel={handleCancel} width={600} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Title level={5}>{t('protocolEdit.sections.main')}</Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='load'
              label={t('protocolEdit.fields.load')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterLoad')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='coefficient'
              label={t('protocolEdit.fields.coefficient')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <InputNumber style={{ width: '100%' }} placeholder={t('protocolEdit.placeholders.enterCoeff')} step={0.01} min={0} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          {t('protocolEdit.sections.cost')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='water_price'
              label={t('protocolEdit.fields.waterPrice')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='kanal_price'
              label={t('protocolEdit.fields.kanalPrice')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          {t('protocolEdit.sections.total')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='total_water_sum'
              label={t('protocolEdit.fields.totalWater')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterTotal')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='total_kanal_sum'
              label={t('protocolEdit.fields.totalKanal')}
              rules={[{ required: true, message: t('paymentsModal.validation.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterTotal')} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>{t('common.cancel')}</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              {t('common.save')}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
