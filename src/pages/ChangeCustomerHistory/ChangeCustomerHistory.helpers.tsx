import { Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { ICustomerChangeHistory } from 'types/entities';

const renderStatus = (text: IHistoryType) => {
  if (text === '+') {
    return <Tag color='success'>Создано</Tag>;
  }
  if (text === '-') {
    return <Tag color='error'>Удалено</Tag>;
  }
  if (text === '~') {
    return <Tag color='processing'>Изменено</Tag>;
  }
};

export const getColumns = (): ColumnsType<ICustomerChangeHistory> => [
  {
    title: 'ID',
    dataIndex: 'history_id',
    key: 'history_id',
    align: 'center'
  },
  {
    title: 'Сотрудник',
    dataIndex: 'history_user',
    key: 'history_user',
    align: 'center'
  },
  {
    title: 'Дата',
    dataIndex: 'history_date',
    key: 'history_date',
    align: 'center',
    render: (text: string) => dayjs(text).format('DD-MM-YYYY-HH:mm')
  },
  {
    title: 'Тип',
    dataIndex: 'history_type',
    key: 'history_type',
    align: 'center',
    render: (text: IHistoryType) => renderStatus(text)
  }
];
