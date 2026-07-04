import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Col, DatePicker, Form, Input, message, Row, Space, theme, Typography } from 'antd';
import { ClearOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components';

import { useExportProtocolsExcelMutation } from 'api/Accounting.api';
import { getApiErrorMessage } from 'utils/apiError';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface FilterFormValues {
  councilDateRange?: [Dayjs | null, Dayjs | null] | null;
  techCouncilDateRange?: [Dayjs | null, Dayjs | null] | null;
  tuNumbers?: string;
  excludeTuNumbers?: string;
}

interface ExportParams {
  council_date_start?: string;
  council_date_end?: string;
  tech_council_date_start?: string;
  tech_council_date_end?: string;
  tu_numbers?: string;
  exclude_tu_numbers?: string;
}

export const ProtocolsExport: FC = () => {
  const { t } = useTranslation();
  const { token } = theme.useToken();
  const [form] = Form.useForm<FilterFormValues>();
  const [exportProtocols, { isLoading }] = useExportProtocolsExcelMutation();

  const handleExport = async (values: FilterFormValues) => {
    try {
      // Подготавливаем параметры
      const params: ExportParams = {};

      // Проверяем и форматируем даты для даты совета
      if (values.councilDateRange?.[0] && values.councilDateRange?.[1]) {
        const startDate = values.councilDateRange[0];
        const endDate = values.councilDateRange[1];

        if (startDate.isAfter(dayjs())) {
          message.error('Дата начала не может быть в будущем');
          return;
        }

        params.council_date_start = startDate.format('YYYY-MM-DD');
        params.council_date_end = endDate.format('YYYY-MM-DD');
      }

      // Проверяем и форматируем даты для даты тех совета
      if (values.techCouncilDateRange?.[0] && values.techCouncilDateRange?.[1]) {
        const startDate = values.techCouncilDateRange[0];
        const endDate = values.techCouncilDateRange[1];

        if (startDate.isAfter(dayjs())) {
          message.error('Дата начала не может быть в будущем');
          return;
        }

        params.tech_council_date_start = startDate.format('YYYY-MM-DD');
        params.tech_council_date_end = endDate.format('YYYY-MM-DD');
      }

      // Обрабатываем номера ТУ для включения
      if (values.tuNumbers?.trim()) {
        params.tu_numbers = values.tuNumbers
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(',');
      }

      // Обрабатываем номера ТУ для исключения
      if (values.excludeTuNumbers?.trim()) {
        params.exclude_tu_numbers = values.excludeTuNumbers
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .join(',');
      }

      console.log('Export params:', params);

      // Выполняем запрос через mutation
      const { blob, filename } = await exportProtocols(params).unwrap();

      // Создаём ссылку для скачивания
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Имя файла берём с бэка (Content-Disposition); шаблон — только запасной вариант
      const timestamp = dayjs().format('YYYY-MM-DD_HH-mm');
      link.download = filename || `protocols_export_${timestamp}.xlsx`;

      // Добавляем в DOM, кликаем и удаляем
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Освобождаем память
      window.URL.revokeObjectURL(url);

      message.success(t('protocolsExport.messages.exportSuccess', 'Экспорт протоколов выполнен успешно'));
    } catch (error) {
      console.error('Export error:', error);
      // Показываем причину ошибки с бэка ({ error: "..." }), иначе общий текст
      message.error(getApiErrorMessage(error, t('protocolsExport.messages.exportError', 'Ошибка при экспорте протоколов')));
    }
  };

  const handleReset = () => {
    form.resetFields();
  };

  // Ограничиваем выбор дат до сегодня
  const disabledDate = (current: Dayjs): boolean => {
    return current.isAfter(dayjs().endOf('day'));
  };

  return (
    <DashboardLayout title={t('protocolsExport.title', 'Экспорт протоколов')}>
      <Card>
        <Title level={4}>{t('protocolsExport.filterTitle', 'Фильтры для экспорта')}</Title>
        <Form
          form={form}
          layout='vertical'
          onFinish={handleExport}
          autoComplete='off'
          initialValues={{
            councilDateRange: [dayjs().subtract(1, 'month'), dayjs()]
          }}
        >
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item label={t('protocolsExport.councilDateRange', 'Период даты Исходящих ТУ')} name='councilDateRange'>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={[t('protocolsExport.dateStart', 'Дата начала'), t('protocolsExport.dateEnd', 'Дата окончания')]}
                  format='DD.MM.YYYY'
                  disabledDate={disabledDate}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label={t('protocolsExport.techCouncilDateRange', 'Период даты тех совета')} name='techCouncilDateRange'>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={[t('protocolsExport.dateStart', 'Дата начала'), t('protocolsExport.dateEnd', 'Дата окончания')]}
                  format='DD.MM.YYYY'
                  disabledDate={disabledDate}
                  allowClear
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('protocolsExport.tuNumbers', 'Номера ТУ для включения')}
                name='tuNumbers'
                extra={t('protocolsExport.tuNumbersHint', 'Введите номера через запятую')}
              >
                <Input.TextArea rows={3} placeholder={t('protocolsExport.tuNumbersPlaceholder', 'Например: 04-001, 04-002, 04-003')} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label={t('protocolsExport.excludeTuNumbers', 'Номера ТУ для исключения')}
                name='excludeTuNumbers'
                extra={t('protocolsExport.excludeTuNumbersHint', 'Введите номера через запятую')}
              >
                <Input.TextArea rows={3} placeholder={t('protocolsExport.excludeTuNumbersPlaceholder', 'Например: 04-100, 04-101')} />
              </Form.Item>
            </Col>
          </Row>

          <Row justify='end' style={{ marginTop: 24 }}>
            <Space>
              <Button onClick={handleReset} icon={<ClearOutlined />} disabled={isLoading}>
                {t('common.reset', 'Сбросить')}
              </Button>
              <Button type='primary' htmlType='submit' loading={isLoading} icon={<DownloadOutlined />}>
                {t('protocolsExport.exportButton', 'Экспортировать в Excel')}
              </Button>
            </Space>
          </Row>
        </Form>

        <div style={{ marginTop: 24, padding: 16, backgroundColor: token.colorFillAlter, borderRadius: 8 }}>
          <Title level={5}>{t('protocolsExport.helpTitle', 'Справка')}</Title>
          <Space direction='vertical' size='small'>
            <Text>{t('protocolsExport.helpText1', '• Все фильтры являются опциональными')}</Text>
            <Text>{t('protocolsExport.helpText2', '• Если не указаны фильтры, будут выгружены все протоколы')}</Text>
            <Text>{t('protocolsExport.helpText3', '• Номера ТУ вводятся через запятую')}</Text>
            <Text>{t('protocolsExport.helpText4', '• Файл будет скачан в формате Excel')}</Text>
            <Text type='secondary'>• Даты не могут быть в будущем</Text>
          </Space>
        </div>
      </Card>
    </DashboardLayout>
  );
};
