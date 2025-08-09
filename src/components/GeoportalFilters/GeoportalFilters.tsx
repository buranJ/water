import React, { FC } from 'react';
import type { MenuProps } from 'antd';
import { Button, Dropdown, Flex, Input, message, Space } from 'antd';
import { DownOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

import { t } from 'i18next';

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

export const GeoportalFilters: FC<GeoportalFiltersProps> = ({ filters, onSearchChange, onFilterChange, onRefresh, isLoading }) => {
  const typeItems: MenuProps['items'] = [
    { label: t('geoportalFilters.type.all'), key: 'all' },
    { label: `💧 ${t('geoportalFilters.type.water')}`, key: 'water' },
    { label: `🚰 ${t('geoportalFilters.type.sewer')}`, key: 'sewer' },
    { label: `🔥 ${t('geoportalFilters.type.gas')}`, key: 'gas' },
    { label: `⚡ ${t('geoportalFilters.type.electric')}`, key: 'electric' },
    { label: `📍 ${t('geoportalFilters.type.other')}`, key: 'other' }
  ];

  const statusItems: MenuProps['items'] = [
    { label: t('geoportalFilters.status.all'), key: 'all' },
    { label: `✅ ${t('geoportalFilters.status.active')}`, key: 'active' },
    { label: `❌ ${t('geoportalFilters.status.inactive')}`, key: 'inactive' }
  ];

  const dateItems: MenuProps['items'] = [
    { label: t('geoportalFilters.date.all'), key: 'all' },
    { label: t('geoportalFilters.date.month'), key: 'month' },
    { label: t('geoportalFilters.date.quarter'), key: 'quarter' },
    { label: t('geoportalFilters.date.year'), key: 'year' }
  ];

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
    message.success(t('geoportalFilters.messages.type', { value: e.domEvent.currentTarget.textContent }));
  };

  const handleStatusFilter: MenuProps['onClick'] = (e) => {
    const status = e.key === 'all' ? null : e.key;
    onFilterChange('status', status);
    message.success(t('geoportalFilters.messages.status', { value: e.domEvent.currentTarget.textContent }));
  };

  const handleDateFilter: MenuProps['onClick'] = (e) => {
    const dateRange = e.key === 'all' ? null : e.key;
    onFilterChange('dateRange', dateRange);
    message.success(t('geoportalFilters.messages.date', { value: e.domEvent.currentTarget.textContent }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    onSearchChange(e.target.value);
  };

  return (
    <Flex gap={12} style={{ marginBottom: 16 }}>
      <Input
        addonBefore={<SearchOutlined />}
        placeholder={t('geoportalFilters.searchPlaceholder')}
        value={filters.search}
        onChange={handleSearchChange}
        style={{ width: 350 }}
      />

      <Dropdown menu={{ items: typeItems, onClick: handleTypeFilter }}>
        <Button>
          <Space>
            {filters.type ? getFilterLabel(typeItems, filters.type) : t('geoportalFilters.dropdown.type')}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: statusItems, onClick: handleStatusFilter }}>
        <Button>
          <Space>
            {filters.status ? getFilterLabel(statusItems, filters.status) : t('geoportalFilters.dropdown.status')}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Dropdown menu={{ items: dateItems, onClick: handleDateFilter }}>
        <Button>
          <Space>
            {filters.dateRange ? getFilterLabel(dateItems, filters.dateRange) : t('geoportalFilters.dropdown.date')}
            <DownOutlined />
          </Space>
        </Button>
      </Dropdown>

      <Button type='primary' icon={<PlusOutlined />}>
        {t('filterBar.add')}
      </Button>

      <Button onClick={onRefresh} disabled={isLoading}>
        {t('common.refresh')}
      </Button>
    </Flex>
  );
};
