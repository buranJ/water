import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Col, Empty, message, Row, Spin } from 'antd';
import { DashboardLayout } from 'components/DashboardLayout';
import { ObjectCard } from 'components/ObjectCard/ObjectCard';
import { ObjectsFilters } from 'components/ObjectsFilters';
import { ObjectFilters, ObjectItem } from 'types/entities/objects';

import { useGetAllObjectsQuery, useUpdateObjectTitleMutation } from 'api/Object.api';

interface ObjectsProps {
  title: string;
}

export const Objects: FC<ObjectsProps> = ({ title }) => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ObjectFilters>({
    search: '',
    status: null,
    date: null
  });
  const [filteredObjects, setFilteredObjects] = useState<ObjectItem[]>([]);

  const { data: objects, isLoading, error } = useGetAllObjectsQuery({ page: 1, page_size: 16 });
  const [updateObjectTitle] = useUpdateObjectTitleMutation();

  // Применение фильтров
  useEffect(() => {
    let filtered = objects?.results || [];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered?.filter(
        (obj) =>
          obj.title.toLowerCase().includes(searchLower) ||
          obj.address_street.toLowerCase().includes(searchLower) ||
          obj.address_number.toLowerCase().includes(searchLower) ||
          obj.kadastr_number.toLowerCase().includes(searchLower)
      );
    }

    if (filters.status) {
      filtered = filtered?.filter((obj) => obj.status === filters.status);
    }

    if (filters.date) {
      const now = new Date();
      filtered = filtered?.filter((obj) => {
        const objDate = new Date(obj.created_at);
        let compareDate: Date;

        switch (filters.date) {
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

        return objDate >= compareDate;
      });
    }
    setFilteredObjects(filtered);
  }, [objects, filters]);

  const handleFilterChange = (filterType: keyof ObjectFilters, value: string | null): void => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const handleSearchChange = (value: string): void => {
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleAddNew = (): void => {
    navigate('/dashboard/objects/add');
  };

  const handleTitleChange = async (id: number, newTitle: string): Promise<void> => {
    try {
      await updateObjectTitle({
        id,
        title: newTitle
      }).unwrap();
      message.success('Название обновлено');
    } catch (error) {
      message.error('Ошибка при обновлении названия');
      console.error('Update title error:', error);
    }
  };

  const handleCardClick = (id: number): void => {
    navigate(`/dashboard/objects/${id}`);
  };

  if (error) {
    message.error('Ошибка загрузки объектов');
  }

  return (
    <DashboardLayout title={title}>
      <ObjectsFilters filters={filters} onSearchChange={handleSearchChange} onFilterChange={handleFilterChange} onAddNew={handleAddNew} />

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Spin size='large' />
        </div>
      ) : filteredObjects.length > 0 ? (
        <Row gutter={[16, 0]}>
          {filteredObjects.map((object) => (
            <Col xs={24} sm={12} md={8} lg={6} xl={6} key={object.id}>
              <ObjectCard object={object} onTitleChange={handleTitleChange} onCardClick={handleCardClick} />
            </Col>
          ))}
        </Row>
      ) : (
        <Empty description='Объекты не найдены' style={{ marginTop: '50px' }} />
      )}
    </DashboardLayout>
  );
};
