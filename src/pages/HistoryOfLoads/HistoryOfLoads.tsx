import React, { FC, useState } from 'react';
import { Button, Col, Input, Row, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

import { t } from 'i18next';

interface IProps {
  title: string;
}

interface LoadRecord {
  key: string;
  tuNumber: string;
  collaborator: string;
  load: string;
  regDate: string;
  status: 'approved' | 'rejected';
}

export const HistoryOfLoads: FC<IProps> = ({ title }) => {
  const [data] = useState<LoadRecord[]>([
    {
      key: '1',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'rejected'
    },
    {
      key: '2',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'approved'
    },
    {
      key: '3',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'approved'
    }
  ]);

  const [, setSearchText] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const columns = [
    {
      title: t('historyOfLoads.columns.tu'),
      dataIndex: 'tuNumber',
      sorter: true, // для примера
      render: (text: string) => text
    },
    {
      title: t('historyOfLoads.columns.collaborator'),
      dataIndex: 'collaborator'
    },
    {
      title: t('historyOfLoads.columns.loadAdded'),
      dataIndex: 'load'
    },
    {
      title: t('historyOfLoads.columns.regDate'),
      dataIndex: 'regDate'
    },
    {
      title: t('historyOfLoads.columns.status'),
      dataIndex: 'status',
      render: (text: string) => {
        return text === 'approved' ? (
          <Tag color='green' style={{ width: '50%', textAlign: 'center' }}>
            {t('filterBar.approved')}
          </Tag>
        ) : (
          <Tag color='red' style={{ width: '50%', textAlign: 'center' }}>
            {t('filterBar.rejected')}
          </Tag>
        );
      }
    }
  ];

  const rowSelection = {
    onChange: (selectedRowKeys: React.Key[], selectedRows: LoadRecord[]) => {
      console.log('Выбрали строки: ', selectedRows, selectedRowKeys);
    }
  };

  const handleAddLoad = () => {
    console.log('Добавить нагрузку');
  };

  const handleDownloadPDF = () => {
    console.log('Скачать PDF');
  };

  const handleDelete = () => {
    console.log('Удалить выбранные документы?');
  };

  return (
    <DashboardLayout title={title}>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col>
          <Button type='primary' icon={<PlusOutlined />} onClick={handleAddLoad}>
            {t('historyOfLoads.addLoad')}
          </Button>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
              {t('common.downloadPdf')}
            </Button>
          </Space>
        </Col>
      </Row>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input placeholder={t('filterBar.search')} prefix={<SearchOutlined />} style={{ marginBottom: 16 }} onChange={handleSearch} />
        </Col>
        <Col>
          <Tooltip title={t('common.delete')}>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
          </Tooltip>
        </Col>
      </Row>

      <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false} />
    </DashboardLayout>
  );
};
