import { useNavigate } from 'react-router';
import { Button, Form, Input, Select, Space } from 'antd';
import { DownloadOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import './styles.scss';

const { Option } = Select;

interface TUFilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
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

        <Form.Item name='alphabet'>
          <Select variant='filled' placeholder='По алфавиту' allowClear style={{ width: 140 }}>
            <Option value='asc'>А-Я</Option>
            <Option value='desc'>Я-А</Option>
          </Select>
        </Form.Item>

        <Form.Item name='type'>
          <Select variant='filled' placeholder='По типу' allowClear style={{ width: 140 }}>
            <Option value='residential'>Жилой</Option>
            <Option value='commercial'>Коммерческий</Option>
          </Select>
        </Form.Item>

        <Form.Item name='status'>
          <Select variant='filled' placeholder='По статусу' allowClear style={{ width: 140 }}>
            <Option value='approved'>Утверждено</Option>
            <Option value='rejected'>Отклонено</Option>
          </Select>
        </Form.Item>

        <Form.Item name='date'>
          <Select variant='filled' placeholder='По дате' allowClear style={{ width: 140 }}>
            <Option value='newest'>Сначала новые</Option>
            <Option value='oldest'>Сначала старые</Option>
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
