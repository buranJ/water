import { Form, Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './styles.scss';

const { Option } = Select;

export interface FilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
}

interface Props {
  onFilterChange: (values: FilterValues) => void;
  showAlphabet?: boolean;
  showType?: boolean;
  showStatus?: boolean;
  showDate?: boolean;
  actionButtons?: React.ReactNode;
}

export const FilterBar = ({ onFilterChange, showAlphabet, showDate, showStatus, showType, actionButtons }: Props) => {
  const [form] = Form.useForm();

  const handleValuesChange = (_: unknown, allValues: FilterValues) => {
    onFilterChange(allValues);
  };

  return (
    <div className='filter-bar'>
      <Form form={form} layout='inline' onValuesChange={handleValuesChange} style={{ flexWrap: 'wrap', rowGap: 12 }}>
        <Form.Item name='search'>
          <Input prefix={<SearchOutlined />} placeholder='Найти' allowClear />
        </Form.Item>

        {showAlphabet && (
          <Form.Item name='alphabet'>
            <Select variant='filled' placeholder='По алфавиту' allowClear style={{ width: 140 }}>
              <Option value='asc'>А-Я</Option>
              <Option value='desc'>Я-А</Option>
            </Select>
          </Form.Item>
        )}

        {showDate && (
          <Form.Item name='type'>
            <Select variant='filled' placeholder='По типу' allowClear style={{ width: 140 }}>
              <Option value='residential'>Жилой</Option>
              <Option value='commercial'>Коммерческий</Option>
            </Select>
          </Form.Item>
        )}

        {showStatus && (
          <Form.Item name='status'>
            <Select variant='filled' placeholder='По статусу' allowClear style={{ width: 140 }}>
              <Option value='approved'>Утверждено</Option>
              <Option value='rejected'>Отклонено</Option>
            </Select>
          </Form.Item>
        )}

        {showType && (
          <Form.Item name='date'>
            <Select variant='filled' placeholder='По дате' allowClear style={{ width: 140 }}>
              <Option value='newest'>Сначала новые</Option>
              <Option value='oldest'>Сначала старые</Option>
            </Select>
          </Form.Item>
        )}
      </Form>

      <Space>{actionButtons}</Space>
    </div>
  );
};
