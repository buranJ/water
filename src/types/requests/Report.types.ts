export interface IReportFilters {
  address?: string;
  customer?: number;
  due_in_days?: number;
  entity?: number;
  formula?: number;
  has_debt?: boolean;
  has_invoice?: boolean;
  id?: number;
  invoice_date_end?: string;
  invoice_date_start?: string;
  is_current?: boolean;
  is_kanal?: boolean;
  is_viewed?: boolean;
  is_water?: boolean;
  overdue?: boolean;
  payment_amount?: string;
  payment_date_end?: string;
  payment_date_start?: string;
  payment_deadline_end?: string;
  payment_deadline_start?: string;
  request_date_end?: string;
  request_date_start?: string;
  stage?: 'draft' | 'review' | 'approved' | 'done';
  status?: 'active' | 'inactive' | 'archived';
  tu_with_loads?: boolean;
  type_ty?: number;
}

export interface IReportParams extends IReportFilters {
  export?: 'excel' | 'json' | 'word';
}

export interface IReportItem {
  Наименование: string;
  Колличество: number;
  Вода: number;
  Стоки: number;
  Начислено: number;
  Сумма: number;
}

export type IReportResponse = IReportItem[];
