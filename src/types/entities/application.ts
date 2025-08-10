import type { IApplication } from 'types/requests';

export interface IApplicationResponse {
  id: number;
  status: 'pending' | 'rejected' | 'approved' | 'contracted';
  INN: string;
  customer: number;
  object: string;
  address: string;
  contact: string;
  quantity: string;
  pressure: string;
  waterRequired: string;
  firefightingExpenses: string;
  x: number;
  y: number;
  application_files: string[];
  entity: number;
  created_at: string;
  updated_at: string;
  ty_id?: string;
}

export interface IApplicationsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IApplicationResponse[];
}

export interface ICreateApplicationResponse extends IApplication {
  id: number;
  created_at: string;
  updated_at: string;
}
