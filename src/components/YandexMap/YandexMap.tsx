import { type FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type MapObject } from 'api/GeoPartal.api';

interface YMapState {
  center: number[];
  zoom: number;
  controls?: string[];
}

interface YMapOptions {
  suppressMapOpenBlock?: boolean;
}

interface PlacemarkProperties {
  balloonContent: string;
  hintContent: string;
}

interface PlacemarkOptions {
  iconLayout: string;
  iconImageHref: string;
  iconImageSize: number[];
  iconImageOffset: number[];
}

interface YGeoObjectCollection {
  add: (geoObject: YPlacemarkInstance) => void;
  getBounds: () => number[][] | null;
}

interface YPlacemarkInstance {
  events: {
    add: (eventName: string, handler: () => void) => void;
  };
}

interface YMapInstance {
  geoObjects: {
    removeAll: () => void;
    add: (geoObject: YGeoObjectCollection) => void;
  };
  setCenter: (center: number[], zoom?: number, options?: { duration: number }) => void;
  setBounds: (bounds: number[][], options?: { checkZoomRange: boolean; zoomMargin: number[] }) => void;
  options: {
    set: (options: YMapOptions) => void;
  };
}

interface YandexMapsAPI {
  Map: new (container: HTMLElement, state: YMapState, options?: YMapOptions) => YMapInstance;
  Placemark: new (coordinates: number[], properties: PlacemarkProperties, options?: PlacemarkOptions) => YPlacemarkInstance;
  GeoObjectCollection: new () => YGeoObjectCollection;
  ready: (callback: () => void) => void;
}

declare global {
  interface Window {
    ymaps?: YandexMapsAPI;
  }
}

interface YandexMapProps {
  objects: MapObject[];
  onSelect: (obj: MapObject) => void;
}

type ObjectStatus = 'active' | 'inactive' | 'archived';
type ObjectStage = 'draft' | 'approved' | 'completed';

const BISHKEK_CENTER: [number, number] = [42.875, 74.585];
const DEFAULT_ZOOM = 11;
const FOCUSED_ZOOM = 15;
const MAP_HEIGHT = 500;

const STATUS_COLORS: Record<ObjectStatus, string> = {
  active: '#52c41a',
  inactive: '#d9d9d9',
  archived: '#fa8c16'
};

const STAGE_OPACITY: Record<ObjectStage, string> = {
  draft: '0.7',
  approved: '0.9',
  completed: '1.0'
};

const getIconColor = (obj: MapObject): string => {
  if (obj.status === 'inactive' || obj.status === 'archived') {
    return STATUS_COLORS.inactive;
  }
  return STATUS_COLORS.active;
};

const createSvgIcon = (obj: MapObject): string => {
  const color = getIconColor(obj);
  const opacity = STAGE_OPACITY[obj.stage];

  return `
    <svg width="28" height="35" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow-${obj.id}" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.5" flood-opacity="0.4"/>
        </filter>
      </defs>
      <path d="M14 0C14 0 0 14 0 21C0 28 6.268 35 14 35C21.732 35 28 28 28 21C28 14 14 0 14 0Z"
            fill="${color}"
            stroke="white" 
            stroke-width="1.5"
            opacity="${opacity}"
            filter="url(#shadow-${obj.id})"/>
      <circle cx="14" cy="17" r="6" fill="white" opacity="0.95"/>
      <text x="14" y="21" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${color}">
        ${obj.id}
      </text>
    </svg>
  `;
};

