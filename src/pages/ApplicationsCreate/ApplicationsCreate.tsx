import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Col, Flex, Form, Input, message, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { ICustomer, ObjectItem } from 'types/entities';
import { UploadFilesModal } from './UploadFilesModal/UploadFilesModal';
import './styles.scss';

import { IApplication, useCreateApplicationMutation, useUploadApplicationFilesMutation } from 'api/Application.api';
import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
import { useCreateObjectMutation, useLazyGetAllObjectsQuery } from 'api/Object.api';
import { t } from 'i18next';

interface IProps {
  title: string;
}

export const ApplicationsCreate: FC<IProps> = ({ title }) => {
  const navigate = useNavigate();
  const [createApplication, { isLoading, isSuccess, isError, data }] = useCreateApplicationMutation();
  const [uploadApplicationFiles] = useUploadApplicationFilesMutation();
  const [createCustomer, { isLoading: isCreatingCustomer }] = useCreateCustomerMutation();
  const [createObject, { isLoading: isCreatingObject }] = useCreateObjectMutation();
  const [triggerGetCustomers] = useLazyGetCustomerQuery();
  const [triggerGetObjects] = useLazyGetAllObjectsQuery();
  const [form] = Form.useForm<IApplication>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<UploadFile[]>([]);

  const handleFinish = async (values: IApplication) => {
    try {
      // 1. Поиск или создание заказчика
      let customerId: number | undefined;
      const customerSearch = await triggerGetCustomers({ search: values.INN, page: 1, page_size: 10 }).unwrap();
      const foundCustomer = Array.isArray(customerSearch.results)
        ? customerSearch.results.find((c: ICustomer) => c.inn === values.INN)
        : undefined;
      if (foundCustomer) {
        customerId = foundCustomer.id;
      } else {
        const customerResponse = await createCustomer({
          inn: values.INN,
          full_name: values.customer,
          pasport: 'passport',
          address: values.address,
          contact: values.contact,
          status: 'active'
        }).unwrap();
        customerId = customerResponse.id;
      }

      // 2. Поиск или создание объекта
      let objectId: number | undefined;
      const objectSearch = await triggerGetObjects({ search: values.object, page: 1, page_size: 10 }).unwrap();
      const foundObject = objectSearch.results?.find(
        (o: ObjectItem) =>
          o.title === values.object &&
          o.address_street === values.address &&
          o.address_number === values.contact &&
          o.customer === customerId
      );
      if (foundObject) {
        objectId = foundObject.id;
      } else {
        const objectResponse = await createObject({
          title: values.object as string,
          address_street: values.address,
          address_number: values.contact,
          kadastr_number: '',
          status: 'active',
          customer: customerId
        }).unwrap();
        objectId = objectResponse.id;
      }

      // 3. Создание заявки
      if (!customerId || !objectId) {
        message.error(t('applicationsCreate.messages.customerOrObjectError'));
        return;
      }
      const application = await createApplication({
        ...values,
        INN: String(values.INN),
        object: values.object,
        customer: customerId,
        status: 'pending',
        entity: objectId
      }).unwrap();

      // 4. Загрузка файлов, если есть
      if (attachedFiles.length > 0) {
        const files = attachedFiles.reduce<File[]>((acc, f) => {
          const raw = f.originFileObj as unknown;
          if (raw instanceof File) acc.push(raw);
          return acc;
        }, []);
        if (files.length > 0) {
          await uploadApplicationFiles({ application: application.id, files });
        }
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  };

  useEffect(() => {
    if (isSuccess && data?.id) {
      form.resetFields();
      message.success(t('applicationsCreate.messages.created'));
      navigate(`/dashboard/applications/${data.id}`);
    }
    if (isError) {
      message.error(t('applicationsCreate.messages.createError'));
    }
  }, [data?.id, form, isError, isSuccess, navigate]);

  const buttonText = useMemo(
    () =>
      attachedFiles.length > 0
        ? t('applicationsCreate.buttons.attachedCount', { count: attachedFiles.length })
        : t('applicationsCreate.buttons.attach'),
    [attachedFiles.length]
  );

  return (
    <DashboardLayout title={title}>
      <div className='applications-create'>
        <Form form={form} layout='vertical' variant='filled' requiredMark={false} onFinish={handleFinish}>
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
                <Input size='large' placeholder='16,93' type='number' maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='pressure'
                label={t('applicationsCreate.form.labels.pressureRequired')}
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
              >
                <Input size='large' placeholder='16,93' type='number' maxLength={5} />
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
            <Button onClick={() => setIsModalVisible(true)} icon={<UploadOutlined />}>
              {buttonText}
            </Button>
            <Row>
              <Button>{t('common.back')}</Button>
              <Button
                loading={isLoading || isCreatingCustomer || isCreatingObject}
                type='primary'
                htmlType='submit'
                style={{ marginLeft: '8px' }}
              >
                {t('applicationsCreate.buttons.submit')}
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
