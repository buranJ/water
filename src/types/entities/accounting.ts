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
}

export interface IGetAccountingProtocolParams {
  technicalConditionId: string;
}

export type IGetAccountingProtocolResponse = IAccountingProtocol;

export interface IAccountingInvoice {
  id: number;
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

export interface IGetInvoiceByProtocolParams {
  protocolId: string;
}

export type IGetInvoiceByProtocolResponse = IAccountingInvoice;

export interface IGenerateInvoiceParams {
  protocolId: string;
}

export type IGenerateInvoiceResponse = IAccountingInvoice;
