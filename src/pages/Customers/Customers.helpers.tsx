import { Button, Col, Row, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

type actionType = 'edit' | 'delete' | 'registrationDate';

export interface CustomerRecord {
  key: string;
  id: string;
  customer: string;
  category: '1' | '0';
  pasport?: string;
  created_at: string;
  address: string;
  contact: string;
  status: 'active' | 'inactive';
  action: string;
}

type IGetColumnsFn = (options: { onClick: (record: CustomerRecord, action: actionType) => void }) => ColumnsType<CustomerRecord>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: '№',
      dataIndex: 'id',
      key: 'id',
      align: 'center'
    },
    {
      title: 'Заказчик',
      dataIndex: 'customer',
      key: 'customer',
      width: 220,
      align: 'center'
    },
    {
      title: 'Категории',
      dataIndex: 'category',
      key: 'category',
      render: (text) => {
        return +text === 1 ? <Tag color='processing'>Физ. лицо</Tag> : <Tag color='success'>Юр. лицо</Tag>;
      },
      align: 'center'
    },
    {
      title: 'Паспортные данные',
      dataIndex: 'pasport',
      key: 'pasport',
      align: 'center',
      width: 200
    },
    {
      title: 'Дата регистрации',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 200,
      render: (_, record) => {
        const dataFormatter = (date: string) => {
          const dateObj = new Date(date);
          return isNaN(dateObj.getTime()) ? 'Некорректная дата' : format(dateObj, 'd MMMM yyyy', { locale: ru });
        };
        return (
          <div style={{ cursor: 'pointer' }} onClick={() => onClick(record, 'registrationDate')}>
            {dataFormatter(record.created_at)}
          </div>
        );
      }
    },
    {
      title: 'Адрес',
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      width: 200
    },
    {
      title: 'Контакты',
      dataIndex: 'contact',
      key: 'contact',
      align: 'center',
      width: 180
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        return text === 'active' ? <Tag color='success'>Активен</Tag> : <Tag>Не активен</Tag>;
      },
      align: 'center',
      width: 150
    },
    {
      title: 'Действие',
      dataIndex: 'action',
      key: 'action',
      align: 'center',
      width: 126,
      render: (_, record) => {
        return (
          <Row gutter={8} justify='center'>
            <Col>
              <Button icon={<EditOutlined />} onClick={() => onClick(record, 'edit')} />
            </Col>
            <Col>
              <Button danger icon={<DeleteOutlined />} onClick={() => onClick(record, 'delete')} />
            </Col>
          </Row>
        );
      }
    }
  ];
};

export const initialData: CustomerRecord[] = [
  {
    key: '1',
    id: '1',
    customer: 'ОсОО "Сайрус"',
    category: '1',
    pasport: 'AN 8829921',
    created_at: '14 марта 2025',
    address: 'г.Бишкек ул.Токтогула 122',
    contact: '+996 700 121 314',
    status: 'active',
    action: 'Редактировать'
  },
  {
    key: '2',
    id: '2',
    customer: 'ТОО "Сайрус"',
    category: '0',
    pasport: 'AN 8829921',
    created_at: '14 марта 2025',
    address: 'г.Бишкек ул.Северо-Ипподромная 40',
    contact: '+996 702 801 490',
    status: 'inactive',
    action: 'Редактировать'
  }
];
