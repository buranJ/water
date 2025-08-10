import { type FC } from 'react';
import { Card, Tag, Typography } from 'antd';

import { type MapObject } from 'api/GeoPartal.api';
import { getTypeIcon } from 'utils/mapHelpers';

const { Text } = Typography;

interface MapObjectCardProps {
  selectedObject: MapObject;
}

type ObjectStatus = 'active' | 'inactive' | 'archived';
type ObjectStage = 'draft' | 'approved' | 'completed';

const STAGE_LABELS: Record<ObjectStage, string> = {
  draft: 'Черновик',
  approved: 'Утвержден',
  completed: 'Завершен'
};

const STAGE_COLORS: Record<ObjectStage, string> = {
  draft: 'orange',
  approved: 'blue',
  completed: 'green'
};

const STATUS_LABELS: Record<ObjectStatus, string> = {
  active: 'Активный',
  inactive: 'Неактивный',
  archived: 'Архивный'
};

const STATUS_COLORS: Record<ObjectStatus, string> = {
  active: 'green',
  inactive: 'default',
  archived: 'orange'
};

const getStageLabel = (stage: ObjectStage): string => {
  return STAGE_LABELS[stage] || stage;
};

const getStageColor = (stage: ObjectStage): string => {
  return STAGE_COLORS[stage] || 'default';
};

const getStatusLabel = (status: ObjectStatus): string => {
  return STATUS_LABELS[status] || status;
};

const getStatusColor = (status: ObjectStatus): string => {
  return STATUS_COLORS[status] || 'default';
};

export const MapObjectCard: FC<MapObjectCardProps> = ({ selectedObject }) => {
  return (
    <Card
      title={
        <span>
          {getTypeIcon(selectedObject.type_ty)} Объект №{selectedObject.id}
        </span>
      }
      style={{ width: '100%', maxWidth: 400 }}
      size='small'
    >
      <div style={{ lineHeight: '1.8' }}>
        <div style={{ marginBottom: 8 }}>
          <Text strong>Заявка:</Text> {selectedObject.request_number}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>Название:</Text> {selectedObject.object_name}
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>Адрес:</Text>
          <br />
          <Text type='secondary' style={{ fontSize: '12px' }}>
            {selectedObject.address}
          </Text>
        </div>

        {selectedObject.type_ty && (
          <div style={{ marginBottom: 8 }}>
            <Text strong>Тип:</Text>{' '}
            <Tag color='blue'>
              {getTypeIcon(selectedObject.type_ty)} {selectedObject.type_ty}
            </Tag>
          </div>
        )}

        <div style={{ marginBottom: 8 }}>
          <Text strong>Статус:</Text> <Tag color={getStatusColor(selectedObject.status)}>{getStatusLabel(selectedObject.status)}</Tag>
        </div>

        <div style={{ marginBottom: 8 }}>
          <Text strong>Этап:</Text> <Tag color={getStageColor(selectedObject.stage)}>{getStageLabel(selectedObject.stage)}</Tag>
        </div>

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
          <Text type='secondary' style={{ fontSize: '12px' }}>
            Координаты: {selectedObject.x.toFixed(6)}, {selectedObject.y.toFixed(6)}
          </Text>
        </div>
      </div>
    </Card>
  );
};
