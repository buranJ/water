import { FC, useState } from 'react';
import { Button, Card, Col, Collapse, DatePicker, Input, message, Row, Select, Space, Table, Typography } from 'antd';
import { DownloadOutlined, FilterOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardLayout } from 'components/DashboardLayout';
import type { IReportFilters, IReportItem } from 'types/requests';

import { useDownloadReportMutation, useGetReportQuery } from 'api/Ty.api';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Panel } = Collapse;

interface QuarterOption {
  label: string;
  value: string;
  quarter: number;
  year: number;
}

const ReportPage: FC = () => {
  const [filters, setFilters] = useState<IReportFilters>({});
  const [exportFormat, setExportFormat] = useState<'excel' | 'word'>('excel');

  const [selectedQuarter, setSelectedQuarter] = useState<QuarterOption | null>(null);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const { data: reportData, isLoading, isFetching, refetch } = useGetReportQuery(filters);
  const [downloadReport, { isLoading: isDownloading }] = useDownloadReportMutation();

  const generateQuarterOptions = (): QuarterOption[] => {
    const currentYear = dayjs().year();
    const options: QuarterOption[] = [];

    for (let year = currentYear; year >= currentYear - 2; year--) {
      for (let quarter = 4; quarter >= 1; quarter--) {
        options.push({
          label: `${year} - Q${quarter}`,
          value: `${year}-Q${quarter}`,
          quarter,
          year
        });
      }
    }

    return options;
  };

  const quarterOptions = generateQuarterOptions();

  const getQuarterDates = (quarter: number, year: number): [string, string] => {
    const startMonth = (quarter - 1) * 3 + 1;
    const endMonth = quarter * 3;

    const startDate = dayjs()
      .year(year)
      .month(startMonth - 1)
      .startOf('month')
      .format('YYYY-MM-DD');
    const endDate = dayjs()
      .year(year)
      .month(endMonth - 1)
      .endOf('month')
      .format('YYYY-MM-DD');

    return [startDate, endDate];
  };

  // Обработчик выбора квартала
  const handleQuarterChange = (value: string | null) => {
    if (!value) {
      setSelectedQuarter(null);
      setDateRange(null);
      setFilters((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { request_date_start, request_date_end, ...rest } = prev;
        return rest;
      });
      return;
    }

    const selected = quarterOptions.find((opt) => opt.value === value);
    if (!selected) return;

    setSelectedQuarter(selected);
    setDateRange(null);

    const [startDate, endDate] = getQuarterDates(selected.quarter, selected.year);

    setFilters((prev) => ({
      ...prev,
      request_date_start: startDate,
      request_date_end: endDate
    }));
  };

  // Обработчик выбора даты через календарь
  const handleDateRangeChange = (dates: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(dates);
    setSelectedQuarter(null);

    if (!dates || !dates[0] || !dates[1]) {
      setFilters((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { request_date_start, request_date_end, ...rest } = prev;
        return rest;
      });
      return;
    }

    setFilters((prev) => ({
      ...prev,
      request_date_start: dates[0]!.format('YYYY-MM-DD'),
      request_date_end: dates[1]!.format('YYYY-MM-DD')
    }));
  };

  const handleResetFilters = () => {
    setFilters({});
    setSelectedQuarter(null);
    setDateRange(null);
  };

  const handleExport = async () => {
    try {
      const { blob, filename } = await downloadReport({ ...filters, export: exportFormat }).unwrap();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `report.${exportFormat === 'excel' ? 'xlsx' : 'docx'}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      message.success('Отчёт успешно экспортирован');
    } catch (error) {
      console.error('Failed to export report', error);
      message.error('Не удалось экспортировать отчёт');
    }
  };

  const columns = [
    {
      title: 'Наименование',
      dataIndex: 'Наименование',
      key: 'Наименование',
      width: 300
    },
    {
      title: 'Количество',
      dataIndex: 'Колличество',
      key: 'Колличество',
      align: 'right' as const,
      width: 120
    },
    {
      title: 'Вода (м³)',
      dataIndex: 'Вода',
      key: 'Вода',
      align: 'right' as const,
      width: 120,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Стоки (м³)',
      dataIndex: 'Стоки',
      key: 'Стоки',
      align: 'right' as const,
      width: 120,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Начислено',
      dataIndex: 'Начислено',
      key: 'Начислено',
      align: 'right' as const,
      width: 120,
      render: (value: number) => value.toFixed(2)
    },
    {
      title: 'Сумма (сом)',
      dataIndex: 'Сумма',
      key: 'Сумма',
      align: 'right' as const,
      width: 150,
      render: (value: number) => value.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
  ];

  return (
    <DashboardLayout title='Отчёт'>
      <Space direction='vertical' size='large' style={{ width: '100%' }}>
        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            <FilterOutlined /> Параметры отчёта
          </Title>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Квартал:</strong>
              </div>
              <Select
                placeholder='Выберите квартал'
                value={selectedQuarter?.value}
                onChange={handleQuarterChange}
                style={{ width: '100%' }}
                allowClear
                options={quarterOptions}
              />
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Период (даты):</strong>
              </div>
              <RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                format='DD-MM-YYYY'
                style={{ width: '100%' }}
                placeholder={['Начало', 'Конец']}
              />
            </Col>

            <Col xs={24} md={8}>
              <div style={{ marginBottom: 8 }}>
                <strong>Формат экспорта:</strong>
              </div>
              <Select
                value={exportFormat}
                onChange={setExportFormat}
                style={{ width: '100%' }}
                options={[
                  { label: 'Excel (.xlsx)', value: 'excel' },
                  { label: 'Word (.docx)', value: 'word' }
                ]}
              />
            </Col>
          </Row>

          <Collapse ghost style={{ marginTop: 24 }}>
            <Panel header='Дополнительные фильтры' key='1'>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Адрес:</div>
                  <Input
                    placeholder='Введите адрес'
                    value={filters.address || ''}
                    onChange={(e) => setFilters((prev) => ({ ...prev, address: e.target.value || undefined }))}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Статус:</div>
                  <Select
                    placeholder='Выберите статус'
                    value={filters.status}
                    onChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'Активный', value: 'active' },
                      { label: 'Неактивный', value: 'inactive' },
                      { label: 'Архивный', value: 'archived' }
                    ]}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Этап:</div>
                  <Select
                    placeholder='Выберите этап'
                    value={filters.stage}
                    onChange={(value) => setFilters((prev) => ({ ...prev, stage: value }))}
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'Черновик', value: 'draft' },
                      { label: 'На рассмотрении', value: 'review' },
                      { label: 'Одобрено', value: 'approved' },
                      { label: 'Завершено', value: 'done' }
                    ]}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Водоснабжение:</div>
                  <Select
                    placeholder='Водоснабжение'
                    value={filters.is_water}
                    onChange={(value) => setFilters((prev) => ({ ...prev, is_water: value }))}
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'Да', value: true },
                      { label: 'Нет', value: false }
                    ]}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Канализация:</div>
                  <Select
                    placeholder='Канализация'
                    value={filters.is_kanal}
                    onChange={(value) => setFilters((prev) => ({ ...prev, is_kanal: value }))}
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'Да', value: true },
                      { label: 'Нет', value: false }
                    ]}
                  />
                </Col>

                <Col xs={24} md={8}>
                  <div style={{ marginBottom: 8 }}>Наличие долга:</div>
                  <Select
                    placeholder='Наличие долга'
                    value={filters.has_debt}
                    onChange={(value) => setFilters((prev) => ({ ...prev, has_debt: value }))}
                    style={{ width: '100%' }}
                    allowClear
                    options={[
                      { label: 'Да', value: true },
                      { label: 'Нет', value: false }
                    ]}
                  />
                </Col>
              </Row>
            </Panel>
          </Collapse>

          <Row gutter={8} style={{ marginTop: 24 }}>
            <Col>
              <Button type='primary' loading={isFetching} onClick={() => refetch()}>
                Применить фильтры
              </Button>
            </Col>
            <Col>
              <Button onClick={handleResetFilters}>Сбросить</Button>
            </Col>
            <Col>
              <Button type='primary' icon={<DownloadOutlined />} loading={isDownloading} onClick={handleExport}>
                Экспортировать
              </Button>
            </Col>
          </Row>
        </Card>

        <Card>
          <Title level={4} style={{ marginBottom: 16 }}>
            Результаты
          </Title>
          <Table<IReportItem>
            columns={columns}
            dataSource={reportData || []}
            loading={isLoading || isFetching}
            rowKey={(record) => record.Наименование}
            pagination={false}
            bordered
            size='middle'
            summary={(pageData) => {
              let totalCount = 0;
              let totalWater = 0;
              let totalSewage = 0;
              let totalCharged = 0;
              let totalSum = 0;

              pageData.forEach((record) => {
                totalCount += record.Колличество;
                totalWater += record.Вода;
                totalSewage += record.Стоки;
                totalCharged += record.Начислено;
                totalSum += record.Сумма;
              });

              return (
                <Table.Summary.Row style={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0}>ИТОГО</Table.Summary.Cell>
                  <Table.Summary.Cell index={1} align='right'>
                    {totalCount}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={2} align='right'>
                    {totalWater.toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align='right'>
                    {totalSewage.toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align='right'>
                    {totalCharged.toFixed(2)}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align='right'>
                    {totalSum.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              );
            }}
          />
        </Card>
      </Space>
    </DashboardLayout>
  );
};

export default ReportPage;
