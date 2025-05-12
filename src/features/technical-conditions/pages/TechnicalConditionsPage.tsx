import { useMemo, useState } from 'react';
import { Table } from 'antd';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { getColumns, initialData, TURecord } from './TechnicalConditionsPage.helpers';
import './styles.scss';

interface TUFilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
}

export const TechnicalConditionsPage = () => {
  const [data] = useState<TURecord[]>(initialData);
  const [filteredData, setFilteredData] = useState<TURecord[]>(initialData);

  const handleFilterChange = (filters: TUFilterValues) => {
    let filtered = [...data];

    if (filters.search) {
      filtered = filtered.filter((item) => item.customer.toLowerCase().includes(filters.search?.toLowerCase() || ''));
    }

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    setFilteredData(filtered);
  };

  const handleAddClick = () => {
    console.log('Открыть модалку добавления');
  };

  const handleDownloadClick = () => {
    console.log('Генерация PDF');
  };

  const columns = useMemo(() => {
    return getColumns({
      onClick(record, action) {
        switch (action) {
          case 'edit':
            console.log('Редактировать', record);
            break;
          case 'delete':
            console.log('Удалить', record);
            break;
        }
      }
    });
  }, []);

  return (
    <DashboardLayout title='Технические условия'>
      <div className='technical-conditions-page'>
        <TUFilterBar onFilterChange={handleFilterChange} onAddClick={handleAddClick} onDownloadClick={handleDownloadClick} />
        <Table
          tableLayout='fixed'
          pagination={false}
          columns={columns}
          dataSource={filteredData}
          rowKey='key'
          bordered
          scroll={{ x: 'max-content' }}
        />
        <Pagination />
      </div>
    </DashboardLayout>
  );
};
