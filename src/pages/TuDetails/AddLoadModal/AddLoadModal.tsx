import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Col, Form, Input, InputNumber, message, Modal, Row, Space, Upload, UploadFile } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { InboxOutlined } from '@ant-design/icons';
import { IAddLoadParams } from 'types/requests';

import { useAddLoadMutation } from 'api/Ty.api';
import { t } from 'i18next';

const { Dragger } = Upload;

interface IProps {
  visible: boolean;
  onClose: () => void;
  tyId: string;
}

interface IFormValues {
  water_required: number;
  pressure_required: number;
  sewage_amount: number;
  comment?: string;
}

export const AddLoadModal: FC<IProps> = ({ visible, onClose, tyId }) => {
  const [form] = Form.useForm<IFormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [addLoad, { isLoading }] = useAddLoadMutation();
  const navigate = useNavigate();

  useEffect(() => {
    if (visible) {
      form.resetFields();
      setFileList([]);
    }
  }, [visible, form]);

  const beforeUpload = (file: File) => {
    // Allow common docs, images, pdfs
    const isAllowed =
      file.type.startsWith('image/') ||
      file.type === 'application/pdf' ||
      file.type.includes('officedocument') ||
      file.type.includes('msword') ||
      file.type.includes('excel') ||
      file.type.includes('spreadsheet');
    if (!isAllowed) {
      message.error(t('paymentsModal.messages.fileTypeError') || 'Неверный тип файла');
      return Upload.LIST_IGNORE;
    }
    const isLt20M = file.size / 1024 / 1024 < 20;
    if (!isLt20M) {
      message.error(t('paymentsModal.messages.fileSizeError') || 'Размер файла должен быть меньше 20 МБ');
      return Upload.LIST_IGNORE;
    }
    return false; // prevent auto-upload
  };

  const handleFileChange = (info: UploadChangeParam<UploadFile>) => {
    // Keep up to 10 files
    setFileList(info.fileList.slice(-10));
  };

  const handleCancel = () => {
    form.resetFields();
    setFileList([]);
    onClose();
  };

  const handleSubmit = async (values: IFormValues) => {
    try {
      const files: File[] = fileList.map((f) => f.originFileObj).filter(Boolean) as File[];

      const payload: IAddLoadParams = {
        ty_id: tyId,
        water_required: String(values.water_required),
        pressure_required: String(values.pressure_required),
        sewage_amount: String(values.sewage_amount),
        comment: values.comment?.trim() || undefined,
        files: files.length ? files : undefined
      };

      await addLoad(payload).unwrap();
      message.success(t('historyOfLoads.messages.addSuccess') || 'Нагрузка добавлена');
      navigate(`/dashboard/technical-conditions/history-of-loads/${tyId}`);
      handleCancel();
    } catch (e) {
      console.error(e);
      message.error(t('historyOfLoads.messages.addError') || 'Не удалось добавить нагрузку');
    }
  };

  return (
    <Modal title={t('historyOfLoads.addLoad') || 'Добавить нагрузку'} open={visible} onCancel={handleCancel} width={640} footer={null}>
      <Form form={form} layout='vertical' onFinish={handleSubmit} style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name='water_required'
              label={t('tuDetails.titles.waterRequired') || 'Потребность в воде'}
              rules={[{ required: true, message: t('common.required') || 'Обязательное поле' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                size='large'
                placeholder='0'
                min={0}
                step={0.01}
                addonAfter={t('tuDetails.units.m3PerDay') || 'м³/сут'}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              name='pressure_required'
              label={t('tuDetails.titles.pressureRequired') || 'Требуемое давление'}
              rules={[{ required: true, message: t('common.required') || 'Обязательное поле' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                size='large'
                placeholder='0'
                min={0}
                step={0.01}
                addonAfter={t('tuDetails.units.mWaterCol') || 'м вод. ст.'}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name='sewage_amount'
              label={t('tuDetails.titles.sewageAmount') || 'Объем сточных вод'}
              rules={[{ required: true, message: t('common.required') || 'Обязательное поле' }]}
            >
              <InputNumber
                style={{ width: '100%' }}
                size='large'
                placeholder='0'
                min={0}
                step={0.01}
                addonAfter={t('tuDetails.units.m3PerDay') || 'м³/сут'}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name='comment' label={t('common.comment') || 'Комментарий'}>
              <Input.TextArea rows={1} placeholder={t('common.optionalComment') || 'Комментарий (опционально)'} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label={t('common.upload') || 'Файлы (опционально)'}>
          <Dragger
            multiple
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleFileChange}
            accept='image/*,.pdf,.doc,.docx,.xls,.xlsx'
            style={{ background: '#fafafa' }}
          >
            <p className='ant-upload-drag-icon'>
              <InboxOutlined />
            </p>
            <p className='ant-upload-text'>{t('applicationsCreate.uploadModal.dropHint') || 'Перетащите файлы или нажмите для выбора'}</p>
            <p className='ant-upload-hint'>{t('common.supportedFormatsHint') || 'Поддерживаются изображения, PDF, DOC/DOCX, XLS/XLSX'}</p>
          </Dragger>
        </Form.Item>

        <Form.Item style={{ marginTop: 8 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>{t('paymentsModal.buttons.cancel') || 'Отмена'}</Button>
            <Button type='primary' htmlType='submit' loading={isLoading}>
              {t('common.save') || 'Сохранить'}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};
