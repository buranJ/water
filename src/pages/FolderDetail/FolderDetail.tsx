import React, { FC, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import { Button, Col, Dropdown, Input, List, message, Row, Space, Tabs, Typography, Upload, UploadFile, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/es/upload';
import Dragger from 'antd/es/upload/Dragger';
import {
  CloseCircleTwoTone,
  CloudDownloadOutlined,
  DownloadOutlined,
  DownOutlined,
  FileTextOutlined,
  InboxOutlined,
  PlusOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { Modal, Table } from 'common/ui';
import { DashboardLayout } from 'components/DashboardLayout';
import { IFileItem } from 'types/entities';
import { getColumns } from './FolderDetail.helpers';

import { useGetFilefolderFilesQuery, useUploadFileMutation } from 'api/FileFolder.api';

interface IProps {
  title: string;
}

const { TabPane } = Tabs;
const { Text } = Typography;

export const FolderDetail: FC<IProps> = ({ title }) => {
  const { folderId, tyId } = useParams<{ folderId: string; tyId: string }>();
  const filesQuery = useGetFilefolderFilesQuery({ folder_id: folderId || '', ty_id: tyId || '' });
  const [uploadFiles, { isSuccess, isLoading, isError }] = useUploadFileMutation();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('1');
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [filesList, setFilesList] = useState<UploadFile[]>([]);

  const sortMenu = {
    items: [
      { key: 'alphabet', label: 'По алфавиту' },
      { key: 'date', label: 'По дате' }
    ],
    onClick: (info: { key: string }) => handleSortChange(info.key)
  };

  const columns = useMemo(
    () =>
      getColumns({
        tyId,
        onClick: (record, action) => {
          switch (action) {
            case 'download':
              console.log('Скачать файл:', record.file);
              break;
            case 'delete':
              console.log('Удалить файл:', record.file);
              break;
          }
        }
      }),
    [tyId]
  );

  const data = useMemo(() => {
    const list = filesQuery.data?.results || [];
    const s = searchText.trim().toLowerCase();
    if (!s) return list;
    return list.filter((item: IFileItem) => item.file.toLowerCase().includes(s));
  }, [filesQuery.data, searchText]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (key: string) => {
    console.log('Сортировка:', key);
  };

  const handleAdd = () => {
    setIsAddModalVisible(true);
  };

  const handleDownloadPDF = () => {
    console.log('Скачать PDF');
  };

  const handleCancelAdd = () => {
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleAddConfirm = () => {
    console.log('Добавить файлы:', filesList);
    if (filesList.length > 0) {
      uploadFiles({ folder: folderId || '', files: filesList.map((file) => file.originFileObj as File), ty: tyId || '' });
    }
    setFilesList([]);
    setIsAddModalVisible(false);
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList: newFileList }: UploadChangeParam<UploadFile>) => {
    // Merge newly selected files with the existing list (keep unique by uid)
    setFilesList((prev) => {
      const map = new Map(prev.map((f) => [f.uid, f]));
      newFileList.forEach((f) => {
        map.set(f.uid, f);
      });
      return Array.from(map.values());
    });
  };

  const removeFile = (uid: string) => {
    setFilesList((prev) => prev.filter((f) => f.uid !== uid));
  };

  useEffect(() => {
    if (isSuccess) {
      setIsAddModalVisible(false);
      setFilesList([]);
      message.success('Файлы успешно загружены');
    }
    if (isError) {
      message.error('Ошибка при загрузке файлов');
    }
  }, [isError, isSuccess]);

  return (
    <DashboardLayout title={title}>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col>
          <Space>
            <Input
              placeholder='Найти'
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={searchText}
              onChange={handleSearchChange}
            />
            <Dropdown menu={sortMenu} trigger={['click']}>
              <Button>
                По алфавиту <DownOutlined />
              </Button>
            </Dropdown>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
              Добавить
            </Button>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
              PDF
            </Button>
          </Space>
        </Col>
      </Row>

      <Tabs activeKey={activeTab} onChange={(key) => setActiveTab(key)}>
        <TabPane tab='Загруженные' key='1'>
          <Table columns={columns} dataSource={data} rowKey='id' pagination={false} />
        </TabPane>
        <TabPane tab='Недавние' key='2'>
          {/* Заглушка или своя таблица/контент */}
          <div>Здесь будут "Недавние"</div>
        </TabPane>
      </Tabs>
      <Modal title='Загрузка документа' open={isAddModalVisible} onCancel={handleCancelAdd} footer={null}>
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
                <Button loading={isLoading} type='primary' onClick={handleAddConfirm}>
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
