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
  // Основные суммы
  water_sum: string;
  kanal_sum: string;
  total_water_sum: string;
  total_kanal_sum: string;
  // Бумажные работы
  paper_water_sum: string;
  paper_kanal_sum: string;
  // НСП для бумажных работ
  nsp_water_paper: string;
  nsp_kanal_paper: string;
  nsp_paper: string;
  // НДС для бумажных работ
  nds_kanal_paper: string;
  nds_water_paper: string;
  nds_paper: string;
  // Итоговые суммы
  total_sum_main: string;
  total_sum_paper: string;
  // Основные налоги
  nds: string;
  nsp: string;
  nsp_water: string;
  nsp_kanal: string;
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
        // Основные суммы
        water_sum: protocolData.water_sum,
        kanal_sum: protocolData.kanal_sum,
        total_water_sum: protocolData.total_water_sum,
        total_kanal_sum: protocolData.total_kanal_sum,
        // Бумажные работы
        paper_water_sum: protocolData.paper_water_sum,
        paper_kanal_sum: protocolData.paper_kanal_sum,
        // НСП для бумажных работ
        nsp_water_paper: protocolData.nsp_water_paper,
        nsp_kanal_paper: protocolData.nsp_kanal_paper,
        nsp_paper: protocolData.nsp_paper,
        // НДС для бумажных работ
        nds_kanal_paper: protocolData.nds_kanal_paper,
        nds_water_paper: protocolData.nds_water_paper,
        nds_paper: protocolData.nds_paper,
        // Итоговые суммы
        total_sum_main: protocolData.total_sum_main,
        total_sum_paper: protocolData.total_sum_paper,
        // Основные налоги
        nds: protocolData.nds,
        nsp: protocolData.nsp,
        nsp_water: protocolData.nsp_water,
        nsp_kanal: protocolData.nsp_kanal
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
      message.error('Ошибка при обновлении протокола');
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
            <Form.Item name='load' label={t('protocolEdit.fields.load')} rules={[{ required: true, message: t('common.required') }]}>
              <Input placeholder={t('protocolEdit.placeholders.enterLoad')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='coefficient'
              label={t('protocolEdit.fields.coefficient')}
              rules={[{ required: true, message: t('common.required') }]}
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
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='kanal_price'
              label={t('protocolEdit.fields.kanalPrice')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>
        </Row>

        <Title level={5} style={{ marginTop: 16 }}>
          {t('protocolEdit.sections.taxes')}
        </Title>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='nds' label={t('protocolEdit.fields.ndsMain')} rules={[{ required: true, message: t('common.required') }]}>
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='nds_paper'
              label={t('protocolEdit.fields.ndsPaper')}
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='nsp' label={t('protocolEdit.fields.nspMain')} rules={[{ required: true, message: t('common.required') }]}>
              <Input placeholder={t('protocolEdit.placeholders.enterCost')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='nsp_paper'
              label={t('protocolEdit.fields.nspPaper')}
              rules={[{ required: true, message: t('common.required') }]}
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
              rules={[{ required: true, message: t('common.required') }]}
            >
              <Input placeholder={t('protocolEdit.placeholders.enterTotal')} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='total_kanal_sum'
              label={t('protocolEdit.fields.totalKanal')}
              rules={[{ required: true, message: t('common.required') }]}
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
