import { Component, ErrorInfo, FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Input, message, Row, Space, Typography } from 'antd';
import { ClearOutlined, EnvironmentOutlined, SaveOutlined } from '@ant-design/icons';
import type { MapEvent, YMap, YPlacemark } from 'types/entities/yandexMaps';

const { Title, Text } = Typography;

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class MapErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('MapErrorBoundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          message='Ошибка карты'
          description='Произошла ошибка при работе с картой'
          type='error'
          showIcon
          action={
            <Button size='small' onClick={this.handleReset}>
              Попробовать снова
            </Button>
          }
        />
      );
    }
    return this.props.children;
  }
}
interface Coordinates {
  latitude: number;
  longitude: number;
  address?: string;
  description?: string;
  timestamp?: string;
}

interface MapPointSelectorProps {
  title?: string;
  onCoordinatesSelect?: (coordinates: Coordinates) => void;
  onSaveToBackend?: (coordinates: Coordinates) => Promise<void>;
}

const BISHKEK_CENTER: [number, number] = [42.8746, 74.5698];

const MapPointSelectorCore: FC<MapPointSelectorProps> = ({ title = 'Выбор точки на карте', onCoordinatesSelect, onSaveToBackend }) => {
  const [selectedCoordinates, setSelectedCoordinates] = useState<Coordinates | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mapRef = useRef<YMap | null>(null);
  const placemarkRef = useRef<YPlacemark | null>(null);
  const scriptLoadedRef = useRef(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Создание/обновление метки на карте
  const updatePlacemark = useCallback((coords: number[], address?: string) => {
    if (!mapRef.current || !window.ymaps) return;

    const map = mapRef.current;
    const ymaps = window.ymaps;

    try {
      if (placemarkRef.current) {
        map.geoObjects.remove(placemarkRef.current);
        placemarkRef.current = null;
      }

      const placemark = new ymaps.Placemark(
        coords,
        {
          balloonContent: address
            ? `${address}<br>Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
            : `Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`,
          hintContent: 'Перетащите для изменения позиции'
        },
        {
          preset: 'islands#redDotIcon',
          draggable: true
        }
      );

      placemark.events.add('dragend', () => {
        if (!placemarkRef.current) return;

        try {
          const newCoords = placemarkRef.current.geometry.getCoordinates();
          updateCoordinates(newCoords[0], newCoords[1]);
          getAddressByCoords(newCoords);
        } catch (error) {
          console.warn('Ошибка при перетаскивании:', error);
        }
      });

      map.geoObjects.add(placemark);
      placemarkRef.current = placemark;
    } catch (error) {
      console.error('Ошибка создания метки:', error);
    }
  }, []);
  const getAddressByCoords = useCallback(async (coords: number[]) => {
    if (!window.ymaps) return;

    try {
      const result = await window.ymaps.geocode(coords);
      const firstGeoObject = result.geoObjects.get(0);
      const address = firstGeoObject?.getAddressLine?.();

      if (address) {
        setSelectedCoordinates((prev) => (prev ? { ...prev, address } : null));

        if (placemarkRef.current) {
          placemarkRef.current.properties.set(
            'balloonContent',
            `${address}<br>Координаты: ${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}`
          );
        }
      }
    } catch (error) {
      console.warn('Ошибка геокодирования:', error);
    }
  }, []);

  const updateCoordinates = useCallback(
    (latitude: number, longitude: number) => {
      const coordinates: Coordinates = {
        latitude: parseFloat(latitude.toFixed(6)),
        longitude: parseFloat(longitude.toFixed(6))
      };
      setSelectedCoordinates(coordinates);

      if (onCoordinatesSelect) {
        onCoordinatesSelect(coordinates);
      }
    },
    [onCoordinatesSelect]
  );
  const initializeMap = useCallback(() => {
    if (!window.ymaps) return;

    window.ymaps.ready(() => {
      if (!mapContainerRef.current || mapRef.current || !window.ymaps) return;

      try {
        const map = new window.ymaps.Map(mapContainerRef.current, {
          center: BISHKEK_CENTER,
          zoom: 11,
          controls: ['zoomControl', 'fullscreenControl']
        });

        map.events.add('click', (e: MapEvent) => {
          try {
            const coords = e.get('coords');
            updateCoordinates(coords[0], coords[1]);
            updatePlacemark(coords);
            getAddressByCoords(coords);
          } catch (error) {
            console.error('Ошибка обработки клика:', error);
          }
        });

        mapRef.current = map;
        setIsMapLoaded(true);
        console.log('Карта инициализирована');
      } catch (error) {
        console.error('Ошибка инициализации карты:', error);
        message.error('Ошибка инициализации карты');
      }
    });
  }, [updateCoordinates, updatePlacemark, getAddressByCoords]);

  // Загрузка скрипта
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const existingScript = document.querySelector('script[src*="api-maps.yandex.ru"]');

    if (!window.ymaps && !existingScript) {
      scriptLoadedRef.current = true;
      setIsLoading(true);

      const script = document.createElement('script');
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=0bfec104-5c26-4035-8b22-4c4d55448777';

      script.onload = () => {
        setIsLoading(false);
        initializeMap();
      };

      script.onerror = () => {
        setIsLoading(false);
        message.error('Не удалось загрузить карту');
      };

      document.head.appendChild(script);
    } else if (window.ymaps) {
      initializeMap();
    }

    return () => {
      // Безопасная очистка
      mapRef.current = null;
      placemarkRef.current = null;
    };
  }, [initializeMap]);

  // Сохранение точки
  const handleSavePoint = async () => {
    if (!selectedCoordinates) {
      message.warning('Сначала выберите точку на карте');
      return;
    }

    const pointData: Coordinates = {
      ...selectedCoordinates,
      description: description.trim() || undefined,
      timestamp: new Date().toISOString()
    };

    setIsSaving(true);

    try {
      if (onSaveToBackend) {
        await onSaveToBackend(pointData);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log('Готово для отправки:', pointData);
      }

      if (onCoordinatesSelect) {
        onCoordinatesSelect(pointData);
      }

      message.success('Координаты сохранены');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      message.error('Ошибка при сохранении');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedCoordinates(null);
    setDescription('');

    if (mapRef.current && placemarkRef.current) {
      try {
        mapRef.current.geoObjects.remove(placemarkRef.current);
      } catch (error) {
        console.warn('Ошибка удаления метки:', error);
      }
      placemarkRef.current = null;
    }

    message.info('Выбор очищен');
  };

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ marginBottom: '20px' }}>
        <EnvironmentOutlined style={{ marginRight: '8px' }} />
        {title}
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title='Кликните по карте для выбора координат' style={{ height: '500px' }} loading={isLoading}>
            <div
              ref={mapContainerRef}
              style={{
                width: '100%',
                height: '420px',
                backgroundColor: '#f5f5f5',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isLoading && <Text>Загрузка карты...</Text>}
              {!isLoading && !isMapLoaded && <Text type='secondary'>Инициализация...</Text>}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title='Выбранные координаты'>
            <Space direction='vertical' style={{ width: '100%' }} size='middle'>
              {selectedCoordinates ? (
                <>
                  <div>
                    <Text strong>Широта:</Text>
                    <br />
                    <Text code>{selectedCoordinates.latitude}</Text>
                  </div>
                  <div>
                    <Text strong>Долгота:</Text>
                    <br />
                    <Text code>{selectedCoordinates.longitude}</Text>
                  </div>
                  {selectedCoordinates.address && (
                    <div>
                      <Text strong>Адрес:</Text>
                      <br />
                      <Text>{selectedCoordinates.address}</Text>
                    </div>
                  )}
                  <div>
                    <Text strong>Описание:</Text>
                    <Input.TextArea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder='Добавьте описание (опционально)'
                      rows={3}
                      style={{ marginTop: '8px' }}
                    />
                  </div>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button type='primary' icon={<SaveOutlined />} onClick={handleSavePoint} loading={isSaving}>
                      Сохранить
                    </Button>
                    <Button danger icon={<ClearOutlined />} onClick={handleClearSelection} disabled={isSaving}>
                      Очистить
                    </Button>
                  </Space>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <EnvironmentOutlined style={{ fontSize: '48px', color: '#d9d9d9' }} />
                  <div style={{ marginTop: '16px' }}>
                    <Text type='secondary'>{isLoading ? 'Загрузка карты...' : 'Кликните по карте для выбора координат'}</Text>
                  </div>
                </div>
              )}
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export const MapPointSelector: FC<MapPointSelectorProps> = (props) => {
  return (
    <MapErrorBoundary>
      <MapPointSelectorCore {...props} />
    </MapErrorBoundary>
  );
};

export default MapPointSelector;
