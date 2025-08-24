// src/types/entities/accounting.ts
export interface IAccountingProtocol {
  id: number;
  load: string;
  water_price: string;
  kanal_price: string;
  coefficient: number;
  total_water_sum: string;
  total_kanal_sum: string;
  created_at: string;
  technical_condition: number;
  // Новые поля
  nds: string | null;
  nds_paper: string;
  nsp: string;
  nsp_paper: string;
  paper_kanal_sum: string;
  paper_water_sum: string;
}

export interface IGetAccountingProtocolParams {
  technicalConditionId: string;
}

export type IGetAccountingProtocolResponse = IAccountingProtocol;

// Новые типы для списка протоколов
export interface IAccountingProtocolsListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: IAccountingProtocol[];
}

export interface IGetAccountingProtocolsListParams {
  page?: number;
  page_size?: number;
  ordering?: string;
  search?: string;
}

export interface IAccountingInvoice {
  id: number;
  invoice_type: 'main' | 'paper_tu';
  pdf_file: string | null;
  invoice_number: string;
  invoice_date: string;
  total_water_sum: string;
  total_kanal_sum: string;
  total_sum: string;
  is_paid: boolean;
  created_at: string;
  protocol: number;
}

export interface IGetInvoicesByProtocolParams {
  protocolId: string;
}

export type IGetInvoicesByProtocolResponse = IAccountingInvoice[];

export interface IGenerateInvoiceParams {
  protocolId: string;
}

export type IGenerateInvoiceResponse = IAccountingInvoice;

export interface IUpdateProtocolParams {
  protocolId: string;
  body: {
    load: string;
    water_price: string;
    kanal_price: string;
    coefficient: number;
    total_water_sum: string;
    total_kanal_sum: string;
    technical_condition: number;
    // Новые поля для обновления
    nds?: string | null;
    nds_paper?: string;
    nsp?: string;
    nsp_paper?: string;
    paper_kanal_sum?: string;
    paper_water_sum?: string;
  };
}

export type IUpdateProtocolResponse = IAccountingProtocol;

export interface IDownloadProtocolParams {
  technicalConditionId: string;
}

export interface IPayment {
  id: number;
  payment_number: string;
  payment_date: string;
  amount: string;
  source: string;
  status: 'pending' | 'completed' | 'failed';
  receipt_file: string | null;
  invoice: number;
  created_at: string;
}

export interface IGetPaymentsByInvoiceParams {
  invoiceId: string;
}

export type IGetPaymentsByInvoiceResponse = IPayment[];

export interface ICreatePaymentParams {
  payment_number: string;
  payment_date: string;
  amount: string;
  source: string;
  status: 'pending' | 'completed' | 'failed';
  receipt_file?: string;
  invoice: number;
}

export type ICreatePaymentResponse = IPayment;
