import { FC } from 'react';
import { Button, Col, Flex, Form, Input, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

export interface ApplicationFormData {
  INN: string;
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
  [key: string]: any;
}

interface ApplicationFormProps {
  initialValues?: ApplicationFormData;
  onSave: (values: ApplicationFormData) => void;
  onCancel: () => void;
  form?: any;
  submitText?: string;
  attachedFiles?: UploadFile[];
  setAttachedFiles?: (files: UploadFile[]) => void;
  isModalVisible?: boolean;
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
  isModalVisible,
  setIsModalVisible
}) => {
  const [form] = Form.useForm<ApplicationFormData>();
  const usedForm = externalForm || form;

  const buttonText =
    attachedFiles && attachedFiles.length > 0
      ? `${attachedFiles.length} файлы прикреплены`
      : 'Прикрепить файл';

  return (
    <Form
      form={usedForm}
      layout='vertical'
      variant='filled'
      requiredMark={false}
      onFinish={onSave}
      initialValues={initialValues}
    >
      <Form.Item name='INN' label='ИНН' rules={[{ required: true, message: 'Обязательное поле' }]}>
        <Input size='large' placeholder='Введите ИНН' />
      </Form.Item>
      <Form.Item name='customer' label='Заказчик' rules={[{ required: true, message: 'Обязательное поле' }]}>
        <Input size='large' placeholder='Имя и фамилия' />
      </Form.Item>
      <Form.Item name='object' label='Объект' rules={[{ required: true, message: 'Обязательное поле' }]}>
        <Input size='large' placeholder='Название компании' />
      </Form.Item>
      <Flex gap={16}>
        <Col span={18}>
          <Form.Item name='address' label='Улица' rules={[{ required: true, message: 'Обязательное поле' }]}>
            <Input size='large' placeholder='Адрес' />
          </Form.Item>
        </Col>
        <Col span={6}>
          <Form.Item name='contact' label='Дом' rules={[{ required: true, message: 'Обязательное поле' }]}>
            <Input size='large' placeholder='№' />
          </Form.Item>
        </Col>
      </Flex>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item name='quantity' label='Требуемое количество воды' rules={[{ required: true, message: 'Обязательное поле' }, { max: 5 }]}>
            <Input size='large' placeholder='16,93' type='number' maxLength={5} />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='pressure' label='Требуемый напор' rules={[{ required: true, message: 'Обязательное поле' }, { max: 5 }]}>
            <Input size='large' placeholder='16,93' type='number' maxLength={5} />
          </Form.Item>
        </Col>
      </Flex>
      <Form.Item label='Вода требуется на' name='waterRequired' rules={[{ required: true, message: 'Обязательное поле' }]}>
        <Input size='large' placeholder='Адрес' />
      </Form.Item>
      <Form.Item label='Расходы воды на внутр. пожаротушение' name='firefightingExpenses' rules={[{ required: true, message: 'Обязательное поле' }]}>
        <Input size='large' placeholder='Адрес' />
      </Form.Item>
      <Flex gap={16}>
        <Col span={12}>
          <Form.Item name='x' label='Координата X' rules={[{ required: true, message: 'Обязательное поле' }]}>
            <Input variant='filled' size='large' placeholder='123' type='number' />
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item name='y' label='Координата Y' rules={[{ required: true, message: 'Обязательное поле' }]}>
            <Input variant='filled' size='large' placeholder='321' type='number' />
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
          <Button onClick={onCancel}>Назад</Button>
          <Button type='primary' htmlType='submit' style={{ marginLeft: '8px' }}>
            {submitText || 'Отправить'}
          </Button>
        </Row>
      </Flex>
    </Form>
  );
};
