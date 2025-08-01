import { FC } from 'react';
import { Card, Col, Row, Space, Tag, Typography } from 'antd';
import { EditableText } from 'components/EditableText/EditableText';
import { ObjectItem } from 'types/entities/objects';

const { Text, Title } = Typography;

interface ObjectDetailsProps {
  object: ObjectItem;
  onTitleChange?: (newTitle: string) => void;
}

export const ObjectDetails: FC<ObjectDetailsProps> = ({ object, onTitleChange }) => {
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getFullAddress = (): string => {
    return `г. Бишкек, ${object.address_street}${object.address_number ? `, ${object.address_number}` : ''}`;
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

  const formatCoordinates = (): string => {
    if (!object.latitude || !object.longitude) return '-';
    return `${object.latitude}° N, ${object.longitude}° E`;
  };

  return (
    <Card
      style={{
        borderRadius: 16,
        border: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}
      bodyStyle={{ padding: 32 }}
    >
      <Space direction='vertical' size={24} style={{ width: '100%' }}>
        {/* Заголовок */}
        <div>
          <EditableText
            initialValue={object.title}
            onChange={onTitleChange}
            renderDisplay={(value) => (
              <Title
                level={3}
                style={{
                  margin: 0,
                  color: '#1d1d1f',
                  fontWeight: 600
                }}
              >
                {value}
              </Title>
            )}
          />
        </div>

        {/* Основная информация */}
        <Row gutter={[32, 24]}>
          <Col xs={24} md={12}>
            <Space direction='vertical' size={16} style={{ width: '100%' }}>
              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Дата договор
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {formatDate(object.contract_date)}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Тип
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {object.type || 'Новостройка'}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Статус:
                </Text>
                <div style={{ marginTop: 8 }}>
                  <Tag
                    color={getStatusColor(object.status)}
                    style={{
                      borderRadius: 12,
                      border: 'none',
                      fontSize: 14,
                      padding: '4px 12px',
                      fontWeight: 500
                    }}
                  >
                    {object.status || 'Активен'}
                  </Tag>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Адрес
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {getFullAddress()}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Space direction='vertical' size={16} style={{ width: '100%' }}>
              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Кадастровый номер
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}
                  >
                    {object.kadastr_number || '-'}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Вид использования
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {object.usage_type || 'Жилой дом'}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Статус заявок и выданных ТУ
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600
                    }}
                  >
                    {object.tu_status || 'ТУ выдано, подключение в процессе'}
                  </Text>
                </div>
              </div>

              <div>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#8e8e93',
                    fontWeight: 500
                  }}
                >
                  Географические координаты
                </Text>
                <div style={{ marginTop: 4 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      color: '#1d1d1f',
                      fontWeight: 600,
                      fontFamily: 'monospace'
                    }}
                  >
                    {formatCoordinates()}
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};
