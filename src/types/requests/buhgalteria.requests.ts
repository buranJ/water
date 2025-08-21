export type IContractCustomerType = 'ur' | 'fiz';

export type IDownloadContractDocxParams = {
  ty_id: string;
  customer_type: IContractCustomerType;
};

export type IDownloadContractDocxResponse = {
  blob: Blob;
  filename: string | null;
};
