import { IPaginationMeta } from 'types/common';
import { IApplicationHistory } from 'types/entities';

export interface IApplication {
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
  attachments: string[];
  entity: number;
}

export interface IGetApplicationsParams {
  status?: 'pending' | 'rejected' | 'approved' | 'contracted';
  search?: string;
  customer?: number;
  entity?: number;
  ordering?: string;
  page?: number;
  page_size?: number;
}

export interface IGetApplicationHistoryParams {
  application_id: string;
  page?: number;
  page_size?: number;
}

export type IGetApplicationHistoryResponse = IPaginationMeta & {
  results: IApplicationHistory[];
};
