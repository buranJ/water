import { FC } from 'react';
import { Card, Tag, Typography } from 'antd';
import { EditableText } from 'components/EditableText/EditableText';
import { ObjectItem } from 'types/entities/objects';

const { Text, Link } = Typography;

interface ObjectCardProps {
  object: ObjectItem;
  onTitleChange?: (id: number, newTitle: string) => void;
  onCardClick?: (id: number) => void;
}

export const ObjectCard: FC<ObjectCardProps> = ({ object, onTitleChange, onCardClick }) => {
  const handleTitleChange = (newTitle: string): void => {
    if (onTitleChange) {
      onTitleChange(object.id, newTitle);
    }
  };

  const handleCardClick = (): void => {
    if (onCardClick) {
      onCardClick(object.id);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'активен':
        return 'success';
      case 'inactive':
      case 'неактивен':
        return 'default';
      case 'pending':
      case 'в ожидании':
        return 'processing';
      case 'rejected':
      case 'отклонен':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getFullAddress = (): string => {
    return `${object.address_street}${object.address_number ? `, ${object.address_number}` : ''}`;
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
      bodyStyle={{ padding: 20 }}
      onClick={handleCardClick}
    >
      <div style={{ marginBottom: 12 }}>
        <EditableText
          initialValue={object.title}
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

      <div style={{ marginBottom: 8 }}>
        <Text
          type='secondary'
          style={{
            fontSize: 14,
            color: '#8e8e93'
          }}
        >
          Дата создания: {formatDate(object.created_at)}
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
          Адрес: {getFullAddress()}
        </Text>
      </div>

      {object.kadastr_number && (
        <div style={{ marginBottom: 8 }}>
          <Text
            type='secondary'
            style={{
              fontSize: 14,
              color: '#8e8e93'
            }}
          >
            Кадастр: {object.kadastr_number}
          </Text>
        </div>
      )}

      <div style={{ marginBottom: 0 }}>
        <Text
          type='secondary'
          style={{
            fontSize: 14,
            color: '#8e8e93',
            marginRight: 8
          }}
        >
          Статус:
        </Text>
        <Tag
          color={getStatusColor(object.status)}
          style={{
            borderRadius: 12,
            border: 'none',
            fontSize: 12
          }}
        >
          {object.status}
        </Tag>
      </div>
    </Card>
  );
};