export const YandexMap: FC<YandexMapProps> = ({ objects, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YMapInstance | null>(null);
  const scriptLoadedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);
  const { t } = useTranslation();

  const getStatusLabel = (status: ObjectStatus): string => {
    switch (status) {
      case 'active':
        return t('tuDetails.status.active');
      case 'inactive':
        return t('tuDetails.status.inactive');
      case 'archived':
        return t('tuDetails.status.archived');
      default:
        return '';
    }
  };

  const getStageLabel = (stage: ObjectStage): string => {
    switch (stage) {
      case 'draft':
        return t('tuDetails.stage.draft');
      case 'approved':
        return t('tuDetails.stage.approved');
      case 'completed':
        return t('tuDetails.stage.done');
      default:
        return '';
    }
  };

  const createBalloonContent = (obj: MapObject): string => {
    const statusColor = obj.status === 'active' ? STATUS_COLORS.active : obj.status === 'archived' ? STATUS_COLORS.archived : '#ff4d4f';

    return `
      <div style="padding: 12px; max-width: 300px;">
        <strong style="color: #1890ff; font-size: 14px;">📍 ${obj.object_name}</strong><br/>
        <div style="margin: 8px 0; padding: 8px; background: #f5f5f5; border-radius: 4px;">
          <strong>${t('yandexMap.labels.request')}:</strong> ${obj.request_number}<br/>
          <strong>${t('yandexMap.labels.address')}:</strong> ${obj.address}<br/>
          <strong>${t('yandexMap.labels.status')}:</strong> <span style="color: ${statusColor}">${getStatusLabel(obj.status)}</span><br/>
          <strong>${t('yandexMap.labels.stage')}:</strong> ${getStageLabel(obj.stage)}<br/>
          <strong>${t('common.coordinates')}:</strong> ${obj.x.toFixed(6)}, ${obj.y.toFixed(6)}
        </div>
      </div>
    `;
  };

  const renderPlacemarks = (data: MapObject[]): void => {
    const ymaps = window.ymaps;
    const mapInstance = mapInstanceRef.current;

    if (!mapInstance || !ymaps || data.length === 0) {
      return;
    }

    console.info('Отрисовка меток для объектов:', data.length);

    mapInstance.geoObjects.removeAll();

    const collection = new ymaps.GeoObjectCollection();

    data.forEach((obj, index) => {
      console.info(`Метка ${index + 1}:`, {
        id: obj.id,
        name: obj.object_name,
        coordinates: [obj.x, obj.y],
        originalCoords: { x: obj.x, y: obj.y }
      });

      const svgContent = createSvgIcon(obj);
      const encodedSvg = btoa(unescape(encodeURIComponent(svgContent)));

      const placemark = new ymaps.Placemark(
        [obj.x, obj.y],
        {
          balloonContent: createBalloonContent(obj),
          hintContent: `${obj.object_name} (${obj.request_number})`
        },
        {
          iconLayout: 'default#image',
          iconImageHref: `data:image/svg+xml;base64,${encodedSvg}`,
          iconImageSize: [28, 35],
          iconImageOffset: [-14, -35]
        }
      );

      placemark.events.add('click', () => {
        onSelect(obj);
        mapInstance.setCenter([obj.x, obj.y], FOCUSED_ZOOM, { duration: 300 });
      });

      collection.add(placemark);
    });

    mapInstance.geoObjects.add(collection);

    try {
      const bounds = collection.getBounds();
      if (bounds && bounds.length === 2) {
        console.info('Установка границ карты:', bounds);
        mapInstance.setBounds(bounds, {
          checkZoomRange: true,
          zoomMargin: [20, 20, 20, 20]
        });
      } else {
        const firstObj = data[0];
        if (firstObj) {
          mapInstance.setCenter([firstObj.x, firstObj.y], 12);
        }
      }
    } catch (error) {
      console.error('Ошибка при установке границ карты:', error);
      mapInstance.setCenter(BISHKEK_CENTER, DEFAULT_ZOOM);
    }
  };

  const initMap = (): void => {
    const mapContainer = mapRef.current;
    const ymaps = window.ymaps;

    if (!mapContainer || mapInstanceRef.current || !ymaps) {
      return;
    }

    console.info('Инициализация карты...');

    const map = new ymaps.Map(mapContainer, {
      center: BISHKEK_CENTER,
      zoom: DEFAULT_ZOOM,
      controls: ['zoomControl', 'fullscreenControl', 'typeSelector']
    });

    map.options.set({ suppressMapOpenBlock: true });
    mapInstanceRef.current = map;
    setMapReady(true);

    console.info('Карта инициализирована');
  };

  const loadYandexMapsScript = (): void => {
    if (scriptLoadedRef.current) {
      return;
    }

    scriptLoadedRef.current = true;
    console.info('Загрузка Yandex Maps API...');

    const script = document.createElement('script');
    script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=0bfec104-5c26-4035-8b22-4c4d55448777';
    script.onload = () => {
      console.info('Yandex Maps API загружен');
      window.ymaps?.ready(initMap);
    };
    script.onerror = () => {
      console.error('Ошибка загрузки Yandex Maps API');
    };
    document.head.appendChild(script);
  };

  useEffect(() => {
    if (!window.ymaps) {
      loadYandexMapsScript();
    } else {
      window.ymaps.ready(initMap);
    }
  }, []);

  useEffect(() => {
    if (mapReady && objects.length > 0) {
      console.info('Отрисовка объектов на карте:', objects);
      renderPlacemarks(objects);
    }
  }, [mapReady, objects, onSelect]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: `${MAP_HEIGHT}px`,
        border: '1px solid #d9d9d9',
        borderRadius: 8,
        overflow: 'hidden'
      }}
    />
  );
};
