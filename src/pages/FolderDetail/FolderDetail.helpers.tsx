import { Button, Space, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, DownloadOutlined, FileOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { IFileItem } from 'types/entities';

type ActionType = 'download' | 'delete';

type GetColumnsOptions = {
  onClick: (record: IFileItem, action: ActionType) => void;
  tyId?: string;
};

export const getColumns = ({ onClick, tyId }: GetColumnsOptions): ColumnsType<IFileItem> => [
  {
    title: 'Название',
    dataIndex: 'file',
    key: 'file',
    render: (_: unknown, record) => (
      <Space size={12} align='start'>
        <FileOutlined width={24} height={24} />
        <div>
          <div>{record.file.split('/')[record.file.split('/').length - 1]}</div>
          <Typography.Text type='secondary'>
            {tyId ? `ТУ ${tyId}` : `Папка ${record.folder}`} {` > Документ ${record.id}`}
          </Typography.Text>
        </div>
      </Space>
    )
  },
  {
    title: 'Дата загрузки',
    dataIndex: 'uploaded_at',
    key: 'uploaded_at',
    render: (text: string) => (text ? dayjs(text).format('DD-MM-YYYY') : '')
  },
  {
    title: 'Действия',
    key: 'action',
    width: 140,
    render: (_: unknown, record) => (
      <Space size='middle'>
        <Button aria-label='Скачать файл' icon={<DownloadOutlined />} onClick={() => onClick(record, 'download')} />
        <Button aria-label='Удалить файл' icon={<DeleteOutlined />} danger onClick={() => onClick(record, 'delete')} />
      </Space>
    )
  }
];
