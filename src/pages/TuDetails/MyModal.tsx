import { FC, useState } from 'react';
import { Button, Form, Input, List, Modal, Space, Upload, UploadFile, UploadProps } from 'antd';
import type { UploadChangeParam } from 'antd/es/upload';
import { CloseCircleTwoTone, FileOutlined, UploadOutlined } from '@ant-design/icons';

interface MyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const MyModal: FC<MyModalProps> = ({ visible, onClose }) => {
  const [form] = Form.useForm();
  const [uploadFileList, setUploadFileList] = useState<UploadFile<File>[]>([]);

  const handleUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile<File>>) => {
    setUploadFileList(info.fileList);
  };

  const handleRemoveFile = (file: UploadFile<File>) => {
    setUploadFileList((prev) => prev.filter((f) => f.uid !== file.uid));
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    console.log('Причина отказа:', values.reason);
    console.log('Комментарий:', values.comment);
    console.log(
      'Загруженные файлы:',
      uploadFileList.map((f) => f.name)
    );
    onClose();
    form.resetFields();
    setUploadFileList([]);
  };

  const handleCancel = () => {
    onClose();
    form.resetFields();
    setUploadFileList([]);
  };

  return (
    <Modal open={visible} title='Отказ ТУ' onCancel={handleCancel} footer={null}>
      <Form form={form} layout='vertical'>
        <Form.Item name='reason' label='Причина' initialValue='Отсутствие необходимых документов'>
          <Input />
        </Form.Item>

        <Form.Item name='comment' label='Комментарий'>
          <Input.TextArea rows={4} placeholder='Напишите подробнее причину...' />
        </Form.Item>

        <Upload multiple showUploadList={false} fileList={uploadFileList} beforeUpload={() => false} onChange={handleUploadChange}>
          <Button icon={<UploadOutlined />} style={{ marginBottom: 16 }}>
            Загрузить файл
          </Button>
        </Upload>

        {uploadFileList.length > 0 && (
          <List
            bordered
            dataSource={uploadFileList}
            renderItem={(file) => (
              <List.Item
                key={file.uid}
                actions={[
                  <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ cursor: 'pointer' }} onClick={() => handleRemoveFile(file)} />
                ]}
              >
                <Space>
                  <FileOutlined style={{ color: '#327BE8' }} />
                  <div>{file.name}</div>
                </Space>
              </List.Item>
            )}
            style={{ marginBottom: 16 }}
          />
        )}

        <div style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={handleCancel}>
            Назад
          </Button>
          <Button type='primary' danger onClick={handleSubmit}>
            Отказать
          </Button>
        </div>
      </Form>
    </Modal>
  );
};
