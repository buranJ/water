import React, { FC, useState } from 'react';
import { Button, Col, Input, Row, Space, Table, Tag, Tooltip } from 'antd';
import { DeleteOutlined, DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

interface IProps {
  title: string;
}

interface LoadRecord {
  key: string;
  tuNumber: string;
  collaborator: string;
  load: string;
  regDate: string;
  status: 'Утверждено' | 'Отклонено';
}

export const HistoryOfLoads: FC<IProps> = ({ title }) => {
  const [data] = useState<LoadRecord[]>([
    {
      key: '1',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'Отклонено'
    },
    {
      key: '2',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'Утверждено'
    },
    {
      key: '3',
      tuNumber: '04-472',
      collaborator: 'Атай Аманов',
      load: '16.5000 м³/сут',
      regDate: '03-04-2025',
      status: 'Утверждено'
    }
  ]);

  const [, setSearchText] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const columns = [
    {
      title: '№ ТУ',
      dataIndex: 'tuNumber',
      sorter: true, // для примера
      render: (text: string) => text
    },
    {
      title: 'Сотрудник',
      dataIndex: 'collaborator'
    },
    {
      title: 'Добавленная нагрузка',
      dataIndex: 'load'
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'regDate'
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      render: (text: string) => {
        return text === 'Утверждено' ? (
          <Tag color='green' style={{ width: '50%', textAlign: 'center' }}>
            Утверждено
          </Tag>
        ) : (
          <Tag color='red' style={{ width: '50%', textAlign: 'center' }}>
            Отклонено
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
            Добавить нагрузку
          </Button>
        </Col>
        <Col>
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
              Скачать PDF
            </Button>
          </Space>
        </Col>
      </Row>
      <Row justify='space-between' style={{ marginBottom: 16 }}>
        <Col span={12}>
          <Input placeholder='Search' prefix={<SearchOutlined />} style={{ marginBottom: 16 }} onChange={handleSearch} />
        </Col>
        <Col>
          <Tooltip title='Удалить'>
            <Button danger icon={<DeleteOutlined />} onClick={handleDelete} />
          </Tooltip>
        </Col>
      </Row>

      <Table rowSelection={rowSelection} columns={columns} dataSource={data} pagination={false} />
    </DashboardLayout>
  );
};
