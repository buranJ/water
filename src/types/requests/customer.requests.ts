import { IPaginationMeta } from 'types/common';
import { ICustomer, ICustomerParams } from 'types/entities';

export type IGetCustomerResponse = IPaginationMeta & {
  results: ICustomer[];
};

export type IGetCustomerParams = ICustomerParams;
