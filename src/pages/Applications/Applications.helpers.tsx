import { useState } from 'react';
import { Button, Flex, TabsProps, Tag, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { RejectApplicationModal } from '../../components/Modal'; // импорт модального окна

export type actionType = 'create' | 'reject' | 'approve' | 'tuDetails';

export const tabItems: TabsProps['items'] = [
  { key: 'all', label: 'Все', children: null },
  { key: 'accepted', label: 'Одобрено', children: null },
  { key: 'pending', label: 'В ожидании', children: null },
  { key: 'rejected', label: 'Отказано', children: null }
];

export type StatusCode = 'approved' | 'rejected' | 'pending';

export interface ApplicationData {
  key: string;
  id: string;
  date: string;
  customer: string;
  address: string;
  objectName: string;
  waterAmount: string;
  wastewaterAmount: string;
  status: StatusCode;
  rejectReason?: string;
  comment?: string;
  hasTu?: boolean;
}

export interface RejectFormData {
  reason: string;
  comment: string;
  attachments?: File[];
}

// Хук для управления модальным окном отклонения
export const useRejectModal = () => {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationData | undefined>();

  const openRejectModal = (application: ApplicationData) => {
    setSelectedApplication(application);
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setIsRejectModalOpen(false);
    setSelectedApplication(undefined);
  };

  const handleReject = (rejectData: RejectFormData) => {
    console.log('Rejecting application:', selectedApplication, rejectData);
    closeRejectModal();
  };

  const RejectModalComponent = () => (
    <RejectApplicationModal
      open={isRejectModalOpen}
      onCancel={closeRejectModal}
      onReject={handleReject}
      applicationData={selectedApplication}
    />
  );

  return {
    openRejectModal,
    closeRejectModal,
    RejectModalComponent,
    isRejectModalOpen,
    selectedApplication
  };
};

type IGetColumnsFn = (options: {
  onClick: (record: ApplicationData, action: actionType) => void;
  onReject?: (record: ApplicationData) => void;
}) => ColumnsType<ApplicationData>;

export const getColumns: IGetColumnsFn = ({ onClick, onReject }) => {
  const renderStatus = (status: StatusCode) => {
    switch (status) {
      case 'approved':
        return <Tag color='success'>Одобрено</Tag>;
      case 'rejected':
        return <Tag color='error'>Отказано</Tag>;
      case 'pending':
        return <Tag color='processing'>В ожидании</Tag>;
    }
  };

  const renderAction = (record: ApplicationData) => {
    if (record.status === 'pending') {
      return (
        <Flex gap={12}>
          <Button
            size='large'
            type='default'
            onClick={() => {
              if (onReject) {
                onReject(record);
              } else {
                onClick(record, 'reject');
              }
            }}
          >
            Отказать
          </Button>
          <Button size='large' type='primary' onClick={() => onClick(record, 'approve')}>
            Одобрить
          </Button>
        </Flex>
      );
    }
    if (record.status === 'approved' && record.hasTu) {
      return (
        <Button size='large' type='primary' onClick={() => onClick(record, 'tuDetails')}>
          Детали ТУ
        </Button>
      );
    }
    return (
      <Button size='large' type='primary' onClick={() => onClick(record, 'create')}>
        Оформить
      </Button>
    );
  };

  return [
    {
      title: '№ заявки',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (id: string, record: ApplicationData) => {
        // Для перехода на детальную страницу заявки
        // navigate должен быть передан через options, иначе используем window.location
        return (
          <span
            style={{ color: '#1677ff', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => {
              if ((window as any).navigate) {
                (window as any).navigate(`/dashboard/applications/${id}`);
              } else {
                window.location.href = `/dashboard/applications/${id}`;
              }
            }}
          >
            {id}
          </span>
        );
      }
    },
    { title: 'Дата регистрации', dataIndex: 'date', key: 'date', align: 'center' },
    {
      title: 'Заказчик',
      dataIndex: 'customer',
      key: 'customer',
      align: 'center',
      render: (text, record) => <Typography.Link onClick={() => onClick(record, 'reject')}>{text}</Typography.Link>
    },
    { title: 'Адрес', dataIndex: 'address', key: 'address', align: 'center' },
    { title: 'Наименование объекта', dataIndex: 'objectName', key: 'objectName', width: 260 },
    { title: 'Количество водопроводной воды', dataIndex: 'waterAmount', key: 'waterAmount', align: 'center' },
    { title: 'Количество стоков', dataIndex: 'wastewaterAmount', key: 'wastewaterAmount', align: 'center' },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusCode) => renderStatus(status),
      align: 'center'
    },
    {
      title: 'Действие',
      key: 'action',
      render: (_, record: ApplicationData) => renderAction(record),
      align: 'center'
    }
  ];
};

export const data: ApplicationData[] = [
  {
    key: '1',
    id: '04-472',
    date: '03-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 304',
    status: 'approved',
    objectName: '9-ти этажный многоквартирный жилой дом с торговыми помещениями на собственной территории',
    waterAmount: '62,436',
    wastewaterAmount: '62,436',
    hasTu: true
  },
  {
    key: '2',
    id: '04-472',
    date: '03-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 304',
    status: 'rejected',
    objectName: '9-ти этажный многоквартирный жилой дом с торговыми помещениями на собственной территории',
    waterAmount: '62,436',
    wastewaterAmount: '62,436',
    rejectReason: 'Отказ от архитектуры',
    comment: 'Нарушение санитарных зон или охранных требований.'
  },
  {
    key: '3',
    id: '04-472',
    date: '03-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 304',
    status: 'pending',
    objectName: '9-ти этажный многоквартирный жилой дом с торговыми помещениями на собственной территории',
    waterAmount: '62,436',
    wastewaterAmount: '62,436'
  },
  {
    key: '4',
    id: '04-473',
    date: '04-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 305',
    status: 'approved',
    objectName: '10-ти этажный жилой дом',
    waterAmount: '70,000',
    wastewaterAmount: '70,000',
    hasTu: false
  },
  {
    key: '5',
    id: '04-474',
    date: '05-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 306',
    status: 'pending',
    objectName: '11-ти этажный жилой дом',
    waterAmount: '80,000',
    wastewaterAmount: '80,000'
  },
  {
    key: '6',
    id: '04-475',
    date: '06-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 307',
    status: 'pending',
    objectName: '12-ти этажный жилой дом',
    waterAmount: '90,000',
    wastewaterAmount: '90,000'
  },
  {
    key: '7',
    id: '04-476',
    date: '07-03-2025',
    customer: 'ОССО "Сайрус"',
    address: 'пр. Дон Сайрус, 308',
    status: 'pending',
    objectName: '13-ти этажный жилой дом',
    waterAmount: '100,000',
    wastewaterAmount: '100,000'
  }
];
