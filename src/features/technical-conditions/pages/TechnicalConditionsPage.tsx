import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Table } from 'antd';
import { Pagination } from 'common/ui';
import { TUFilterBar } from '../components/TUFilterBar/TUFilterBar';
import { DashboardLayout } from 'components';
import { getColumns, initialData, TURecord } from './TechnicalConditionsPage.helpers';
import './styles.scss';

import { TyItem, useGetAllTyQuery } from 'api/Ty.api';

interface TUFilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
}

function transformTyItemsToTURecords(items: TyItem[]): TURecord[] {
  return items.map((item) => {
    return {
      key: String(item.id),
      number: item.request_number || '',
      date: item.request_date || '',
      customer: `Клиент #${item.customer}`,
      address: item.address || '',
      objectName: item.object_name || '',
      waterAmount: item.water_required || '',
      wastewaterAmount: item.sewage_amount || '',
      contractNumber: item.payment_connection || '',
      invoiceNumber: item.payment_invoice_number || '',
      paymentAmount: item.payment_amount || '',
      paid: '0',
      paymentDate: '',
      balance: '',
      status: item.status === 'approved' ? 'approved' : 'rejected'
    };
  });
}

export const TechnicalConditionsPage = () => {
  const navigate = useNavigate();
  const { data: tuData } = useGetAllTyQuery();

  const [data, setData] = useState<TURecord[]>([]);
  const [filteredData, setFilteredData] = useState<TURecord[]>([]);

  useEffect(() => {
    if (tuData) {
      console.log('tuData:', tuData);
      const items: TyItem[] = Array.isArray(tuData) ? tuData : [];
      const newRecords = transformTyItemsToTURecords(items);
      setData(newRecords);
      setFilteredData(newRecords);
    }
  }, [tuData]);

  const handleFilterChange = (filters: TUFilterValues) => {
    let filtered = [...data];

    if (filters && filters.search) {
      const searchValue = filters.search.toLowerCase() ?? '';
      filtered = filtered.filter((item) => item.customer.toLowerCase().includes(searchValue));
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
      onClick: (record, action) => {
        switch (action) {
          case 'edit':
            navigate(`/dashboard/technical-conditions/tu-details/${record.key}`);
            break;
          case 'delete':
            console.log('Delete action clicked for record:', record);
            break;
        }
      }
    });
  }, [navigate]);

  return (
    <DashboardLayout title='Технические условия'>
      <div className='technical-conditions-page'>
        <TUFilterBar onFilterChange={handleFilterChange} onAddClick={handleAddClick} onDownloadClick={handleDownloadClick} />
        <Table
          tableLayout='fixed'
          pagination={false}
          columns={columns}
          dataSource={initialData}
          rowKey='key'
          bordered
          scroll={{ x: 'max-content' }}
        />
        <Pagination />
      </div>
    </DashboardLayout>
  );
};
