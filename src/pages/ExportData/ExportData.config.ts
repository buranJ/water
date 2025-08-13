import type { ExportEntity } from 'types/entities/reports.entities';

export type FieldType = 'number' | 'string' | 'date' | 'boolean' | 'select';

export interface FieldConfig {
  name:
    | 'id'
    | 'request_number'
    | 'status'
    | 'stage'
    | 'type_ty'
    | 'customer_id'
    | 'entity_id'
    | 'formula_id'
    | 'request_date_start'
    | 'request_date_end'
    | 'is_water'
    | 'is_kanal'
    | 'created_start'
    | 'created_end'
    | 'technical_condition_id'
    | 'inn'
    | 'full_name'
    | 'invoice_id'
    | 'payment_number'
    | 'payment_date_start'
    | 'payment_date_end'
    | 'invoice_number'
    | 'is_paid'
    | 'protocol_id'
    | 'invoice_type'
    | 'invoice_date_start'
    | 'invoice_date_end';
  label: string;
  type: FieldType;
  options?: { value: string; label: string }[];
}

export type FormValues = {
  export?: 'pdf' | 'xlsx';
  entity?: ExportEntity;
  filters?: Record<string, unknown>;
  ids?: (string | number)[];
  include?: {
    customer?: boolean;
    entity?: boolean;
    protocol?: boolean;
    invoices?: boolean;
    payments?: boolean;
  };
  include_pending?: boolean;
  fields?: string[];
  filename?: string;
};

export const EXPORT_FORMAT_OPTIONS: { value: 'pdf' | 'xlsx'; label: string }[] = [
  { value: 'pdf', label: 'PDF' },
  { value: 'xlsx', label: 'Excel (XLSX)' }
];

export const EXPORT_ENTITY_OPTIONS: { value: ExportEntity; label: string }[] = [
  { value: 'technical_conditions', label: 'ТУ' },
  { value: 'entities', label: 'Объекты' },
  { value: 'protocols', label: 'Протоколы' },
  { value: 'customers', label: 'Заказчики' },
  { value: 'payments', label: 'Платежи' },
  { value: 'invoices', label: 'Счета' },
  { value: 'applications', label: 'Заявки' }
];

const STATUS6B3_OPTIONS = [
  { value: 'active', label: 'Активен' },
  { value: 'inactive', label: 'Неактивен' },
  { value: 'archived', label: 'Архив' }
];

const STAGE_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'approved', label: 'Approved' },
  { value: 'done', label: 'Completed' }
];

const CUSTOMER_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'rejected', label: 'Rejected' }
];

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'В ожидании' },
  { value: 'received', label: 'Поступили' }
];

const INVOICE_TYPE_OPTIONS = [
  { value: 'main', label: 'Основной' },
  { value: 'paper_tu', label: 'Оплата за бумагу ТУ' }
];

const APPLICATION_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'approved', label: 'Approved' },
  { value: 'contracted', label: 'Contracted TU' }
];

