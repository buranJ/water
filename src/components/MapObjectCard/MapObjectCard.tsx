import { FC } from 'react';
import { Card, Tag, Typography } from 'antd';

import { MapObject } from 'api/GeoPartal.api';
import { getTypeIcon } from 'utils/mapHelpers';

const { Text } = Typography;

interface MapObjectCardProps {
  selectedObject: MapObject;
}

const typeItems = [
  { label: '💧 Водопровод', key: 'water' },
  { label: '🚰 Канализация', key: 'sewer' },
  { label: '🔥 Газопровод', key: 'gas' },
  { label: '⚡ Электросети', key: 'electric' },
  { label: '📍 Другое', key: 'other' }
];

export const MapObjectCard: FC<MapObjectCardProps> = ({ selectedObject }) => {
  const getStageLabel = (stage: string): string => {
    const stageLabels = {
      draft: 'Черновик',
      approved: 'Утвержден',
      completed: 'Завершен'
    };
    return stageLabels[stage as keyof typeof stageLabels] || stage;
  };

  const getStageColor = (stage: string): string => {
    const stageColors = {
      draft: 'orange',
      approved: 'blue',
      completed: 'green'
    };
    return stageColors[stage as keyof typeof stageColors] || 'default';
  };

  return (
    <Card title={`${getTypeIcon(selectedObject.type)} Объект №${selectedObject.id}`} style={{ width: 350 }}>
      <div style={{ lineHeight: '1.8' }}>
        <div>
          <Text strong>Заявка:</Text> {selectedObject.request_number}
        </div>
        <div>
          <Text strong>Название:</Text> {selectedObject.object_name}
        </div>
        <div>
          <Text strong>Адрес:</Text> <Text type='secondary'>{selectedObject.address}</Text>
        </div>
        <div>
          <Text strong>Тип:</Text>{' '}
          <Tag color='blue'>{typeItems.find((item) => item.key === selectedObject.type)?.label || selectedObject.type}</Tag>
        </div>
        <div>
          <Text strong>Статус:</Text>{' '}
          <Tag color={selectedObject.status === 'active' ? 'green' : 'default'}>
            {selectedObject.status === 'active' ? 'Активный' : 'Неактивный'}
          </Tag>
        </div>
        <div>
          <Text strong>Этап:</Text> <Tag color={getStageColor(selectedObject.stage)}>{getStageLabel(selectedObject.stage)}</Tag>
        </div>
        <div>
          <Text strong>Дата создания:</Text>{' '}
          <Text type='secondary'>{new Date(selectedObject.created_date).toLocaleDateString('ru-RU')}</Text>
        </div>
        <div style={{ marginTop: 12 }}>
          <Text type='secondary' style={{ fontSize: 12 }}>
            Координаты: {selectedObject.y}, {selectedObject.x}
          </Text>
        </div>
      </div>
    </Card>
  );
};
