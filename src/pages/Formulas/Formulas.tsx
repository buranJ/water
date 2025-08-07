// src/pages/Formulas/Formulas.tsx

import React, { FC, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button, Col, Empty, Input, message, Row, Space, Spin, Typography } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { DashboardLayout } from 'components/DashboardLayout';
import { FormulaCard } from 'components/FormulaCard/FormulaCard';
import { IGetFormulasParams } from 'types/entities/';

import { useGetAllFormulasQuery, useUpdateFormulaTitleMutation } from 'api/Formula.api';

const { Title } = Typography;

interface FormulasProps {
  title: string;
}

interface ApiError {
  data?: Record<string, string | string[]>;
  message?: string;
}

export const Formulas: FC<FormulasProps> = ({ title }) => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  // Подготавливаем параметры для API
  const queryParams: IGetFormulasParams = {
    page: 1,
    page_size: 50,
    search: searchValue || undefined,
    ordering: '-created_at' // Сортировка по дате создания (новые сначала)
  };

  const { data: formulasResponse, isLoading, error } = useGetAllFormulasQuery(queryParams);
  const [updateFormulaTitle] = useUpdateFormulaTitleMutation();

  const formulas = formulasResponse?.results || [];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchValue(e.target.value);
  };

  const handleAddNew = (): void => {
    navigate('/dashboard/formulas/create');
  };

  const handleTitleChange = async (id: number, newTitle: string): Promise<void> => {
    try {
      await updateFormulaTitle({
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
    navigate(`/dashboard/formulas/${id}`);
  };

  if (error) {
    message.error('Ошибка загрузки формул');
  }

  return (
    <DashboardLayout title={title}>
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        {/* Заголовок и фильтры */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <Title
            level={2}
            style={{
              margin: 0,
              color: '#1d1d1f',
              fontSize: 28,
              fontWeight: 700
            }}
          >
            {title}
          </Title>

          <Space size={16}>
            <Input
              placeholder='Поиск по названию...'
              value={searchValue}
              onChange={handleSearchChange}
              prefix={<SearchOutlined style={{ color: '#8e8e93' }} />}
              style={{
                width: 300,
                borderRadius: 12,
                backgroundColor: '#f5f5f7',
                border: 'none'
              }}
              size='large'
            />

            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleAddNew}
              size='large'
              style={{
                borderRadius: 12,
                backgroundColor: '#007aff',
                borderColor: '#007aff',
                fontWeight: 500
              }}
            >
              Добавить формулу
            </Button>
          </Space>
        </div>

        {/* Счетчик результатов */}
        {!isLoading && formulasResponse && (
          <div>
            <Typography.Text
              style={{
                fontSize: 16,
                color: '#8e8e93',
                fontWeight: 500
              }}
            >
              Найдено формул: {formulasResponse.count}
            </Typography.Text>
          </div>
        )}

        {/* Контент */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size='large' />
            <div style={{ marginTop: 16 }}>
              <Typography.Text style={{ color: '#8e8e93' }}>Загрузка формул...</Typography.Text>
            </div>
          </div>
        ) : formulas.length > 0 ? (
          <Row gutter={[24, 24]}>
            {formulas.map((formula) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={4} key={formula.id}>
                <FormulaCard formula={formula} onTitleChange={handleTitleChange} onCardClick={handleCardClick} />
              </Col>
            ))}
          </Row>
        ) : (
          <Empty
            description={
              <div>
                <Typography.Text style={{ color: '#8e8e93', fontSize: 16 }}>
                  {searchValue ? 'По вашему запросу ничего не найдено' : 'Формулы не найдены'}
                </Typography.Text>
                <div style={{ marginTop: 8 }}>
                  <Typography.Text style={{ color: '#8e8e93', fontSize: 14 }}>
                    {searchValue ? 'Попробуйте изменить параметры поиска' : 'Начните с создания первой формулы'}
                  </Typography.Text>
                </div>
              </div>
            }
            style={{
              marginTop: '100px',
              padding: '50px 0'
            }}
          />
        )}
      </Space>
    </DashboardLayout>
  );
};
