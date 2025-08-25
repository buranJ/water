import { FC, useState } from 'react';
import type { UploadFile, UploadProps } from 'antd';
import { Alert, Button, Card, Col, Divider, List, message, Row, Space, Spin, Steps, Table, Tag, Typography, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  UploadOutlined
} from '@ant-design/icons';

import {
  downloadErrorReport,
  formatFileSize,
  type ImportTyResponse,
  useImportTyFromExcelMutation,
  validateExcelFile
} from 'api/TyImport.api';

const { Title, Text, Paragraph } = Typography;

interface ExcelColumn {
  key: string;
  title: string;
  description: string;
  required: boolean;
  example: string;
}
const EXCEL_COLUMNS: ExcelColumn[] = [
  {
    key: 'tu_number',
    title: '№ТУ',
    description: 'Номер технического условия',
    required: true,
    example: 'ТУ-001-2024'
  },
  {
    key: 'registration_date',
    title: 'Дата регистр.',
    description: 'Дата регистрации',
    required: true,
    example: '15.01.2024'
  },
  {
    key: 'customer',
    title: 'Заказчик',
    description: 'Имя заказчика',
    required: true,
    example: 'ООО "Строй Компани"'
  },
  {
    key: 'address',
    title: 'Адрес',
    description: 'Адрес объекта',
    required: true,
    example: 'г. Бишкек, ул. Манаса, 45'
  },
  {
    key: 'object_name',
    title: 'Наименование объекта',
    description: 'Описание объекта',
    required: true,
    example: 'Жилой дом'
  },
  {
    key: 'water_quantity',
    title: 'Количество воды',
    description: 'Объем воды',
    required: true,
    example: '15.5'
  },
  {
    key: 'sewage_quantity',
    title: 'Количество стоков',
    description: 'Объем стоков',
    required: true,
    example: '12.0'
  },
  {
    key: 'contract_info',
    title: '№ и дата договора на оплату за ТУ и разреш.',
    description: 'Номер и дата договора',
    required: false,
    example: 'Договор №123 от 10.01.2024'
  },
  {
    key: 'invoice_number',
    title: '№счета на оплату',
    description: 'Номер счета',
    required: false,
    example: 'СЧ-456'
  },
  {
    key: 'payment_amount',
    title: 'Сумма оплаты за ТУ и разреш.',
    description: 'Сумма к оплате',
    required: false,
    example: '25000'
  },
  {
    key: 'payment_date',
    title: 'Дата оплаты',
    description: 'Дата оплаты',
    required: false,
    example: '20.01.2024'
  }
];

