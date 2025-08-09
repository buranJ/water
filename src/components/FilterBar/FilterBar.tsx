import { useState } from 'react';
import { Input, Select, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './styles.scss';

const { Option } = Select;

export interface FilterValues {
  search?: string;
  alphabet?: string;
  type?: string;
  status?: string;
  date?: string;
  category?: string;
}

interface Props {
  onFilterChange: (values: FilterValues) => void;
  showAlphabet?: boolean;
  showType?: boolean;
  showStatus?: boolean;
  showDate?: boolean;
  showCategory?: boolean;
  categoryOptions?: { value: string; label: string }[];
  showStatusSelect?: boolean;
  statusOptions?: { value: string; label: string }[];
  actionButtons?: React.ReactNode;
}

export const FilterBar = ({
  onFilterChange,
  showAlphabet,
  showDate,
  showStatus,
  showType,
  showCategory,
  categoryOptions,
  showStatusSelect,
  statusOptions,
  actionButtons
}: Props) => {
  const [values, setValues] = useState<FilterValues>({});

  const handleChange = (key: keyof FilterValues, value: string) => {
    const newValues = { ...values, [key]: value };
    setValues(newValues);
    onFilterChange(newValues);
  };

  return (
    <div className='filter-bar'>
      <Space style={{ flexWrap: 'wrap', rowGap: 12 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder='Найти'
          allowClear
          value={values.search}
          onChange={(e) => handleChange('search', e.target.value)}
          style={{ width: 180 }}
        />

        {showAlphabet && (
          <Select
            variant='filled'
            placeholder='По алфавиту'
            allowClear
            style={{ width: 140 }}
            value={values.alphabet}
            onChange={(v) => handleChange('alphabet', v)}
          >
            <Option value='asc'>А-Я</Option>
            <Option value='desc'>Я-А</Option>
          </Select>
        )}

        {showCategory && categoryOptions && (
          <Select
            variant='filled'
            placeholder='Категория'
            allowClear
            style={{ width: 140 }}
            value={values.category}
            onChange={(v) => handleChange('category', v)}
          >
            {categoryOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {showStatusSelect && statusOptions && (
          <Select
            variant='filled'
            placeholder='Статус'
            allowClear
            style={{ width: 140 }}
            value={values.status}
            onChange={(v) => handleChange('status', v)}
          >
            {statusOptions.map((opt) => (
              <Option key={opt.value} value={opt.value}>
                {opt.label}
              </Option>
            ))}
          </Select>
        )}

        {showType && (
          <Select
            variant='filled'
            placeholder='По типу'
            allowClear
            style={{ width: 140 }}
            value={values.type}
            onChange={(v) => handleChange('type', v)}
          >
            <Option value='residential'>Жилой</Option>
            <Option value='commercial'>Коммерческий</Option>
          </Select>
        )}

        {showStatus && (
          <Select
            variant='filled'
            placeholder='По статусу'
            allowClear
            style={{ width: 140 }}
            value={values.status}
            onChange={(v) => handleChange('status', v)}
          >
            <Option value='approved'>Утверждено</Option>
            <Option value='rejected'>Отклонено</Option>
          </Select>
        )}

        {showDate && (
          <Select
            variant='filled'
            placeholder='По дате'
            allowClear
            style={{ width: 140 }}
            value={values.date}
            onChange={(v) => handleChange('date', v)}
          >
            <Option value='created_at'>Сначала новые</Option>
            <Option value='-created_at'>Сначала старые</Option>
          </Select>
        )}
      </Space>
      <Space>{actionButtons}</Space>
    </div>
  );
};
