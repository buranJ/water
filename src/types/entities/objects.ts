export interface ObjectItem {
  id: number;
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  created_at: string;
  updated_at: string;
  customer: number;
}

export interface ObjectFilters {
  search: string;
  status: string | null;
  date: string | null;
}

export type ObjectListResponse = ObjectItem[];

export interface ObjectBody {
  title: string;
  address_street: string;
  address_number: string;
  kadastr_number: string;
  status: string;
  customer: number;
}

export interface ObjectHistoryItem {
  history_user: string;
  history_date: string;
  history_type: string;
}

export type ObjectHistoryResponse = ObjectHistoryItem[];
