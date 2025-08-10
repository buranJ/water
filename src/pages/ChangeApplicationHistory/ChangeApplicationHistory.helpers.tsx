import { Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { IApplicationHistory } from 'types/entities/application';

type IGetColumnsFn = () => ColumnsType<IApplicationHistory>;

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

export const getColumns: IGetColumnsFn = () => {
  return [
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
    },
    {
      title: 'Поле',
      dataIndex: 'changes',
      key: 'changes_field',
      render: (changes: { field: string; new: string; old: string }[]) => {
        return changes ? changes?.map((c, i) => <div key={i}>{c.field}</div>) : '-';
      }
    },
    {
      title: 'Старое значение',
      dataIndex: 'changes',
      key: 'changes_old',
      render: (changes: { field: string; new: string; old: string }[]) => <>{changes?.map((c, i) => <div key={i}>{c.old || '-'}</div>)}</>
    },
    {
      title: 'Новое значение',
      dataIndex: 'changes',
      key: 'changes_new',
      render: (changes: { field: string; new: string; old: string }[]) => <>{changes?.map((c, i) => <div key={i}>{c.new || '-'}</div>)}</>
    }
  ];
};
