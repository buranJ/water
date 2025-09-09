import { FC, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Col, Flex, Form, Input, message, Row, UploadFile } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { MapPointSelector } from 'components/MapPointSelector';
import { ICustomer, ObjectItem } from 'types/entities';
import { IApplication } from 'types/requests';
import { UploadFilesModal } from './UploadFilesModal/UploadFilesModal';
import './styles.scss';

import { useCreateApplicationMutation, useUploadApplicationFilesMutation } from 'api/Application.api';
import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
import { useCreateObjectMutation, useLazyGetAllObjectsQuery } from 'api/Object.api';
import { t } from 'i18next';
import { handleEnterFocusNext } from 'utils/formNavigation';

interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  timestamp?: string;
}

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
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const handleCoordinatesSelect = (coordinates: Coordinates) => {
    console.log('Координаты выбраны:', coordinates);
    setSelectedCoordinates(coordinates);
    // Обновляем значения в форме
    form.setFieldsValue({
      latitude: coordinates.latitude,
      longitude: coordinates.longitude
    });
    message.success(`Координаты выбраны: ${coordinates.latitude.toFixed(6)}, ${coordinates.longitude.toFixed(6)}`);
  };

  const handleFinish = async (values: IApplication) => {
    try {
      const coordLatitude = selectedCoordinates?.latitude || values.latitude;
      const coordLongitude = selectedCoordinates?.longitude || values.longitude;

      if (!coordLatitude || !coordLongitude) {
        message.warning('Пожалуйста, выберите координаты на карте');
        return;
      }

      if (isNaN(Number(coordLatitude)) || isNaN(Number(coordLongitude))) {
        message.error('Некорректные координаты');
        return;
      }
      let customerId: number | undefined;
      const customerSearch = await triggerGetCustomers({ search: String(values.customer), page: 1, page_size: 10 }).unwrap();
      const foundCustomer = Array.isArray(customerSearch.results)
        ? customerSearch.results.find((c: ICustomer) => c.full_name === String(values.customer))
        : undefined;
      if (foundCustomer) {
        customerId = foundCustomer.id;
      } else {
        const customerResponse = await createCustomer({
          full_name: values.customer,
          pasport: '',
          address: values.address,
          status: 'active'
        }).unwrap();
        customerId = customerResponse.id;
      }
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
          latitude: parseFloat(String(coordLatitude)),
          longitude: parseFloat(String(coordLongitude)),
          customer: customerId
        }).unwrap();
        objectId = objectResponse.id;
      }
      if (!customerId || !objectId) {
        message.error(t('applicationsCreate.messages.customerOrObjectError'));
        return;
      }

      const requestPayload = {
        customer: customerId,
        object: values.object,
        address: values.address,
        contact: values.contact,
        quantity: values.quantity,
        pressure: values.pressure,
        waterRequired: values.waterRequired,
        firefightingExpensesInner: values.firefightingExpensesInner,
        firefightingExpensesOuter: values.firefightingExpensesOuter,
        status: 'pending' as const,
        entity: objectId,
        latitude: parseFloat(String(coordLatitude)),
        longitude: parseFloat(String(coordLongitude))
      };
      if (
        !requestPayload.latitude ||
        !requestPayload.longitude ||
        isNaN(requestPayload.latitude) ||
        isNaN(requestPayload.longitude) ||
        requestPayload.latitude === 0 ||
        requestPayload.longitude === 0
      ) {
        message.error('Ошибка: невалидные координаты для отправки');
        return;
      }

      const application = await createApplication(requestPayload).unwrap();

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
      setSelectedCoordinates(null);
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
        <Form form={form} layout='vertical' variant='filled' requiredMark={false} onFinish={handleFinish} onKeyDown={handleEnterFocusNext}>
          {/* Клиент и объект */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='customer'
                label={t('applicationsCreate.form.labels.customer')}
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
              >
                <Input size='large' placeholder={t('applicationsCreate.form.placeholders.fullName')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='object'
                label={t('applicationsCreate.form.labels.object')}
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
              >
                <Input size='large' placeholder={t('applicationsCreate.form.placeholders.companyName')} />
              </Form.Item>
            </Col>
          </Row>

          {/* Адрес и дом */}
          <Row gutter={16}>
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
          </Row>

          {/* Количество воды и давление */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='quantity'
                label={t('applicationsCreate.form.labels.waterAmountRequired')}
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
              >
                <Input size='large' placeholder='16,93' type='number' min={0} maxLength={5} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='pressure'
                label={t('applicationsCreate.form.labels.pressureRequired')}
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }, { max: 5 }]}
              >
                <Input size='large' placeholder='16,93' type='number' min={0} maxLength={5} />
              </Form.Item>
            </Col>
          </Row>

          {/* Назначение воды и расходы на внутреннее пожаротушение */}
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label={t('applicationsCreate.form.labels.waterPurpose')}
                name='waterRequired'
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
              >
                <Input size='large' placeholder={t('applicationsCreate.form.placeholders.waterPurpose')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label={t('applicationsCreate.form.labels.firefightingExpenses')}
                name='firefightingExpensesInner'
                rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
              >
                <Input type='number' min={0} size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} />
              </Form.Item>
            </Col>
          </Row>

          {/* Расходы на наружное пожаротушение */}
          <Form.Item
            label='Расходы воды на наруж. пожаротушение'
            name='firefightingExpensesOuter'
            rules={[{ required: true, message: t('applicationsCreate.form.validation.required') }]}
          >
            <Input type='number' min={0} size='large' placeholder={t('applicationsCreate.form.placeholders.enterValue')} />
          </Form.Item>

          {/* Координаты */}
          <Form.Item
            label={t('applicationsCreate.form.labels.coordinates', 'Координаты объекта')}
            required
            style={{ marginBottom: '24px' }}
          >
            <MapPointSelector title='Выберите координаты объекта на карте' onCoordinatesSelect={handleCoordinatesSelect} />
          </Form.Item>
          <Form.Item name='latitude' hidden>
            <Input />
          </Form.Item>
          <Form.Item name='longitude' hidden>
            <Input />
          </Form.Item>

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
