import React, { useState } from 'react';
import { Button, Input, Modal, Select, Space, Typography, Upload } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { CloseOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text } = Typography;

interface RejectApplicationModalProps {
  open: boolean;
  onCancel: () => void;
  onReject: (data: RejectFormData) => void;
}

export interface RejectFormData {
  reason: string;
  comment: string;
  attachments?: File[];
}

const rejectReasons = [
  { value: 'architecture', label: 'Отказ от архитектуры' },
  { value: 'documents', label: 'Неполный пакет документов' },
  { value: 'technical', label: 'Технические нарушения' },
  { value: 'sanitary', label: 'Нарушение санитарных норм' },
  { value: 'other', label: 'Другое' }
];

export const RejectApplicationModal: React.FC<RejectApplicationModalProps> = ({ open, onCancel, onReject }) => {
  const [reason, setReason] = useState<string>('');
  const [comment, setComment] = useState<string>('');
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = () => {
    if (!reason.trim()) return;

    const adaptedFiles = fileList.map((f) => f.originFileObj).filter(Boolean) as File[];

    onReject({
      reason,
      comment,
      attachments: adaptedFiles
    });

    // Сброс формы
    setReason('');
    setComment('');
    setFileList([]);
  };

  const handleCancel = () => {
    setReason('');
    setComment('');
    setFileList([]);
    onCancel();
  };

  const handleFileUpload = (info: { fileList: UploadFile[] }) => {
    setFileList(info.fileList);
  };

  const handleFileRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
  };

  const formatFileSize = (size: number) => {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  };

  const renderFileItem = (file: UploadFile) => (
    <div
      key={file.uid}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 0',
        borderBottom: '1px solid #f0f0f0'
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          backgroundColor: '#ff4d4f',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: 4
        }}
      >
        PDF
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', color: '#000' }}>{file.name}</div>
        <div style={{ fontSize: '12px', color: '#999' }}>{file.size ? formatFileSize(file.size) : ''}</div>
      </div>
      <Button
        type='text'
        icon={<CloseOutlined />}
        size='small'
        onClick={() => handleFileRemove(file)}
        style={{
          color: '#999',
          minWidth: 'auto',
          padding: 4
        }}
      />
    </div>
  );

  const uploadProps = {
    beforeUpload: () => false,
    onChange: handleFileUpload,
    multiple: true,
    showUploadList: false,
    accept: '.pdf,.doc,.docx'
  };

  return (
    <Modal
      title='Отклонение заявки'
      open={open}
      onCancel={handleCancel}
      width={600}
      footer={
        <Space>
          <Button size='large' onClick={handleCancel}>
            Назад
          </Button>
          <Button size='large' type='primary' danger onClick={handleSubmit} disabled={!reason.trim()}>
            Отказать
          </Button>
        </Space>
      }
      destroyOnHidden
    >
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Причина
          </Text>
          <Select
            size='large'
            placeholder='Отказ от архитектуры'
            style={{ width: '100%' }}
            value={reason}
            onChange={setReason}
            options={rejectReasons}
          />
        </div>

        <div>
          <Text strong style={{ marginBottom: 8, display: 'block' }}>
            Комментарий
          </Text>
          <TextArea
            placeholder='Напишите подробнее причину...'
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ resize: 'none' }}
          />
        </div>

        <div>
          <Upload {...uploadProps} fileList={fileList}>
            <Button
              size='large'
              icon={<UploadOutlined />}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              Загрузить письмо
            </Button>
          </Upload>

          <div style={{ marginTop: 12 }}>{fileList.map((file) => renderFileItem(file))}</div>
        </div>
      </Space>
    </Modal>
  );
};
