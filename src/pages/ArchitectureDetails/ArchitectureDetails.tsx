import React, { FC, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Col, Dropdown, Input, List, Menu, Modal, Row, Space, Table, Tooltip, Typography, Upload } from 'antd';
import { UploadChangeParam, UploadFile, UploadProps } from 'antd/es/upload/interface';
import {
  CloseCircleTwoTone,
  CloudDownloadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

const { Dragger } = Upload;
const { Text } = Typography;

interface IProps {
  title: string;
}

interface DocumentRecord {
  key: string;
  fileName: string;
  tuNumber: string;
  docNumber: string;
  date: string;
}

const initialDocs: DocumentRecord[] = [
  { key: '1', fileName: 'PDF_file.pdf', tuNumber: 'ТУ 44‑957', docNumber: 'Документ 1', date: '10‑04‑2025' },
  { key: '2', fileName: 'PDF_file.pdf', tuNumber: 'ТУ 44‑957', docNumber: 'Документ 1', date: '10‑04‑2025' },
  { key: '3', fileName: 'PDF_file.pdf', tuNumber: 'ТУ 44‑957', docNumber: 'Документ 1', date: '10‑04‑2025' }
];

export const ArchitectureDetails: FC<IProps> = ({ title }) => {
  const params = useParams();
  const [searchText, setSearchText] = useState('');
  const [documentData, setDocumentData] = useState<DocumentRecord[]>(initialDocs);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [docToDelete, setDocToDelete] = useState<DocumentRecord | null>(null);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filesList, setFilesList] = useState<UploadFile[]>([]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (sortKey: string) => {
    console.log('Сортировка:', sortKey);
  };

  const sortMenu = (
    <Menu
      items={[
        { label: 'По алфавиту', key: 'alphabet' },
        { label: 'По дате', key: 'date' }
      ]}
      onClick={({ key }) => handleSortChange(key)}
    />
  );

  const handleDeleteFile = (record: DocumentRecord) => {
    setDocToDelete(record);
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (docToDelete) {
      setDocumentData((prev) => prev.filter((doc) => doc.key !== docToDelete.key));
    }
    setIsDeleteModalVisible(false);
    setDocToDelete(null);
  };

  const cancelDelete = () => {
    setIsDeleteModalVisible(false);
    setDocToDelete(null);
  };

  const showAddModal = () => {
    setIsAddModalVisible(true);
  };

  const handleCancelAdd = () => {
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleAddConfirm = () => {
    console.log('Добавить файлы:', filesList);
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleUploadChange: UploadProps['onChange'] = (info: UploadChangeParam<UploadFile>) => {
    setFilesList(info.fileList);
  };

  const removeFile = (uid: string) => {
    setFilesList((prev) => prev.filter((f) => f.uid !== uid));
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (_: string, record: DocumentRecord) => (
        <Space align='start'>
          <FileTextOutlined style={{ fontSize: 16 }} />
          <div>
            <div>{record.fileName}</div>
            <Text type='secondary'>
              {record.tuNumber} → {record.docNumber}
            </Text>
          </div>
        </Space>
      )
    },
    { title: 'Дата загрузки', dataIndex: 'date', key: 'date' },
    {
      title: 'Действия',
      key: 'actions',
      render: (_: string, record: DocumentRecord) => (
        <Space>
          <Tooltip title='Удалить'>
            <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteFile(record)} />
          </Tooltip>
          <Tooltip title='Скачать'>
            <Button icon={<CloudDownloadOutlined />} onClick={() => console.log('Скачать', record.key)} />
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <DashboardLayout title={`${title} ${params.id}`}>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input
              placeholder='Найти'
              prefix={<SearchOutlined />}
              style={{ width: 240 }}
              value={searchText}
              onChange={handleSearchChange}
            />
            <Dropdown overlay={sortMenu} trigger={['click']}>
              <Button>
                По алфавиту <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button type='primary' icon={<PlusOutlined />} onClick={showAddModal}>
              Добавить
            </Button>
            <Button icon={<DownloadOutlined />} onClick={() => console.log('Скачать PDF')}>
              PDF
            </Button>
          </Space>
        </Col>
      </Row>

      <Table style={{ marginTop: 16 }} columns={columns} dataSource={documentData} pagination={false} />

      <Modal title='Удаление' visible={isDeleteModalVisible} onCancel={cancelDelete} footer={null}>
        <p>Вы действительно хотите удалить документ?</p>
        <Row justify='end' gutter={8}>
          <Col>
            <Button onClick={cancelDelete}>Отменить</Button>
          </Col>
          <Col>
            <Button danger type='primary' onClick={confirmDelete}>
              Удалить
            </Button>
          </Col>
        </Row>
      </Modal>

      <Modal title='Загрузка документа' visible={isAddModalVisible} onCancel={handleCancelAdd} footer={null}>
        {filesList.length === 0 ? (
          <>
            <Dragger
              multiple
              fileList={filesList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              showUploadList={false}
              style={{ marginBottom: 16 }}
            >
              <p className='ant-upload-drag-icon'>
                <InboxOutlined style={{ fontSize: 40, color: '#999' }} />
              </p>
              <p>Перетащите файлы сюда для загрузки</p>
              <Button icon={<CloudDownloadOutlined />}>Загрузить файл</Button>
            </Dragger>
            <Row justify='end' gutter={8}>
              <Col>
                <Button onClick={handleCancelAdd}>Назад</Button>
              </Col>
              <Col>
                <Button type='primary' disabled>
                  Загрузить
                </Button>
              </Col>
            </Row>
          </>
        ) : (
          <>
            <Text style={{ display: 'block', marginBottom: 8 }}>
              {filesList.length} файл{filesList.length > 1 ? 'а' : ''}
            </Text>
            <List
              bordered
              dataSource={filesList}
              renderItem={(file) => (
                <List.Item
                  key={file.uid}
                  actions={[
                    <CloseCircleTwoTone twoToneColor='#E63A3A' style={{ cursor: 'pointer' }} onClick={() => removeFile(file.uid)} />
                  ]}
                >
                  <Space size='small'>
                    <FileTextOutlined style={{ fontSize: 24, color: '#999' }} />
                    <div>
                      <div>{file.name}</div>
                      <Text type='secondary' style={{ fontSize: 12 }}>
                        {file.size
                          ? file.size < 1024
                            ? `${file.size} байт`
                            : file.size < 1024 * 1024
                              ? `${(file.size / 1024).toFixed(1)} KB`
                              : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                          : ''}
                      </Text>
                    </div>
                  </Space>
                </List.Item>
              )}
              style={{ marginBottom: 16 }}
            />
            <Upload multiple fileList={[]} showUploadList={false} beforeUpload={() => false} onChange={handleUploadChange}>
              <Button icon={<CloudDownloadOutlined />}>Загрузить ещё</Button>
            </Upload>
            <Row justify='end' gutter={8} style={{ marginTop: 16 }}>
              <Col>
                <Button onClick={handleCancelAdd}>Назад</Button>
              </Col>
              <Col>
                <Button type='primary' onClick={handleAddConfirm}>
                  Добавить
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </DashboardLayout>
  );
};
