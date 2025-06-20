import { FC, useMemo, useState } from 'react';
import { Button, Col, Flex, Form, Input, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { UploadFilesModal } from './UploadFilesModal/UploadFilesModal';
import './styles.scss';

import { IApplication, useCreateApplicationMutation } from 'api/Application.api';
import { useCreateCustomerMutation } from 'api/Customer.api';
import { useCreateObjectMutation } from 'api/Object.api';

interface IProps {
  title: string;
}

export const ApplicationsCreate: FC<IProps> = ({ title }) => {
  const [createApplication] = useCreateApplicationMutation();
  const [createCustomer] = useCreateCustomerMutation();
  const [createObject] = useCreateObjectMutation();
  const [form] = Form.useForm<IApplication>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadFile[]>([]);

  const handleFinish = async (values: IApplication) => {
    try {
      const customerResponse = await createCustomer({
        inn: values.INN,
        full_name: values.customer,
        passport: 'passport',
        address: values.address,
        contact: values.contact,
        status: 'active'
      }).unwrap();
      const customerId = customerResponse.id;

      const objectResponse = await createObject({
        title: values.object as string,
        address_street: values.address,
        address_number: values.contact,
        kadastr_number: '',
        status: 'active',
        customer: customerId
      }).unwrap();
      const objectId = objectResponse.id;

      createCustomer({
        inn: values.INN,
        full_name: values.customer,
        passport: 'passport',
        address: values.address,
        contact: values.contact,
        status: 'active'
      });
      await createApplication({
        ...values,
        object: objectId,
        customer: customerId,
        status: 'pending',
        entity: 1
      }).unwrap();
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  const buttonText = useMemo(
    () => (attachedFiles.length > 0 ? `${attachedFiles.length} файлы прикреплены` : 'Прикрепить файл'),
    [attachedFiles.length]
  );

  return (
    <DashboardLayout title={title}>
      <div className='applications-create'>
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
              <Form.Item name='quantity' label='Требуемое количество воды' rules={[{ max: 5 }]}>
                <Input size='large' placeholder='16,93' type='number' maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='pressure' label='Требуемый напор' rules={[{ max: 5 }]}>
                <Input size='large' placeholder='16,93' type='number' maxLength={5} />
              </Form.Item>
            </Col>
          </Flex>
          <Form.Item label='Вода требуется на' name='waterRequired'>
            <Input size='large' placeholder='Адрес' />
          </Form.Item>
          <Form.Item label='Расходы воды на внутр. пожаротушение' name='firefightingExpenses'>
            <Input size='large' placeholder='Адрес' />
          </Form.Item>
          <Flex gap={16}>
            <Col span={12}>
              <Form.Item name='x' label='Координата X'>
                <Input variant='filled' size='large' placeholder='123' type='number' />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name='y' label='Координата Y'>
                <Input variant='filled' size='large' placeholder='321' type='number' />
              </Form.Item>
            </Col>
          </Flex>
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
      </div>
    </DashboardLayout>
  );
};
