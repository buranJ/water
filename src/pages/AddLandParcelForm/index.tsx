import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import type { UploadFile } from 'antd';
import { Button, Col, DatePicker, Form, Input, message, Row, Select, Upload } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components';

import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
import { useCreateLandParcelMutation, useGetLandParcelByIdQuery, usePatchLandParcelMutation } from 'api/LandParcel.api';
import { handleEnterFocusNext } from 'utils/formNavigation';

const { TextArea } = Input;

const LAND_PARCEL_STATUS_OPTIONS = [
  { value: 'Согласовано', label: 'Согласовано' },
  { value: 'Не согласовано', label: 'Не согласовано' },
  { value: 'Согласованно под гарантийное письмо', label: 'Согласованно под гарантийное письмо' }
];

interface FormValues {
  address?: string;
  purpose?: string;
  area?: string;
  status?: string;
  council_date?: string;
  request_number?: string;
  tech_council_date?: string;
  outgoing_number?: string;
  outgoing_date?: string;
  file?: UploadFile[];
  comment?: string;
  customer?: string;
}

interface AddLandParcelFormProps {
  title?: string;
}

const AddLandParcelForm: FC<AddLandParcelFormProps> = ({ title }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);

  const [form] = Form.useForm<FormValues>();

  const [createLandParcel, { isLoading: isCreating }] = useCreateLandParcelMutation();
  const [patchLandParcel, { isLoading: isUpdating }] = usePatchLandParcelMutation();

  const [triggerGetCustomers] = useLazyGetCustomerQuery();
  const [createCustomer] = useCreateCustomerMutation();

  const { data: landParcelData, isLoading: isLoadingData } = useGetLandParcelByIdQuery({ id: id! }, { skip: !isEditMode });

  // Helpers для дат
  const formatDate = useCallback((date: Dayjs | undefined) => date?.format('YYYY-MM-DD') || '', []);
  const parseDate = useCallback((dateString: string | undefined) => (dateString ? dayjs(dateString) : null), []);

  useEffect(() => {
    if (isEditMode && landParcelData) {
      form.setFieldsValue({
        address: landParcelData.address,
        purpose: landParcelData.purpose,
        area: landParcelData.area != null ? String(landParcelData.area) : undefined,
        status: landParcelData.status,
        council_date: landParcelData.council_date,
        request_number: landParcelData.request_number,
        tech_council_date: landParcelData.tech_council_date,
        outgoing_number: landParcelData.outgoing_number,
        outgoing_date: landParcelData.outgoing_date,
        comment: landParcelData.comment,
        customer: landParcelData.customer_name || (landParcelData.customer ? String(landParcelData.customer) : undefined)
      });
    }
  }, [isEditMode, landParcelData, form]);

  const onFinish = useCallback(
    async (values: FormValues) => {
      try {
        let customerId: number | undefined;

        if (values.customer && values.customer.trim()) {
          try {
            const customerSearch = await triggerGetCustomers({
              search: String(values.customer),
              page: 1,
              page_size: 10
            }).unwrap();

            const foundCustomer = Array.isArray(customerSearch.results)
              ? customerSearch.results.find((c: { full_name?: string; id?: number }) => c.full_name === String(values.customer))
              : undefined;

            if (foundCustomer?.id != null) {
              customerId = foundCustomer.id;
            } else {
              const customerResponse = await createCustomer({
                full_name: values.customer,
                pasport: '',
                address: values.address || '',
                status: 'active'
              }).unwrap();
              customerId = customerResponse.id;
            }
          } catch (error) {
            console.error('Ошибка при работе с заказчиком:', error);
            message.warning('Не удалось обработать заказчика, продолжаем без него');
          }
        }

        const payload: Record<string, unknown> = {};

        if (values.address?.trim()) payload.address = values.address;
        if (values.purpose?.trim()) payload.purpose = values.purpose;
        if (values.area?.trim()) payload.area = values.area;
        if (values.status) payload.status = values.status;
        if (values.council_date) payload.council_date = values.council_date;
        if (values.request_number?.trim()) payload.request_number = values.request_number;
        if (values.tech_council_date) payload.tech_council_date = values.tech_council_date;
        if (values.outgoing_number?.trim()) payload.outgoing_number = values.outgoing_number;
        if (values.outgoing_date) payload.outgoing_date = values.outgoing_date;
        if (values.comment?.trim()) payload.comment = values.comment;
        if (customerId !== undefined) payload.customer = customerId;

        // ✅ Обработка файла
        if (values.file && values.file.length > 0 && values.file[0].originFileObj) {
          payload.file = values.file[0].originFileObj;
        }

        console.log('📤 Отправляем на сервер:', payload);

        if (isEditMode) {
          await patchLandParcel({
            id: id!,
            body: payload
          }).unwrap();

          message.success('Земельный участок успешно обновлён');
          navigate(`/dashboard/land-parcels/${id}`);
        } else {
          const created = await createLandParcel(payload).unwrap();

          message.success('Земельный участок успешно создан');
          form.resetFields();
          navigate(`/dashboard/land-parcels/${created.id}`);
        }
      } catch (error) {
        console.error('❌ Error saving land parcel:', error);

        if (error && typeof error === 'object' && 'data' in error) {
          const errorData = (error as { data?: Record<string, unknown> }).data;
          console.error('📥 Ответ от сервера:', errorData);

          if (errorData && typeof errorData === 'object') {
            const errorMessages = Object.entries(errorData)
              .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
              .join('\n');
            message.error(`Ошибка валидации:\n${errorMessages}`);
          } else {
            message.error('Ошибка при сохранении земельного участка');
          }
        } else {
          message.error('Ошибка при сохранении земельного участка');
        }
      }
    },
    [isEditMode, id, createLandParcel, patchLandParcel, form, navigate, triggerGetCustomers, createCustomer]
  );

  return (
    <DashboardLayout title={title || (isEditMode ? 'Редактировать участок' : 'Добавить участок')}>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        onKeyDown={handleEnterFocusNext}
        requiredMark={false}
        scrollToFirstError={{ behavior: 'smooth', scrollMode: 'if-needed', block: 'center' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='council_date'
              label='Дата запроса'
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker size='large' format='DD.MM.YYYY' style={{ width: '100%' }} placeholder='Выберите дату' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='request_number' label='Номер запроса'>
              <Input size='large' placeholder='Введите номер запроса' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='tech_council_date'
              label='Дата тех совета'
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker size='large' format='DD.MM.YYYY' style={{ width: '100%' }} placeholder='Выберите дату' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='customer' label='Заказчик'>
              <Input size='large' placeholder='Введите ФИО заказчика' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='outgoing_number' label='Исходящий номер земельного участка'>
              <Input size='large' placeholder='Введите исходящий номер' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name='outgoing_date'
              label='Исходящая дата земельного участка'
              normalize={(value: Dayjs) => formatDate(value)}
              getValueProps={(value: string) => ({ value: parseDate(value) })}
            >
              <DatePicker size='large' format='DD.MM.YYYY' style={{ width: '100%' }} placeholder='Выберите дату' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={16}>
            <Form.Item name='address' label='Адрес'>
              <TextArea size='large' rows={2} placeholder='ул. Фрунзе' />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name='area' label='Площадь участка'>
              <TextArea size='large' rows={2} placeholder='Введите площадь' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='purpose' label='Наименование объекта'>
              <TextArea size='large' rows={2} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='file' label='Файл' valuePropName='fileList' getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}>
              <Upload beforeUpload={() => false} maxCount={1}>
                <Button icon={<UploadOutlined />} size='large'>
                  Загрузить файл
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='status' label='Статус'>
              <Select size='large' allowClear placeholder='Выберите статус' options={LAND_PARCEL_STATUS_OPTIONS} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='comment' label='Комментарий'>
              <TextArea size='large' rows={4} placeholder='Введите комментарий' />
            </Form.Item>
          </Col>
        </Row>

        <Row justify='end'>
          <Col>
            <Form.Item style={{ marginTop: 24 }}>
              <Button type='primary' htmlType='submit' size='large' loading={isCreating || isUpdating || isLoadingData}>
                {isEditMode ? 'Сохранить изменения' : 'Создать участок'}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </DashboardLayout>
  );
};

export default AddLandParcelForm;
