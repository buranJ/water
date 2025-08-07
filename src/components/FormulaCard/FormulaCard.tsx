import { FC } from 'react';
import { Card, Tag, Typography } from 'antd';
import { EditableText } from 'components/EditableText/EditableText';
import { FormulaItem } from 'types/entities';

const { Text, Link } = Typography;

interface FormulaCardProps {
  formula: FormulaItem;
  onTitleChange?: (id: number, newTitle: string) => void;
  onCardClick?: (id: number) => void;
}

export const FormulaCard: FC<FormulaCardProps> = ({ formula, onTitleChange, onCardClick }) => {
  const handleTitleChange = (newTitle: string): void => {
    if (onTitleChange) {
      onTitleChange(formula.id, newTitle);
    }
  };

  const handleCardClick = (): void => {
    if (onCardClick) {
      onCardClick(formula.id);
    }
  };

  const getKoefficientColor = (koefficent: number): string => {
    if (koefficent >= 1) return 'success';
    if (koefficent >= 0.5) return 'processing';
    return 'warning';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const formatKoefficent = (value: number): string => {
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        border: '1px solid #f0f0f0',
        marginBottom: 16,
        cursor: 'pointer'
      }}
      styles={{
        body: { padding: 20 }
      }}
      onClick={handleCardClick}
    >
      <div style={{ marginBottom: 12 }}>
        <EditableText
          initialValue={formula.title}
          onChange={handleTitleChange}
          renderDisplay={(value) => (
            <Typography.Title
              level={5}
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 600,
                color: '#1d1d1f'
              }}
            >
              {value}
            </Typography.Title>
          )}
        />
        <div style={{ float: 'right' }}>
          <Link
            style={{
              color: '#007aff',
              textDecoration: 'none',
              fontSize: 14
            }}
            onClick={(e) => e.stopPropagation()}
          >
            Подробнее
          </Link>
        </div>
        <div style={{ clear: 'both' }} />
      </div>

      <div style={{ marginBottom: 12 }}>
        <Text
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: '#1d1d1f',
            display: 'block'
          }}
        >
          Коэффициент: {formatKoefficent(formula.koefficent)}
        </Text>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text
          type='secondary'
          style={{
            fontSize: 14,
            color: '#8e8e93'
          }}
        >
          Дата создания: {formatDate(formula.created_at)}
        </Text>
      </div>

      <div style={{ marginBottom: 8 }}>
        <Text
          type='secondary'
          style={{
            fontSize: 14,
            color: '#8e8e93'
          }}
        >
          ID формулы: #{formula.id}
        </Text>
      </div>

      <div style={{ marginBottom: 0 }}>
        <Text
          type='secondary'
          style={{
            fontSize: 14,
            color: '#8e8e93',
            marginRight: 8
          }}
        >
          Значение:
        </Text>
        <Tag
          color={getKoefficientColor(formula.koefficent)}
          style={{
            borderRadius: 12,
            border: 'none',
            fontSize: 12,
            fontWeight: 500
          }}
        >
          {formula.koefficent >= 1 ? 'Высокий' : formula.koefficent >= 0.5 ? 'Средний' : 'Низкий'}
        </Tag>
      </div>
    </Card>
  );
};
