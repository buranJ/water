import { FC, useMemo, useState } from 'react';
import { Button, message, Space, Table, Tabs } from 'antd';
import { DownloadOutlined, PlusOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FilterBar } from 'components/FilterBar';
import { IProtocol } from 'types/entities';
import { getColumns } from './Protocol.helpers';

import { useGetProtocolsQuery } from 'api/Buhgalteria.api';

interface IProps {
  title: string;
}

const { TabPane } = Tabs;

export const Protocol: FC<IProps> = ({ title }) => {
  const [activeTab, setActiveTab] = useState('1');
  const { data, isError, isLoading } = useGetProtocolsQuery({ page: 1, page_size: 8 });

  const handleAdd = () => {
    console.log('Нажали "Добавить"');
  };

  const handleDownloadPDF = () => {
    console.log('Скачать PDF');
  };

  const columns = useMemo(() => {
    return getColumns({
      onClick: (record: IProtocol, action: 'info') => {
        if (action === 'info') {
          handleAction(record.id);
        }
      }
    });
  }, []);

  const handleAction = (id: number) => {
    message.info(`Открыть протокол с ID ${id}`);
  };

  if (isLoading) return <div>Загрузка...</div>;
  if (isError) {
    message.error('Ошибка при загрузке протоколов');
    return <div>Ошибка!</div>;
  }

  return (
    <DashboardLayout title={title}>
      <div style={{ marginBottom: 16 }}>
        <FilterBar
          onFilterChange={(e) => console.log(e)}
          showAlphabet
          actionButtons={
            <>
              <Space>
                <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
                  Добавить
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownloadPDF}>
                  PDF
                </Button>
              </Space>
            </>
          }
        />
      </div>

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
