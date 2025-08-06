import { FC, useEffect, useRef, useState } from 'react';

import { MapObject } from 'api/GeoPartal.api';

// Типы для Yandex Maps API
type YMapState = {
  center: number[];
  zoom: number;
  controls?: string[];
};

type YMapOptions = {
  suppressMapOpenBlock?: boolean;
};

type PlacemarkProperties = {
  balloonContent: string;
  hintContent: string;
};

type PlacemarkOptions = {
  iconLayout: string;
  iconImageHref: string;
  iconImageSize: number[];
  iconImageOffset: number[];
};

type YMapInstance = {
  geoObjects: {
    removeAll(): void;
    add(geoObject: YGeoObjectCollection): void;
  };
  setCenter(center: number[], zoom?: number, options?: { duration: number }): void;
  setBounds(bounds: number[][], options?: { checkZoomRange: boolean; zoomMargin: number }): void;
  options: {
    set(options: YMapOptions): void;
  };
};

type YPlacemarkInstance = {
  events: {
    add(eventName: string, handler: () => void): void;
  };
};

type YGeoObjectCollection = {
  add(geoObject: YPlacemarkInstance): void;
  getBounds(): number[][] | null;
};

declare global {
  interface Window {
    ymaps: {
      Map: new (container: HTMLElement, state: YMapState, options?: YMapOptions) => YMapInstance;
      Placemark: new (coordinates: number[], properties: PlacemarkProperties, options?: PlacemarkOptions) => YPlacemarkInstance;
      GeoObjectCollection: new () => YGeoObjectCollection;
      ready(callback: () => void): void;
    };
  }
}

interface YandexMapProps {
  objects: MapObject[];
  onSelect: (obj: MapObject) => void;
}

export const YandexMap: FC<YandexMapProps> = ({ objects, onSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<YMapInstance | null>(null);
  const scriptLoadedRef = useRef(false);
  const [mapReady, setMapReady] = useState(false);

  const getIconColor = (obj: MapObject): string => {
    if (obj.status === 'inactive') return '#d9d9d9';

    switch (obj.type) {
      case 'water':
        return '#1890ff';
      case 'sewer':
        return '#722ed1';
      case 'gas':
        return '#fa8c16';
      case 'electric':
        return '#fadb14';
      default:
        return '#52c41a';
    }
  };

  const getStageOpacity = (stage: string): string => {
    switch (stage) {
      case 'draft':
        return '0.6';
      case 'approved':
        return '0.8';
      case 'completed':
        return '1.0';
      default:
        return '0.6';
    }
  };

  const getTypeIcon = (type: string): string => {
    const icons = {
      water: '💧',
      sewer: '🚰',
      gas: '🔥',
      electric: '⚡',
      other: '📍'
    };
    return icons[type as keyof typeof icons] || '📍';
  };

  const renderPlacemarks = (data: MapObject[]): void => {
    if (!mapInstanceRef.current || !window.ymaps) return;

    const map = mapInstanceRef.current;
    map.geoObjects.removeAll();

    const collection = new window.ymaps.GeoObjectCollection();

    data.forEach((obj) => {
      const getTypeSymbol = (type: string): string => {
        switch (type) {
          case 'water':
            return 'В';
          case 'sewer':
            return 'К';
          case 'gas':
            return 'Г';
          case 'electric':
            return 'Э';
          default:
            return '?';
        }
      };

      const svgContent = `
        <svg width="32" height="40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="2" stdDeviation="2" flood-opacity="0.3"/>
            </filter>
          </defs>
          <path d="M16 0C16 0 0 16 0 24C0 32 7.163 40 16 40C24.837 40 32 32 32 24C32 16 16 0 16 0Z"
                fill="${getIconColor(obj)}"
                stroke="white" 
                stroke-width="2"
                opacity="${getStageOpacity(obj.stage)}"
                filter="url(#shadow)"/>
          <circle cx="16" cy="20" r="8" fill="white" opacity="0.9"/>
          <text x="16" y="25" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${getIconColor(obj)}">
            ${getTypeSymbol(obj.type)}
          </text>
        </svg>
      `;

      const encodedSvg = btoa(unescape(encodeURIComponent(svgContent)));

      const placemark = new window.ymaps.Placemark(
        [obj.y, obj.x],
        {
          balloonContent: `
            <div style="padding: 10px;">
              <strong>${getTypeIcon(obj.type)} ${obj.object_name}</strong><br/>
              Заявка: ${obj.request_number}<br/>
              Адрес: ${obj.address}<br/>
              Статус: ${obj.status === 'active' ? 'Активный' : 'Неактивный'}<br/>
              Этап: ${
                {
                  draft: 'Черновик',
                  approved: 'Утвержден',
                  completed: 'Завершен'
                }[obj.stage]
              }<br/>
              Дата создания: ${new Date(obj.created_date).toLocaleDateString('ru-RU')}
            </div>
          `,
          hintContent: obj.object_name
        },
        {
          iconLayout: 'default#image',
          iconImageHref: `data:image/svg+xml;base64,${encodedSvg}`,
          iconImageSize: [32, 40],
          iconImageOffset: [-16, -40]
        }
      );

      placemark.events.add('click', () => {
        onSelect(obj);
        map.setCenter([obj.y, obj.x], 15, { duration: 300 });
      });

      collection.add(placemark);
    });

    map.geoObjects.add(collection);

    if (data.length) {
      const bounds = collection.getBounds();
      if (bounds) map.setBounds(bounds, { checkZoomRange: true, zoomMargin: 50 });
    }
  };

  const initMap = (): void => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.ymaps.Map(mapRef.current, {
      center: [42.875, 74.585],
      zoom: 12,
      controls: ['zoomControl', 'fullscreenControl']
    });

    map.options.set({ suppressMapOpenBlock: true });
    mapInstanceRef.current = map;
    setMapReady(true);
  };

  useEffect(() => {
    if (!window.ymaps && !scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=0bfec104-5c26-4035-8b22-4c4d55448777';
      script.onload = () => window.ymaps.ready(initMap);
      document.head.appendChild(script);
    } else if (window.ymaps) {
      window.ymaps.ready(initMap);
    }
  }, []);

  useEffect(() => {
    if (mapReady) {
      renderPlacemarks(objects);
    }
  }, [mapReady, objects]);

  return (
    <div
      ref={mapRef}
      style={{
        width: '100%',
        height: '500px',
        border: '1px solid #ccc',
        borderRadius: 8
      }}
    />
  );
};
