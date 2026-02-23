import { FC, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, Col, Form, Input, message, Row } from 'antd';
import { DashboardLayout } from 'components';

import { useCreateCustomerMutation, useLazyGetCustomerQuery } from 'api/Customer.api';
import { useCreateLandParcelMutation, useGetLandParcelByIdQuery, usePatchLandParcelMutation } from 'api/LandParcel.api';
import { handleEnterFocusNext } from 'utils/formNavigation';

const { TextArea } = Input;

interface FormValues {
  title?: string;
  address?: string;
  kadastr_number?: string;
  purpose?: string;
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

  // API hooks
  const [createLandParcel, { isLoading: isCreating }] = useCreateLandParcelMutation();
  const [patchLandParcel, { isLoading: isUpdating }] = usePatchLandParcelMutation();

  // Для работы с заказчиками
  const [triggerGetCustomers] = useLazyGetCustomerQuery();
  const [createCustomer] = useCreateCustomerMutation();

  // ✅ Загружаем данные при редактировании
  const { data: landParcelData, isLoading: isLoadingData } = useGetLandParcelByIdQuery({ id: id! }, { skip: !isEditMode });

  // ✅ Заполняем форму при редактировании
  useEffect(() => {
    if (isEditMode && landParcelData) {
      form.setFieldsValue({
        title: landParcelData.title,
        address: landParcelData.address,
        kadastr_number: landParcelData.kadastr_number,
        purpose: landParcelData.purpose,
        // ✅ ВАЖНО: показываем имя заказчика, а не ID
        customer: landParcelData.customer_name || (landParcelData.customer ? String(landParcelData.customer) : undefined)
      });
    }
  }, [isEditMode, landParcelData, form]);

  const onFinish = useCallback(
    async (values: FormValues) => {
      try {
        let customerId: number | undefined;

        // ✅ Если указан заказчик — ищем или создаём
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
              console.log('✅ Найден существующий заказчик:', customerId);
            } else {
              // Создаём нового заказчика
              const customerResponse = await createCustomer({
                full_name: values.customer,
                pasport: '',
                address: values.address || '',
                status: 'active'
              }).unwrap();
              customerId = customerResponse.id;
              console.log('✅ Создан новый заказчик:', customerId);
            }
          } catch (error) {
            console.error('Ошибка при работе с заказчиком:', error);
            message.warning('Не удалось обработать заказчика, продолжаем без него');
          }
        }

        // ✅ Формируем payload
        const payload: Record<string, unknown> = {};

        if (values.title?.trim()) payload.title = values.title;
        if (values.address?.trim()) payload.address = values.address;
        if (values.kadastr_number?.trim()) payload.kadastr_number = values.kadastr_number;
        if (values.purpose?.trim()) payload.purpose = values.purpose;
        if (customerId !== undefined) payload.customer = customerId;

        console.log('📤 Отправляем на сервер:', payload);

        if (isEditMode) {
          // ✅ Обновление существующего участка
          await patchLandParcel({
            id: id!,
            body: payload
          }).unwrap();

          message.success('Земельный участок успешно обновлён');
          navigate(`/dashboard/land-parcels/${id}`); // ✅ Возвращаемся на детальную страницу
        } else {
          // Создание нового участка
          const created = await createLandParcel(payload).unwrap();

          message.success('Земельный участок успешно создан');
          form.resetFields();
          navigate(`/dashboard/land-parcels/${created.id}`); // ✅ Переходим на детальную страницу
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
            <Form.Item name='title' label='Название участка' rules={[{ max: 255, message: 'Максимум 255 символов' }]}>
              <Input size='large' placeholder='Например: Участок 1' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='kadastr_number' label='Кадастровый номер'>
              <Input size='large' placeholder='Введите кадастровый номер' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name='address' label='Адрес'>
              <TextArea size='large' rows={2} placeholder='ул. Фрунзе' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='purpose' label='Назначение'>
              <Input size='large' placeholder='Например: Сельхоз' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='customer' label='Заказчик'>
              <Input size='large' placeholder='Введите ФИО заказчика' />
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
