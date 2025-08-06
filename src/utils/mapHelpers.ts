import { Filters } from 'components/GeoportalFilters/GeoportalFilters';

import { MapObject } from 'api/GeoPartal.api';

export const getTypeIcon = (type: string): string => {
  const icons = {
    water: '💧',
    sewer: '🚰',
    gas: '🔥',
    electric: '⚡',
    other: '📍'
  };
  return icons[type as keyof typeof icons] || '📍';
};

export const applyFilters = (data: MapObject[], filters: Filters): MapObject[] => {
  return data.filter((obj) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        obj.object_name.toLowerCase().includes(searchLower) ||
        obj.address.toLowerCase().includes(searchLower) ||
        obj.request_number.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.type && obj.type !== filters.type) {
      return false;
    }

    if (filters.status && obj.status !== filters.status) {
      return false;
    }

    if (filters.dateRange) {
      const objDate = new Date(obj.created_date);
      const now = new Date();
      let compareDate: Date;

      switch (filters.dateRange) {
        case 'month':
          compareDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
          break;
        case 'quarter':
          compareDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
          break;
        case 'year':
          compareDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
          break;
        default:
          return true; // Если неизвестный dateRange, не фильтруем
      }

      if (objDate < compareDate) return false;
    }

    return true;
  });
};