export const TyImportPage: FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [uploadedFile, setUploadedFile] = useState<UploadFile | null>(null);
  const [importResult, setImportResult] = useState<ImportTyResponse | null>(null);

  const [importTyFromExcel, { isLoading: isImporting }] = useImportTyFromExcelMutation();
  const errorColumns: ColumnsType<string> = [
    {
      title: '№',
      key: 'index',
      width: 60,
      render: (_: string, __: string, index: number) => <Tag color='orange'>#{index + 1}</Tag>
    },
    {
      title: 'Описание ошибки',
      key: 'error',
      render: (error: string) => <Text type='danger'>{error}</Text>
    }
  ];

  const formatColumns: ColumnsType<ExcelColumn> = [
    {
      title: 'Название колонки',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ExcelColumn) => (
        <Space>
          <Text strong>{title}</Text>
          {record.required && <Tag color='red'>обязательно</Tag>}
        </Space>
      )
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Пример',
      dataIndex: 'example',
      key: 'example',
      render: (example: string) => <Text code>{example}</Text>
    }
  ];
  const handleUpload = async (file: File): Promise<void> => {
    setCurrentStep(1);

    try {
      const result = await importTyFromExcel(file).unwrap();

      setImportResult(result);
      setCurrentStep(2);

      if (result.success) {
        message.success(`${result.message} Создано ТУ: ${result.created_count}`);
      } else {
        message.warning(`${result.message}. Обнаружены ошибки.`);
      }
    } catch (error) {
      console.error('Ошибка импорта:', error);
      message.error('Произошла ошибка при импорте файла');
      setCurrentStep(0);
    }
  };

  const uploadProps: UploadProps = {
    name: 'excel_file',
    multiple: false,
    accept: '.xlsx,.xls',
    beforeUpload: (file: File) => {
      const validation = validateExcelFile(file);

      if (!validation.isValid) {
        message.error(validation.error);
        return false;
      }

      setUploadedFile({
        uid: file.name,
        name: file.name,
        size: file.size,
        type: file.type,
        originFileObj: file
      } as UploadFile);

      handleUpload(file);
      return false;
    },
    showUploadList: false
  };

  const handleReset = (): void => {
    setCurrentStep(0);
    setUploadedFile(null);
    setImportResult(null);
  };
  const handleDownloadErrorReport = (): void => {
    if (importResult?.errors && importResult.errors.length > 0) {
      downloadErrorReport(importResult.errors, `import_errors_${Date.now()}.txt`);
      message.success('Отчет об ошибках скачан');
    }
  };

  return (
    <div>
      <Title level={2}>
        <FileExcelOutlined style={{ marginRight: '12px', color: '#52c41a' }} />
        Импорт технических условий из Excel
      </Title>

      <Steps
        current={currentStep}
        style={{ marginBottom: '32px' }}
        items={[
          {
            title: 'Выбор файла',
            description: 'Загрузите Excel файл',
            icon: <UploadOutlined />
          },
          {
            title: 'Обработка',
            description: 'Импорт данных',
            icon: isImporting ? undefined : <CheckCircleOutlined />
          },
          {
            title: 'Результат',
            description: 'Просмотр результатов',
            icon: <InfoCircleOutlined />
          }
        ]}
      />
      {currentStep === 0 && (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title='Загрузка файла'>
              <Upload.Dragger {...uploadProps} style={{ padding: '40px 20px' }}>
                <p className='ant-upload-drag-icon'>
                  <FileExcelOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
                </p>
                <p className='ant-upload-text'>
                  <Text strong>Нажмите или перетащите файл в эту область</Text>
                </p>
                <p className='ant-upload-hint'>Поддерживаются файлы формата .xlsx и .xls (до 10MB)</p>
              </Upload.Dragger>

              <Alert
                message='Важно!'
                description='Убедитесь, что ваш Excel файл содержит все необходимые колонки и правильно отформатирован'
                type='info'
                showIcon
                style={{ marginTop: '16px' }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title='Требования к файлу'>
              <List
                size='small'
                dataSource={[
                  'Файл должен быть в формате .xlsx или .xls',
                  'Первая строка должна содержать заголовки колонок',
                  'Максимальный размер файла: 10MB',
                  'Пустые строки будут пропущены',
                  'Статус всех ТУ будет установлен в "Архивный"',
                  'Стадия будет установлена в "Завершено"'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: '8px' }} />
                    <Text>{item}</Text>
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>
      )}
      {currentStep === 1 && (
        <Card title='Обработка файла'>
          <Space direction='vertical' style={{ width: '100%' }} size='large'>
            {uploadedFile && (
              <Alert
                message={
                  <Space>
                    <Text>
                      Обрабатывается файл: <Text strong>{uploadedFile.name}</Text>
                    </Text>
                    <Text type='secondary'>({formatFileSize(uploadedFile.size || 0)})</Text>
                  </Space>
                }
                type='info'
                showIcon
              />
            )}

            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size='large' />
              <div style={{ marginTop: '16px' }}>
                <Text>{isImporting ? 'Импортируем данные...' : 'Подготовка...'}</Text>
              </div>
            </div>
          </Space>
        </Card>
      )}

      {/* Шаг 3: Результаты */}
      {currentStep === 2 && importResult && (
        <Space direction='vertical' style={{ width: '100%' }} size='large'>
          {/* Сводка результатов */}
          <Card title='Результаты импорта'>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#52c41a', margin: 0 }}>
                    {importResult.created_count}
                  </Title>
                  <Text type='secondary'>Создано ТУ</Text>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
                    {importResult.created_tus.length}
                  </Title>
                  <Text type='secondary'>ID записей</Text>
                </Card>
              </Col>
              <Col xs={12} sm={8}>
                <Card size='small' style={{ textAlign: 'center' }}>
                  <Title level={3} style={{ color: importResult.errors.length > 0 ? '#ff4d4f' : '#52c41a', margin: 0 }}>
                    {importResult.errors.length}
                  </Title>
                  <Text type='secondary'>Ошибок</Text>
                </Card>
              </Col>
            </Row>

            <Divider />

            <Space wrap>
              <Tag color='success' icon={<CheckCircleOutlined />}>
                {importResult.success ? 'Импорт успешен' : 'Импорт с ошибками'}
              </Tag>
              {importResult.created_tus.length > 0 && (
                <Tag color='processing'>
                  Созданы ТУ: {importResult.created_tus.slice(0, 3).join(', ')}
                  {importResult.created_tus.length > 3 && '...'}
                </Tag>
              )}
              <Tag color='blue'>Все ТУ добавлены в архив</Tag>
            </Space>
          </Card>

          {importResult.created_tus.length > 0 && (
            <Card
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>Созданные технические условия ({importResult.created_tus.length})</span>
                </Space>
              }
            >
              <div style={{ marginBottom: '16px' }}>
                <Text strong>ID созданных ТУ:</Text>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {importResult.created_tus.map((tuId) => (
                  <Tag key={tuId} color='green' style={{ margin: 0 }}>
                    ТУ #{tuId}
                  </Tag>
                ))}
              </div>

              {importResult.created_tus.length > 20 && (
                <div style={{ marginTop: '12px' }}>
                  <Text type='secondary'>Показаны первые записи. Всего создано: {importResult.created_count} ТУ</Text>
                </div>
              )}
            </Card>
          )}
          {importResult.errors.length > 0 && (
            <Card
              title={
                <Space>
                  <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  <span>Ошибки импорта ({importResult.errors.length})</span>
                </Space>
              }
              extra={
                <Button icon={<DownloadOutlined />} onClick={handleDownloadErrorReport} size='small'>
                  Скачать отчет
                </Button>
              }
            >
              <Alert
                message='Обнаружены ошибки'
                description='Строки с ошибками были пропущены. Исправьте их в исходном файле и повторите импорт.'
                type='warning'
                showIcon
                style={{ marginBottom: '16px' }}
              />

              <Table
                dataSource={importResult.errors}
                columns={errorColumns}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                size='small'
                rowKey={(_, index) => `error-${index}`}
                scroll={{ x: 400 }}
              />
            </Card>
          )}

          <Card>
            <Space>
              <Button type='primary' onClick={handleReset}>
                Импортировать еще один файл
              </Button>
              <Button onClick={() => (window.location.href = '/dashboard/ty/archive')}>Перейти к архиву ТУ</Button>
            </Space>
          </Card>
        </Space>
      )}

      <Card title='Формат Excel файла' style={{ marginTop: '32px' }} type='inner'>
        <Paragraph>
          <Text strong>Ваш Excel файл должен содержать следующие колонки:</Text>
        </Paragraph>

        <Table dataSource={EXCEL_COLUMNS} columns={formatColumns} pagination={false} size='small' rowKey='key' />
      </Card>
    </div>
  );
};
