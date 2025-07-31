import React, { FC } from 'react';
import type { MenuProps } from 'antd';
import { Button, Flex, Input, message, Space } from 'antd';
import { Dropdown } from 'antd';
import { DownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

export interface Filters {
  search: string;
  type: string | null;
  status: string | null;
  dateRange: string | null;
}

interface GeoportalFiltersProps {
  filters: Filters;
  onSearchChange: (value: string) => void;
  onFilterChange: (filterType: keyof Filters, value: string | null) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const typeItems: MenuProps['items'] = [
  { label: 'Все типы', key: 'all' },
  { label: '💧 Водопровод', key: 'water' },
  { label: '🚰 Канализация', key: 'sewer' },
  { label: '🔥 Газопровод', key: 'gas' },
  { label: '⚡ Электросети', key: 'electric' },
  { label: '📍 Другое', key: 'other' }
];

const statusItems: MenuProps['items'] = [
  { label: 'Все статусы', key: 'all' },
  { label: '✅ Активный', key: 'active' },
  { label: '❌ Неактивный', key: 'inactive' }
];

const dateItems: MenuProps['items'] = [
  { label: 'Все периоды', key: 'all' },
  { label: 'За последний месяц', key: 'month' },
  { label: 'За последние 3 месяца', key: 'quarter' },
  { label: 'За последний год', key: 'year' }
];

export const GeoportalFilters: FC<GeoportalFiltersProps> = ({ filters, onSearchChange, onFilterChange, onRefresh, isLoading }) => {
  const getFilterLabel = (items: MenuProps['items'], key: string | null): string => {
    if (!key) {
      const firstItem = items?.[0];
      return firstItem && typeof firstItem === 'object' && 'label' in firstItem ? (firstItem.label as string) : '';
    }

    const item = items?.find(
      (item): item is { label: React.ReactNode; key: string } =>
        typeof item === 'object' && item !== null && 'key' in item && item.key === key && 'label' in item
    );

    return item ? (item.label as string) : '';
  };

  const handleTypeFilter: MenuProps['onClick'] = (e) => {
    const type = e.key === 'all' ? null : e.key;
    onFilterChange('type', type);
    message.success(`Фильтр по типу: ${e.domEvent.currentTarget.textContent}`);
  };

  const handleStatusFilter: MenuProps['onClick'] = (e) => {
    const status = e.key === 'all' ? null : e.key;
    onFilterChange('status', status);
    message.success(`Фильтр по статусу: ${e.domEvent.currentTarget.textContent}`);
  };

  const handleDateFilter: MenuProps['onClick'] = (e) => {
    const dateRange = e.key === 'all' ? null : e.key;
    onFilterChange('dateRange', dateRange);
    message.success(`Фильтр по дате: ${e.domEvent.currentTarget.textContent}`);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value);
  };

  return (
    <Flex gap={12} style={{ marginBottom: 16 }}>
      <Input
        addonBefore={<SearchOutlined />}
        placeholder='Поиск по названию, адресу или номеру заявки'
        value={filters.search}
        onChange={handleSearchChange}
        style={{ width: 350 }}
      />

      <Dropdown menu={{ items: typeItems, onClick: handleTypeFilter }}>
        <Button>
          <Space>
            {filters.type ? getFilterLabel(typeItems, filters.type) : 'По типу'}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: statusItems, onClick: handleStatusFilter }}>
        <Button>
          <Space>
            {filters.status ? getFilterLabel(statusItems, filters.status) : 'По статусу'}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: dateItems, onClick: handleDateFilter }}>
        <Button>
          <Space>
            {filters.dateRange ? getFilterLabel(dateItems, filters.dateRange) : 'По дате'}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Button type='primary' icon={<PlusOutlined />}>
        Добавить
      </Button>

      <Button onClick={onRefresh} disabled={isLoading}>
        Обновить
      </Button>
    </Flex>
  );
};
