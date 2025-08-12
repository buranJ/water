import { Button, Form, Input, Select, Space } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import './styles.scss';

import { t } from 'i18next';

const { Option } = Select;

interface TUFilterValues {
  search?: string;
  ordering?: string;
  type?: IStageEnum;
  status?: IStatus6b3Enum;
  date?: string;
}

interface Props {
  onFilterChange: (values: TUFilterValues) => void;
  onAddClick: () => void;
  onDownloadClick: () => void;
}

export const TUFilterBar = ({ onFilterChange, onAddClick, onDownloadClick }: Props) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_: unknown, allValues: TUFilterValues) => {
    onFilterChange(allValues);
  };
  const handleAddClick = () => {
    onAddClick();
  };
  return (
    <div className='tu-filter-bar'>
      <Form form={form} layout='inline' onValuesChange={handleValuesChange} style={{ flexWrap: 'wrap', rowGap: 12 }}>
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder={t('filterBar.search')} allowClear />
        </Form.Item>

        <Form.Item name='ordering'>
          <Select variant='filled' placeholder={t('filterBar.filter.alphabet')} allowClear style={{ width: 140 }}>
            <Option value='object_name'>{t('filterBar.alphabetAsc')}</Option>
            <Option value='-object_name'>{t('filterBar.alphabetDesc')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='status'>
          <Select variant='filled' placeholder={t('filterBar.filter.status')} allowClear style={{ width: 140 }}>
            <Option value='active'>{t('filterBar.approved')}</Option>
            <Option value='inactive'>{t('filterBar.rejected')}</Option>
            <Option value='archived'>{t('filterBar.archived')}</Option>
          </Select>
        </Form.Item>

        <Form.Item name='date'>
          <Select variant='filled' placeholder={t('filterBar.byDate')} allowClear style={{ width: 140 }}>
            <Option value='created_at'>{t('filterBar.newOnesfirst')}</Option>
            <Option value='-created_at'>{t('filterBar.newOldFirst')}</Option>
          </Select>
        </Form.Item>
      </Form>

      <Space>
        <Button
          type='primary'
          icon={<PlusOutlined />}
          onClick={() => {
            handleAddClick();
            onAddClick();
          }}
        >
          {t('filterBar.add')}
        </Button>
        <Button icon={<DownloadOutlined />} onClick={onDownloadClick}>
          PDF
        </Button>
      </Space>
    </div>
  );
};
