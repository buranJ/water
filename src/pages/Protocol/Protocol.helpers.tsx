import { Button } from 'antd';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { IProtocol } from 'types/entities';

type actionType = 'info';

type IGetColumnsFn = (options: { onClick: (record: IProtocol, action: actionType) => void }) => ColumnsType<IProtocol>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: '№ТУ',
      dataIndex: 'id',
      key: 'id'
    },
    {
      title: 'Заказчик',
      dataIndex: 'load',
      key: 'load'
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'created_at',
      key: 'created_at'
    },
    {
      title: 'Цена канализации',
      dataIndex: 'kanal_price',
      key: 'kanal_price'
    },
    {
      title: 'Коэффициент',
      dataIndex: 'coefficient',
      key: 'coefficient'
    },
    {
      title: 'Итоговая сумма (вода)',
      dataIndex: 'total_water_sum',
      key: 'total_water_sum'
    },
    {
      title: 'Итоговая сумма (канализация)',
      dataIndex: 'total_kanal_sum',
      key: 'total_kanal_sum'
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (value) => (value ? dayjs(value).format('DD.MM.YYYY') : 'Не указано')
    },
    {
      title: '№ ТУ',
      dataIndex: 'technical_condition',
      key: 'technical_condition'
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record) => (
        <Button type='primary' onClick={() => onClick(record, 'info')}>
          Подробности
        </Button>
      )
    }
  ];
};
