import { FC, useMemo, useState } from 'react';
import { Button, Col, Flex, Form, Input, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { UploadFilesModal } from './UploadFilesModal/UploadFilesModal';

interface IProps {
  title: string;
}

interface ApplicationsFormValues {
  INN: string;
  customer: string;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  attachments: UploadFile[];
}

export const ApplicationsCreate: FC<IProps> = ({ title }) => {
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadFile[]>([]);

  const handleFinish = (values: ApplicationsFormValues) => {
    const formData = new FormData();
    for (const key in values as ApplicationsFormValues) {
      if (Object.prototype.hasOwnProperty.call(values, key)) {
        formData.append(key, values[key as keyof ApplicationsFormValues] as string);
      }
    }
    attachedFiles.forEach((file) => {
      formData.append('attachments', file.originFileObj as Blob);
    });
  };

  const buttonText = useMemo(
    () => (attachedFiles.length > 0 ? `${attachedFiles.length} файлы прикреплены` : 'Прикрепить файл'),
    [attachedFiles.length]
  );

  return (
    <DashboardLayout title={title}>
      <Form form={form} layout='vertical' variant='filled' requiredMark={false} onFinish={handleFinish}>
        <Form.Item name='INN' label='ИНН'>
          <Input size='large' placeholder='Введите ИНН' />
        </Form.Item>
        <Form.Item name='customer' label='Заказчик'>
          <Input size='large' placeholder='Имя и фамилия' />
        </Form.Item>
        <Form.Item name='object' label='Объект'>
          <Input size='large' placeholder='Название компании' />
        </Form.Item>
        <Flex gap={16}>
          <Col span={18}>
            <Form.Item name='address' label='Улица'>
              <Input size='large' placeholder='Адрес' />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name='contact' label='Дом'>
              <Input size='large' placeholder='№' />
            </Form.Item>
          </Col>
        </Flex>
        <Flex gap={16}>
          <Col span={12}>
            <Form.Item name='quantity' label='Требуемое количество воды'>
              <Input size='large' placeholder='16,93' />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='pressure' label='Требуемый напор'>
              <Input size='large' placeholder='16,93' />
            </Form.Item>
          </Col>
        </Flex>
        <Form.Item label='Вода требуется на' name='waterRequired'>
          <Input size='large' placeholder='Адрес' />
        </Form.Item>
        <Form.Item label='Расходы воды на внутр. пожаротушение' name='firefightingExpenses'>
          <Input size='large' placeholder='Адрес' />
        </Form.Item>
        <Flex justify='space-between' align='center'>
          <Button onClick={() => setIsModalVisible(true)} icon={<UploadOutlined />}>
            {buttonText}
          </Button>
          <Row>
            <Button>Назад</Button>
            <Button type='primary' htmlType='submit' style={{ marginLeft: '8px' }}>
              Отправить
            </Button>
          </Row>
        </Flex>
        <UploadFilesModal
          currentFiles={attachedFiles}
          isOpen={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onFilesSelected={setAttachedFiles}
        />
      </Form>
    </DashboardLayout>
  );
};
