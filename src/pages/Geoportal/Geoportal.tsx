import { FC, useEffect, useState } from 'react';
import { Button, Flex, message, Spin, Typography } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';
import { Filters, GeoportalFilters } from 'components/GeoportalFilters/GeoportalFilters';
import { MapObjectCard } from 'components/MapObjectCard/MapObjectCard';
import { YandexMap } from 'components/YandexMap/YandexMap';

import { MapObject, useGetAllMapObjectsQuery } from 'api/GeoPartal.api';
import { t } from 'i18next';
import { applyFilters } from 'utils/mapHelpers';

const { Text } = Typography;

interface GeoportalProps {
  title: string;
}

export const Geoportal: FC<GeoportalProps> = ({ title }) => {
  const [filteredObjects, setFilteredObjects] = useState<MapObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<MapObject | null>(null);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    type: null,
    status: null,
    dateRange: null
  });

  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useGetAllMapObjectsQuery(undefined, {
    skip: false,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: false,
    refetchOnReconnect: false
  });

  const objects = apiResponse?.results || [];

  // Инициализация filteredObjects при первой загрузке данных
  useEffect(() => {
    if (!filteredObjects.length && objects.length > 0) {
      setFilteredObjects(objects);
    }
  }, [objects, filteredObjects.length]);

  // Применение фильтров при изменении objects или filters
  useEffect(() => {
    if (objects.length > 0) {
      const filtered = applyFilters(objects, filters);
      setFilteredObjects(filtered);
    }
  }, [objects, filters]);

  // Обработка ошибок
  useEffect(() => {
    if (error) {
      message.error(t('geoportal.errorLoad'));
    }
  }, [error]);

  const handleFilterChange = (filterType: keyof Filters, value: string | null): void => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleSearchChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleRefresh = (): void => {
    refetch();
    message.success(t('geoportal.dataRefreshed'));
  };

  const handleResetFilters = (): void => {
    setFilters({ search: '', type: null, status: null, dateRange: null });
  };

  const hasActiveFilters = Boolean(filters.search || filters.type || filters.status || filters.dateRange);

  return (
    <DashboardLayout title={t(title)}>
      {isLoading && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Spin size='large' />
        </div>
      )}

      {error && (
        <div style={{ marginBottom: 16 }}>
          <Text type='danger'>{t('geoportal.apiError')}</Text>
          <Button type='link' onClick={handleRefresh} style={{ marginLeft: 8 }}>
            {t('geoportal.tryAgain')}
          </Button>
        </div>
      )}

      <GeoportalFilters
        filters={filters}
        onSearchChange={handleSearchChange}
        onFilterChange={handleFilterChange}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      <Flex gap={16} wrap='wrap'>
        <div style={{ flex: 1, minWidth: '600px' }}>
          <YandexMap objects={filteredObjects} onSelect={setSelectedObject} />
        </div>

        {selectedObject && <MapObjectCard selectedObject={selectedObject} />}
      </Flex>

      <div style={{ marginTop: 16 }}>
        <Text type='secondary'>{t('geoportal.foundCount', { count: filteredObjects.length, total: objects.length })}</Text>
        {hasActiveFilters && (
          <Button type='link' size='small' onClick={handleResetFilters} style={{ marginLeft: 8 }}>
            {t('geoportal.resetFilters')}
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Geoportal;
