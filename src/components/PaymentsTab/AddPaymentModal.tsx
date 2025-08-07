// src/components/PaymentsTab/AddPaymentModal.tsx
import { FC, useEffect, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, InputNumber, message, Modal, Row, Select, Space, Upload, UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

import { useCreatePaymentMutation } from 'api/Accounting.api';
const { Option } = Select;

interface IProps {
  visible: boolean;
  onClose: () => void;
  invoiceId: string;
}

interface IFormValues {
  payment_number: string;
  payment_date: dayjs.Dayjs;
  amount: number;
  source: string;
  status: 'received';
}

export const AddPaymentModal: FC<IProps> = ({ visible, onClose, invoiceId }) => {
  const [form] = Form.useForm<IFormValues>();
  const [createPayment, { isLoading }] = useCreatePaymentMutation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  useEffect(() => {
    if (visible) {
      form.setFieldsValue({
        payment_date: dayjs(),
        status: 'received'
      });
      setFileList([]);
      setUploadedFile(null);
    }
  }, [visible, form]);

  const handleSubmit = async (values: IFormValues) => {
    try {
      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('payment_number', values.payment_number);
      formData.append('payment_date', values.payment_date.format('YYYY-MM-DD'));
      formData.append('amount', values.amount.toString());
      formData.append('source', values.source);
      formData.append('status', values.status);
      formData.append('invoice', invoiceId);

      if (uploadedFile) {
        formData.append('receipt_file', uploadedFile);
      }

      await createPayment(formData).unwrap();
      message.success('Платеж успешно добавлен');
      handleCancel();
    } catch (error) {
      console.error('Ошибка:', error);
      message.error('Ошибка при добавлении платежа');
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    setUploadedFile(null);
    onClose();
  };

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    setFileList(info.fileList.slice(-1)); // Оставляем только последний файл

    if (info.fileList.length > 0) {
      const file = info.fileList[0]?.originFileObj;
      if (file) {
        setUploadedFile(file);
      }
    } else {
      setUploadedFile(null);
    }
  };

  const beforeUpload = (file: File) => {
    // Проверяем тип файла
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    const isDoc = file.type.includes('document') || file.type.includes('spreadsheet');

    if (!isImage && !isPDF && !isDoc) {
      message.error('Можно загружать только изображения, PDF или документы');
      return Upload.LIST_IGNORE;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('Файл должен быть меньше 10MB');
      return Upload.LIST_IGNORE;
    }

    return false;
  };

  return (
    <Modal title='Добавить платеж' open={visible} onCancel={handleCancel} width={600} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name='payment_number' label='Номер платежа' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
              <Input placeholder='Введите номер платежа' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='payment_date' label='Дата платежа' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
              <DatePicker style={{ width: '100%' }} format='DD.MM.YYYY' placeholder='Выберите дату' />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name='amount'
              label='Сумма платежа'
              rules={[
                { required: true, message: 'Поле обязательно для заполнения' },
                { type: 'number', min: 0.01, message: 'Сумма должна быть больше 0' }
              ]}
            >
              <InputNumber style={{ width: '100%' }} placeholder='Введите сумму' step={0.01} min={0} addonAfter='KGZ' />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item name='source' label='Источник платежа' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
              <Input placeholder='Например: 1С' />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item name='status' label='Статус платежа' rules={[{ required: true, message: 'Поле обязательно для заполнения' }]}>
          <Select placeholder='Выберите статус'>
            <Option value='received'>Поступили</Option>
          </Select>
        </Form.Item>

        <Form.Item label='Файл чека (необязательно)'>
          <Upload
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            maxCount={1}
            accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
          >
            <Button icon={<UploadOutlined />}>{fileList.length > 0 ? 'Заменить файл' : 'Загрузить чек'}</Button>
          </Upload>
          {fileList.length > 0 && <div style={{ marginTop: 8, color: '#52c41a' }}>Выбран файл: {fileList[0].name}</div>}
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>Отмена</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              Добавить платеж
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
