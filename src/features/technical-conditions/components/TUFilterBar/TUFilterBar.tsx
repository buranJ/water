import { useNavigate } from 'react-router';
import { Button, Form, Input, Select, Space } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { IStageEnum, IStatus6b3Enum } from 'types/common';
import './styles.scss';

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
  const navigate = useNavigate();

  const handleValuesChange = (_: unknown, allValues: TUFilterValues) => {
    onFilterChange(allValues);
  };
  const handleAddClick = () => {
    onAddClick();
    navigate('/dashboard/add-tu-forms');
  };
  return (
    <div className='tu-filter-bar'>
      <Form form={form} layout='inline' onValuesChange={handleValuesChange} style={{ flexWrap: 'wrap', rowGap: 12 }}>
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder='Search' allowClear />
        </Form.Item>

        <Form.Item name='ordering'>
          <Select variant='filled' placeholder='По алфавиту' allowClear style={{ width: 140 }}>
            <Option value='object_name'>А-Я</Option>
            <Option value='-object_name'>Я-А</Option>
          </Select>
        </Form.Item>

        <Form.Item name='status'>
          <Select variant='filled' placeholder='По статусу' allowClear style={{ width: 140 }}>
            <Option value='active'>Утверждено</Option>
            <Option value='inactive'>Отклонено</Option>
            <Option value='archived'>В архиве</Option>
          </Select>
        </Form.Item>

        <Form.Item name='date'>
          <Select variant='filled' placeholder='По дате' allowClear style={{ width: 140 }}>
            <Option value='created_at'>Сначала новые</Option>
            <Option value='-created_at'>Сначала старые</Option>
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
          Добавить
        </Button>
        <Button icon={<DownloadOutlined />} onClick={onDownloadClick}>
          PDF
        </Button>
      </Space>
    </div>
  );
};
