import { Button, Col, Row, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';

import { t } from 'i18next';

type actionType = 'edit' | 'delete' | 'registrationDate' | 'details';

export interface CustomerRecord {
  key: string;
  number: string;
  customer: string;
  categories: 1 | 0;
  passportData: string;
  registrationDate: string;
  address: string;
  contacts: string;
  status: 'active' | 'inactive';
  action: string;
}

type IGetColumnsFn = (options: { onClick: (record: CustomerRecord, action: actionType) => void }) => ColumnsType<CustomerRecord>;

export const getColumns: IGetColumnsFn = ({ onClick }) => {
  return [
    {
      title: t('customers.columns.number'),
      dataIndex: 'number',
      key: 'number',
      align: 'center',
      render: (number: string, record: CustomerRecord) => (
        <span style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => onClick(record, 'details')}>
          {number}
        </span>
      )
    },
    {
      title: t('customers.columns.customer'),
      dataIndex: 'customer',
      key: 'customer',
      width: 220,
      align: 'center'
    },
    {
      title: t('customers.columns.categories'),
      dataIndex: 'categories',
      key: 'categories',
      render: (text) => {
        return text === 1 ? (
          <Tag color='processing'>{t('customers.category.physicalShort')}</Tag>
        ) : (
          <Tag color='success'>{t('customers.category.legalShort')}</Tag>
        );
      },
      align: 'center'
    },
    {
      title: t('customers.columns.passportData'),
      dataIndex: 'passportData',
      key: 'passportData',
      align: 'center',
      width: 200
    },
    {
      title: t('customers.columns.registrationDate'),
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      align: 'center',
      width: 200,
      render: (_, record) => {
        return (
          <div style={{ cursor: 'pointer' }} onClick={() => onClick(record, 'registrationDate')}>
            {record.registrationDate}
          </div>
        );
      }
    },
    {
      title: t('customers.columns.address'),
      dataIndex: 'address',
      key: 'address',
      align: 'center',
      width: 200
    },
    {
      title: t('customers.columns.contacts'),
      dataIndex: 'contacts',
      key: 'contacts',
      align: 'center',
      width: 180
    },
    {
      title: t('customers.columns.status'),
      dataIndex: 'status',
      key: 'status',
      render: (text) => {
        return text === 'active' ? <Tag color='success'>{t('customers.status.active')}</Tag> : <Tag>{t('customers.status.inactive')}</Tag>;
      },
      align: 'center',
      width: 150
    },
    {
      title: t('customers.columns.action'),
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
    number: '1',
    customer: 'ОсОО "Сайрус"',
    categories: 1,
    passportData: 'AN 8829921',
    registrationDate: '14 марта 2025',
    address: 'г.Бишкек ул.Токтогула 122',
    contacts: '+996 700 121 314',
    status: 'active',
    action: 'Редактировать'
  },
  {
    key: '2',
    number: '2',
    customer: 'ТОО "Сайрус"',
    categories: 0,
    passportData: 'AN 8829921',
    registrationDate: '14 марта 2025',
    address: 'г.Бишкек ул.Северо-Ипподромная 40',
    contacts: '+996 702 801 490',
    status: 'inactive',
    action: 'Редактировать'
  }
];
