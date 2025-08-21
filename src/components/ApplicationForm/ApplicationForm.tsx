import { FC } from 'react';
import { Button, Col, Flex, Form, type FormInstance, Input, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

import { t } from 'i18next';

export interface ApplicationFormData {
  customer: string;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

interface ApplicationFormProps {
  initialValues?: ApplicationFormData;
  onSave: (values: ApplicationFormData) => void;
  onCancel: () => void;
  form?: FormInstance<ApplicationFormData>;
  submitText?: string;
  attachedFiles?: UploadFile[];
  setAttachedFiles?: (files: UploadFile[]) => void;
  setIsModalVisible?: (v: boolean) => void;
}

export const ApplicationForm: FC<ApplicationFormProps> = ({
  initialValues,
  onSave,
  onCancel,
  form: externalForm,
  submitText,
  attachedFiles,
  setAttachedFiles,
  setIsModalVisible
}) => {
  const [form] = Form.useForm<ApplicationFormData>();
  const usedForm = externalForm || form;

  const buttonText =
    attachedFiles && attachedFiles.length > 0
      ? t('applicationsCreate.buttons.attachedCount', { count: attachedFiles.length })
      : t('applicationsCreate.buttons.attach');

  return (
    <Form form={usedForm} layout='vertical' variant='filled' requiredMark={false} onFinish={onSave} initialValues={initialValues}>
      <Form.Item
        name='INN'
        label={t('applicationsCreate.form.labels.inn')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterInn')} />
      </Form.Item>
      <Form.Item
        name='customer'
        label={t('applicationsCreate.form.labels.customer')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.fullName')} />
      </Form.Item>
      <Form.Item
        name='object'
        label={t('applicationsCreate.form.labels.object')}
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.companyName')} />
      </Form.Item>
      <Flex gap={16}>
        <Col span={18}>
          <Form.Item
            name='address'
            label={t('applicationsCreate.form.labels.street')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.address')} />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item
            name='contact'
            label={t('applicationsCreate.form.labels.house')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.houseNumberShort')} />
          </Form.Item>
        </Col>
      </Flex>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item
            name='quantity'
            label={t('applicationsCreate.form.labels.waterAmountRequired')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} type='number' maxLength={5} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='pressure'
            label={t('applicationsCreate.form.labels.pressureRequired')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
          >
            <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} type='number' maxLength={5} />
          </Form.Item>
        </Col>
      </Flex>
      <Form.Item
        label={t('applicationsCreate.form.labels.waterPurpose')}
        name='waterRequired'
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.waterPurpose')} />
      </Form.Item>
      <Form.Item
        label={t('applicationsCreate.form.labels.firefightingExpenses')}
        name='firefightingExpenses'
        rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
      >
        <Input size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} />
      </Form.Item>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item
            name='x'
            label={t('applicationsCreate.form.labels.coordX')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
          >
            <Input variant='filled' size='large' placeholder={t('applicationsCreate.form.placeholders.xPlaceholder')} type='number' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name='y'
            label={t('applicationsCreate.form.labels.coordY')}
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
          >
            <Input variant='filled' size='large' placeholder={t('applicationsCreate.form.placeholders.yPlaceholder')} type='number' />
          </Form.Item>
        </Col>
      </Flex>
      <Flex justify='space-between' align='center'>
        {setIsModalVisible && setAttachedFiles && attachedFiles && (
          <Button onClick={() => setIsModalVisible(true)} icon={<UploadOutlined />}>
            {buttonText}
          </Button>
        )}
        <Row>
          <Button onClick={onCancel}>{t('common.back')}</Button>
          <Button type='primary' htmlType='submit' style={{ marginLeft: '8px' }}>
            {submitText || t('applicationsCreate.buttons.submit')}
          </Button>
        </Row>
      </Flex>
    </Form>
  );
};
