import { IPaginationMeta } from 'types/common';
import { IProtocol } from 'types/entities';

export type IGetProtocolResponse = IPaginationMeta & { results: IProtocol[] };
export type IGetProtocolParams = {
  page?: number;
  page_size?: number;
  ordering?: string;
};
