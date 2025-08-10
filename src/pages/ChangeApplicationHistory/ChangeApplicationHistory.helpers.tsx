import { Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IHistoryType } from 'types/common';
import { IApplicationHistory } from 'types/entities/application';

import { TFunction } from 'i18next';

type IGetColumnsFn = (t: TFunction) => ColumnsType<IApplicationHistory>;

const renderStatus = (text: IHistoryType, t: TFunction) => {
  if (text === '+') {
    return <Tag color='success'>{t('changeHistory.status.created')}</Tag>;
  }
  if (text === '-') {
    return <Tag color='error'>{t('changeHistory.status.deleted')}</Tag>;
  }
  if (text === '~') {
    return <Tag color='processing'>{t('changeHistory.status.updated')}</Tag>;
  }
  return null;
};

export const getColumns: IGetColumnsFn = (t) => {
  return [
    {
      title: t('changeHistory.columns.id'),
      dataIndex: 'history_id',
      key: 'history_id',
      align: 'center'
    },
    {
      title: t('changeHistory.columns.user'),
      dataIndex: 'history_user',
      key: 'history_user',
      align: 'center'
    },
    {
      title: t('changeHistory.columns.date'),
      dataIndex: 'history_date',
      key: 'history_date',
      align: 'center',
      render: (text: string) => dayjs(text).format('DD-MM-YYYY-HH:mm')
    },
    {
      title: t('changeHistory.columns.type'),
      dataIndex: 'history_type',
      key: 'history_type',
      align: 'center',
      render: (text: IHistoryType) => renderStatus(text, t)
    },
    {
      title: t('changeHistory.columns.field'),
      dataIndex: 'changes',
      key: 'changes_field',
      render: (changes: { field: string; new: string; old: string }[]) => {
        return changes ? changes?.map((c, i) => <div key={i}>{c.field}</div>) : '-';
      }
    },
    {
      title: t('changeHistory.columns.oldValue'),
      dataIndex: 'changes',
      key: 'changes_old',
      render: (changes: { field: string; new: string; old: string }[]) => <>{changes?.map((c, i) => <div key={i}>{c.old || '-'}</div>)}</>
    },
    {
      title: t('changeHistory.columns.newValue'),
      dataIndex: 'changes',
      key: 'changes_new',
      render: (changes: { field: string; new: string; old: string }[]) => <>{changes?.map((c, i) => <div key={i}>{c.new || '-'}</div>)}</>
    }
  ];
};