// Полный перечень фильтров по сущностям (из OpenAPI)
export const FILTER_CONFIG: Record<ExportEntity, FieldConfig[]> = {
  technical_conditions: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'request_number', label: 'Номер запроса', type: 'string' },
    { name: 'status', label: 'Статус', type: 'select', options: STATUS6B3_OPTIONS },
    { name: 'stage', label: 'Стадия', type: 'select', options: STAGE_OPTIONS },
    { name: 'type_ty', label: 'Тип ТУ (ID)', type: 'number' },
    { name: 'customer_id', label: 'Заказчик (ID)', type: 'number' },
    { name: 'entity_id', label: 'Объект (ID)', type: 'number' },
    { name: 'formula_id', label: 'Формула (ID)', type: 'number' },
    { name: 'request_date_start', label: 'Дата запроса с', type: 'date' },
    { name: 'request_date_end', label: 'Дата запроса по', type: 'date' },
    { name: 'is_water', label: 'Подключение к воде', type: 'boolean' },
    { name: 'is_kanal', label: 'Подключение к канализации', type: 'boolean' }
  ],
  entities: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'status', label: 'Статус', type: 'select', options: STATUS6B3_OPTIONS },
    { name: 'customer_id', label: 'Заказчик (ID)', type: 'number' },
    { name: 'created_start', label: 'Создано с', type: 'date' },
    { name: 'created_end', label: 'Создано по', type: 'date' }
  ],
  protocols: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'technical_condition_id', label: 'ТУ (ID)', type: 'number' },
    { name: 'created_start', label: 'Создано с', type: 'date' },
    { name: 'created_end', label: 'Создано по', type: 'date' }
  ],
  customers: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'inn', label: 'ИНН', type: 'string' },
    { name: 'full_name', label: 'ФИО/Название', type: 'string' },
    { name: 'status', label: 'Статус', type: 'select', options: CUSTOMER_STATUS_OPTIONS },
    { name: 'created_start', label: 'Создано с', type: 'date' },
    { name: 'created_end', label: 'Создано по', type: 'date' }
  ],
  payments: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'status', label: 'Статус', type: 'select', options: PAYMENT_STATUS_OPTIONS },
    { name: 'invoice_id', label: 'Счёт (ID)', type: 'number' },
    { name: 'payment_number', label: 'Номер платежа', type: 'string' },
    { name: 'payment_date_start', label: 'Дата платежа с', type: 'date' },
    { name: 'payment_date_end', label: 'Дата платежа по', type: 'date' }
  ],
  invoices: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'invoice_number', label: 'Номер счёта', type: 'string' },
    { name: 'is_paid', label: 'Оплачен', type: 'boolean' },
    { name: 'protocol_id', label: 'Протокол (ID)', type: 'number' },
    { name: 'invoice_type', label: 'Тип счёта', type: 'select', options: INVOICE_TYPE_OPTIONS },
    { name: 'invoice_date_start', label: 'Дата счёта с', type: 'date' },
    { name: 'invoice_date_end', label: 'Дата счёта по', type: 'date' }
  ],
  applications: [
    { name: 'id', label: 'ID', type: 'number' },
    { name: 'status', label: 'Статус', type: 'select', options: APPLICATION_STATUS_OPTIONS },
    { name: 'customer_id', label: 'Заказчик (ID)', type: 'number' },
    { name: 'entity_id', label: 'Объект (ID)', type: 'number' },
    { name: 'created_start', label: 'Создано с', type: 'date' },
    { name: 'created_end', label: 'Создано по', type: 'date' }
  ]
};

function hasFormat(v: unknown): v is { format: (fmt: string) => string } {
  return typeof v === 'object' && v !== null && 'format' in v && typeof (v as { format?: unknown }).format === 'function';
}

export const prepareFilters = (filters?: Record<string, unknown>) => {
  if (!filters) return undefined;
  const prepared = Object.entries(filters).reduce<Record<string, unknown>>((acc, [k, v]) => {
    if (v === undefined || v === null || v === '') return acc;
    acc[k] = hasFormat(v) ? v.format('YYYY-MM-DD') : v;
    return acc;
  }, {});
  return Object.keys(prepared).length ? prepared : undefined;
};

export const prepareIds = (ids?: (string | number)[]) => {
  if (!ids || !ids.length) return undefined;
  const out = ids
    .map((v) => (typeof v === 'string' ? v.trim() : v))
    .filter(Boolean)
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  return out.length ? out : undefined;
};

export const isIncludePendingVisible = (entity?: ExportEntity) => entity === 'payments' || entity === 'invoices';

export const handleDownload = (blob: Blob, preferredName: string | null, entity: string, fmt: 'pdf' | 'xlsx', filename?: string) => {
  const ext = fmt === 'pdf' ? 'pdf' : 'xlsx';
  const defaultBase = filename || `${entity}_${new Date().toISOString().slice(0, 10)}`;
  const finalName = preferredName || `${defaultBase}.${ext}`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = finalName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
