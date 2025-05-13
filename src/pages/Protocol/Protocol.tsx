import React, { FC, useState } from 'react';
import { Button, Col, Dropdown, Input, Row, Space, Table, Tabs } from 'antd';
import { DownloadOutlined, DownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';

interface IProps {
  title: string;
}

interface ProtocolRecord {
  key: string;
  tuNumber: string;
  customer: string;
  regDate: string;
  address: string;
  protocol: string;
  status: string;
}

const { TabPane } = Tabs;

const mockData: ProtocolRecord[] = [
  // пример: { key: '1', tuNumber: '04-123', customer: 'Иванов', regDate: '12.09.2025', address: 'ул. Пушкина', protocol: 'Пр.1', status: 'Готово' },
];

export const Protocol: FC<IProps> = ({ title }) => {
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('1');

  const [data] = useState<ProtocolRecord[]>(mockData);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  const handleSortChange = (key: string) => {
    console.log('Сортировка:', key);
  };

  const handleAdd = () => {
    console.log('Нажали "Добавить"');
  };

  const handleDownloadPDF = () => {
    console.log('Скачать PDF');
  };

  const columns = [
    { title: '№ТУ', dataIndex: 'tuNumber', key: 'tuNumber' },
    { title: 'Заказчик', dataIndex: 'customer', key: 'customer' },
    { title: 'Дата регистрации', dataIndex: 'regDate', key: 'regDate' },
    { title: 'Адрес', dataIndex: 'address', key: 'address' },
    { title: 'Протокол', dataIndex: 'protocol', key: 'protocol' },
    { title: 'Статус', dataIndex: 'status', key: 'status' },
    { title: 'Действие', key: 'action', render: () => <Button>Действие</Button> }
  ];

  // Пример меню для сортировки
  const sortMenu = {
    items: [
      { key: 'alphabet', label: 'По алфавиту' },
      { key: 'date', label: 'По дате' }
    ],
    onClick: (info: { key: string }) => handleSortChange(info.key)
  };

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
          <Table columns={columns} dataSource={data} pagination={false} />
        </TabPane>
        <TabPane tab='Недавние' key='2'>
          {/* Заглушка или своя таблица/контент */}
          <div>Здесь будут "Недавние"</div>
        </TabPane>
      </Tabs>
    </DashboardLayout>
  );
};
